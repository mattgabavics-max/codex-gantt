import { createContext, useContext, useMemo, useReducer, useRef } from "react";
import type { Project, Task } from "@codex/shared";

type ProjectState = {
  project: Project | null;
  tasks: Task[];
  isSaving: boolean;
  lastSavedAt?: string;
  undoStack: Task[][];
  redoStack: Task[][];
};

type ProjectAction =
  | { type: "SET_PROJECT"; payload: Project | null }
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "APPLY_TASKS"; payload: Task[] }
  | { type: "UPDATE_TASK"; payload: { id: string; updates: Partial<Task> } }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "REMOVE_TASK"; payload: string }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_LAST_SAVED"; payload?: string }
  | { type: "UNDO" }
  | { type: "REDO" };

type ProjectContextValue = {
  state: ProjectState;
  setProject: (project: Project | null) => void;
  setTasks: (tasks: Task[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  undo: () => void;
  redo: () => void;
};

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

const initialState: ProjectState = {
  project: null,
  tasks: [],
  isSaving: false,
  undoStack: [],
  redoStack: []
};

function reducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case "SET_PROJECT":
      return { ...state, project: action.payload };
    case "SET_TASKS":
      return {
        ...state,
        tasks: action.payload,
        undoStack: [],
        redoStack: []
      };
    case "APPLY_TASKS":
      return {
        ...state,
        tasks: action.payload,
        undoStack: [state.tasks, ...state.undoStack].slice(0, 20),
        redoStack: []
      };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? { ...task, ...action.payload.updates } : task
        )
      };
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] };
    case "REMOVE_TASK":
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.payload) };
    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "SET_LAST_SAVED":
      return { ...state, lastSavedAt: action.payload };
    case "UNDO": {
      if (state.undoStack.length === 0) return state;
      const previous = state.undoStack[0];
      return {
        ...state,
        tasks: previous,
        undoStack: state.undoStack.slice(1),
        redoStack: [state.tasks, ...state.redoStack]
      };
    }
    case "REDO": {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[0];
      return {
        ...state,
        tasks: next,
        redoStack: state.redoStack.slice(1),
        undoStack: [state.tasks, ...state.undoStack]
      };
    }
    default:
      return state;
  }
}

type ProjectProviderProps = {
  children: React.ReactNode;
  onAutosave?: (projectId: string, tasks: Task[]) => Promise<void>;
  autosaveDelayMs?: number;
};

export function ProjectProvider({
  children,
  onAutosave,
  autosaveDelayMs = 800
}: ProjectProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timerRef = useRef<number | null>(null);

  function scheduleAutosave(nextTasks: Task[]) {
    if (!state.project || !onAutosave) return;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    dispatch({ type: "SET_SAVING", payload: true });
    timerRef.current = window.setTimeout(async () => {
      await onAutosave(state.project!.id, nextTasks);
      dispatch({ type: "SET_SAVING", payload: false });
      dispatch({ type: "SET_LAST_SAVED", payload: new Date().toISOString() });
    }, autosaveDelayMs);
  }

  const value = useMemo<ProjectContextValue>(
    () => ({
      state,
      setProject: (project) => dispatch({ type: "SET_PROJECT", payload: project }),
      setTasks: (tasks) => {
        dispatch({ type: "SET_TASKS", payload: tasks });
      },
      updateTask: (id, updates) => {
        const nextTasks = state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        );
        dispatch({
          type: "APPLY_TASKS",
          payload: nextTasks
        });
        scheduleAutosave(nextTasks);
      },
      addTask: (task) => {
        const nextTasks = [...state.tasks, task];
        dispatch({
          type: "APPLY_TASKS",
          payload: nextTasks
        });
        scheduleAutosave(nextTasks);
      },
      removeTask: (taskId) => {
        const nextTasks = state.tasks.filter((task) => task.id !== taskId);
        dispatch({
          type: "APPLY_TASKS",
          payload: nextTasks
        });
        scheduleAutosave(nextTasks);
      },
      undo: () => {
        if (state.undoStack.length === 0) return;
        const nextTasks = state.undoStack[0];
        dispatch({ type: "UNDO" });
        scheduleAutosave(nextTasks);
      },
      redo: () => {
        if (state.redoStack.length === 0) return;
        const nextTasks = state.redoStack[0];
        dispatch({ type: "REDO" });
        scheduleAutosave(nextTasks);
      }
    }),
    [state, onAutosave, autosaveDelayMs]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjectState() {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProjectState must be used within ProjectProvider");
  }
  return ctx;
}

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { Project, Task } from "@codex/shared";
import { useAutoSave } from "../hooks/useAutoSave";

type ProjectState = {
  project: Project | null;
  tasks: Task[];
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
  isSaving: boolean;
  lastSavedAt?: string;
  dirty: boolean;
  saveError?: string;
  conflict?: boolean;
  setProject: (project: Project | null) => void;
  setTasks: (tasks: Task[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  undo: () => void;
  redo: () => void;
  clearError: () => void;
};

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

const initialState: ProjectState = {
  project: null,
  tasks: [],
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
};

export function ProjectProvider({
  children,
  onAutosave
}: ProjectProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { state: autoSaveState, enqueue, clearError: clearSaveError } = useAutoSave({
    debounceMs: 500,
    onSave: async (tasks: Task[]) => {
      if (!state.project || !onAutosave) return;
      await onAutosave(state.project.id, tasks);
    }
  });

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!autoSaveState.dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [autoSaveState.dirty]);

  const value = useMemo<ProjectContextValue>(
    () => ({
      state,
      isSaving: autoSaveState.isSaving,
      lastSavedAt: autoSaveState.lastSavedAt,
      dirty: autoSaveState.dirty,
      saveError: autoSaveState.error,
      conflict: autoSaveState.conflict,
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
        enqueue(nextTasks);
      },
      addTask: (task) => {
        const nextTasks = [...state.tasks, task];
        dispatch({
          type: "APPLY_TASKS",
          payload: nextTasks
        });
        enqueue(nextTasks);
      },
      removeTask: (taskId) => {
        const nextTasks = state.tasks.filter((task) => task.id !== taskId);
        dispatch({
          type: "APPLY_TASKS",
          payload: nextTasks
        });
        enqueue(nextTasks);
      },
      undo: () => {
        if (state.undoStack.length === 0) return;
        const nextTasks = state.undoStack[0];
        dispatch({ type: "UNDO" });
        enqueue(nextTasks);
      },
      redo: () => {
        if (state.redoStack.length === 0) return;
        const nextTasks = state.redoStack[0];
        dispatch({ type: "REDO" });
        enqueue(nextTasks);
      }
      ,
      clearError: clearSaveError
    }),
    [state, onAutosave, autoSaveState, enqueue, clearSaveError]
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

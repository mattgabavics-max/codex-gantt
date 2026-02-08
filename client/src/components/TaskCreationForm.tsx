import { useState } from "react";

export type TaskFormValues = {
  name: string;
  startDate: string;
  endDate: string;
  color: string;
};

export type TaskCreationFormProps = {
  onCreate: (values: TaskFormValues) => void;
  disabled?: boolean;
};

const defaultColor = "#5c7cfa";

export default function TaskCreationForm({
  onCreate,
  disabled = false
}: TaskCreationFormProps) {
  const [values, setValues] = useState<TaskFormValues>({
    name: "",
    startDate: "",
    endDate: "",
    color: defaultColor
  });

  function update<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!values.name || !values.startDate || !values.endDate) return;
    onCreate(values);
    setValues((prev) => ({ ...prev, name: "" }));
  }

  return (
    <form
      className="grid gap-3 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm sm:grid-cols-[2fr_1fr_1fr_0.6fr_auto] sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <div className="space-y-1">
        <label
          htmlFor="task-name"
          className="text-xs uppercase tracking-[0.3em] text-slate-400"
        >
          Task name
        </label>
        <input
          id="task-name"
          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-300 focus:outline-none"
          placeholder="Design sprint planning"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          disabled={disabled}
          aria-label="Task name"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSubmit();
            }
          }}
        />
      </div>
      <div className="space-y-1">
        <label
          htmlFor="task-start-date"
          className="text-xs uppercase tracking-[0.3em] text-slate-400"
        >
          Start date
        </label>
        <input
          id="task-start-date"
          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-300 focus:outline-none"
          type="date"
          value={values.startDate}
          onChange={(event) => update("startDate", event.target.value)}
          disabled={disabled}
          aria-label="Start date"
        />
      </div>
      <div className="space-y-1">
        <label
          htmlFor="task-end-date"
          className="text-xs uppercase tracking-[0.3em] text-slate-400"
        >
          End date
        </label>
        <input
          id="task-end-date"
          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-300 focus:outline-none"
          type="date"
          value={values.endDate}
          onChange={(event) => update("endDate", event.target.value)}
          disabled={disabled}
          aria-label="End date"
        />
      </div>
      <div className="space-y-1">
        <label
          htmlFor="task-color"
          className="text-xs uppercase tracking-[0.3em] text-slate-400"
        >
          Color
        </label>
        <input
          id="task-color"
          className="h-10 w-full rounded-2xl border border-slate-200 px-2 py-1"
          type="color"
          value={values.color}
          onChange={(event) => update("color", event.target.value)}
          disabled={disabled}
          aria-label="Task color"
        />
      </div>
      <button
        className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        type="submit"
        disabled={disabled}
        aria-label="Add task"
      >
        Add Task
      </button>
    </form>
  );
}

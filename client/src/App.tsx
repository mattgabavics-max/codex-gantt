import { useEffect, useState } from "react";
import type { Task } from "@codex/shared";

const apiBase = import.meta.env.VITE_API_URL ?? "";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetch(`${apiBase}/api/tasks`)
      .then((res) => res.json())
      .then((data: Task[]) => setTasks(data))
      .catch(() => setTasks([]));
  }, []);

  return (
    <div className="min-h-screen px-6 py-12 text-ink">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Codex Gantt System
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Plan, track, and ship with confidence.
          </h1>
          <p className="max-w-2xl text-base text-slate-600">
            The frontend is wired to the API. Replace the placeholder data with
            your Prisma-backed tasks when you are ready.
          </p>
        </header>

        <section className="rounded-3xl bg-white/90 p-8 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming tasks</h2>
            <span className="rounded-full bg-mint/20 px-3 py-1 text-xs font-medium text-ink">
              {tasks.length} items
            </span>
          </div>
          <div className="mt-6 space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-haze px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-base font-semibold">{task.name}</p>
                  <p className="text-sm text-slate-500">{task.id}</p>
                </div>
                <p className="text-sm text-slate-600">
                  {task.startDate} → {task.endDate}
                </p>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-sm text-slate-500">
                No tasks yet. Add seed data and rerun the API.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

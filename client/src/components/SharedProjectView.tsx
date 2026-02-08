import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { ShareProjectResponse, Task } from "@codex/shared";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";
import GanttChart from "./GanttChart";
import { useAuth } from "../state/AuthContext";
import { useUpdateTask } from "../state/queries";

export default function SharedProjectView() {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const [timeScale, setTimeScale] = useState<"week" | "month" | "day" | "sprint" | "quarter">(
    "week"
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["share", token],
    queryFn: async () => {
      const res = await api.get<ShareProjectResponse>(`/api/share/${token}`);
      return res.data;
    },
    enabled: Boolean(token)
  });

  const updateTask = useUpdateTask(data?.project.id ?? "");

  const canEdit = data?.accessType === "editable" && Boolean(user);

  const tasks = useMemo<Task[]>(() => data?.tasks ?? [], [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen px-6 py-12 text-slate-600">
        <div className="mx-auto max-w-5xl">Loading shared project...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen px-6 py-12 text-slate-600">
        <div className="mx-auto max-w-5xl rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          Invalid or expired share link.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 text-ink">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-700">
          Viewing shared project in {data.accessType} mode.
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Shared project
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              {data.project.name}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
              value={timeScale}
              onChange={(event) => setTimeScale(event.target.value as typeof timeScale)}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="sprint">Sprint</option>
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
            </select>
            {user && (
              <button
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
                type="button"
              >
                Copy / Fork
              </button>
            )}
          </div>
        </div>

        <GanttChart
          tasks={tasks}
          timeScale={timeScale}
          readOnly={!canEdit}
          onTaskUpdate={(taskId, updates) => {
            if (!canEdit) return;
            updateTask.mutate({ taskId, updates });
          }}
        />
      </div>
    </div>
  );
}

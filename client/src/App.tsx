import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import type { ShareLink, Task } from "@codex/shared";
import SharedProjectView from "./components/SharedProjectView";
import ShareModal from "./components/ShareModal";
import { api, setAuthToken } from "./api/api";

function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("codex_auth_token");
    if (!token) {
      setTasks([]);
      return;
    }
    setAuthToken(token);
    api
      .get<Task[]>("/api/tasks")
      .then((res) => setTasks(res.data))
      .catch(() => setTasks([]));
  }, []);

  const projectId = tasks[0]?.projectId;

  async function handleCreateLink(payload: {
    accessType: "readonly" | "editable";
    expiresIn?: number;
  }) {
    if (!projectId) return;
    setShareBusy(true);
    const res = await api.post<{ link: ShareLink }>(
      `/api/projects/${projectId}/share`,
      payload
    );
    setShareLinks((prev) => [res.data.link, ...prev]);
    setShareBusy(false);
  }

  async function handleRevokeLink(linkId: string) {
    if (!projectId) return;
    await api.delete(`/api/projects/${projectId}/share/${linkId}`);
    setShareLinks((prev) => prev.filter((link) => link.id !== linkId));
  }

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
          <div className="pt-2">
            <button
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
              type="button"
              onClick={() => setShareOpen(true)}
              disabled={!projectId || shareBusy}
            >
              Share Project
            </button>
          </div>
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
      <ShareModal
        isOpen={shareOpen}
        projectId={projectId ?? "unknown"}
        links={shareLinks}
        onClose={() => setShareOpen(false)}
        onCreateLink={handleCreateLink}
        onRevokeLink={handleRevokeLink}
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/share/:token" element={<SharedProjectView />} />
    </Routes>
  );
}

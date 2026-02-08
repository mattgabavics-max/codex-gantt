import { useMemo, useState } from "react";
import type { Project } from "@codex/shared";

export type ProjectListProps = {
  projects: Project[];
  view?: "grid" | "list";
  onCreateProject: () => void;
  onSelectProject: (projectId: string) => void;
  onViewChange?: (view: "grid" | "list") => void;
};

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default function ProjectList({
  projects,
  view = "grid",
  onCreateProject,
  onSelectProject,
  onViewChange
}: ProjectListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return projects;
    return projects.filter((project) =>
      project.name.toLowerCase().includes(normalized)
    );
  }, [projects, query]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-900">Projects</h2>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
            {filtered.length}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
            <span className="mr-2">View</span>
            <button
              className={`px-2 py-1 text-xs font-semibold ${
                view === "grid" ? "text-slate-900" : "text-slate-400"
              }`}
              onClick={() => onViewChange?.("grid")}
              type="button"
            >
              Grid
            </button>
            <button
              className={`px-2 py-1 text-xs font-semibold ${
                view === "list" ? "text-slate-900" : "text-slate-400"
              }`}
              onClick={() => onViewChange?.("list")}
              type="button"
            >
              List
            </button>
          </div>
          <button
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-sm"
            onClick={onCreateProject}
            type="button"
          >
            Create New Project
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <input
            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-300 focus:outline-none"
            placeholder="Search projects..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <p className="text-xs text-slate-500">
          Showing {filtered.length} of {projects.length}
        </p>
      </div>

      <div
        className={
          view === "grid"
            ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            : "space-y-3"
        }
      >
        {filtered.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => onSelectProject(project.id)}
            className={`flex w-full flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
              view === "list" ? "sm:flex-row sm:items-center sm:justify-between" : ""
            }`}
          >
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {project.name}
              </h3>
              <p className="text-xs text-slate-500">
                Last modified {formatDate(project.updatedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-1">
                {project.isPublic ? "Public" : "Private"}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1">
                {project.id.slice(0, 8)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

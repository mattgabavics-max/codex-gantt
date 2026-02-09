import type { Task } from "@codex/shared";

type DiffEntry = {
  type: "added" | "removed" | "modified";
  before?: Task;
  after?: Task;
};

function buildDiff(base: Task[], compare: Task[]) {
  const baseMap = new Map(base.map((task) => [task.id, task]));
  const compareMap = new Map(compare.map((task) => [task.id, task]));
  const diffs: DiffEntry[] = [];

  for (const [id, task] of baseMap.entries()) {
    if (!compareMap.has(id)) {
      diffs.push({ type: "removed", before: task });
      continue;
    }
    const next = compareMap.get(id)!;
    if (
      task.name !== next.name ||
      task.startDate !== next.startDate ||
      task.endDate !== next.endDate ||
      task.color !== next.color ||
      task.position !== next.position
    ) {
      diffs.push({ type: "modified", before: task, after: next });
    }
  }

  for (const [id, task] of compareMap.entries()) {
    if (!baseMap.has(id)) {
      diffs.push({ type: "added", after: task });
    }
  }

  return diffs;
}

export type VersionDiffViewerProps = {
  baseTasks: Task[];
  compareTasks: Task[];
};

/**
 * Side-by-side diff viewer for task changes between versions.
 */
export default function VersionDiffViewer({
  baseTasks,
  compareTasks
}: VersionDiffViewerProps) {
  const diffs = buildDiff(baseTasks, compareTasks);

  return (
    <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm lg:grid-cols-2">
      <div>
        <h3 className="text-sm font-semibold text-slate-600">Before</h3>
        <div className="mt-3 space-y-2">
          {baseTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2 text-xs"
            >
              <span className="font-semibold text-slate-700">{task.name}</span>
              <span className="text-slate-500">
                {task.startDate} → {task.endDate}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-600">After</h3>
        <div className="mt-3 space-y-2">
          {compareTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2 text-xs"
            >
              <span className="font-semibold text-slate-700">{task.name}</span>
              <span className="text-slate-500">
                {task.startDate} → {task.endDate}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        <h3 className="text-sm font-semibold text-slate-600">Changes</h3>
        <div className="mt-3 space-y-2">
          {diffs.length === 0 && (
            <p className="text-xs text-slate-500">No changes detected.</p>
          )}
          {diffs.map((diff, index) => (
            <div
              key={`${diff.type}-${index}`}
              className={`rounded-2xl border px-3 py-2 text-xs ${
                diff.type === "added"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : diff.type === "removed"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              {diff.type === "added" && `Added: ${diff.after?.name}`}
              {diff.type === "removed" && `Removed: ${diff.before?.name}`}
              {diff.type === "modified" &&
                `Modified: ${diff.before?.name} → ${diff.after?.name}`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

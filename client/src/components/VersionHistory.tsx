import { useMemo, useState } from "react";
import type { Task } from "@codex/shared";
import VersionDiffViewer from "./VersionDiffViewer";
import { useVersionStore } from "../state/versionStore";

export type VersionHistoryProps = {
  isOpen: boolean;
  onClose: () => void;
  currentTasks: Task[];
};

/**
 * Side panel for project version history and comparison.
 */
export default function VersionHistory({
  isOpen,
  onClose,
  currentTasks
}: VersionHistoryProps) {
  const {
    versions,
    selectedVersionId,
    selectVersion,
    autoVersionEnabled,
    toggleAutoVersion,
    restoreVersion,
    createManualVersion
  } = useVersionStore();

  const [compareId, setCompareId] = useState<string | undefined>();
  const [showList, setShowList] = useState(true);

  const selectedVersion = useMemo(
    () => versions.find((version) => version.id === selectedVersionId),
    [versions, selectedVersionId]
  );

  const compareVersion = useMemo(
    () => versions.find((version) => version.id === compareId),
    [versions, compareId]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/40">
      <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-white">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Version history
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              Project snapshots
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 lg:hidden"
              onClick={() => setShowList((prev) => !prev)}
              type="button"
              aria-label="Toggle version list"
            >
              {showList ? "Hide list" : "Show list"}
            </button>
            <button
              className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {showList && (
            <aside className="w-full border-b border-slate-200 bg-slate-50/60 p-4 lg:w-80 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                className="rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white"
                onClick={createManualVersion}
              >
                Create version
              </button>
              <label className="flex items-center gap-2 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={autoVersionEnabled}
                  onChange={toggleAutoVersion}
                  className="h-4 w-4 rounded border-slate-300 text-ink"
                  aria-label="Auto-version"
                />
                Auto-version
              </label>
            </div>

            <div className="mt-4 space-y-2 overflow-y-auto">
              {versions.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-xs text-slate-500">
                  No versions yet. Create your first snapshot.
                </div>
              )}
              {versions.map((version) => (
                <button
                  key={version.id}
                  className={`flex w-full flex-col gap-1 rounded-2xl border px-3 py-2 text-left text-xs transition ${
                    version.id === selectedVersionId
                      ? "border-ink bg-white shadow-sm"
                      : "border-slate-200 bg-white/70 hover:border-slate-300"
                  }`}
                  onClick={() => selectVersion(version.id)}
                  type="button"
                  aria-label={`Select version ${version.versionNumber}`}
                >
                  <span className="text-sm font-semibold text-slate-800">
                    Version {version.versionNumber}
                  </span>
                  <span className="text-slate-500">
                    {new Date(version.createdAt).toLocaleString()}
                  </span>
                  <span className="text-slate-400">
                    {version.createdBy.email}
                  </span>
                </button>
              ))}
            </div>
          </aside>
          )}

          <main className="flex-1 overflow-y-auto px-6 py-5">
            {selectedVersion ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Version {selectedVersion.versionNumber}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Created {new Date(selectedVersion.createdAt).toLocaleString()} by{" "}
                      {selectedVersion.createdBy.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
                      onClick={() => restoreVersion(selectedVersion.id)}
                    >
                      Restore version
                    </button>
                    <select
                      className="rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-600"
                      value={compareId ?? ""}
                      onChange={(event) =>
                        setCompareId(event.target.value || undefined)
                      }
                    >
                      <option value="">Compare with...</option>
                      {versions.map((version) => (
                        <option key={version.id} value={version.id}>
                          Version {version.versionNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 className="text-sm font-semibold text-slate-700">
                    Snapshot preview
                  </h4>
                  <div className="mt-3 space-y-2">
                    {selectedVersion.snapshot.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2 text-xs"
                      >
                        <span className="font-semibold text-slate-700">
                          {task.name}
                        </span>
                        <span className="text-slate-500">
                          {task.startDate} → {task.endDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <VersionDiffViewer
                  baseTasks={compareVersion?.snapshot.tasks ?? currentTasks}
                  compareTasks={selectedVersion.snapshot.tasks}
                />
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select a version to view.</p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

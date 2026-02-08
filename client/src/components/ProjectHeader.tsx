import { useEffect, useMemo, useState } from "react";
import type { TimeScale } from "./GanttChart";

export type ProjectHeaderProps = {
  name: string;
  timeScale: TimeScale;
  saving?: boolean;
  lastSavedAt?: string;
  dirty?: boolean;
  onRename: (name: string) => void;
  onTimeScaleChange: (scale: TimeScale) => void;
  onShare: () => void;
  onOpenVersions: () => void;
  onManualSave?: () => void;
};

const scales: Array<{ value: TimeScale; label: string }> = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "sprint", label: "Sprint" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" }
];

export default function ProjectHeader({
  name,
  timeScale,
  saving = false,
  lastSavedAt,
  dirty = false,
  onRename,
  onTimeScaleChange,
  onShare,
  onOpenVersions,
  onManualSave
}: ProjectHeaderProps) {
  const [draft, setDraft] = useState(name);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) {
      setDraft(name);
    }
  }, [name, editing]);

  const statusLabel = useMemo(() => {
    if (saving) return "Saving...";
    if (dirty) return "Unsaved changes";
    if (!lastSavedAt) return "All changes saved";
    return `Saved ${new Date(lastSavedAt).toLocaleTimeString()}`;
  }, [saving, lastSavedAt, dirty]);

  function handleBlur() {
    setEditing(false);
    if (draft.trim() && draft.trim() !== name) {
      onRename(draft.trim());
    }
  }

  return (
    <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 px-6 py-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1">
          <input
            className={`w-full border-b border-transparent text-2xl font-semibold text-slate-900 focus:border-slate-200 focus:outline-none ${
              editing ? "cursor-text" : "cursor-pointer"
            }`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onFocus={() => setEditing(true)}
            onBlur={handleBlur}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                (event.target as HTMLInputElement).blur();
              }
            }}
            aria-label="Project name"
          />
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-400">
            Project workspace
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            type="button"
            onClick={onOpenVersions}
            aria-label="Open version history"
          >
            Version History
          </button>
          <button
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            type="button"
            onClick={onShare}
            aria-label="Open share dialog"
          >
            Share
          </button>
          {onManualSave && (
            <button
              className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              type="button"
              onClick={onManualSave}
              aria-label="Save project"
            >
              Save
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Time Scale
          </label>
          <select
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            value={timeScale}
            onChange={(event) => onTimeScaleChange(event.target.value as TimeScale)}
            aria-label="Time scale"
          >
            {scales.map((scale) => (
              <option key={scale.value} value={scale.value}>
                {scale.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500" aria-live="polite">
          <span className={`h-2 w-2 rounded-full ${saving ? "bg-amber-400" : "bg-emerald-400"}`} />
          <span>{statusLabel}</span>
        </div>
      </div>
    </header>
  );
}

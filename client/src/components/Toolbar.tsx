export type ToolbarProps = {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  showWeekends: boolean;
  onToggleWeekends: () => void;
  onExport: (format: "png" | "pdf") => void;
};

/**
 * Toolbar controls for zoom, view options, and export actions.
 */
export default function Toolbar({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  showWeekends,
  onToggleWeekends,
  onExport
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white/90 px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Zoom
        </span>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1">
          <button
            type="button"
            className="rounded-full px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            onClick={onZoomOut}
            aria-label="Zoom out"
          >
            -
          </button>
          <span className="text-xs font-semibold text-slate-600">{zoomLevel}%</span>
          <button
            type="button"
            className="rounded-full px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            onClick={onZoomIn}
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-ink"
            checked={showWeekends}
            onChange={onToggleWeekends}
            aria-label="Toggle weekends"
          />
          Show weekends
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            onClick={() => onExport("png")}
          >
            Export PNG
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            onClick={() => onExport("pdf")}
          >
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}

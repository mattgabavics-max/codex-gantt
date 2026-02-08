import { useMemo, useRef, useState } from "react";
import type { Task } from "@codex/shared";
import {
  calculateTaskPosition,
  generateTimeHeaders,
  getVisibleDateRange
} from "../utils/timeScaleUtils";

export type TimeScale = "day" | "week" | "sprint" | "month" | "quarter";

export type TaskUpdate = {
  startDate?: string;
  endDate?: string;
  name?: string;
  color?: string | null;
  position?: number;
};

type DragState =
  | { mode: "move"; taskId: string; startX: number; startDate: Date; endDate: Date }
  | { mode: "resize-start"; taskId: string; startX: number; startDate: Date; endDate: Date }
  | { mode: "resize-end"; taskId: string; startX: number; startDate: Date; endDate: Date }
  | null;

export type GanttChartProps = {
  tasks: Task[];
  timeScale: TimeScale;
  onTaskUpdate: (taskId: string, updates: TaskUpdate) => void;
  readOnly?: boolean;
  isLoading?: boolean;
  selectedTaskId?: string;
  onSelectTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  maxVisibleTasks?: number;
  onQuickAdd?: () => void;
};

function toDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function formatISO(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function clampDateRange(start: Date, end: Date) {
  if (start >= end) {
    const next = addDays(start, 1);
    return { start, end: next };
  }
  return { start, end };
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export default function GanttChart({
  tasks,
  timeScale,
  onTaskUpdate,
  readOnly = false,
  isLoading = false,
  selectedTaskId,
  onSelectTask,
  onDeleteTask,
  maxVisibleTasks = 200,
  onQuickAdd
}: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<DragState>(null);
  const [liveMessage, setLiveMessage] = useState("");

  const visibleTasks = tasks.slice(0, maxVisibleTasks);

  const containerWidth = containerRef.current?.clientWidth ?? 1200;

  const { rangeStart, rangeEnd, columns, totalWidth, dayWidth } = useMemo(() => {
    const center = new Date();
    const baseRange = getVisibleDateRange(timeScale, center);
    const starts = tasks.map((task) => toDate(task.startDate));
    const ends = tasks.map((task) => toDate(task.endDate));
    const min = starts.length ? new Date(Math.min(...starts.map((d) => d.getTime()))) : baseRange.start;
    const max = ends.length ? new Date(Math.max(...ends.map((d) => d.getTime()))) : baseRange.end;
    const start = min < baseRange.start ? min : baseRange.start;
    const end = max > baseRange.end ? max : baseRange.end;
    const { headers, dayWidth } = generateTimeHeaders(start, end, timeScale, containerWidth);
    const width = headers.reduce((sum, col) => sum + col.width, 0);
    return { rangeStart: start, rangeEnd: end, columns: headers, totalWidth: width, dayWidth };
  }, [tasks, timeScale, containerWidth]);

  const todayPosition = useMemo(() => {
    const today = startOfDay(new Date());
    if (today < rangeStart || today > rangeEnd) return null;
    const offsetDays = Math.max(
      0,
      Math.round((today.getTime() - rangeStart.getTime()) / (24 * 60 * 60 * 1000))
    );
    return offsetDays * dayWidth;
  }, [rangeStart, rangeEnd, dayWidth]);

  function handlePointerMove(event: React.PointerEvent) {
    if (!dragState || readOnly) return;
    const deltaX = event.clientX - dragState.startX;
    const deltaDays = Math.round(deltaX / dayWidth);
    if (deltaDays === 0) return;

    let nextStart = dragState.startDate;
    let nextEnd = dragState.endDate;
    if (dragState.mode === "move") {
      nextStart = addDays(dragState.startDate, deltaDays);
      nextEnd = addDays(dragState.endDate, deltaDays);
    } else if (dragState.mode === "resize-start") {
      nextStart = addDays(dragState.startDate, deltaDays);
    } else if (dragState.mode === "resize-end") {
      nextEnd = addDays(dragState.endDate, deltaDays);
    }

    const clamped = clampDateRange(nextStart, nextEnd);
    onTaskUpdate(dragState.taskId, {
      startDate: formatISO(clamped.start),
      endDate: formatISO(clamped.end)
    });
  }

  function handlePointerUp() {
    setDragState(null);
  }

  function startDrag(
    event: React.PointerEvent,
    task: Task,
    mode: DragState["mode"]
  ) {
    if (readOnly) return;
    event.preventDefault();
    event.stopPropagation();
    const startDate = toDate(task.startDate);
    const endDate = toDate(task.endDate);
    setDragState({
      mode,
      taskId: task.id,
      startX: event.clientX,
      startDate,
      endDate
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!visibleTasks.length) return;
    const currentIndex = visibleTasks.findIndex((task) => task.id === selectedTaskId);
    if (event.key === "ArrowDown") {
      const nextIndex = currentIndex < 0 ? 0 : Math.min(currentIndex + 1, visibleTasks.length - 1);
      onSelectTask?.(visibleTasks[nextIndex].id);
      setLiveMessage(`Selected ${visibleTasks[nextIndex].name}`);
      event.preventDefault();
      return;
    }
    if (event.key === "ArrowUp") {
      const nextIndex = currentIndex <= 0 ? 0 : currentIndex - 1;
      onSelectTask?.(visibleTasks[nextIndex].id);
      setLiveMessage(`Selected ${visibleTasks[nextIndex].name}`);
      event.preventDefault();
      return;
    }
    if (event.key === "Delete" && selectedTaskId && onDeleteTask) {
      onDeleteTask(selectedTaskId);
      setLiveMessage("Task deleted");
      event.preventDefault();
    }
  }

  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-slate-200 bg-white/90 shadow-xl">
      <div className="min-w-full" ref={containerRef}>
        <div className="relative border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
          <div className="flex" style={{ width: totalWidth }}>
            {columns.map((column, index) => (
              <div
                key={`${column.label}-${index}`}
                className="flex items-center justify-center border-r border-slate-200 px-2 py-3 text-center"
                style={{ width: column.width }}
              >
                {column.label}
              </div>
            ))}
          </div>
        </div>

        <div
          className="relative"
          data-testid="gantt-canvas"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="listbox"
          aria-label="Gantt chart"
          style={{ touchAction: "none" }}
        >
          <div className="sr-only" aria-live="polite">
            {liveMessage}
          </div>

          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                Loading chart...
              </div>
            </div>
          )}

          <div className="absolute inset-0 flex" style={{ width: totalWidth }}>
            {columns.map((column, index) => (
              <div
                key={`grid-${index}`}
                className="border-r border-slate-100"
                style={{ width: column.width }}
              >
                {timeScale === "day" && isWeekend(column.start) ? (
                  <div className="h-full w-full bg-slate-50/70" />
                ) : null}
              </div>
            ))}
          </div>

          {todayPosition !== null && (
            <div
              className="absolute top-0 h-full w-0.5 bg-rose-400"
              style={{ left: todayPosition }}
            />
          )}

          {visibleTasks.length === 0 ? (
            <div className="relative px-6 py-10 text-center text-sm text-slate-500">
              No tasks yet.
              {onQuickAdd && (
                <button
                  className="ml-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                  type="button"
                  onClick={onQuickAdd}
                >
                  Quick add
                </button>
              )}
            </div>
          ) : (
            <div className="relative flex flex-col gap-4 px-4 py-6" style={{ width: totalWidth }}>
              {visibleTasks.map((task) => {
                const { left: offset, width } = calculateTaskPosition(
                  task,
                  timeScale,
                  containerWidth,
                  rangeStart,
                  rangeEnd
                );
                const durationDays = Math.max(1, Math.round(width / dayWidth));
                const isMilestone = durationDays === 1;
                const isSelected = selectedTaskId === task.id;

                return (
                  <div key={task.id} className="relative h-8">
                    <div
                      className="absolute top-0 flex h-8 items-center"
                      style={{ left: offset, width }}
                    >
                      {isMilestone ? (
                        <div
                          className={`h-4 w-4 rotate-45 rounded-sm ${isSelected ? "ring-2 ring-ink" : ""}`}
                          style={{ backgroundColor: task.color ?? "#5c7cfa" }}
                          role="option"
                          aria-selected={isSelected}
                          tabIndex={-1}
                          onClick={() => onSelectTask?.(task.id)}
                        />
                      ) : (
                        <div
                          className={`relative h-6 w-full cursor-grab rounded-full px-3 text-xs font-medium text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${isSelected ? "ring-2 ring-ink" : ""}`}
                          style={{ backgroundColor: task.color ?? "#5c7cfa" }}
                          onPointerDown={(event) => startDrag(event, task, "move")}
                          onClick={() => onSelectTask?.(task.id)}
                          role="option"
                          aria-selected={isSelected}
                          tabIndex={-1}
                        >
                          <div className="flex h-full items-center justify-between">
                            <span className="truncate">{task.name}</span>
                            {!readOnly && (
                              <span className="text-[10px] text-white/80">
                                {task.startDate} → {task.endDate}
                              </span>
                            )}
                          </div>
                          {!readOnly && (
                            <>
                              <span
                                className="absolute left-0 top-0 h-full w-2 cursor-ew-resize"
                                onPointerDown={(event) =>
                                  startDrag(event, task, "resize-start")
                                }
                                aria-label="Resize task start"
                              />
                              <span
                                className="absolute right-0 top-0 h-full w-2 cursor-ew-resize"
                                onPointerDown={(event) =>
                                  startDrag(event, task, "resize-end")
                                }
                                aria-label="Resize task end"
                              />
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            {tasks.length > maxVisibleTasks && (
              <p className="px-4 text-xs text-slate-500">
                Showing {maxVisibleTasks} of {tasks.length} tasks. Zoom or filter to
                load more.
              </p>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

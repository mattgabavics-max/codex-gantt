import type { Task } from "@codex/shared";
import type { TimeScale } from "../components/GanttChart";

const DAY_MS = 24 * 60 * 60 * 1000;

export type TimeHeaderCell = {
  label: string;
  start: Date;
  end: Date;
  width: number;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function daysBetween(start: Date, end: Date) {
  const startDay = startOfDay(start).getTime();
  const endDay = startOfDay(end).getTime();
  return Math.max(0, Math.round((endDay - startDay) / DAY_MS));
}

function formatHeader(date: Date, scale: TimeScale) {
  if (scale === "day") {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  if (scale === "week" || scale === "sprint") {
    const end = addDays(date, scale === "week" ? 6 : 13);
    return `${date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric"
    })}–${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  }
  if (scale === "month") {
    return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  }
  return `${date.toLocaleDateString(undefined, { month: "short" })}–${addMonths(
    date,
    2
  ).toLocaleDateString(undefined, { month: "short", year: "numeric" })}`;
}

function resolveDayWidth(scale: TimeScale, containerWidth: number, days: number) {
  if (days <= 0) return 20;
  const min = 8;
  const max = 32;
  const width = containerWidth / days;
  if (scale === "day") return Math.min(max, Math.max(min, width));
  if (scale === "week") return Math.min(28, Math.max(min, width));
  if (scale === "sprint") return Math.min(24, Math.max(min, width));
  if (scale === "month") return Math.min(16, Math.max(min, width));
  return Math.min(14, Math.max(min, width));
}

export function generateTimeHeaders(
  startDate: Date,
  endDate: Date,
  scale: TimeScale,
  containerWidth = 1200
): { headers: TimeHeaderCell[]; dayWidth: number } {
  const normalizedStart = startOfDay(startDate);
  const normalizedEnd = startOfDay(endDate);
  const totalDays = daysBetween(normalizedStart, normalizedEnd);
  const dayWidth = resolveDayWidth(scale, containerWidth, totalDays || 1);

  const headers: TimeHeaderCell[] = [];
  let cursor = new Date(normalizedStart);

  while (cursor < normalizedEnd) {
    if (scale === "day") {
      const next = addDays(cursor, 1);
      headers.push({
        label: formatHeader(cursor, scale),
        start: cursor,
        end: next,
        width: dayWidth
      });
      cursor = next;
      continue;
    }
    if (scale === "week" || scale === "sprint") {
      const span = scale === "week" ? 7 : 14;
      const next = addDays(cursor, span);
      headers.push({
        label: formatHeader(cursor, scale),
        start: cursor,
        end: next,
        width: dayWidth * span
      });
      cursor = next;
      continue;
    }
    if (scale === "month") {
      const next = addMonths(cursor, 1);
      const span = daysBetween(cursor, next);
      headers.push({
        label: formatHeader(cursor, scale),
        start: cursor,
        end: next,
        width: dayWidth * span
      });
      cursor = next;
      continue;
    }
    const next = addMonths(cursor, 3);
    const span = daysBetween(cursor, next);
    headers.push({
      label: formatHeader(cursor, scale),
      start: cursor,
      end: next,
      width: dayWidth * span
    });
    cursor = next;
  }

  return { headers, dayWidth };
}

export function calculateTaskPosition(
  task: Task,
  scale: TimeScale,
  containerWidth: number,
  rangeStart: Date,
  rangeEnd: Date
): { left: number; width: number } {
  const start = startOfDay(new Date(`${task.startDate}T00:00:00`));
  const end = startOfDay(new Date(`${task.endDate}T00:00:00`));
  const totalDays = Math.max(1, daysBetween(rangeStart, rangeEnd));
  const dayWidth = resolveDayWidth(scale, containerWidth, totalDays);
  const left = daysBetween(rangeStart, start) * dayWidth;
  const width = Math.max(1, daysBetween(start, end)) * dayWidth;
  return { left, width };
}

export function snapToGrid(date: Date, scale: TimeScale) {
  const day = startOfDay(date);
  if (scale === "day") return day;
  if (scale === "week") {
    const diff = day.getDay();
    return addDays(day, -diff);
  }
  if (scale === "sprint") {
    const diff = day.getDay();
    return addDays(day, -diff);
  }
  if (scale === "month") {
    return new Date(day.getFullYear(), day.getMonth(), 1);
  }
  return new Date(day.getFullYear(), day.getMonth() - (day.getMonth() % 3), 1);
}

export function getVisibleDateRange(scale: TimeScale, centerDate: Date) {
  const center = startOfDay(centerDate);
  if (scale === "day") {
    return { start: addDays(center, -7), end: addDays(center, 21) };
  }
  if (scale === "week") {
    return { start: addDays(center, -21), end: addDays(center, 35) };
  }
  if (scale === "sprint") {
    return { start: addDays(center, -28), end: addDays(center, 56) };
  }
  if (scale === "month") {
    return { start: addMonths(center, -2), end: addMonths(center, 4) };
  }
  return { start: addMonths(center, -3), end: addMonths(center, 6) };
}

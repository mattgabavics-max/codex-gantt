import { describe, expect, it } from "vitest";
import {
  calculateTaskPosition,
  generateTimeHeaders,
  getVisibleDateRange,
  snapToGrid
} from "../utils/timeScaleUtils";
import type { Task } from "@codex/shared";

const task: Task = {
  id: "task-1",
  projectId: "project-1",
  name: "Design",
  startDate: "2026-02-10",
  endDate: "2026-02-12",
  color: "#5c7cfa",
  position: 1,
  createdAt: "2026-02-01T00:00:00.000Z"
};

describe("timeScaleUtils", () => {
  it("generates headers for week scale", () => {
    const { headers } = generateTimeHeaders(
      new Date("2026-02-01"),
      new Date("2026-03-01"),
      "week",
      1200
    );
    expect(headers.length).toBeGreaterThan(0);
  });

  it("calculates task position within range", () => {
    const rangeStart = new Date("2026-02-01");
    const rangeEnd = new Date("2026-03-01");
    const pos = calculateTaskPosition(task, "day", 1200, rangeStart, rangeEnd);
    expect(pos.left).toBeGreaterThanOrEqual(0);
    expect(pos.width).toBeGreaterThan(0);
  });

  it("snaps to month boundary", () => {
    const snapped = snapToGrid(new Date("2026-02-17"), "month");
    expect(snapped.getDate()).toBe(1);
  });

  it("returns visible range for quarter", () => {
    const range = getVisibleDateRange("quarter", new Date("2026-02-15"));
    expect(range.start).toBeInstanceOf(Date);
    expect(range.end).toBeInstanceOf(Date);
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GanttChart from "../components/GanttChart";
import type { Task } from "@codex/shared";

const tasks: Task[] = [
  {
    id: "task-1",
    projectId: "project-1",
    name: "Design",
    startDate: "2026-02-10",
    endDate: "2026-02-12",
    color: "#ff7a59",
    position: 1,
    createdAt: "2026-02-01T00:00:00.000Z"
  }
];

describe("GanttChart", () => {
  it("renders task bar with name", () => {
    render(
      <GanttChart tasks={tasks} timeScale="day" onTaskUpdate={vi.fn()} readOnly />
    );

    expect(screen.getByText("Design")).toBeInTheDocument();
  });

  it("does not update when readOnly", () => {
    const onTaskUpdate = vi.fn();
    render(
      <GanttChart tasks={tasks} timeScale="day" onTaskUpdate={onTaskUpdate} readOnly />
    );

    const bar = screen.getByText("Design").closest("div");
    expect(bar).toBeTruthy();

    fireEvent.pointerDown(bar!, { clientX: 100, pageX: 100 });
    fireEvent.pointerMove(screen.getByTestId("gantt-canvas"), { clientX: 128, pageX: 128 });
    fireEvent.pointerUp(screen.getByTestId("gantt-canvas"));

    expect(onTaskUpdate).not.toHaveBeenCalled();
  });

  it("announces selection on arrow keys", () => {
    const onSelectTask = vi.fn();
    render(
      <GanttChart
        tasks={tasks}
        timeScale="day"
        onTaskUpdate={vi.fn()}
        onSelectTask={onSelectTask}
        selectedTaskId={tasks[0].id}
      />
    );

    const canvas = screen.getByTestId("gantt-canvas");
    fireEvent.keyDown(canvas, { key: "ArrowDown" });
    expect(onSelectTask).toHaveBeenCalled();
  });
});

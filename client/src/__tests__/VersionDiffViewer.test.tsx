import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import VersionDiffViewer from "../components/VersionDiffViewer";
import type { Task } from "@codex/shared";

const baseTasks: Task[] = [
  {
    id: "task-1",
    projectId: "project-1",
    name: "Design",
    startDate: "2026-02-10",
    endDate: "2026-02-12",
    color: "#5c7cfa",
    position: 1,
    createdAt: "2026-02-01T00:00:00.000Z"
  }
];

const compareTasks: Task[] = [
  {
    id: "task-1",
    projectId: "project-1",
    name: "Design Updated",
    startDate: "2026-02-10",
    endDate: "2026-02-14",
    color: "#5c7cfa",
    position: 1,
    createdAt: "2026-02-01T00:00:00.000Z"
  },
  {
    id: "task-2",
    projectId: "project-1",
    name: "Build",
    startDate: "2026-02-15",
    endDate: "2026-02-18",
    color: "#ff7a59",
    position: 2,
    createdAt: "2026-02-02T00:00:00.000Z"
  }
];

describe("VersionDiffViewer", () => {
  it("shows diff entries", () => {
    render(<VersionDiffViewer baseTasks={baseTasks} compareTasks={compareTasks} />);

    expect(screen.getByText(/Modified:/)).toBeInTheDocument();
    expect(screen.getByText(/Added:/)).toBeInTheDocument();
  });
});

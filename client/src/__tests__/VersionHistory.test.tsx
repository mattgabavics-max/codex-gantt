import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import VersionHistory from "../components/VersionHistory";
import { VersionStoreProvider } from "../state/versionStore";
import type { Task } from "@codex/shared";

const tasks: Task[] = [
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

const versions = [
  {
    id: "version-1",
    versionNumber: 1,
    createdAt: "2026-02-03T12:00:00.000Z",
    createdBy: { id: "user-1", email: "owner@example.com" },
    snapshot: { tasks }
  }
];

describe("VersionHistory", () => {
  it("renders versions and triggers restore", () => {
    const onRestore = vi.fn();
    render(
      <VersionStoreProvider initialVersions={versions} onRestore={onRestore}>
        <VersionHistory isOpen onClose={vi.fn()} currentTasks={tasks} />
      </VersionStoreProvider>
    );

    expect(screen.getAllByText("Version 1").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText("Restore version"));
    expect(onRestore).toHaveBeenCalledWith("version-1");
  });

  it("toggles auto-version", () => {
    render(
      <VersionStoreProvider initialVersions={versions}>
        <VersionHistory isOpen onClose={vi.fn()} currentTasks={tasks} />
      </VersionStoreProvider>
    );

    const checkbox = screen.getByRole("checkbox", { name: /Auto-version/i });
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});

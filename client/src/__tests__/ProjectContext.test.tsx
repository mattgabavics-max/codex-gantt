import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectProvider, useProjectState } from "../state/ProjectContext";
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

describe("ProjectContext", () => {
  it("updates task and records undo", async () => {
    const onAutosave = vi.fn(async () => {});
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProjectProvider onAutosave={onAutosave} autosaveDelayMs={0}>
        {children}
      </ProjectProvider>
    );
    const { result } = renderHook(() => useProjectState(), { wrapper });

    act(() => {
      result.current.setTasks([task]);
    });

    act(() => {
      result.current.updateTask("task-1", { name: "Updated" });
    });

    expect(result.current.state.tasks[0].name).toBe("Updated");
    act(() => {
      result.current.undo();
    });
    expect(result.current.state.tasks[0].name).toBe("Design");
  });
});

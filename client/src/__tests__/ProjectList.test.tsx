import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProjectList from "../components/ProjectList";
import type { Project } from "@codex/shared";

const projects: Project[] = [
  {
    id: "project-1",
    name: "Launch Plan",
    ownerId: "user-1",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-02T00:00:00.000Z",
    isPublic: false,
    deletedAt: null
  },
  {
    id: "project-2",
    name: "Marketing",
    ownerId: "user-1",
    createdAt: "2026-02-03T00:00:00.000Z",
    updatedAt: "2026-02-04T00:00:00.000Z",
    isPublic: true,
    deletedAt: null
  }
];

describe("ProjectList", () => {
  it("filters projects by search query", () => {
    render(
      <ProjectList
        projects={projects}
        onCreateProject={vi.fn()}
        onSelectProject={vi.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Search projects..."), {
      target: { value: "market" }
    });

    expect(screen.getByText("Marketing")).toBeInTheDocument();
    expect(screen.queryByText("Launch Plan")).not.toBeInTheDocument();
  });

  it("calls onCreateProject", () => {
    const onCreateProject = vi.fn();
    render(
      <ProjectList
        projects={projects}
        onCreateProject={onCreateProject}
        onSelectProject={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Create New Project"));
    expect(onCreateProject).toHaveBeenCalled();
  });

  it("shows empty state when no projects", () => {
    render(
      <ProjectList
        projects={[]}
        onCreateProject={vi.fn()}
        onSelectProject={vi.fn()}
      />
    );

    expect(screen.getByText("No projects yet")).toBeInTheDocument();
  });

  it("renders loading skeletons", () => {
    const { container } = render(
      <ProjectList
        projects={[]}
        isLoading
        onCreateProject={vi.fn()}
        onSelectProject={vi.fn()}
      />
    );

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});

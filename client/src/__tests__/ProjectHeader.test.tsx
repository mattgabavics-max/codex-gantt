import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProjectHeader from "../components/ProjectHeader";

describe("ProjectHeader", () => {
  it("allows renaming project", () => {
    const onRename = vi.fn();
    render(
      <ProjectHeader
        name="Launch Plan"
        timeScale="week"
        onRename={onRename}
        onTimeScaleChange={vi.fn()}
        onShare={vi.fn()}
        onOpenVersions={vi.fn()}
      />
    );

    const input = screen.getByDisplayValue("Launch Plan");
    fireEvent.change(input, { target: { value: "New Name" } });
    fireEvent.blur(input);

    expect(onRename).toHaveBeenCalledWith("New Name");
  });

  it("changes time scale", () => {
    const onTimeScaleChange = vi.fn();
    render(
      <ProjectHeader
        name="Launch Plan"
        timeScale="week"
        onRename={vi.fn()}
        onTimeScaleChange={onTimeScaleChange}
        onShare={vi.fn()}
        onOpenVersions={vi.fn()}
      />
    );

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "month" } });
    expect(onTimeScaleChange).toHaveBeenCalledWith("month");
  });

  it("shows dirty state label", () => {
    render(
      <ProjectHeader
        name="Launch Plan"
        timeScale="week"
        dirty
        onRename={vi.fn()}
        onTimeScaleChange={vi.fn()}
        onShare={vi.fn()}
        onOpenVersions={vi.fn()}
      />
    );

    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
  });
});

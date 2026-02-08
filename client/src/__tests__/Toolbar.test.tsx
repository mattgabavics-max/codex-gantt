import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Toolbar from "../components/Toolbar";

describe("Toolbar", () => {
  it("triggers zoom and export callbacks", () => {
    const onZoomIn = vi.fn();
    const onZoomOut = vi.fn();
    const onExport = vi.fn();
    const onToggleWeekends = vi.fn();

    render(
      <Toolbar
        zoomLevel={100}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        showWeekends
        onToggleWeekends={onToggleWeekends}
        onExport={onExport}
      />
    );

    fireEvent.click(screen.getByLabelText("Zoom in"));
    fireEvent.click(screen.getByLabelText("Zoom out"));
    fireEvent.click(screen.getByText("Export PNG"));
    fireEvent.click(screen.getByText("Export PDF"));

    expect(onZoomIn).toHaveBeenCalled();
    expect(onZoomOut).toHaveBeenCalled();
    expect(onExport).toHaveBeenCalledWith("png");
    expect(onExport).toHaveBeenCalledWith("pdf");
  });
});

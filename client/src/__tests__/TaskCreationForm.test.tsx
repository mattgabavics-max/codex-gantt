import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TaskCreationForm from "../components/TaskCreationForm";

describe("TaskCreationForm", () => {
  it("submits values on Enter", () => {
    const onCreate = vi.fn();
    render(<TaskCreationForm onCreate={onCreate} />);

    fireEvent.change(screen.getByPlaceholderText("Design sprint planning"), {
      target: { value: "Design task" }
    });
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-02-10" }
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2026-02-12" }
    });

    fireEvent.keyDown(screen.getByPlaceholderText("Design sprint planning"), {
      key: "Enter"
    });

    expect(onCreate).toHaveBeenCalledWith({
      name: "Design task",
      startDate: "2026-02-10",
      endDate: "2026-02-12",
      color: "#5c7cfa"
    });
  });
});

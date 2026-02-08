import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SharedProjectView from "../components/SharedProjectView";

vi.mock("react-router-dom", () => ({
  useParams: () => ({ token: "token-123" })
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: {
      accessType: "readonly",
      project: {
        id: "project-1",
        name: "Shared Project",
        ownerId: "user-1",
        createdAt: "2026-02-01T00:00:00.000Z",
        updatedAt: "2026-02-02T00:00:00.000Z",
        isPublic: false,
        deletedAt: null
      },
      tasks: []
    },
    isLoading: false,
    error: null
  })
}));

vi.mock("../state/AuthContext", () => ({
  useAuth: () => ({ user: null })
}));

vi.mock("../state/queries", () => ({
  useUpdateTask: () => ({ mutate: vi.fn() })
}));

describe("SharedProjectView", () => {
  it("renders shared banner", () => {
    render(<SharedProjectView />);
    expect(screen.getByText(/Viewing shared project/i)).toBeInTheDocument();
    expect(screen.getByText("Shared Project")).toBeInTheDocument();
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ShareModal from "../components/ShareModal";
import type { ShareLink } from "@codex/shared";

const links: ShareLink[] = [
  {
    id: "link-1",
    projectId: "project-1",
    token: "token-1",
    accessType: "readonly",
    createdAt: "2026-02-01T00:00:00.000Z",
    expiresAt: null
  }
];

describe("ShareModal", () => {
  it("creates link and revokes", async () => {
    const onCreate = vi.fn(async () => {});
    const onRevoke = vi.fn(async () => {});
    render(
      <ShareModal
        isOpen
        projectId="project-1"
        links={links}
        onClose={vi.fn()}
        onCreateLink={onCreate}
        onRevokeLink={onRevoke}
      />
    );

    fireEvent.click(screen.getByText("Generate link"));
    await waitFor(() => expect(onCreate).toHaveBeenCalled());

    fireEvent.click(screen.getByText("Revoke"));
    await waitFor(() => expect(onRevoke).toHaveBeenCalledWith("link-1"));
  });
});

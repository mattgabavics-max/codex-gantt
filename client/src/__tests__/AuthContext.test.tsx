import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const tokenPayload = btoa(JSON.stringify({ id: "user-1", email: "a@b.com" }));

vi.mock("../api/api", () => ({
  api: {
    post: vi.fn(async () => ({ data: { token: `header.${tokenPayload}.sig` } }))
  },
  setAuthToken: vi.fn(),
  setUnauthorizedHandler: vi.fn()
}));

import { AuthProvider, useAuth } from "../state/AuthContext";

describe("AuthContext", () => {
  it("logs in and stores token", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.login({ email: "a@b.com", password: "password123" });
    });

    expect(result.current.token).toBe(`header.${tokenPayload}.sig`);
  });
});

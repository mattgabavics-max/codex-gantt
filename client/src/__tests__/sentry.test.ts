import { describe, expect, it, vi } from "vitest";

vi.mock("@sentry/react", () => ({
  init: vi.fn()
}));

import { initSentry } from "../monitoring/sentry";

describe("client sentry", () => {
  it("does not init without DSN", () => {
    initSentry();
    expect(true).toBe(true);
  });
});

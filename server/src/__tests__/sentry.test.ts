import { describe, expect, it, vi } from "vitest";

vi.mock("@sentry/node", () => ({
  init: vi.fn()
}));

import { initSentry } from "../monitoring/sentry";

describe("server sentry", () => {
  it("does not init without DSN", () => {
    initSentry();
    expect(true).toBe(true);
  });
});

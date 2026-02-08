import { beforeAll, describe, expect, it } from "vitest";

let requireAuth: typeof import("../middleware/auth").requireAuth;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  ({ requireAuth } = await import("../middleware/auth"));
});

describe("requireAuth middleware", () => {
  it("rejects missing auth header", () => {
    const req = { headers: {} } as any;
    const next = (err?: any) => {
      expect(err?.status).toBe(401);
    };

    requireAuth(req, {} as any, next);
  });
});

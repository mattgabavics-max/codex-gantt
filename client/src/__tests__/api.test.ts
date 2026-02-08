import { describe, expect, it } from "vitest";
import { createApiClient, setAuthToken } from "../api/api";

describe("api client", () => {
  it("adds Authorization header when token set", async () => {
    const api = createApiClient();
    setAuthToken("test-token");
    const config = await api.interceptors.request.handlers[0].fulfilled!({
      headers: {}
    });
    expect(config.headers?.Authorization).toBe("Bearer test-token");
  });
});

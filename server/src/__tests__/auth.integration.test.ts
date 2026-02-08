import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const userStore = new Map<string, { id: string; email: string; passwordHash: string }>();

vi.mock("../db", () => {
  return {
    default: {
      user: {
        findUnique: vi.fn(async ({ where }: { where: { email: string } }) => {
          return userStore.get(where.email) ?? null;
        }),
        create: vi.fn(async ({ data }: { data: { email: string; passwordHash: string } }) => {
          const user = { id: "user-1", email: data.email, passwordHash: data.passwordHash };
          userStore.set(data.email, user);
          return user;
        })
      },
      task: {
        findMany: vi.fn(async () => [])
      }
    }
  };
});

let createApp: typeof import("../server").createApp;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  ({ createApp } = await import("../server"));
});

describe("auth integration", () => {
  beforeEach(() => {
    userStore.clear();
  });

  it("registers a new user and returns a token", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "supersecret" })
      .expect(201);

    expect(res.body.token).toBeTypeOf("string");
    expect(userStore.has("test@example.com")).toBe(true);
  });

  it("rejects duplicate registrations", async () => {
    const app = createApp();
    await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "supersecret" })
      .expect(201);

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "supersecret" })
      .expect(409);

    expect(res.body.error).toBe("Email already in use");
  });

  it("logs in with valid credentials", async () => {
    const app = createApp();
    await request(app)
      .post("/api/auth/register")
      .send({ email: "login@example.com", password: "supersecret" })
      .expect(201);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "supersecret" })
      .expect(200);

    expect(res.body.token).toBeTypeOf("string");
  });

  it("rejects invalid login credentials", async () => {
    const app = createApp();
    await request(app)
      .post("/api/auth/register")
      .send({ email: "login@example.com", password: "supersecret" })
      .expect(201);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "wrongpassword" })
      .expect(401);

    expect(res.body.error).toBe("Invalid credentials");
  });
});

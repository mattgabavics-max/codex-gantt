import request from "supertest";
import jwt from "jsonwebtoken";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type ProjectRecord = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  deletedAt: Date | null;
};

type VersionRecord = {
  id: string;
  projectId: string;
  versionNumber: number;
  snapshotData: unknown;
  createdAt: Date;
  createdBy: string;
};

const projects = new Map<string, ProjectRecord>();
const versions: VersionRecord[] = [];

vi.mock("../db", () => {
  return {
    default: {
      project: {
        count: vi.fn(async ({ where }: { where: { ownerId: string; deletedAt: null } }) => {
          return [...projects.values()].filter(
            (project) => project.ownerId === where.ownerId && project.deletedAt === null
          ).length;
        }),
        findMany: vi.fn(async ({ where, skip, take }: any) => {
          const filtered = [...projects.values()].filter(
            (project) => project.ownerId === where.ownerId && project.deletedAt === null
          );
          return filtered.slice(skip ?? 0, (skip ?? 0) + (take ?? filtered.length));
        }),
        findFirst: vi.fn(async ({ where, include }: any) => {
          const project = [...projects.values()].find(
            (item) =>
              item.id === where.id &&
              item.ownerId === where.ownerId &&
              item.deletedAt === where.deletedAt
          );
          if (!project) return null;
          if (include?.tasks) {
            return { ...project, tasks: [] };
          }
          return project;
        }),
        create: vi.fn(async ({ data }: any) => {
          const now = new Date();
          const record: ProjectRecord = {
            id: `project-${projects.size + 1}`,
            name: data.name,
            ownerId: data.ownerId,
            createdAt: now,
            updatedAt: now,
            isPublic: Boolean(data.isPublic),
            deletedAt: null
          };
          projects.set(record.id, record);
          return record;
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const record = projects.get(where.id)!;
          const updated = {
            ...record,
            ...data,
            updatedAt: data.updatedAt ?? new Date()
          };
          projects.set(record.id, updated);
          return updated;
        })
      },
      projectVersion: {
        findFirst: vi.fn(async ({ where, orderBy }: any) => {
          const list = versions.filter((v) => v.projectId === where.projectId);
          if (!list.length) return null;
          return list.sort((a, b) =>
            orderBy?.versionNumber === "desc" ? b.versionNumber - a.versionNumber : 0
          )[0];
        }),
        count: vi.fn(async ({ where }: any) => {
          return versions.filter((v) => v.projectId === where.projectId).length;
        }),
        findMany: vi.fn(async ({ where, skip, take }: any) => {
          const list = versions
            .filter((v) => v.projectId === where.projectId)
            .sort((a, b) => b.versionNumber - a.versionNumber);
          return list.slice(skip ?? 0, (skip ?? 0) + (take ?? list.length));
        }),
        create: vi.fn(async ({ data }: any) => {
          const record: VersionRecord = {
            id: `version-${versions.length + 1}`,
            projectId: data.projectId,
            versionNumber: data.versionNumber,
            snapshotData: data.snapshotData,
            createdAt: new Date(),
            createdBy: data.createdBy
          };
          versions.push(record);
          return record;
        })
      }
    }
  };
});

let createApp: typeof import("../server").createApp;
let token: string;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  ({ createApp } = await import("../server"));
  token = jwt.sign({ id: "user-1", email: "user@example.com" }, "test-secret");
});

beforeEach(() => {
  projects.clear();
  versions.length = 0;
});

describe("projects integration", () => {
  it("creates and lists projects with pagination", async () => {
    const app = createApp();
    await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Roadmap" })
      .expect(201);

    const res = await request(app)
      .get("/api/projects?page=1&pageSize=10")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe("Roadmap");
  });

  it("updates a project", async () => {
    const app = createApp();
    const created = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Initial" })
      .expect(201);

    const res = await request(app)
      .put(`/api/projects/${created.body.project.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated" })
      .expect(200);

    expect(res.body.project.name).toBe("Updated");
  });

  it("soft deletes a project", async () => {
    const app = createApp();
    const created = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Archive" })
      .expect(201);

    await request(app)
      .delete(`/api/projects/${created.body.project.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.total).toBe(0);
  });
});

describe("project versions integration", () => {
  it("creates and lists versions", async () => {
    const app = createApp();
    const created = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Versioned" })
      .expect(201);

    await request(app)
      .post(`/api/projects/${created.body.project.id}/versions`)
      .set("Authorization", `Bearer ${token}`)
      .send({ snapshotData: { note: "v1" } })
      .expect(201);

    const res = await request(app)
      .get(`/api/projects/${created.body.project.id}/versions`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.total).toBe(1);
    expect(res.body.data[0].versionNumber).toBe(1);
  });
});


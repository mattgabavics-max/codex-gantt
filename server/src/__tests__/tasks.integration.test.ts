import request from "supertest";
import jwt from "jsonwebtoken";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type ProjectRecord = {
  id: string;
  ownerId: string;
  name: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

type TaskRecord = {
  id: string;
  projectId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  color: string | null;
  position: number;
  createdAt: Date;
};

const projects = new Map<string, ProjectRecord>();
const tasks = new Map<string, TaskRecord>();
const versions: Array<{
  id: string;
  projectId: string;
  versionNumber: number;
  snapshotData: unknown;
  createdAt: Date;
  createdBy: string;
}> = [];

const ownerId = "user-123";
const projectId = "11111111-1111-4111-8111-111111111111";

function seedProject() {
  const project: ProjectRecord = {
    id: projectId,
    ownerId,
    name: "Demo",
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  };
  projects.set(project.id, project);
  return project;
}

function seedTask(projectId: string) {
  const task: TaskRecord = {
    id:
      tasks.size === 0
        ? "22222222-2222-4222-8222-222222222222"
        : "33333333-3333-4333-8333-333333333333",
    projectId,
    name: "Initial",
    startDate: new Date("2026-02-10"),
    endDate: new Date("2026-02-12"),
    color: "#000000",
    position: 1,
    createdAt: new Date()
  };
  tasks.set(task.id, task);
  return task;
}

vi.mock("../db", () => {
  return {
    default: {
      project: {
        findFirst: vi.fn(async ({ where }: any) => {
          const id = where?.id;
          const owner = where?.ownerId;
          const deletedAt = where?.deletedAt ?? null;
          const project = projects.get(id);
          if (!project) return null;
          if (owner && project.ownerId !== owner) return null;
          if (deletedAt === null && project.deletedAt !== null) return null;
          return project;
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const project = projects.get(where.id);
          if (!project) return null;
          const updated = {
            ...project,
            ...data,
            updatedAt: data.updatedAt ?? new Date()
          };
          projects.set(where.id, updated);
          return updated;
        })
      },
      task: {
        create: vi.fn(async ({ data }: any) => {
          const task: TaskRecord = {
            id: `task-${tasks.size + 1}`,
            projectId: data.projectId,
            name: data.name,
            startDate: data.startDate,
            endDate: data.endDate,
            color: data.color ?? null,
            position: data.position,
            createdAt: new Date()
          };
          tasks.set(task.id, task);
          return task;
        }),
        findFirst: vi.fn(async ({ where }: any) => {
          const id = where?.id;
          const task = tasks.get(id);
          if (!task) return null;
          const project = projects.get(task.projectId);
          const ownerIdQuery = where?.project?.ownerId;
          const deletedAtQuery = where?.project?.deletedAt;
          if (ownerIdQuery && project?.ownerId !== ownerIdQuery) return null;
          if (deletedAtQuery === null && project?.deletedAt !== null) return null;
          return {
            ...task,
            project
          };
        }),
        findMany: vi.fn(async ({ where }: any) => {
          const ids: string[] = where?.id?.in ?? [];
          const projectId = where?.projectId;
          return ids
            .map((id) => tasks.get(id))
            .filter((task) => task && task.projectId === projectId) as TaskRecord[];
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const task = tasks.get(where.id);
          if (!task) return null;
          const updated: TaskRecord = {
            ...task,
            ...data,
            startDate: data.startDate ?? task.startDate,
            endDate: data.endDate ?? task.endDate,
            color: data.color ?? task.color,
            position: typeof data.position === "number" ? data.position : task.position
          };
          tasks.set(task.id, updated);
          return updated;
        }),
        delete: vi.fn(async ({ where }: any) => {
          const task = tasks.get(where.id);
          if (!task) return null;
          tasks.delete(where.id);
          return task;
        })
      },
      projectVersion: {
        findFirst: vi.fn(async ({ where }: any) => {
          const projectId = where?.projectId;
          const list = versions.filter((v) => v.projectId === projectId);
          if (list.length === 0) return null;
          return list.sort((a, b) => b.versionNumber - a.versionNumber)[0];
        }),
        create: vi.fn(async ({ data }: any) => {
          const version = {
            id: `version-${versions.length + 1}`,
            projectId: data.projectId,
            versionNumber: data.versionNumber,
            snapshotData: data.snapshotData,
            createdAt: new Date(),
            createdBy: data.createdBy
          };
          versions.push(version);
          return version;
        })
      },
      $transaction: vi.fn(async (ops: any[]) => Promise.all(ops))
    }
  };
});

let createApp: typeof import("../server").createApp;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  ({ createApp } = await import("../server"));
});

beforeEach(() => {
  projects.clear();
  tasks.clear();
  versions.length = 0;
  seedProject();
});

function authHeader(userId = ownerId) {
  const token = jwt.sign({ id: userId, email: "owner@example.com" }, "test-secret");
  return `Bearer ${token}`;
}

describe("task endpoints", () => {
  it("creates a task for a project", async () => {
    const app = createApp();
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", authHeader())
      .send({
        name: "Build",
        startDate: "2026-02-10",
        endDate: "2026-02-12",
        color: "#ffffff",
        position: 0
      })
      .expect(201);

    expect(res.body.task.name).toBe("Build");
    expect(res.body.task.startDate).toBe("2026-02-10");
  });

  it("rejects invalid date ranges", async () => {
    const app = createApp();
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", authHeader())
      .send({
        name: "Bad",
        startDate: "2026-02-12",
        endDate: "2026-02-10",
        position: 0
      })
      .expect(400);

    expect(res.body.error).toBe("Validation failed");
  });

  it("updates a task", async () => {
    const app = createApp();
    const task = seedTask(projectId);

    const res = await request(app)
      .put(`/api/tasks/${task.id}`)
      .set("Authorization", authHeader())
      .send({ name: "Updated", startDate: "2026-02-11", endDate: "2026-02-13" })
      .expect(200);

    expect(res.body.task.name).toBe("Updated");
    expect(res.body.task.startDate).toBe("2026-02-11");
  });

  it("updates task position", async () => {
    const app = createApp();
    const task = seedTask(projectId);

    const res = await request(app)
      .patch(`/api/tasks/${task.id}/position`)
      .set("Authorization", authHeader())
      .send({ position: 4 })
      .expect(200);

    expect(res.body.task.position).toBe(4);
  });

  it("deletes a task", async () => {
    const app = createApp();
    const task = seedTask(projectId);

    await request(app)
      .delete(`/api/tasks/${task.id}`)
      .set("Authorization", authHeader())
      .expect(204);

    expect(tasks.has(task.id)).toBe(false);
  });

  it("bulk updates tasks", async () => {
    const app = createApp();
    const task1 = seedTask(projectId);
    const task2 = seedTask(projectId);

    const res = await request(app)
      .patch(`/api/projects/${projectId}/tasks/bulk`)
      .set("Authorization", authHeader())
      .send({
        tasks: [
          { id: task1.id, name: "Alpha", position: 2 },
          { id: task2.id, name: "Beta", position: 3 }
        ]
      })
      .expect(200);

    expect(res.body.tasks).toHaveLength(2);
    expect(res.body.tasks[0].name).toBe("Alpha");
  });

  it("rejects access to tasks owned by another user", async () => {
    const app = createApp();
    const task = seedTask(projectId);

    const res = await request(app)
      .put(`/api/tasks/${task.id}`)
      .set("Authorization", authHeader("other-user"))
      .send({ name: "Nope" })
      .expect(404);

    expect(res.body.error).toBe("Task not found");
  });
});

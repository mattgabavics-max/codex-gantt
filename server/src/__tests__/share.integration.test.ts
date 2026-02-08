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

type ShareLinkRecord = {
  id: string;
  projectId: string;
  token: string;
  accessType: "readonly" | "editable";
  createdAt: Date;
  expiresAt: Date | null;
};

const ownerId = "user-123";
const projectId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const shareId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const shareToken = "share-token-1234567890";

const projects = new Map<string, ProjectRecord>();
const tasks = new Map<string, TaskRecord>();
const shareLinks = new Map<string, ShareLinkRecord>();

function seedProject() {
  const project: ProjectRecord = {
    id: projectId,
    ownerId,
    name: "Shared Project",
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  };
  projects.set(project.id, project);
  return project;
}

function seedTask() {
  const task: TaskRecord = {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    projectId,
    name: "Shared Task",
    startDate: new Date("2026-02-10"),
    endDate: new Date("2026-02-12"),
    color: "#000000",
    position: 1,
    createdAt: new Date()
  };
  tasks.set(task.id, task);
  return task;
}

function seedShareLink(overrides: Partial<ShareLinkRecord> = {}) {
  const link: ShareLinkRecord = {
    id: shareId,
    projectId,
    token: shareToken,
    accessType: "readonly",
    createdAt: new Date(),
    expiresAt: null,
    ...overrides
  };
  shareLinks.set(link.id, link);
  return link;
}

vi.mock("../db", () => {
  return {
    default: {
      project: {
        findFirst: vi.fn(async ({ where, include }: any) => {
          const project = projects.get(where?.id) ?? null;
          if (!project) return null;
          if (where?.ownerId && project.ownerId !== where.ownerId) return null;
          if (where?.deletedAt === null && project.deletedAt !== null) return null;
          if (include?.tasks) {
            const projectTasks = [...tasks.values()].filter(
              (task) => task.projectId === project.id
            );
            return { ...project, tasks: projectTasks };
          }
          return project;
        })
      },
      shareLink: {
        create: vi.fn(async ({ data }: any) => {
          const link: ShareLinkRecord = {
            id: shareId,
            projectId: data.projectId,
            token: data.token,
            accessType: data.accessType,
            createdAt: new Date(),
            expiresAt: data.expiresAt ?? null
          };
          shareLinks.set(link.id, link);
          return link;
        }),
        findUnique: vi.fn(async ({ where }: any) => {
          return [...shareLinks.values()].find((link) => link.token === where.token) ?? null;
        }),
        findFirst: vi.fn(async ({ where }: any) => {
          return shareLinks.get(where?.id) ?? null;
        }),
        delete: vi.fn(async ({ where }: any) => {
          const link = shareLinks.get(where.id);
          if (!link) return null;
          shareLinks.delete(where.id);
          return link;
        })
      }
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
  shareLinks.clear();
  seedProject();
  seedTask();
});

function authHeader(userId = ownerId) {
  const token = jwt.sign({ id: userId, email: "owner@example.com" }, "test-secret");
  return `Bearer ${token}`;
}

describe("share links", () => {
  it("creates a share link", async () => {
    const app = createApp();
    const res = await request(app)
      .post(`/api/projects/${projectId}/share`)
      .set("Authorization", authHeader())
      .send({ accessType: "readonly", expiresIn: 3600 })
      .expect(201);

    expect(res.body.link.token).toBeTruthy();
    expect(res.body.link.accessType).toBe("readonly");
  });

  it("returns project data via share token", async () => {
    seedShareLink();
    const app = createApp();

    const res = await request(app)
      .get(`/api/share/${shareToken}`)
      .expect(200);

    expect(res.body.project.id).toBe(projectId);
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.accessType).toBe("readonly");
  });

  it("rejects expired share tokens", async () => {
    seedShareLink({ expiresAt: new Date(Date.now() - 1000) });
    const app = createApp();

    const res = await request(app)
      .get(`/api/share/${shareToken}`)
      .expect(410);

    expect(res.body.error).toBe("Share link expired");
  });

  it("revokes a share link", async () => {
    seedShareLink();
    const app = createApp();

    await request(app)
      .delete(`/api/projects/${projectId}/share/${shareId}`)
      .set("Authorization", authHeader())
      .expect(204);

    expect(shareLinks.has(shareId)).toBe(false);
  });
});

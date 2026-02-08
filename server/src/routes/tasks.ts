import { Router } from "express";
import { body, param, query } from "express-validator";
import prisma from "../db";
import { requireAuth } from "../middleware/auth";
import { validateRequest } from "../middleware/validate-request";
import { createNextProjectVersion } from "../services/versioning";
import type {
  BulkUpdateTasksRequestBody,
  BulkUpdateTasksResponse,
  CreateTaskRequestBody,
  TaskResponse,
  UpdateTaskRequestBody
} from "@codex/shared";

const router = Router();

const projectIdParam = param("projectId").isUUID().withMessage("Invalid project id");
const taskIdParam = param("id").isUUID().withMessage("Invalid task id");

function parseDate(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

const dateRangeValidator = body(["startDate", "endDate"])
  .optional()
  .custom((_, { req }) => {
    const start = req.body.startDate ? parseDate(req.body.startDate) : undefined;
    const end = req.body.endDate ? parseDate(req.body.endDate) : undefined;
    if (start && end && start >= end) {
      throw new Error("startDate must be before endDate");
    }
    return true;
  });

async function touchProject(projectId: string) {
  await prisma.project.update({
    where: { id: projectId },
    data: { updatedAt: new Date() }
  });
}

async function createVersionIfRequested(
  projectId: string,
  userId: string,
  snapshotRequested: boolean,
  snapshotData?: unknown
) {
  if (!snapshotRequested) {
    return;
  }
  await createNextProjectVersion({
    projectId,
    userId,
    snapshotData: snapshotData ?? { reason: "task-update" }
  });
}

router.post(
  "/projects/:projectId/tasks",
  requireAuth,
  [
    projectIdParam,
    body("name").isString().trim().isLength({ min: 1 }).withMessage("Name required"),
    body("startDate").isISO8601().withMessage("startDate must be ISO-8601"),
    body("endDate").isISO8601().withMessage("endDate must be ISO-8601"),
    body("color").optional().isString(),
    body("position").isInt({ min: 0 }).toInt(),
    body("snapshot").optional().isBoolean().toBoolean(),
    body("snapshotData").optional(),
    dateRangeValidator
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { name, startDate, endDate, color, position, snapshot, snapshotData } =
        req.body as CreateTaskRequestBody & {
          snapshot?: boolean;
          snapshotData?: unknown;
        };

      const project = await prisma.project.findFirst({
        where: { id: req.params.projectId, ownerId: req.user!.id, deletedAt: null }
      });
      if (!project) {
        next({ status: 404, message: "Project not found" });
        return;
      }

      const task = await prisma.task.create({
        data: {
          projectId: project.id,
          name,
          startDate: parseDate(startDate),
          endDate: parseDate(endDate),
          color: color ?? null,
          position
        }
      });

      await touchProject(project.id);
      await createVersionIfRequested(project.id, req.user!.id, Boolean(snapshot), snapshotData);

      const payload: TaskResponse = {
        task: {
          id: task.id,
          projectId: task.projectId,
          name: task.name,
          startDate: task.startDate.toISOString().slice(0, 10),
          endDate: task.endDate.toISOString().slice(0, 10),
          color: task.color,
          position: task.position,
          createdAt: task.createdAt.toISOString()
        }
      };

      res.status(201).json(payload);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/tasks/:id",
  requireAuth,
  [
    taskIdParam,
    body("name").optional().isString().trim().isLength({ min: 1 }),
    body("startDate").optional().isISO8601(),
    body("endDate").optional().isISO8601(),
    body("color").optional().isString(),
    body("position").optional().isInt({ min: 0 }).toInt(),
    body("snapshot").optional().isBoolean().toBoolean(),
    body("snapshotData").optional(),
    dateRangeValidator
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { name, startDate, endDate, color, position, snapshot, snapshotData } =
        req.body as UpdateTaskRequestBody & {
          snapshot?: boolean;
          snapshotData?: unknown;
        };

      const task = await prisma.task.findFirst({
        where: { id: req.params.id, project: { ownerId: req.user!.id, deletedAt: null } },
        include: { project: true }
      });

      if (!task) {
        next({ status: 404, message: "Task not found" });
        return;
      }

      const updated = await prisma.task.update({
        where: { id: task.id },
        data: {
          name: name ?? task.name,
          startDate: startDate ? parseDate(startDate) : task.startDate,
          endDate: endDate ? parseDate(endDate) : task.endDate,
          color: color ?? task.color,
          position: typeof position === "number" ? position : task.position
        }
      });

      await touchProject(task.projectId);
      await createVersionIfRequested(task.projectId, req.user!.id, Boolean(snapshot), snapshotData);

      const payload: TaskResponse = {
        task: {
          id: updated.id,
          projectId: updated.projectId,
          name: updated.name,
          startDate: updated.startDate.toISOString().slice(0, 10),
          endDate: updated.endDate.toISOString().slice(0, 10),
          color: updated.color,
          position: updated.position,
          createdAt: updated.createdAt.toISOString()
        }
      };

      res.json(payload);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/tasks/:id",
  requireAuth,
  [taskIdParam],
  validateRequest,
  async (req, res, next) => {
    try {
      const task = await prisma.task.findFirst({
        where: { id: req.params.id, project: { ownerId: req.user!.id, deletedAt: null } }
      });
      if (!task) {
        next({ status: 404, message: "Task not found" });
        return;
      }

      await prisma.task.delete({ where: { id: task.id } });
      await touchProject(task.projectId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/tasks/:id/position",
  requireAuth,
  [
    taskIdParam,
    body("position").isInt({ min: 0 }).toInt(),
    body("snapshot").optional().isBoolean().toBoolean(),
    body("snapshotData").optional()
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { position, snapshot, snapshotData } = req.body as {
        position: number;
        snapshot?: boolean;
        snapshotData?: unknown;
      };

      const task = await prisma.task.findFirst({
        where: { id: req.params.id, project: { ownerId: req.user!.id, deletedAt: null } }
      });
      if (!task) {
        next({ status: 404, message: "Task not found" });
        return;
      }

      const updated = await prisma.task.update({
        where: { id: task.id },
        data: { position }
      });

      await touchProject(task.projectId);
      await createVersionIfRequested(task.projectId, req.user!.id, Boolean(snapshot), snapshotData);

      const payload: TaskResponse = {
        task: {
          id: updated.id,
          projectId: updated.projectId,
          name: updated.name,
          startDate: updated.startDate.toISOString().slice(0, 10),
          endDate: updated.endDate.toISOString().slice(0, 10),
          color: updated.color,
          position: updated.position,
          createdAt: updated.createdAt.toISOString()
        }
      };

      res.json(payload);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/projects/:projectId/tasks/bulk",
  requireAuth,
  [
    projectIdParam,
    body("tasks").isArray({ min: 1 }).withMessage("tasks must be an array"),
    body("tasks").custom((tasks) => {
      for (const task of tasks as Array<Record<string, unknown>>) {
          if (task.startDate && task.endDate) {
            const start = parseDate(String(task.startDate));
            const end = parseDate(String(task.endDate));
            if (start >= end) {
              throw new Error("startDate must be before endDate");
            }
          }
      }
      return true;
    }),
    body("tasks.*.id").isUUID(),
    body("tasks.*.name").optional().isString().trim().isLength({ min: 1 }),
    body("tasks.*.startDate").optional().isISO8601(),
    body("tasks.*.endDate").optional().isISO8601(),
    body("tasks.*.color").optional().isString(),
    body("tasks.*.position").optional().isInt({ min: 0 }).toInt(),
    body("snapshot").optional().isBoolean().toBoolean(),
    body("snapshotData").optional()
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { tasks, snapshot, snapshotData } = req.body as BulkUpdateTasksRequestBody & {
        snapshot?: boolean;
        snapshotData?: unknown;
      };

      const project = await prisma.project.findFirst({
        where: { id: req.params.projectId, ownerId: req.user!.id, deletedAt: null }
      });
      if (!project) {
        next({ status: 404, message: "Project not found" });
        return;
      }

      const taskIds = tasks.map((task) => task.id);
      const existingTasks = await prisma.task.findMany({
        where: { id: { in: taskIds }, projectId: project.id }
      });
      if (existingTasks.length !== taskIds.length) {
        next({ status: 403, message: "One or more tasks are not accessible" });
        return;
      }

      const updatedTasks = await prisma.$transaction(
        tasks.map((taskUpdate) =>
          prisma.task.update({
            where: { id: taskUpdate.id },
            data: {
              name: taskUpdate.name,
              startDate: taskUpdate.startDate ? parseDate(taskUpdate.startDate) : undefined,
              endDate: taskUpdate.endDate ? parseDate(taskUpdate.endDate) : undefined,
              color: taskUpdate.color ?? undefined,
              position:
                typeof taskUpdate.position === "number" ? taskUpdate.position : undefined
            }
          })
        )
      );

      await touchProject(project.id);
      await createVersionIfRequested(project.id, req.user!.id, Boolean(snapshot), snapshotData);

      const payload: BulkUpdateTasksResponse = {
        tasks: updatedTasks.map((task) => ({
          id: task.id,
          projectId: task.projectId,
          name: task.name,
          startDate: task.startDate.toISOString().slice(0, 10),
          endDate: task.endDate.toISOString().slice(0, 10),
          color: task.color,
          position: task.position,
          createdAt: task.createdAt.toISOString()
        }))
      };

      res.json(payload);
    } catch (error) {
      next(error);
    }
  }
);

export default router;

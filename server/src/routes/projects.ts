import { Router } from "express";
import { body, param, query } from "express-validator";
import prisma from "../db";
import { requireAuth } from "../middleware/auth";
import { validateRequest } from "../middleware/validate-request";
import { createNextProjectVersion } from "../services/versioning";
import type {
  CreateProjectRequestBody,
  CreateProjectVersionRequestBody,
  ProjectListResponse,
  ProjectResponse,
  ProjectVersionResponse,
  ProjectVersionsResponse,
  UpdateProjectRequestBody
} from "@codex/shared";

const router = Router();

const paginationValidators = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("pageSize").optional().isInt({ min: 1, max: 100 }).toInt()
];

const projectIdParam = param("id").isUUID().withMessage("Invalid project id");

router.get(
  "/",
  requireAuth,
  paginationValidators,
  validateRequest,
  async (req, res, next) => {
    try {
      const page = (req.query.page as number | undefined) ?? 1;
      const pageSize = (req.query.pageSize as number | undefined) ?? 20;
      const skip = (page - 1) * pageSize;

      const [total, projects] = await Promise.all([
        prisma.project.count({
          where: { ownerId: req.user!.id, deletedAt: null }
        }),
        prisma.project.findMany({
          where: { ownerId: req.user!.id, deletedAt: null },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize
        })
      ]);

      const payload: ProjectListResponse = {
        data: projects.map((project) => ({
          id: project.id,
          name: project.name,
          ownerId: project.ownerId,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
          isPublic: project.isPublic,
          deletedAt: project.deletedAt ? project.deletedAt.toISOString() : null
        })),
        page,
        pageSize,
        total
      };

      res.json(payload);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  requireAuth,
  [
    body("name").isString().trim().isLength({ min: 1 }).withMessage("Name required"),
    body("isPublic").optional().isBoolean().toBoolean()
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { name, isPublic } = req.body as CreateProjectRequestBody;
      const project = await prisma.project.create({
        data: {
          name,
          isPublic: Boolean(isPublic),
          ownerId: req.user!.id
        }
      });

      const payload: ProjectResponse = {
        project: {
          id: project.id,
          name: project.name,
          ownerId: project.ownerId,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
          isPublic: project.isPublic,
          deletedAt: project.deletedAt ? project.deletedAt.toISOString() : null
        }
      };

      res.status(201).json(payload);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id",
  requireAuth,
  [projectIdParam],
  validateRequest,
  async (req, res, next) => {
    try {
      const project = await prisma.project.findFirst({
        where: { id: req.params.id, ownerId: req.user!.id, deletedAt: null },
        include: { tasks: { orderBy: { position: "asc" } } }
      });

      if (!project) {
        next({ status: 404, message: "Project not found" });
        return;
      }

      const payload: ProjectResponse = {
        project: {
          id: project.id,
          name: project.name,
          ownerId: project.ownerId,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
          isPublic: project.isPublic,
          deletedAt: project.deletedAt ? project.deletedAt.toISOString() : null
        },
        tasks: project.tasks.map((task) => ({
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

router.put(
  "/:id",
  requireAuth,
  [
    projectIdParam,
    body("name").optional().isString().trim().isLength({ min: 1 }),
    body("isPublic").optional().isBoolean().toBoolean()
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { name, isPublic } = req.body as UpdateProjectRequestBody;
      const project = await prisma.project.findFirst({
        where: { id: req.params.id, ownerId: req.user!.id, deletedAt: null }
      });

      if (!project) {
        next({ status: 404, message: "Project not found" });
        return;
      }

      const updated = await prisma.project.update({
        where: { id: project.id },
        data: {
          name: name ?? project.name,
          isPublic: typeof isPublic === "boolean" ? isPublic : project.isPublic
        }
      });

      const payload: ProjectResponse = {
        project: {
          id: updated.id,
          name: updated.name,
          ownerId: updated.ownerId,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
          isPublic: updated.isPublic,
          deletedAt: updated.deletedAt ? updated.deletedAt.toISOString() : null
        }
      };

      res.json(payload);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  requireAuth,
  [projectIdParam],
  validateRequest,
  async (req, res, next) => {
    try {
      const project = await prisma.project.findFirst({
        where: { id: req.params.id, ownerId: req.user!.id, deletedAt: null }
      });

      if (!project) {
        next({ status: 404, message: "Project not found" });
        return;
      }

      await prisma.project.update({
        where: { id: project.id },
        data: { deletedAt: new Date() }
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id/versions",
  requireAuth,
  [projectIdParam, ...paginationValidators],
  validateRequest,
  async (req, res, next) => {
    try {
      const page = (req.query.page as number | undefined) ?? 1;
      const pageSize = (req.query.pageSize as number | undefined) ?? 20;
      const skip = (page - 1) * pageSize;

      const project = await prisma.project.findFirst({
        where: { id: req.params.id, ownerId: req.user!.id, deletedAt: null }
      });

      if (!project) {
        next({ status: 404, message: "Project not found" });
        return;
      }

      const [total, versions] = await Promise.all([
        prisma.projectVersion.count({
          where: { projectId: project.id }
        }),
        prisma.projectVersion.findMany({
          where: { projectId: project.id },
          orderBy: { versionNumber: "desc" },
          skip,
          take: pageSize
        })
      ]);

      const payload: ProjectVersionsResponse = {
        data: versions.map((version) => ({
          id: version.id,
          projectId: version.projectId,
          versionNumber: version.versionNumber,
          snapshotData: version.snapshotData,
          createdAt: version.createdAt.toISOString(),
          createdBy: version.createdBy
        })),
        page,
        pageSize,
        total
      };

      res.json(payload);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:id/versions",
  requireAuth,
  [
    projectIdParam,
    body("snapshotData").exists().withMessage("snapshotData is required")
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const project = await prisma.project.findFirst({
        where: { id: req.params.id, ownerId: req.user!.id, deletedAt: null }
      });

      if (!project) {
        next({ status: 404, message: "Project not found" });
        return;
      }

      const { snapshotData } = req.body as CreateProjectVersionRequestBody;
      const version = await createNextProjectVersion({
        projectId: project.id,
        userId: req.user!.id,
        snapshotData
      });

      const payload: ProjectVersionResponse = {
        version: {
          id: version.id,
          projectId: version.projectId,
          versionNumber: version.versionNumber,
          snapshotData: version.snapshotData,
          createdAt: version.createdAt.toISOString(),
          createdBy: version.createdBy
        }
      };

      res.status(201).json(payload);
    } catch (error) {
      next(error);
    }
  }
);

export default router;

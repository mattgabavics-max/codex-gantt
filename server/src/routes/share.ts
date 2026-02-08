import { Router } from "express";
import { body, param } from "express-validator";
import crypto from "crypto";
import prisma from "../db";
import { requireAuth } from "../middleware/auth";
import { requireShareLink } from "../middleware/share-link";
import { validateRequest } from "../middleware/validate-request";
import type {
  CreateShareLinkRequestBody,
  ShareLinkResponse,
  ShareProjectResponse
} from "@codex/shared";

const router = Router();

const projectIdParam = param("id").isUUID().withMessage("Invalid project id");
const shareIdParam = param("linkId").isUUID().withMessage("Invalid share link id");

router.post(
  "/projects/:id/share",
  requireAuth,
  [
    projectIdParam,
    body("accessType")
      .isIn(["readonly", "editable"])
      .withMessage("accessType must be readonly or editable"),
    body("expiresIn").optional().isInt({ min: 60 }).toInt()
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { accessType, expiresIn } = req.body as CreateShareLinkRequestBody;
      const project = await prisma.project.findFirst({
        where: { id: req.params.id, ownerId: req.user!.id, deletedAt: null }
      });

      if (!project) {
        next({ status: 404, message: "Project not found" });
        return;
      }

      const token = crypto.randomBytes(24).toString("hex");
      const expiresAt =
        typeof expiresIn === "number" ? new Date(Date.now() + expiresIn * 1000) : null;

      const link = await prisma.shareLink.create({
        data: {
          projectId: project.id,
          token,
          accessType,
          expiresAt
        }
      });

      const payload: ShareLinkResponse = {
        link: {
          id: link.id,
          projectId: link.projectId,
          token: link.token,
          accessType: link.accessType,
          createdAt: link.createdAt.toISOString(),
          expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null
        }
      };

      res.status(201).json(payload);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/share/:token",
  [param("token").isString().isLength({ min: 16 })],
  validateRequest,
  requireShareLink,
  async (req, res, next) => {
    try {
      const share = req.share!;
      const project = await prisma.project.findFirst({
        where: { id: share.projectId, deletedAt: null },
        include: { tasks: { orderBy: { position: "asc" } } }
      });

      if (!project) {
        next({ status: 404, message: "Project not found" });
        return;
      }

      const payload: ShareProjectResponse = {
        accessType: share.accessType,
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

router.delete(
  "/projects/:id/share/:linkId",
  requireAuth,
  [projectIdParam, shareIdParam],
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

      const link = await prisma.shareLink.findFirst({
        where: { id: req.params.linkId, projectId: project.id }
      });

      if (!link) {
        next({ status: 404, message: "Share link not found" });
        return;
      }

      await prisma.shareLink.delete({ where: { id: link.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;

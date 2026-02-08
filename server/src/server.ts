import express from "express";
import cors from "cors";
import prisma from "./db";
import type { Task } from "@codex/shared";
import authRouter from "./routes/auth";
import projectsRouter from "./routes/projects";
import tasksRouter from "./routes/tasks";
import shareRouter from "./routes/share";
import { requireAuth } from "./middleware/auth";
import { errorHandler } from "./middleware/error-handler";
import { initSentry } from "./monitoring/sentry";

/**
 * Configure and return the Express application.
 */
export function createApp() {
  const app = express();

  initSentry();

  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0) {
          callback(null, true);
          return;
        }
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Not allowed by CORS"));
      }
    })
  );
  app.use(express.json());

  app.use("/api/auth", authRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api", tasksRouter);
  app.use("/api", shareRouter);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/tasks", requireAuth, async (req, res, next) => {
    try {
      const tasks = await prisma.task.findMany({
        where: { project: { ownerId: req.user!.id, deletedAt: null } },
        orderBy: { startDate: "asc" }
      });
      const payload: Task[] = tasks.map((task) => ({
        id: task.id,
        name: task.name,
        projectId: task.projectId,
        startDate: task.startDate.toISOString().slice(0, 10),
        endDate: task.endDate.toISOString().slice(0, 10),
        color: task.color,
        position: task.position,
        createdAt: task.createdAt.toISOString()
      }));

      res.json(payload);
    } catch (error) {
      next(error);
    }
  });

  app.use(errorHandler);

  return app;
}

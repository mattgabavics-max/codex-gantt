import express from "express";
import cors from "cors";
import prisma from "./db";
import type { Task } from "@codex/shared";
import authRouter from "./routes/auth";
import projectsRouter from "./routes/projects";
import tasksRouter from "./routes/tasks";
import shareRouter from "./routes/share";
import { errorHandler } from "./middleware/error-handler";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/auth", authRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api", tasksRouter);
  app.use("/api", shareRouter);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/tasks", async (_req, res, next) => {
    try {
      const tasks = await prisma.task.findMany({
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

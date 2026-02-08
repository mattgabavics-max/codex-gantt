import type { NextFunction, Request, Response } from "express";
import prisma from "../db";

export type ShareContext = {
  shareLinkId: string;
  projectId: string;
  accessType: "readonly" | "editable";
};

export type ShareRequest = Request & {
  share?: ShareContext;
};

export async function requireShareLink(
  req: ShareRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const token = req.params.token;
    if (!token) {
      next({ status: 400, message: "Missing share token" });
      return;
    }

    const link = await prisma.shareLink.findUnique({ where: { token } });
    if (!link) {
      next({ status: 404, message: "Share link not found" });
      return;
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      next({ status: 410, message: "Share link expired" });
      return;
    }

    req.share = {
      shareLinkId: link.id,
      projectId: link.projectId,
      accessType: link.accessType
    };

    next();
  } catch (error) {
    next(error);
  }
}

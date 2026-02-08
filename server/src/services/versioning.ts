import { Prisma } from "@prisma/client";
import prisma from "../db";

type CreateVersionInput = {
  projectId: string;
  userId: string;
  snapshotData: unknown;
};

/**
 * Create the next project version with retry on unique constraint conflicts.
 */
export async function createNextProjectVersion({
  projectId,
  userId,
  snapshotData
}: CreateVersionInput) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const latest = await prisma.projectVersion.findFirst({
      where: { projectId },
      orderBy: { versionNumber: "desc" }
    });

    try {
      return await prisma.projectVersion.create({
        data: {
          projectId,
          versionNumber: (latest?.versionNumber ?? 0) + 1,
          snapshotData,
          createdBy: userId
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Failed to create project version after retries");
}

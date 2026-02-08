import { execSync } from "node:child_process";

export default async function globalSetup() {
  try {
    execSync("pnpm --filter server prisma:reset", { stdio: "inherit" });
    execSync("pnpm --filter server prisma:seed:test", { stdio: "inherit" });
  } catch (error) {
    console.error("Failed to reset database for E2E tests.");
    throw error;
  }
}

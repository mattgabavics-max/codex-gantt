import { execSync } from "node:child_process";

export default async function globalSetup() {
  try {
    if (process.env.E2E_SKIP_DB_RESET === "1") {
      return;
    }
    execSync("pnpm --filter server prisma:reset", { stdio: "inherit" });
    execSync("pnpm --filter server prisma:seed:test", { stdio: "inherit" });
  } catch (error) {
    console.error("Failed to reset database for E2E tests.");
    throw error;
  }
}

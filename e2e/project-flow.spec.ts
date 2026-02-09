import { expect, test } from "@playwright/test";
import {
  createProject,
  createShareLink,
  createTask,
  registerUser,
  setAuthToken
} from "./fixtures";

test("shows tasks after authenticated seed", async ({ page, request }) => {
  const email = `qa+${Date.now()}@example.com`;
  const token = await registerUser(request, email, "supersecret");
  const projectId = await createProject(request, token, "QA Project");

  await createTask(request, token, projectId, {
    name: "Build milestones",
    startDate: "2026-02-10",
    endDate: "2026-02-12",
    position: 0
  });

  await setAuthToken(page, token);
  await page.goto("/");

  await expect(page.getByText("Build milestones")).toBeVisible();
});

test("share link renders shared view", async ({ page, request }) => {
  const email = `qa+${Date.now()}@example.com`;
  const token = await registerUser(request, email, "supersecret");
  const projectId = await createProject(request, token, "Shared QA Project");
  const shareToken = await createShareLink(request, token, projectId);

  await page.goto(`/share/${shareToken}`);
  await expect(page.getByText(/viewing shared project/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Shared QA Project" })).toBeVisible();
});

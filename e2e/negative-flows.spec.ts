import { expect, test } from "@playwright/test";
import { createProject, createShareLink, createTask, registerUser, setAuthToken } from "./fixtures";

test("invalid share link shows error state", async ({ page }) => {
  await page.goto("/share/invalid-token-12345");
  await expect(page.getByText(/invalid or expired share link/i)).toBeVisible();
});

test("readonly share link does not expose edit handles", async ({ page, request }) => {
  const email = `qa+${Date.now()}@example.com`;
  const token = await registerUser(request, email, "supersecret");
  const projectId = await createProject(request, token, "Readonly Project");

  await createTask(request, token, projectId, {
    name: "Readonly task",
    startDate: "2026-02-10",
    endDate: "2026-02-12",
    position: 0
  });

  const shareToken = await createShareLink(request, token, projectId);
  await page.goto(`/share/${shareToken}`);

  await expect(page.getByText("Readonly task")).toBeVisible();
  await expect(page.getByLabel("Resize task start")).toHaveCount(0);
  await expect(page.getByLabel("Resize task end")).toHaveCount(0);
});

test("unauthorized API access fails", async ({ request }) => {
  const apiBase = process.env.API_BASE_URL ?? "http://localhost:3001";
  const res = await request.get(`${apiBase}/api/projects`);
  expect(res.status()).toBe(401);
});

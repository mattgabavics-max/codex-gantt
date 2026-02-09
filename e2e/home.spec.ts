import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Codex Gantt System")).toBeVisible();
  await expect(page.getByRole("heading", { name: /plan, track, and ship/i })).toBeVisible();
});

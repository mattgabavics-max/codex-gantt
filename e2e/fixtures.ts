import { expect, type APIRequestContext, type Page } from "@playwright/test";

const apiBase = process.env.API_BASE_URL ?? "http://localhost:3001";

export async function registerUser(request: APIRequestContext, email: string, password: string) {
  const res = await request.post(`${apiBase}/api/auth/register`, {
    data: { email, password }
  });
  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as { token: string };
  return body.token;
}

export async function createProject(request: APIRequestContext, token: string, name: string) {
  const res = await request.post(`${apiBase}/api/projects`, {
    data: { name, isPublic: false },
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as { project: { id: string } };
  return body.project.id;
}

export async function createTask(
  request: APIRequestContext,
  token: string,
  projectId: string,
  payload: { name: string; startDate: string; endDate: string; position: number }
) {
  const res = await request.post(`${apiBase}/api/projects/${projectId}/tasks`, {
    data: payload,
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(res.ok()).toBeTruthy();
}

export async function createShareLink(
  request: APIRequestContext,
  token: string,
  projectId: string
) {
  const res = await request.post(`${apiBase}/api/projects/${projectId}/share`, {
    data: { accessType: "readonly" },
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as { link: { token: string } };
  return body.link.token;
}

export async function setAuthToken(page: Page, token: string) {
  await page.addInitScript((value) => {
    localStorage.setItem("codex_auth_token", value);
  }, token);
}

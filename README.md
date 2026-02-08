# Codex Gantt Chart System

This monorepo contains a React + TypeScript frontend, an Express + TypeScript backend, and a shared types package.

## Prerequisites
- Node.js 18+
- PostgreSQL 14+

## Setup
1. Install dependencies from the repo root.
   - `npm install`
2. Configure environment variables.
   - Copy `server/.env.example` to `server/.env` and update `DATABASE_URL`.
   - Copy `client/.env.example` to `client/.env` if your API is not on `http://localhost:3001`.
3. Initialize Prisma.
   - `npm --workspace server run prisma:generate`
   - `npm --workspace server run prisma:migrate -- --name init`
   - `npm --workspace server run prisma:seed`
4. Run the stack.
   - `npm run dev`

## Useful scripts
- `npm run dev` runs client and server concurrently.
- `npm --workspace client run build` builds the frontend.
- `npm --workspace server run build` builds the backend.
- `npm --workspace server run prisma:studio` opens Prisma Studio.
- `npm --workspace server run prisma:seed` seeds demo data.

## Authentication
- `POST /api/auth/register` with `{ "email": "...", "password": "..." }` returns `{ "token": "..." }`.
- `POST /api/auth/login` with `{ "email": "...", "password": "..." }` returns `{ "token": "..." }`.

## Tests
- `npm --workspace server run test` runs API tests.
- `npm --workspace client run test` runs frontend tests.
- `npm run test` runs the full suite.
- `npm run test:coverage` runs unit/integration tests with coverage.
- `npm run test:e2e` runs Playwright end-to-end tests.
- `npm run test:ci` runs coverage and E2E tests (CI parity).
- `npm run test:db:reset` resets the test database.
- `npm run test:db:seed` seeds deterministic test data.
- `npm run test:mutation` runs Stryker mutation tests.

## Deployment

### Frontend (Vercel)
1. Import the repo in Vercel.
2. Configure:
   - Build Command: `pnpm --filter client install --frozen-lockfile=false && pnpm --filter client build`
   - Output Directory: `client/dist`
3. Environment variables:
- `VITE_API_BASE_URL`
   - `VITE_SENTRY_DSN` (optional)
4. SPA routing is handled via `vercel.json`.

### Backend (Docker on Render/Railway)
1. Build using `server/Dockerfile`.
2. Required environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ALLOWED_ORIGINS`
   - `SENTRY_DSN` (optional)
3. Migration strategy:
   - Container starts with `prisma generate` and `prisma migrate deploy`.
4. Health check:
   - `GET /health`

### CI/CD
GitHub Actions workflows:
- `.github/workflows/ci.yml` runs tests and deploys on `main` (production).
- `.github/workflows/deploy-staging.yml` deploys on `develop` (staging).

Secrets required:
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `RENDER_DEPLOY_HOOK_URL`, `RENDER_STAGING_HOOK_URL`

### Monitoring
- Client Sentry: `client/src/monitoring/sentry.ts`
- Server Sentry: `server/src/monitoring/sentry.ts`
- Set `VITE_SENTRY_DSN` and `SENTRY_DSN` to enable.

## Documentation
- `USER_MANUAL.md`
- `SUPPORT_MANUAL.md`
- `TECHNICAL_DESIGN.md`
- `API_REFERENCE.md`
- `ONBOARDING.md`
- `RUNBOOKS.md`
- `ADR/README.md`

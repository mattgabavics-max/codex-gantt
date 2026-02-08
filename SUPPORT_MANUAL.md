# Support Manual

## Purpose
This document provides operational guidance for developers, support engineers, and on-call responders.

## Services
- **Client**: React + Vite app, default `http://localhost:5173`
- **Server**: Express API, default `http://localhost:3001`
- **Database**: PostgreSQL

## Key Endpoints
- `GET /health` — Service health
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects/:id/tasks`
- `PATCH /api/projects/:id/tasks/bulk`
- `POST /api/projects/:id/share`
- `GET /api/share/:token`

## Environment Variables
### Server
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — JWT signing key
- `ALLOWED_ORIGINS` — CORS allowlist
- `PORT` — HTTP port
- `SENTRY_DSN` (optional)

### Client
- `VITE_API_BASE_URL` — API base URL (e.g., `http://localhost:3001`)
- `VITE_SENTRY_DSN` (optional)

## Common Issues
### Prisma client missing
**Symptoms:** `Cannot find module '.prisma/client/default'`  
**Fix:** run `pnpm --filter server prisma:generate`

### JWT secret missing
**Symptoms:** `JWT_SECRET is not set`  
**Fix:** ensure `server/.env` contains `JWT_SECRET`

### 401 errors
**Symptoms:** API calls fail with 401  
**Fix:** re-authenticate; confirm `Authorization: Bearer <token>`

### CORS errors
**Symptoms:** browser CORS blocked  
**Fix:** set `ALLOWED_ORIGINS` to include the client URL

## Operational Runbook
### Local Start
1. `pnpm install`
2. `pnpm --filter server prisma:migrate`
3. `pnpm dev`

### Production Deployment
- Frontend: Vercel
- Backend: Render/Railway via Docker
- Run migrations: `pnpm --filter server prisma:deploy`

## Monitoring
### Sentry
Ensure `SENTRY_DSN` (server) and `VITE_SENTRY_DSN` (client) are configured.

### Logs
Server logs to stdout; collect with platform logging.

## Backups
Use PostgreSQL managed backups or scheduled `pg_dump`.


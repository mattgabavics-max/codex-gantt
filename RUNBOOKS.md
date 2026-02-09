# Runbooks

## Service Health
**Check**
- `GET /health` should return `{ "status": "ok" }`.

**If unhealthy**
1. Check logs for startup errors.
2. Verify `DATABASE_URL` and `JWT_SECRET`.
3. Ensure Prisma client generated (`pnpm --filter server prisma:generate`).

## Database Migration Failure
**Symptoms**
- Server fails on boot with migration errors.

**Resolution**
1. `pnpm --filter server prisma:deploy`
2. If needed, inspect migrations in `server/prisma/migrations`.
3. Roll back only with DBA approval.

## Authentication Failures (401/403)
**Symptoms**
- 401 errors across endpoints.

**Resolution**
1. Verify `JWT_SECRET` matches deployed environment.
2. Re-authenticate to get a fresh token.

## CORS Errors
**Symptoms**
- Browser blocks API calls with CORS errors.

**Resolution**
1. Set `ALLOWED_ORIGINS` to include the frontend URL.
2. Restart server.

## Share Link Invalid/Expired
**Symptoms**
- `/api/share/:token` returns 404 or 410.

**Resolution**
1. Verify link exists in DB.
2. If expired, generate a new link.

## High Latency in Task Updates
**Symptoms**
- Dragging tasks feels delayed.

**Resolution**
1. Check server logs for slow queries.
2. Verify indexes exist for `tasks_project_id_idx` and `tasks_project_id_position_idx`.
3. Confirm client optimistic updates are enabled.

## Sentry Not Capturing Errors
**Symptoms**
- No events in Sentry.

**Resolution**
1. Confirm `SENTRY_DSN` and `VITE_SENTRY_DSN` are set.
2. Restart services.


# Deployment Infrastructure PR Summary

## What Changed
- Added Vercel configuration and frontend env templates.
- Added server Dockerfile, health check, and production CORS configuration.
- Added CI workflows for tests and deploys (staging/production).
- Integrated Sentry monitoring on client and server.
- Updated README with deployment steps and environment setup.

## How To Test
- `pnpm --filter client test`
- `pnpm --filter server test`

## Deployment Notes
- Frontend (Vercel): set `VITE_API_BASE_URL`, `VITE_SENTRY_DSN`, `VITE_APP_ENV`
- Backend (Render/Railway): set `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS`, `SENTRY_DSN`, `PORT`
- Run migrations: `pnpm --filter server prisma:deploy`

# Onboarding Guide

## Goal
Get a new developer fully productive in under one hour.

## Prerequisites
- Node.js 18+
- pnpm
- PostgreSQL 14+
- GitHub access to the repository

## Quick Start
1. Clone the repo.
2. Install dependencies:
   - `pnpm install`
3. Configure env:
   - Copy `server/.env.example` to `server/.env`
   - Copy `client/.env.example` to `client/.env`
4. Initialize database:
   - `pnpm --filter server prisma:migrate`
   - `pnpm --filter server prisma:seed`
5. Run dev servers:
   - `pnpm dev`

## Project Structure
- `client/` — React app
- `server/` — Express API
- `shared/` — Shared types
- Docs: `USER_MANUAL.md`, `SUPPORT_MANUAL.md`, `TECHNICAL_DESIGN.md`, `API_REFERENCE.md`

## Key Concepts
- **Shared types** are exported from `shared/` and used by client + server.
- **Projects** are soft-deleted (`deletedAt`).
- **Version history** uses JSON snapshots.
- **Dates** are treated in UTC.

## Common Tasks
- Run client tests: `pnpm --filter client test`
- Run server tests: `pnpm --filter server test`
- Run all tests: `pnpm test`
- Open Prisma Studio: `pnpm --filter server prisma:studio`

## Troubleshooting
### Prisma client missing
Run: `pnpm --filter server prisma:generate`

### JWT secret missing
Ensure `server/.env` includes `JWT_SECRET`.

### CORS errors
Set `ALLOWED_ORIGINS` to include the client URL.


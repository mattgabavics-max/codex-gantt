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
   - Copy `client/.env.example` to `client/.env` if your API is not on `http://localhost:4000`.
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

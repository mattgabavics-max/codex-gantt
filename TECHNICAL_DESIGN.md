# Technical Design Document

## Scope
This document describes the architecture, data model, API surface, and key design decisions for the Codex Gantt Chart System.

## Architecture
### Monorepo Layout
- `client/` — React + Vite frontend
- `server/` — Express + Prisma backend
- `shared/` — Shared types for API contracts

### Frontend
- React + TypeScript + Tailwind
- React Query for server state
- Context for auth and project state
- Axios client with retry and auth interceptors

### Backend
- Express + TypeScript
- Prisma ORM with PostgreSQL
- JWT authentication
- Middleware for auth, validation, rate limiting, and share links

## Data Model (Prisma)
Entities:
- `User` (id, email, passwordHash, createdAt)
- `Project` (id, name, ownerId, createdAt, updatedAt, isPublic, deletedAt)
- `Task` (id, projectId, name, startDate, endDate, color, position, createdAt)
- `ProjectVersion` (id, projectId, versionNumber, snapshotData, createdAt, createdBy)
- `ShareLink` (id, projectId, token, accessType, createdAt, expiresAt)

Indexes:
- `projects_owner_id_idx`
- `tasks_project_id_idx`, `tasks_project_id_position_idx`
- `project_versions_project_id_idx`, `project_versions_project_id_version_number_key`
- `share_links_project_id_idx`, `share_links_token_idx`

## API Design
### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`

### Projects
- `GET /api/projects` (pagination)
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id` (soft delete)
- `GET /api/projects/:id/versions` (pagination)
- `POST /api/projects/:id/versions`

### Tasks
- `POST /api/projects/:projectId/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/position`
- `PATCH /api/projects/:projectId/tasks/bulk`

### Share Links
- `POST /api/projects/:id/share`
- `GET /api/share/:token`
- `DELETE /api/projects/:id/share/:linkId`

## Key Design Decisions
1. **Shared types** between server and client to prevent API drift.
2. **Soft delete** for projects to allow recovery and auditability.
3. **Version history** via snapshots; snapshots are JSON to allow schema evolution.
4. **UTC date handling** for consistent timeline rendering across time zones.
5. **Optimistic updates** for task drag/resize and bulk updates.

## Security
- Passwords hashed with bcrypt.
- JWT auth for protected endpoints.
- CORS allowlist via `ALLOWED_ORIGINS`.
- Rate limiting on auth endpoints.

## Performance
- Pagination for list endpoints.
- Indexes on common filters.
- Optimistic updates to reduce latency.

## Observability
Sentry integration on client and server (optional).

## Testing
- Vitest for both frontend and backend.
- Integration tests for auth, tasks, and share links.


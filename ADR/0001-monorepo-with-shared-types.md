# ADR 0001: Monorepo With Shared Types

## Status
Accepted

## Context
The system includes a React frontend and an Express backend. API contracts must remain consistent.

## Decision
Use a monorepo with `client/`, `server/`, and `shared/`. Shared TypeScript types live in `shared/` and are imported by both client and server.

## Consequences
### Positive
- Eliminates API contract drift.
- Reduces duplication and improves developer experience.

### Negative
- Requires workspace tooling (pnpm workspaces).


# ADR 0003: React Query + Context

## Status
Accepted

## Context
The frontend needs server-state caching and auth/project session management.

## Decision
Use React Query for server data and Context for auth and project state.

## Consequences
### Positive
- Cached, invalidated, and optimistic updates for API data.
- Predictable auth and project state behavior.

### Negative
- Requires clear separation between server state and UI state.


# ADR 0002: PostgreSQL + Prisma

## Status
Accepted

## Context
The application requires a relational store with migrations and type safety.

## Decision
Use PostgreSQL as the primary datastore and Prisma as the ORM and migration tool.

## Consequences
### Positive
- Strong relational integrity and indexing.
- Type-safe queries and migrations.

### Negative
- Requires Prisma client generation step.


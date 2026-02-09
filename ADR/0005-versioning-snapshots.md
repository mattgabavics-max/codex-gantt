# ADR 0005: Versioning via Snapshots

## Status
Accepted

## Context
Users need version history and rollback for projects with tasks.

## Decision
Store version snapshots in JSON, incremented per project. Snapshot creation is retried on unique version conflicts.

## Consequences
### Positive
- Flexible schema for future task fields.
- Simplified restore logic.

### Negative
- Larger storage footprint over time.


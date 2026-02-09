# ADR 0004: UTC Date Handling

## Status
Accepted

## Context
Task timelines must render consistently across time zones.

## Decision
Store and render all task dates in UTC. Client utilities use UTC math for layout and labels.

## Consequences
### Positive
- Prevents off-by-one-day errors for users in different locales.

### Negative
- Requires careful conversion at input/output boundaries.


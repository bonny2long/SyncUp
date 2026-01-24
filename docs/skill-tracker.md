# Skill Tracker — Analytics & Visualization (D-Layer)

The **Skill Tracker** provides a narrative-driven view of how a user’s skills evolve over time based on real activity across projects, updates, and mentorship.

This system is intentionally **read-only**, **derived**, and **analytics-first**.  
There is no manual skill rating or subjective input in this layer.

---

## Architecture Overview (A → B → C → D)

### A — Raw Activity

User actions across the platform:

- Project creation and updates
- Progress reflections
- Mentorship interactions

### B — Signals

Each activity emits **skill signals** with:

- skill reference
- source type (project, update, mentorship)
- weight
- timestamp

### C — Aggregation

Signals are aggregated by:

- skill
- week (`year_week`)
- source type

Week-over-week deltas are computed to capture **momentum**, not just volume.

### D — Analytics API (This Layer)

Provides **frontend-safe**, opinionated endpoints that power all Skill Tracker UI components.

---

## Canonical API Endpoint

### `GET /api/skills/user/:id/summary`

This endpoint is the **single source of truth** for the Skill Tracker snapshot and narratives.

### Response Contract

```json
{
  "skills": [
    {
      "skill_id": 1,
      "skill_name": "React",
      "signal_count": 6,
      "total_weight": 11.45,
      "trend_readiness": "growing"
    }
  ]
}
```

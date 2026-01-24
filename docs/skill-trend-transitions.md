# Skill Trend Transitions

Skill trend transitions measure **short-term momentum** using rolling time windows.

## Window Definition

- Current window: last **7 days**
- Previous window: **7–14 days ago**

These windows align with:

- sprint cycles
- weekly updates
- internship project cadence

## Transition Calculation

For each skill:

### Direction Rules

| Delta | Direction |
| ----- | --------- |
| > 0   | up        |
| = 0   | flat      |
| < 0   | down      |

## Why This Matters

- Captures _movement_, not totals
- Avoids long-term noise (30+ days)
- Enables UI signals:
  - arrows
  - glow
  - bubble emphasis
  - “gaining momentum” labels

## Design Principles

- Read-side only
- Append-only signals
- No schema changes
- Backward compatible API

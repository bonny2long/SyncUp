# Skill Tracker

**Route:** `/skills`
**Access:** Interns only (non-admin)
**Sidebar ID:** `skills`

---

## Overview

Skill Tracker is a read-only, evidence-based analytics dashboard that visualizes professional skill growth. Unlike traditional systems that rely on self-ratings or gamified scores, Skill Tracker derives growth signals directly from real work activities across projects, progress updates, and verified mentorship sessions.

The system is designed to be:
- **Honest:** No manual skill rating or subjective input
- **Auditable:** All signals traceable to source activities
- **Grounded:** Growth tied to real behavior, not perception.

---

## Architecture: A → B → C → D Pipeline

Skill Tracker is the **D-layer** (Analytics) of the evidence-based signal pipeline:

- **A (Project Context):** Skills explicitly defined in `project_skills`
- **B (Mentorship):** Only explicit skill verification during sessions generates signals
- **C (Progress Updates):** Updates emit signals for all project skills
- **D (Analytics - This Layer):** All charts read exclusively from `user_skill_signals` (append-only, single source of truth)

See [architecture.md](../architecture.md) for the full pipeline specification.

---

## Dashboard Structure

The dashboard is organized as a story-driven narrative with three steps:

### Step 1: "Where you stand" - Skill Snapshot
- **Skill Snapshot List:** Top skills ranked by current strength and momentum
- **Trend Classifications:**
  - **Established** (violet): 15+ signals
  - **Growing** (emerald): 5-14 signals
  - **Emerging** (sky blue): Less than 5 signals
  - **Steady** (slate): No recent change
- **Trend Readiness:** Each skill shows: growing, steady, or declining

### Step 2: "Where you're heading" - Skill Distribution
- **Skill Distribution Cards:** Visual representation of effort distribution across skills
- **Auto-insight:** Highlights either the leading skill or evenly distributed activity
- **Percentages:** Shows what portion of total signals each skill represents

### Step 3: "What's driving it" - Activity Sources
- **Stacked Bar Chart:** Weekly activity breakdown by source:
  - **Projects** (weight = 1)
  - **Progress Updates** (weight = 2)
  - **Mentorship** (weight = 3)
- **Source Attribution:** Explains why momentum changed in a given week

---

## Skill Signals System

### Signal Types and Weights
| Source Type | Signal Type | Weight | Description |
|-------------|-------------|--------|-------------|
| project | joined | 1 | Joining a project |
| update | update | 2 | Posting a progress update |
| mentorship | validated | 3 | Completing a technical mentorship session |

### Signal Sources
Skills grow through these activities:
- **Joining projects** with defined skills
- **Posting progress updates** tied to project skills
- **Completing mentorship sessions** with explicit skill verification

### Trend Transitions (Momentum)
- **Direction Rules** (7-day windows):
  - Delta > 0: **up** (accelerating)
  - Delta = 0: **flat** (steady)
  - Delta < 0: **down** (slowing)
- **Velocity States:** Accelerating, Gaining, Steady, Slowing
- **Window Definition:**
  - Current window: last 7 days
  - Previous window: 7-14 days ago

---

## Visualization Components

| Component | File | Purpose |
|-----------|------|---------|
| **SkillTrackerSection** | `client/src/components/SkillTracker/SkillTrackerSection.jsx` | Main layout with story-driven sections |
| **SkillSnapshotList** | `client/src/components/SkillTracker/SkillSnapshotList.jsx` | Top skills ranked by strength/momentum |
| **SkillSignalsPanel** | `client/src/components/SkillTracker/SkillSignalsPanel.jsx` | Signal verification with direction arrows and velocity |
| **SkillMomentumChart** | `client/src/components/SkillTracker/SkillMomentumChart.jsx` | Area chart of weekly skill momentum (AG Charts) |
| **SkillDistributionCards** | `client/src/components/SkillTracker/SkillDistributionCards.jsx` | Skill distribution as cards with percentages |
| **SkillActivityChart** | `client/src/components/SkillTracker/SkillActivityChart.jsx` | Stacked bar chart showing activity by source type |
| **useChartTheme** | `client/src/components/SkillTracker/useChartTheme.js` | Theme hook for chart colors (dark/light mode) |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/skills` | List all available skills |
| GET | `/api/skills/user/:id/recent` | Get 3 most recent skills for quick-add |
| GET | `/api/skills/user/:id/momentum` | Weekly skill momentum data |
| GET | `/api/skills/user/:id/distribution` | Skill distribution (signal counts) |
| GET | `/api/skills/user/:id/activity` | Activity by source type and week |
| GET | `/api/skills/user/:id/summary` | **Canonical endpoint** - Complete summary with trends, transitions, velocity |
| GET | `/api/skills/user/:id/signals` | Get user's signals with validation counts |
| GET | `/api/skills/user/:id/validations` | Get user's received validations |
| GET | `/api/skills/user/:id/has-validated` | Check which signals user validated |
| POST | `/api/skills/:signalId/validate` | Add upvote or mentor endorsement |
| DELETE | `/api/skills/:signalId/validate` | Remove validation |
| GET | `/api/skills/verifications/pending` | Get pending skill verifications |
| POST | `/api/skills/verifications/:id/verify` | Verify a skill claim |
| POST | `/api/skills/verifications/:id/challenge` | Challenge a skill claim |

### Canonical Response Contract (GET /api/skills/user/:id/summary)
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

---

## Validation System

### Peer Validations
- Team members can **upvote** skill signals
- **Mentor endorsements:** Only users with mentor role can endorse
- Validations attach to existing signals (no new signals created)
- Notifications sent to skill owners when validated

### Skill Verifications
- **Team member skill claims:** Peers can verify or challenge skill claims
- **Verification workflow:** Prevents unverified skill inflation
- **Pending verifications:** Viewable at `/api/skills/verifications/pending`

---

## Anti-Gaming Measures

Implemented in `skillSignalService.js`:

1. **Deduplication:** Only 1 signal per user+skill+source combination (prevents point farming)
2. **Mentorship restrictions:** Only technical focuses (`project_support`, `technical_guidance`) generate signals
3. **Verification workflow:** Team projects require peer verification; solo projects auto-verify
4. **Append-only design:** No direct writes to `user_skill_signals` except via `emitSkillSignals()`
5. **Uniqueness constraints:** Database prevents duplicate signals

---

## File Locations

### Frontend
| File | Path |
|------|------|
| Main Page | `client/src/pages/SkillTracker/SkillTracker.jsx` |
| Components | `client/src/components/SkillTracker/` (7 files) |
| API Utilities | `client/src/utils/api.js` |

### Backend
| File | Path |
|------|------|
| Controller | `server/src/controllers/skillsController.js` |
| Routes | `server/src/routes/skillsRoutes.js` |
| Signal Service | `server/src/services/skillSignalService.js` |
| Badge Service | `server/src/services/badgeService.js` |

---

## Design Principles

- **No manual skill scoring**
- **No subjective ratings**
- **No gamification**
- **Growth is inferred from real actions**
- **Read-side only:** No manual input in the analytics layer
- **Append-only signals:** Single source of truth in `user_skill_signals`
- **Transparency:** Showing signal sources and weights
- **Trend awareness:** Momentum and velocity tracking
- **Collaborative validation:** Peer verification workflow

---

## Mentorship and Skill Growth Philosophy

SyncUp intentionally separates mentorship from projects:
- **Mentorship:** Supports guidance, reflection, career clarity, leadership growth
- **Projects:** Support execution, collaboration, learning by doing
- **Intersection:** The two systems may intersect, but neither owns the other.

Mentorship sessions are created with explicit intent (project support, technical guidance, career guidance, life/leadership, alumni advice). Only technical/project-focused mentorship contributes to skills, and only when skills are explicitly selected during session completion.

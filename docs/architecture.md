# Skill Signal Pipeline (A -> B -> C -> D)

Architecture and Guardrails for Evidence-Based Skill Tracking

## Purpose

The Skill Signal Pipeline is the backbone of SyncUp's evidence-based skill tracking system. It ensures that all skill data displayed in the Skill Tracker (sidebar tab) is derived from real, verifiable activities across the platform.

The system:
- Does not ask users to self-rate skills
- Does not infer skills from vague intent
- Only aggregates append-only skill signals from explicit, scoped events
- Uses a single source of truth: `user_skill_signals` table

The pipeline is designed to be correct first, then expandable later.

## Core Idea

Signals are the only write path.
Charts are derived from signals.
No feature is allowed to write directly into aggregates or computed metrics tables.

Single source of truth:
`user_skill_signals` (append-only)

## Data Model

### skills
- id
- skill_name
- category

### project_skills
- project_id
- skill_id

Represents the explicit skill scope of a project.

### progress_updates
- id
- project_id
- user_id
- content

Represents work updates for a project.

### mentorship_sessions
- id
- intern_id
- mentor_id
- session_focus
- project_id (optional)
- status

### user_skill_signals (append-only)
- id
- user_id
- skill_id
- source_type: project | update | mentorship
- source_id: id of the originating record
- signal_type: joined | update | completed | validated
- weight: internal weighting only
- created_at

Uniqueness constraint:
`(user_id, skill_id, source_type, source_id, signal_type)`

This prevents accidental duplicate inserts.

### skill_validations
- id
- signal_id
- validator_id
- validation_type: upvote | mentor_endorsement
- created_at

Peer validations that attach to existing signals without creating new ones.

## Guardrail Principle

Only one service is allowed to write into user_skill_signals.

Rule:
No controllers insert into user_skill_signals directly.
Controllers call emitSkillSignals.

This makes correctness enforceable.

## A -> B -> C -> D Pipeline

### A -- Project context exists

Goal:
Skills must be tied to a concrete scope, not user guesses.

How:
Project skills are explicitly defined in project_skills.

Also allowed:
Projects can store initial skill ideas in metadata.skill_ideas for user intent.
These ideas are informational only and do not enter Skill Tracker.

Hard rule:
project.metadata.skill_ideas never generates signals.

### B -- Mentorship session happens

Goal:
Mentorship should not be a loophole that injects skills without real evidence.

Rule:
Mentorship does not emit skill signals by default.

Current implementation:
emitSkillSignals returns early for sourceType=mentorship.

Even if session_focus is technical, mentorship does not emit skills until a later sprint introduces explicit skill selection or structured outcomes.

Exception:
When a mentor completes a technical session and explicitly selects skills via SkillSelectModal, those skills emit signals with higher weight.

Allowed now:
- Mentorship can be used as context for future features.
- Mentorship can be shown in dashboards separately.
- Mentorship can drive nudges later.
- Explicit skill verification during session completion generates signals.

Not allowed now:
- Mentorship creating any user_skill_signals rows without explicit skill selection.
- Session focus alone generating signals.

### C -- Progress update happens

Goal:
Real work activity should emit signals against the project's declared skills.

Trigger:
POST /api/progress_updates

Flow:
1. Insert progress update row
2. Fetch project skills from project_skills
3. emitSkillSignals with sourceType=update, signalType=update, skillIds from project_skills
4. Return the inserted progress update row

Guardrail:
If no project_skills exist for the project, emitSkillSignals becomes a no-op.
No skills means no signals.

### D -- Analytics layer reads signals

Goal:
Every chart is derived from user_skill_signals.
No other table is used for skill analytics.

Read patterns:
- Distribution (totals per skill)
- Momentum (time buckets, week-over-week deltas)
- Activity (recent signals)
- Summary (skill snapshot with trend readiness)
- Recent (recently active skills)

No writes in this layer.

## emitSkillSignals Contract

Signature:
```
emitSkillSignals({
  userId,
  sourceType,     // project | update | mentorship
  sourceId,
  signalType,     // joined | update | completed | validated
  context,        // optional metadata
  skillIds,       // required except mentorship
  weight,
  connection      // optional transaction connection
})
```

Rules:
- Missing userId or sourceType or sourceId or signalType -> no-op
- Mentorship without explicit skill selection -> always no-op
- sourceType project or update requires skillIds array
- skillIds are deduplicated before insert
- Inserts are append-only
- Uniqueness constraint prevents duplicates

## What counts as valid skill evidence

Valid now:
- Project membership, tied to project_skills
- Progress updates, tied to project_skills
- Explicit skill verification during mentorship session completion

Not valid now:
- Mentorship session focus alone
- Project metadata skill_ideas
- Free text content in progress updates
- Self-reported skill claims (without verification)

## Failure Modes Prevented

- Mentorship accidentally inflating skills
- Duplicate inserts from repeated calls
- Charts drifting from source-of-truth events
- Aggregates becoming stale or inconsistent
- Peer upvotes creating duplicate signals (validations attach to existing signals)

## Out of Scope

These are explicitly not part of A -> B -> C -> D right now:
- Manual skill entry
- AI nudges
- NLP-based inference from text content
- Gamification scores
- Portfolio exports (these read from Skill Tracker, they don't write to it)

Those features may be added later, but they must still route through emitSkillSignals.

## Definition of Done for A -> B -> C -> D

### A - Project Context
- Project skills exist and are queryable via `project_skills` table
- Project metadata `skill_ideas` is informational only and never generates signals
- Skills are explicitly defined when creating/editing projects

### B - Mentorship Sessions
- Mentorship sessions exist with `session_focus` and optional `project_id`
- No mentorship signal inserts occur without explicit skill selection
- Only technical sessions (`project_support`, `technical_guidance`) generate signals
- Skills are selected via `SkillSelectModal` during session completion

### C - Progress Updates
- Progress update inserts create signals for all project skills
- Signals are emitted via `emitSkillSignals()` function
- If no `project_skills` exist, no signals are emitted (no-op)

### D - Analytics Layer (Skill Tracker)
- Analytics endpoints read exclusively from `user_skill_signals`
- All skill charts (distribution, momentum, activity) use the canonical `/api/skills/user/:id/summary` endpoint
- No writes occur in this layer
- Read-only analytics derived from append-only signals

---

## Integration with Sidebar Tabs

The Skill Signal Pipeline powers the following sidebar tabs:
- **Skill Tracker** (`/skills`): Read-only analytics dashboard (D-layer)
- **Collaboration Hub** (`/collaboration`): Projects and progress updates generate signals (A + C layers)
- **Mentorship Bridge** (`/mentorship`): Session skill verification generates signals (B-layer)
- **Project Portfolio** (`/portfolio`): Showcases projects that contributed to skill growth

See [sidebar-tabs/](sidebar-tabs/) for detailed documentation on each tab.

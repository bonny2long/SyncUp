# Skill Tracker Signal Pipeline

A → B → C → D Architecture and Guardrails

## Purpose

Skill Tracker is a read-only analytics layer that reflects real activity across the platform.
It does not ask users to self-rate skills.
It does not infer skills from vague intent.
It only aggregates append-only skill signals that originate from explicit, scoped events.

The system is designed to be correct first, then expandable later.

## Core Idea

Signals are the only write path.
Charts are derived from signals.
No feature is allowed to write directly into aggregates or computed metrics tables.

Single source of truth:
user_skill_signals (append-only)

## Data Model

skills

- id
- skill_name
- category

project_skills

- project_id
- skill_id
  Represents the explicit skill scope of a project.

progress_updates

- id
- project_id
- user_id
- content
  Represents work updates for a project.

mentorship_sessions

- id
- intern_id
- mentor_id
- session_focus
- project_id (optional)
- status

user_skill_signals (append-only)

- id
- user_id
- skill_id
- source_type: project | update | mentorship
- source_id: id of the originating record
- signal_type: joined | update | completed
- weight: internal weighting only
- created_at

Uniqueness constraint:
(user_id, skill_id, source_type, source_id, signal_type)

This prevents accidental duplicate inserts.

## Guardrail Principle

Only one service is allowed to write into user_skill_signals.

Rule:
No controllers insert into user_skill_signals directly.
Controllers call emitSkillSignals.

This makes correctness enforceable.

## A → B → C → D Pipeline

### A — Project context exists

Goal:
Skills must be tied to a concrete scope, not user guesses.

How:
Project skills are explicitly defined in project_skills.

Also allowed:
Projects can store initial skill ideas in metadata.skill_ideas for user intent.
These ideas are informational only and do not enter Skill Tracker.

Hard rule:
project.metadata.skill_ideas never generates signals.

### B — Mentorship session happens

Goal:
Mentorship should not be a loophole that injects skills without real evidence.

Rule:
Mentorship does not emit skill signals by default.

Current implementation:
emitSkillSignals returns early for sourceType=mentorship.

Even if session_focus is technical, mentorship does not emit skills until a later sprint introduces explicit skill selection or structured outcomes.

Allowed now:
Mentorship can be used as context for future features.
Mentorship can be shown in dashboards separately.
Mentorship can drive nudges later.

Not allowed now:
Mentorship creating any user_skill_signals rows.

### C — Progress update happens

Goal:
Real work activity should emit signals against the project’s declared skills.

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

### D — Analytics layer reads signals

Goal:
Every chart is derived from user_skill_signals.
No other table is used for skill analytics.

Read patterns:

- Distribution (totals per skill)
- Momentum (time buckets)
- Activity (recent signals)

No writes in this layer.

## emitSkillSignals Contract

Signature:
emitSkillSignals({
userId,
sourceType, // project | update | mentorship
sourceId,
signalType, // joined | update | completed
context, // optional metadata
skillIds, // required except mentorship
weight,
connection // optional transaction connection
})

Rules:

- Missing userId or sourceType or sourceId or signalType → no-op
- Mentorship → always no-op for now
- sourceType project or update requires skillIds array
- skillIds are deduplicated before insert
- Inserts are append-only
- Uniqueness constraint prevents duplicates

## What counts as valid skill evidence

Valid now:

- Project membership or updates, tied to project_skills

Not valid now:

- Mentorship session focus alone
- Project metadata skill_ideas
- Free text content in progress updates

## Failure Modes Prevented

- Mentorship accidentally inflating skills
- Duplicate inserts from repeated calls
- Charts drifting from source-of-truth events
- Aggregates becoming stale or inconsistent

## Out of Scope

These are explicitly not part of A → B → C → D right now:

- Manual skill entry
- Mentor endorsements
- Gamification scores
- Portfolio exports
- AI nudges
- NLP-based inference from text content

Those features may be added later, but they must still route through emitSkillSignals.

## Definition of Done for A → B → C → D

A:
Project skills exist and are queryable.

B:
Mentorship sessions exist with session_focus and optional project_id.
No mentorship signal inserts occur.

C:
Progress update inserts create signals for all project skills.

D:
Analytics endpoints read from user_skill_signals only and power the charts.

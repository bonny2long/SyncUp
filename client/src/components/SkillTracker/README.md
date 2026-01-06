# Skill Tracker (MVP)

The Skill Tracker is a read-only analytics layer designed to make intern growth visible, explainable, and grounded in real work.

Rather than relying on self-ratings or gamified scores, Skill Tracker derives growth signals directly from activity across the platform.

## Design Principles

- No manual skill scoring
- No subjective ratings
- No gamification
- Growth is inferred from real actions

## How Skills Are Measured

Skills grow through signals, which are lightweight events generated automatically when users work:

- Joining projects
- Posting progress updates
- Completing mentorship sessions
- Completing projects

Not all signals are equal. For example:

- Mentorship sessions carry more weight than passive activity
- Progress updates contribute more than project membership alone

This weighting reflects the relative impact of different types of work.

## Visualizations

Skill Tracker presents growth through three complementary views:

### Skill Distribution

Shows where effort has gone over time by aggregating weighted signals per skill.

Includes a short insight that highlights either:

- the leading skill, or
- evenly distributed activity across skills

### Skill Momentum

Displays week-over-week changes in activity per skill. Rather than total counts, this view emphasizes directional change:

- increases
- decreases
- steady focus

Flat lines are intentionally preserved to represent consistent effort, not missing data.

### Activity Sources

Breaks down what caused skill growth by source:

- projects
- updates
- mentorship

This view helps explain why momentum changed in a given week.

## Why This Matters

The Skill Tracker is designed to support:

- better mentor conversations
- clearer self-reflection
- evidence-based growth discussions

It favors credibility over performance theater and serves as a foundation for future reflection and showcase features.

## Mentorship and Skill Growth Philosophy

SyncUp intentionally separates mentorship from projects.

Mentorship exists to support guidance, reflection, career clarity, and leadership growth. Projects exist to support execution, collaboration, and learning by doing. The two systems may intersect, but neither owns the other.

Mentorship sessions are created with explicit intent. Each session declares its focus, such as project support, technical guidance, career guidance, life and leadership, or alumni advice. Project context is optional and only applied when relevant.

Skill growth in SyncUp is derived from observable activity, not self reporting.

Skills are generated when users join projects or post progress updates tied to real work. Mentorship sessions do not automatically generate skill growth. Only technical or project focused mentorship may contribute to skills, and only when skills are explicitly selected.

This approach ensures that skill analytics remain honest, auditable, and grounded in real behavior rather than perception.

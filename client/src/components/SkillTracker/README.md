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

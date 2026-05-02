# SyncUp Mentorship - Developer Guardrails

These guardrails exist to prevent conceptual drift and protect the product philosophy as the codebase evolves. They are non-negotiable constraints, not suggestions.

## 1. Core Invariants (Must Always Be True)

### 1.1 Mentorship and Projects Are Independent Systems
- Mentorship does not belong to projects.
- Projects do not own mentorship.
- Either can exist without the other.
- They may intersect, but neither is subordinate.

### 1.2 Mentorship Belongs to People
- Mentorship relationships are person-to-person.
- Sessions may optionally reference a project for context.
- Removing a project must never delete mentorship history.
- If a mentorship session cannot exist without a project, the design is wrong.

### 1.3 Intent Comes Before Context
- Every mentorship session must declare why it exists before what it references.
- Session intent (session_focus) is required.
- Project context is optional.
- Skills are conditional.
- Never infer intent from a project link.

## 2. Mentorship Session Rules

### 2.1 Required Fields
- Every mentorship session must have:
  - Mentor
  - Mentee
  - Session focus (intent)
  - Date or time context
  - Status
- A session without intent is invalid.

### 2.2 Session Focus Is Explicit
- Session focus must be one of:
  - project_support
  - technical_guidance
  - career_guidance
  - life_leadership
  - alumni_advice
- No free-text intent. No guessing. No overload.
- If a new category is needed, it must be added deliberately.

### 2.3 Project Is Optional
- `project_id` may be NULL.
- Project linkage is allowed only when relevant.
- Career, life, and alumni sessions should default to no project.
- A session with `project_id = NULL` is fully valid.

## 3. Skill Tracker Guardrails (Critical)

### 3.1 Skills Are Derived, Not Self-Reported
- Users do not manually log skills.
- Skills emerge from activity and validated signals.
- Mentorship is not automatically a skill signal.
- This preserves trust in the Skill Tracker.

### 3.2 Mentorship Skill Emission Rules
- Mentorship sessions do NOT emit skill signals by default.
- Only when a mentor completes a technical/project_support session AND explicitly selects skills via SkillSelectModal do signals emit.
- All other session types:
  - Do not emit skill signals.
  - Still count toward engagement and participation metrics.
- No exceptions.

### 3.3 Career and Life Sessions Never Affect Skills
- Career clarity, leadership advice, and alumni conversations:
  - Are valuable.
  - Are tracked.
  - Do not modify technical skill growth.
- This keeps skills honest and meaningful.

### 3.4 Peer Validations Do Not Create New Signals
- Peer upvotes and mentor endorsements attach to existing signals.
- They increase validation counts but do not create new user_skill_signals rows.
- This preserves the integrity of the signal pipeline.

## 4. What We Explicitly Do NOT Do
- No manual skill logging.
- No free-form intent categories.
- No forced project linkage.
- No mentorship assumptions based on project membership.
- If a feature violates any guardrail above, it is out of scope.

## 5. Design Smell Checklist (Use During PR Reviews)
- If you see any of the following, stop and refactor:
  - Mentorship requires a project.
  - Skills increase after a career chat.
  - Session intent inferred instead of declared.
  - Project deletion breaking mentorship history.
  - UI that hides or auto-selects session focus.
  - Peer validations creating new signal rows.
- These indicate guardrail violations.

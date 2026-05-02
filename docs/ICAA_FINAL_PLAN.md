# ICAA / SyncUp Final Production Plan

This plan combines today's implementation direction with the coworker feedback. The goal is to avoid chasing every possible feature and instead finish the surfaces that make ICAA feel like a real professional community.

## Product Direction

ICAA / SyncUp should be understood as a professional community platform with four connected layers:

1. **Onboarding Layer**
   - Intern Lobby
   - Mentorship requests
   - Skill growth
   - Commencement into the community

2. **Community Layer**
   - SyncChat
   - ICAA HQ announcements
   - Events
   - Welcomes
   - Community identity through roles, cycles, and badges

3. **Work Layer**
   - Collaboration Hub
   - Project progress updates
   - Project-specific discussion
   - Team membership and join requests

4. **Credential Layer**
   - Public/profile-ready member pages
   - Project portfolio
   - GitHub links
   - Live project links
   - Featured project case studies
   - Mentorship and contribution history

The first three layers are now mostly in place. The strongest next move is the Credential Layer.

## Direction Decision

### Direction A: Brand + Visual Polish

**Decision: Later.**

Brand polish matters, especially with the ICAA guide, but doing it before the main product surfaces are locked will create rework. Colors, badges, cards, and layout should be polished once the profile and portfolio structure is final.

### Direction B: Profile Page + GitHub + Portfolio Revamp

**Decision: Do next.**

This is the highest-impact remaining direction because ICAA is a professional community. Members should be able to show employers, partners, mentors, and other community members what they have built.

The profile and portfolio should evolve from "internal tracker" into "professional credential."

### Direction C: Identity Badge System

**Decision: Do after profile/portfolio, together with brand polish.**

Role badges are important, but the final badge visual language should come from the ICAA brand system. Building badges now without the final brand pass risks doing the same work twice.

## Final Roadmap

## Phase 1: Profile + Portfolio Foundation

Goal: make projects and profiles externally meaningful.

### 1. Add Project Link Fields

Add two fields to projects:

- `github_url`
- `live_url`

Case-study fields added next:

- `case_study_problem`
- `case_study_solution`
- `case_study_tech_stack`
- `case_study_outcomes`
- `case_study_artifact_url`

Backend/API:

- Update project create/edit payloads.
- Return these fields in project list, project detail, portfolio detail, and user profile queries.
- Validate URLs lightly.

Frontend:

- Add GitHub and Live URL inputs where projects are created or edited.
- Show link buttons on project cards.
- Show links in Project Detail modal.
- Capture and display case-study fields in create/edit/detail flows.

Why first:

- Small database change.
- Unlocks portfolio and profile value immediately.
- Gives public-facing project cards real proof points.

### 2. Revamp Project Portfolio Page

Goal: make portfolio feel like a showcase, not just a project grid.

Recommended structure:

- Featured project case study at the top.
- Project cards below in a cleaner grid.
- Each card should show:
  - title
  - short description
  - status
  - skills
  - team/collaborators
  - GitHub button when available
  - Live button when available
  - detail/case study button

Featured project rules:

- Prefer a completed project.
- Fall back to most recently updated active project.
- Later: allow user/admin to manually mark a project as featured.

### 3. Evolve Profile Page

Goal: profiles become professional member pages.

Profile should adapt by role.

Intern profile:

- cycle
- program progress
- skill tracker summary
- active projects
- mentorship sessions
- recent updates

Resident/alumni profile:

- cycle
- featured project
- GitHub profile link
- public project portfolio
- mentorship stats
- projects contributed to
- skills demonstrated

Mentor profile:

- mentorship stats
- interns supported
- skills/areas of guidance
- project involvement

Admin profile:

- lighter public profile
- admin badge/ICAA body tech arm identity later

New profile fields to consider:

- `github_url`
- `linkedin_url`
- `personal_site_url`
- `headline`
- `featured_project_id`

The first version now supports manual featured project selection so members can choose the project that represents them best.

### 4. Mentorship Stats For Profiles

Goal: show contribution and community leadership.

Stats to calculate:

- sessions completed
- interns mentored
- projects advised
- skills supported

This matters especially for residents, alumni, and mentors.

## Phase 2: Profile/Portfolio Polish

Goal: make the credential layer feel complete.

### Portfolio Improvements

- Project screenshots or images.
- Better empty states.
- Public/private visibility rules.
- Rich media upload for artifacts instead of URL-only artifacts.

### Profile Improvements

- Better profile header.
- Role/cycle badge placement.
- Project highlights.
- Skill evidence.
- Credential readiness checklist.
- Timeline of activity:
  - commenced
  - project joined
  - project completed
  - mentorship completed
  - badges earned

### Admin Support

- Admin can see profile completeness.
- Admin can identify members missing credential profile pieces.
- Admin can feature community projects.
- Admin can review public-facing portfolio data.

## Phase 3: Brand + Badge System

Goal: make the community identity feel real and ICAA-specific.

Do this after the profile/portfolio structure is stable.

### Brand Pass

Use the ICAA branding guide to standardize:

- primary colors
- accent colors
- neutral palette
- typography treatment where possible
- buttons
- cards
- badges
- admin/community surfaces

Avoid doing only color swaps. This should be a UI identity pass.

### Badge System

Build distinct badge visuals for:

- Intern
- Resident
- Alumni
- Mentor
- Admin / ICAA body tech arm

Badge rules:

- role badge should be visible across member lists, chat, profile, admin rosters, and project teams.
- cycle badge should sit near the role where relevant.
- mentor badge should distinguish people who can support incoming interns.
- admin badge should feel official, not just another colored pill.

## Phase 4: HQ + Admin Maturity

Goal: make the admin/community operations loop stronger.

### Announcement Management

- explicit unread roster
- announcement detail modal in admin
- read percentage
- pinned/required announcements
- expiration handling

### Welcome Management

- structured commencement metadata
- welcome seen/read tracking
- grouped welcomes by cycle without parsing message text

### Events

- RSVP export
- event attendance tracking
- post-event recap

## Phase 5: Hardening

Goal: make the system production-stable.

### Access Control

Confirm server-side enforcement for:

- Intern Lobby
- SyncChat
- Project Discussion
- Mentorship sessions
- Admin actions
- Profile visibility

### Database Migrations

Make all migrations idempotent and safe for:

- fresh database
- existing local database
- demo database
- future production database

### Cleanup

- clean existing `AdminDashboard.jsx` lint debt
- add focused API tests for new endpoints
- seed realistic ICAA demo data

## Recommended Next Sprint

### Sprint Goal

Turn profile and portfolio into the first version of the ICAA credential layer.

### Sprint Tasks

1. Add `github_url` and `live_url` to projects.
2. Add project URL fields to create/edit UI.
3. Show GitHub and Live buttons on project cards and detail modal.
4. Revamp Project Portfolio page with featured project at the top.
5. Add profile fields:
   - GitHub profile
   - LinkedIn
   - personal site
   - headline
6. Add featured project section to Profile page.
7. Add mentorship stats to resident/alumni/mentor profiles.
8. Add project case-study fields and display them in Portfolio, Project Detail, and Profile.
9. Let members manually choose their featured profile project.
10. Add credential readiness indicators for members and admins.

## Not Doing Yet

- Full ICAA color/branding pass.
- Final badge visuals.
- Deep public sharing permissions.
- External GitHub API integration.
- Automated GitHub repo import.

Those are valuable, but they should come after the link-based portfolio/profile structure is working.

## Final Recommendation

The next build phase should be:

**Profile + Portfolio first, then brand + badges.**

This gives ICAA the strongest practical value: members can show what they built, what they contributed to, and how they moved through the community.

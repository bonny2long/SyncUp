# ICAA / SyncUp Final Priority Roadmap

This document is the working plan for finishing SyncUp without trying to build every idea at once. It combines the current codebase, today's completed credential-layer work, and the Sprint 4-7 notes into one prioritized roadmap.

The rule for implementation is simple: build from highest impact to lowest impact, keep each phase shippable, and do not start large visual polish until the product surfaces are stable.

## Current Foundation

Already in place:

- Commencement foundation:
  - `users.has_commenced`
  - `users.cycle`
  - intern to resident promotion flow
- Role-based space separation:
  - Intern Lobby for interns
  - SyncChat for commenced community members
- ICAA HQ:
  - announcements
  - events
  - welcomes
  - archive
  - read tracking
  - RSVP tracking
- Project work:
  - Collaboration Hub
  - project detail modal
  - project discussions
  - project links
  - project case-study fields
- Credential layer:
  - profile headline
  - GitHub / LinkedIn / personal site
  - featured project
  - manual featured-project selection
  - mentorship stats
  - profile completeness indicators
- Admin:
  - user management
  - announcements/events management
  - announcement read counts
  - event RSVP rosters
  - credential completion signal in Users table

## Final System Model

### Member Journey

```text
ic.stars Intern
  -> commencement by admin
Resident
  -> manual promotion by admin
Alumni
```

Cycle identity is permanent. A member keeps the cycle they interned in forever, such as `C-58`, `C-59`, or `C-60`.

The Intern Lobby is temporary and cohort-facing. The member's cycle identity is permanent and community-facing.

### Role Rules

| Capability | Intern | Resident | Alumni | Admin / ICAA Body |
|---|---:|---:|---:|---:|
| Intern Lobby | Own cycle only | No | No | Read/moderate |
| SyncChat | No | Yes | Yes | Yes |
| Vote on community decisions | No | Yes | Yes | Yes |
| Serve in governance office | No | Yes | Yes | N/A |
| Run for governance office | No | No | Yes | N/A |
| Post opportunities | No | No for now | Yes | Yes |
| Mentor interns | No | Yes | Yes | No by default |
| Post encouragement to interns | No | Yes | Yes | Yes |
| Public profile visible | Limited | Yes | Yes | Yes |

Resolved decisions:

- Admin can read/moderate Intern Lobby.
- Opportunities are alumni/admin only for first version. Resident posting can be revisited after quality rules are clear.
- Residents can mentor interns.
- Governance is separate from role. A user can be `alumni` and also `treasurer`.
- `mentor` should become a secondary designation, not a standalone primary role. The primary identity should be `intern`, `resident`, `alumni`, or `admin`; mentoring is something assigned/earned by residents and alumni who help interns.
- Admin / ICAA Body may also become a secondary system-management designation later for residents/alumni who manage the app, rather than always being treated as a separate community identity.
- Intern hard-delete is a policy direction, but cascade behavior must be verified before making it the only flow.

## Badge Model

### Identity Badges

Who the person is:

- Intern
- Resident
- Alumni
- Admin / ICAA Body

### Governance Badges

Specific office or ICAA body function:

- President
- Vice President
- Treasurer
- Secretary
- Parliamentarian
- Tech Lead
- Tech Member

These can stack with identity badges.

### Activity / Credibility Badges

What the person has contributed:

- Mentor badge
- Active Contributor
- Project Contributor

Mentor credibility should live mostly in Mentorship Bridge and profiles, not everywhere in chat.

Future role-model correction:

- Convert mentor from a primary `users.role` value into a secondary capability/badge/assignment.
- Keep primary roles limited to intern, resident, alumni, and admin until the role model is refactored.
- Update filters, directories, role badges, SyncChat member panels, and mentorship queries so mentors are shown as residents/alumni with a mentor designation.

## Priority Roadmap

## Phase 1: Mentor Credibility

Status: Implemented first pass.

Goal: make the mentorship system more trustworthy by showing who is actively helping.

Build:

- Added completed session count to mentor results.
- Added last completed session date to mentor results.
- Sorted available mentors by completed sessions first, then name.
- Show on mentor cards:
  - completed sessions
  - last active date
  - "New Mentor" when sessions are zero
- Added mentor credibility badge award after completed-session threshold.

Backend:

- Update `getAvailableMentors` in `mentorshipController.js`.
- Add completed session count derived from `mentorship_sessions`.
- Add non-fatal badge check when a session becomes completed.

Frontend:

- Update mentor cards in Mentorship Bridge.

Why first:

- Small scope.
- High impact.
- Makes existing mentorship workflows better immediately.

## Phase 2: Public Profiles + Employer Fields

Status: Implemented first pass.

Goal: make profiles shareable outside the logged-in app.

Build:

- Added profile fields:
  - `current_employer`
  - `current_title`
- Added public profile route:
  - `/p/:userId`
- Public profile shows:
  - name
  - role badge
  - cycle
  - headline
  - employer/title if present
  - featured project
  - case-study summary
  - GitHub / LinkedIn / website
  - public skills or mentorship stats
- Public profile hides:
  - edit controls
  - direct message controls
  - private session details
  - email address
- Public profile responses now use a trimmed public user object and respect profile visibility toggles for skills/projects.

Frontend:

- Added copy profile link action on own profile.
- Added `isPublic` mode to `UserProfile`.

Why second:

- We already built the credential profile.
- This turns the profile into something members can actually share.

## Phase 3: Member Directory

Status: Implemented first pass.

Goal: make the community searchable and useful for networking.

Build:

- Added Member Directory page.
- Added search/filter by:
  - name
  - role
  - cycle
  - later: skill
- Shows:
  - avatar
  - name
  - role
  - cycle
  - headline
  - employer/title
  - project count
  - mentor session count when available
  - internal profile link
  - public profile link
  - GitHub link when available
- Governance badge display remains parked until the governance table lands in Phase 4.

Backend:

- Added `GET /api/users/directory`.
- Excludes interns by default.
- Includes residents, alumni, mentors.
- Respect public/profile visibility rules when those are finalized.

Why third:

- Public profiles become more valuable when members can find each other.

## Phase 4: Governance Badges

Status: Implemented first pass.

Goal: separate leadership identity from account role.

Build:

- Added `governance_positions` table.
- Added governance controller/routes:
  - list active positions
  - fetch positions for one user
  - assign position
  - deactivate/remove position
- Added `GovernanceBadge` component.
- Showing governance badges on:
  - profile
  - member directory
  - later: SyncChat member list
- Added Admin Dashboard governance tab:
  - assign governance positions
  - view active governance roster
  - remove/deactivate positions

Rules:

- Alumni can run for governance.
- Residents can serve where assigned.
- Admin / ICAA Body is not the same thing as governance office.

Why fourth:

- Important for identity, but it depends on profiles and directory being useful first.

## Phase 5: Opportunity Board

Status: Implemented first pass.

Goal: let the ICAA community share real professional opportunities.

First version rules:

- Alumni and admins can post.
- Residents and mentors can view.
- Intern access can be hidden or read-only depending on program policy.
- Resident posting can be added later if quality is good.
- SyncChat `#opportunities` stays as the discussion channel; Opportunity Board is the structured source of truth.

Build:

- Added `opportunities` table.
- Added API:
  - list active opportunities
  - create opportunity
  - soft-delete opportunity
- Added frontend Opportunity Board at `/opportunities`:
  - title
  - company
  - type
  - short description
  - apply URL
  - author role/cycle
  - search and type filter
  - delete for author/admin

Why fifth:

- It is high value, but needs a stable identity/profile layer so posts have credibility.

## Phase 6: Encouragement Board + Cycle-Scoped Lobby

Status: Encouragement Board and cycle foundation implemented first pass. Lobby filtering by `intern_cycle_id` remains next.

Goal: let the community encourage current interns while keeping the Intern Lobby cohort-safe.

Build encouragement first:

- Added `encouragements` table.
- Added encouragement API:
  - list by target cycle
  - create encouragement
  - soft-delete encouragement
- Residents, alumni, admins, and current mentor-role users can post.
- Interns can read inside Intern Lobby.
- Community posters can post from the Mentorship Bridge encouragement tab.
- Intern view hides author name and shows author cycle/role identity.

Then build cycle-scoped lobby:

- Added `intern_cycles` table.
- Added `users.intern_cycle_id`.
- Added cycle API:
  - list cycles
  - create cycle
  - update cycle status
- Added Admin Dashboard Cycles tab:
  - create cohorts
  - view active/commenced/closed cohorts
  - mark a cycle commenced or closed
- Active lobby filtering tied to `intern_cycle_id` is still a follow-up. Intern Lobby continues using `user.cycle` until users are linked to cycle records.

Why sixth:

- Valuable for culture, but it touches cycle lifecycle rules and should be built carefully.

## Phase 7: Polls On Announcements

Goal: support simple community decisions from ICAA HQ.

Build:

- Polls attached to announcements.
- Poll options.
- Poll votes.
- Vote rules:
  - residents, alumni, admins can vote
  - interns cannot vote
- Poll types:
  - yes/no
  - multiple choice
  - date select later
- Results visible after voting or after close.

Why seventh:

- Useful, but less urgent than mentorship, profiles, directory, governance, and opportunities.

## Phase 8: Smart Notifications

Goal: notify users without overwhelming them.

Always notify:

- direct messages
- mentions
- session request accepted/declined
- admin-wide announcements

Default on, user can disable:

- channel messages
- opportunities
- events
- encouragements

Default off or admin-only:

- RSVP activity
- general channel activity
- new member joins

Build:

- Notification preference fields:
  - `notify_channel_messages`
  - `notify_dm_messages`
  - `notify_opportunities`
  - `notify_events`
  - `notify_encouragements`
  - `digest_mode`
- Smart notification service helper.
- Group repeated channel messages into one notification.
- Digest mode frontend behavior first.

Why eighth:

- Important for maturity, but it cuts across many systems.

## Phase 9: Brand + Badge Visual System

Goal: make SyncUp feel like ICAA, not a generic dashboard.

Do after features are stable.

Build:

- ICAA color pass.
- Typography pass.
- Role badge redesign.
- Governance badge visual design.
- Featured project/case-study visual polish.
- HQ card polish.
- Copy audit.

Brand notes:

- Use ICAA red/gray/black carefully.
- Avoid changing every component twice.
- Badge visuals should come from the final brand pass, not before.

## Phase 10: Production Hardening

Goal: make the system safer and easier to maintain.

Build/check:

- Server-side access control for:
  - Intern Lobby
  - SyncChat
  - Project Discussion
  - Mentorship sessions
  - Admin routes
  - public profile data
- Idempotent migrations for all new tables/columns.
- Seed data for demo/testing.
- API tests for new endpoints.
- Clear intern deletion confirmation copy.
- Verify cascade deletes before enforcing hard-delete-only intern exit.
- Clean remaining lint warnings in large files.

## Not Building Yet

Do not start these until the higher phases are stable:

- External GitHub API integration.
- Automated repo import.
- Full email digest system.
- Deep public sharing permissions.
- Screenshots/file uploads for project artifacts.
- Final ICAA visual redesign.

## Immediate Next Build

Start with Phase 1:

**Mentor Credibility**

Deliverable:

- Mentors sorted by completed session count.
- Mentor cards show completed sessions and last active date.
- Mentor credibility badge awarded after the agreed threshold.

This is the best next step because it improves an active workflow without requiring a large new product surface.

Next implementation target:

**Phase 2: Public Profiles + Employer Fields**

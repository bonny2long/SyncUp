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
- Cycle counts currently include users explicitly linked by `intern_cycle_id` and older users whose `users.cycle` matches the cycle name.
- Active lobby filtering tied to `intern_cycle_id` is still a follow-up. Intern Lobby continues using `user.cycle` until users are linked to cycle records.

Cycle assignment tightening to build later:

- Admin creates cycles before interns register.
- Intern registration should not allow free-text cycle entry.
- New intern accounts should be assigned to an existing active cycle, preferably by admin invitation/setup.
- Cycles should only move forward through `active -> commenced -> closed`.
- Admin user edit now uses a cycle dropdown when cycles exist and sets both permanent `users.cycle` and active enrollment `users.intern_cycle_id`.
- Registration/invitation still needs to move to existing-cycle assignment instead of intern free-text.

Why sixth:

- Valuable for culture, but it touches cycle lifecycle rules and should be built carefully.

## Phase 7: Polls On Announcements

Status: Implemented first pass.

Goal: support simple community decisions from ICAA HQ.

Build:

- Added announcement poll tables:
  - `polls`
  - `poll_options`
  - `poll_votes`
- Admin can attach a poll when creating an announcement.
- Supported first-pass poll types:
  - yes/no
  - multiple choice
- Vote rules:
  - residents, alumni, and admins can vote
  - interns cannot vote
- Results show after the user votes or after the poll closes.
- Polls display inside the announcement detail modal in ICAA HQ and the archive.
- Admin announcement list shows a poll badge when an announcement has a poll.

Later:

- Date-select polls.
- Admin poll results summary inside Admin Dashboard.
- Poll editing or poll cloning for existing announcements.

Why seventh:

- Useful, but less urgent than mentorship, profiles, directory, governance, and opportunities.

## Phase 8: Smart Notifications

Status: Audit complete. Foundation implemented first pass.

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

- Added notification foundation migration:
  - widened `notifications.related_type`
  - added `notifications.group_key`
  - added grouping index
- Added notification preference fields:
  - `notify_channel_messages`
  - `notify_dm_messages`
  - `notify_opportunities`
  - `notify_events`
  - `notify_encouragements`
  - `digest_mode`
- Added `createSmartNotification` service helper.
- Existing project update/completion notifications now respect project update preferences and use grouping keys.
- Notification routes now check requester ownership/admin access through the existing `x-user` header.
- Settings page can save the new notification preferences.
- Group repeated notifications by `group_key` foundation is in place.
- Digest mode frontend behavior first.

Still to build:

- Convert remaining notification sources to preference-aware helper where appropriate.
- Added new event sources:
  - announcements notify eligible community users as critical admin-wide updates
  - events notify eligible community users when `notify_events` is enabled
  - opportunities notify eligible community users when `notify_opportunities` is enabled
  - encouragements notify matching interns when `notify_encouragements` is enabled
- Add admin-visible notification analytics later.
- Add digest-mode bell behavior.
- Defer chat/DM/mention notifications until chat grouping and requester identity are tighter.

Why eighth:

- Important for maturity, but it cuts across many systems.
- Current audit is captured in `docs/ICAA_NOTIFICATION_AUDIT_2026-05-03.md`.

## Pre-Phase 8 Decision Notes

These notes should be reviewed before building Smart Notifications because they affect where notifications should be created, who should receive them, and what access model they enforce.

### Access And Auth

- Add real auth/permission middleware later. Many endpoints currently trust `user_id`, `admin_id`, or `requester_id` from query/body data.
- Before notification logic becomes broader, the backend should have a cleaner requester identity model so users cannot spoof notification actions.
- Admin routes, community routes, mentorship routes, chat routes, and public profile routes need server-side permission checks.

### Admin Navigation

- Admin users currently operate mostly from Admin Dashboard and do not receive regular Sidebar navigation into SyncChat/Lobby.
- Final decision needed:
  - Admin-only dashboard model.
  - Admin also gets community navigation.
  - Admin has a separate "View as community" mode.

### Intern Lobby Final Access Rule

Current direction: keep Intern Lobby for interns and put helper/community interaction through Mentorship Bridge and encouragement tools unless we intentionally redesign the Lobby helper experience.

Options to revisit:

- Option A: residents/alumni/mentors can enter Intern Lobby to support interns.
- Option B: only interns use Intern Lobby; community members support interns through Mentorship Bridge, encouragements, and session flows.
- Option C: only mentors/admins enter Lobby; residents/alumni do not.

If Option A is chosen later, the helper UI must not look like an intern's personal lobby. It should show "Incoming Interns", cycle filters, support queue, and clear helper context.

### ICAA HQ / CommunityFeed

- CommunityFeed already exists, so the next HQ phase is an upgrade, not a from-zero build.
- CommunityFeed should become the real ICAA HQ strip/header:
  - announcements
  - pinned resources
  - events
  - welcomes
  - polls
  - read/RSVP/vote state
- Long-term welcome grouping should stop parsing cycle/name from message text. Store structured metadata such as `introduced_user_id`, `cycle`, and `commencement_id`.

### Events And RSVP Notifications

- Admin system already knows RSVP rosters through the Events tab.
- Later, optionally create bell notifications for admins when someone RSVPs.
- Do not make RSVP notifications noisy by default.

### Project Editing / Case Study Polish

- Existing projects still need full edit support for URLs and case-study fields.
- New projects can already add links/case-study fields, but existing project editing should be added before final brand polish.
- Case-study feature works functionally. Later visual pass should make Project Detail, Portfolio featured project, and Profile featured project feel more ICAA-branded.

### Role Model Refactor

- Primary identities: `intern`, `resident`, `alumni`, `admin`.
- `mentor` should become a secondary designation/capability for residents and alumni.
- Governance/board/admin-management should also be layered as secondary designations where appropriate.
- Later refactor filters, role badges, directory, chat panels, and mentorship queries so mentors display as "Resident + Mentor" or "Alumni + Mentor", not as a standalone role.

### Cycle / Registration Tightening

- Admin creates cycles first.
- Interns should not free-type cycles.
- New intern accounts should be assigned to an existing active cycle, likely through admin setup/invitation.
- Registration should likely require an `@icstars.org` email, unless the user has an admin invitation.
- Cycles only move forward: `active -> commenced -> closed`.
- When a cycle commences, admin should be able to bulk-promote selected interns in that cycle to residents.
- Remaining interns in the cycle should not be automatically promoted; admin needs an explicit review step.
- Keep single-user manual commencement as an option.
- Resident-to-alumni promotion may eventually become semi-automated after the two-year resident period is clarified.

### Notification Reality Check

- Notification system is not fully working yet.
- Before building more notification features, confirm the current notification table/routes, bell UI, read state, and settings behavior.
- Phase 8 should start with a current-state audit before adding new event sources.

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

Hold Phase 9 and Phase 10 for later. Phase 7 is now in first pass and Phase 8 notification foundation is in first pass.

Recommended next build:

**Phase 8: Notification Polish**

Deliverable:

- Test the new notification event sources from the UI.
- Add digest-mode bell behavior.
- Add admin-visible notification health/analytics if needed.
- Keep DM/mention notifications deferred until chat grouping is safer.

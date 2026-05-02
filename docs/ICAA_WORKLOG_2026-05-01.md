# ICAA / SyncUp Worklog - 2026-05-01

This file captures the major product and engineering work completed today, plus the next items we should come back to.

## Completed Today

### Commencement Foundation

- Added the core commencement fields to users:
  - `has_commenced`
  - `cycle`
- Established the product rule that interns start in the Intern Lobby and move into the broader ICCA community after commencement.
- Commencing an intern now promotes them into the resident/community experience.
- Added the commencement moment:
  - When an intern is commenced, the system posts a welcome message into `#introductions`.
  - The welcome includes the intern/resident name and cycle when available.

### Role-Based Space Separation

- SyncChat is now for commenced community members.
- Intern Lobby is now for interns.
- Residents, mentors, and alumni no longer see Intern Lobby in the sidebar.
- Interns do not enter SyncChat before commencement.
- Direct messages are scoped more cleanly by space:
  - Lobby communication stays around intern/mentor support.
  - SyncChat communication stays community-facing.

### ICAA HQ In SyncChat

- Added the ICAA HQ strip above SyncChat messages.
- HQ now supports:
  - Pinned resources
  - News announcements
  - Upcoming events
  - Community welcomes
- The HQ strip is scrollable/capped so it does not take over the whole chat area.
- Clicking an announcement, event, or welcome opens a detail modal.

### Announcement Archive

- The empty `#announcements` message area is now useful.
- Added an announcement archive view that shows:
  - Active announcements
  - Upcoming events
  - Read/unread state for announcements
- Users can still find older active HQ posts after they leave the top strip.

### Announcement Read Tracking

- Added announcement read receipts.
- Users can mark announcements as read.
- Read announcements disappear from the top HQ attention strip.
- The archive still keeps read announcements visible.
- Admins can now see:
  - Read count
  - Estimated unread count
  - Reader list with role/cycle where available

### Events And RSVP Flow

- Added/connected community events in ICAA HQ.
- Users can RSVP from the HQ strip/modal.
- RSVP'd events disappear from the user's compact `Next Up` area.
- Admins can see RSVP roster information in the Events admin tab.

### Grouped Welcomes

- Welcomes now group by cycle when multiple new residents are introduced.
- Example behavior:
  - `5 new residents joined Cycle C-60`
- Clicking the grouped welcome opens a modal with the full resident list.

### Admin HQ Management

- Admin Dashboard can create, edit, and deactivate announcements.
- Admin Dashboard can create, edit, and deactivate events.
- Admin Dashboard now shows announcement read tracking.
- Admin Dashboard now shows event RSVP rosters.

### Project Discussion

- Added a dedicated project discussion system.
- Project-specific conversation now lives inside the Project Detail modal.
- Added a `Discussion` tab next to `Overview` and `Activity`.
- Project members, owners, and admins can post.
- This keeps SyncChat focused on community/HQ and keeps project work inside Collaboration Hub.

### Project Portfolio Credential Layer

- Added GitHub and live URL support to projects.
- Project creation now captures repo and live/demo links.
- Project owners/admins can edit project links after creation.
- Project cards, project detail modal, and Project Portfolio now expose GitHub/live links.
- Project Portfolio now has a stronger featured-project section for public-facing work.
- Residents can access project creation again from Collaboration Hub.
- Added structured case-study fields to projects:
  - Problem
  - Solution
  - Tech stack
  - Outcomes
  - Artifact URL
- Project create/edit/detail now supports case-study content.
- Portfolio and profile featured project sections now highlight case-study content when present.

### Profile Credential Layer

- Added profile fields for:
  - Professional headline
  - GitHub URL
  - LinkedIn URL
  - Personal site URL
- Added manual featured project selection.
- Profile pages now show credential links near the member identity block.
- Added a featured project section to the profile.
- Added mentor/resident credential stats:
  - Sessions completed
  - Residents/interns helped
  - Projects advised
- Recent project lists now surface GitHub/live links.
- Profile URL saves now validate URLs and show better failure feedback.
- Users can now explicitly mark which project should be featured instead of relying only on auto-selection.
- Added credential readiness scoring for users:
  - headline
  - profile link
  - cycle
  - project participation
  - featured project
  - project repo/live link
  - project case study
- Users now see their own credential checklist on the profile page.
- Admin Dashboard now shows a compact credential completion percentage in the Users table.

### Navigation And UX Fixes

- Added `lobby` to Navbar title mapping so Intern Lobby has a proper page title.
- Fixed resume export so it fetches real profile data before generating the PDF.
- Added better user-facing error handling in the mentorship/session chat path where requests fail.
- Fixed the missing backend route issue that caused HQ introductions/announcements to show a 404.

## Database Changes Added / Applied

- `users.has_commenced`
- `users.cycle`
- `users.headline`
- `users.github_url`
- `users.linkedin_url`
- `users.personal_site_url`
- `users.featured_project_id`
- `projects.github_url`
- `projects.live_url`
- `projects.case_study_problem`
- `projects.case_study_solution`
- `projects.case_study_tech_stack`
- `projects.case_study_outcomes`
- `projects.case_study_artifact_url`
- `announcement_reads`
- `project_discussions`
- Community announcement/event support tables were connected into the active flow.

Migration files added during this phase include:

- `server/src/database/commencement_foundation.sql`
- `server/src/database/announcement_reads.sql`
- `server/src/database/project_discussions.sql`
- `server/src/database/project_urls.sql`
- `server/src/database/user_credential_profile.sql`
- `server/src/database/project_case_studies.sql`
- `server/src/database/user_featured_project.sql`

## Verification Run Today

- Focused server syntax checks with `node --check`.
- Focused client eslint checks on newly touched files where possible.
- `git diff --check`.
- `npm run build` from the client.

Known note: full eslint on `AdminDashboard.jsx` still reports older unrelated lint debt, mostly unused variables and hook dependency warnings. The production build passes.

## Current Product Shape

- Intern Lobby: intern onboarding and pre-commencement support.
- SyncChat: commenced ICCA community communication, HQ updates, welcomes, general channels.
- Announcements Archive: active HQ history and event browsing.
- Project Detail Discussion: project-specific work and decisions.
- Project Portfolio: public-facing project showcase with repo/demo links.
- Profile Page: member credential page with links, featured project, project case-study content, and mentorship stats.
- Mentorship Bridge: mentorship session requests and session-specific chat.
- Admin Dashboard: manage users, HQ announcements, events, RSVP visibility, and read tracking.

## Still To Do

### High Priority

- Add structured metadata to commencement welcome messages.
  - Current welcome grouping parses name/cycle from message text.
  - Better long-term approach: store `introduced_user_id`, `cycle`, and `commencement_id`.
- Add read/seen tracking for grouped welcomes.
  - Once users view a welcome group, it should leave their top HQ strip.
- Add admin visibility for who has not read an announcement.
  - We currently show read/unread counts and reader list.
  - A useful next step is an explicit unread roster.
- Add stronger error/toast feedback for HQ actions.
  - Mark read failure
  - RSVP failure
  - Project discussion post failure

### Product Polish

- Improve the ICAA HQ visual design using the ICAA branding guide.
- Make the HQ cards feel more like a real headquarters feed, not just generic cards.
- Add role/cycle badges consistently across chat member lists, archives, and admin rosters.
- Refine copy:
  - "resident"
  - "cycle"
  - "commenced"
  - "ICAA community"

### Collaboration Hub

- Add unread counts or recent activity badges to project discussions.
- Add edit/delete for project discussion messages.
- Add project discussion notifications for team members.
- Decide whether mentors can always view/post on projects they are advising.
- Add richer project artifacts:
  - Screenshots
  - Demo videos
  - Uploaded documents

### Admin Dashboard

- Clean up existing lint debt in `AdminDashboard.jsx`.
- Add an HQ analytics summary:
  - active announcements
  - unread announcements
  - upcoming events
  - RSVP totals
  - recent commencements
- Add a cleaner admin announcement detail modal instead of showing everything inline.

### Access Control / Data Integrity

- Confirm all routes enforce role/space rules server-side, not only in the UI.
- Add migrations that are idempotent across fresh databases and existing databases.
- Add seed/test data for:
  - interns
  - residents
  - mentors
  - admins
  - cycles
  - announcements
  - events
  - project discussions

### Future Ideas From Notes

- Small role badges for interns, residents, alumni, mentors, and admins.
- Special badge for mentors.
- Special badge for admins / ICAA body tech arm.
- Profile page should become more important because ICAA will use the system heavily.
- Projects should include public artifacts beyond links:
  - Screenshots
  - Case study writeups
  - Demo videos
  - Milestone outcomes

## Suggested Next Step

Build the case-study layer next:

1. Add screenshot/artifact upload instead of URL-only artifacts.
2. Add filters/admin sorting for low-completeness credential profiles.
3. Then do ICAA brand polish and the identity badge system together.

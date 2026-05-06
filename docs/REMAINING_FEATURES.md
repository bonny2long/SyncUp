# Remaining Features - Priority List

> **Last Updated:** 2026-05-06

---

## What's Already Built

| Feature | Status |
|---------|--------|
| Collaboration Hub | Done |
| Mentorship Bridge | Done |
| Skill Tracker | Done |
| Project Portfolio | Done |
| SyncChat (Community Chat) | Done |
| ICAA HQ (Announcements, Events, Welcomes) | Done |
| Intern Lobby | Done |
| Commencement System | Done |
| Announcement Read Tracking | Done |
| Event RSVP | Done |
| Project Discussions | Done |
| Project Case Studies | Done |
| Profile Credential Layer | Done |
| Credential Readiness Scoring | Done |
| Skill Peer Validations | Done |
| Badges System | Done |
| Admin Dashboard | Done |
| Invitation System | Done |
| Error Tracking | Done |
| Maintenance Mode | Done |
| Onboarding Tour | Done |
| Resume PDF Export | Done |
| Swagger API Docs | Done |
| File Uploads (Chat, Avatar) | Done |
| Analytics Correlations | Done |

---

## Remaining Features

### HIGH PRIORITY (from ICAA Final Plan)

#### 1. Welcome Message Metadata
**Status:** Implemented first pass.

**What:** Store structured metadata for commencement welcomes instead of parsing from text.

**Current:** Welcome grouping parses name/cycle from message text.
**Better:** Store `introduced_user_id`, `cycle`, and `commencement_id` as separate columns.

**Added:**
- Migration: `server/src/database/welcome_message_metadata.sql`
- New commencement welcome messages store:
  - `introduced_user_id`
  - `introduction_cycle`
  - `commencement_id`
- ICAA HQ now uses structured fields first and only falls back to parsing old text-only welcome messages.

#### 2. Welcome Read Tracking
**Status:** Implemented first pass.

**What:** Track which users have seen grouped welcome messages.

**Features:**
- Once a user views a welcome group, it leaves their HQ strip
- Admin can see who has not seen recent welcomes

**Added:**
- Migration: `server/src/database/welcome_reads.sql`
- New endpoint: `POST /api/chat/introductions/read`
- ICAA HQ now receives `is_seen` for welcome messages.
- Opening a single welcome or grouped welcome marks those introduction messages as seen.
- Seen welcomes leave the top HQ attention strip for that user.

**Still to add later:**
- Admin-facing unseen roster for recent welcome groups.

#### 3. Unread Announcement Roster
**Status:** Implemented first pass.

**What:** Admin view showing which specific users have not read an announcement.

**Current:** Read/unread counts and reader list exist.
**Next:** Explicit unread roster for follow-up.

**Added:**
- Announcements API now returns `unread_roster`.
- Admin Dashboard now shows a `Still Unread` roster under each active announcement when users have not read it.

#### 4. Project Discussion Enhancements
**Status:** Implemented first pass.

**What:** Richer project discussion experience.

**Features:**
- Unread counts or activity badges on project discussions
- Edit/delete for project discussion messages
- Notifications for team members when discussions are posted
- Mentor access rules for projects they are advising

**Added:**
- Edit project discussion messages.
- Soft-delete project discussion messages.
- Message authors, project owners, and admins can manage discussion messages.
- Project access now respects `is_admin` as well as `role = admin`.

**Still to add later:**
- Unread counts/activity badges on project discussion tabs.
- Notifications for team members when discussion messages are posted.
- Final mentor access rule for advised projects.

---

### MEDIUM PRIORITY

#### 5. ICAA Brand Polish
**Status:** Moved to UX polish track.

**What:** Apply ICAA branding guide to the entire platform.

**Scope:**
- Primary/accent/neutral color standardization
- Typography treatment
- Button and card identity pass
- Badge visual system (Intern, Resident, Alumni, Mentor, Admin)
- Admin and community surface styling

**Note:** This is covered by [REMAINING_UX_POLISH.md](REMAINING_UX_POLISH.md). Several first-pass items are already done, including login/register, sidebar, profile, directory, lobby, mentorship, and Collaboration Hub polish.

#### 6. Rich Project Artifacts
**Status:** Defer while UX/product surface stabilizes.

**What:** Go beyond URL-only artifacts for projects.

**Features:**
- Screenshot upload for projects
- Demo video embedding
- Document upload (PDF, docs)
- Media gallery in project detail

**Note:** Project detail and case-study presentation polish belongs to the UX track first. Rich uploads/media can come later as a separate product feature.

#### 7. Profile Page Polish
**Status:** Moved to UX polish track.

**What:** Make profiles feel like professional member pages.

**Features:**
- Better profile header design
- Role/cycle badge placement across member lists, chat, admin rosters
- Activity timeline (commenced, project joined, project completed, mentorship completed, badges earned)
- Project highlights section
- Credential readiness checklist improvements

**Note:** Profile already received a first pass and second copy/empty-state pass. Remaining visual polish is tracked in [REMAINING_UX_POLISH.md](REMAINING_UX_POLISH.md).

#### 8. HQ Analytics Summary
**Status:** Implemented first pass.

**What:** Admin dashboard section for HQ operations metrics.

**Features:**
- Active announcement count
- Unread announcement count
- Upcoming events
- RSVP totals
- Recent commencements
- Announcement detail modal (instead of inline)

**Added:**
- New endpoint: `GET /api/admin/hq-analytics`
- Admin Overview now shows an ICAA HQ operations snapshot with:
  - active announcements
  - total unread announcement follow-ups
  - upcoming events
  - RSVP totals
  - recent commencements
- The snapshot includes focused lists for:
  - announcements that need follow-up
  - next events
  - recent commencement welcomes
- Admin announcements now use a detail modal for read/unread roster review instead of showing long rosters inline on every card.

---

## Active Remaining Work

**Strengthen What We Already Built**

**Status:** First pass complete.

**Added in the hardening pass:**
- Admin HQ metrics now refresh after announcement/event create, update, and delete actions.
- HQ RSVP/read/seen failures now show user-facing messages instead of only logging to the console.
- Announcement and event API helpers now preserve backend error messages for delete/RSVP failures.
- Admin announcement cards now stay compact while full read/unread rosters live in the detail modal.

**Remaining before production:**
- Run one full manual walkthrough for intern, resident/alumni, and admin users.
- Apply the database migrations on the target database and confirm the app starts cleanly.
- Do a final permission pass when real auth middleware is introduced.
- Decide whether to clean existing AdminDashboard hook dependency warnings now or after the current branch is tested.

---

### POST-PRODUCTION / DEFERRED

#### 9. Personal Growth Recommendations
**Status:** Deferred until after production.

**What:** Actionable next steps based on skill data.

**Features:**
- "Your fastest growing skill" with continue suggestion
- "Neglected skills" - skills you haven't practiced recently
- "Team needs" - skills your team is looking for

#### 10. Team Skill Synergy Views
**Status:** Deferred until after production.

**What:** Show complementary skills across team members.

**Features:**
- Skills heatmap: Who has what, gaps, overlaps
- "Skill Diversity Score" for each team
- "Recommended Skills" based on team gaps

#### 11. Advanced Momentum Analytics
**Status:** Deferred until after production.

**What:** Deeper insights into growth patterns.

**Features:**
- Seasonal trends
- Velocity tracking per skill
- Prediction models

#### 12. External GitHub API Integration
**Status:** Post-production feature.

**What:** Auto-import repos and activity from GitHub.

**Features:**
- Link GitHub account to profile
- Auto-populate project repos from GitHub
- Activity sync

---

## Priority Order Recommendation

| Order | Feature | Effort | Impact |
|-------|---------|--------|--------|
| 1 | Welcome Message Metadata | Low | High |
| 2 | Welcome Read Tracking | Low | High |
| 3 | Unread Announcement Roster | Low | Medium |
| 4 | Project Discussion Enhancements | Medium | High |
| 5 | HQ Analytics Summary | Low | Medium |
| 6 | Strengthen Existing Features | Medium | High |
| UX | ICAA Brand Polish | Medium | High |
| UX | Rich Project Artifacts / Case Study Polish | Medium | Medium |
| UX | Profile Page Polish | Medium | Medium |
| Post-production | Personal Growth Recs | Low | Medium |
| Post-production | Team Skill Synergy | Medium | Low |
| Post-production | Advanced Analytics | Medium | Low |
| Post-production | GitHub API Integration | High | Low |

---

## Quick Wins

1. **Welcome Metadata** - Small schema change, big correctness improvement
2. **Unread Roster** - Query against existing announcement_reads table
3. **HQ Analytics** - Aggregates of existing data

---

*See [ICAA_FINAL_PLAN.md](ICAA_FINAL_PLAN.md) for the authoritative roadmap.*

# Remaining Features - Priority List

> **Last Updated:** 2026-05-02

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
**What:** Store structured metadata for commencement welcomes instead of parsing from text.

**Current:** Welcome grouping parses name/cycle from message text.
**Better:** Store `introduced_user_id`, `cycle`, and `commencement_id` as separate columns.

#### 2. Welcome Read Tracking
**What:** Track which users have seen grouped welcome messages.

**Features:**
- Once a user views a welcome group, it leaves their HQ strip
- Admin can see who has not seen recent welcomes

#### 3. Unread Announcement Roster
**What:** Admin view showing which specific users have not read an announcement.

**Current:** Read/unread counts and reader list exist.
**Next:** Explicit unread roster for follow-up.

#### 4. Project Discussion Enhancements
**What:** Richer project discussion experience.

**Features:**
- Unread counts or activity badges on project discussions
- Edit/delete for project discussion messages
- Notifications for team members when discussions are posted
- Mentor access rules for projects they are advising

---

### MEDIUM PRIORITY

#### 5. ICAA Brand Polish
**What:** Apply ICAA branding guide to the entire platform.

**Scope:**
- Primary/accent/neutral color standardization
- Typography treatment
- Button and card identity pass
- Badge visual system (Intern, Resident, Alumni, Mentor, Admin)
- Admin and community surface styling

#### 6. Rich Project Artifacts
**What:** Go beyond URL-only artifacts for projects.

**Features:**
- Screenshot upload for projects
- Demo video embedding
- Document upload (PDF, docs)
- Media gallery in project detail

#### 7. Profile Page Polish
**What:** Make profiles feel like professional member pages.

**Features:**
- Better profile header design
- Role/cycle badge placement across member lists, chat, admin rosters
- Activity timeline (commenced, project joined, project completed, mentorship completed, badges earned)
- Project highlights section
- Credential readiness checklist improvements

#### 8. HQ Analytics Summary
**What:** Admin dashboard section for HQ operations metrics.

**Features:**
- Active announcement count
- Unread announcement count
- Upcoming events
- RSVP totals
- Recent commencements
- Announcement detail modal (instead of inline)

---

### LOWER PRIORITY

#### 9. Personal Growth Recommendations
**What:** Actionable next steps based on skill data.

**Features:**
- "Your fastest growing skill" with continue suggestion
- "Neglected skills" - skills you haven't practiced recently
- "Team needs" - skills your team is looking for

#### 10. Team Skill Synergy Views
**What:** Show complementary skills across team members.

**Features:**
- Skills heatmap: Who has what, gaps, overlaps
- "Skill Diversity Score" for each team
- "Recommended Skills" based on team gaps

#### 11. Advanced Momentum Analytics
**What:** Deeper insights into growth patterns.

**Features:**
- Seasonal trends
- Velocity tracking per skill
- Prediction models

#### 12. External GitHub API Integration
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
| 5 | ICAA Brand Polish | Medium | High |
| 6 | Rich Project Artifacts | Medium | Medium |
| 7 | Profile Page Polish | Medium | Medium |
| 8 | HQ Analytics Summary | Low | Medium |
| 9 | Personal Growth Recs | Low | Medium |
| 10 | Team Skill Synergy | Medium | Low |
| 11 | Advanced Analytics | Medium | Low |
| 12 | GitHub API Integration | High | Low |

---

## Quick Wins

1. **Welcome Metadata** - Small schema change, big correctness improvement
2. **Unread Roster** - Query against existing announcement_reads table
3. **HQ Analytics** - Aggregates of existing data

---

*See [ICAA_FINAL_PLAN.md](ICAA_FINAL_PLAN.md) for the authoritative roadmap.*

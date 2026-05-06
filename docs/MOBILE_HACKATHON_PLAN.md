# SyncUp Mobile Hackathon Plan

> Working plan for the 8-week mobile app hackathon.

## Core Idea

SyncUp Web remains the full platform and backend foundation.

The hackathon teams will fork/use the backend only and build completely new mobile frontends. The mobile apps do not need to copy the web UI. They should be lighter, faster, and designed specifically for phone use.

There will be two winning tracks:

- iOS winner
- Android / Google winner

## Hackathon Length

8 weeks.

## Backend Rule

Competitors build against the existing SyncUp backend.

They should not rebuild the backend unless a small API adjustment is approved. The main challenge is creating the best mobile experience on top of the current system.

## Support Cadence

Competitors can schedule one backend support call per week.

- Length: 1 hour
- Purpose: backend/API questions, data model questions, clarification on intended flows
- Not for: building the app for them, debugging every frontend issue, or changing the competition scope every week

## MVP Scope

The MVP should focus on a lightweight iCAA community mobile experience.

### 1. Home Feed

The main screen should feel like the mobile home base.

It should include:

- Board news
- Announcements
- Events
- Community information
- Important iCAA updates

Users should be able to filter feed items by type.

Example filters:

- All
- News
- Events
- Announcements
- Opportunities
- Board Updates

### 2. What iCAA Is

The app should include a simple section that explains iCAA to non-technical or new community members.

This should answer:

- What is iCAA?
- Who is it for?
- What does the community do?
- How do interns, residents, alumni, mentors, and admins fit together?

### 3. Profiles

Users should have public/community profiles.

The feel can be closer to MySpace/Facebook than a plain resume page:

- Name
- Role / identity
- Cycle
- Bio
- Photo/avatar
- Projects
- Links
- Community activity
- Optional personal style/customization

The goal is for profiles to feel personal and shareable, not only administrative.

### 4. Feed Comments

People should be able to comment on feed posts.

This turns announcements and board posts into community conversations instead of one-way updates.

### 5. Lightweight SyncChat / Intern Lobby

The mobile app should include a lighter version of chat.

It does not need to copy full desktop SyncChat.

Minimum:

- Basic community chat
- Basic intern lobby/cohort communication
- Clear separation between intern space and community space

## Weekly Community Input

There should be a weekly meeting with the hackers and any interested iCAA members.

Purpose:

- Get feedback on early designs
- Ask what mobile features members actually need
- Keep the apps aligned with real iCAA use
- Avoid building only from developer assumptions

Suggested rhythm:

- Week 1: concept and user journey review
- Week 2: wireframes
- Week 3: clickable prototype
- Week 4: backend integration check
- Week 5: first usable MVP
- Week 6: community feedback pass
- Week 7: polish and bug fixing
- Week 8: final demos and judging

## Judging Criteria

Suggested judging categories:

- Mobile usability
- Clean iCAA community experience
- Correct backend integration
- Speed and simplicity
- Quality of profile/feed experience
- Stability
- Design originality
- Ability for future iCAA developers to build on it

## Important Product Direction

The mobile app should not be a smaller copy of the web app.

The web app is the full workspace.

The mobile app should be:

- Quick
- Focused
- Easy to scan
- Community-first
- Good for updates, profiles, comments, and light chat

## Backend/API Notes To Prepare

Before the hackathon starts, prepare:

- API endpoint list
- Auth/login flow explanation
- User roles explanation
- Feed/announcement/event data model explanation
- Profile endpoint explanation
- Chat/lobby endpoint explanation
- Example requests and responses
- Local setup instructions

## Trello Reminder

Reminder: ask JV to start a Trello board for you and him.

Suggested Trello lists:

- Hackathon Setup
- Backend Docs Needed
- Mobile MVP Scope
- Weekly Meeting Notes
- Questions From Competitors
- Bugs/API Requests
- Judging/Final Demo

## Open Questions

- Will competitors get seeded test users or a shared staging database?
- Will login be normal email/password, dev-mode accounts, or invitation-based?
- Should comments on feed posts use the existing announcement/event system or a new mobile feed comment endpoint?
- Should mobile profile customization be MVP or post-MVP?
- Who are the judges?
- What are the prizes or incentives?


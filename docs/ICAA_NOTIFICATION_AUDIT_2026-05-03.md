# ICAA / SyncUp Notification Audit - 2026-05-03

This audit captures the current notification system before Phase 8 smart notifications. The goal is to avoid adding more notification sources on top of unclear behavior.

## Current Table Shape

Live `notifications` columns:

- `id`
- `user_id`
- `type`
- `title`
- `message`
- `link`
- `is_read`
- `related_id`
- `related_type`
- `created_at`

Current `related_type` enum values:

- `project`
- `session`
- `update`
- `request`

Important constraint: the enum does not yet support `announcement`, `event`, `opportunity`, `encouragement`, `dm`, or `poll`.

## Current Routes

Backend routes in `server/src/routes/notificationRoutes.js`:

- `GET /api/notifications/:userId`
- `GET /api/notifications/:userId/unread-count`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/:userId/read-all`
- `DELETE /api/notifications/:id`

Current issue: these routes trust URL params and do not verify that the requester owns the notification or user id.

## Current Frontend Behavior

Frontend pieces:

- `client/src/components/NotificationBell.jsx`
- `client/src/components/NotificationDropdown.jsx`
- API helpers in `client/src/utils/api.js`
- Settings UI in `client/src/components/settings/NotificationsSection.jsx`

Behavior:

- Bell polls unread count every 5 seconds.
- Dropdown fetches the latest 20 notifications when opened.
- User can mark one notification read.
- User can mark all notifications read.
- User can delete a notification.
- Notification click navigates to `notification.link` if present.
- Dropdown also includes skill verification actions.

## Current Notification Sources

Notifications are created for:

- Project join request approved.
- Project join request rejected.
- Mentorship session accepted.
- Mentorship session declined.
- Mentorship session completed.
- Project update posted.
- Project completed.
- Skill verification needed.

Notifications are not currently created for:

- Direct messages.
- Mentions.
- Announcement polls.
- Event RSVPs.
- Commencement welcomes.

Implemented after this audit:

- Announcements create critical notifications for eligible community users.
- Community events create preference-aware notifications for eligible community users.
- Opportunities create preference-aware notifications for eligible community users.
- Encouragements create preference-aware notifications for matching interns.

## Current Preferences

User preference fields:

- `email_notifications`
- `notify_join_requests`
- `notify_mentions`
- `notify_session_reminders`
- `notify_project_updates`
- `notify_weekly_summary`

Settings UI can save these fields.

Important issue: notification creation does not currently check these preferences. They are stored, but most notification sources still fire regardless.

Also, `email_notifications` and `notify_weekly_summary` are UI/data settings only right now. There is no email delivery or real digest system implemented.

## Main Risks Before Phase 8

1. **Requester identity is weak**
   Many routes trust `userId` in URL/body/query data. Smart notifications will touch more user-specific data, so ownership checks need to improve.

2. **Preferences are not enforced**
   Adding new notification types before introducing a preference-aware creation helper would make the system noisier.

3. **Related type enum is too narrow**
   New Phase 8 sources need either a wider enum or a safer string column for `related_type`.

4. **Bell polling is aggressive**
   A 5-second poll works locally but may be noisy for production. Keep it for now, but consider 30-60 seconds or WebSocket/SSE later.

5. **No grouping**
   Ten project updates or chat messages can become ten notifications. Phase 8 should introduce grouping before adding channel-message notifications.

## Recommended Phase 8 Build Order

1. Add an idempotent notification schema migration:
   - widen `related_type` to support new entities
   - add preference fields for new categories
   - optionally add `group_key` for notification grouping

2. Add a `createSmartNotification` helper:
   - checks recipient preferences
   - supports always-on critical notifications
   - supports digest-mode suppression later
   - supports grouping by `group_key`

3. Lock down notification routes:
   - read only own notifications
   - mark/delete only own notifications
   - keep admin override explicit if needed

4. Convert existing notification sources to the smart helper:
   - mentorship sessions
   - project join requests
   - project updates
   - skill verifications

5. Add new notification sources carefully:
   - announcements: notify all eligible users
   - events: notify eligible users if `notify_events`
   - opportunities: notify community if `notify_opportunities`
   - encouragements: notify current interns if `notify_encouragements`

6. Defer chat/DM/mention notifications until chat identity and grouping are clearer.

## Decision

Do not build broad Phase 8 notification creation yet. First build the schema/helper/permission foundation, then attach new event sources one at a time.

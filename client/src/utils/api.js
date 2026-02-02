// src/utils/api.js
// Allow overriding the API base via Vite env (VITE_API_BASE); fallback to local dev server.
export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

// ----------------------------------------------------
// PROJECTS
// ----------------------------------------------------
export async function fetchProjects(userId) {
  const url =
    userId ? `${API_BASE}/projects?user_id=${userId}` : `${API_BASE}/projects`;
  const res = await fetch(url);
  return res.json();
}

// ----------------------------------------------------
// PROJECT MEMBERSHIP & STATUS
// ----------------------------------------------------
export async function addProjectMember(projectId, userId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) throw new Error("Failed to add project member");
  return res.json();
}

export async function removeProjectMember(projectId, userId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/members`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) throw new Error("Failed to remove project member");
  return res.json();
}

export async function updateProjectStatus(id, status) {
  const res = await fetch(`${API_BASE}/projects/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update project status");
  return res.json();
}

// ----------------------------------------------------
// ANALYTICS
// ----------------------------------------------------
export async function fetchActiveProjectsAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/projects/active`);
  if (!res.ok) throw new Error("Failed to fetch active projects analytics");
  return res.json();
}

export async function fetchWeeklyUpdatesAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/updates/weekly`);
  if (!res.ok) throw new Error("Failed to fetch weekly updates analytics");
  return res.json();
}

export async function fetchMentorEngagementAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/mentors/engagement`);
  if (!res.ok) throw new Error("Failed to fetch mentor engagement analytics");
  return res.json();
}

// ----------------------------------------------------
// USERS
// ----------------------------------------------------
export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

// ----------------------------------------------------
// PROGRESS UPDATES (Collaboration Hub)
// ----------------------------------------------------
export async function fetchUpdates(projectId) {
  const url =
    projectId ?
      `${API_BASE}/progress_updates?project_id=${projectId}`
    : `${API_BASE}/progress_updates`;
  const res = await fetch(url);
  return res.json();
}

export async function postUpdate(content, projectId, userId, skills = []) {
  const res = await fetch(`${API_BASE}/progress_updates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content,
      project_id: projectId,
      user_id: userId,
      skills,
    }),
  });
  return res.json();
}

// ----------------------------------------------------
// MENTORSHIP - GET SESSIONS (optional mentor filter)
// ----------------------------------------------------
export async function fetchSessions(mentorId) {
  const url =
    mentorId ?
      `${API_BASE}/mentorship/sessions?mentor_id=${mentorId}`
    : `${API_BASE}/mentorship/sessions`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

// ----------------------------------------------------
// MENTORSHIP - CREATE NEW SESSION
// ----------------------------------------------------
export async function createSession(payload) {
  const res = await fetch(`${API_BASE}/mentorship/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create mentorship session");
  return res.json();
}

// ----------------------------------------------------
// MENTORSHIP - GET MENTORS
// ----------------------------------------------------
export async function fetchMentors() {
  const res = await fetch(`${API_BASE}/mentorship/mentors`);
  if (!res.ok) throw new Error("Failed to fetch mentors");
  return res.json();
}

export async function fetchMentorDetails(id) {
  const res = await fetch(`${API_BASE}/mentorship/mentor/${id}/details`);
  if (!res.ok) throw new Error("Failed to fetch mentor details");
  return res.json();
}

export async function fetchAvailableMentors() {
  const res = await fetch(`${API_BASE}/mentorship/mentors/available`);
  if (!res.ok) throw new Error("Failed to fetch available mentors");
  return res.json();
}

export async function fetchProjectMentors() {
  const res = await fetch(`${API_BASE}/mentorship/mentors/project`);
  if (!res.ok) throw new Error("Failed to fetch project mentors");
  return res.json();
}

// ----------------------------------------------------
// MENTORSHIP - UPDATE SESSION STATUS (PUT)
// ----------------------------------------------------
export async function updateSessionStatus(id, { status, skill_ids = [] }) {
  const res = await fetch(`${API_BASE}/mentorship/sessions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, skill_ids }),
  });

  if (!res.ok) throw new Error("Failed to update session status");
  return res.json();
}

// ----------------------------------------------------
// MENTORSHIP - UPDATE SESSION DETAILS
// ----------------------------------------------------
export async function updateSessionDetails(id, payload) {
  const res = await fetch(`${API_BASE}/mentorship/sessions/${id}/details`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to update session");
  return res.json();
}

// ----------------------------------------------------
// MENTORSHIP - RESCHEDULE SESSION
// ----------------------------------------------------
export async function rescheduleSession(id, session_date) {
  const res = await fetch(`${API_BASE}/mentorship/sessions/${id}/reschedule`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_date }),
  });

  if (!res.ok) throw new Error("Failed to reschedule session");
  return res.json();
}

// ----------------------------------------------------
// MENTORSHIP - DELETE SESSION
// ----------------------------------------------------
export async function deleteSession(id) {
  const res = await fetch(`${API_BASE}/mentorship/sessions/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete session");
  return res.json();
}

// ----------------------------------------------------
// PROGRESS UPDATE MUTATIONS
// ----------------------------------------------------
export async function updateProgressUpdate(id, content) {
  const res = await fetch(`${API_BASE}/progress_updates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to update progress update");
  return res.json();
}

export async function deleteProgressUpdate(id) {
  const res = await fetch(`${API_BASE}/progress_updates/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete progress update");
  return res.json();
}

// ----------------------------------------------------
// SKILLS - TRACKER & DISTRIBUTION
// ----------------------------------------------------
export async function fetchSkills() {
  const res = await fetch(`${API_BASE}/skills`);
  if (!res.ok) {
    throw new Error("Failed to fetch skills");
  }
  return res.json();
}

export async function getRecentSkills(userId) {
  const res = await fetch(`${API_BASE}/skills/user/${userId}/recent`);
  if (!res.ok) throw new Error("Failed to load recent skills");
  return res.json();
}

export async function getSkillDistribution(userId) {
  const res = await fetch(`${API_BASE}/skills/user/${userId}/distribution`);
  if (!res.ok) throw new Error("Failed to load skill distribution");
  return res.json();
}

export async function getSkillMomentum(userId) {
  const res = await fetch(`${API_BASE}/skills/user/${userId}/momentum`);
  if (!res.ok) throw new Error("Failed to load skill momentum");
  return res.json();
}

export async function getSkillActivity(userId) {
  const res = await fetch(`${API_BASE}/skills/user/${userId}/activity`);
  if (!res.ok) throw new Error("Failed to load skill activity");
  return res.json();
}

export async function getSkillSummary(userId) {
  const res = await fetch(`${API_BASE}/skills/user/${userId}/summary`);
  if (!res.ok) throw new Error("Failed to fetch skill summary");
  return res.json();
}

// ----------------------------------------------------
// CREATE PROJECT
// ----------------------------------------------------
export async function createProject(data) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

// ----------------------------------------------------
// ATTACH PROJECT SKILLS
// ----------------------------------------------------
export async function attachProjectSkills(projectId, skillIds) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/skills`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skill_ids: skillIds }),
  });

  if (!res.ok) throw new Error("Failed to attach project skills");
}

// ============================================================
// PROJECT JOIN REQUESTS
// ============================================================

export async function createJoinRequest(projectId, userId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/join-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create join request");
  }
  return res.json();
}

export async function getProjectRequests(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/requests`);
  if (!res.ok) throw new Error("Failed to fetch project requests");
  return res.json();
}

export async function getUserProjectRequests(userId) {
  const res = await fetch(`${API_BASE}/projects/requests/user/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user requests");
  return res.json();
}

export async function checkJoinRequestStatus(projectId, userId) {
  const res = await fetch(
    `${API_BASE}/projects/${projectId}/join-request/status/${userId}`,
  );
  if (!res.ok) throw new Error("Failed to check request status");
  return res.json();
}

export async function approveJoinRequest(projectId, requestId) {
  const res = await fetch(
    `${API_BASE}/projects/${projectId}/requests/${requestId}/approve`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    },
  );
  if (!res.ok) throw new Error("Failed to approve request");
  return res.json();
}

export async function rejectJoinRequest(projectId, requestId) {
  const res = await fetch(
    `${API_BASE}/projects/${projectId}/requests/${requestId}/reject`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    },
  );
  if (!res.ok) throw new Error("Failed to reject request");
  return res.json();
}

// ============================================================
// MENTORSHIP - SESSIONS
// ============================================================

export async function fetchInternSessions(internId, status = "all") {
  const url =
    status && status !== "all" ?
      `${API_BASE}/mentorship/sessions/intern/${internId}?status=${status}`
    : `${API_BASE}/mentorship/sessions/intern/${internId}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch intern sessions");
  return res.json();
}

export async function fetchMentorSessions(mentorId, status = "all") {
  const url =
    status && status !== "all" ?
      `${API_BASE}/mentorship/sessions/mentor/${mentorId}?status=${status}`
    : `${API_BASE}/mentorship/sessions/mentor/${mentorId}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch mentor sessions");
  return res.json();
}

// Get all availability slots for a specific mentor
export async function fetchMentorAvailability(mentorId) {
  const res = await fetch(
    `${API_BASE}/mentorship/mentors/${mentorId}/availability`,
  );
  if (!res.ok) throw new Error("Failed to fetch mentor availability");
  return res.json();
}

// ============================================================
// NOTIFICATIONS
// ============================================================

// Get user notifications
export async function fetchNotifications(userId, limit = 50) {
  const res = await fetch(`${API_BASE}/notifications/${userId}?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

// Get unread count
export async function fetchUnreadCount(userId) {
  const res = await fetch(`${API_BASE}/notifications/${userId}/unread-count`);
  if (!res.ok) throw new Error("Failed to fetch unread count");
  return res.json();
}

// Mark notification as read
export async function markNotificationAsRead(notificationId) {
  const res = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Failed to mark as read");
  return res.json();
}

// Mark all as read
export async function markAllNotificationsAsRead(userId) {
  const res = await fetch(`${API_BASE}/notifications/${userId}/read-all`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Failed to mark all as read");
  return res.json();
}

// Delete notification
export async function deleteNotification(notificationId) {
  const res = await fetch(`${API_BASE}/notifications/${notificationId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete notification");
  return res.json();
}

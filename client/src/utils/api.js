// src/utils/api.js
// Allow overriding the API base via Vite env (VITE_API_BASE); fallback to local dev server.
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

// ----------------------------------------------------
// PROJECTS
// ----------------------------------------------------
export async function fetchProjects(userId) {
  const url = userId
    ? `${API_BASE}/projects?user_id=${userId}`
    : `${API_BASE}/projects`;
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
  const url = projectId
    ? `${API_BASE}/progress_updates?project_id=${projectId}`
    : `${API_BASE}/progress_updates`;
  const res = await fetch(url);
  return res.json();
}

export async function postUpdate(content, projectId, userId) {
  const res = await fetch(`${API_BASE}/progress_updates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, project_id: projectId, user_id: userId }),
  });
  return res.json();
}

// ----------------------------------------------------
// MENTORSHIP - GET SESSIONS (optional mentor filter)
// ----------------------------------------------------
export async function fetchSessions(mentorId) {
  const url = mentorId
    ? `${API_BASE}/mentorship/sessions?mentor_id=${mentorId}`
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
export async function updateSessionStatus(id, updates) {
  const res = await fetch(`${API_BASE}/mentorship/sessions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates), // { status, notes }
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
    body: JSON.stringify(payload), // { topic, details, session_date }
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

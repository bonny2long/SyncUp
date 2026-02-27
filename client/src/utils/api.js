// src/utils/api.js
// Allow overriding the API base via Vite env (VITE_API_BASE); fallback to local dev server.
export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

// Error reporting function (defined first so handleApiError can use it)
export async function reportError(errorType, message, details = {}) {
  const payload = {
    error_type: errorType,
    message: message,
    stack: details.stack || null,
    user_id: details.userId || null,
    page_url: details.pageUrl || (typeof window !== "undefined" ? window.location.pathname : ""),
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  };
  
  try {
    await fetch(`${API_BASE}/errors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Silent fail - don't break the app
  }
}

// Auto-report errors helper (doesn't block the call)
async function handleApiError(res, endpoint, errorType = "api") {
  if (!res.ok) {
    const errorMsg = `API Error ${res.status}: ${endpoint} failed`;
    try {
      const errorData = await res.clone().json();
      reportError(errorType, errorMsg, {
        pageUrl: window.location.pathname,
        details: JSON.stringify(errorData),
      });
    } catch {
      reportError(errorType, errorMsg, {
        pageUrl: window.location.pathname,
      });
    }
  }
  return res;
}

// ----------------------------------------------------
// PROJECTS
// ----------------------------------------------------
export async function fetchProjects(userId) {
  const url =
    userId ? `${API_BASE}/projects?user_id=${userId}` : `${API_BASE}/projects`;
  const res = await fetch(url);
  await handleApiError(res, "/projects");
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

export async function updateProjectStatus(id, status, userId = null) {
  const body = { status };
  if (userId) body.user_id = userId;

  const res = await fetch(`${API_BASE}/projects/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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
// ACTIVITY CORRELATION ANALYTICS
// ----------------------------------------------------

export async function fetchMentorshipGrowthCorrelation() {
  const res = await fetch(`${API_BASE}/analytics/correlation/mentorship-growth`);
  if (!res.ok) throw new Error("Failed to fetch mentorship growth correlation");
  return res.json();
}

export async function fetchEffectivePairings() {
  const res = await fetch(`${API_BASE}/analytics/correlation/effective-pairings`);
  if (!res.ok) throw new Error("Failed to fetch effective pairings");
  return res.json();
}

export async function fetchEngagementLoops() {
  const res = await fetch(`${API_BASE}/analytics/correlation/engagement-loops`);
  if (!res.ok) throw new Error("Failed to fetch engagement loops");
  return res.json();
}

// ----------------------------------------------------
// USERS
// ----------------------------------------------------
export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`);
  await handleApiError(res, "/users");
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
  await handleApiError(res, "/progress_updates");
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
  await handleApiError(res, "/mentorship/sessions");
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
  const res = await fetch(`${API_BASE}/skills?include_usage=true`);
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
// PROJECT SKILLS
// ----------------------------------------------------
export const fetchProjectSkills = async () => {
  const response = await fetch(`${API_BASE}/projects/skills`);
  if (!response.ok) throw new Error("Failed to fetch project skills");
  return response.json();
};

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
// SKILL VALIDATIONS (Upvotes & Endorsements)
// ============================================================

// Add validation (upvote or mentor endorsement)
export async function addSkillValidation(signalId, validatorId, validationType = 'upvote') {
  const res = await fetch(`${API_BASE}/skills/${signalId}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      validator_id: validatorId, 
      validation_type: validationType 
    })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to add validation');
  }
  return res.json();
}

// Remove validation
export async function removeSkillValidation(signalId, validatorId, validationType = 'upvote') {
  const res = await fetch(`${API_BASE}/skills/${signalId}/validate`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      validator_id: validatorId, 
      validation_type: validationType 
    })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to remove validation');
  }
  return res.json();
}

// Get validation counts for a signal
export async function getSkillValidations(signalId) {
  const res = await fetch(`${API_BASE}/skills/${signalId}/validations`);
  if (!res.ok) throw new Error('Failed to fetch validations');
  return res.json();
}

// Get user's received validations (show on their profile)
export async function getUserReceivedValidations(userId) {
  const res = await fetch(`${API_BASE}/skills/user/${userId}/validations`);
  if (!res.ok) throw new Error('Failed to fetch user validations');
  return res.json();
}

// Get which signals a user has already validated
export async function getUserValidatedSignals(userId) {
  const res = await fetch(`${API_BASE}/skills/user/${userId}/has-validated`);
  if (!res.ok) throw new Error('Failed to fetch validated signals');
  return res.json();
}

// Get user's skill signals with validation counts (for validation UI)
export async function getUserSkillSignals(userId) {
  const res = await fetch(`${API_BASE}/skills/user/${userId}/signals`);
  if (!res.ok) throw new Error('Failed to fetch skill signals');
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

// ============================================================
// CHAT
// ============================================================

export async function fetchChannels() {
  const res = await fetch(`${API_BASE}/chat/channels`);
  if (!res.ok) throw new Error("Failed to fetch channels");
  return res.json();
}

export async function createChannel(
  name,
  description,
  userId,
  isPrivate = false,
) {
  const res = await fetch(`${API_BASE}/chat/channels?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, is_private: isPrivate }),
  });
  if (!res.ok) throw new Error("Failed to create channel");
  return res.json();
}

export async function joinChannel(channelId, userId) {
  const res = await fetch(
    `${API_BASE}/chat/channels/${channelId}/join?user_id=${userId}`,
    {
      method: "POST",
    },
  );
  if (!res.ok) throw new Error("Failed to join channel");
  return res.json();
}

export async function fetchChannelMessages(channelId, limit = 50) {
  const res = await fetch(
    `${API_BASE}/chat/channels/${channelId}/messages?limit=${limit}`,
  );
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export async function fetchDMMessages(userId, currentUserId, limit = 50) {
  const res = await fetch(
    `${API_BASE}/chat/dm/${userId}?currentUserId=${currentUserId}&limit=${limit}`,
  );
  if (!res.ok) throw new Error("Failed to fetch DM");
  return res.json();
}

export async function sendMessage(
  content,
  channelId = null,
  recipientId = null,
  userId,
  fileUrl = null,
  fileName = null,
) {
  const res = await fetch(`${API_BASE}/chat/messages?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content,
      channel_id: channelId,
      recipient_id: recipientId,
      file_url: fileUrl,
      file_name: fileName,
    }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function fetchPresence(userId) {
  const url =
    userId ?
      `${API_BASE}/chat/presence?user_id=${userId}`
    : `${API_BASE}/chat/presence`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch presence");
  return res.json();
}

export async function updatePresence(userId, status, channelId = null) {
  const res = await fetch(`${API_BASE}/chat/presence?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, current_channel_id: channelId }),
  });
  if (!res.ok) throw new Error("Failed to update presence");
  return res.json();
}

export async function fetchDMUsers(userId) {
  const res = await fetch(`${API_BASE}/chat/dm-users?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch DM users");
  return res.json();
}

// ============================================================
// FILE UPLOAD
// ============================================================

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to upload file");
  }

  return res.json();
}

// AVATAR UPLOAD
// ============================================================

export async function uploadAvatar(userId, file) {
  const formData = new FormData();
  formData.append("avatar", file);
  formData.append("user_id", userId);

  const res = await fetch(`${API_BASE}/upload/avatar`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to upload avatar");
  }

  return res.json();
}

export function getAvatarUrl(userId) {
  return `${API_BASE}/upload/avatar/${userId}`;
}

export async function deleteAvatar(userId) {
  const res = await fetch(`${API_BASE}/upload/avatar/${userId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete avatar");
  }

  return res.json();
}

// ============================================================
// ADMIN
// ============================================================

export async function deleteUser(userId) {
  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json();
}

export async function updateUser(userId, data) {
  const res = await fetch(`${API_BASE}/users/${userId}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

export async function deleteProject(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete project");
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Failed to fetch health");
  return res.json();
}

// ============================================================
// ERROR REPORTING
// ============================================================

export async function fetchErrors(status = "all", type = "all", page = 1, limit = 20) {
  const params = new URLSearchParams();
  if (status !== "all") params.append("status", status);
  if (type !== "all") params.append("type", type);
  params.append("page", page);
  params.append("limit", limit);
  
  const res = await fetch(`${API_BASE}/errors?${params}`);
  if (!res.ok) throw new Error("Failed to fetch errors");
  return res.json();
}

export async function fetchErrorStats() {
  const res = await fetch(`${API_BASE}/errors/stats`);
  if (!res.ok) throw new Error("Failed to fetch error stats");
  return res.json();
}

export async function fetchRecentErrors() {
  const res = await fetch(`${API_BASE}/errors/recent`);
  if (!res.ok) throw new Error("Failed to fetch recent errors");
  return res.json();
}

export async function updateErrorStatus(errorId, status, resolvedBy = null) {
  const res = await fetch(`${API_BASE}/errors/${errorId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, resolved_by: resolvedBy }),
  });
  if (!res.ok) throw new Error("Failed to update error status");
  return res.json();
}

export async function deleteError(errorId) {
  const res = await fetch(`${API_BASE}/errors/${errorId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete error");
  return res.json();
}

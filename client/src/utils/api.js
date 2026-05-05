// src/utils/api.js
// Allow overriding the API base via Vite env (VITE_API_BASE); fallback to local dev server.
export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

// Helper to get user header for auth
export function getUserHeaders() {
  const userStr = localStorage.getItem("syncup_user");
  if (!userStr) return {};
  try {
    const user = JSON.parse(userStr);
    return { "x-user": JSON.stringify(user) };
  } catch {
    return {};
  }
}

// Error reporting function (defined first so handleApiError can use it)
export async function reportError(errorType, message, details = {}) {
  let userId = details.userId || null;

  // Auto-capture userId from localStorage if available
  if (!userId && typeof localStorage !== "undefined") {
    try {
      const userStr = localStorage.getItem("syncup_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        userId = user.id;
      }
    } catch {
      // Ignore parse errors
    }
  }

  const payload = {
    error_type: errorType,
    message: message,
    stack: details.stack || null,
    user_id: userId,
    page_url:
      details.pageUrl ||
      (typeof window !== "undefined" ? window.location.pathname : ""),
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  };

  try {
    await fetch(`${API_BASE}/errors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silent fail - don't break the app
  }
}

// Auto-report errors helper (doesn't block the call)
async function handleApiError(res, endpoint, errorType = "api") {
  if (!res.ok) {
    // Check for maintenance mode (503)
    if (res.status === 503) {
      try {
        const errorData = await res.clone().json();
        window.location.href = `/maintenance?message=${encodeURIComponent(errorData.message || "")}`;
      } catch {
        window.location.href = "/maintenance";
      }
      return res;
    }

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
  const res = await fetch(url, { headers: getUserHeaders() });
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

export async function updateProjectLinks(id, userId, links) {
  const res = await fetch(`${API_BASE}/projects/${id}/links`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify({
      user_id: userId,
      github_url: links.github_url || null,
      live_url: links.live_url || null,
      case_study_problem: links.case_study_problem || null,
      case_study_solution: links.case_study_solution || null,
      case_study_tech_stack: links.case_study_tech_stack || null,
      case_study_outcomes: links.case_study_outcomes || null,
      case_study_artifact_url: links.case_study_artifact_url || null,
    }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update project case study");
  }
  return res.json();
}

// ----------------------------------------------------
// ANALYTICS
// ----------------------------------------------------
export async function fetchActiveProjectsAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/projects/active`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch active projects analytics");
  return res.json();
}

export async function fetchWeeklyUpdatesAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/updates/weekly`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch weekly updates analytics");
  return res.json();
}

export async function fetchMentorEngagementAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/mentors/engagement`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch mentor engagement analytics");
  return res.json();
}

// ----------------------------------------------------
// ACTIVITY CORRELATION ANALYTICS
// ----------------------------------------------------

export async function fetchMentorshipGrowthCorrelation() {
  const res = await fetch(
    `${API_BASE}/analytics/correlation/mentorship-growth`,
    { headers: getUserHeaders() },
  );
  if (!res.ok) throw new Error("Failed to fetch mentorship growth correlation");
  return res.json();
}

export async function fetchEffectivePairings() {
  const res = await fetch(
    `${API_BASE}/analytics/correlation/effective-pairings`,
    { headers: getUserHeaders() },
  );
  if (!res.ok) throw new Error("Failed to fetch effective pairings");
  return res.json();
}

export async function fetchEngagementLoops() {
  const res = await fetch(
    `${API_BASE}/analytics/correlation/engagement-loops`,
    { headers: getUserHeaders() },
  );
  if (!res.ok) throw new Error("Failed to fetch engagement loops");
  return res.json();
}

// ----------------------------------------------------
// USERS
// ----------------------------------------------------
export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`, { headers: getUserHeaders() });
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
  const res = await fetch(url, { headers: getUserHeaders() });
  await handleApiError(res, "/progress_updates");
  return res.json();
}

export async function postUpdate(content, projectId, userId, skills = []) {
  const res = await fetch(`${API_BASE}/progress_updates`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
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
// PROGRESS UPDATE MUTATIONS
// ----------------------------------------------------
export async function updateProgressUpdate(id, content) {
  const res = await fetch(`${API_BASE}/progress_updates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to update progress update");
  return res.json();
}

export async function deleteProgressUpdate(id) {
  const res = await fetch(`${API_BASE}/progress_updates/${id}`, {
    method: "DELETE",
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete progress update");
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

  const res = await fetch(url, { headers: getUserHeaders() });
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
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create mentorship session");
  return res.json();
}

// ----------------------------------------------------
// MENTORSHIP - GET MENTORS
// ----------------------------------------------------
export async function fetchMentors() {
  const res = await fetch(`${API_BASE}/mentorship/mentors`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch mentors");
  return res.json();
}

export async function fetchMentorDetails(id) {
  const res = await fetch(`${API_BASE}/mentorship/mentor/${id}/details`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch mentor details");
  return res.json();
}

export async function fetchAvailableMentors() {
  const res = await fetch(`${API_BASE}/mentorship/mentors/available`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch available mentors");
  return res.json();
}

export async function fetchProjectMentors() {
  const res = await fetch(`${API_BASE}/mentorship/mentors/project`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch project mentors");
  return res.json();
}

// ----------------------------------------------------
// MENTORSHIP - UPDATE SESSION STATUS (PUT)
// ----------------------------------------------------
export async function updateSessionStatus(id, { status, skill_ids = [] }) {
  const res = await fetch(`${API_BASE}/mentorship/sessions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
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
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
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
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
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
    headers: getUserHeaders(),
  });

  if (!res.ok) throw new Error("Failed to delete session");
  return res.json();
}

// ----------------------------------------------------
// MENTORSHIP - SESSIONS
// ----------------------------------------------------
export async function fetchInternSessions(internId, status = "all") {
  const url =
    status && status !== "all" ?
      `${API_BASE}/mentorship/sessions/intern/${internId}?status=${status}`
    : `${API_BASE}/mentorship/sessions/intern/${internId}`;

  const res = await fetch(url, { headers: getUserHeaders() });
  if (!res.ok) throw new Error("Failed to fetch intern sessions");
  return res.json();
}

export async function fetchMentorSessions(mentorId, status = "all") {
  const url =
    status && status !== "all" ?
      `${API_BASE}/mentorship/sessions/mentor/${mentorId}?status=${status}`
    : `${API_BASE}/mentorship/sessions/mentor/${mentorId}`;

  const res = await fetch(url, { headers: getUserHeaders() });
  if (!res.ok) throw new Error("Failed to fetch mentor sessions");
  return res.json();
}

export async function fetchMentorAvailability(mentorId) {
  const res = await fetch(
    `${API_BASE}/mentorship/mentors/${mentorId}/availability`,
    { headers: getUserHeaders() },
  );
  if (!res.ok) throw new Error("Failed to fetch mentor availability");
  return res.json();
}

// ----------------------------------------------------
// CREATE PROJECT
// ----------------------------------------------------
// CREATE PROJECT
// ----------------------------------------------------
export async function createProject(data) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

// ----------------------------------------------------
// SKILLS - TRACKER & DISTRIBUTION
// ----------------------------------------------------
export async function fetchSkills() {
  const res = await fetch(`${API_BASE}/skills?include_usage=true`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch skills");
  }
  return res.json();
}

export async function getRecentSkills(userId) {
  const res = await fetch(`${API_BASE}/skills/user/${userId}/recent`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load recent skills");
  return res.json();
}

export async function getSkillDistribution(userId) {
  const res = await fetch(`${API_BASE}/skills/user/${userId}/distribution`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load skill distribution");
  return res.json();
}

export async function getSkillMomentum(userId) {
  const res = await fetch(`${API_BASE}/skills/user/${userId}/momentum`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load skill momentum");
  return res.json();
}

export async function getSkillActivity(userId) {
  const res = await fetch(`${API_BASE}/skills/user/${userId}/activity`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load skill activity");
  return res.json();
}

export async function getSkillSummary(userId) {
  const res = await fetch(`${API_BASE}/skills/user/${userId}/summary`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch skill summary");
  return res.json();
}

// ----------------------------------------------------
// PROJECT SKILLS
// ----------------------------------------------------
export const fetchProjectSkills = async () => {
  const response = await fetch(`${API_BASE}/projects/skills`, {
    headers: getUserHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch project skills");
  return response.json();
};

// ----------------------------------------------------
// ATTACH PROJECT SKILLS
// ----------------------------------------------------
export async function attachProjectSkills(projectId, skillIds) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/skills`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify({ skill_ids: skillIds }),
  });

  if (!res.ok) throw new Error("Failed to attach project skills");
}

export async function fetchProjectDiscussions(projectId, userId) {
  const query = userId ? `?user_id=${userId}` : "";
  const res = await fetch(`${API_BASE}/projects/${projectId}/discussions${query}`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch project discussion");
  return res.json();
}

export async function postProjectDiscussion(projectId, userId, content) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/discussions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify({ user_id: userId, content }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to post project discussion");
  }
  return res.json();
}

// ============================================================
// PROJECT JOIN REQUESTS
// ============================================================

export async function createJoinRequest(projectId, userId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/join-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create join request");
  }
  return res.json();
}

export async function getProjectRequests(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/requests`, {
    headers: getUserHeaders(),
  });
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
      headers: { "Content-Type": "application/json", ...getUserHeaders() },
    },
  );
  if (!res.ok) throw new Error("Failed to reject request");
  return res.json();
}

// ============================================================
// SKILL VALIDATIONS (Upvotes & Endorsements)
// ============================================================

// Add validation (upvote or mentor endorsement)
export async function addSkillValidation(
  signalId,
  validatorId,
  validationType = "upvote",
) {
  const res = await fetch(`${API_BASE}/skills/${signalId}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify({
      validator_id: validatorId,
      validation_type: validationType,
    }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to add validation");
  }
  return res.json();
}

// Remove validation
export async function removeSkillValidation(
  signalId,
  validatorId,
  validationType = "upvote",
) {
  const res = await fetch(`${API_BASE}/skills/${signalId}/validate`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify({
      validator_id: validatorId,
      validation_type: validationType,
    }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to remove validation");
  }
  return res.json();
}

// Get validation counts for a signal
export async function getSkillValidations(signalId) {
  const res = await fetch(`${API_BASE}/skills/${signalId}/validations`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch validations");
  return res.json();
}

// Get user's received validations (show on their profile)
export async function getUserReceivedValidations(userId) {
  const res = await fetch(`${API_BASE}/skills/user/${userId}/validations`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch user validations");
  return res.json();
}

// Get which signals a user has already validated
export async function getUserValidatedSignals(userId) {
  const res = await fetch(`${API_BASE}/skills/user/${userId}/has-validated`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch validated signals");
  return res.json();
}

// Get user's skill signals with validation counts (for validation UI)
export async function getUserSkillSignals(userId) {
  const res = await fetch(`${API_BASE}/skills/user/${userId}/signals`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch skill signals");
  return res.json();
}

// Get pending skill verifications for a user
export async function fetchPendingVerifications(userId) {
  const res = await fetch(`${API_BASE}/skills/verifications/pending?user_id=${userId}`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch pending verifications");
  return res.json();
}

// Verify a skill claim
export async function verifySkillClaim(verificationId, userId) {
  const res = await fetch(`${API_BASE}/skills/verifications/${verificationId}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) throw new Error("Failed to verify skill claim");
  return res.json();
}

// Challenge a skill claim
export async function challengeSkillClaim(verificationId, userId, reason = "") {
  const res = await fetch(`${API_BASE}/skills/verifications/${verificationId}/challenge`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify({ user_id: userId, reason }),
  });
  if (!res.ok) throw new Error("Failed to challenge skill claim");
  return res.json();
}

// ============================================================
// NOTIFICATIONS
// ============================================================

// Get user notifications
export async function fetchNotifications(userId, limit = 50) {
  const res = await fetch(
    `${API_BASE}/notifications/${userId}?limit=${limit}`,
    { headers: getUserHeaders() },
  );
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

// Get unread count
export async function fetchUnreadCount(userId) {
  const res = await fetch(`${API_BASE}/notifications/${userId}/unread-count`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch unread count");
  return res.json();
}

export async function fetchUnifiedCounts(userId) {
  const res = await fetch(`${API_BASE}/notifications/${userId}/unified-counts`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch unified counts");
  return res.json();
}

// Mark notification as read
export async function markNotificationAsRead(notificationId) {
  const res = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
    method: "PUT",
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to mark as read");
  return res.json();
}

// Mark all as read
export async function markAllNotificationsAsRead(userId) {
  const res = await fetch(`${API_BASE}/notifications/${userId}/read-all`, {
    method: "PUT",
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to mark all as read");
  return res.json();
}

// Delete notification
export async function deleteNotification(notificationId) {
  const res = await fetch(`${API_BASE}/notifications/${notificationId}`, {
    method: "DELETE",
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete notification");
  return res.json();
}

// ============================================================
// CHAT
// ============================================================

export async function fetchChannels(userId) {
  const query = userId ? `?user_id=${userId}` : "";
  const res = await fetch(`${API_BASE}/chat/channels${query}`, {
    headers: getUserHeaders(),
  });
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
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
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
      headers: getUserHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to join channel");
  return res.json();
}

export async function fetchChannelMessages(channelId, limit = 50, userId = null) {
  const params = new URLSearchParams({ limit });
  if (userId) params.set("user_id", userId);
  const res = await fetch(
    `${API_BASE}/chat/channels/${channelId}/messages?${params.toString()}`,
    { headers: getUserHeaders() },
  );
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export async function fetchDMMessages(userId, currentUserId, limit = 50) {
  const res = await fetch(
    `${API_BASE}/chat/dm/${userId}?currentUserId=${currentUserId}&limit=${limit}`,
    { headers: getUserHeaders() },
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
  const body = { content };
  if (channelId) body.channel_id = channelId;
  if (recipientId) body.recipient_id = recipientId;
  if (fileUrl) body.file_url = fileUrl;
  if (fileName) body.file_name = fileName;

  const res = await fetch(`${API_BASE}/chat/messages?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify(body),
  });
  await handleApiError(res, "/chat/messages");
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function fetchPresence(userId) {
  const url =
    userId ?
      `${API_BASE}/chat/presence?user_id=${userId}`
    : `${API_BASE}/chat/presence`;
  const res = await fetch(url, { headers: getUserHeaders() });
  if (!res.ok) throw new Error("Failed to fetch presence");
  return res.json();
}

export async function updatePresence(userId, status, channelId = null, lastPage = null) {
  const body = { status };
  if (channelId && typeof channelId === "number") body.current_channel_id = channelId;
  if (lastPage || (channelId && typeof channelId === "string")) {
    body.last_page = lastPage || (typeof channelId === "string" ? channelId : null);
  }

  const res = await fetch(`${API_BASE}/chat/presence?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update presence");
  return res.json();
}

export async function fetchDMUsers(userId, scope = "chat", recentOnly = false, targetUserId = null) {
  const params = new URLSearchParams({
    user_id: userId,
    scope,
    recent_only: recentOnly,
  });
  if (targetUserId) params.set("target_user_id", targetUserId);
  const res = await fetch(`${API_BASE}/chat/dm-users?${params.toString()}`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch DM users");
  return res.json();
}

// Cohort Messages (intern-to-intern communication)
export async function fetchCohortMessages(cycleId) {
  const res = await fetch(`${API_BASE}/chat/cohort/${cycleId}/messages`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch cohort messages");
  return res.json();
}

export async function sendCohortMessage(cycleId, senderId, content) {
  const res = await fetch(`${API_BASE}/chat/cohort/${cycleId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify({ content, sender_id: senderId }),
  });
  if (!res.ok) throw new Error("Failed to send cohort message");
  return res.json();
}

export async function fetchCohortUsers(cycleId) {
  const res = await fetch(`${API_BASE}/users/cohort/${cycleId}`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch cohort users");
  return res.json();
}

export async function fetchIntroductions(userId, limit = 5) {
  const params = new URLSearchParams({ limit });
  if (userId) params.set("user_id", userId);
  const res = await fetch(`${API_BASE}/chat/introductions?${params.toString()}`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch introductions");
  return res.json();
}

// ============================================================
// ANNOUNCEMENTS
// ============================================================

export const fetchAnnouncements = async (userId = null) => {
  const query = userId ? `?user_id=${userId}` : "";
  const res = await fetch(`${API_BASE}/announcements${query}`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch announcements");
  return res.json();
};

export const markAnnouncementRead = async (id, userId) => {
  const res = await fetch(`${API_BASE}/announcements/${id}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) throw new Error("Failed to mark announcement as read");
  return res.json();
};

export const createAnnouncement = async (data, userId) => {
  const res = await fetch(`${API_BASE}/announcements?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to create announcement");
  }
  return res.json();
};

export const updateAnnouncement = async (id, data, userId) => {
  const res = await fetch(`${API_BASE}/announcements/${id}?user_id=${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update announcement");
  }
  return res.json();
};

export const deleteAnnouncement = async (id, userId = null) => {
  const query = userId ? `?user_id=${userId}` : "";
  const res = await fetch(`${API_BASE}/announcements/${id}${query}`, {
    method: "DELETE",
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete announcement");
  return res.json();
};

export const fetchPollForAnnouncement = async (announcementId, userId) => {
  const query = userId ? `?user_id=${userId}` : "";
  const res = await fetch(`${API_BASE}/announcements/${announcementId}/poll${query}`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch poll");
  return res.json();
};

export const submitPollVote = async (pollId, userId, optionId) => {
  const res = await fetch(`${API_BASE}/announcements/polls/${pollId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify({ user_id: userId, option_id: optionId }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to submit vote");
  }
  return res.json();
};

// ============================================================
// EVENTS
// ============================================================

export const fetchEvents = async (userId) => {
  const query = userId ? `?user_id=${userId}` : "";
  const res = await fetch(`${API_BASE}/events${query}`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
};

export const createEvent = async (data, userId) => {
  const res = await fetch(`${API_BASE}/events?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to create event");
  }
  return res.json();
};

export const updateEvent = async (eventId, data, userId) => {
  const res = await fetch(`${API_BASE}/events/${eventId}?user_id=${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update event");
  }
  return res.json();
};

export const rsvpEvent = async (eventId, userId, status = "attending") => {
  const res = await fetch(`${API_BASE}/events/${eventId}/rsvp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getUserHeaders() },
    body: JSON.stringify({ user_id: userId, status }),
  });
  if (!res.ok) throw new Error("Failed to RSVP");
  return res.json();
};

export const deleteEvent = async (eventId, userId = null) => {
  const query = userId ? `?user_id=${userId}` : "";
  const res = await fetch(`${API_BASE}/events/${eventId}${query}`, {
    method: "DELETE",
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete event");
  return res.json();
};

// ============================================================
// FILE UPLOAD
// ============================================================

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload/upload`, {
    method: "POST",
    headers: getUserHeaders(),
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
    headers: getUserHeaders(),
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
    headers: getUserHeaders(),
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
    headers: {
      "Content-Type": "application/json",
      ...getUserHeaders(),
    },
    body: JSON.stringify(data),
  });
  await handleApiError(res, `/users/${userId}/profile`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update user");
  }
  return res.json();
}

export async function fetchMemberDirectory(filters = {}) {
  const params = new URLSearchParams();
  if (filters.role && filters.role !== "all") params.set("role", filters.role);
  if (filters.cycle) params.set("cycle", filters.cycle);
  if (filters.search) params.set("search", filters.search);

  const query = params.toString();
  const res = await fetch(`${API_BASE}/users/directory${query ? `?${query}` : ""}`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch member directory");
  return res.json();
}

export async function fetchGovernancePositions() {
  const res = await fetch(`${API_BASE}/governance/positions`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch governance positions");
  return res.json();
}

export async function fetchUserGovernance(userId) {
  const res = await fetch(`${API_BASE}/governance/user/${userId}`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch user governance");
  return res.json();
}

export async function assignGovernancePosition(data) {
  const res = await fetch(`${API_BASE}/governance/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getUserHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to assign governance position");
  return res.json();
}

export async function removeGovernancePosition(id) {
  const res = await fetch(`${API_BASE}/governance/remove/${id}`, {
    method: "DELETE",
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to remove governance position");
  return res.json();
}

export async function fetchOpportunities(userId) {
  const params = new URLSearchParams();
  if (userId) params.set("user_id", userId);

  const res = await fetch(
    `${API_BASE}/opportunities${params.toString() ? `?${params}` : ""}`,
    { headers: getUserHeaders() },
  );
  if (!res.ok) throw new Error("Failed to fetch opportunities");
  return res.json();
}

export async function createOpportunity(data) {
  const res = await fetch(`${API_BASE}/opportunities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getUserHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to create opportunity");
  }
  return res.json();
}

export async function deleteOpportunity(id, userId) {
  const params = new URLSearchParams();
  if (userId) params.set("user_id", userId);

  const res = await fetch(
    `${API_BASE}/opportunities/${id}${params.toString() ? `?${params}` : ""}`,
    {
      method: "DELETE",
      headers: getUserHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to delete opportunity");
  return res.json();
}

export async function fetchEncouragements(targetCycle, requesterId) {
  const params = new URLSearchParams();
  if (targetCycle) params.set("target_cycle", targetCycle);
  if (requesterId) params.set("requester_id", requesterId);

  const res = await fetch(`${API_BASE}/encouragements?${params}`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch encouragements");
  return res.json();
}

export async function createEncouragement(data) {
  const res = await fetch(`${API_BASE}/encouragements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getUserHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to post encouragement");
  }
  return res.json();
}

export async function deleteEncouragement(id, userId) {
  const params = new URLSearchParams();
  if (userId) params.set("user_id", userId);

  const res = await fetch(`${API_BASE}/encouragements/${id}?${params}`, {
    method: "DELETE",
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete encouragement");
  return res.json();
}

export async function fetchCycles(status) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);

  const res = await fetch(`${API_BASE}/cycles${params.toString() ? `?${params}` : ""}`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch cycles");
  return res.json();
}

export async function createCycle(data) {
  const res = await fetch(`${API_BASE}/cycles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getUserHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to create cycle");
  }
  return res.json();
}

export async function updateCycleStatus(id, status, adminId) {
  const res = await fetch(`${API_BASE}/cycles/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getUserHeaders(),
    },
    body: JSON.stringify({ status, admin_id: adminId }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update cycle");
  }
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
  const res = await fetch(`${API_BASE}/health`, { headers: getUserHeaders() });
  if (!res.ok) throw new Error("Failed to fetch health");
  return res.json();
}

// ============================================================
// ERROR REPORTING
// ============================================================

export async function fetchErrors(
  status = "all",
  type = "all",
  page = 1,
  limit = 20,
) {
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

// ============================================================
// ADMIN
// ============================================================

export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch admin stats");
  return res.json();
}

export async function fetchActiveSessions() {
  const res = await fetch(`${API_BASE}/admin/active-sessions`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch active sessions");
  return res.json();
}

export async function fetchPlatformStats() {
  const res = await fetch(`${API_BASE}/admin/platform-stats`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch platform stats");
  return res.json();
}

export async function fetchGrowthStats() {
  const res = await fetch(`${API_BASE}/admin/growth-stats`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch growth stats");
  return res.json();
}

// ============================================================
// MAINTENANCE MODE
// ============================================================

export async function fetchMaintenanceSettings() {
  const res = await fetch(`${API_BASE}/admin/settings/maintenance`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch maintenance settings");
  return res.json();
}

export async function updateMaintenanceSettings(enabled, message) {
  const res = await fetch(`${API_BASE}/admin/settings/maintenance`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getUserHeaders(),
    },
    body: JSON.stringify({ enabled, message }),
  });
  if (!res.ok) throw new Error("Failed to update maintenance settings");
  return res.json();
}

// ============================================================
// ADMIN INVITATIONS
// ============================================================

export async function createInvitation(email) {
  const res = await fetch(`${API_BASE}/admin/invitations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getUserHeaders(),
    },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create invitation");
  return data;
}

export async function fetchInvitations() {
  const res = await fetch(`${API_BASE}/admin/invitations`, {
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch invitations");
  return res.json();
}

export async function revokeInvitation(id) {
  const res = await fetch(`${API_BASE}/admin/invitations/${id}`, {
    method: "DELETE",
    headers: getUserHeaders(),
  });
  if (!res.ok) throw new Error("Failed to revoke invitation");
  return res.json();
}

export async function validateInvitation(token) {
  const res = await fetch(
    `${API_BASE}/admin/invitations/validate?token=${token}`,
  );
  const data = await res.json();
  return { ok: res.ok, ...data };
}

export async function registerWithInvitation(token, name, password) {
  const res = await fetch(`${API_BASE}/admin/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, name, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to register");
  return data;
}

// =============================================
// Auth API functions
// =============================================
export const registerAccount = async (data) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Registration failed");
  return result;
};

export const loginAccount = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Login failed");
  return result;
};

export const resendVerificationEmail = async (email) => {
  const res = await fetch(`${API_BASE}/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

export const verifyEmailToken = async (token) => {
  const res = await fetch(`${API_BASE}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Verification failed");
  return result;
};

export const forgotPasswordRequest = async (email) => {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

export const resetPasswordWithToken = async (token, password) => {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Reset failed");
  return result;
};

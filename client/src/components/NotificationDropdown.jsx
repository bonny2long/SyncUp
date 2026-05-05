import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCheck,
  Trash2,
  X,
  RefreshCw,
  CheckCircle,
  XCircle,
  Check,
  Pause,
  Award,
  FileText,
  Trophy,
  Bell,
  Shield,
  AlertTriangle,
  Users,
  Briefcase,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  fetchPendingVerifications,
  verifySkillClaim,
  challengeSkillClaim,
  fetchMentorSessions,
  updateSessionStatus,
  getUserProjectRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from "../utils/api";
import { formatDistanceToNow } from "date-fns";

export default function NotificationDropdown({
  notifications,
  counts,
  loading,
  onRefresh,
  onClose,
}) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notifications");
  
  // Tab-specific states
  const [verifications, setVerifications] = useState([]);
  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const [projectRequests, setProjectRequests] = useState([]);
  
  const [tabLoading, setTabLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const loadTabData = useCallback(async () => {
    if (!user?.id) return;
    setTabLoading(true);
    try {
      if (activeTab === "verifications") {
        const data = await fetchPendingVerifications(user.id);
        setVerifications(data);
      } else if (activeTab === "mentorship") {
        const data = await fetchMentorSessions(user.id, "pending");
        setMentorshipRequests(data);
      } else if (activeTab === "projects") {
        const data = await getUserProjectRequests(user.id);
        setProjectRequests(data);
      }
    } catch (err) {
      console.error(`Failed to load ${activeTab} data:`, err);
    } finally {
      setTabLoading(false);
    }
  }, [activeTab, user?.id]);

  useEffect(() => {
    if (activeTab !== "notifications") {
      loadTabData();
    }
  }, [activeTab, loadTabData]);

  // -- Mentorship Actions --
  const handleSessionAction = async (sessionId, status) => {
    setProcessingId(sessionId);
    try {
      await updateSessionStatus(sessionId, { status });
      setMentorshipRequests(prev => prev.filter(s => s.id !== sessionId));
      onRefresh(); // Refresh total count
    } catch (err) {
      console.error("Failed to update session:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // -- Project Actions --
  const handleProjectRequest = async (projectId, requestId, action) => {
    setProcessingId(requestId);
    try {
      if (action === "approve") {
        await approveJoinRequest(projectId, requestId);
      } else {
        await rejectJoinRequest(projectId, requestId);
      }
      setProjectRequests(prev => prev.filter(r => r.id !== requestId));
      onRefresh();
    } catch (err) {
      console.error("Failed to process project request:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // -- Verification Actions --
  const handleVerify = async (verificationId) => {
    setProcessingId(verificationId);
    try {
      await verifySkillClaim(verificationId, user.id);
      setVerifications((prev) => prev.filter((v) => v.id !== verificationId));
      onRefresh();
    } catch (err) {
      console.error("Failed to verify:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleChallenge = async (verificationId) => {
    const reason = prompt("Why are you challenging this skill claim?");
    if (!reason) return;
    setProcessingId(verificationId);
    try {
      await challengeSkillClaim(verificationId, user.id, reason);
      setVerifications((prev) => prev.filter((v) => v.id !== verificationId));
      onRefresh();
    } catch (err) {
      console.error("Failed to challenge:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // -- Notification Actions --
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      onRefresh();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await markAllNotificationsAsRead(user.id);
      onRefresh();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDelete = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await deleteNotification(notificationId);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleClick = async (notification) => {
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const renderEmpty = (icon, title, subtitle) => (
    <div className="p-8 text-center bg-surface">
      {React.cloneElement(icon, { className: "w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" })}
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
    </div>
  );

  return (
    <div className="absolute right-0 top-12 w-[400px] bg-surface rounded-xl shadow-2xl border border-border z-50 max-h-[600px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Tabs */}
      <div className="flex border-b border-border bg-gray-50/50 dark:bg-gray-900/50">
        <TabButton 
          active={activeTab === "notifications"} 
          onClick={() => setActiveTab("notifications")}
          icon={<Bell className="w-4 h-4" />}
          label="Alerts"
          count={counts?.notifications}
        />
        <TabButton 
          active={activeTab === "mentorship"} 
          onClick={() => setActiveTab("mentorship")}
          icon={<Users className="w-4 h-4" />}
          label="Mentor"
          count={counts?.mentorship}
        />
        <TabButton 
          active={activeTab === "projects"} 
          onClick={() => setActiveTab("projects")}
          icon={<Briefcase className="w-4 h-4" />}
          label="Projects"
          count={counts?.join_requests}
        />
        <TabButton 
          active={activeTab === "verifications"} 
          onClick={() => setActiveTab("verifications")}
          icon={<Shield className="w-4 h-4" />}
          label="Verify"
          count={counts?.verifications}
        />
      </div>

      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
        <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
          {activeTab === "notifications" && "Recent Notifications"}
          {activeTab === "mentorship" && "Mentorship Requests"}
          {activeTab === "projects" && "Project Join Requests"}
          {activeTab === "verifications" && "Skill Verifications"}
          {counts?.chat > 0 && activeTab === "notifications" && (
             <span className="flex items-center gap-1 text-[10px] bg-[#b9123f]/10 text-[#b9123f] px-1.5 py-0.5 rounded-full font-bold">
               <MessageSquare className="w-2.5 h-2.5" />
               {counts.chat} unread chat
             </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={activeTab === "notifications" ? onRefresh : loadTabData}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            disabled={loading || tabLoading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading || tabLoading ? "animate-spin" : ""}`} />
          </button>
          {activeTab === "notifications" && notifications.some((n) => !n.is_read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-[11px] font-semibold text-primary hover:opacity-80 flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md"
            >
              <CheckCheck className="w-3 h-3" />
              Mark all
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1 bg-surfaceCustom">
        {tabLoading || loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 mx-auto text-primary animate-spin mb-3 opacity-20" />
            <p className="text-xs text-text-secondary animate-pulse">Updating dashboard...</p>
          </div>
        ) : (
          <>
            {activeTab === "notifications" && (
              notifications.length === 0 ? (
                renderEmpty(<Bell />, "All caught up!", "No new notifications for you right now")
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onClick={() => handleClick(n)}
                      onDelete={(e) => handleDelete(n.id, e)}
                    />
                  ))}
                </div>
              )
            )}

            {activeTab === "mentorship" && (
              mentorshipRequests.length === 0 ? (
                renderEmpty(<Users />, "No pending sessions", "You have no mentorship requests waiting")
              ) : (
                <div className="divide-y divide-border">
                  {mentorshipRequests.slice(0, 5).map((s) => (
                    <div key={s.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#b9123f]/10 flex items-center justify-center text-[#b9123f] font-bold shrink-0">
                          {s.intern_name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {s.intern_name} <span className="font-normal text-xs text-text-secondary">requested a session</span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1 italic">"{s.topic}"</p>
                          <p className="text-[10px] text-text-secondary mt-1">
                            {formatDistanceToNow(new Date(s.session_date), { addSuffix: true })}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleSessionAction(s.id, "accepted")}
                              disabled={!!processingId}
                              className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleSessionAction(s.id, "declined")}
                              disabled={!!processingId}
                              className="px-3 py-1 border border-border text-text-secondary text-[10px] font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {mentorshipRequests.length > 5 && (
                    <button 
                      onClick={() => { navigate("/mentorship"); onClose(); }}
                      className="w-full py-3 text-xs text-primary font-bold hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-1"
                    >
                      View all {mentorshipRequests.length} requests <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )
            )}

            {activeTab === "projects" && (
              projectRequests.length === 0 ? (
                renderEmpty(<Briefcase />, "No join requests", "Your projects are all set for now")
              ) : (
                <div className="divide-y divide-border">
                  {projectRequests.slice(0, 5).map((r) => (
                    <div key={r.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                       <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                          {r.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {r.name} <span className="font-normal text-xs text-text-secondary">wants to join</span>
                          </p>
                          <p className="text-xs text-primary font-bold mt-0.5">{r.project_title}</p>
                          <p className="text-[10px] text-text-secondary mt-1">
                            {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleProjectRequest(r.project_id, r.id, "approve")}
                              disabled={!!processingId}
                              className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg hover:opacity-90"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleProjectRequest(r.project_id, r.id, "reject")}
                              disabled={!!processingId}
                              className="px-3 py-1 border border-border text-text-secondary text-[10px] font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {projectRequests.length > 5 && (
                    <button 
                      onClick={() => { navigate("/collaboration"); onClose(); }}
                      className="w-full py-3 text-xs text-primary font-bold hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-1"
                    >
                      View all {projectRequests.length} requests <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )
            )}

            {activeTab === "verifications" && (
              verifications.length === 0 ? (
                renderEmpty(<Shield />, "Safe and verified", "No skill claims need your review")
              ) : (
                <div className="divide-y divide-border">
                  {verifications.map((v) => (
                    <div key={v.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                          <Shield className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                              {v.claimant_name}
                            </span>
                            <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-800 px-1 rounded uppercase tracking-wider">{v.claimant_role}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Claimed <span className="font-bold text-[#b9123f]">{v.skill_name}</span> on{" "}
                            <span className="opacity-70 italic">"{v.project_title}"</span>
                          </p>
                          <p className="text-[10px] text-text-secondary mt-1">
                            {v.created_at ? formatDistanceToNow(new Date(v.created_at), { addSuffix: true }) : "Recently"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 ml-12">
                        <button
                          onClick={() => handleVerify(v.id)}
                          disabled={processingId === v.id}
                          className="flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white text-[10px] font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Verify
                        </button>
                        <button
                          onClick={() => handleChallenge(v.id)}
                          disabled={processingId === v.id}
                          className="flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 transition"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Challenge
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
      
      {/* Footer Settings Link */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900/80 border-t border-border flex justify-between items-center">
         <button onClick={() => { navigate("/settings"); onClose(); }} className="text-[11px] text-text-secondary hover:text-primary transition-colors flex items-center gap-1">
           Preferences
         </button>
         {notifications.length > 0 && activeTab === "notifications" && (
           <p className="text-[10px] text-text-secondary opacity-50 italic">Showing last 20 notifications</p>
         )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 px-2 text-[11px] font-bold flex flex-col items-center justify-center gap-1.5 transition-all relative ${
        active
          ? "text-primary bg-surface"
          : "text-text-secondary opacity-60 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <div className={`p-1.5 rounded-lg ${active ? 'bg-primary/10' : ''}`}>
        {icon}
      </div>
      {label}
      {count > 0 && (
        <span className="absolute top-2 right-2 bg-[#b9123f] text-white text-[9px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center shadow-lg transform translate-x-1 -translate-y-1">
          {count > 9 ? '9+' : count}
        </span>
      )}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
      )}
    </button>
  );
}

const stripEmojis = (text) => {
  if (!text) return "";
  return text
    .replace(
      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{2122}\u{23F3}\u{24C2}\u{23E9}-\u{23EF}\u{25B6}\u{23F8}-\u{23FA}]/gu,
      "",
    )
    .trim();
};

function NotificationItem({ notification, onClick, onDelete }) {
  const formatTime = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const getIcon = (type) => {
    const iconClass = "w-5 h-5";
    const iconColor = "text-gray-700 dark:text-gray-300";

    switch (type) {
      case "join_request_approved":
        return <CheckCircle className={`${iconClass} text-green-600`} />;
      case "join_request_rejected":
        return <XCircle className={`${iconClass} text-red-600`} />;
      case "session_accepted":
        return <Check className={`${iconClass} text-green-600`} />;
      case "new_session_request":
        return <Users className={`${iconClass} text-[#b9123f]`} />;
       case "new_join_request":
        return <Briefcase className={`${iconClass} text-primary`} />;
      case "session_declined":
        return <Pause className={`${iconClass} text-[#383838]`} />;
      case "session_completed":
        return <Award className={`${iconClass} text-[#b9123f]`} />;
      case "project_update":
        return <FileText className={`${iconClass} text-gray-500`} />;
      case "project_completed":
        return <Trophy className={`${iconClass} text-yellow-600`} />;
      case "dm":
        return <MessageSquare className={`${iconClass} text-primary`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition relative group ${
        notification.is_read ? "hover:bg-gray-50 dark:hover:bg-gray-800/40" : (
          "bg-[#b9123f]/5 dark:bg-[#b9123f]/10 hover:bg-[#b9123f]/10 dark:hover:bg-[#b9123f]/20"
        )
      }`}
    >
      {!notification.is_read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b9123f]" />
      )}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={`text-sm font-bold truncate ${
                notification.is_read ? "text-gray-900 dark:text-gray-200" : "text-gray-900 dark:text-white"
              }`}
            >
              {stripEmojis(notification.title)}
            </h4>

            <button
              onClick={onDelete}
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition opacity-0 group-hover:opacity-100 flex-shrink-0"
              title="Delete"
            >
              <Trash2 className="w-3 h-3 text-gray-500" />
            </button>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 line-clamp-2">
            {stripEmojis(notification.message)}
          </p>

          <p className="text-[10px] text-text-secondary opacity-70">
            {formatTime(notification.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}

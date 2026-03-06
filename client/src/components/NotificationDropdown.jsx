import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useUser } from "../context/UserContext";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  fetchPendingVerifications,
  verifySkillClaim,
  challengeSkillClaim,
} from "../utils/api";
import { formatDistanceToNow } from "date-fns";

export default function NotificationDropdown({
  notifications,
  loading,
  onRefresh,
  onClose,
}) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notifications");
  const [verifications, setVerifications] = useState([]);
  const [verificationsLoading, setVerificationsLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (user?.id && activeTab === "verifications") {
      loadVerifications();
    }
  }, [activeTab, user?.id]);

  const loadVerifications = async () => {
    if (!user?.id) return;
    setVerificationsLoading(true);
    try {
      const data = await fetchPendingVerifications(user.id);
      setVerifications(data);
    } catch (err) {
      console.error("Failed to load verifications:", err);
    } finally {
      setVerificationsLoading(false);
    }
  };

  const handleVerify = async (verificationId) => {
    if (!user?.id) return;
    setProcessingId(verificationId);
    try {
      await verifySkillClaim(verificationId, user.id);
      setVerifications((prev) => prev.filter((v) => v.id !== verificationId));
    } catch (err) {
      console.error("Failed to verify:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleChallenge = async (verificationId) => {
    if (!user?.id) return;
    const reason = prompt("Why are you challenging this skill claim?");
    if (!reason) return;
    setProcessingId(verificationId);
    try {
      await challengeSkillClaim(verificationId, user.id, reason);
      setVerifications((prev) => prev.filter((v) => v.id !== verificationId));
    } catch (err) {
      console.error("Failed to challenge:", err);
    } finally {
      setProcessingId(null);
    }
  };

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
    // Mark as read
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate if link exists
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  return (
    <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
            activeTab === "notifications"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications
          {notifications.some((n) => !n.is_read) && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {notifications.filter((n) => !n.is_read).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("verifications")}
          className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
            activeTab === "verifications"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Shield className="w-4 h-4" />
          Verify Skills
          {verifications.length > 0 && (
            <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {verifications.length}
            </span>
          )}
        </button>
      </div>

      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          {activeTab === "notifications" ? "Notifications" : "Skill Verifications"}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={activeTab === "notifications" ? onRefresh : loadVerifications}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
            title="Refresh"
            disabled={loading || verificationsLoading}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading || verificationsLoading ? "animate-spin" : ""}`}
            />
          </button>
          {activeTab === "notifications" && notifications.some((n) => !n.is_read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-primary hover:underline flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1">
        {activeTab === "verifications" ? (
          verificationsLoading ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          ) : verifications.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No pending verifications</p>
              <p className="text-xs text-gray-400 mt-1">
                Team skill claims will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {verifications.map((v) => (
                <div key={v.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-full">
                      <Shield className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {v.claimant_name}
                        </span>
                        <span className="text-xs text-gray-500">({v.claimant_role})</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Claimed <span className="font-semibold text-primary">{v.skill_name}</span> on{" "}
                        <span className="text-gray-500">"{v.project_title}"</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        {v.created_at ? formatDistanceToNow(new Date(v.created_at), { addSuffix: true }) : "Recently"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 ml-10">
                    <button
                      onClick={() => handleVerify(v.id)}
                      disabled={processingId === v.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-full hover:bg-green-700 disabled:opacity-50 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {processingId === v.id ? "Verifying..." : "Verify"}
                    </button>
                    <button
                      onClick={() => handleChallenge(v.id)}
                      disabled={processingId === v.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-full hover:bg-red-200 disabled:opacity-50 transition"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Challenge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : loading ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">
              You'll see updates here when something happens
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleClick(notification)}
                onDelete={(e) => handleDelete(notification.id, e)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const stripEmojis = (text) => {
  if (!text) return "";
  // Regular expression to match emojis (more comprehensive)
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
    const iconColor = "text-gray-700";

    switch (type) {
      case "join_request_approved":
        return (
          <CheckCircle className={`${iconClass} ${iconColor} text-green-600`} />
        );
      case "join_request_rejected":
        return <XCircle className={`${iconClass} ${iconColor} text-red-600`} />;
      case "session_accepted":
        return <Check className={`${iconClass} ${iconColor} text-green-600`} />;
      case "session_declined":
        return (
          <Pause className={`${iconClass} ${iconColor} text-orange-600`} />
        );
      case "session_completed":
        return <Award className={`${iconClass} ${iconColor} text-blue-600`} />;
      case "project_update":
        return (
          <FileText className={`${iconClass} ${iconColor} text-gray-600`} />
        );
      case "project_completed":
        return (
          <Trophy className={`${iconClass} ${iconColor} text-yellow-600`} />
        );
      default:
        return <Bell className={`${iconClass} ${iconColor} text-gray-600`} />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition ${
        notification.is_read ? "hover:bg-gray-50" : (
          "bg-blue-50 hover:bg-blue-100"
        )
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={`text-sm font-medium ${
                notification.is_read ? "text-gray-900" : (
                  "text-gray-900 font-semibold"
                )
              }`}
            >
              {stripEmojis(notification.title)}
            </h4>

            <button
              onClick={onDelete}
              className="p-1 rounded hover:bg-gray-200 transition flex-shrink-0"
              title="Delete"
            >
              <Trash2 className="w-3 h-3 text-gray-500" />
            </button>
          </div>

          <p className="text-xs text-gray-600 mb-2">
            {stripEmojis(notification.message)}
          </p>

          <p className="text-xs text-gray-400">
            {formatTime(notification.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck, Trash2, X } from "lucide-react";
import { useUser } from "../context/UserContext";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
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
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.is_read) && (
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

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {loading ?
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        : notifications.length === 0 ?
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">
              You'll see updates here when something happens
            </p>
          </div>
        : <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleClick(notification)}
                onDelete={(e) => handleDelete(notification.id, e)}
              />
            ))}
          </div>
        }
      </div>
    </div>
  );
}

function NotificationItem({ notification, onClick, onDelete }) {
  const formatTime = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "join_request_approved":
        return "🎉";
      case "join_request_rejected":
        return "❌";
      case "session_accepted":
        return "✅";
      case "session_declined":
        return "⏸️";
      case "session_completed":
        return "🎓";
      case "project_update":
        return "📝";
      default:
        return "🔔";
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
        <div className="text-2xl flex-shrink-0">
          {getIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={`text-sm font-medium ${
                notification.is_read ? "text-gray-900" : (
                  "text-gray-900 font-semibold"
                )
              }`}
            >
              {notification.title}
            </h4>

            <button
              onClick={onDelete}
              className="p-1 rounded hover:bg-gray-200 transition flex-shrink-0"
              title="Delete"
            >
              <Trash2 className="w-3 h-3 text-gray-500" />
            </button>
          </div>

          <p className="text-xs text-gray-600 mb-2">{notification.message}</p>

          <p className="text-xs text-gray-400">
            {formatTime(notification.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}

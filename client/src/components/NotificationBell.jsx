import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useUser } from "../context/UserContext";
import { fetchNotifications, fetchUnreadCount } from "../utils/api";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell() {
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Load unread count on mount
  useEffect(() => {
    if (!user?.id) return;
    loadUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (showDropdown && user?.id) {
      loadNotifications();
    }
  }, [showDropdown, user?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const loadUnreadCount = async () => {
    if (!user?.id) return;

    try {
      const data = await fetchUnreadCount(user.id);
      setUnreadCount(data.count);
    } catch (err) {
      console.error("Failed to load unread count:", err);
    }
  };

  const loadNotifications = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await fetchNotifications(user.id, 20);
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadNotifications();
    loadUnreadCount();
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-700" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <NotificationDropdown
          notifications={notifications}
          loading={loading}
          onRefresh={handleRefresh}
          onClose={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

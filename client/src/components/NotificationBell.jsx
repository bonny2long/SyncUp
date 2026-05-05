import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useUser } from "../context/UserContext";
import { fetchNotifications, fetchUnifiedCounts } from "../utils/api";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell() {
  const { user } = useUser();
  const [counts, setCounts] = useState({
    notifications: 0,
    mentorship: 0,
    join_requests: 0,
    verifications: 0,
    chat: 0,
    total: 0,
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Load unified counts on mount
  useEffect(() => {
    if (!user?.id) return;
    loadCounts();

    // Poll for new counts every 5 seconds
    const interval = setInterval(loadCounts, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Load notifications data when dropdown opens
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

  const loadCounts = async () => {
    if (!user?.id) return;

    try {
      const data = await fetchUnifiedCounts(user.id);
      setCounts(data);
    } catch (err) {
      console.error("Failed to load counts:", err);
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
    loadCounts();
  };

  if (!user) return null;

  const isActive = counts.total > 0;
  const digestMode = user?.digest_mode;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell
          className={`w-5 h-5 transition-transform ${
            !digestMode && isActive
              ? "text-primary animate-bounce"
              : "text-gray-600 dark:text-gray-400"
          }`}
        />

        {/* Unread Badge */}
        {counts.total > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-sm ${
              digestMode ? "bg-[#383838]" : "bg-[#b9123f]"
            }`}
          >
            {counts.total > 99 ? "99+" : counts.total}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <NotificationDropdown
          notifications={notifications}
          counts={counts}
          loading={loading}
          onRefresh={handleRefresh}
          onClose={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

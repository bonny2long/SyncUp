import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import ToggleSwitch from "../shared/ToggleSwitch";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function NotificationsSection() {
  const { user, login } = useUser();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    newJoinRequests: true,
    teamMentions: true,
    sessionReminders: true,
    projectUpdates: true,
    weeklySummary: false,
  });
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (user) {
      setSettings({
        emailNotifications: user.email_notifications ?? true,
        newJoinRequests: user.notify_join_requests ?? true,
        teamMentions: user.notify_mentions ?? true,
        sessionReminders: user.notify_session_reminders ?? true,
        projectUpdates: user.notify_project_updates ?? true,
        weeklySummary: user.notify_weekly_summary ?? false,
      });
    }
  }, [user]);

  const saveSettings = async (newSettings) => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_notifications: newSettings.emailNotifications,
          notify_join_requests: newSettings.newJoinRequests,
          notify_mentions: newSettings.teamMentions,
          notify_session_reminders: newSettings.sessionReminders,
          notify_project_updates: newSettings.projectUpdates,
          notify_weekly_summary: newSettings.weeklySummary,
        }),
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        login(updatedUser);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000);
    if (diff < 60) return "Saved just now";
    return `Saved at ${lastSaved.toLocaleTimeString()}`;
  };

  return (
    <div className="bg-surface dark:bg-surface-highlight rounded-xl border border-border dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-neutral-dark dark:text-white mb-1">
        Notification Preferences
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Choose how you want to be notified
      </p>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="pb-4 border-b border-border dark:border-gray-700">
          <ToggleSwitch
            checked={settings.emailNotifications}
            onChange={() => handleToggle("emailNotifications")}
            label="Email Notifications"
            description="Receive notifications via email"
          />
        </div>

        {/* Notify me about */}
        <div>
          <h4 className="text-sm font-medium text-neutral-dark dark:text-gray-300 mb-4">
            Notify me about
          </h4>
          <div className="space-y-4">
            <ToggleSwitch
              checked={settings.newJoinRequests}
              onChange={() => handleToggle("newJoinRequests")}
              label="New project join requests"
              description="When someone wants to join your project"
            />
            <ToggleSwitch
              checked={settings.teamMentions}
              onChange={() => handleToggle("teamMentions")}
              label="Team member mentions"
              description="When someone mentions you in a project"
            />
            <ToggleSwitch
              checked={settings.sessionReminders}
              onChange={() => handleToggle("sessionReminders")}
              label="Mentorship session reminders"
              description="Upcoming mentorship session notifications"
            />
            <ToggleSwitch
              checked={settings.projectUpdates}
              onChange={() => handleToggle("projectUpdates")}
              label="Project updates"
              description="Progress updates from your projects"
            />
            <ToggleSwitch
              checked={settings.weeklySummary}
              onChange={() => handleToggle("weeklySummary")}
              label="Weekly activity summary"
              description="A weekly digest of your activity"
            />
          </div>
        </div>
      </div>

      {/* Auto-save indicator */}
      <div className="mt-6 pt-4 border-t border-border dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {saving ? (
            <span className="text-primary">Saving...</span>
          ) : (
            <span className="text-green-600 dark:text-green-400">{formatLastSaved() || "Changes save automatically"}</span>
          )}
        </p>
      </div>
    </div>
  );
}

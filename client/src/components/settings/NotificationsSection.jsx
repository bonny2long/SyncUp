import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import ToggleSwitch from "../shared/ToggleSwitch";
import {
  AtSign,
  Bell,
  Briefcase,
  CalendarDays,
  Heart,
  Mail,
  MessageSquare,
  Repeat,
  Users,
} from "lucide-react";

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
    channelMessages: true,
    directMessages: true,
    opportunities: true,
    events: true,
    encouragements: true,
    digestMode: false,
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
        channelMessages: user.notify_channel_messages ?? true,
        directMessages: user.notify_dm_messages ?? true,
        opportunities: user.notify_opportunities ?? true,
        events: user.notify_events ?? true,
        encouragements: user.notify_encouragements ?? true,
        digestMode: user.digest_mode ?? false,
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
          notify_channel_messages: newSettings.channelMessages,
          notify_dm_messages: newSettings.directMessages,
          notify_opportunities: newSettings.opportunities,
          notify_events: newSettings.events,
          notify_encouragements: newSettings.encouragements,
          digest_mode: newSettings.digestMode,
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

  const groups = [
    {
      title: "Always-On Channels",
      description: "The messages and direct activity that keep work moving.",
      items: [
        {
          key: "emailNotifications",
          icon: Mail,
          label: "Email Notifications",
          description: "Receive notifications via email",
        },
        {
          key: "directMessages",
          icon: MessageSquare,
          label: "Direct messages",
          description: "Messages sent directly to you",
        },
        {
          key: "teamMentions",
          icon: AtSign,
          label: "Mentions",
          description: "When someone mentions you in a project or conversation",
        },
      ],
    },
    {
      title: "Community Updates",
      description: "Signals from SyncChat, HQ, and shared opportunities.",
      items: [
        {
          key: "channelMessages",
          icon: Users,
          label: "Channel messages",
          description: "Community channel activity when enabled",
        },
        {
          key: "opportunities",
          icon: Briefcase,
          label: "Opportunities",
          description: "New opportunities shared by the community",
        },
        {
          key: "events",
          icon: CalendarDays,
          label: "Events",
          description: "New community events",
        },
        {
          key: "encouragements",
          icon: Heart,
          label: "Encouragements",
          description: "Community encouragement activity",
        },
      ],
    },
    {
      title: "Project And Digest",
      description: "Less urgent updates you may want batched over time.",
      items: [
        {
          key: "newJoinRequests",
          icon: Users,
          label: "New project join requests",
          description: "When someone wants to join your project",
        },
        {
          key: "sessionReminders",
          icon: CalendarDays,
          label: "Mentorship session reminders",
          description: "Upcoming mentorship session notifications",
        },
        {
          key: "projectUpdates",
          icon: Repeat,
          label: "Project updates",
          description: "Progress updates from your projects",
        },
        {
          key: "weeklySummary",
          icon: Mail,
          label: "Weekly activity summary",
          description: "A weekly digest of your activity",
        },
        {
          key: "digestMode",
          icon: Repeat,
          label: "Daily digest mode",
          description: "Batch non-urgent updates when digest delivery is added",
        },
      ],
    },
  ];

  return (
    <div className="brand-card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-primary">Notification Control</p>
          <h3 className="text-lg font-black text-neutral-dark dark:text-white">
            Notification Preferences
          </h3>
          <p className="text-sm text-text-secondary">
            Choose the signals that deserve your attention.
          </p>
        </div>
      </div>

      <div className="divide-y divide-border">
        {groups.map((group) => (
          <section key={group.title} className="p-5">
            <div className="mb-4">
              <h4 className="text-sm font-black text-neutral-dark dark:text-gray-200">
                {group.title}
              </h4>
              <p className="text-xs text-text-secondary">{group.description}</p>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    className="rounded-lg border border-border bg-surface-highlight/50 p-3 dark:bg-gray-800"
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <ToggleSwitch
                          checked={settings[item.key]}
                          onChange={() => handleToggle(item.key)}
                          label={item.label}
                          description={item.description}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Auto-save indicator */}
      <div className="border-t border-border p-5">
        <p className="text-xs font-semibold text-text-secondary">
          {saving ? (
            <span className="text-primary">Saving...</span>
          ) : (
            <span className="text-primary">{formatLastSaved() || "Changes save automatically"}</span>
          )}
        </p>
      </div>
    </div>
  );
}

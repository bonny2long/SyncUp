import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import ToggleSwitch from "../shared/ToggleSwitch";
import { Eye, Lock, Shield, UsersRound } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function PrivacySection() {
  const { user, login } = useUser();
  const [visibility, setVisibility] = useState("team");
  const [settings, setSettings] = useState({
    showEmail: false,
    showProjects: true,
    showSkills: true,
    acceptMentorship: true,
    autoAcceptTeammates: false,
  });
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const isMentor = ["mentor", "resident", "alumni"].includes(user?.role);

  useEffect(() => {
    if (user) {
      setVisibility(user.profile_visibility || "team");
      setSettings({
        showEmail: user.show_email ?? false,
        showProjects: user.show_projects ?? true,
        showSkills: user.show_skills ?? true,
        acceptMentorship: user.accept_mentorship ?? true,
        autoAcceptTeammates: user.auto_accept_teammates ?? false,
      });
    }
  }, [user]);

  const saveSettings = async (newVisibility, newSettings) => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_visibility: newVisibility,
          show_email: newSettings.showEmail,
          show_projects: newSettings.showProjects,
          show_skills: newSettings.showSkills,
          accept_mentorship: newSettings.acceptMentorship,
          auto_accept_teammates: newSettings.autoAcceptTeammates,
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

  const handleVisibilityChange = async (value) => {
    setVisibility(value);
    await saveSettings(value, settings);
  };

  const handleToggle = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    await saveSettings(visibility, newSettings);
  };

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000);
    if (diff < 60) return "Saved just now";
    return `Saved at ${lastSaved.toLocaleTimeString()}`;
  };

  const visibilityOptions = [
    {
      value: "anyone",
      label: "Anyone",
      detail: "Public profile can be viewed outside SyncUp.",
      icon: Eye,
    },
    {
      value: "team",
      label: "Community",
      detail: "Visible to logged-in iCAA community members.",
      icon: UsersRound,
    },
    {
      value: "me",
      label: "Private",
      detail: "Only you can see profile details.",
      icon: Lock,
    },
  ];

  return (
    <div className="brand-card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-primary">Visibility Rules</p>
          <h3 className="text-lg font-black text-neutral-dark dark:text-white">
            Privacy & Visibility
          </h3>
          <p className="text-sm text-text-secondary">
            Control what is visible on your community profile.
          </p>
        </div>
      </div>

      <div className="space-y-6 p-5">
        {/* Who can see your profile */}
        <div>
          <h4 className="mb-3 text-sm font-black text-neutral-dark dark:text-gray-300">
            Who can see your profile?
          </h4>
          <div className="grid gap-3 md:grid-cols-3">
            {visibilityOptions.map((option) => {
              const Icon = option.icon;
              const selected = visibility === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleVisibilityChange(option.value)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-primary bg-primary text-white shadow-md"
                      : "border-border bg-surface-highlight/50 text-neutral-dark hover:border-primary/30 dark:bg-gray-800 dark:text-gray-200"
                  }`}
                >
                  <div
                    className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${
                      selected ? "bg-white/15 text-white" : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-black">{option.label}</p>
                  <p className={`mt-1 text-xs ${selected ? "text-white/80" : "text-text-secondary"}`}>
                    {option.detail}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-6 dark:border-gray-700">
          <h4 className="mb-4 text-sm font-black text-neutral-dark dark:text-gray-300">
            Public Information
          </h4>
          <div className="grid gap-3 md:grid-cols-3">
            <ToggleSwitch
              checked={settings.showEmail}
              onChange={() => handleToggle("showEmail")}
              label="Show email address"
            />
            <ToggleSwitch
              checked={settings.showProjects}
              onChange={() => handleToggle("showProjects")}
              label="Show projects"
            />
            <ToggleSwitch
              checked={settings.showSkills}
              onChange={() => handleToggle("showSkills")}
              label="Show skills"
            />
          </div>
        </div>

        {/* Mentorship (community mentors) */}
        {isMentor && (
          <div className="border-t border-border pt-6 dark:border-gray-700">
            <h4 className="mb-4 text-sm font-black text-neutral-dark dark:text-gray-300">
              Mentorship (Community mentors)
            </h4>
            <div className="grid gap-3 md:grid-cols-2">
              <ToggleSwitch
                checked={settings.acceptMentorship}
                onChange={() => handleToggle("acceptMentorship")}
                label="Accept mentorship requests"
                description="Allow interns to send mentorship requests"
              />
              <ToggleSwitch
                checked={settings.autoAcceptTeammates}
                onChange={() => handleToggle("autoAcceptTeammates")}
                label="Auto-accept from teammates"
                description="Automatically accept requests from your team members"
              />
            </div>
          </div>
        )}
      </div>

      {/* Auto-save indicator */}
      <div className="border-t border-border p-5 dark:border-gray-700">
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

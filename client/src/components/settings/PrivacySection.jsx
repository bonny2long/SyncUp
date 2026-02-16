import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import ToggleSwitch from "../shared/ToggleSwitch";

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

  const isMentor = user?.role === "mentor";

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

  return (
    <div className="bg-surface dark:bg-surface-highlight rounded-xl border border-border dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-neutral-dark dark:text-white mb-1">
        Privacy & Visibility
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Control who can see your information
      </p>

      <div className="space-y-6">
        {/* Who can see your profile */}
        <div>
          <h4 className="text-sm font-medium text-neutral-dark dark:text-gray-300 mb-3">
            Who can see your profile?
          </h4>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="anyone"
                checked={visibility === "anyone"}
                onChange={(e) => handleVisibilityChange(e.target.value)}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-neutral-dark dark:text-gray-300">Anyone (Public)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="team"
                checked={visibility === "team"}
                onChange={(e) => handleVisibilityChange(e.target.value)}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-neutral-dark dark:text-gray-300">Team members only</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="me"
                checked={visibility === "me"}
                onChange={(e) => handleVisibilityChange(e.target.value)}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-neutral-dark dark:text-gray-300">Only me (Private)</span>
            </label>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border dark:border-gray-700 pt-6">
          <h4 className="text-sm font-medium text-neutral-dark dark:text-gray-300 mb-4">
            Public Information
          </h4>
          <div className="space-y-4">
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

        {/* Mentorship (only for mentors) */}
        {isMentor && (
          <div className="border-t border-border dark:border-gray-700 pt-6">
            <h4 className="text-sm font-medium text-neutral-dark dark:text-gray-300 mb-4">
              Mentorship (Mentors only)
            </h4>
            <div className="space-y-4">
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

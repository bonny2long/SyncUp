import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";

export default function ProfileSection() {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulated API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  const bioLength = formData.bio?.length || 0;
  const maxBioLength = 200;

  return (
    <div className="bg-surface dark:bg-surface-highlight rounded-xl border border-border dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-neutral-dark dark:text-white mb-1">
        Profile Information
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Manage your personal information
      </p>

      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-neutral-dark dark:text-gray-300 mb-1.5">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-border dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-neutral-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-neutral-dark dark:text-gray-300 mb-1.5">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-border dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-neutral-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        {/* Role (read-only) */}
        <div>
          <label className="block text-sm font-medium text-neutral-dark dark:text-gray-300 mb-1.5">
            Role
          </label>
          <input
            type="text"
            value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
            disabled
            className="w-full border border-border dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-neutralLight dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Role cannot be changed</p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-neutral-dark dark:text-gray-300 mb-1.5">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            maxLength={maxBioLength}
            rows={4}
            placeholder="Tell us about yourself..."
            className="w-full border border-border dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-neutral-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">
            {bioLength}/{maxBioLength} characters
          </p>
        </div>

        {/* Member Since (read-only) */}
        <div>
          <label className="block text-sm font-medium text-neutral-dark dark:text-gray-300 mb-1.5">
            Member Since
          </label>
          <input
            type="text"
            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "N/A"}
            disabled
            className="w-full border border-border dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-neutralLight dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Saved!
          </span>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { CheckCircle2, Save, UserRound } from "lucide-react";
import RoleBadge from "../shared/RoleBadge";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function ProfileSection() {
  const { user, login } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    headline: "",
    current_title: "",
    current_employer: "",
    bio: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        headline: user.headline || "",
        current_title: user.current_title || "",
        current_employer: user.current_employer || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
    setError("");
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) throw new Error("Failed to save");
      
      const updatedUser = await res.json();
      login(updatedUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save:", error);
      setError("Profile changes could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const bioLength = formData.bio?.length || 0;
  const maxBioLength = 200;

  return (
    <div className="brand-card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-primary">Public Identity</p>
            <h3 className="text-lg font-black text-neutral-dark dark:text-white">
              Profile Information
            </h3>
            <p className="text-sm text-text-secondary">
              Update the details that shape your community profile.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RoleBadge role={user?.role} size="sm" />
          {user?.cycle && (
            <span className="brand-pill bg-primary/10 text-primary">{user.cycle}</span>
          )}
        </div>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-2">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-neutral-dark dark:text-gray-300">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input bg-white dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-neutral-dark dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input bg-white dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-neutral-dark dark:text-gray-300">
            Headline
          </label>
          <input
            type="text"
            name="headline"
            value={formData.headline}
            onChange={handleChange}
            placeholder="Frontend developer, community mentor, project lead..."
            className="input bg-white dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-neutral-dark dark:text-gray-300">
            Current Title
          </label>
          <input
            type="text"
            name="current_title"
            value={formData.current_title}
            onChange={handleChange}
            placeholder="Software Engineer"
            className="input bg-white dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-neutral-dark dark:text-gray-300">
            Current Employer
          </label>
          <input
            type="text"
            name="current_employer"
            value={formData.current_employer}
            onChange={handleChange}
            placeholder="Company or organization"
            className="input bg-white dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Role (read-only) */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-neutral-dark dark:text-gray-300">
            Role
          </label>
          <input
            type="text"
            value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
            disabled
            className="input cursor-not-allowed bg-neutralLight text-text-secondary dark:bg-gray-800"
          />
          <p className="mt-1 text-xs text-text-secondary">Role is managed by iCAA admins.</p>
        </div>

        {/* Bio */}
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-bold text-neutral-dark dark:text-gray-300">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            maxLength={maxBioLength}
            rows={4}
            placeholder="Tell us about yourself..."
            className="input resize-none bg-white dark:bg-gray-800 dark:text-white"
          />
          <p className="mt-1 text-right text-xs text-text-secondary">
            {bioLength}/{maxBioLength} characters
          </p>
        </div>

        {/* Member Since (read-only) */}
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-bold text-neutral-dark dark:text-gray-300">
            Member Since
          </label>
          <input
            type="text"
            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "N/A"}
            disabled
            className="input cursor-not-allowed bg-neutralLight text-text-secondary dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border p-5">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm font-semibold text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Saved
          </span>
        )}
        {error && <span className="text-sm font-semibold text-red-600">{error}</span>}
      </div>
    </div>
  );
}

import React, { useCallback, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Award,
  BookOpen,
  Users,
  Code,
  MessageSquare,
  Rocket,
  ChevronDown,
  ChevronUp,
  Edit2,
  Save,
  X,
  Camera,
  ExternalLink,
  Github,
  Linkedin,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import { useUser } from "../context/UserContext";
import SkeletonLoader from "../components/shared/SkeletonLoader";
import { ChartError } from "../components/shared/ErrorBoundary";
import RoleBadge from "../components/shared/RoleBadge";
import SkillBadge from "../components/shared/SkillBadge";
import { getErrorMessage } from "../utils/errorHandler";
import {
  getUserSkillSignals,
  getUserValidatedSignals,
  addSkillValidation,
  removeSkillValidation,
  uploadAvatar,
  getAvatarUrl,
} from "../utils/api";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import BadgeGrid from "../components/badges/BadgeGrid";
import BadgeNotification from "../components/badges/BadgeNotification";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
const COMMUNITY_MENTOR_ROLES = ["mentor", "alumni", "resident"];

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useUser();
  const { addToast, handleError } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [skillsExpanded, setSkillsExpanded] = useState(true);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [newBadges, setNewBadges] = useState([]);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    headline: "",
    github_url: "",
    linkedin_url: "",
    personal_site_url: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);
  const avatarInputRef = useRef(null);

  const BADGE_PREVIEW_COUNT = 6;

  // Skill validation state
  const [skillSignals, setSkillSignals] = useState([]);
  const [validatedSignals, setValidatedSignals] = useState({});
  const [validatingSkill, setValidatingSkill] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/users/${userId}/profile`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      const { message } = getErrorMessage(err);
      setError(message);
      handleError(err, "loadProfile");
    } finally {
      setLoading(false);
    }
  }, [handleError, userId]);

  const loadBadges = useCallback(async () => {
    if (!userId) return;

    try {
      const [badgesRes, userBadgesRes] = await Promise.all([
        fetch(`${API_BASE}/badges`),
        fetch(`${API_BASE}/badges/users/${userId}`),
      ]);

      const badgesData = await badgesRes.json();
      const userBadgesData = await userBadgesRes.json();

      setAllBadges(badgesData);
      setUserBadges(userBadgesData);

      const checkRes = await fetch(`${API_BASE}/badges/users/${userId}/check`, {
        method: "POST",
      });
      const checkData = await checkRes.json();

      if (checkData.newlyEarned && checkData.newlyEarned.length > 0) {
        setNewBadges(checkData.newlyEarned);
        setUserBadges((prev) => [...prev, ...checkData.newlyEarned]);
      }
    } catch (err) {
      handleError(err, "loadBadges");
    }
  }, [handleError, userId]);

  const loadSkillSignals = useCallback(async () => {
    if (!userId || userId == currentUser?.id) return;

    try {
      const [signalsData, validatedData] = await Promise.all([
        getUserSkillSignals(userId),
        getUserValidatedSignals(currentUser?.id),
      ]);
      setSkillSignals(signalsData || []);
      setValidatedSignals(validatedData || {});
    } catch (err) {
      handleError(err, "loadSkillSignals");
    }
  }, [currentUser?.id, handleError, userId]);

  const handleSkillValidation = async (
    skillId,
    validationType,
    hasValidated,
  ) => {
    if (!currentUser) return;
    if (currentUser.id === Number(userId)) {
      addToast({ type: "error", message: "Cannot validate your own skills" });
      return;
    }

    setValidatingSkill(skillId);
    try {
      // Find any existing signal for this skill from the target user
      const signals = skillSignals.filter((s) => s.skill_id === skillId);
      if (signals.length === 0) {
        addToast({
          type: "error",
          message: "No skill signal found to validate",
        });
        return;
      }

      const signalId = signals[0].signal_id;

      if (hasValidated) {
        await removeSkillValidation(signalId, currentUser.id, validationType);
        addToast({ type: "success", message: "Validation removed" });
      } else {
        await addSkillValidation(signalId, currentUser.id, validationType);
        addToast({
          type: "success",
          message: `${validationType === "mentor_endorsement" ? "Endorsement given" : "Upvoted"}`,
        });
      }
      await loadSkillSignals();
    } catch (err) {
      addToast({ type: "error", message: err.message || "Failed to validate" });
    } finally {
      setValidatingSkill(null);
    }
  };

  useEffect(() => {
    loadProfile();
    loadBadges();
  }, [loadBadges, loadProfile]);

  useEffect(() => {
    if (currentUser && userId) {
      loadSkillSignals();
    }
  }, [currentUser, loadSkillSignals, userId]);

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar activeTab="profile" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-6">
            <Navbar activeTab="profile" />
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <SkeletonLoader type="text" lines={3} />
              <div className="mt-8 grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <SkeletonLoader key={i} type="chart" height={100} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar activeTab="profile" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-6">
            <Navbar activeTab="profile" />
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <ChartError onRetry={loadProfile} error={error} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { user, skills, projects, stats, activity_streak } = profile;
  const credentialLinks = [
    {
      href: user.github_url,
      label: "GitHub",
      icon: Github,
    },
    {
      href: user.linkedin_url,
      label: "LinkedIn",
      icon: Linkedin,
    },
    {
      href: user.personal_site_url,
      label: "Website",
      icon: ExternalLink,
    },
  ].filter((link) => link.href);
  const featuredProject =
    projects.find((project) => project.status === "completed") ||
    projects.find((project) => project.github_url || project.live_url) ||
    projects.find((project) => project.status === "active") ||
    projects[0] ||
    null;

  // Handle mentorship request
  const handleMentorshipRequest = () => {
    addToast({
      type: "success",
      message: `Mentorship request sent to ${user.name}! `,
    });
    // TODO: Add API call to create mentorship request
  };

  // Handle contact/message
  const handleContact = () => {
    addToast({
      type: "info",
      message: `Opening message dialog with ${user.name}...`,
    });
  };

  const handleEditProfile = () => {
    setEditForm({
      name: user.name,
      bio: user.bio || "",
      headline: user.headline || "",
      github_url: user.github_url || "",
      linkedin_url: user.linkedin_url || "",
      personal_site_url: user.personal_site_url || "",
    });
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditForm({
      name: "",
      bio: "",
      headline: "",
      github_url: "",
      linkedin_url: "",
      personal_site_url: "",
    });
  };

  const handleSaveProfile = async () => {
    if (!currentUser || currentUser.id !== user.id) return;

    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Failed to save");

      const updatedUser = await res.json();
      setProfile((prev) => ({ ...prev, user: updatedUser }));

      // Update global context so navbar updates immediately
      if (currentUser.id === user.id) {
        updateUser(updatedUser);
      }

      setIsEditingProfile(false);
      addToast({ type: "success", message: "Profile updated successfully!" });
    } catch (err) {
      const { message } = getErrorMessage(err);
      addToast({ type: "error", message: message || "Failed to update profile" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || currentUser.id !== user.id) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: "error", message: "Image must be less than 5MB" });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      addToast({ type: "error", message: "Only JPG, PNG, GIF, WebP allowed" });
      return;
    }

    setUploadingAvatar(true);
    try {
      await uploadAvatar(currentUser.id, file);
      setAvatarKey((k) => k + 1);
      await loadProfile();

      // Update global user context to trigger navbar image update
      updateUser({ profile_pic: `avatar:${currentUser.id}` });

      addToast({ type: "success", message: "Avatar updated!" });
    } catch (err) {
      addToast({
        type: "error",
        message: err.message || "Failed to upload avatar",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        activeTab="collaboration"
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <div className="px-6 pt-6">
          <Navbar
            activeTab="collaboration"
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-surface border border-border rounded-lg p-6 mb-6 relative">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                  {user.profile_pic ?
                    <img
                      key={avatarKey}
                      src={getAvatarUrl(user.id)}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  : <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                      <span className="text-secondary text-2xl font-bold">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                  }
                  {currentUser && currentUser.id === user.id && (
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition shadow-md"
                      title="Change avatar"
                    >
                      {uploadingAvatar ?
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Camera className="w-3 h-3 text-white" />}
                    </button>
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex-1">
                  {isEditingProfile ?
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="text-4xl font-bold text-neutral-dark bg-transparent border-b-2 border-primary focus:outline-none w-full"
                        placeholder="Your name"
                      />
                      <textarea
                        value={editForm.bio}
                        onChange={(e) =>
                          setEditForm({ ...editForm, bio: e.target.value })
                        }
                        maxLength={200}
                        placeholder="Tell us about yourself..."
                        className="w-full text-text-secondary text-sm mt-3 bg-surface-highlight border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                        rows={2}
                      />
                      <p className="text-xs text-text-secondary">
                        {editForm.bio?.length || 0}/200 characters
                      </p>
                      <input
                        type="text"
                        value={editForm.headline}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            headline: e.target.value,
                          })
                        }
                        maxLength={160}
                        placeholder="Professional headline"
                        className="w-full text-sm bg-surface-highlight border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input
                          type="url"
                          value={editForm.github_url}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              github_url: e.target.value,
                            })
                          }
                          placeholder="GitHub URL"
                          className="text-sm bg-surface-highlight border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <input
                          type="url"
                          value={editForm.linkedin_url}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              linkedin_url: e.target.value,
                            })
                          }
                          placeholder="LinkedIn URL"
                          className="text-sm bg-surface-highlight border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <input
                          type="url"
                          value={editForm.personal_site_url}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              personal_site_url: e.target.value,
                            })
                          }
                          placeholder="Personal site URL"
                          className="text-sm bg-surface-highlight border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                  : <>
                      <h1 className="text-4xl font-bold text-neutral-dark">
                        {user.name}
                      </h1>
                      {user.headline && (
                        <p className="text-primary font-medium mt-1">
                          {user.headline}
                        </p>
                      )}
                      <p className="text-text-secondary mt-1">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}{" "}
                        •{" "}
                        {new Date(user.join_date).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                        {activity_streak > 0 && (
                          <span className="ml-2 text-gray-400">
                            🔥 {activity_streak} day
                            {activity_streak !== 1 ? "s" : ""} streak
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        <RoleBadge role={user.role} />
                        {user.cycle && (
                          <span className="text-sm text-text-secondary">
                            {user.role === "intern" ?
                              `Cohort ${user.cycle}`
                            : `Commenced ${user.cycle}`}
                          </span>
                        )}
                      </div>
                      {user.bio && (
                        <p className="text-text-secondary text-sm mt-3 max-w-2xl italic">
                          "{user.bio}"
                        </p>
                      )}
                      {credentialLinks.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {credentialLinks.map((link) => (
                            <a
                              key={link.label}
                              href={link.href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-highlight px-3 py-1.5 text-sm text-neutral-dark hover:text-primary hover:border-primary/40 transition"
                            >
                              {React.createElement(link.icon, {
                                className: "w-4 h-4",
                              })}
                              {link.label}
                            </a>
                          ))}
                        </div>
                      )}
                      {!user.bio &&
                        currentUser &&
                        currentUser.id === user.id && (
                          <p className="text-text-secondary text-sm mt-3 italic">
                            Click edit to add a bio
                          </p>
                        )}
                    </>
                  }
                </div>

                <div className="flex items-center gap-3">
                  {currentUser && currentUser.id === user.id ?
                    isEditingProfile ?
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-neutral-dark transition"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={savingProfile}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {savingProfile ? "Saving..." : "Save"}
                        </button>
                      </div>
                    : <button
                        onClick={handleEditProfile}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-highlight text-gray-400 hover:text-primary transition"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                  : currentUser && currentUser.id !== user.id ?
                    <>
                      {COMMUNITY_MENTOR_ROLES.includes(user.role) && (
                        <button
                          onClick={handleMentorshipRequest}
                          className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition font-medium"
                        >
                          Request Session
                        </button>
                      )}
                      <button
                        onClick={handleContact}
                        className="flex items-center gap-2 px-4 py-2 bg-surface-highlight text-neutral-dark rounded-lg hover:bg-border transition font-medium border border-border"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </button>
                    </>
                  : null}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div
                className="bg-surface p-4 rounded-lg border border-border hover:shadow-md transition-all"
                title="Total unique skills you've practiced across all projects"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Code className="w-5 h-5 text-primary" />
                  <p className="text-sm text-neutral-dark">Skills</p>
                </div>
                <p className="text-3xl font-bold text-neutral-dark">
                  {stats.total_skills || 0}
                </p>
              </div>

              <div
                className="bg-surface p-4 rounded-lg border border-border hover:shadow-md transition-all"
                title="Total skill points from all activities and validations"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-secondary" />
                  <p className="text-sm text-neutral-dark">Growth</p>
                </div>
                <p className="text-3xl font-bold text-neutral-dark">
                  {stats.total_weight || 0}
                </p>
              </div>

              <div
                className="bg-surface p-4 rounded-lg border border-border hover:shadow-md transition-all"
                title="Projects you own or are a member of"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-accent" />
                  <p className="text-sm text-neutral-dark">Recent Projects</p>
                </div>
                <p className="text-3xl font-bold text-neutral-dark">
                  {projects.length}
                </p>
              </div>

              <div
                className="bg-surface p-4 rounded-lg border border-border hover:shadow-md transition-all"
                title="Days you've been active in the last 30 days"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <p className="text-sm text-neutral-dark">Active</p>
                </div>
                <p className="text-3xl font-bold text-neutral-dark">
                  {stats.days_active || 0}d
                </p>
              </div>
            </div>

            {/* Featured Project */}
            {featuredProject && (
              <section className="bg-surface rounded-lg border border-border p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase text-text-secondary mb-1">
                      Featured Project
                    </p>
                    <h2 className="text-xl font-bold text-primary">
                      {featuredProject.title}
                    </h2>
                    <p className="text-sm text-text-secondary mt-2 max-w-3xl">
                      {featuredProject.description || "No description yet."}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-text-secondary mt-4">
                      <span>
                        {featuredProject.team_size || 0} member
                        {featuredProject.team_size === 1 ? "" : "s"}
                      </span>
                      <span>
                        {featuredProject.skill_count || 0} skill
                        {featuredProject.skill_count === 1 ? "" : "s"}
                      </span>
                      <span className="capitalize">
                        {featuredProject.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {featuredProject.github_url && (
                      <a
                        href={featuredProject.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-highlight px-3 py-2 text-sm text-neutral-dark hover:text-primary hover:border-primary/40"
                      >
                        <Github className="w-4 h-4" />
                        GitHub
                      </a>
                    )}
                    {featuredProject.live_url && (
                      <a
                        href={featuredProject.live_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-highlight px-3 py-2 text-sm text-neutral-dark hover:text-primary hover:border-primary/40"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Live
                      </a>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Growth Sources */}
            <div className="bg-surface rounded-lg border border-border p-4 mb-6">
              <p className="text-sm text-text-secondary text-center">
                <span className="font-medium text-neutral-dark">
                  Growth Sources:
                </span>{" "}
                {stats.project_count || 0} Projects • {stats.update_count || 0}{" "}
                Updates • {stats.mentorship_count || 0} Sessions
              </p>
            </div>

            {/* Credential Stats */}
            {user.role !== "intern" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-surface p-4 rounded-lg border border-border">
                  <p className="text-xs uppercase font-semibold text-text-secondary">
                    Mentorship
                  </p>
                  <p className="text-2xl font-bold text-neutral-dark mt-2">
                    {stats.sessions_completed || 0}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    completed sessions
                  </p>
                </div>
                <div className="bg-surface p-4 rounded-lg border border-border">
                  <p className="text-xs uppercase font-semibold text-text-secondary">
                    Residents Helped
                  </p>
                  <p className="text-2xl font-bold text-neutral-dark mt-2">
                    {stats.interns_mentored || 0}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    unique interns mentored
                  </p>
                </div>
                <div className="bg-surface p-4 rounded-lg border border-border">
                  <p className="text-xs uppercase font-semibold text-text-secondary">
                    Projects Advised
                  </p>
                  <p className="text-2xl font-bold text-neutral-dark mt-2">
                    {stats.projects_advised || 0}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    linked mentorship projects
                  </p>
                </div>
              </div>
            )}

            {/* Badges Section - Interns only */}
            {user.role === "intern" && allBadges.length > 0 && (
              <section className="bg-surface rounded-lg border border-border p-6 mb-8">
                {userBadges.length > 0 &&
                  (() => {
                    const previewBadges =
                      showAllBadges ? userBadges : (
                        userBadges.slice(0, BADGE_PREVIEW_COUNT)
                      );
                    const hiddenCount = userBadges.length - BADGE_PREVIEW_COUNT;

                    const earnedIds = new Set(
                      userBadges.map((b) => b.badge_id || b.id),
                    );
                    const lockedBadges = allBadges.filter(
                      (b) => !earnedIds.has(b.id),
                    );

                    return (
                      <>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="text-lg font-bold text-neutral-dark">
                            Unlocked ({userBadges.length})
                          </h2>
                        </div>

                        {/* Badge grid - preview or all */}
                        <div className="flex justify-center">
                          <BadgeGrid
                            allBadges={previewBadges}
                            earnedBadges={previewBadges}
                          />
                        </div>

                        {/* Locked badges - only shown when expanded */}
                        {showAllBadges && lockedBadges.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-border">
                            <h2 className="text-lg font-bold text-neutral-dark mb-3">
                              Locked ({lockedBadges.length})
                            </h2>
                            <div className="flex justify-center">
                              <BadgeGrid
                                allBadges={lockedBadges}
                                earnedBadges={[]}
                              />
                            </div>
                          </div>
                        )}

                        {/* Toggle button */}
                        <div className="mt-5 flex justify-center">
                          {(hiddenCount > 0 || showAllBadges) && (
                            <button
                              onClick={() => setShowAllBadges(!showAllBadges)}
                              className="flex items-center gap-2 px-5 py-2 rounded-full border border-primary/40 text-primary text-sm font-medium hover:bg-primary/10 hover:border-primary transition-all duration-200 group"
                            >
                              {showAllBadges ?
                                "Show Less"
                              : `View All ${userBadges.length} Badges`}
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-300 ${showAllBadges ? "rotate-180" : "group-hover:translate-y-0.5"}`}
                              />
                            </button>
                          )}
                        </div>
                      </>
                    );
                  })()}
              </section>
            )}

            {/* Skills Section */}
            {skills.length > 0 && (
              <section className="bg-surface rounded-lg border border-border p-6 mb-8">
                <button
                  onClick={() => setSkillsExpanded(!skillsExpanded)}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <h2 className="text-xl font-bold text-neutral-dark">
                    Skill Inventory ({skills.length})
                  </h2>
                  {skillsExpanded ?
                    <ChevronUp className="w-5 h-5 text-text-secondary" />
                  : <ChevronDown className="w-5 h-5 text-text-secondary" />}
                </button>
                {skillsExpanded && (
                  <>
                    {/* Sort skills by total_weight descending */}
                    {(() => {
                      const sortedSkills = [...skills].sort(
                        (a, b) => (b.total_weight || 0) - (a.total_weight || 0),
                      );
                      const displayedSkills =
                        showAllSkills ? sortedSkills : sortedSkills.slice(0, 6);
                      const remainingCount = sortedSkills.length - 6;

                      return (
                        <>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {displayedSkills.map((skill) => {
                              const canValidate =
                                currentUser &&
                                currentUser.id !== Number(userId);
                              const signal = skillSignals.find(
                                (item) => item.skill_id === skill.id,
                              );
                              const validationsForSignal =
                                validatedSignals[signal?.signal_id] || [];
                              const hasMentorEndorsement =
                                validationsForSignal.includes(
                                  "mentor_endorsement",
                                );
                              const hasUpvoted =
                                validationsForSignal.includes("upvote");

                              return (
                                <div key={skill.id} className="group relative">
                                  <SkillBadge skill={skill.skill_name} />
                                  <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-neutral-dark text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                    {skill.total_weight} points • Last:{" "}
                                    {new Date(
                                      skill.last_practiced,
                                    ).toLocaleDateString()}
                                  </div>

                                  {/* Validation buttons - only show for team members viewing teammate profiles */}
                                  {canValidate && (
                                    <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {/* Mentor endorsement - only community mentors can give */}
                                      {COMMUNITY_MENTOR_ROLES.includes(
                                        currentUser?.role,
                                      ) && (
                                        <button
                                          onClick={() =>
                                            handleSkillValidation(
                                              skill.id,
                                              "mentor_endorsement",
                                              hasMentorEndorsement,
                                            )
                                          }
                                          disabled={
                                            validatingSkill === skill.id
                                          }
                                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-surface-highlight text-text-secondary hover:bg-amber-200 hover:text-amber-800"
                                          title="Endorse skill (community mentors)"
                                        >
                                          ★
                                        </button>
                                      )}
                                      {/* Upvote - any team member can give */}
                                      <button
                                        onClick={() =>
                                          handleSkillValidation(
                                            skill.id,
                                            "upvote",
                                            hasUpvoted,
                                          )
                                        }
                                        disabled={validatingSkill === skill.id}
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-surface-highlight text-text-secondary hover:bg-blue-200 hover:text-blue-800"
                                        title="Upvote skill (team members)"
                                      >
                                        ▲
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Show More / Show Less button */}
                          {(remainingCount > 0 || showAllSkills) &&
                            skills.length > 6 && (
                              <div className="mt-5 flex justify-center">
                                <button
                                  onClick={() =>
                                    setShowAllSkills(!showAllSkills)
                                  }
                                  className="flex items-center gap-2 px-5 py-2 rounded-full border border-primary/40 text-primary text-sm font-medium hover:bg-primary/10 hover:border-primary transition-all duration-200 group"
                                >
                                  {showAllSkills ?
                                    "Show Less"
                                  : `Show ${remainingCount} More Skill${remainingCount !== 1 ? "s" : ""}`
                                  }
                                  <ChevronDown
                                    className={`w-4 h-4 transition-transform duration-300 ${showAllSkills ? "rotate-180" : "group-hover:translate-y-0.5"}`}
                                  />
                                </button>
                              </div>
                            )}
                        </>
                      );
                    })()}
                  </>
                )}
              </section>
            )}

            {/* Projects Section */}
            {projects.length > 0 && (
              <section className="bg-surface rounded-lg border border-border p-6 mb-8">
                <button
                  onClick={() => setProjectsExpanded(!projectsExpanded)}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <h2 className="text-xl font-bold text-neutral-dark">
                    Recent Projects ({projects.length})
                  </h2>
                  {projectsExpanded ?
                    <ChevronUp className="w-5 h-5 text-text-secondary" />
                  : <ChevronDown className="w-5 h-5 text-text-secondary" />}
                </button>
                {projectsExpanded && (
                  <div className="space-y-2">
                    {(() => {
                      const displayedProjects =
                        showAllProjects ? projects : projects.slice(0, 5);
                      return (
                        <>
                          {displayedProjects.map((project) => (
                            <div
                              key={project.id}
                              className="flex items-center justify-between py-2 border-b border-border last:border-0"
                            >
                              <h3 className="font-medium text-neutral-dark truncate flex-1 mr-4">
                                {project.title}
                              </h3>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                {project.github_url && (
                                  <a
                                    href={project.github_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-text-secondary hover:text-primary"
                                    aria-label={`${project.title} GitHub`}
                                  >
                                    GitHub
                                  </a>
                                )}
                                {project.live_url && (
                                  <a
                                    href={project.live_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-text-secondary hover:text-primary"
                                    aria-label={`${project.title} live project`}
                                  >
                                    Live
                                  </a>
                                )}
                                <span className="text-xs text-text-secondary">
                                  {project.team_size} member
                                  {project.team_size !== 1 ? "s" : ""} •{" "}
                                  {project.skill_count} skill
                                  {project.skill_count !== 1 ? "s" : ""}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                                    project.status === "active" ?
                                      "bg-accent/20 text-accent"
                                    : project.status === "completed" ?
                                      "bg-primary/20 text-primary"
                                    : "bg-surface-highlight text-neutral-dark"
                                  }`}
                                >
                                  {project.status}
                                </span>
                              </div>
                            </div>
                          ))}

                          {/* View All Projects button */}
                          {!showAllProjects && projects.length > 5 && (
                            <button
                              onClick={() => setShowAllProjects(true)}
                              className="mt-3 text-sm text-primary hover:text-primary/80 font-medium"
                            >
                              View all {projects.length} projects →
                            </button>
                          )}
                          {showAllProjects && projects.length > 5 && (
                            <button
                              onClick={() => setShowAllProjects(false)}
                              className="mt-3 text-sm text-primary hover:text-primary/80 font-medium"
                            >
                              Show less ↑
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </section>
            )}

            {/* Empty States */}
            {user.role === "intern" && userBadges.length === 0 && (
              <section className="bg-surface rounded-lg border border-border p-6 mb-8">
                <h2 className="text-lg font-bold text-neutral-dark mb-3">
                  Badges
                </h2>
                <p className="text-text-secondary text-center">
                  Start earning badges by completing projects!
                </p>
              </section>
            )}
            {skills.length === 0 && (
              <section className="bg-surface rounded-lg border border-border p-6 mb-8">
                <p className="text-text-secondary text-center">
                  Practice your first skill to see it here
                </p>
              </section>
            )}
            {projects.length === 0 && (
              <section className="bg-surface rounded-lg border border-border p-6 mb-8">
                <p className="text-text-secondary text-center">
                  Join or create a project to get started
                </p>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Badge Notification Modal */}
      {newBadges.length > 0 && (
        <BadgeNotification badges={newBadges} onClose={() => setNewBadges([])} />
      )}
    </div>
  );
}

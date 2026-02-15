import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Flame,
  Award,
  BookOpen,
  Users,
  Code,
  MessageSquare,
  Rocket,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import { useUser } from "../context/UserContext";
import SkeletonLoader from "../components/shared/SkeletonLoader";
import { ChartError } from "../components/shared/ErrorBoundary";
import SkillBadge from "../components/shared/SkillBadge";
import { getErrorMessage } from "../utils/errorHandler";
import { generateResumePDF } from "../utils/resumeExport";
import {
  getUserSkillSignals,
  getUserValidatedSignals,
  addSkillValidation,
  removeSkillValidation,
} from "../utils/api";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import BadgeGrid from "../components/badges/BadgeGrid";
import BadgeNotification from "../components/badges/BadgeNotification";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useUser();
  const { addToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [skillsExpanded, setSkillsExpanded] = useState(true);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [newBadge, setNewBadge] = useState(null);

  // Skill validation state
  const [skillSignals, setSkillSignals] = useState([]);
  const [validatedSignals, setValidatedSignals] = useState({});
  const [validatingSkill, setValidatingSkill] = useState(null);

  const loadProfile = async () => {
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
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadBadges = async () => {
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
        setNewBadge(checkData.newlyEarned[0]);
        setUserBadges((prev) => [...prev, ...checkData.newlyEarned]);
      }
    } catch (err) {
      console.error("Failed to load badges:", err);
    }
  };

  const loadSkillSignals = async () => {
    if (!userId || userId == currentUser?.id) return;

    try {
      const [signalsData, validatedData] = await Promise.all([
        getUserSkillSignals(userId),
        getUserValidatedSignals(currentUser?.id),
      ]);
      setSkillSignals(signalsData || []);
      setValidatedSignals(validatedData || {});
    } catch (err) {
      console.error("Failed to load skill signals:", err);
    }
  };

  const handleValidation = async (signalId, validationType, hasValidated) => {
    if (!currentUser) return;
    if (currentUser.id === Number(userId)) {
      addToast({ type: "error", message: "Cannot validate your own skills" });
      return;
    }

    setValidatingSkill(signalId);
    try {
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
  }, [userId]);

  useEffect(() => {
    if (currentUser && userId) {
      loadSkillSignals();
    }
  }, [currentUser, userId]);

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

  // Handle PDF export
  const handleExportResume = async () => {
    if (!profile) return;
    setExporting(true);
    try {
      const fileName = generateResumePDF(profile);
      addToast({
        type: "success",
        message: `Resume exported: ${fileName}`,
      });
    } catch (err) {
      addToast({
        type: "error",
        message: "Failed to export resume. Please try again.",
      });
    } finally {
      setExporting(false);
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
            <div className="bg-surface border-b border-border rounded-t-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-neutral-dark">
                    {user.name}
                  </h1>
                  <p className="text-text-secondary mt-1">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)} •{" "}
                    {new Date(user.join_date).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {activity_streak > 0 && (
                    <div className="text-center bg-surface-highlight px-4 py-3 rounded-lg border border-accent">
                      <div className="flex items-center gap-2 justify-center">
                        <Flame className="w-5 h-5 text-accent" />
                        <span className="text-2xl font-bold text-accent">
                          {activity_streak}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-dark mt-1">
                        day streak
                      </p>
                    </div>
                  )}

                  {currentUser && currentUser.id !== user.id && (
                    <>
                      {user.role === "mentor" && (
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
                  )}

                  <button
                    onClick={handleExportResume}
                    disabled={exporting}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {exporting ? "Exporting..." : "Export Resume"}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 mt-6">
              <div className="bg-surface p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="w-5 h-5 text-primary" />
                  <p className="text-sm text-neutral-dark">Skills</p>
                </div>
                <p className="text-3xl font-bold text-neutral-dark">
                  {stats.total_skills || 0}
                </p>
              </div>

              <div className="bg-surface p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-secondary" />
                  <p className="text-sm text-neutral-dark">Growth</p>
                </div>
                <p className="text-3xl font-bold text-neutral-dark">
                  {stats.total_weight || 0}
                </p>
              </div>

              <div className="bg-surface p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-accent" />
                  <p className="text-sm text-neutral-dark">Projects</p>
                </div>
                <p className="text-3xl font-bold text-neutral-dark">
                  {projects.length}
                </p>
              </div>

              <div className="bg-surface p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <p className="text-sm text-neutral-dark">Active</p>
                </div>
                <p className="text-3xl font-bold text-neutral-dark">
                  {stats.days_active || 0}d
                </p>
              </div>

              <div className="bg-surface p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="w-5 h-5 text-accent" />
                  <p className="text-sm text-neutral-dark">Growth Sources</p>
                </div>
                <p className="text-lg font-bold text-neutral-dark">
                  {stats.project_count || 0} Projects •{" "}
                  {stats.update_count || 0} Updates •{" "}
                  {stats.mentorship_count || 0} Sessions
                </p>
              </div>
            </div>

            {/* Badges Section - Interns only */}
            {user.role === "intern" && allBadges.length > 0 && (
              <section className="bg-surface rounded-lg border border-border p-6 mb-8">
                {/* Unlocked - only earned badges (colored) */}
                {userBadges.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-neutral-dark mb-3">
                      Unlocked ({userBadges.length})
                    </h2>
                    <BadgeGrid
                      allBadges={userBadges}
                      earnedBadges={userBadges}
                    />
                  </div>
                )}

                {/* Locked - badges not yet earned (grayed out) */}
                {(() => {
                  const earnedIds = new Set(
                    userBadges.map((b) => b.badge_id || b.id),
                  );
                  const lockedBadges = allBadges.filter(
                    (b) => !earnedIds.has(b.id),
                  );
                  if (lockedBadges.length === 0) return null;

                  return (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h2 className="text-lg font-bold text-neutral-dark mb-3">
                        Locked ({lockedBadges.length})
                      </h2>
                      <BadgeGrid allBadges={lockedBadges} earnedBadges={[]} />
                    </div>
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
                          <div className="flex flex-wrap gap-2">
                            {displayedSkills.map((skill) => {
                              const canValidate =
                                currentUser &&
                                currentUser.id !== Number(userId);

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
                                      {/* Mentor endorsement - only mentors can give */}
                                      {currentUser?.role === "mentor" && (
                                        <button
                                          onClick={() =>
                                            handleSkillValidation(
                                              skill.id,
                                              "mentor_endorsement",
                                              false,
                                            )
                                          }
                                          disabled={
                                            validatingSkill === skill.id
                                          }
                                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-surface-highlight text-text-secondary hover:bg-amber-200 hover:text-amber-800"
                                          title="Endorse skill (mentors only)"
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
                                            false,
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
                          {!showAllSkills && remainingCount > 0 && (
                            <button
                              onClick={() => setShowAllSkills(true)}
                              className="mt-4 text-sm text-primary hover:text-primary/80 font-medium"
                            >
                              Show {remainingCount} more skill
                              {remainingCount !== 1 ? "s" : ""} →
                            </button>
                          )}
                          {showAllSkills && skills.length > 6 && (
                            <button
                              onClick={() => setShowAllSkills(false)}
                              className="mt-4 text-sm text-primary hover:text-primary/80 font-medium"
                            >
                              Show less ↑
                            </button>
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
      {newBadge && (
        <BadgeNotification badge={newBadge} onClose={() => setNewBadge(null)} />
      )}
    </div>
  );
}

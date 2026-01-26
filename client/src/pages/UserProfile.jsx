import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Flame,
  Award,
  BookOpen,
  Users,
  Code,
  MessageSquare,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import SkeletonLoader from "../components/shared/SkeletonLoader";
import { ChartError } from "../components/shared/ErrorBoundary";
import SkillBadge from "../components/shared/SkillBadge";
import { getErrorMessage } from "../utils/errorHandler";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function UserProfile() {
  const { userId } = useParams();
  const { addToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <SkeletonLoader type="text" lines={3} />
          <div className="mt-8 grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <SkeletonLoader key={i} type="chart" height={100} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <ChartError onRetry={loadProfile} error={error} />
        </div>
      </div>
    );
  }

  const { user, skills, projects, stats, activity_streak } = profile;

  // Handle mentorship request
  const handleMentorshipRequest = () => {
    addToast({
      type: "success",
      message: `Mentorship request sent to ${user.name}! 🎯`,
    });
    // TODO: Add API call to create mentorship request
  };

  // Handle contact/message
  const handleContact = () => {
    addToast({
      type: "info",
      message: `Opening message dialog with ${user.name}...`,
    });
    // TODO: Add API call to create/open message thread
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600 mt-1">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} •{" "}
                {new Date(user.join_date).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Activity Streak */}
            {activity_streak > 0 && (
              <div className="text-center bg-neutralLight px-4 py-3 rounded-lg border border-accent">
                <div className="flex items-center gap-2 justify-center">
                  <Flame className="w-5 h-5 text-accent" />
                  <span className="text-2xl font-bold text-accent">
                    {activity_streak}
                  </span>
                </div>
                <p className="text-xs text-neutralDark mt-1">day streak</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-5 h-5 text-primary" />
              <p className="text-sm text-neutralDark">Skills</p>
            </div>
            <p className="text-3xl font-bold text-neutralDark">
              {stats.total_skills || 0}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-secondary" />
              <p className="text-sm text-neutralDark">Growth</p>
            </div>
            <p className="text-3xl font-bold text-neutralDark">
              {stats.total_weight || 0}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-accent" />
              <p className="text-sm text-neutralDark">Projects</p>
            </div>
            <p className="text-3xl font-bold text-neutralDark">
              {projects.length}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <p className="text-sm text-neutralDark">Active</p>
            </div>
            <p className="text-3xl font-bold text-neutralDark">
              {stats.days_active || 0}d
            </p>
          </div>
        </div>

        {/* Skills Section */}
        {skills.length > 0 && (
          <section className="bg-white rounded-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-2xl font-bold text-neutralDark mb-4">
              Skill Inventory
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div key={skill.id} className="group relative">
                  <SkillBadge skill={skill.skill_name} />
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-neutralDark text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {skill.total_weight} points • Last:{" "}
                    {new Date(skill.last_practiced).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Breakdown by source */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm font-medium text-neutralDark mb-3">
                Growth Sources
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Projects</p>
                  <p className="text-lg font-bold text-neutralDark">
                    {stats.project_count || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Updates</p>
                  <p className="text-lg font-bold text-neutralDark">
                    {stats.update_count || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Mentorship</p>
                  <p className="text-lg font-bold text-neutralDark">
                    {stats.mentorship_count || 0}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Projects Section */}
        {projects.length > 0 && (
          <section className="bg-white rounded-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-2xl font-bold text-neutralDark mb-4">
              Recent Projects
            </h2>
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 border border-gray-100 rounded-lg hover:bg-neutralLight transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-neutralDark">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {project.description}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                        project.status === "active" ? "bg-accent/20 text-accent"
                        : project.status === "completed" ?
                          "bg-primary/20 text-primary"
                        : "bg-gray-100 text-neutralDark"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-gray-600">
                    <span>👥 {project.team_size} members</span>
                    <span>🎯 {project.skill_count} skills</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mentorship Section - if user is a mentor */}
        {user.role === "mentor" && (
          <section className="bg-neutralLight rounded-lg border border-primary/20 p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-2">
                  Available for Mentorship
                </h2>
                <p className="text-neutralDark mb-4">
                  {user.name} is currently accepting mentorship requests. Learn
                  from their expertise and grow together!
                </p>
              </div>
              <button
                onClick={handleMentorshipRequest}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium whitespace-nowrap ml-4"
              >
                Request Session
              </button>
            </div>
          </section>
        )}

        {/* Contact/Message CTA */}
        <section className="bg-primary rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Want to connect?</h2>
              <p className="text-white/90">
                Reach out to {user.name} to collaborate, learn, or share ideas.
              </p>
            </div>
            <button
              onClick={handleContact}
              className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition font-semibold whitespace-nowrap flex items-center gap-2 ml-4"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </button>
          </div>
        </section>

        {/* Empty States */}
        {skills.length === 0 && projects.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
            <p className="text-neutralDark text-lg">
              No activity yet. Time to start building! 🚀
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

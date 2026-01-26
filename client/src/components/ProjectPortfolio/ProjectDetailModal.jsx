import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import SkeletonLoader from "../../components/shared/SkeletonLoader";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function ProjectDetailModal({ isOpen, project, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !project) return;

    async function loadDetails() {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE}/projects/${project.id}/portfolio-details`,
        );
        if (!res.ok) throw new Error("Failed to fetch details");
        const data = await res.json();
        setDetails(data);
      } catch (err) {
        console.error("Failed to load project details:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [isOpen, project?.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {project.title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ?
            <div className="space-y-4">
              <SkeletonLoader type="text" lines={3} />
            </div>
          : details ?
            <div className="space-y-6">
              {/* Team Members */}
              {details.team && details.team.length > 0 && (
                <section>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Team Members ({details.team.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {details.team.map((member) => (
                      <div
                        key={member.id}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <p className="font-medium text-gray-900">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-600">{member.role}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Skills */}
              {details.skills && details.skills.length > 0 && (
                <section>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Skills Practiced ({details.skills.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {details.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                      >
                        {skill.skill_name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Recent Updates */}
              {details.updates && details.updates.length > 0 && (
                <section>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Recent Updates ({details.updates.length})
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {details.updates.map((update) => (
                      <div
                        key={update.id}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <p className="text-sm text-gray-700">
                          {update.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(update.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Sessions */}
              {details.sessions && details.sessions.length > 0 && (
                <section>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Mentorship Sessions ({details.sessions.length})
                  </h3>
                  <div className="space-y-2">
                    {details.sessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <p className="font-medium text-blue-900">
                          {session.topic}
                        </p>
                        <p className="text-xs text-blue-700">
                          {new Date(session.session_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          : <p className="text-gray-500">Unable to load details</p>}
        </div>
      </div>
    </div>
  );
}

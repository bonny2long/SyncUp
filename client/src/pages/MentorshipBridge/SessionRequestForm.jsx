import React, { useEffect, useState } from "react";
import { createSession } from "../../utils/api";
import { useUser } from "../../context/UserContext";

// Frontend source of truth for mentorship intent
const SESSION_FOCUS_OPTIONS = [
  { value: "project_support", label: "Project Support" },
  { value: "technical_guidance", label: "Technical Guidance" },
  { value: "career_guidance", label: "Career Guidance" },
  { value: "life_leadership", label: "Life and Leadership" },
  { value: "alumni_advice", label: "Alumni Advice" },
];

export default function SessionRequestForm({ selectedMentor, projects = [] }) {
  const { user, loading: userLoading } = useUser();

  const [formData, setFormData] = useState({
    mentor_id: "",
    session_focus: "",
    project_id: "",
    topic: "",
    details: "",
    session_date: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sync selected mentor into the form
  useEffect(() => {
    if (selectedMentor?.id) {
      setFormData((prev) => ({ ...prev, mentor_id: selectedMentor.id }));
      setSuccess("");
    } else {
      setFormData((prev) => ({ ...prev, mentor_id: "" }));
    }
  }, [selectedMentor]);

  const requiresProject =
    formData.session_focus === "project_support" ||
    formData.session_focus === "technical_guidance";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (userLoading) {
      setError("User loading...");
      return;
    }
    if (!user?.id) {
      setError("User not loaded.");
      return;
    }
    if (!formData.mentor_id) {
      setError("Select a mentor first.");
      return;
    }
    if (!formData.session_focus) {
      setError("Please select the purpose of the session.");
      return;
    }
    if (!formData.topic.trim() || !formData.session_date) {
      setError("Topic and date/time are required.");
      return;
    }

    setLoading(true);
    try {
      await createSession({
        intern_id: user.id,
        mentor_id: formData.mentor_id,
        session_focus: formData.session_focus,
        project_id: formData.project_id || null,
        topic: formData.topic,
        details: formData.details,
        session_date: formData.session_date,
      });

      setSuccess("Session request submitted!");
      setFormData({
        mentor_id: "",
        session_focus: "",
        project_id: "",
        topic: "",
        details: "",
        session_date: "",
      });
    } catch (err) {
      console.error("Error creating session:", err);
      setError("Could not submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-2xl shadow-md mb-6 flex flex-col gap-3"
    >
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Selected mentor:</span>
        {formData.mentor_id ? (
          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            {selectedMentor?.name || `#${formData.mentor_id}`}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">
            Pick a mentor from the list
          </span>
        )}
      </div>

      {/* Session Focus */}
      <select
        className="border border-gray-200 rounded-lg p-2 text-sm"
        value={formData.session_focus}
        onChange={(e) =>
          setFormData({ ...formData, session_focus: e.target.value })
        }
        required
      >
        <option value="">Select session purpose</option>
        {SESSION_FOCUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {(formData.session_focus === "project_support" ||
        formData.session_focus === "technical_guidance") && (
        <p className="text-xs text-gray-500">
          Skills discussed during technical or project focused sessions may be
          tracked in the future.
        </p>
      )}

      {/* Optional Project Context */}
      {requiresProject && (
        <>
          <select
            className="border border-gray-200 rounded-lg p-2 text-sm"
            value={formData.project_id}
            onChange={(e) =>
              setFormData({ ...formData, project_id: e.target.value })
            }
          >
            <option value="">No related project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Only select a project if this session is directly tied to active
            work.
          </p>
        </>
      )}

      <input
        type="text"
        placeholder="Session Topic"
        className="border border-gray-200 rounded-lg p-2 text-sm"
        value={formData.topic}
        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
      />

      <textarea
        placeholder="Session Details"
        className="border border-gray-200 rounded-lg p-2 text-sm resize-none"
        rows="2"
        value={formData.details}
        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
      />

      <input
        type="datetime-local"
        className="border border-gray-200 rounded-lg p-2 text-sm"
        value={formData.session_date}
        onChange={(e) =>
          setFormData({ ...formData, session_date: e.target.value })
        }
      />

      {(error || success) && (
        <p className={`text-xs ${error ? "text-red-500" : "text-green-600"}`}>
          {error || success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !formData.mentor_id}
        className={`rounded-xl py-2 px-4 text-white font-medium transition ${
          loading || !formData.mentor_id
            ? "bg-primary/40 cursor-not-allowed"
            : "bg-primary hover:bg-secondary"
        }`}
      >
        {loading ? "Submitting..." : "Request Mentorship"}
      </button>
    </form>
  );
}

import React, { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import SkillSelectModal from "../SkillSelectModal";
import SkillBadge from "../../../components/shared/SkillBadge";

const SESSION_FOCUS_LABELS = {
  project_support: "Project Support",
  technical_guidance: "Technical Guidance",
  career_guidance: "Career Guidance",
  life_leadership: "Life and Leadership",
  alumni_advice: "Alumni Advice",
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function SessionCard({
  session,
  onUpdateStatus,
  onUpdateDetails,
  onDelete,
  currentUser,
  currentUserLoading = false,
  onReschedule,
}) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    declined: "bg-red-100 text-red-700",
    rescheduled: "bg-purple-100 text-purple-700",
  };

  const canManageStatus =
    currentUser &&
    !currentUserLoading &&
    (currentUser.role === "admin" ||
      currentUser.id === session.mentor_id ||
      currentUser.id === session.intern_id);

  const canReschedule = canManageStatus;

  const [isEditing, setIsEditing] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [error, setError] = useState("");
  const [practiceSkills, setPracticeSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  const [form, setForm] = useState({
    topic: session.topic || "",
    details: session.details || "",
    session_date: session.session_date || "",
  });

  // Technical sessions require skill selection on completion
  const TECHNICAL_FOCUSES = ["project_support", "technical_guidance"];
  const isTechnicalSession = TECHNICAL_FOCUSES.includes(session.session_focus);
  const isCompleted = session.status === "completed";

  // Fetch practiced skills when session is completed
  useEffect(() => {
    if (!isCompleted || !isTechnicalSession) return;

    async function fetchPracticedSkills() {
      try {
        setLoadingSkills(true);
        const res = await fetch(
          `${API_BASE}/mentorship/sessions/${session.id}/skills`,
        );
        if (!res.ok) throw new Error("Failed to fetch skills");
        const data = await res.json();
        // Extract skill names from response
        const skillNames = data.map((s) =>
          typeof s === "string" ? s : s.skill_name,
        );
        setPracticeSkills(skillNames);
      } catch (err) {
        console.error("Failed to load practiced skills:", err);
        setPracticeSkills([]);
      } finally {
        setLoadingSkills(false);
      }
    }

    fetchPracticedSkills();
  }, [session.id, isCompleted, isTechnicalSession]);

  useEffect(() => {
    setForm({
      topic: session.topic || "",
      details: session.details || "",
      session_date: session.session_date || "",
    });
  }, [session]);

  const formatDateInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const handleStatusClick = (status) => {
    if (!onUpdateStatus || !canManageStatus) return;
    onUpdateStatus(session.id, status, []);
  };

  const handleCompleteClick = () => {
    if (!canManageStatus) return;
    if (isTechnicalSession) {
      setShowSkillModal(true);
    } else {
      onUpdateStatus(session.id, "completed", []);
    }
  };

  const handleCompleteWithSkills = (skillIds) => {
    onUpdateStatus(session.id, "completed", skillIds);
    setShowSkillModal(false);
  };

  const handleDeleteClick = () => {
    if (!onDelete) return;
    onDelete(session.id);
  };

  const handleSave = async () => {
    setError("");
    if (!form.topic.trim() || !form.session_date) {
      setError("Topic and date are required.");
      return;
    }

    try {
      await onUpdateDetails(session.id, {
        topic: form.topic.trim(),
        details: form.details.trim(),
        session_date: form.session_date,
      });
      setIsEditing(false);
    } catch (err) {
      setError("Save failed. Please try again.");
    }
  };

  const handleReschedule = async () => {
    if (!onReschedule || !canReschedule) return;
    setError("");
    if (!form.session_date) {
      setError("Pick a new date/time to reschedule.");
      return;
    }
    try {
      await onReschedule(session.id, form.session_date);
    } catch (err) {
      setError("Reschedule failed. Try again.");
    }
  };

  const handleCancelEdit = () => {
    setError("");
    setIsEditing(false);
    setForm({
      topic: session.topic || "",
      details: session.details || "",
      session_date: session.session_date || "",
    });
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
      {/* Top row: topic + status */}
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="flex flex-col gap-2 flex-1">
          {isEditing ?
            <input
              type="text"
              value={form.topic}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, topic: e.target.value }))
              }
              className="px-2 py-1 text-sm border rounded"
              placeholder="Session topic"
            />
          : <p className="font-semibold text-gray-900">{session.topic}</p>}

          <div className="flex items-center gap-2">
            {session.session_focus && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {SESSION_FOCUS_LABELS[session.session_focus]}
              </span>
            )}
            {isCompleted && isTechnicalSession && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                3x Mentorship Weight
              </span>
            )}
          </div>
        </div>

        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
            statusColors[session.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {session.status}
        </span>
      </div>

      {/* Details */}
      {isEditing ?
        <textarea
          value={form.details}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, details: e.target.value }))
          }
          className="w-full mt-2 px-2 py-1 text-sm border rounded"
          rows={2}
          placeholder="Add session details"
        />
      : <p className="text-sm text-gray-600 mb-2">{session.details}</p>}

      {/* Practiced skills section (for completed sessions) */}
      {isCompleted && isTechnicalSession && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {loadingSkills ?
            <p className="text-xs text-gray-400">Loading skills...</p>
          : practiceSkills.length > 0 ?
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-700">
                Skills Practiced:
              </p>
              <div className="flex flex-wrap gap-2">
                {practiceSkills.map((skill, idx) => (
                  <SkillBadge key={idx} skill={skill} size="sm" />
                ))}
              </div>
            </div>
          : <p className="text-xs text-gray-400">No skills recorded</p>}
        </div>
      )}

      {/* Mentor & Intern info */}
      <p className="text-xs text-gray-500 mt-2">
        Mentor:{" "}
        <span className="font-medium">
          {session.mentor}{" "}
          {session.mentor_role && (
            <span className="text-[10px] uppercase tracking-wide bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ml-1">
              {session.mentor_role}
            </span>
          )}
        </span>{" "}
        • Intern:{" "}
        <span className="font-medium">
          {session.intern}{" "}
          {session.intern_role && (
            <span className="text-[10px] uppercase tracking-wide bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full ml-1">
              {session.intern_role}
            </span>
          )}
        </span>{" "}
        • {new Date(session.session_date).toLocaleString()}
      </p>

      {session.status === "rescheduled" && (
        <p className="text-[11px] text-purple-700 bg-purple-50 px-2 py-1 rounded mt-2 inline-block">
          Rescheduled to {new Date(session.session_date).toLocaleString()}
        </p>
      )}

      {isEditing && (
        <div className="mt-3">
          <label className="text-xs text-gray-500">Session date/time</label>
          <input
            type="datetime-local"
            value={formatDateInput(form.session_date)}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, session_date: e.target.value }))
            }
            className="w-full mt-1 px-2 py-1 text-sm border rounded"
          />
          <div className="flex gap-2 mt-2 text-xs">
            <button
              type="button"
              onClick={handleReschedule}
              className={`px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/40 transition ${
                !canReschedule ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!canReschedule}
            >
              Save as Rescheduled
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mt-3 text-xs items-center">
        {isEditing ?
          <>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1 rounded-full bg-secondary text-white hover:opacity-90 transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </>
        : <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Edit
          </button>
        }

        <button
          type="button"
          onClick={() => handleStatusClick("accepted")}
          className={`px-2 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition ${
            !canManageStatus ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!canManageStatus}
        >
          Accept
        </button>

        <button
          type="button"
          onClick={handleCompleteClick}
          className={`px-2 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition ${
            !canManageStatus ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!canManageStatus}
        >
          Complete{isTechnicalSession ? " + Skills" : ""}
        </button>

        <button
          type="button"
          onClick={() => handleStatusClick("declined")}
          className={`px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition ${
            !canManageStatus ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!canManageStatus}
        >
          Decline
        </button>

        <button
          type="button"
          onClick={handleDeleteClick}
          className="ml-auto px-2 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition"
        >
          Delete
        </button>
      </div>

      {/* Skill Selection Modal for Technical Sessions */}
      <SkillSelectModal
        isOpen={showSkillModal}
        onClose={() => setShowSkillModal(false)}
        onConfirm={handleCompleteWithSkills}
      />
    </div>
  );
}

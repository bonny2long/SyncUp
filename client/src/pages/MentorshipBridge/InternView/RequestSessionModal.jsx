import React, { useState } from "react";
import { X } from "lucide-react";
import { createSession } from "../../../utils/api";
import { useUser } from "../../../context/UserContext";
import { useToast } from "../../../context/ToastContext";

const SESSION_FOCUS_OPTIONS = [
  { value: "project_support", label: "Project Support" },
  { value: "technical_guidance", label: "Technical Guidance" },
  { value: "career_guidance", label: "Career Guidance" },
  { value: "life_leadership", label: "Life and Leadership" },
  { value: "alumni_advice", label: "Alumni Advice" },
];

export default function RequestSessionModal({ mentor, onClose, onSuccess }) {
  const { user } = useUser();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    session_focus: "",
    topic: "",
    details: "",
    session_date: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.session_focus || !formData.topic || !formData.session_date) {
      addToast({
        type: "error",
        message: "Please fill in all required fields",
      });
      return;
    }

    setLoading(true);
    try {
      await createSession({
        intern_id: user.id,
        mentor_id: mentor.id,
        session_focus: formData.session_focus,
        topic: formData.topic,
        details: formData.details,
        session_date: formData.session_date,
        project_id: null,
      });

      addToast({
        type: "success",
        message: `Session requested with ${mentor.name}! 🎉`,
      });
      onSuccess();
    } catch (err) {
      console.error("Error creating session:", err);
      addToast({
        type: "error",
        message: "Failed to send request. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-primary">Request Session</h2>
          <p className="text-sm text-gray-600 mt-1">
            with <span className="font-medium">{mentor.name}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Session Focus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Purpose <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.session_focus}
              onChange={(e) =>
                setFormData({ ...formData, session_focus: e.target.value })
              }
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            >
              <option value="">Select session focus...</option>
              {SESSION_FOCUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
              placeholder="e.g., React Hooks best practices"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={formData.details}
              onChange={(e) =>
                setFormData({ ...formData, details: e.target.value })
              }
              placeholder="Any specific questions or areas you'd like to cover..."
              rows="3"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Date/Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.session_date}
              onChange={(e) =>
                setFormData({ ...formData, session_date: e.target.value })
              }
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-3 rounded-lg text-white font-medium transition ${
                loading ?
                  "bg-primary/40 cursor-not-allowed"
                : "bg-primary hover:bg-secondary"
              }`}
            >
              {loading ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

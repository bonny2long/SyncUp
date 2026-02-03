import React, { useState, useEffect } from "react";
import { X, Calendar, Clock } from "lucide-react";
import { createSession, fetchMentorAvailability } from "../../../utils/api";
import { formatDateTime } from "../../../utils/date";
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
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const [formData, setFormData] = useState({
    session_focus: "",
    topic: "",
    details: "",
    session_date: "",
  });

  // Fetch mentor's availability when modal opens
  useEffect(() => {
    async function fetchAvailability() {
      try {
        setLoadingSlots(true);
        const slots = await fetchMentorAvailability(mentor.id);
        setAvailabilitySlots(slots);
      } catch (err) {
        console.error("Failed to load availability:", err);
        addToast({
          type: "error",
          message: "Failed to load available times",
        });
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchAvailability();
  }, [mentor.id]);

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
        className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-gray-100 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 pb-4 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-primary">Book Session</h2>
          <p className="text-sm text-gray-600 mt-1">
            with <span className="font-medium">{mentor.name}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Available Time Slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4 inline mr-1" />
              Choose Your Preferred Time <span className="text-red-500">*</span>
            </label>

            {loadingSlots ?
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-500">
                  Loading available times...
                </p>
              </div>
            : availabilitySlots.length === 0 ?
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">
                  No available times for this mentor
                </p>
              </div>
            : <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {availabilitySlots.map((slot, index) => {
                  // Extract just the date part and combine with the time
                  const datePart = slot.available_date.split('T')[0];
                  const slotValue = `${datePart}T${slot.available_time}`;
                  const isSelected = formData.session_date === slotValue;

                  return (
                    <label
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                        isSelected ?
                          "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary/40 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="session_date"
                        value={slotValue}
                        checked={isSelected}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            session_date: e.target.value,
                          })
                        }
                        className="w-4 h-4 accent-primary"
                      />
                      <div className="flex-1">
                        <p
                          className={`font-medium ${isSelected ? "text-primary" : "text-gray-900"}`}
                        >
                          {formatDateTime(
                            slot.available_date,
                            slot.available_time,
                          )}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="text-primary text-sm font-medium">
                          ✓ Selected
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            }
          </div>

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

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !formData.session_date ||
                !formData.session_focus ||
                !formData.topic
              }
              className={`flex-1 px-4 py-3 rounded-lg text-white font-medium transition ${
                (
                  loading ||
                  !formData.session_date ||
                  !formData.session_focus ||
                  !formData.topic
                ) ?
                  "bg-primary/40 cursor-not-allowed"
                : "bg-primary hover:bg-secondary"
              }`}
            >
              {loading ? "Sending Request..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

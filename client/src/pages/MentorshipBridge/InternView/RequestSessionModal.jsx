import React, { useState, useEffect } from "react";
import { Calendar, Clock, Send, X } from "lucide-react";
import {
  createSession,
  fetchMentorAvailability,
  fetchMentorSessions,
  fetchSessions,
} from "../../../utils/api";
import {
  formatDateTime,
  normalizeDateTime,
  normalizeIsoDateTime,
} from "../../../utils/date";
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
  const [refreshKey, setRefreshKey] = useState(0); // To force refresh availability
  const [bookedSlots, setBookedSlots] = useState(new Set()); // Track booked slots for immediate validation
  const [isClearingSelection, setIsClearingSelection] = useState(false); // Prevent form submission during clearing

  const [formData, setFormData] = useState({
    session_focus: "",
    topic: "",
    details: "",
    session_date: "",
  });

  // Fetch mentor's availability and filter out booked slots
  useEffect(() => {
    async function fetchAvailability() {
      try {
        setLoadingSlots(true);
        const [availabilitySlots, existingSessions] = await Promise.all([
          fetchMentorAvailability(mentor.id),
          fetchMentorSessions(mentor.id, "all"), // Get all sessions to filter out any booked slots
        ]);

        // Fallback: If fetchMentorSessions doesn't work, try the general fetchSessions
        if (!existingSessions || existingSessions.length === 0) {
          try {
            const allSessions = await fetchSessions(mentor.id);
            existingSessions.push(...allSessions);
          } catch (fallbackErr) {
            console.warn("Fallback fetchSessions also failed:", fallbackErr);
          }
        }

        // Create a set of booked datetime combinations (include pending and accepted sessions)
        const bookedSlotsSet = new Set();

        existingSessions.forEach((session) => {
          if (session.status === "accepted" || session.status === "pending") {
            const normalizedSession = normalizeIsoDateTime(
              session.session_date,
            );
            if (normalizedSession) {
              bookedSlotsSet.add(normalizedSession);
            }
          }
        });

        // Filter out booked slots so they don't show up in the list at all
        const availableSlots = availabilitySlots.filter((slot) => {
          const normalizedSlot = normalizeDateTime(
            slot.available_date,
            slot.available_time,
          );
          if (!normalizedSlot) return false;
          return !bookedSlotsSet.has(normalizedSlot);
        });

        setAvailabilitySlots(availableSlots);
        setBookedSlots(bookedSlotsSet);
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
  }, [addToast, mentor.id, refreshKey]); // Add refreshKey to trigger refresh when needed

  // If currently selected slot becomes booked, clear selection
  useEffect(() => {
    // Only warn if the slot was selected and IS NOT the one we just successfully booked
    // Actually, simple way: if it's already booked, just clear it quietly if we are in loading state
    if (
      formData.session_date &&
      bookedSlots.has(formData.session_date) &&
      !loading &&
      !isClearingSelection
    ) {
      setIsClearingSelection(true);
      setFormData((prev) => ({ ...prev, session_date: "" }));
      addToast({
        type: "warning",
        message:
          "This time slot is no longer available. Please select another time.",
      });
      setTimeout(() => setIsClearingSelection(false), 100);
    }
  }, [
    addToast,
    bookedSlots,
    formData.session_date,
    isClearingSelection,
    loading,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if we're in the middle of clearing a booked slot
    if (isClearingSelection) {
      return;
    }

    if (!formData.session_focus || !formData.topic || !formData.session_date) {
      addToast({
        type: "error",
        message: "Please fill in all required fields",
      });
      return;
    }

    // Double-check the selected time isn't already booked
    if (bookedSlots.has(formData.session_date)) {
      addToast({
        type: "warning",
        message: "Please select an available time slot (not grayed out).",
        duration: 5000,
      });
      return;
    }

    setLoading(true);
    try {
      // Immediately add the selected slot to booked slots to prevent double-clicking
      const newBookedSlots = new Set(bookedSlots);
      newBookedSlots.add(formData.session_date);
      setBookedSlots(newBookedSlots);

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
        message: `Session requested with ${mentor.name}!`,
      });

      // Clear selection before closing to prevent useEffect from firing a warning
      setFormData((prev) => ({ ...prev, session_date: "" }));
      onSuccess();

      // Add a small delay to ensure backend processes the booking, then refresh availability
      setTimeout(() => {
        setRefreshKey((prev) => prev + 1);
      }, 1000); // 1 second delay
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-accent/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
        {/* Header */}
        <div className="sticky top-0 z-10 rounded-t-2xl border-b border-border bg-surface/95 p-6 pb-4 backdrop-blur">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-text-secondary transition hover:bg-surface-highlight hover:text-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <p className="text-xs font-bold uppercase text-primary">
            Mentorship Request
          </p>
          <h2 className="text-2xl font-black text-neutral-dark">
            Book a session
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Send a focused request to{" "}
            <span className="font-semibold text-primary">{mentor.name}</span>.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Available Time Slots */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-bold text-neutral-dark">
              <Calendar className="h-4 w-4 text-primary" />
              Choose Your Preferred Time <span className="text-red-500">*</span>
            </label>

            {loadingSlots ?
              <div className="flex items-center justify-center rounded-xl border border-border bg-surface-highlight py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            : availabilitySlots.length === 0 ?
              <div className="rounded-xl border border-dashed border-border bg-surface-highlight p-6 text-center">
                <Clock className="mx-auto mb-3 h-8 w-8 text-primary" />
                <p className="text-sm font-medium text-text-secondary">
                  No open times right now. This mentor has not posted
                  availability yet, or all posted times have been booked.
                </p>
              </div>
            : <>
                <div className="max-h-64 space-y-2 overflow-y-auto pr-2">
                  {availabilitySlots.map((slot, index) => {
                    const normalizedSlot = normalizeDateTime(
                      slot.available_date,
                      slot.available_time,
                    );
                    const isSelected = formData.session_date === normalizedSlot;

                    return (
                      <label
                        key={slot.id || index}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                          isSelected ?
                            "border-primary bg-primary/10"
                          : "border-border hover:border-primary/40 hover:bg-surface-highlight"
                        }`}
                      >
                        <input
                          type="radio"
                          name="session_date"
                          value={normalizedSlot}
                          checked={isSelected}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              session_date: e.target.value,
                            });
                          }}
                          className="h-4 w-4 accent-primary"
                        />
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              isSelected ? "text-primary" : "text-neutral-dark"
                            }`}
                          >
                            {formatDateTime(
                              slot.available_date,
                              slot.available_time,
                            )}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="rounded-full bg-primary px-2 py-1 text-xs font-bold text-white">
                            Selected
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </>
            }
          </div>

          {/* Session Focus */}
          <div>
            <label className="mb-2 block text-sm font-bold text-neutral-dark">
              Session Purpose <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.session_focus}
              onChange={(e) =>
                setFormData({ ...formData, session_focus: e.target.value })
              }
              className="input w-full"
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
            <label className="mb-2 block text-sm font-bold text-neutral-dark">
              Session Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
              placeholder="e.g., React Hooks best practices"
              className="input w-full"
              required
            />
          </div>

          {/* Details */}
          <div>
            <label className="mb-2 block text-sm font-bold text-neutral-dark">
              Additional Details (Optional)
            </label>
            <textarea
              value={formData.details}
              onChange={(e) =>
                setFormData({ ...formData, details: e.target.value })
              }
              placeholder="Any specific questions or areas you'd like to cover..."
              rows="3"
              className="input min-h-24 w-full resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-border px-4 py-3 font-semibold text-text-secondary transition hover:border-primary/30 hover:text-primary"
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
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 font-semibold text-white transition ${
                (
                  loading ||
                  !formData.session_date ||
                  !formData.session_focus ||
                  !formData.topic
                ) ?
                  "cursor-not-allowed bg-primary/40"
                : "bg-primary hover:bg-primary-dark"
              }`}
            >
              <Send className="h-4 w-4" />
              {loading ? "Sending Request..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

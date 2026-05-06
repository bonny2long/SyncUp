import React, { useCallback, useEffect, useState } from "react";
import { CalendarClock, Plus, Trash2 } from "lucide-react";
import {
  createMentorAvailability,
  deleteMentorAvailability,
  fetchMentorAvailability,
} from "../../../utils/api";
import { useToast } from "../../../context/ToastContext";
import { useUser } from "../../../context/UserContext";
import { formatDateTimeCompact } from "../../../utils/date";
import EmptyState from "../../../components/brand/EmptyState";

const getTodayInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AvailabilityManager() {
  const { user } = useUser();
  const { addToast } = useToast();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    available_date: "",
    available_time: "",
  });

  const loadAvailability = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError("");
      const data = await fetchMentorAvailability(user.id);
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load availability");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id || submitting) return;

    if (!form.available_date || !form.available_time) {
      setError("Choose a date and time before adding a slot.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const created = await createMentorAvailability(user.id, {
        available_date: form.available_date,
        available_time: form.available_time,
      });
      setSlots((prev) => [...prev, created]);
      setForm({ available_date: "", available_time: "" });
      addToast({ type: "success", message: "Availability slot added" });
    } catch (err) {
      const message = err.message || "Failed to add availability slot";
      setError(message);
      addToast({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (slotId) => {
    if (!slotId || removingId) return;

    try {
      setRemovingId(slotId);
      setError("");
      await deleteMentorAvailability(slotId);
      setSlots((prev) => prev.filter((slot) => slot.id !== slotId));
      addToast({ type: "info", message: "Availability slot removed" });
    } catch (err) {
      const message = err.message || "Failed to remove availability slot";
      setError(message);
      addToast({ type: "error", message });
    } finally {
      setRemovingId(null);
    }
  };

  const sortedSlots = [...slots].sort((a, b) => {
    const aDate = `${a.available_date || ""} ${a.available_time || ""}`;
    const bDate = `${b.available_date || ""} ${b.available_time || ""}`;
    return aDate.localeCompare(bDate);
  });
  const todayInputValue = getTodayInputValue();

  return (
    <div className="space-y-5">
      <div className="brand-card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-primary">
              Availability
            </p>
            <h2 className="text-xl font-bold text-neutral-dark">
              Post open mentorship times
            </h2>
            <p className="text-sm text-text-secondary">
              Post the times you are open for mentorship sessions.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface-highlight px-4 py-2 text-center">
          <p className="text-lg font-black text-primary">{slots.length}</p>
          <p className="text-xs font-semibold uppercase text-text-secondary">
            Open Slot{slots.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="brand-card grid gap-3 p-4 md:grid-cols-[1fr_1fr_auto]"
      >
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-text-secondary">
            Date
          </label>
          <input
            type="date"
            value={form.available_date}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, available_date: e.target.value }))
            }
            min={todayInputValue}
            className="input w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-text-secondary">
            Time
          </label>
          <input
            type="time"
            value={form.available_time}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, available_time: e.target.value }))
            }
            className="input w-full"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !form.available_date || !form.available_time}
          className="inline-flex items-center justify-center gap-2 self-end rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          {submitting ? "Adding..." : "Add Slot"}
        </button>
        <p className="text-xs text-text-secondary md:col-span-3">
          Interns only see open slots. Once a slot is requested, it leaves the
          booking modal and can no longer be removed here.
        </p>
      </form>

      {error && (
        <div className="brand-card border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            {error}
          </p>
        </div>
      )}

      <div className="brand-card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-neutral-dark">Posted Slots</h3>
            <p className="text-sm text-text-secondary">
              These are currently open for intern requests.
            </p>
          </div>
        </div>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : sortedSlots.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No availability posted yet."
            description="Add a slot above so interns can request time with you."
          />
        ) : (
          <div className="space-y-3">
            {sortedSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface-highlight p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-dark">
                      {formatDateTimeCompact(
                        slot.available_date,
                        slot.available_time,
                      )}
                    </p>
                    <p className="text-xs text-text-secondary">
                      Available for mentorship requests
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(slot.id)}
                  disabled={removingId === slot.id}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-secondary transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                  {removingId === slot.id ? "Removing..." : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

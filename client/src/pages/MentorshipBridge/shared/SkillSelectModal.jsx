import React, { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { fetchSkills } from "../../../utils/api";

/**
 * Modal for selecting skills when completing a technical mentorship session.
 * Only shows for session_focus: project_support | technical_guidance
 */
export default function SkillSelectModal({ isOpen, onClose, onConfirm }) {
  const [skills, setSkills] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    async function loadSkills() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSkills();
        setSkills(data);
      } catch (err) {
        console.error("Failed to load skills:", err);
        setError("Could not load skills");
      } finally {
        setLoading(false);
      }
    }

    loadSkills();
    setSelected([]); // Reset selection when modal opens
  }, [isOpen]);

  const handleToggle = (skillId) => {
    setSelected((prev) =>
      prev.includes(skillId) ?
        prev.filter((id) => id !== skillId)
      : [...prev, skillId],
    );
  };

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  const handleSkip = () => {
    onConfirm([]); // Complete without skills
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-accent/70 p-4 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-primary" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 text-text-secondary transition hover:bg-surface-highlight hover:text-primary"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-start gap-3 pr-10 pt-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-primary">
              Complete Session
            </p>
            <h3 className="text-lg font-black text-neutral-dark">
              Select skills covered
            </h3>
            <p className="text-sm text-text-secondary">
              Choose the skills practiced or discussed in this technical session.
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center rounded-xl border border-border bg-surface-highlight py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="mb-4 flex max-h-60 flex-col gap-2 overflow-y-auto">
            {skills.map((skill) => (
              <label
                key={skill.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                  selected.includes(skill.id) ?
                    "border-primary/40 bg-primary/10"
                  : "border-border bg-surface-highlight hover:border-primary/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(skill.id)}
                  onChange={() => handleToggle(skill.id)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm font-medium text-neutral-dark">
                  {skill.skill_name}
                </span>
                {skill.category && (
                  <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-xs text-text-secondary">
                    {skill.category}
                  </span>
                )}
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition hover:border-primary/30 hover:text-primary"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selected.length === 0}
            className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition ${
              selected.length === 0 ?
                "cursor-not-allowed bg-primary/40"
              : "bg-primary hover:bg-primary-dark"
            }`}
          >
            Complete with {selected.length} skill
            {selected.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

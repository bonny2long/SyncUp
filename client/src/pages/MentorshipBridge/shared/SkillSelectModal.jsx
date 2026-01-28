import React, { useEffect, useState } from "react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Select Skills Covered
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Which skills were practiced or discussed in this session?
        </p>

        {loading && (
          <p className="text-sm text-gray-400 py-4">Loading skills...</p>
        )}

        {error && <p className="text-sm text-red-500 py-4">{error}</p>}

        {!loading && !error && (
          <div className="max-h-60 overflow-y-auto flex flex-col gap-2 mb-4">
            {skills.map((skill) => (
              <label
                key={skill.id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                  selected.includes(skill.id) ?
                    "bg-primary/10 border border-primary/30"
                  : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(skill.id)}
                  onChange={() => handleToggle(skill.id)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm font-medium text-gray-800">
                  {skill.skill_name}
                </span>
                {skill.category && (
                  <span className="text-xs text-gray-400 ml-auto">
                    {skill.category}
                  </span>
                )}
              </label>
            ))}
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selected.length === 0}
            className={`px-4 py-2 text-sm rounded-lg text-white transition ${
              selected.length === 0 ?
                "bg-primary/40 cursor-not-allowed"
              : "bg-primary hover:bg-secondary"
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

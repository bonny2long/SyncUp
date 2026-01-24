import React, { useState } from "react";
import { postUpdate } from "../../utils/api";
import { useUser } from "../../context/UserContext";

export default function AddUpdateForm({ onNewUpdate, selectedProjectId }) {
  const { user, loading: userLoading } = useUser();
  const [content, setContent] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) return;

    setSkills((prev) => [...prev, value]);
    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim() || loading || userLoading) return;
    if (!user?.id) {
      setError("User not loaded yet.");
      return;
    }
    const projectId = selectedProjectId || 1;

    try {
      setLoading(true);
      setError("");

      const newUpdate = await postUpdate(content, projectId, user.id, skills);
      setContent("");
      setSkills([]);
      setSkillInput("");

      if (onNewUpdate) onNewUpdate(newUpdate);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-2xl shadow-md flex flex-wrap gap-3 items-start"
    >
      <textarea
        className="w-full border border-gray-200 rounded-xl p-3 resize-none text-sm
                   focus:outline-none focus:ring-2 focus:ring-primary/40"
        rows={2}
        placeholder="Share an update..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
      />

      {/* Skill Tagging */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Tag skills (e.g. React, SQL)..."
            className="flex-1 text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-primary"
            disabled={loading}
          />
          <button
            type="button"
            onClick={addSkill}
            disabled={!skillInput.trim()}
            className="text-xs px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Add
          </button>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 text-[10px] rounded-full bg-primary/10 text-primary flex items-center gap-1"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:text-red-500 font-bold ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center w-full">
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className={`
            ml-auto px-4 py-2 rounded-xl font-medium text-white text-sm transition
            ${
              loading || !content.trim() ?
                "bg-primary/50 cursor-not-allowed"
              : "bg-primary hover:bg-secondary"
            }
          `}
        >
          {loading ? "Posting..." : "Post Update"}
        </button>
      </div>
    </form>
  );
}

import React, { useState } from "react";
import { postUpdate } from "../../utils/api";
import { useUser } from "../../context/UserContext";

import SkillMultiSelect from "../../components/shared/SkillMultiSelect";

export default function AddUpdateForm({
  onNewUpdate,
  selectedProjectId,
  allSkills = [],
  projectSkills = [],
  loadingSkills = false,
}) {
  const { user, loading: userLoading } = useUser();
  const [content, setContent] = useState("");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim() || loading || userLoading) return;
    if (!user?.id) {
      setError("User not loaded yet.");
      return;
    }

    // Use selected project or fallback to project 1
    const projectId = selectedProjectId || 1;

    try {
      setLoading(true);
      setError("");

      // Post update with skills array
      const newUpdate = await postUpdate(content, projectId, user.id, skills);

      // Reset form
      setContent("");
      setSkills([]);

      // Notify parent component
      if (onNewUpdate) onNewUpdate(newUpdate);
    } catch (err) {
      console.error("Error posting update:", err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-2xl shadow-md flex flex-col gap-4"
    >
      {/* Content textarea */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          What did you work on?
        </label>
        <textarea
          className="w-full border border-gray-200 rounded-xl p-3 resize-none text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/40"
          rows={3}
          placeholder="Describe your progress, challenges, or achievements..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      {/* Skill Tagging */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Skills Used
        </label>
        <SkillMultiSelect
          selectedSkills={skills}
          onChange={setSkills}
          suggestedSkills={projectSkills}
          allSkills={allSkills}
          loading={loadingSkills}
          placeholder="Select skills you practiced..."
        />
        {skills.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {skills.length} skill{skills.length !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      {/* Submit button and error */}
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

import React, { useState } from "react";
import { postUpdate } from "../../utils/api";
import { useUser } from "../../context/UserContext";

import SkillMultiSelect from "../../components/shared/SkillMultiSelect";

export default function AddUpdateForm({
  onNewUpdate,
  selectedProjectId,
  allSkills,
  projectSkills,
  loadingSkills,
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
    const projectId = selectedProjectId || 1;

    try {
      setLoading(true);
      setError("");

      const newUpdate = await postUpdate(content, projectId, user.id, skills);
      setContent("");
      setSkills([]);

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
      className="bg-white p-4 rounded-2xl shadow-md flex flex-col gap-4"
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

      {/* Skill Tagging using shared component */}
      <div className="w-full">
        <p className="text-xs font-medium text-gray-500 mb-2">Tag Skills</p>
        <SkillMultiSelect
          selectedSkills={skills}
          onChange={setSkills}
          suggestedSkills={projectSkills}
          allSkills={allSkills}
          loading={loadingSkills}
          placeholder="What did you work on?"
        />
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

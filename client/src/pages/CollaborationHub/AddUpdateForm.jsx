import React, { useState, useEffect } from "react";
import { postUpdate } from "../../utils/api";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import SkillMultiSelect from "../../components/shared/SkillMultiSelect";

export default function AddUpdateForm({
  onNewUpdate,
  selectedProjectId,
  allSkills = [],
  projectSkills = [],
  loadingSkills = false,
}) {
  const { user, loading: userLoading } = useUser();
  const { addToast } = useToast();
  const [content, setContent] = useState("");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSkills, setRecentSkills] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  // Fetch user's recent skills on mount
  useEffect(() => {
    if (!user?.id) return;

    async function fetchRecentSkills() {
      try {
        setLoadingRecent(true);
        const res = await fetch(
          `http://localhost:5000/api/skills/user/${user.id}/recent`,
        );
        if (!res.ok) throw new Error("Failed to fetch recent skills");
        const data = await res.json();
        const skillNames = data.map((s) => s.skill_name.toLowerCase());
        setRecentSkills(skillNames);
      } catch (err) {
        console.error("Error fetching recent skills:", err);
        // Don't show error toast for this - it's not critical
      } finally {
        setLoadingRecent(false);
      }
    }

    fetchRecentSkills();
  }, [user?.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim() || loading || userLoading) return;
    if (!user?.id) {
      addToast("User not loaded yet", "error");
      return;
    }

    const projectId = selectedProjectId || 1;

    try {
      setLoading(true);

      const newUpdate = await postUpdate(content, projectId, user.id, skills);

      // Success feedback
      addToast(
        `Update posted with ${skills.length} skill${skills.length !== 1 ? "s" : ""}`,
        "success",
      );

      // Reset form
      setContent("");
      setSkills([]);

      if (onNewUpdate) onNewUpdate(newUpdate);
    } catch (err) {
      console.error("Error posting update:", err);
      addToast("Failed to post update. Try again.", "error", 4000);
    } finally {
      setLoading(false);
    }
  }

  const isSubmitDisabled = loading || !content.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-2xl shadow-md flex flex-col gap-4 transition-opacity"
    >
      {/* Content textarea */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          What did you work on?
        </label>
        <textarea
          className="w-full border border-gray-200 rounded-xl p-3 resize-none text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/40
                     disabled:bg-gray-50 disabled:text-gray-500 transition"
          rows={3}
          placeholder="Describe your progress, challenges, or achievements..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          required
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-400">
            {content.length > 0 ? `${content.length} characters` : ""}
          </span>
        </div>
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
          recentSkills={recentSkills}
          allSkills={allSkills}
          loading={loadingSkills || loadingRecent}
          placeholder="Select skills you practiced..."
        />
        {skills.length > 0 && (
          <p className="text-xs text-primary font-medium mt-1">
            ✓ {skills.length} skill{skills.length !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      {/* Submit button */}
      <div className="flex justify-end w-full pt-2">
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`
            px-5 py-2.5 rounded-xl font-medium text-white text-sm transition-all
            ${
              isSubmitDisabled ?
                "bg-primary/40 cursor-not-allowed"
              : "bg-primary hover:bg-secondary active:scale-95"
            }
          `}
        >
          {loading ?
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Posting...
            </span>
          : "Post Update"}
        </button>
      </div>
    </form>
  );
}

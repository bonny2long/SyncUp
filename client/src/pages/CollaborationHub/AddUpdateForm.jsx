import React, { useState } from "react";
import { postUpdate } from "../../utils/api";
import { useUser } from "../../context/UserContext";

export default function AddUpdateForm({ onNewUpdate, selectedProjectId }) {
  const { user, loading: userLoading } = useUser();
  const [content, setContent] = useState("");
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

      const newUpdate = await postUpdate(content, projectId, user.id);
      setContent("");

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
        className="flex-1 border border-gray-200 rounded-xl p-3 resize-none text-sm
                   focus:outline-none focus:ring-2 focus:ring-primary/40"
        rows={2}
        placeholder="Share an update..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
      />

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className={`
          px-4 py-2 rounded-xl font-medium text-white transition shrink-0
          ${
            loading || !content.trim()
              ? "bg-primary/50 cursor-not-allowed"
              : "bg-primary hover:bg-secondary"
          }
        `}
      >
        {loading ? "Posting..." : "Post"}
      </button>

      {error && <p className="text-red-500 text-xs w-full">{error}</p>}
    </form>
  );
}

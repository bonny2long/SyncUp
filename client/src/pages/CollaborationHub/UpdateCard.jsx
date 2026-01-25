import React, { useState } from "react";
import { Trash2, Edit2 } from "lucide-react";
import SkillBadge from "../../components/shared/SkillBadge";

export default function UpdateCard({
  update,
  onEdit,
  onDelete,
  isSelectedProject,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(update.content);
  const [localError, setLocalError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setLocalError("");
    if (!draft.trim()) {
      setLocalError("Content cannot be empty.");
      return;
    }
    try {
      await onEdit(update.id, draft.trim());
      setIsEditing(false);
      setMenuOpen(false);
    } catch (err) {
      setLocalError("Could not save changes.");
    }
  };

  const handleDeleteClick = async () => {
    setMenuOpen(false);
    setDeleting(true);
    try {
      await onDelete(update.id);
    } catch (err) {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div
      className={`p-4 rounded-xl border bg-white hover:shadow-md transition relative ${
        deleting ? "opacity-50 scale-[0.99]" : ""
      }`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-primary/20 flex items-center justify-center rounded-full text-primary font-semibold text-sm">
            {update.user_name?.charAt(0) || "U"}
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">
              {update.user_name || "Unknown User"}
            </p>
            {update.user_role && (
              <span className="text-[10px] uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded-full w-fit">
                {update.user_role}
              </span>
            )}
          </div>

          {update.project_title && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full whitespace-nowrap">
              {update.project_title}
            </span>
          )}
        </div>

        {/* Action menu */}
        <div className="relative ml-2">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-600 hover:text-gray-900"
            title="More actions"
          >
            ⋮
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                onClick={() => {
                  setIsEditing(true);
                  setMenuOpen(false);
                }}
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                onClick={handleDeleteClick}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content or edit mode */}
      {isEditing ?
        <div className="flex flex-col gap-3">
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent resize-none"
            rows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Update your progress..."
          />
          {localError && (
            <p className="text-xs text-red-500 font-medium">{localError}</p>
          )}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setLocalError("");
                setDraft(update.content);
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:opacity-90 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      : <div className="flex flex-col gap-3">
          {/* Content */}
          <p className="text-gray-700 leading-relaxed">{update.content}</p>

          {/* Skill badges */}
          {update.tagged_skills && update.tagged_skills.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              {update.tagged_skills.map((skill, idx) => (
                <SkillBadge key={idx} skill={skill} size="sm" variant="badge" />
              ))}
            </div>
          )}
        </div>
      }

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
        <span>{formatDate(update.created_at)}</span>
        {isSelectedProject && (
          <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
            Viewing
          </span>
        )}
      </div>
    </div>
  );
}

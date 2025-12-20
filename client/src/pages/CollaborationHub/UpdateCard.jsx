import React, { useState } from "react";

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

  return (
    <div
      className={`p-4 rounded-xl border bg-neutral-light hover:shadow transition relative ${
        deleting ? "opacity-50 scale-[0.99] transition duration-200" : ""
      }`}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-secondary/20 flex items-center justify-center rounded-full text-secondary font-semibold">
          {update.user_name.charAt(0)}
        </div>

        <div className="flex flex-col">
          <p className="font-medium text-neutral-dark">{update.user_name}</p>
          {update.user_role && (
            <span className="text-[10px] uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded-full w-fit">
              {update.user_role}
            </span>
          )}
        </div>

        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full ml-auto">
          {update.project_title}
        </span>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-full hover:bg-gray-100"
            title="More actions"
          >
            ⋮
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-100 rounded-lg shadow-md z-10">
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-light"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={handleDeleteClick}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content or edit textarea */}
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <textarea
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          {localError && (
            <p className="text-xs text-red-500">{localError}</p>
          )}
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1 rounded-lg bg-primary text-white hover:bg-secondary transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setLocalError("");
                setDraft(update.content);
              }}
              className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700">{update.content}</p>
      )}

      <div className="flex items-center mt-2 text-xs text-gray-400 gap-3">
        <span>{new Date(update.created_at).toLocaleString()}</span>
        {isSelectedProject && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent">
            Viewing
          </span>
        )}
      </div>
    </div>
  );
}

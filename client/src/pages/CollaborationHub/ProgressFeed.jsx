import React, { useEffect, useState } from "react";
import {
  fetchUpdates,
  updateProgressUpdate,
  deleteProgressUpdate,
} from "../../utils/api";
import AddUpdateForm from "./AddUpdateForm";
import UpdateCard from "./UpdateCard";

export default function ProgressFeed({
  selectedProjectId,
  selectedProjectTitle,
  onClearProject,
}) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUpdates() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchUpdates(selectedProjectId || undefined);
      setUpdates(data);
    } catch (err) {
      console.error("Error loading updates:", err);
      setError("Unable to load updates right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUpdates();
  }, [selectedProjectId]);

  const handleNewUpdate = (u) => {
    setUpdates((prev) => [u, ...prev]);
  };

  const handleEdit = async (id, content) => {
    const previous = updates;
    setUpdates((prev) =>
      prev.map((u) => (u.id === id ? { ...u, content } : u))
    );
    try {
      const updated = await updateProgressUpdate(id, content);
      if (updated) {
        setUpdates((prev) =>
          prev.map((u) => (u.id === id ? { ...u, ...updated } : u))
        );
      }
    } catch (err) {
      setError("Could not save changes.");
      setUpdates(previous);
      throw err;
    }
  };

  const handleDelete = async (id) => {
    const previous = updates;
    setUpdates((prev) => prev.filter((u) => u.id !== id));
    try {
      await deleteProgressUpdate(id);
    } catch (err) {
      setError("Could not delete update.");
      setUpdates(previous);
      throw err;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AddUpdateForm
        onNewUpdate={handleNewUpdate}
        selectedProjectId={selectedProjectId}
      />

      {selectedProjectId && (
        <div className="p-3 bg-primary/10 text-primary rounded-xl font-medium text-sm flex items-center justify-between">
          <span>Viewing updates for: {selectedProjectTitle || "Project"}</span>
          <button
            type="button"
            onClick={onClearProject}
            className="text-xs px-3 py-1 rounded-lg bg-white text-primary border border-primary hover:bg-primary hover:text-white transition"
          >
            Show All Updates
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 h-16 rounded-xl"
            />
          ))}
        </div>
      ) : updates.length === 0 ? (
        <p className="text-gray-500 text-sm">No updates yet...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {updates.map((update) => (
            <UpdateCard
              key={update.id}
              update={update}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isSelectedProject={
                selectedProjectId !== null &&
                selectedProjectId !== undefined &&
                update.project_id === selectedProjectId
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

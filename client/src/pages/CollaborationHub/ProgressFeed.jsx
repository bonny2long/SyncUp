import React, { useCallback, useEffect, useState } from "react";
import {
  fetchUpdates,
  updateProgressUpdate,
  deleteProgressUpdate,
  fetchSkills,
} from "../../utils/api";
import { FileText } from "lucide-react";

import AddUpdateForm from "./AddUpdateForm";
import UpdateCard from "./UpdateCard";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function ProgressFeed({
  selectedProjectId,
  selectedProjectTitle,
  onClearProject,
  updates: passedUpdates = null, // NEW: Accept updates as prop
  currentUserId, // NEW: Accept currentUserId as prop
}) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [allSkills, setAllSkills] = useState([]);
  const [projectSkills, setProjectSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  // Load all skills once when component mounts
  useEffect(() => {
    async function loadSkills() {
      try {
        setLoadingSkills(true);
        const skills = await fetchSkills();
        setAllSkills(skills);
      } catch (err) {
        console.error("Failed to load skills:", err);
      } finally {
        setLoadingSkills(false);
      }
    }

    loadSkills();
  }, []);

  // Load project-specific skills when project is selected
  useEffect(() => {
    if (!selectedProjectId) {
      setProjectSkills([]);
      return;
    }

    async function loadProjectSkills() {
      try {
        const response = await fetch(
          `${API_BASE}/projects/${selectedProjectId}/skills`,
        );
        if (!response.ok) throw new Error("Failed to fetch project skills");
        const data = await response.json();

        // Convert skill objects to lowercase names for matching
        const skillNames = data.map((s) => s.skill_name.toLowerCase());
        setProjectSkills(skillNames);
      } catch (err) {
        console.error("Failed to load project skills:", err);
        setProjectSkills([]);
      }
    }

    loadProjectSkills();
  }, [selectedProjectId]);

  // Load updates from API OR use passed-in updates
  const loadUpdates = useCallback(async () => {
    // If updates are passed in as props, use those
    if (passedUpdates) {
      setUpdates(passedUpdates);
      setLoading(false);
      return;
    }

    // Otherwise, fetch from API
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
  }, [passedUpdates, selectedProjectId]);

  useEffect(() => {
    loadUpdates();
  }, [loadUpdates]);

  const handleNewUpdate = (u) => {
    setUpdates((prev) => [u, ...prev]);
  };

  const handleEdit = async (id, content) => {
    const previous = updates;
    setUpdates((prev) =>
      prev.map((u) => (u.id === id ? { ...u, content } : u)),
    );
    try {
      const updated = await updateProgressUpdate(id, content);
      if (updated) {
        setUpdates((prev) =>
          prev.map((u) => (u.id === id ? { ...u, ...updated } : u)),
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

  // Filter updates if currentUserId is provided
  const displayUpdates =
    currentUserId ?
      updates.filter((u) => u.user_id === currentUserId)
    : updates;

  return (
    <div className="flex flex-col gap-6">
      {selectedProjectId ?
        <AddUpdateForm
          onNewUpdate={handleNewUpdate}
          selectedProjectId={selectedProjectId}
          allSkills={allSkills}
          projectSkills={projectSkills}
          loadingSkills={loadingSkills}
        />
      : <div className="rounded-2xl border border-dashed border-border bg-surface-highlight p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <p className="mb-2 text-sm font-semibold text-neutral-dark">
            Select a project from "My Work" to post an update
          </p>
          <p className="text-xs text-text-secondary">
            Your project updates will appear here
          </p>
        </div>
      }

      {selectedProjectId && (
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/10 p-3 text-sm font-medium text-primary">
          <span>Viewing updates for: {selectedProjectTitle || "Project"}</span>
          <button
            type="button"
            onClick={onClearProject}
            className="rounded-full border border-primary/20 bg-surface px-3 py-1 text-xs font-bold text-primary transition hover:bg-primary hover:text-white"
          >
            Show All Updates
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {loading ?
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-surface-highlight"
            />
          ))}
        </div>
      : displayUpdates.length === 0 ?
        <div className="rounded-xl border border-dashed border-border bg-surface-highlight px-4 py-6 text-center">
          <p className="text-sm font-semibold text-neutral-dark">
            No updates yet
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Updates you post to your projects will appear here.
          </p>
        </div>
      : <div className="flex flex-col gap-3">
          {displayUpdates.map((update) => (
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
      }
    </div>
  );
}

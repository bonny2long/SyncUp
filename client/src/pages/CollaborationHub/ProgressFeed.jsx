import React, { useEffect, useState } from "react";
import {
  fetchUpdates,
  updateProgressUpdate,
  deleteProgressUpdate,
  fetchSkills,
} from "../../utils/api";
import SkillMultiSelect from "../../components/shared/SkillMultiSelect";

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
  const [selectedSkills, setSelectedSkills] = useState([]);
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
  async function loadUpdates() {
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
  }

  useEffect(() => {
    loadUpdates();
  }, [selectedProjectId, passedUpdates]);

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
      <AddUpdateForm
        onNewUpdate={handleNewUpdate}
        selectedProjectId={selectedProjectId}
        allSkills={allSkills}
        projectSkills={projectSkills}
        loadingSkills={loadingSkills}
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

      {loading ?
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 h-16 rounded-xl"
            />
          ))}
        </div>
      : displayUpdates.length === 0 ?
        <p className="text-gray-500 text-sm">No updates yet...</p>
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

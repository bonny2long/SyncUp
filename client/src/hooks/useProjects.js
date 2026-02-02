import { useState, useEffect } from "react";
import { fetchProjects } from "../utils/api";
import { getErrorMessage } from "../utils/errorHandler";

/**
 * Shared hook for fetching and filtering projects
 * Used by both CollaborationHub and Portfolio
 */
export function useProjects(userId, options = {}) {
  const {
    includeAll = false, // If true, fetch all projects (for discovery)
    autoLoad = true,
  } = options;

  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProjects = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch projects
      const data = await fetchProjects(userId);
      setAllProjects(data);
    } catch (err) {
      const { message } = getErrorMessage(err);
      setError(message);
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadProjects();
    }
  }, [userId, autoLoad]);

  // Filtered project groups
  const myProjects = allProjects.filter(
    (p) => p.is_member === 1 || p.is_member === true,
  );

  const activeProjects = myProjects.filter(
    (p) => p.status === "planned" || p.status === "active",
  );

  const completedProjects = myProjects.filter(
    (p) => p.status === "completed" || p.status === "archived",
  );

  const discoverProjects = allProjects.filter(
    (p) =>
      p.owner_id !== userId &&
      p.is_member !== 1 &&
      p.is_member !== true &&
      (p.status === "active" || p.status === "planned"),
  );

  return {
    // Raw data
    allProjects,
    loading,
    error,

    // Filtered groups
    myProjects,
    activeProjects,
    completedProjects,
    discoverProjects,

    // Actions
    refresh: loadProjects,
  };
}

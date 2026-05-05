import React, { useState, useEffect } from "react";
import { ArrowUpDown, FolderSearch, Search } from "lucide-react";
import EmptyState from "../../components/brand/EmptyState";
import DiscoverProjects from "./DiscoverProjects";
import { fetchProjectSkills } from "../../utils/api";

export default function DiscoverPanel({
  projects,
  selectedProject,
  setSelectedProject,
  onJoinClick,
  onViewProject,
  loading,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [availableSkills, setAvailableSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);

  useEffect(() => {
    async function loadSkills() {
      try {
        setSkillsLoading(true);
        const skills = await fetchProjectSkills();
        setAvailableSkills(skills);
      } catch (err) {
        console.error("Failed to load skills:", err);
        setAvailableSkills([]);
      } finally {
        setSkillsLoading(false);
      }
    }
    loadSkills();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkill =
      skillFilter === "all" ||
      (p.skill_ids && p.skill_ids.split(",").includes(skillFilter));

    return matchesSearch && matchesSkill;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.created_at || b.id || 0) -
          new Date(a.created_at || a.id || 0)
        );

      case "active":
        return (b.update_count || 0) - (a.update_count || 0);

      case "team_large":
        return (b.team_count || 0) - (a.team_count || 0);

      case "team_small":
        return (a.team_count || 0) - (b.team_count || 0);

      default:
        return 0;
    }
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="brand-card p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FolderSearch className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-primary">Project Discovery</p>
            <h2 className="text-lg font-black text-neutral-dark">
              Discover Projects
            </h2>
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input bg-white pl-10"
          />
        </div>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            disabled={skillsLoading}
            className="input bg-white"
          >
            <option value="all">
              All Skills {!skillsLoading && `(${projects.length})`}
            </option>
            {availableSkills.slice(0, 15).map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.skill_name} ({skill.project_count})
              </option>
            ))}
            {availableSkills.length > 15 && <option disabled>------</option>}
            {availableSkills.length > 15 && (
              <option disabled>
                {availableSkills.length - 15} more skills
              </option>
            )}
          </select>

          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input bg-white pl-10"
            >
              <option value="newest">Newest First</option>
              <option value="active">Most Active</option>
              <option value="team_large">Largest Team</option>
              <option value="team_small">Smallest Team</option>
            </select>
          </div>
        </div>

        {!loading && (
          <p className="text-xs font-semibold text-text-secondary">
            {sortedProjects.length === projects.length ?
              `Showing all ${projects.length} projects`
            : `Showing ${sortedProjects.length} of ${projects.length} projects`}
          </p>
        )}
      </div>

      {loading ?
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-surface-highlight"
            />
          ))}
        </div>
      : sortedProjects.length === 0 ?
        <div className="brand-card flex flex-col items-center justify-center p-8 text-center">
          <EmptyState
            icon={FolderSearch}
            title="No projects found"
            message={
              searchQuery || skillFilter !== "all" ?
                "Try adjusting your search or filters."
              : "No projects are available yet."
            }
          />
          {(searchQuery || skillFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSkillFilter("all");
              }}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary/90"
            >
              Clear Filters
            </button>
          )}
        </div>
      : <DiscoverProjects
          projects={sortedProjects}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          onJoinClick={onJoinClick}
          onViewProject={onViewProject}
        />
      }
    </div>
  );
}

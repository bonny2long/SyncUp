import React, { useState, useEffect } from "react";
import { Search, Calendar, Users, Target } from "lucide-react";
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

  // Load available skills from database
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

  // Filter by search and skill
  const filteredProjects = projects.filter((p) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Skill filter
    const matchesSkill =
      skillFilter === "all" ||
      (p.skill_ids && p.skill_ids.split(',').includes(skillFilter));

    return matchesSearch && matchesSkill;
  });

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at || b.id || 0) - new Date(a.created_at || a.id || 0);
      
      case 'active':
        return (b.update_count || 0) - (a.update_count || 0);
      
      case 'team_large':
        return (b.team_count || 0) - (a.team_count || 0);
      
      case 'team_small':
        return (a.team_count || 0) - (b.team_count || 0);
      
      default:
        return 0;
    }
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-accent mb-3">
          Discover Projects
        </h2>

        {/* SEARCH BAR */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent/40 focus:outline-none"
          />
        </div>

        {/* FILTERS ROW */}
        <div className="grid grid-cols-2 gap-3 mb-3">
           {/* SKILL FILTER */}
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            disabled={skillsLoading}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent/40 focus:outline-none"
          >
            <option value="all">
              All Skills {!skillsLoading && `(${projects.length})`}
            </option>
            {availableSkills.slice(0, 15).map(skill => (
              <option key={skill.id} value={skill.id}>
                {skill.skill_name} ({skill.project_count})
              </option>
            ))}
            {availableSkills.length > 15 && (
              <option disabled>
                ──────
              </option>
            )}
            {availableSkills.length > 15 && (
              <option disabled>
                {availableSkills.length - 15} more skills (use search)
              </option>
            )}
          </select>

          {/* SORT DROPDOWN */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent/40 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="active">Most Active</option>
            <option value="team_large">Largest Team</option>
            <option value="team_small">Smallest Team</option>
          </select>
        </div>

        {/* RESULTS COUNT */}
        {!loading && (
          <p className="text-xs text-gray-500 mb-2">
            {sortedProjects.length === projects.length ?
              `Showing all ${projects.length} projects`
            : `Showing ${sortedProjects.length} of ${projects.length} projects`}
          </p>
        )}
      </div>

      {/* PROJECT LIST */}
      {loading ?
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 h-24 rounded-lg"
            />
          ))}
        </div>
      : sortedProjects.length === 0 ?
        <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
          <p className="text-gray-500 text-lg mb-2">No projects found</p>
          <p className="text-gray-400 text-sm">
            {searchQuery || skillFilter !== 'all' ? 
              "Try adjusting your search or filters" 
            : "No projects available yet"}
          </p>
          {(searchQuery || skillFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSkillFilter("all");
              }}
              className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition text-sm"
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
import React, { useState } from "react";
import DiscoverProjects from "./DiscoverProjects";

export default function DiscoverPanel({
  projects,
  selectedProject,
  setSelectedProject,
  onJoinClick,
  loading,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");

  // Filter by search
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-accent mb-3">
          Discover Projects
        </h2>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent/40 focus:outline-none mb-3"
        />

        {/* SKILL FILTER */}
        <select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent/40 focus:outline-none"
        >
          <option value="all">All Skills</option>
          <option value="react">React</option>
          <option value="design">Design</option>
          <option value="backend">Backend</option>
          <option value="devops">DevOps</option>
        </select>
      </div>

      {loading ?
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 h-24 rounded-lg"
            />
          ))}
        </div>
      : filteredProjects.length === 0 ?
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No projects found</p>
          <p className="text-xs mt-1">Try adjusting your search</p>
        </div>
      : <DiscoverProjects
          projects={filteredProjects}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          onJoinClick={onJoinClick}
        />
      }
    </div>
  );
}

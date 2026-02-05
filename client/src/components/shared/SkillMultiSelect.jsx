import React, { useState, useEffect, useRef } from "react";
import { X, Plus, ChevronDown, Search } from "lucide-react";

// Get category color
export const getCategoryColor = (category) => {
  const colors = {
    frontend: "bg-blue-100 text-blue-700 border-blue-200",
    backend: "bg-green-100 text-green-700 border-green-200",
    technical: "bg-purple-100 text-purple-700 border-purple-200",
    soft: "bg-orange-100 text-orange-700 border-orange-200",
  };
  return colors[category] || "bg-gray-100 text-gray-700 border-gray-200";
};

/**
 * SkillMultiSelect - Tag-style skill selector for progress updates
 *
 * Features:
 * - Tag-based UI (chips you can add/remove)
 * - Searchable dropdown
 * - Suggested skills (from project + recent user skills) shown differently
 * - Color-coded by category
 *
 * Usage:
 * <SkillMultiSelect
 *   selectedSkills={["react", "node.js"]}
 *   onChange={(skills) => setSkills(skills)}
 *   suggestedSkills={["react", "sql"]}
 *   recentSkills={["node.js", "javascript"]}
 * />
 */
export default function SkillMultiSelect({
  selectedSkills = [],
  onChange,
  suggestedSkills = [],
  recentSkills = [],
  allSkills = [],
  loading = false,
  placeholder = "Add skills...",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllSkills, setShowAllSkills] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
        setShowAllSkills(false); // Reset to popular view
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get popular skills (top 15 by usage frequency if available, otherwise first 15 alphabetical)
  const popularSkills = allSkills
    .sort((a, b) => {
      // If both have usage counts, sort by popularity
      if (a.usage_count !== undefined && b.usage_count !== undefined) {
        return b.usage_count - a.usage_count;
      }
      // If only one has usage count, prioritize it
      if (a.usage_count !== undefined) return -1;
      if (b.usage_count !== undefined) return 1;
      // If neither has usage count, sort alphabetically
      return a.skill_name.localeCompare(b.skill_name);
    })
    .slice(0, 15);

  // Filter skills based on search and show logic
  const getFilteredSkills = () => {
    let skillsToFilter = showAllSkills || searchTerm ? allSkills : popularSkills;
    
    return skillsToFilter.filter((skill) => {
      const matchesSearch = skill.skill_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const notSelected = !selectedSkills.includes(
        skill.skill_name.toLowerCase(),
      );
      return matchesSearch && notSelected;
    });
  };

  const filteredSkills = getFilteredSkills();
  const hasMoreSkills = !showAllSkills && !searchTerm && allSkills.length > popularSkills.length;

  // Add skill
  const handleAddSkill = (skillName) => {
    const normalizedName = skillName.toLowerCase();
    if (!selectedSkills.includes(normalizedName)) {
      onChange([...selectedSkills, normalizedName]);
    }
    setSearchTerm("");
    setShowAllSkills(false); // Reset to popular view after adding
    inputRef.current?.focus();
  };

  // Toggle show all skills
  const handleShowAllSkills = () => {
    setShowAllSkills(true);
    setSearchTerm("");
  };

  // Reset to popular view when search clears
  useEffect(() => {
    if (!searchTerm && !showAllSkills) {
      // Will show popular skills by default
    }
  }, [searchTerm, showAllSkills]);

  // Remove skill
  const handleRemoveSkill = (skillName) => {
    onChange(selectedSkills.filter((s) => s !== skillName));
  };

  // Accept all suggested skills from project
  const handleAcceptAllProjectSuggestions = () => {
    const newSkills = [...new Set([...selectedSkills, ...suggestedSkills])];
    onChange(newSkills);
  };

  // Check if a skill is from project suggestions
  const isSuggestedFromProject = (skillName) => {
    return (
      suggestedSkills.includes(skillName) && !selectedSkills.includes(skillName)
    );
  };

  // Check if a skill is from recent skills
  const isRecentSkill = (skillName) => {
    return (
      recentSkills.includes(skillName) && !selectedSkills.includes(skillName)
    );
  };

  // Find category for a skill
  const getSkillCategory = (skillName) => {
    const skill = allSkills.find(
      (s) => s.skill_name.toLowerCase() === skillName.toLowerCase(),
    );
    return skill?.category || "technical";
  };

  // Get unselected recent skills
  const unselectedRecentSkills = recentSkills.filter(
    (s) => !selectedSkills.includes(s),
  );

  // Get unselected project skills
  const unselectedProjectSkills = suggestedSkills.filter(
    (s) => !selectedSkills.includes(s),
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input area with chips */}
      <div className="min-h-[42px] px-3 py-2 border border-gray-300 rounded-lg bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Selected skills as chips */}
          {selectedSkills.map((skillName) => {
            const category = getSkillCategory(skillName);
            const colorClass = getCategoryColor(category);

            return (
              <div
                key={skillName}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass} transition-all hover:shadow-sm`}
              >
                <span className="capitalize">{skillName}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skillName)}
                  className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${skillName}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Input for searching/adding */}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedSkills.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
            disabled={loading}
          />

          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-primary" />
          )}
        </div>
      </div>

      {/* Recent skills banner (only show if not selected yet) */}
      {unselectedRecentSkills.length > 0 && (
        <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-50/80 transition-colors">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-amber-700">
              Your recent:
            </span>
            {unselectedRecentSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleAddSkill(skill)}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-white border border-amber-300 text-amber-700 rounded-full hover:bg-amber-100 hover:border-amber-400 transition-all active:scale-95"
              >
                <Plus className="w-3 h-3" />
                <span className="capitalize">{skill}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Project suggested skills banner (only show if not selected yet) */}
      {unselectedProjectSkills.length > 0 && (
        <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-50/80 transition-colors flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-blue-700">
              Project skills:
            </span>
            {unselectedProjectSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleAddSkill(skill)}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-white border border-blue-300 text-blue-700 rounded-full hover:bg-blue-100 hover:border-blue-400 transition-all active:scale-95"
              >
                <Plus className="w-3 h-3" />
                <span className="capitalize">{skill}</span>
              </button>
            ))}
          </div>
          {unselectedProjectSkills.length > 1 && (
            <button
              type="button"
              onClick={handleAcceptAllProjectSuggestions}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 hover:underline whitespace-nowrap ml-2 transition-colors"
            >
              Add all
            </button>
          )}
        </div>
      )}

      {/* Dropdown with skills */}
      {isOpen && !loading && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Search header */}
          <div className="px-3 py-2 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Search className="w-4 h-4" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 outline-none bg-transparent"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Skills list */}
          {filteredSkills.length === 0 && !hasMoreSkills ?
            <div className="px-3 py-8 text-sm text-gray-500 text-center">
              {searchTerm ?
                `No skills matching "${searchTerm}"`
              : "No skills available"}
            </div>
          : <div className="py-1">
              {/* Section header for popular skills */}
              {!searchTerm && !showAllSkills && (
                <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
                  POPULAR SKILLS
                </div>
              )}
              
              {/* Skills list */}
              {filteredSkills.map((skill) => {
                const isFromProject = isSuggestedFromProject(
                  skill.skill_name.toLowerCase(),
                );
                const isRecent = isRecentSkill(skill.skill_name.toLowerCase());
                const colorClass = getCategoryColor(skill.category);

                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => handleAddSkill(skill.skill_name)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 active:bg-gray-100 flex items-center justify-between group transition-colors ${
                      isFromProject ? "bg-blue-50/50" : ""
                    } ${isRecent ? "bg-amber-50/50" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 capitalize">
                        {skill.skill_name}
                      </span>
                      {skill.category && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}
                        >
                          {skill.category}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 items-center">
                      {!searchTerm && !showAllSkills && allSkills.length > 15 && (
                        <span className="text-xs text-gray-400">
                          ⭐ Popular
                        </span>
                      )}
                      {isRecent && (
                        <span className="text-xs text-amber-600 font-medium">
                          Recent
                        </span>
                      )}
                      {isFromProject && (
                        <span className="text-xs text-blue-600 font-medium">
                          Project
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Show more skills button */}
              {hasMoreSkills && (
                <button
                  type="button"
                  onClick={handleShowAllSkills}
                  className="w-full px-3 py-2 text-left text-sm text-primary hover:bg-primary/5 font-medium flex items-center justify-center gap-2 transition-colors border-t border-gray-100"
                >
                  <ChevronDown className="w-4 h-4" />
                  Show {allSkills.length - popularSkills.length} more skills
                </button>
              )}
            </div>
          }
        </div>
      )}

      {/* Helper text */}
      {selectedSkills.length === 0 && !isOpen && (
        <p className="mt-1 text-xs text-gray-500">
          Click to add skills that you worked on in this update
        </p>
      )}
      
      {/* Popular skills hint */}
      {selectedSkills.length === 0 && !isOpen && allSkills.length > 15 && (
        <p className="mt-1 text-xs text-gray-400">
          Shows top 15 most popular skills • Click to see all
        </p>
      )}
    </div>
  );
}

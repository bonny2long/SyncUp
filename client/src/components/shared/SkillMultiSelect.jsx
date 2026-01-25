import React, { useState, useEffect, useRef } from "react";
import { X, Plus } from "lucide-react";

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
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter skills based on search
  const filteredSkills = allSkills.filter((skill) => {
    const matchesSearch = skill.skill_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const notSelected = !selectedSkills.includes(
      skill.skill_name.toLowerCase(),
    );
    return matchesSearch && notSelected;
  });

  // Add skill
  const handleAddSkill = (skillName) => {
    const normalizedName = skillName.toLowerCase();
    if (!selectedSkills.includes(normalizedName)) {
      onChange([...selectedSkills, normalizedName]);
    }
    setSearchTerm("");
    inputRef.current?.focus();
  };

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

      {/* Dropdown with all skills */}
      {isOpen && !loading && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredSkills.length === 0 ?
            <div className="px-3 py-2 text-sm text-gray-500">
              {searchTerm ?
                `No skills matching "${searchTerm}"`
              : "No more skills available"}
            </div>
          : <div className="py-1">
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
    </div>
  );
}

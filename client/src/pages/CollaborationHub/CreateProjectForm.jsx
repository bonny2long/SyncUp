import React, { useState } from "react";
import { createProject } from "../../utils/api";
import { useUser } from "../../context/UserContext";

export default function CreateProjectForm({ onCreated }) {
  const { user } = useUser();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillIdeas, setSkillIdeas] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addSkillIdea = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (skillIdeas.includes(value.toLowerCase())) return;

    setSkillIdeas((prev) => [...prev, value.toLowerCase()]);
    setSkillInput("");
  };

  const removeSkillIdea = (skill) => {
    setSkillIdeas((prev) => prev.filter((s) => s !== skill));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Project title is required");
      return;
    }

    try {
      setLoading(true);

      const project = await createProject({
        title: title.trim(),
        description,
        owner_id: user.id,
        skill_ideas: skillIdeas,
      });

      setTitle("");
      setDescription("");
      setSkillIdeas([]);
      setSkillInput("");

      onCreated?.();
    } catch (err) {
      setError("Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-xl shadow-md flex flex-col gap-3"
    >
      <h3 className="font-semibold text-secondary">Create Project</h3>

      <input
        type="text"
        placeholder="Project title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border rounded p-2 text-sm"
      />

      <textarea
        placeholder="Project description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="border rounded p-2 text-sm resize-none"
      />

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">
          Skills this project might touch (optional)
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkillIdea();
              }
            }}
            placeholder="e.g. React, APIs, UX"
            className="flex-1 border border-gray-200 rounded-lg p-2 text-sm"
          />
          <button
            type="button"
            onClick={addSkillIdea}
            className="px-3 rounded-lg bg-gray-100 text-sm hover:bg-gray-200"
          >
            Add
          </button>
        </div>

        {skillIdeas.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {skillIdeas.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary flex items-center gap-1"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkillIdea(skill)}
                  className="text-primary/60 hover:text-primary"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}

        <p className="text-[11px] text-gray-400">
          These are just initial ideas. Skills are tracked later through real
          activity.
        </p>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-white py-2 rounded-lg text-sm hover:opacity-90 transition"
      >
        {loading ? "Creating..." : "Create Project"}
      </button>
    </form>
  );
}

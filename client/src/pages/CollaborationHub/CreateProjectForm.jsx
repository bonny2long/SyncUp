import React, { useState } from "react";
import { createProject } from "../../utils/api";
import { useUser } from "../../context/UserContext";
import { UserPlus, Globe, X } from "lucide-react";

export default function CreateProjectForm({ onCreated }) {
  const { user } = useUser();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [visibility, setVisibility] = useState(""); // "" = not selected, "seeking" or "public"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) return;

    setSkills((prev) => [...prev, value]);
    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Project title is required");
      return;
    }

    if (!visibility) {
      setError("Please choose Build in Public or Seeking Members");
      return;
    }

    try {
      setLoading(true);

      await createProject({
        title: title.trim(),
        description,
        owner_id: user.id,
        skills: skills,
        visibility: visibility,
      });

      setTitle("");
      setDescription("");
      setSkills([]);
      setSkillInput("");
      setVisibility("");
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

      {/* VISIBILITY SELECTOR */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500 font-medium">
          How do you want to share this project?
        </label>

        <div className="flex gap-3">
          {/* Build in Public Option */}
          <label
            className="flex-1 p-3 border-2 rounded-lg cursor-pointer transition hover:bg-gray-50"
            style={{
              borderColor: visibility === "public" ? "#4C5FD5" : "#e5e7eb",
              backgroundColor: visibility === "public" ? "#F5F7FA" : "white",
            }}
          >
            <div className="flex items-start gap-2">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === "public"}
                onChange={(e) => setVisibility(e.target.value)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-neutralDark">
                  Build in Public
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Share your progress with the community. No join requests.
                </p>
              </div>
            </div>
          </label>

          {/* Seeking Members Option */}
          <label
            className="flex-1 p-3 border-2 rounded-lg cursor-pointer transition hover:bg-gray-50"
            style={{
              borderColor: visibility === "seeking" ? "#9B5DE5" : "#e5e7eb",
              backgroundColor: visibility === "seeking" ? "#F5F7FA" : "white",
            }}
          >
            <div className="flex items-start gap-2">
              <input
                type="radio"
                name="visibility"
                value="seeking"
                checked={visibility === "seeking"}
                onChange={(e) => setVisibility(e.target.value)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-neutralDark flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Seeking Members
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Accept join requests from interested collaborators.
                </p>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* SKILLS SECTION */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">
          Tag relevant skills (type & enter)
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="e.g. React, UX Design, Public Speaking"
            className="flex-1 border border-gray-200 rounded-lg p-2 text-sm"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-3 rounded-lg bg-gray-100 text-sm hover:bg-gray-200"
          >
            Add
          </button>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary flex items-center gap-1"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-primary/60 hover:text-primary ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-white py-2 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Project"}
      </button>
    </form>
  );
}

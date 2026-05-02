import React, { useState } from "react";
import { createProject } from "../../utils/api";
import { useUser } from "../../context/UserContext";
import { ExternalLink, Github, UserPlus, X } from "lucide-react";

export default function CreateProjectForm({ onCreated }) {
  const { user } = useUser();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [caseStudyProblem, setCaseStudyProblem] = useState("");
  const [caseStudySolution, setCaseStudySolution] = useState("");
  const [caseStudyTechStack, setCaseStudyTechStack] = useState("");
  const [caseStudyOutcomes, setCaseStudyOutcomes] = useState("");
  const [caseStudyArtifactUrl, setCaseStudyArtifactUrl] = useState("");
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
        github_url: githubUrl.trim() || null,
        live_url: liveUrl.trim() || null,
        case_study_problem: caseStudyProblem.trim() || null,
        case_study_solution: caseStudySolution.trim() || null,
        case_study_tech_stack: caseStudyTechStack.trim() || null,
        case_study_outcomes: caseStudyOutcomes.trim() || null,
        case_study_artifact_url: caseStudyArtifactUrl.trim() || null,
      });

      setTitle("");
      setDescription("");
      setGithubUrl("");
      setLiveUrl("");
      setCaseStudyProblem("");
      setCaseStudySolution("");
      setCaseStudyTechStack("");
      setCaseStudyOutcomes("");
      setCaseStudyArtifactUrl("");
      setSkills([]);
      setSkillInput("");
      setVisibility("");
      onCreated?.();
    } catch (err) {
      setError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface p-4 rounded-xl shadow-md flex flex-col gap-3 border border-border"
    >
      <h3 className="font-semibold text-secondary">Create Project</h3>

      <input
        type="text"
        placeholder="Project title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border border-border rounded p-2 text-sm bg-surface-highlight text-neutral-dark placeholder-text-secondary"
      />

      <textarea
        placeholder="Project description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="border border-border rounded p-2 text-sm resize-none bg-surface-highlight text-neutral-dark placeholder-text-secondary"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <label className="flex items-center gap-2 border border-border rounded p-2 bg-surface-highlight">
          <Github className="w-4 h-4 text-text-secondary flex-shrink-0" />
          <input
            type="url"
            placeholder="GitHub repo URL"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-neutral-dark placeholder-text-secondary outline-none"
          />
        </label>

        <label className="flex items-center gap-2 border border-border rounded p-2 bg-surface-highlight">
          <ExternalLink className="w-4 h-4 text-text-secondary flex-shrink-0" />
          <input
            type="url"
            placeholder="Live project URL"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-neutral-dark placeholder-text-secondary outline-none"
          />
        </label>
      </div>

      <div className="rounded-lg border border-border bg-surface-highlight/50 p-3 space-y-2">
        <div>
          <p className="text-xs font-semibold text-neutral-dark">
            Case study starter
          </p>
          <p className="text-xs text-text-secondary">
            Optional now. You can complete this later from project details.
          </p>
        </div>

        <textarea
          placeholder="Problem this project solves"
          value={caseStudyProblem}
          onChange={(e) => setCaseStudyProblem(e.target.value)}
          rows={2}
          className="w-full border border-border rounded p-2 text-sm resize-none bg-surface text-neutral-dark placeholder-text-secondary"
        />

        <textarea
          placeholder="Solution you built"
          value={caseStudySolution}
          onChange={(e) => setCaseStudySolution(e.target.value)}
          rows={2}
          className="w-full border border-border rounded p-2 text-sm resize-none bg-surface text-neutral-dark placeholder-text-secondary"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Tech stack, comma separated"
            value={caseStudyTechStack}
            onChange={(e) => setCaseStudyTechStack(e.target.value)}
            className="border border-border rounded p-2 text-sm bg-surface text-neutral-dark placeholder-text-secondary"
          />

          <input
            type="url"
            placeholder="Artifact URL (demo video, docs, screenshot album)"
            value={caseStudyArtifactUrl}
            onChange={(e) => setCaseStudyArtifactUrl(e.target.value)}
            className="border border-border rounded p-2 text-sm bg-surface text-neutral-dark placeholder-text-secondary"
          />
        </div>

        <textarea
          placeholder="Outcomes, impact, or what changed"
          value={caseStudyOutcomes}
          onChange={(e) => setCaseStudyOutcomes(e.target.value)}
          rows={2}
          className="w-full border border-border rounded p-2 text-sm resize-none bg-surface text-neutral-dark placeholder-text-secondary"
        />
      </div>

      {/* VISIBILITY SELECTOR */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-text-secondary font-medium">
          How do you want to share this project?
        </label>

        <div className="flex gap-3">
          {/* Build in Public Option */}
          <label
            className="flex-1 p-3 border-2 rounded-lg cursor-pointer transition hover:bg-surface-highlight"
            style={{
              borderColor:
                visibility === "public" ? "#4C5FD5" : "var(--color-border)",
              backgroundColor:
                visibility === "public" ?
                  "var(--color-surface-highlight)"
                : "var(--color-surface)",
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
                <p className="text-sm font-semibold text-neutral-dark">
                  Build in Public
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Share your progress with the community. No join requests.
                </p>
              </div>
            </div>
          </label>

          {/* Seeking Members Option */}
          <label
            className="flex-1 p-3 border-2 rounded-lg cursor-pointer transition hover:bg-surface-highlight"
            style={{
              borderColor:
                visibility === "seeking" ? "#9B5DE5" : "var(--color-border)",
              backgroundColor:
                visibility === "seeking" ?
                  "var(--color-surface-highlight)"
                : "var(--color-surface)",
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
                <p className="text-sm font-semibold text-neutral-dark flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Seeking Members
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Accept join requests from interested collaborators.
                </p>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* SKILLS SECTION */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-text-secondary">
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
            className="flex-1 border border-border rounded-lg p-2 text-sm bg-surface-highlight text-neutral-dark placeholder-text-secondary"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-3 rounded-lg bg-surface-highlight text-text-secondary text-sm hover:bg-border border border-border"
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

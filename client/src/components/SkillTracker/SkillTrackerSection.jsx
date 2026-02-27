import SkillDistributionCards from "./SkillDistributionCards";
import SkillActivityChart from "./SkillActivityChart";
import SkillSnapshotList from "./SkillSnapshotList";

export default function SkillTrackerSection() {
  return (
    <div className="space-y-3">
      {/* HEADER */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-neutral-dark tracking-tight">
          Skill Tracker
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Growth derived from your real work across projects, updates, and
          mentorship.
        </p>
      </div>

      {/* STEP 1: Where you stand — full width */}
      <StoryCard
        step="1"
        title="Where you stand"
        description="Your top skills ranked by current strength and momentum"
      >
        <SkillSnapshotList />
      </StoryCard>

      {/* STEP 2 + 3: Side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StoryCard
          step="2"
          title="Where you're heading"
          description="Visual distribution of your research and development effort"
        >
          <SkillDistributionCards />
        </StoryCard>

        <StoryCard
          step="3"
          title="What's driving it"
          description="Signal sources: Real work across projects and collaboration"
        >
          <SkillActivityChart />
        </StoryCard>
      </div>
    </div>
  );
}

function StoryCard({ step, title, description, children }) {
  // Each step gets a distinct accent color so the three cards feel connected but distinct
  const accent =
    step === "1" ? "border-l-emerald-500 shadow-emerald-500/5"
    : step === "2" ? "border-l-sky-500 shadow-sky-500/5"
    : "border-l-orange-500 shadow-orange-500/5";

  return (
    <div
      className={`bg-surface border border-border border-l-4 ${accent} rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center gap-3 mb-1">
        <span className="text-xs font-bold text-white bg-primary rounded-full w-6 h-6 flex items-center justify-center shrink-0 shadow-sm">
          {step}
        </span>
        <h3 className="font-bold text-neutral-dark text-base tracking-tight">
          {title}
        </h3>
      </div>
      <p className="text-xs text-text-secondary mb-4 ml-9 italic">
        {description}
      </p>
      <div className="ml-1">{children}</div>
    </div>
  );
}

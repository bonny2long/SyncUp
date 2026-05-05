import { BarChart3 } from "lucide-react";
import SkillDistributionCards from "./SkillDistributionCards";
import SkillActivityChart from "./SkillActivityChart";
import SkillSnapshotList from "./SkillSnapshotList";

export default function SkillTrackerSection() {
  return (
    <div className="page-shell space-y-5">
      <div className="brand-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="page-kicker font-semibold uppercase">
              Growth signal
            </p>
            <h2 className="page-title mt-1">Skill Tracker</h2>
            <p className="mt-1 max-w-2xl text-sm text-text-secondary">
              Growth derived from your real work across projects, updates, and
              mentorship.
            </p>
          </div>
        </div>
      </div>

      <StoryCard
        step="1"
        title="Where you stand"
        description="Your top skills ranked by current strength and momentum"
      >
        <SkillSnapshotList />
      </StoryCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          description="Signal sources from projects, collaboration, and mentorship"
        >
          <SkillActivityChart />
        </StoryCard>
      </div>
    </div>
  );
}

function StoryCard({ step, title, description, children }) {
  return (
    <div className="brand-card brand-card-hover relative overflow-hidden p-5">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-primary" />
      <div className="mb-1 flex items-center gap-3 pl-1">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-sm">
          {step}
        </span>
        <h3 className="text-base font-bold tracking-tight text-neutral-dark">
          {title}
        </h3>
      </div>
      <p className="mb-4 ml-10 text-xs text-text-secondary">{description}</p>
      <div className="pl-1">{children}</div>
    </div>
  );
}

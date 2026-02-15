import SkillDistributionChart from "./SkillDistributionChart";
import SkillActivityChart from "./SkillActivityChart";
import SkillSummaryCard from "./TopSkillsSnapshot";
import SkillSignalsPanel from "./SkillSignalsPanel";

export default function SkillTrackerSection() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-dark">
          Skill Tracker
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Growth derived from your real work across projects, updates, and
          mentorship.
        </p>
      </div>

      {/* TOP SKILLS SNAPSHOT - Full Width */}
      <SkillSummaryCard />

      {/* 2-COLUMN GRID: Signals + Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skill Signals Panel */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="font-medium text-neutral-dark">Skill Momentum</h3>
          <p className="text-xs text-text-secondary mt-1">
            Recent system-detected skill signals
          </p>
          <div className="mt-4">
            <SkillSignalsPanel />
          </div>
        </div>

        {/* Skill Distribution */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="font-medium text-neutral-dark">Skill Distribution</h3>
          <p className="text-xs text-text-secondary mt-1">
            Where your effort has gone
          </p>
          <div className="mt-4">
            <SkillDistributionChart />
          </div>
        </div>
      </div>

      {/* ACTIVITY SOURCES - Full Width */}
      <div className="bg-surface border border-border rounded-lg p-5">
        <h3 className="font-medium text-neutral-dark">Activity Sources</h3>
        <p className="text-xs text-text-secondary mt-1">
          What caused it - Signals come from projects, updates, and mentorship
        </p>

        <div className="mt-4">
          <SkillActivityChart />
        </div>
      </div>
    </div>
  );
}

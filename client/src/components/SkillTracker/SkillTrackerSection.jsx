import SkillDistributionChart from "./SkillDistributionChart";
import SkillMomentumChart from "./SkillMomentumChart";
import SkillActivityChart from "./SkillActivityChart";
import SkillSummaryCard from "./TopSkillsSnapshot";
import SkillSignalsPanel from "./SkillSignalsPanel";

export default function SkillTrackerSection() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Skill Tracker</h2>
        <p className="text-sm text-gray-600 mt-1">
          Growth derived from your real work across projects, updates, and
          mentorship.
        </p>
      </div>
      {/* SKILL SUMMARY */}
      <SkillSummaryCard />

      {/* SKILL SIGNALS - Transition + Velocity verification */}
      <SkillSignalsPanel />

      {/* SKILL DISTRIBUTION */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-medium text-gray-900">Skill Distribution</h3>
        <p className="text-xs text-gray-400 mt-1">Where your effort has gone</p>
        <p className="text-xs text-gray-400">
          Signals come from projects, updates, and mentorship.
        </p>

        <div className="mt-4">
          <SkillDistributionChart />
        </div>
      </div>

      {/* SKILL MOMENTUM */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-medium text-gray-900">Skill Momentum</h3>
        <p className="text-xs text-gray-400 mt-1">
          How it's changing over time
        </p>
        <p className="text-xs text-gray-400">
          Signals come from projects, updates, and mentorship.
        </p>

        <div className="mt-4">
          <SkillMomentumChart />
        </div>
      </div>

      {/* WEEKLY ACTIVITY */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-medium text-gray-900">Activity Sources</h3>
        <p className="text-xs text-gray-400 mt-1">What caused it</p>
        <p className="text-xs text-gray-400">
          Signals come from projects, updates, and mentorship.
        </p>

        <div className="mt-4">
          <SkillActivityChart />
        </div>
      </div>
    </div>
  );
}

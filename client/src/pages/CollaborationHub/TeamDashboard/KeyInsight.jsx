import { Lightbulb, AlertTriangle, CheckCircle, TrendingUp, Users, Target } from "lucide-react";

export default function KeyInsight({ data }) {
  const overview = data?.overview || {};
  const activeThisWeek = data?.activeThisWeek || [];
  const teamMembers = data?.teamMembers || [];
  const skillDistribution = data?.skillDistribution || [];

  const getTopInsight = () => {
    const insights = [];

    const engagementRate = teamMembers.length > 0 
      ? activeThisWeek.length / teamMembers.length 
      : 0;

    if (skillDistribution.length === 0) {
      insights.push({
        type: 'tip',
        icon: Target,
        title: 'No Skills Tracked Yet',
        message: 'Start adding skills to your team to see insights here.',
        priority: 4
      });
    } else if (skillDistribution.length < 3) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Low Skill Diversity',
        message: `Only ${skillDistribution.length} skill${skillDistribution.length !== 1 ? 's' : ''} tracked. Encourage team members to add more.`,
        priority: 3
      });
    }

    if (teamMembers.length > 0 && engagementRate >= 0.8) {
      insights.push({
        type: 'success',
        icon: CheckCircle,
        title: 'High Team Engagement',
        message: `${Math.round(engagementRate * 100)}% of team active this week. Great momentum!`,
        priority: 1
      });
    } else if (teamMembers.length > 0 && engagementRate < 0.5) {
      insights.push({
        type: 'warning',
        icon: TrendingUp,
        title: 'Low Team Activity',
        message: `Only ${Math.round(engagementRate * 100)}% active this week. Consider a team check-in.`,
        priority: 2
      });
    }

    if (overview.mentorship_sessions === 0) {
      insights.push({
        type: 'tip',
        icon: Lightbulb,
        title: 'No Mentorship Sessions',
        message: 'Book mentorship sessions to accelerate team skill growth.',
        priority: 3
      });
    }

    if (overview.total_signals === 0) {
      insights.push({
        type: 'tip',
        icon: Lightbulb,
        title: 'Start Building Signals',
        message: 'Share progress updates to build your team signal history.',
        priority: 4
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Team is On Track',
        message: 'Everything looks good! Keep up the momentum.',
        priority: 1
      });
    }

    insights.sort((a, b) => b.priority - a.priority);
    return insights[0];
  };

  const insight = getTopInsight();
  const Icon = insight.icon;

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    tip: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconColors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    tip: 'text-blue-600'
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[insight.type]}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColors[insight.type]}`} />
        <div>
          <h3 className="font-semibold text-sm mb-1">{insight.title}</h3>
          <p className="text-sm opacity-90">{insight.message}</p>
        </div>
      </div>
    </div>
  );
}

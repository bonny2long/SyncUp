export function calculateProfileCompleteness(user = {}, projects = []) {
  const projectCount =
    projects.length || Number(user.profile_project_count || 0);
  const linkedProjectCount =
    projects.filter((project) => project.github_url || project.live_url).length ||
    Number(user.profile_linked_project_count || 0);
  const caseStudyCount =
    projects.filter(
      (project) =>
        project.case_study_problem ||
        project.case_study_solution ||
        project.case_study_tech_stack ||
        project.case_study_outcomes,
    ).length || Number(user.profile_case_study_count || 0);

  const hasProfileLink = Boolean(
    user.github_url || user.linkedin_url || user.personal_site_url,
  );

  const items = [
    {
      key: "headline",
      label: "Professional headline",
      complete: Boolean(user.headline),
    },
    {
      key: "profile_link",
      label: "GitHub, LinkedIn, or website",
      complete: hasProfileLink,
    },
    {
      key: "cycle",
      label: "ICAA cycle",
      complete: user.role === "admin" || Boolean(user.cycle),
    },
    {
      key: "project",
      label: "At least one project",
      complete: projectCount > 0,
    },
    {
      key: "featured_project",
      label: "Featured project selected",
      complete: Boolean(user.featured_project_id),
    },
    {
      key: "project_link",
      label: "Project repo or live link",
      complete: linkedProjectCount > 0,
    },
    {
      key: "case_study",
      label: "Project case study",
      complete: caseStudyCount > 0,
    },
  ];

  const completeCount = items.filter((item) => item.complete).length;
  const percent = Math.round((completeCount / items.length) * 100);

  return {
    items,
    completeCount,
    totalCount: items.length,
    percent,
    missingItems: items.filter((item) => !item.complete),
    statusLabel:
      percent >= 85 ? "Strong profile"
      : percent >= 60 ? "Building profile"
      : "Profile setup in progress",
  };
}

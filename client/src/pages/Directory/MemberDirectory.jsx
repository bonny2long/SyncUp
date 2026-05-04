import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Briefcase,
  ExternalLink,
  FolderKanban,
  Github,
  Search,
  Users,
} from "lucide-react";
import RoleBadge from "../../components/shared/RoleBadge";
import GovernanceBadge from "../../components/shared/GovernanceBadge";
import { API_BASE, fetchMemberDirectory } from "../../utils/api";

function getAvatarUrl(member) {
  if (member.profile_pic?.startsWith("avatar:")) {
    return `${API_BASE}/upload/avatar/${member.id}?t=${Date.now()}`;
  }
  return member.profile_pic || null;
}

function uniqueCycles(members) {
  return Array.from(
    new Set(members.map((member) => member.cycle).filter(Boolean)),
  ).sort();
}

export default function MemberDirectory() {
  const [members, setMembers] = useState([]);
  const [cycleSource, setCycleSource] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    cycle: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cycles = useMemo(() => uniqueCycles(cycleSource), [cycleSource]);

  useEffect(() => {
    fetchMemberDirectory()
      .then((data) => setCycleSource(Array.isArray(data) ? data : []))
      .catch(() => setCycleSource([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetchMemberDirectory(filters)
      .then((data) => {
        if (!cancelled) setMembers(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load directory");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">
            Member Directory
          </h1>
          <p className="text-sm text-text-secondary">
            Find residents, alumni, and mentors across the iCAA community.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-sm text-text-secondary">
          <Users className="h-4 w-4" />
          {members.length} member{members.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_160px_160px]">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
            placeholder="Search by name, headline, title, or employer"
            className="w-full rounded-lg border border-border bg-surface px-9 py-2 text-sm text-neutral-dark outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>

        <select
          value={filters.role}
          onChange={(event) =>
            setFilters((current) => ({ ...current, role: event.target.value }))
          }
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-neutral-dark outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All roles</option>
          <option value="resident">Residents</option>
          <option value="alumni">Alumni</option>
          <option value="mentor">Mentors</option>
        </select>

        <select
          value={filters.cycle}
          onChange={(event) =>
            setFilters((current) => ({ ...current, cycle: event.target.value }))
          }
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-neutral-dark outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All cycles</option>
          {cycles.map((cycle) => (
            <option key={cycle} value={cycle}>
              {cycle}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-accent" />
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface py-12 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-text-secondary" />
          <p className="font-medium text-neutral-dark">No members found</p>
          <p className="mt-1 text-sm text-text-secondary">
            Try a different role, cycle, or search term.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {members.map((member) => {
            const avatarUrl = getAvatarUrl(member);
            const workLine = [member.current_title, member.current_employer]
              .filter(Boolean)
              .join(" at ");
            const governancePositions = member.governance_positions ?
              String(member.governance_positions).split(",").filter(Boolean)
            : [];

            return (
              <article
                key={member.id}
                className="rounded-lg border border-border bg-surface p-4 transition hover:shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-secondary/20">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-bold text-secondary">
                        {member.name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/profile/${member.id}`}
                        className="truncate font-semibold text-neutral-dark hover:text-primary"
                      >
                        {member.name}
                      </Link>
                      <RoleBadge role={member.role} size="xs" />
                      {governancePositions.map((position) => (
                        <GovernanceBadge
                          key={`${member.id}-${position}`}
                          position={position}
                          size="xs"
                        />
                      ))}
                      {member.cycle && (
                        <span className="rounded-full bg-surface-highlight px-2 py-0.5 text-xs font-medium text-text-secondary">
                          {member.cycle}
                        </span>
                      )}
                    </div>

                    {member.headline && (
                      <p className="mt-1 line-clamp-2 text-sm text-neutral-dark">
                        {member.headline}
                      </p>
                    )}

                    {workLine && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-text-secondary">
                        <Briefcase className="h-3.5 w-3.5" />
                        {workLine}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                      {Number(member.project_count) > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <FolderKanban className="h-3.5 w-3.5" />
                          {member.project_count} project
                          {Number(member.project_count) === 1 ? "" : "s"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" title="No projects yet">
                          <FolderKanban className="h-3.5 w-3.5" />
                          No projects yet
                        </span>
                      )}
                      {Number(member.completed_mentor_sessions) > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Award className="h-3.5 w-3.5 text-primary" />
                          {member.completed_mentor_sessions} mentor session
                          {Number(member.completed_mentor_sessions) === 1 ?
                            ""
                          : "s"}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        to={`/p/${member.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-neutral-dark hover:border-primary/40 hover:text-primary"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Public profile
                      </Link>
                      {member.github_url && (
                        <a
                          href={member.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-neutral-dark hover:border-primary/40 hover:text-primary"
                        >
                          <Github className="h-3.5 w-3.5" />
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

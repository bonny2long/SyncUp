import React, { useEffect, useState } from "react";
import {
  fetchAvailableMentors,
  fetchProjectMentors,
  fetchMentorDetails,
} from "../../../utils/api";
import MentorProfileModal from "../shared/MentorProfileModal";
import RequestSessionModal from "./RequestSessionModal";
import MentorCard from "../shared/MentorCard";
import EmptyState from "../../../components/brand/EmptyState";
import { BriefcaseBusiness, Search, Users } from "lucide-react";

export default function FindMentors({ onSessionRequested }) {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("available");
  const [error, setError] = useState("");

  // Modals
  const [selectedMentorForProfile, setSelectedMentorForProfile] =
    useState(null);
  const [selectedMentorForRequest, setSelectedMentorForRequest] =
    useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setMentors([]); // Reset mentors when tab changes to avoid mixing data
      setError("");
      try {
        const data =
          tab === "available" ?
            await fetchAvailableMentors()
          : await fetchProjectMentors();

        setMentors(data);
      } catch (err) {
        setError("Failed to load mentors");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tab]);

  const handleViewProfile = async (mentorId) => {
    try {
      const details = await fetchMentorDetails(mentorId);
      setSelectedMentorForProfile(details);
    } catch {
      setError("Failed to load mentor profile");
    }
  };

  const handleRequestSession = (mentor) => {
    setSelectedMentorForRequest(mentor);
  };

  if (loading) {
    return (
      <div className="brand-card flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Deduplicate mentors and aggregate their availability
  const uniqueMentors = mentors.reduce((acc, mentorRow) => {
    // Ensure we have a valid ID
    if (!mentorRow.id) return acc;

    const existing = acc.find((m) => m.id === mentorRow.id);

    if (!existing) {
      // First time seeing this mentor - create a FRESH object
      acc.push({
        id: mentorRow.id,
        name: mentorRow.name,
        email: mentorRow.email,
        role: mentorRow.role,
        cycle: mentorRow.cycle || null,
        projects: mentorRow.projects || "", // Project tab specific
        completed_sessions: Number(mentorRow.completed_sessions) || 0,
        last_session_at: mentorRow.last_session_at || null,
        availabilityCount: mentorRow.available_date ? 1 : 0,
        nextAvailable:
          mentorRow.available_date ?
            {
              date: mentorRow.available_date,
              time: mentorRow.available_time,
            }
          : null,
      });
    } else {
      // Mentor already exists
      if (mentorRow.available_date) {
        existing.availabilityCount++;
        // If we don't have a nextAvailable yet (e.g. from project tab), set it
        if (!existing.nextAvailable) {
          existing.nextAvailable = {
            date: mentorRow.available_date,
            time: mentorRow.available_time,
          };
        }
      }
      // Merge projects if applicable
      if (mentorRow.projects && !existing.projects) {
        existing.projects = mentorRow.projects;
      }
      if (mentorRow.cycle && !existing.cycle) {
        existing.cycle = mentorRow.cycle;
      }
      existing.completed_sessions = Math.max(
        Number(existing.completed_sessions) || 0,
        Number(mentorRow.completed_sessions) || 0,
      );
      if (
        mentorRow.last_session_at &&
        (!existing.last_session_at ||
          new Date(mentorRow.last_session_at) > new Date(existing.last_session_at))
      ) {
        existing.last_session_at = mentorRow.last_session_at;
      }
    }

    return acc;
  }, []);

  uniqueMentors.sort((a, b) => {
    const sessionDiff =
      (Number(b.completed_sessions) || 0) -
      (Number(a.completed_sessions) || 0);
    if (sessionDiff !== 0) return sessionDiff;
    return (a.name || "").localeCompare(b.name || "");
  });

  // Apply search filter to unique mentors
  const filtered = uniqueMentors.filter((mentor) => {
    const term = search.toLowerCase();
    return (
      mentor.name?.toLowerCase().includes(term) ||
      mentor.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="brand-card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-primary">
              Find Mentors
            </p>
            <h2 className="text-xl font-bold text-neutral-dark">
              Connect with iCAA support
            </h2>
            <p className="text-sm text-text-secondary">
              Choose open slots or find mentors connected to active projects.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="inline-flex rounded-xl border border-border bg-surface-highlight p-1">
          <button
            onClick={() => setTab("available")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === "available" ?
                "bg-primary text-white shadow-sm"
              : "text-text-secondary hover:text-primary"
            }`}
          >
            <Users className="h-4 w-4" />
            Available
          </button>
          <button
            onClick={() => setTab("project")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === "project" ?
                "bg-primary text-white shadow-sm"
              : "text-text-secondary hover:text-primary"
            }`}
          >
            <BriefcaseBusiness className="h-4 w-4" />
            Project
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="brand-card flex items-center gap-3 p-3">
        <Search className="h-4 w-4 text-text-secondary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${tab === "available" ? "available" : "project"} mentors...`}
          className="w-full bg-transparent text-sm text-neutral-dark outline-none placeholder:text-text-secondary"
        />
      </div>

      {error && (
        <div className="brand-card border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            {error}
          </p>
        </div>
      )}

      {/* Mentor Grid */}
      {filtered.length === 0 && !error ?
        <EmptyState
          icon={Users}
          title={search ? "No mentors found" : "No mentors available"}
          description={
            search ?
              "Try a different name or email."
            : "Available mentors will appear here when they open session slots."
          }
          image="groupPhoto"
        />
      : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              tab={tab}
              onViewProfile={handleViewProfile}
              onRequestSession={handleRequestSession}
            />
          ))}
        </div>
      }

      {/* Modals */}
      {selectedMentorForProfile && (
        <MentorProfileModal
          mentor={selectedMentorForProfile}
          onClose={() => setSelectedMentorForProfile(null)}
        />
      )}

      {selectedMentorForRequest && (
        <RequestSessionModal
          mentor={selectedMentorForRequest}
          onClose={() => setSelectedMentorForRequest(null)}
          onSuccess={() => {
            setSelectedMentorForRequest(null);
            onSessionRequested();
          }}
        />
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import {
  fetchAvailableMentors,
  fetchProjectMentors,
  fetchMentorDetails,
} from "../../../utils/api";
import MentorProfileModal from "../shared/MentorProfileModal";
import RequestSessionModal from "./RequestSessionModal";
import MentorCard from "../shared/MentorCard";

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

        console.log(`Loaded ${data.length} mentors/slots for tab ${tab}`);
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
    } catch (err) {
      setError("Failed to load mentor profile");
    }
  };

  const handleRequestSession = (mentor) => {
    setSelectedMentorForRequest(mentor);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-500">Loading mentors...</p>
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
        projects: mentorRow.projects || "", // Project tab specific
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
    }

    return acc;
  }, []);

  // Apply search filter to unique mentors
  const filtered = uniqueMentors.filter((mentor) => {
    const term = search.toLowerCase();
    return (
      mentor.name?.toLowerCase().includes(term) ||
      mentor.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab("available")}
          className={`px-4 py-2 text-sm rounded-lg border transition ${
            tab === "available" ?
              "bg-primary text-white border-primary"
            : "bg-white text-gray-700 border-gray-200 hover:border-primary/40"
          }`}
        >
          Available Mentors
        </button>
        <button
          onClick={() => setTab("project")}
          className={`px-4 py-2 text-sm rounded-lg border transition ${
            tab === "project" ?
              "bg-secondary text-white border-secondary"
            : "bg-white text-gray-700 border-gray-200 hover:border-secondary/40"
          }`}
        >
          Project Mentors
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={`Search ${tab === "available" ? "available" : "project"} mentors...`}
        className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Mentor Grid */}
      {filtered.length === 0 && !error ?
        <div className="text-center py-12">
          <p className="text-gray-500">
            {search ?
              "No mentors found matching your search"
            : "No mentors available"}
          </p>
        </div>
      : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

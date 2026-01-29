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
  const uniqueMentors = mentors.reduce((acc, mentor) => {
    const existing = acc.find((m) => m.id === mentor.id);

    if (!existing) {
      // First time seeing this mentor
      acc.push({
        id: mentor.id,
        name: mentor.name,
        email: mentor.email,
        role: mentor.role,
        projects: mentor.projects, // For project mentors tab
        availabilityCount: 1,
        nextAvailable: {
          date: mentor.available_date,
          time: mentor.available_time,
        },
      });
    } else {
      // Mentor already exists, increment count
      existing.availabilityCount++;
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

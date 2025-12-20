import React, { useEffect, useState } from "react";
import {
  fetchAvailableMentors,
  fetchProjectMentors,
  fetchMentorDetails,
} from "../../utils/api";
import MentorProfileModal from "../../components/modals/MentorProfileModal";

export default function MentorList({ selectedMentor, setSelectedMentor }) {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("available"); // 'available' | 'project'
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  const formatAvailability = (dateStr, timeStr) => {
    if (!dateStr && !timeStr) return "N/A";
    let readableDate = "";
    if (dateStr) {
      const dateObj = dateStr.includes("T")
        ? new Date(dateStr)
        : new Date(`${dateStr}T00:00:00`);
      readableDate = Number.isNaN(dateObj.getTime())
        ? dateStr
        : dateObj.toLocaleDateString();
    }
    let readableTime = "";
    if (timeStr) {
      // handle HH:MM:SS or HH:MM formats
      const [h = "00", m = "00"] = timeStr.split(":");
      const dateForTime = new Date();
      dateForTime.setHours(Number(h), Number(m), 0, 0);
      readableTime = dateForTime.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    }
    return `${readableDate} ${readableTime}`.trim();
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data =
          tab === "available"
            ? await fetchAvailableMentors()
            : await fetchProjectMentors();
        setMentors(data);
      } catch (err) {
        setError("Failed to load mentors.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tab]);

  if (loading)
    return <p className="text-sm text-gray-500">Loading mentors...</p>;

  const filtered = mentors.filter((mentor) => {
    const term = search.toLowerCase();
    return (
      mentor.name.toLowerCase().includes(term) ||
      mentor.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTab("available")}
          className={`px-3 py-2 text-sm rounded-lg border transition ${
            tab === "available"
              ? "bg-primary text-white border-primary"
              : "bg-white text-gray-700 border-gray-200 hover:border-primary/40"
          }`}
        >
          Available
        </button>
        <button
          type="button"
          onClick={() => setTab("project")}
          className={`px-3 py-2 text-sm rounded-lg border transition ${
            tab === "project"
              ? "bg-secondary text-white border-secondary"
              : "bg-white text-gray-700 border-gray-200 hover:border-secondary/40"
          }`}
        >
          Project mentors
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={`Search ${tab === "available" ? "available" : "project"} mentors...`}
        className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
      {filtered.length === 0 && !error && (
        <p className="text-xs text-gray-500">No mentors found.</p>
      )}

      {profile && (
        <MentorProfileModal mentor={profile} onClose={() => setProfile(null)} />
      )}

      {filtered.map((mentor) => {
        const isActive = selectedMentor?.id === mentor.id;
        const contextLabel =
          tab === "available"
            ? formatAvailability(mentor.available_date, mentor.available_time)
            : mentor.projects || "Project mentor";

        return (
          <div
            key={mentor.id + tab + contextLabel}
            className={`
              w-full text-left p-3 rounded-xl border shadow-sm transition cursor-pointer
              ${
                isActive
                  ? "bg-secondary/20 border-secondary"
                  : "bg-white border-gray-100 hover:shadow-md"
              }
            `}
            role="button"
            tabIndex={0}
            onClick={() =>
              setSelectedMentor(
                isActive ? null : { id: mentor.id, name: mentor.name }
              )
            }
            onDoubleClick={async (e) => {
              e.stopPropagation();
              try {
                const details = await fetchMentorDetails(mentor.id);
                setProfile(details);
              } catch (err) {
                setError("Failed to load mentor profile.");
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedMentor(
                  isActive ? null : { id: mentor.id, name: mentor.name }
                );
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-secondary">{mentor.name}</p>
                <p className="text-sm text-gray-500">{mentor.email}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wide bg-primary/10 text-primary px-2 py-1 rounded-full">
                {mentor.role}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {tab === "available" ? "Available" : "Projects"}:{" "}
              <span className="font-medium">{contextLabel || "N/A"}</span>
            </p>
            <div className="flex gap-2 mt-2 text-[11px]">
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const details = await fetchMentorDetails(mentor.id);
                    setProfile(details);
                  } catch (err) {
                    setError("Failed to load mentor profile.");
                  }
                }}
                className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                View
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Pin, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { fetchAnnouncements, fetchEvents, rsvpEvent } from "../../utils/api";

export default function CommunityFeed() {
  const { user } = useUser();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchAnnouncements()
      .then((data) => {
        if (isMounted) setAnnouncements(data);
      })
      .catch(console.error);

    fetchEvents(user?.id)
      .then((data) => {
        if (isMounted) setEvents(data);
      })
      .catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleRsvp = async (eventId) => {
    try {
      await rsvpEvent(eventId, user?.id);
      setEvents((prev) =>
        prev.map((event) => {
          if (event.id !== eventId) return event;

          return {
            ...event,
            user_rsvp: "attending",
            rsvp_count:
              event.user_rsvp === "attending" ?
                event.rsvp_count
              : Number(event.rsvp_count || 0) + 1,
          };
        }),
      );
    } catch (err) {
      console.error("Failed to RSVP:", err);
    }
  };

  const pinned = announcements.filter(
    (item) => item.announcement_type === "pinned",
  );
  const news = announcements.filter((item) => item.announcement_type === "news");
  const upcomingEvents = events.slice(0, 3);

  if (pinned.length === 0 && news.length === 0 && upcomingEvents.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-border bg-surface-highlight/50">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-text-secondary uppercase hover:bg-surface-highlight transition-colors"
      >
        <span>Community</span>
        {expanded ?
          <ChevronUp className="w-3 h-3" />
        : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {pinned.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pinned.map((item) => (
                <span
                  key={item.id}
                  className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                  title={item.content}
                >
                  <Pin className="w-3 h-3" />
                  {item.title}
                </span>
              ))}
            </div>
          )}

          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between gap-3 bg-surface rounded-lg px-3 py-2 border border-border"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-dark truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {new Date(event.event_date).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              {event.requires_rsvp && (
                <button
                  onClick={() => handleRsvp(event.id)}
                  className={`flex-shrink-0 text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                    event.user_rsvp === "attending" ?
                      "bg-accent/20 text-accent border border-accent/30"
                    : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  {event.user_rsvp === "attending" ? "Going" : "RSVP"}
                </button>
              )}
            </div>
          ))}

          {news.slice(0, 2).map((item) => (
            <p
              key={item.id}
              className="text-xs text-text-secondary border-l-2 border-accent pl-2"
            >
              <span className="font-medium text-neutral-dark">
                {item.title}
              </span>{" "}
              - {item.content.substring(0, 80)}...
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

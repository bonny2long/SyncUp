import React, { useEffect, useState } from "react";
import { Calendar, Megaphone, Newspaper, Pin } from "lucide-react";
import { useUser } from "../../context/UserContext";
import {
  fetchAnnouncements,
  fetchEvents,
  markAnnouncementRead,
} from "../../utils/api";

export default function CommunityArchive() {
  const { user } = useUser();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadArchive() {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError("");
        const [announcementData, eventData] = await Promise.all([
          fetchAnnouncements(user.id),
          fetchEvents(user.id),
        ]);

        if (!isMounted) return;
        setAnnouncements(Array.isArray(announcementData) ? announcementData : []);
        setEvents(Array.isArray(eventData) ? eventData : []);
      } catch (err) {
        console.error("Failed to load announcement archive:", err);
        if (isMounted) setError("Announcement archive could not be loaded");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadArchive();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const formatDate = (value) =>
    new Date(value).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const sortedAnnouncements = [...announcements].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  const handleMarkRead = async (announcementId) => {
    if (!user?.id) return;

    try {
      await markAnnouncementRead(announcementId, user.id);
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === announcementId ? { ...item, is_read: true } : item,
        ),
      );
      setSelectedItem((current) => {
        if (
          current?.type !== "announcement" ||
          current.item.id !== announcementId
        ) {
          return current;
        }

        return {
          ...current,
          item: { ...current.item, is_read: true },
        };
      });
    } catch (err) {
      console.error("Failed to mark announcement read:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Megaphone className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-neutral-dark">
              Announcement Archive
            </h2>
          </div>
          <p className="text-sm text-text-secondary">
            Browse active HQ posts, pinned resources, and upcoming events.
          </p>
        </div>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase text-text-secondary">
            Active Announcements
          </h3>
          {sortedAnnouncements.length > 0 ? (
            sortedAnnouncements.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItem({ type: "announcement", item })}
                className="w-full text-left rounded-lg border border-border bg-surface hover:bg-surface-highlight transition-colors p-4"
              >
                <div className="flex items-start gap-3">
                  {item.announcement_type === "pinned" ?
                    <Pin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  : <Newspaper className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-neutral-dark">
                        {item.title}
                      </p>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                        {item.announcement_type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          item.is_read ?
                            "bg-surface-highlight text-text-secondary"
                          : "bg-accent/15 text-accent"
                        }`}
                      >
                        {item.is_read ? "Read" : "Unread"}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      {formatDate(item.created_at)}
                    </p>
                    <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                      {item.content}
                    </p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-text-secondary">No announcements yet.</p>
          )}
        </section>

        <section className="space-y-3 pb-6">
          <h3 className="text-xs font-semibold uppercase text-text-secondary">
            Upcoming Events
          </h3>
          {events.length > 0 ? (
            events.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => setSelectedItem({ type: "event", item: event })}
                className="w-full text-left rounded-lg border border-border bg-surface hover:bg-surface-highlight transition-colors p-4"
              >
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-neutral-dark">{event.title}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      {formatDate(event.event_date)}
                      {event.location ? ` | ${event.location}` : ""}
                    </p>
                    {event.description && (
                      <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-text-secondary">No upcoming events.</p>
          )}
        </section>
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-lg rounded-lg border border-border bg-surface shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-border px-5 py-4">
              <p className="text-xs font-semibold uppercase text-text-secondary">
                {selectedItem.type === "event" ? "Event" : "Announcement"}
              </p>
              <h2 className="text-lg font-semibold text-primary">
                {selectedItem.item.title}
              </h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              {selectedItem.type === "event" && (
                <p className="text-sm text-text-secondary">
                  {formatDate(selectedItem.item.event_date)}
                  {selectedItem.item.location ?
                    ` | ${selectedItem.item.location}`
                  : ""}
                </p>
              )}
              <p className="text-sm text-neutral-dark whitespace-pre-wrap">
                {selectedItem.type === "event" ?
                  selectedItem.item.description || "No event description."
                : selectedItem.item.content}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedItem.type === "announcement" && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(selectedItem.item.id)}
                    disabled={selectedItem.item.is_read}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedItem.item.is_read ?
                        "bg-surface-highlight text-text-secondary cursor-default"
                      : "bg-primary text-white hover:bg-primary/90"
                    }`}
                  >
                    {selectedItem.item.is_read ? "Read" : "Mark read"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-lg border border-border text-sm text-neutral-dark hover:bg-surface-highlight"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Megaphone,
  Newspaper,
  PartyPopper,
  Pin,
  X,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import {
  fetchAnnouncements,
  fetchEvents,
  fetchIntroductions,
  markAnnouncementRead,
  rsvpEvent,
} from "../../utils/api";
import PollWidget from "./PollWidget";

export default function CommunityFeed() {
  const { user } = useUser();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [introductions, setIntroductions] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCommunityFeed() {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError("");
        const [announcementsData, eventsData, introductionsData] =
          await Promise.all([
            fetchAnnouncements(user.id),
            fetchEvents(user.id),
            fetchIntroductions(user.id, 10).catch((err) => {
              console.warn("Introductions unavailable:", err);
              return [];
            }),
          ]);

        if (!isMounted) return;
        setAnnouncements(Array.isArray(announcementsData) ? announcementsData : []);
        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setIntroductions(
          Array.isArray(introductionsData) ? introductionsData : [],
        );
      } catch (err) {
        console.error("Failed to load ICAA HQ:", err);
        if (isMounted) setError("ICAA HQ updates could not be loaded");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCommunityFeed();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleRsvp = async (eventId) => {
    if (!user?.id) return;

    try {
      await rsvpEvent(eventId, user.id);
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
      setSelectedItem((current) => {
        if (current?.type !== "event" || current.item.id !== eventId) {
          return current;
        }

        return {
          ...current,
          item: {
            ...current.item,
            user_rsvp: "attending",
            rsvp_count:
              current.item.user_rsvp === "attending" ?
                current.item.rsvp_count
              : Number(current.item.rsvp_count || 0) + 1,
          },
        };
      });
    } catch (err) {
      console.error("Failed to RSVP:", err);
    }
  };

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

  const openItem = (type, item) => {
    setSelectedItem({ type, item });
  };

  const closeItem = () => {
    setSelectedItem(null);
  };

  const formatEventDate = (dateString) =>
    new Date(dateString).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatRelativeDate = (dateString) =>
    new Date(dateString).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });

  const getIntroductionCycle = (intro) => {
    const cycleMatch = intro.content?.match(/Cycle\s+([A-Za-z0-9-]+)/i);
    return cycleMatch?.[1] || "ICAA";
  };

  const getIntroductionName = (intro) => {
    const nameMatch = intro.content?.match(/Please welcome (.+?) to /i);
    return nameMatch?.[1] || intro.sender_name || "New resident";
  };

  const buildWelcomeItems = () => {
    const groups = introductions.reduce((acc, intro) => {
      const cycle = getIntroductionCycle(intro);
      if (!acc.has(cycle)) {
        acc.set(cycle, []);
      }
      acc.get(cycle).push(intro);
      return acc;
    }, new Map());

    return Array.from(groups.entries())
      .flatMap(([cycle, items]) => {
        const sortedItems = [...items].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );

        if (sortedItems.length === 1) {
          return [{ type: "introduction", item: sortedItems[0] }];
        }

        return [
          {
            type: "introductionGroup",
            cycle,
            items: sortedItems,
            latestDate: sortedItems[0].created_at,
          },
        ];
      })
      .sort((a, b) => {
        const aDate =
          a.type === "introduction" ? a.item.created_at : a.latestDate;
        const bDate =
          b.type === "introduction" ? b.item.created_at : b.latestDate;
        return new Date(bDate) - new Date(aDate);
      });
  };

  const unreadAnnouncements = announcements.filter((item) => !item.is_read);
  const pinned = unreadAnnouncements.filter(
    (item) => item.announcement_type === "pinned",
  );
  const news = unreadAnnouncements.filter(
    (item) => item.announcement_type === "news",
  );
  const upcomingEvents = events
    .filter((event) => event.user_rsvp !== "attending")
    .slice(0, 2);
  const welcomeItems = (buildWelcomeItems() || []).slice(0, 3);
  const hasUpdates =
    pinned.length > 0 ||
    news.length > 0 ||
    upcomingEvents.length > 0 ||
    welcomeItems.length > 0;

  return (
    <div className="border-b border-border bg-surface">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-highlight transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Megaphone className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="min-w-0 text-left">
            <p className="text-xs font-semibold text-neutral-dark uppercase">
              ICAA HQ
            </p>
            <p className="text-xs text-text-secondary truncate">
              Announcements, events, and community welcomes
            </p>
          </div>
        </div>
        {expanded ?
          <ChevronUp className="w-4 h-4 text-text-secondary flex-shrink-0" />
        : <ChevronDown className="w-4 h-4 text-text-secondary flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-3">
          {loading ? (
            <div className="h-16 flex items-center justify-center">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <p className="text-xs text-red-500 py-3">{error}</p>
          ) : (
            <div className="space-y-3 max-h-44 overflow-y-auto pr-1">
              {pinned.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {pinned.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openItem("announcement", item)}
                      className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full hover:bg-primary/15 transition-colors"
                      title={item.content}
                    >
                      <Pin className="w-3 h-3" />
                      {item.title}
                    </button>
                  ))}
                </div>
              )}

              {hasUpdates ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
                  <section className="border border-border rounded-lg bg-surface-highlight/40 p-3 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-[#f83030] flex-shrink-0" />
                      <h3 className="text-xs font-semibold uppercase text-text-secondary">
                        Next Up
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {upcomingEvents.length > 0 ?
                        upcomingEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-start justify-between gap-2"
                          >
                            <button
                              type="button"
                              onClick={() => openItem("event", event)}
                              className="min-w-0 text-left hover:text-primary transition-colors"
                            >
                              <p className="text-sm font-medium text-neutral-dark truncate">
                                {event.title}
                              </p>
                              <p className="text-xs text-text-secondary">
                                {formatEventDate(event.event_date)}
                              </p>
                            </button>
                            {event.requires_rsvp && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRsvp(event.id);
                                }}
                                className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                                  event.user_rsvp === "attending" ?
                                    "bg-[#f83030]/15 text-[#f83030] border border-[#f83030]/30"
                                  : "bg-[#f83030] text-white hover:bg-[#f83030]/90"
                                }`}
                              >
                                {event.user_rsvp === "attending" ? "Going" : "RSVP"}
                              </button>
                            )}
                          </div>
                        ))
                      : <p className="text-xs text-text-secondary">
                          No upcoming events.
                        </p>
                      }
                    </div>
                  </section>

                  <section className="border border-border rounded-lg bg-surface-highlight/40 p-3 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-[#b9123f] text-lg">🎉</div>
                      <h3 className="text-xs font-semibold uppercase text-text-secondary">
                        Welcomes
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {welcomeItems.length > 0 ?
                        welcomeItems.map((welcome) => {
                          if (welcome.type === "introductionGroup") {
                            return (
                              <button
                                key={`${welcome.cycle}-${welcome.latestDate}`}
                                type="button"
                                onClick={() =>
                                  openItem("introductionGroup", welcome)
                                }
                                className="block w-full min-w-0 text-left hover:bg-surface/70 rounded px-1 py-0.5 transition-colors"
                              >
                            <div className="bg-[#b9123f]/5 border border-[#b9123f]/20 rounded-lg px-3 py-2.5 flex items-center gap-2">
                                <span className="text-[#b9123f] text-lg">🎉</span>
                                <div>
                                  <p className="text-sm font-semibold text-[#b9123f]">Welcome to the community</p>
                                  <p className="text-xs text-text-secondary">
                                    {welcome.items.length} new residents joined{" "}
                                    {welcome.cycle === "ICAA" ?
                                      "the ICAA community"
                                    : `Cycle ${welcome.cycle}`}
                                  </p>
                                </div>
                              </div>
                              </button>
                            );
                          }

                          return (
                              <button
                                key={`intro-${welcome.item.id}`}
                                type="button"
                                onClick={() =>
                                  openItem("introduction", welcome.item)
                                }
                                className="block w-full min-w-0 text-left hover:bg-surface/70 rounded px-1 py-0.5 transition-colors"
                              >
                                <div className="bg-[#b9123f]/5 border border-[#b9123f]/20 rounded-lg px-3 py-2.5 flex items-center gap-2">
                                  <span className="text-[#b9123f] text-lg">🎉</span>
                                  <div>
                                    <p className="text-sm font-semibold text-[#b9123f]">Welcome to the community</p>
                                    <p className="text-xs text-text-secondary">
                                      {getIntroductionName(welcome.item)} has joined{" "}
                                      {getIntroductionCycle(welcome.item) === "ICAA" ?
                                        "the ICAA community"
                                      : `Cycle ${getIntroductionCycle(welcome.item)}`}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            );
                        })
                      : <p className="text-xs text-text-secondary">
                          No recent introductions.
                        </p>
                      }
                    </div>
                  </section>

                  <section className="border border-border rounded-lg bg-surface-highlight/40 p-3 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Newspaper className="w-4 h-4 text-[#b9123f]" />
                      <h3 className="text-xs font-semibold uppercase text-text-secondary">
                        News
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {news.length > 0 ?
                        news.slice(0, 4).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => openItem("announcement", item)}
                            className="block w-full min-w-0 text-left hover:bg-surface/70 rounded px-1 py-0.5 transition-colors"
                          >
                              <div className="border-l-4 border-[#b9123f] pl-3 py-1">
                                <p className="text-sm font-semibold text-neutral-dark">{item.title}</p>
                                <p className="text-xs text-text-secondary mt-0.5">
                                  {item.content.substring(0, 80)}...
                                </p>
                              </div>
                          </button>
                        ))
                      : <p className="text-xs text-text-secondary">
                          No current news posts.
                        </p>
                      }
                    </div>
                  </section>
                </div>
              ) : (
                <p className="text-xs text-text-secondary py-2">
                  No HQ updates yet.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeItem}
        >
          <div
            className="w-full max-w-lg rounded-lg border border-border bg-surface shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-text-secondary">
                  {selectedItem.type === "event" ? "Event"
                  : selectedItem.type === "introduction" ||
                    selectedItem.type === "introductionGroup" ?
                    "Welcome"
                  : selectedItem.item.announcement_type || "Announcement"}
                </p>
                <h2 className="text-lg font-semibold text-primary break-words">
                  {selectedItem.type === "event" ?
                    selectedItem.item.title
                  : selectedItem.type === "introduction" ?
                    "Community Welcome"
                  : selectedItem.type === "introductionGroup" ?
                    selectedItem.item.cycle === "ICAA" ?
                      "New ICAA Residents"
                    : `Cycle ${selectedItem.item.cycle} Welcomes`
                  : selectedItem.item.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeItem}
                className="p-1 rounded hover:bg-surface-highlight"
                aria-label="Close HQ detail"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {selectedItem.type === "event" && (
                <>
                  <div className="text-sm text-text-secondary space-y-1">
                    <p>{formatEventDate(selectedItem.item.event_date)}</p>
                    {selectedItem.item.location && (
                      <p>{selectedItem.item.location}</p>
                    )}
                    {selectedItem.item.requires_rsvp && (
                      <p>
                        RSVPs: {selectedItem.item.rsvp_count || 0}
                        {selectedItem.item.max_attendees ?
                          ` / ${selectedItem.item.max_attendees}`
                        : ""}
                      </p>
                    )}
                  </div>
                  {selectedItem.item.description && (
                    <p className="text-sm text-neutral-dark whitespace-pre-wrap">
                      {selectedItem.item.description}
                    </p>
                  )}
                  {selectedItem.item.requires_rsvp && (
                    <button
                      type="button"
                      onClick={() => handleRsvp(selectedItem.item.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedItem.item.user_rsvp === "attending" ?
                          "bg-accent/15 text-accent border border-accent/30"
                        : "bg-primary text-white hover:bg-primary/90"
                      }`}
                    >
                      {selectedItem.item.user_rsvp === "attending" ?
                        "You are going"
                      : "RSVP"}
                    </button>
                  )}
                </>
              )}

              {selectedItem.type === "introduction" && (
                <div>
                  <p className="text-sm text-neutral-dark whitespace-pre-wrap">
                    {selectedItem.item.content}
                  </p>
                  <p className="text-xs text-text-secondary mt-3">
                    {formatRelativeDate(selectedItem.item.created_at)}
                  </p>
                </div>
              )}

              {selectedItem.type === "introductionGroup" && (
                <div>
                  <p className="text-sm text-text-secondary mb-3">
                    {selectedItem.item.items.length} new residents joined{" "}
                    {selectedItem.item.cycle === "ICAA" ?
                      "the ICAA community"
                    : `Cycle ${selectedItem.item.cycle}`}
                    .
                  </p>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {selectedItem.item.items.map((intro) => (
                      <div
                        key={intro.id}
                        className="rounded-lg border border-border bg-surface-highlight/50 p-3"
                      >
                        <p className="text-sm font-medium text-neutral-dark">
                          {getIntroductionName(intro)}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                          {formatRelativeDate(intro.created_at)}
                        </p>
                        <p className="text-sm text-text-secondary mt-2">
                          {intro.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.type === "announcement" && (
                <div className="space-y-4">
                  <p className="text-sm text-neutral-dark whitespace-pre-wrap">
                    {selectedItem.item.content}
                  </p>
                  {selectedItem.item.has_poll ? (
                    <PollWidget announcementId={selectedItem.item.id} />
                  ) : null}
                  <p className="text-xs text-text-secondary mt-3">
                    Posted {formatRelativeDate(selectedItem.item.created_at)}
                  </p>
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

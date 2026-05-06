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
  markIntroductionsSeen,
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
  const [actionError, setActionError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCommunityFeed() {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError("");
        setActionError("");
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
      setActionError("");
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
      setActionError("RSVP could not be saved. Please try again.");
    }
  };

  const handleMarkRead = async (announcementId) => {
    if (!user?.id) return;

    try {
      setActionError("");
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
      setActionError("Announcement could not be marked read. Please try again.");
    }
  };

  const markWelcomesSeen = async (messageIds) => {
    if (!user?.id || !messageIds.length) return;

    try {
      setActionError("");
      await markIntroductionsSeen(user.id, messageIds);
      setIntroductions((prev) =>
        prev.map((intro) =>
          messageIds.includes(intro.id) ? { ...intro, is_seen: true } : intro,
        ),
      );
    } catch (err) {
      console.error("Failed to mark welcomes seen:", err);
      setActionError("Welcome could not be marked seen. Please try again.");
    }
  };

  const openItem = (type, item) => {
    setSelectedItem({ type, item });

    if (type === "introduction") {
      markWelcomesSeen([item.id]);
    }

    if (type === "introductionGroup") {
      markWelcomesSeen(item.items.map((intro) => intro.id));
    }
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
    if (intro.introduction_cycle) return intro.introduction_cycle;
    if (intro.introduced_user_cycle) return intro.introduced_user_cycle;

    const cycleMatch = intro.content?.match(/Cycle\s+([A-Za-z0-9-]+)/i);
    return cycleMatch?.[1] || "ICAA";
  };

  const getIntroductionName = (intro) => {
    if (intro.introduced_user_name) return intro.introduced_user_name;

    const nameMatch = intro.content?.match(/Please welcome (.+?) to /i);
    return nameMatch?.[1] || intro.sender_name || "New resident";
  };

  const buildWelcomeItems = () => {
    const groups = introductions
      .filter((intro) => !intro.is_seen)
      .reduce((acc, intro) => {
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
  const updateCount =
    pinned.length + news.length + upcomingEvents.length + welcomeItems.length;
  const hasUpdates = updateCount > 0;

  return (
    <div className="border-b border-border bg-surface">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="group flex w-full items-stretch justify-between overflow-hidden bg-accent text-left text-white transition-colors hover:bg-accent/95"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
            <Megaphone className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-black">ICAA HQ</p>
              {updateCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                  {updateCount} active
                </span>
              )}
            </div>
            <p className="truncate text-xs text-white/75">
              Announcements, events, welcomes, and community signal
            </p>
          </div>
        </div>
        <div className="flex items-center border-l border-white/10 px-4">
          {expanded ?
            <ChevronUp className="h-4 w-4 text-white/75" />
          : <ChevronDown className="h-4 w-4 text-white/75" />}
        </div>
      </button>

      {expanded && (
        <div className="bg-gradient-to-b from-surface-highlight/70 to-surface px-4 py-3">
          {loading ? (
            <div className="flex h-20 items-center justify-center rounded-lg border border-border bg-surface">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          ) : (
            <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
              {actionError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {actionError}
                </p>
              )}
              {pinned.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {pinned.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openItem("announcement", item)}
                      className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
                      title={item.content}
                    >
                      <Pin className="h-3 w-3" />
                      {item.title}
                    </button>
                  ))}
                </div>
              )}

              {hasUpdates ? (
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                  <section className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
                    <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                      <Calendar className="h-4 w-4 flex-shrink-0 text-primary" />
                      <h3 className="text-xs font-black uppercase text-neutral-dark">
                        Next Up
                      </h3>
                    </div>
                    <div className="space-y-2 p-3">
                      {upcomingEvents.length > 0 ?
                        upcomingEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-start justify-between gap-2"
                          >
                            <button
                              type="button"
                              onClick={() => openItem("event", event)}
                              className="min-w-0 text-left transition-colors hover:text-primary"
                            >
                              <p className="truncate text-sm font-semibold text-neutral-dark">
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
                                className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                                  event.user_rsvp === "attending" ?
                                    "border border-primary/30 bg-primary/10 text-primary"
                                  : "bg-primary text-white hover:bg-primary/90"
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

                  <section className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
                    <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                      <PartyPopper className="h-4 w-4 text-primary" />
                      <h3 className="text-xs font-black uppercase text-neutral-dark">
                        Welcomes
                      </h3>
                    </div>
                    <div className="space-y-2 p-3">
                      {welcomeItems.length > 0 ?
                        welcomeItems.map((welcome) => {
                          if (welcome.type === "introductionGroup") {
                            return (
                              <WelcomeButton
                                key={`${welcome.cycle}-${welcome.latestDate}`}
                                title="Welcome to the community"
                                description={`${welcome.items.length} new residents joined ${
                                  welcome.cycle === "ICAA" ?
                                    "the ICAA community"
                                  : `Cycle ${welcome.cycle}`
                                }`}
                                onClick={() =>
                                  openItem("introductionGroup", welcome)
                                }
                              />
                            );
                          }

                          return (
                            <WelcomeButton
                              key={`intro-${welcome.item.id}`}
                              title="Welcome to the community"
                              description={`${getIntroductionName(welcome.item)} joined ${
                                getIntroductionCycle(welcome.item) === "ICAA" ?
                                  "the ICAA community"
                                : `Cycle ${getIntroductionCycle(welcome.item)}`
                              }`}
                              onClick={() =>
                                openItem("introduction", welcome.item)
                              }
                            />
                          );
                        })
                      : <p className="text-xs text-text-secondary">
                          No recent introductions.
                        </p>
                      }
                    </div>
                  </section>

                  <section className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
                    <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                      <Newspaper className="h-4 w-4 text-primary" />
                      <h3 className="text-xs font-black uppercase text-neutral-dark">
                        News
                      </h3>
                    </div>
                    <div className="space-y-2 p-3">
                      {news.length > 0 ?
                        news.slice(0, 4).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => openItem("announcement", item)}
                            className="block w-full rounded-md border-l-4 border-primary bg-surface-highlight/60 px-3 py-2 text-left transition-colors hover:bg-primary/5"
                          >
                            <p className="truncate text-sm font-semibold text-neutral-dark">
                              {item.title}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">
                              {item.content}
                            </p>
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
                <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-5 text-center">
                  <p className="text-sm font-semibold text-neutral-dark">
                    HQ is quiet right now.
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    New announcements, events, and welcomes will appear here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={closeItem}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 bg-accent px-5 py-4 text-white">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-white/65">
                  {selectedItem.type === "event" ? "Event"
                  : selectedItem.type === "introduction" ||
                    selectedItem.type === "introductionGroup" ?
                    "Welcome"
                  : selectedItem.item.announcement_type || "Announcement"}
                </p>
                <h2 className="break-words text-lg font-black text-white">
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
                className="rounded p-1 transition-colors hover:bg-white/10"
                aria-label="Close HQ detail"
              >
                <X className="h-5 w-5 text-white/75" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              {selectedItem.type === "event" && (
                <>
                  <div className="space-y-1 text-sm text-text-secondary">
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
                    <p className="whitespace-pre-wrap text-sm text-neutral-dark">
                      {selectedItem.item.description}
                    </p>
                  )}
                  {selectedItem.item.requires_rsvp && (
                    <button
                      type="button"
                      onClick={() => handleRsvp(selectedItem.item.id)}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                        selectedItem.item.user_rsvp === "attending" ?
                          "border border-primary/30 bg-primary/10 text-primary"
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
                  <p className="whitespace-pre-wrap text-sm text-neutral-dark">
                    {selectedItem.item.content}
                  </p>
                  <p className="mt-3 text-xs text-text-secondary">
                    {formatRelativeDate(selectedItem.item.created_at)}
                  </p>
                </div>
              )}

              {selectedItem.type === "introductionGroup" && (
                <div>
                  <p className="mb-3 text-sm text-text-secondary">
                    {selectedItem.item.items.length} new residents joined{" "}
                    {selectedItem.item.cycle === "ICAA" ?
                      "the ICAA community"
                    : `Cycle ${selectedItem.item.cycle}`}
                    .
                  </p>
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {selectedItem.item.items.map((intro) => (
                      <div
                        key={intro.id}
                        className="rounded-lg border border-border bg-surface-highlight/50 p-3"
                      >
                        <p className="text-sm font-semibold text-neutral-dark">
                          {getIntroductionName(intro)}
                        </p>
                        <p className="mt-1 text-xs text-text-secondary">
                          {formatRelativeDate(intro.created_at)}
                        </p>
                        <p className="mt-2 text-sm text-text-secondary">
                          {intro.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.type === "announcement" && (
                <div className="space-y-4">
                  <p className="whitespace-pre-wrap text-sm text-neutral-dark">
                    {selectedItem.item.content}
                  </p>
                  {selectedItem.item.has_poll ? (
                    <PollWidget announcementId={selectedItem.item.id} />
                  ) : null}
                  <p className="mt-3 text-xs text-text-secondary">
                    Posted {formatRelativeDate(selectedItem.item.created_at)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleMarkRead(selectedItem.item.id)}
                    disabled={selectedItem.item.is_read}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      selectedItem.item.is_read ?
                        "cursor-default bg-surface-highlight text-text-secondary"
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

function WelcomeButton({ title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full rounded-md border border-primary/15 bg-primary/5 px-3 py-2 text-left transition-colors hover:bg-primary/10"
    >
      <div className="flex gap-2">
        <PartyPopper className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">{title}</p>
          <p className="line-clamp-2 text-xs text-text-secondary">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

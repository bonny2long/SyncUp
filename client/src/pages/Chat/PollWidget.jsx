import React, { useCallback, useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { fetchPollForAnnouncement, submitPollVote } from "../../utils/api";

export default function PollWidget({ announcementId }) {
  const { user } = useUser();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState("");

  const loadPoll = useCallback(async () => {
    if (!announcementId || !user?.id) return;
    try {
      setLoading(true);
      setError("");
      const data = await fetchPollForAnnouncement(announcementId, user.id);
      setPoll(data);
    } catch (err) {
      console.error("Failed to load poll:", err);
      setError("Poll could not be loaded");
    } finally {
      setLoading(false);
    }
  }, [announcementId, user?.id]);

  useEffect(() => {
    loadPoll();
  }, [loadPoll]);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface-highlight p-3 text-sm text-text-secondary">
        Loading poll...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!poll) return null;

  const canVote = ["resident", "alumni", "admin"].includes(user?.role);
  const hasVoted = Boolean(poll.user_voted_option_id);
  const isClosed = poll.closes_at && new Date(poll.closes_at) <= new Date();
  const showResults = hasVoted || isClosed;

  const handleVote = async (optionId) => {
    if (!canVote || isClosed || voting) return;
    try {
      setVoting(true);
      await submitPollVote(poll.id, user.id, optionId);
      await loadPoll();
    } catch (err) {
      console.error("Failed to submit vote:", err);
      setError(err.message || "Vote could not be submitted");
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface-highlight/60 p-4">
      <div className="mb-3 flex items-start gap-2">
        <BarChart3 className="mt-0.5 h-4 w-4 text-primary" />
        <div>
          <p className="text-sm font-semibold text-neutral-dark">
            {poll.question}
          </p>
          <p className="mt-0.5 text-xs text-text-secondary">
            {poll.total_votes || 0} vote{Number(poll.total_votes) === 1 ? "" : "s"}
            {isClosed ? " | Closed" : ""}
            {!canVote ? " | Community members only" : ""}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {poll.options.map((option) => {
          const voteCount = Number(option.vote_count || 0);
          const percent =
            Number(poll.total_votes) > 0 ?
              Math.round((voteCount / Number(poll.total_votes)) * 100)
            : 0;
          const selected =
            Number(poll.user_voted_option_id) === Number(option.id);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleVote(option.id)}
              disabled={!canVote || isClosed || voting}
              className={`relative w-full overflow-hidden rounded-lg border px-3 py-2 text-left text-sm transition ${
                selected ? "border-primary bg-primary/5" : "border-border bg-surface"
              } ${canVote && !isClosed ? "hover:border-primary/40" : "cursor-default"}`}
            >
              {showResults && (
                <span
                  className="absolute inset-y-0 left-0 bg-primary/10"
                  style={{ width: `${percent}%` }}
                />
              )}
              <span className="relative flex items-center justify-between gap-3">
                <span className="font-medium text-neutral-dark">
                  {option.option_text}
                </span>
                {showResults && (
                  <span className="text-xs text-text-secondary">
                    {percent}% ({voteCount})
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

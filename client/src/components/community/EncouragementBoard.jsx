import React, { useCallback, useEffect, useState } from "react";
import { Heart, RefreshCw, Send, Trash2, X } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useUser } from "../../context/UserContext";
import {
  createEncouragement,
  deleteEncouragement,
  fetchEncouragements,
} from "../../utils/api";
import RoleBadge from "../shared/RoleBadge";

const ROLE_LABELS = {
  resident: "Resident",
  alumni: "Alumni",
  admin: "iCAA",
  mentor: "Mentor",
};

export default function EncouragementBoard({
  targetCycle,
  mode = "read",
  compact = false,
}) {
  const { user } = useUser();
  const { addToast } = useToast();
  const [encouragements, setEncouragements] = useState([]);
  const [message, setMessage] = useState("");
  const [cycle, setCycle] = useState(targetCycle || "");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hidden, setHidden] = useState(false);

  const canPost = ["resident", "alumni", "admin", "mentor"].includes(user?.role);
  const showPostForm = mode === "post" && canPost;
  const isIntern = user?.role === "intern";

  const loadEncouragements = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await fetchEncouragements(targetCycle, user.id);
      setEncouragements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load encouragements:", err);
      addToast("Failed to load encouragements", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast, targetCycle, user?.id]);

  useEffect(() => {
    loadEncouragements();
  }, [loadEncouragements]);

  const handlePost = async (event) => {
    event.preventDefault();
    if (!message.trim() || posting) return;

    try {
      setPosting(true);
      await createEncouragement({
        author_id: user.id,
        message: message.trim(),
        target_cycle: cycle.trim() || null,
      });
      setMessage("");
      await loadEncouragements();
      addToast("Encouragement posted", "success");
    } catch (err) {
      console.error("Failed to post encouragement:", err);
      addToast(err.message || "Failed to post encouragement", "error");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEncouragement(id, user.id);
      setEncouragements((current) => current.filter((item) => item.id !== id));
      addToast("Encouragement removed", "success");
    } catch (err) {
      console.error("Failed to remove encouragement:", err);
      addToast("Failed to remove encouragement", "error");
    }
  };

  const renderEncouragement = (item) => {
    const canDelete =
      user?.role === "admin" || Number(item.author_id) === user?.id;

    return (
      <div key={item.id} className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-primary">
            {item.author_cycle || "ICAA"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {item.author_name && !isIntern ? (
              <span className="text-sm font-semibold text-neutral-dark">
                {item.author_name}
              </span>
            ) : (
              <span className="text-sm font-semibold text-neutral-dark">
                {ROLE_LABELS[item.author_role] || item.author_role}
                {item.author_cycle ? `, ${item.author_cycle}` : ""}
              </span>
            )}
            {!isIntern && item.author_role && (
              <RoleBadge role={item.author_role} size="xs" />
            )}
            <span className="text-xs text-text-secondary">
              {new Date(item.created_at).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })}
            </span>
            {item.target_cycle && (
              <span className="text-xs text-text-secondary">
                for {item.target_cycle}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-neutral-dark whitespace-pre-wrap break-words">
            {item.message}
          </p>
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={() => handleDelete(item.id)}
            className="self-start p-1.5 text-text-secondary hover:text-red-500"
            title="Remove encouragement"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  if (compact && hidden) return null;

  return (
    <section className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className={`${compact ? "px-3 py-2" : "px-4 py-3"} border-b border-border bg-surface-highlight/40 flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" />
          <div>
            <h2 className="font-semibold text-sm text-neutral-dark">
              From the ICAA Community
            </h2>
            {!compact && (
              <p className="text-xs text-text-secondary">
                Encouragement from residents and alumni who walked this path.
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {compact && encouragements.length > 1 && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="px-2 py-1 text-xs font-medium text-primary hover:underline"
            >
              View all ({encouragements.length})
            </button>
          )}
          <button
            type="button"
            onClick={loadEncouragements}
            className="p-2 rounded-lg text-text-secondary hover:bg-background hover:text-primary"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {compact && (
            <button
              type="button"
              onClick={() => setHidden(true)}
              className="p-2 rounded-lg text-text-secondary hover:bg-background hover:text-primary"
              title="Hide encouragement board"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {showPostForm && (
        <form
          onSubmit={handlePost}
          className="p-4 border-b border-border space-y-3"
        >
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Send encouragement to the current intern cohort..."
            maxLength={1000}
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-surface-highlight px-3 py-2 text-sm text-neutral-dark outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={cycle}
              onChange={(event) => setCycle(event.target.value)}
              placeholder="Target cycle, optional. Empty = all current interns"
              maxLength={10}
              className="rounded-lg border border-border bg-surface-highlight px-3 py-2 text-sm text-neutral-dark outline-none focus:ring-2 focus:ring-primary/30 sm:w-80"
            />
            <button
              type="submit"
              disabled={!message.trim() || posting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      )}

      <div
        className={`${compact ? "p-3" : "p-4"} space-y-3 overflow-y-auto ${
          compact ? "max-h-20" : "max-h-[420px]"
        }`}
      >
        {loading ? (
          <div className="flex justify-center py-3">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-accent" />
          </div>
        ) : encouragements.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-2">
            No encouragement has been posted yet.
          </p>
        ) : (
          (compact ? encouragements.slice(0, 1) : encouragements).map(
            renderEncouragement,
          )
        )}
      </div>

      {compact && showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[80vh] bg-surface rounded-lg border border-border shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-neutral-dark">
                  Community Encouragement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-text-secondary hover:bg-surface-highlight hover:text-primary"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto max-h-[65vh]">
              {encouragements.map(renderEncouragement)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

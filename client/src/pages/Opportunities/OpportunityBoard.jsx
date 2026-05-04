import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import RoleBadge from "../../components/shared/RoleBadge";
import { useToast } from "../../context/ToastContext";
import { useUser } from "../../context/UserContext";
import {
  createOpportunity,
  deleteOpportunity,
  fetchOpportunities,
} from "../../utils/api";

const TYPE_LABELS = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  internship: "Internship",
  apprenticeship: "Apprenticeship",
  scholarship: "Scholarship",
  event: "Event",
};

const TYPE_CLASSES = {
  full_time: "bg-green-100 text-green-700",
  part_time: "bg-blue-100 text-blue-700",
  contract: "bg-purple-100 text-purple-700",
  internship: "bg-yellow-100 text-yellow-700",
  apprenticeship: "bg-orange-100 text-orange-700",
  scholarship: "bg-pink-100 text-pink-700",
  event: "bg-slate-100 text-slate-700",
};

const EMPTY_FORM = {
  title: "",
  company: "",
  type: "full_time",
  description: "",
  apply_url: "",
};

export default function OpportunityBoard() {
  const { user } = useUser();
  const { addToast } = useToast();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [form, setForm] = useState(EMPTY_FORM);

  const canPost = ["alumni", "admin"].includes(user?.role);

  const loadOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchOpportunities(user?.id);
      setOpportunities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load opportunities:", err);
      addToast("Failed to load opportunities", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast, user?.id]);

  useEffect(() => {
    if (user?.id) loadOpportunities();
  }, [loadOpportunities, user?.id]);

  const filteredOpportunities = useMemo(() => {
    const term = search.trim().toLowerCase();
    return opportunities.filter((opportunity) => {
      const matchesType =
        typeFilter === "all" || opportunity.type === typeFilter;
      const matchesSearch =
        !term ||
        [
          opportunity.title,
          opportunity.company,
          opportunity.description,
          opportunity.author_name,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      return matchesType && matchesSearch;
    });
  }, [opportunities, search, typeFilter]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.company.trim() || submitting) return;

    try {
      setSubmitting(true);
      await createOpportunity({
        ...form,
        author_id: user.id,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadOpportunities();
      addToast("Opportunity posted", "success");
    } catch (err) {
      console.error("Failed to post opportunity:", err);
      addToast(err.message || "Failed to post opportunity", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (opportunityId) => {
    try {
      await deleteOpportunity(opportunityId, user?.id);
      setOpportunities((current) =>
        current.filter((opportunity) => opportunity.id !== opportunityId),
      );
      addToast("Opportunity removed", "success");
    } catch (err) {
      console.error("Failed to delete opportunity:", err);
      addToast("Failed to remove opportunity", "error");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">
            Opportunity Board
          </h1>
          <p className="text-sm text-text-secondary">
            Structured opportunities shared by the iCAA community. Use
            SyncChat #opportunities for discussion and questions.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadOpportunities}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-neutral-dark hover:border-primary/40 hover:text-primary"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          {canPost && (
            <button
              type="button"
              onClick={() => setShowForm((current) => !current)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? "Close" : "Post Opportunity"}
            </button>
          )}
        </div>
      </div>

      {!canPost && (
        <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
          Alumni and admins can post opportunities in this first version.
          Residents and mentors can view and use the board.
        </div>
      )}

      {showForm && canPost && (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-border bg-surface p-4 space-y-3"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Opportunity title"
              maxLength={200}
              className="rounded-lg border border-border bg-surface-highlight px-3 py-2 text-sm text-neutral-dark outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
            <input
              value={form.company}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  company: event.target.value,
                }))
              }
              placeholder="Company or organization"
              maxLength={200}
              className="rounded-lg border border-border bg-surface-highlight px-3 py-2 text-sm text-neutral-dark outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <select
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({ ...current, type: event.target.value }))
              }
              className="rounded-lg border border-border bg-surface-highlight px-3 py-2 text-sm text-neutral-dark outline-none focus:ring-2 focus:ring-primary/30"
            >
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input
              value={form.apply_url}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  apply_url: event.target.value,
                }))
              }
              placeholder="Apply URL"
              className="rounded-lg border border-border bg-surface-highlight px-3 py-2 text-sm text-neutral-dark outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Short note about fit, context, or referral details"
            maxLength={500}
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-surface-highlight px-3 py-2 text-sm text-neutral-dark outline-none focus:ring-2 focus:ring-primary/30"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:text-neutral-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !form.title.trim() || !form.company.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, company, description, or author"
            className="w-full rounded-lg border border-border bg-surface px-9 py-2 text-sm text-neutral-dark outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-neutral-dark outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All types</option>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-accent" />
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface py-12 text-center">
          <Briefcase className="mx-auto mb-3 h-10 w-10 text-text-secondary" />
          <p className="font-medium text-neutral-dark">No opportunities yet — be the first to share one.</p>
          <p className="mt-1 text-sm text-text-secondary">
            Share internship opportunities with the community.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOpportunities.map((opportunity) => {
            const canDelete =
              user?.role === "admin" || user?.id === opportunity.author_id;

            return (
              <article
                key={opportunity.id}
                className="rounded-lg border border-border bg-surface p-4 transition hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-neutral-dark">
                        {opportunity.title}
                      </h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          TYPE_CLASSES[opportunity.type] || TYPE_CLASSES.event
                        }`}
                      >
                        {TYPE_LABELS[opportunity.type] || opportunity.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      {opportunity.company}
                    </p>
                    {opportunity.description && (
                      <p className="mt-3 text-sm text-neutral-dark">
                        {opportunity.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                      <span className="inline-flex items-center gap-1">
                        Posted by <RoleBadge role={opportunity.author_role} size="xs" />
                        <span>{opportunity.author_name}</span>
                        {opportunity.author_cycle && (
                          <span>{opportunity.author_cycle}</span>
                        )}
                      </span>
                      <span>
                        {new Date(opportunity.created_at).toLocaleDateString(
                          [],
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {opportunity.apply_url && (
                      <a
                        href={opportunity.apply_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-neutral-dark hover:border-primary/40 hover:text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Apply
                      </a>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(opportunity.id)}
                        className="rounded-lg p-2 text-text-secondary hover:bg-red-50 hover:text-red-500"
                        title="Remove opportunity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

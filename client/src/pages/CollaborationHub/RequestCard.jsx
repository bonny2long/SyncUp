import React, { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { approveJoinRequest, rejectJoinRequest } from "../../utils/api";
import { getErrorMessage } from "../../utils/errorHandler";
import { Check, X } from "lucide-react";

export default function RequestCard({ request, onResolved }) {
  const { addToast } = useToast();
  const [actionLoading, setActionLoading] = useState(null); // "approve" or "reject"

  const handleApprove = async () => {
    setActionLoading("approve");
    try {
      await approveJoinRequest(request.project_id, request.id);

      addToast(`${request.name} has been approved!`, "success", 3000);

      onResolved(request.id);
    } catch (err) {
      const { message } = getErrorMessage(err);
      addToast(message || "Failed to approve request", "error", 3000);
      console.error("Error approving request:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    setActionLoading("reject");
    try {
      await rejectJoinRequest(request.project_id, request.id);

      addToast(`Request from ${request.name} has been rejected.`, "info", 3000);

      onResolved(request.id);
    } catch (err) {
      const { message } = getErrorMessage(err);
      addToast(message || "Failed to reject request", "error", 3000);
      console.error("Error rejecting request:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Format time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / 1000); // seconds

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface-highlight/40 p-4">
      {/* Left: User Info */}
      <div className="flex-1">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <span className="text-sm font-black text-primary">
              {request.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-black text-neutral-dark">{request.name}</p>
            <p className="text-xs text-text-secondary">{request.email}</p>
          </div>
        </div>
        <p className="mt-2 text-xs font-semibold text-text-secondary">
          Requested {getTimeAgo(request.created_at)}
        </p>
      </div>

      {/* Right: Action Buttons */}
      <div className="ml-4 flex gap-2">
        <button
          onClick={handleReject}
          disabled={actionLoading !== null}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-bold text-text-secondary transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
        >
          {actionLoading === "reject" ?
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />
            </span>
          : <>
              <X className="h-3 w-3" />
              Reject
            </>}
        </button>

        <button
          onClick={handleApprove}
          disabled={actionLoading !== null}
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-50"
        >
          {actionLoading === "approve" ?
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Approving...
            </>
          : <>
              <Check className="h-3 w-3" />
              Approve
            </>}
        </button>
      </div>
    </div>
  );
}

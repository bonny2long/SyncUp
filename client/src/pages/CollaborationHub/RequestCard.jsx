import React, { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { approveJoinRequest, rejectJoinRequest } from "../../utils/api";
import { getErrorMessage } from "../../utils/errorHandler";

export default function RequestCard({ request, onResolved }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // "approve" or "reject"

  const handleApprove = async () => {
    setActionLoading("approve");
    try {
      await approveJoinRequest(request.project_id, request.id);

      addToast(`${request.name} has been approved! ✅`, "success", 3000);

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
    <div className="p-4 bg-neutralLight rounded-lg border border-gray-100 flex items-center justify-between">
      {/* Left: User Info */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <span className="text-primary font-bold text-sm">
              {request.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-neutralDark">{request.name}</p>
            <p className="text-xs text-gray-600">{request.email}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Requested {getTimeAgo(request.created_at)}
        </p>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex gap-2 ml-4">
        <button
          onClick={handleReject}
          disabled={actionLoading !== null}
          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition disabled:opacity-50"
        >
          {actionLoading === "reject" ?
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            </span>
          : "Reject"}
        </button>

        <button
          onClick={handleApprove}
          disabled={actionLoading !== null}
          className="px-3 py-2 bg-secondary text-white text-sm rounded-lg hover:bg-secondary/90 transition disabled:opacity-50 flex items-center gap-1"
        >
          {actionLoading === "approve" ?
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Approving...
            </>
          : "Approve"}
        </button>
      </div>
    </div>
  );
}

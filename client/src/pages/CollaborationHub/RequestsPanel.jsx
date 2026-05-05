import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { getUserProjectRequests } from "../../utils/api";
import RequestCard from "./RequestCard";
import { getErrorMessage } from "../../utils/errorHandler";
import EmptyState from "../../components/brand/EmptyState";
import { Inbox, RefreshCw } from "lucide-react";

export default function RequestsPanel({ onRefresh }) {
  const { user: currentUser } = useUser();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [groupedRequests, setGroupedRequests] = useState({});

  const loadRequests = useCallback(async () => {
    if (!currentUser?.id) return;

    setError("");
    setLoading(true);

    try {
      const data = await getUserProjectRequests(currentUser.id);
      setRequests(data);

      // Group by project
      const grouped = data.reduce((acc, req) => {
        if (!acc[req.project_id]) {
          acc[req.project_id] = {
            projectTitle: req.project_title,
            requests: [],
          };
        }
        acc[req.project_id].requests.push(req);
        return acc;
      }, {});

      setGroupedRequests(grouped);
    } catch (err) {
      const { message } = getErrorMessage(err);
      setError(message);
      console.error("Error loading requests:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleRequestResolved = (requestId) => {
    // Remove from local state
    setRequests((prev) => prev.filter((r) => r.id !== requestId));

    // Update grouped requests
    setGroupedRequests((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((projectId) => {
        updated[projectId].requests = updated[projectId].requests.filter(
          (r) => r.id !== requestId,
        );
        if (updated[projectId].requests.length === 0) {
          delete updated[projectId];
        }
      });
      return updated;
    });

    // Trigger parent refresh
    onRefresh?.();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-highlight" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="brand-card border-red-200 p-4 text-red-600">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold">{error}</span>
          <button
            onClick={loadRequests}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No pending requests"
        message="Project join requests will appear here when members ask to join your teams."
      />
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedRequests).map(
        ([projectId, { projectTitle, requests: projectRequests }]) => (
          <div
            key={projectId}
            className="brand-card overflow-hidden"
          >
            {/* Project Header */}
            <div className="border-b border-border p-4">
              <p className="text-xs font-bold uppercase text-primary">Project Requests</p>
              <h3 className="text-lg font-black text-neutral-dark">{projectTitle}</h3>
              <p className="mt-1 text-xs font-semibold text-text-secondary">
                {projectRequests.length} pending{" "}
                {projectRequests.length === 1 ? "request" : "requests"}
              </p>
            </div>

            {/* Requests List */}
            <div className="space-y-3 p-4">
              {projectRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onResolved={() => handleRequestResolved(request.id)}
                />
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}

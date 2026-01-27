import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import { getUserProjectRequests } from "../../utils/api";
import RequestCard from "./RequestCard";
import { getErrorMessage } from "../../utils/errorHandler";

export default function RequestsPanel({ onRefresh }) {
  const { user: currentUser } = useUser();
  const { addToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [groupedRequests, setGroupedRequests] = useState({});

  const loadRequests = useCallback(async () => {
    if (!currentUser?.id) return;

    console.log("Loading join requests for user:", currentUser.id);
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
      console.log("Requests loaded:", data.length);
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
          <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No pending requests</p>
        <p className="text-sm mt-2">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedRequests).map(
        ([projectId, { projectTitle, requests: projectRequests }]) => (
          <div
            key={projectId}
            className="bg-white rounded-lg border border-gray-100 p-6"
          >
            {/* Project Header */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-primary">{projectTitle}</h3>
              <p className="text-xs text-gray-600 mt-1">
                {projectRequests.length} pending{" "}
                {projectRequests.length === 1 ? "request" : "requests"}
              </p>
            </div>

            {/* Requests List */}
            <div className="space-y-3">
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

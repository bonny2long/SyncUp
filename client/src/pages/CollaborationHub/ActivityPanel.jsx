import React from "react";
import ProgressFeed from "./ProgressFeed";

export default function ActivityPanel({
  selectedProject,
  allUpdates,
  currentUser,
  projectId,
}) {
  return (
    <div className="flex flex-col gap-4 bg-white rounded-lg border border-gray-100 p-6">
      <div>
        <h2 className="text-lg font-bold text-secondary mb-1">Your Activity</h2>
        <p className="text-xs text-gray-600">
          {selectedProject ?
            `Filtered to: ${selectedProject.title}`
          : "All your updates"}
        </p>
      </div>

      {selectedProject && (
        <button
          onClick={() => {
            // This will be handled by parent, but we show the button
          }}
          className="text-xs px-3 py-1 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/30 transition w-fit"
        >
          ← Clear Filter
        </button>
      )}

      <ProgressFeed
        selectedProjectId={projectId || null}
        selectedProjectTitle={selectedProject?.title || ""}
        onClearProject={() => {}}
        updates={allUpdates.filter((u) => u.user_id === currentUser?.id)}
        currentUserId={currentUser?.id}
      />
    </div>
  );
}

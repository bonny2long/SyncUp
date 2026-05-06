import React from "react";
import { X } from "lucide-react";
import ProgressFeed from "./ProgressFeed";

export default function ActivityPanel({
  selectedProject,
  allUpdates,
  currentUser,
  projectId,
  onClearProject,
}) {
  const userUpdates = allUpdates.filter((update) => update.user_id === currentUser?.id);

  return (
    <div className="brand-card flex flex-col gap-5 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-primary">
            Activity Feed
          </p>
          <h2 className="mt-1 text-xl font-black text-neutral-dark">
            Your Activity
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {selectedProject ?
              `Filtered to ${selectedProject.title}`
            : "All your updates"}
          </p>
        </div>

        {selectedProject && (
          <button
            type="button"
            onClick={onClearProject}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
            Clear Filter
          </button>
        )}
      </div>

      <ProgressFeed
        selectedProjectId={projectId || null}
        selectedProjectTitle={selectedProject?.title || ""}
        onClearProject={onClearProject}
        updates={userUpdates}
        currentUserId={currentUser?.id}
      />
    </div>
  );
}

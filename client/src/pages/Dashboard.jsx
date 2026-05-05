import React, { useState, Suspense } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

// Lazy-load heavy sub-views — only active tab loads its JS
const CollaborationHub = React.lazy(
  () => import("./CollaborationHub/CollaborationHub"),
);
const MentorshipBridge = React.lazy(
  () => import("./MentorshipBridge/MentorshipBridge"),
);
const SkillTracker = React.lazy(() => import("./SkillTracker/SkillTracker"));
const HealthStatus = React.lazy(() => import("../components/HealthStatus"));
const Chat = React.lazy(() => import("./Chat/Chat"));
const InternLobby = React.lazy(() => import("./InternLobby/InternLobby"));
const MemberDirectory = React.lazy(() => import("./Directory/MemberDirectory"));
const OpportunityBoard = React.lazy(
  () => import("./Opportunities/OpportunityBoard"),
);

import { useEffect } from "react";
import { useUser } from "../context/UserContext";
import { updatePresence } from "../utils/api";

export default function Dashboard() {
  const location = useLocation();
  const { user } = useUser();

  // Presence heartbeat
  useEffect(() => {
    if (!user?.id) return;

    // Initial check-in
    updatePresence(user.id, "online", location.pathname).catch(() => {});

    // Heartbeat every 60 seconds
    const interval = setInterval(() => {
      updatePresence(user.id, "online", location.pathname).catch(() => {});
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.id, location.pathname]);

  // Derive activeTab from location.pathname
  const activeTab = location.pathname.substring(1) || "collaboration";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "collaboration":
        return <CollaborationHub />;
      case "mentorship":
        return <MentorshipBridge />;
      case "skills":
        return <SkillTracker />;
      case "health":
        return <HealthStatus />;
      case "chat":
        return <Chat />;
      case "lobby":
        return <InternLobby />;
      case "directory":
        return <MemberDirectory />;
      case "opportunities":
        return <OpportunityBoard />;
      default:
        return <CollaborationHub />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutralLight">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Navbar - flush to top */}
        <Navbar
          activeTab={activeTab}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />

        {/* Scrollable content below */}
        <div key={activeTab} className="h-full overflow-y-auto p-4 md:p-6">
          <main
            className={`${
              activeTab === "chat" || activeTab === "lobby" ? "h-full" : "max-w-7xl mx-auto"
            } animate-fade-in`}
          >
            <Suspense
              fallback={
                <div className="flex h-64 items-center justify-center">
                  <div className="rounded-xl border border-border bg-surface px-5 py-4 shadow-sm">
                    <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="mt-3 text-sm font-medium text-text-secondary">
                      Loading SyncUp
                    </p>
                  </div>
                </div>
              }
            >
              {renderContent()}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

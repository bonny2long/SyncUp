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

export default function Dashboard() {
  const location = useLocation();

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
      default:
        return <CollaborationHub />;
    }
  };

  return (
    <div className="flex h-screen bg-neutralLight overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar - flush to top */}
        <Navbar
          activeTab={activeTab}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />

        {/* Scrollable content below */}
        <div key={activeTab} className="p-4 md:p-6 overflow-y-auto h-full">
          <main
            className={`${
              activeTab === "chat" || activeTab === "lobby" ? "h-full" : "max-w-7xl mx-auto"
            } animate-fade-in`}
          >
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
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

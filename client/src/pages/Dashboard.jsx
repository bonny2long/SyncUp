import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import CollaborationHub from "./CollaborationHub/CollaborationHub";
import MentorshipBridge from "./MentorshipBridge/MentorshipBridge";
import SkillTracker from "./SkillTracker/SkillTracker";
import HealthStatus from "../components/HealthStatus";
import Chat from "./Chat/Chat";

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
              activeTab === "chat" ? "h-full" : "max-w-7xl mx-auto"
            } animate-fade-in`}
          >
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

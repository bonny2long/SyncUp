import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import CollaborationHub from "./CollaborationHub/CollaborationHub";
import MentorshipBridge from "./MentorshipBridge/MentorshipBridge";
import SkillTracker from "./SkillTracker/SkillTracker";
import HealthStatus from "../components/HealthStatus";

export default function Dashboard() {
  const location = useLocation();

  // Initialize activeTab from location state if available, otherwise default to "collaboration"
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "collaboration",
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Still keep this to handle state updates if the user navigates while already on the Dashboard
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

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
      default:
        return <CollaborationHub />;
    }
  };

  return (
    <div className="flex h-screen bg-neutralLight overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="p-4 md:p-8 overflow-y-auto h-full">
          <Navbar
            activeTab={activeTab}
            onToggleSidebar={() => setIsSidebarOpen(true)}
          />
          <main className="max-w-7xl mx-auto">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import HealthStatus from "../components/HealthStatus";
import CollaborationHub from "./CollaborationHub/CollaborationHub";
import MentorshipBridge from "./MentorshipBridge/MentorshipBridge";
import SkillTracker from "./SkillTracker";
import { UserProvider } from "../context/UserContext";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("collaboration");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
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
    <UserProvider>
      <div className="flex h-screen bg-neutral-light text-neutral-dark">
        {/* Sidebar for navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSidebarOpen(false);
          }}
          isMobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Navbar
            activeTab={activeTab}
            onToggleSidebar={() => setSidebarOpen((o) => !o)}
          />
          <div className="mt-6">{renderPage()}</div>
        </main>
      </div>
    </UserProvider>
  );
}

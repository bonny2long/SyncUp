import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({
  activeTab,
  setActiveTab,
  isMobileOpen,
  onClose,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "collaboration", label: "Collaboration Hub", path: "/" },
    { id: "mentorship", label: "Mentorship Bridge", path: "/" },
    { id: "skills", label: "Skill Tracker", path: "/" },
    { id: "portfolio", label: "Project Portfolio", path: "/portfolio" },
    { id: "health", label: "System Health", path: "/" },
  ];

  const handleTabClick = (tab) => {
    // If navigating to a separate route (like portfolio)
    if (tab.path !== "/") {
      navigate(tab.path);
      onClose?.();
    } else {
      // If clicking a dashboard tab (path: "/")
      if (location.pathname !== "/") {
        // If we are NOT on the dashboard, navigate there and pass the tab ID
        navigate("/", { state: { activeTab: tab.id } });
      } else {
        // If we ARE already on the dashboard, just update the state
        setActiveTab(tab.id);
      }
      onClose?.();
    }
  };

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (location.pathname === "/portfolio") {
      return "portfolio";
    }
    return activeTab;
  };

  const content = (
    <div className="w-64 bg-primary text-white flex flex-col p-6 rounded-r-2xl shadow-lg h-full">
      <h2 className="text-3xl font-bold mb-8 text-accent">SyncUp</h2>

      <nav className="flex flex-col gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`px-4 py-2 rounded-lg text-left font-medium transition-all duration-300
              ${
                getActiveTab() === tab.id ?
                  "bg-white text-primary shadow-md border-l-4 border-accent"
                : "hover:bg-secondary/30 text-white/90"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <footer className="mt-auto pt-6 text-xs text-white/80 border-t border-white/20">
        v1.0 — Sprint 2
      </footer>
    </div>
  );

  return (
    <>
      <div className="hidden md:block">{content}</div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="absolute left-0 top-0 h-full">{content}</div>
        </div>
      )}
    </>
  );
}

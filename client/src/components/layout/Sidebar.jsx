import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";

export default function Sidebar({ activeTab, isMobileOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const tabs = React.useMemo(() => {
    if (user?.role === "admin") {
      return [
        { id: "admin", label: "Admin Dashboard", path: "/admin" },
        { id: "portfolio", label: "Project Portfolio", path: "/portfolio" },
      ];
    }

    const isCommunityMember = ["alumni", "resident", "mentor"].includes(
      user?.role,
    );
    const canAccessSyncChat =
      isCommunityMember || (user?.role === "intern" && user?.has_commenced);

    const items = [
      {
        id: "collaboration",
        label: "Collaboration Hub",
        path: "/collaboration",
      },
    ];

    if (canAccessSyncChat) {
      items.push({ id: "chat", label: "SyncChat", path: "/chat" });
    } else {
      items.push({ id: "lobby", label: "Intern Lobby", path: "/lobby" });
    }

    items.push({ id: "mentorship", label: "Mentorship Bridge", path: "/mentorship" });

    if (user?.role === "intern") {
      items.push({
        id: "skills",
        label: "Skill Tracker",
        path: "/skills",
      });
    }

    items.push({ id: "portfolio", label: "Project Portfolio", path: "/portfolio" });

    return items;
  }, [user?.role, user?.has_commenced]);

  const handleTabClick = (tab) => {
    navigate(tab.path);
    onClose?.();
  };

  const getActiveTab = () => {
    const currentTab = tabs.find((tab) => tab.path === location.pathname);
    return currentTab ? currentTab.id : activeTab;
  };

  const content = (
    <div className="w-64 bg-primary text-white flex flex-col p-6 rounded-r-2xl shadow-lg h-full">
      <h2 className="text-3xl font-bold mb-8 text-accent">SyncUp</h2>

      <nav
        aria-label="Main Navigation"
        data-onboarding="sidebar"
        className="flex flex-col gap-3"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`px-4 py-2 rounded-lg text-left font-medium transition-all duration-300 ${
              getActiveTab() === tab.id ?
                "bg-white text-primary shadow-md border-l-4 border-accent"
              : "hover:bg-secondary/30 text-white/90"
            }`}
            aria-current={getActiveTab() === tab.id ? "page" : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>



      <footer className="mt-auto pt-6 text-xs text-white/80 border-t border-white/20">
        v2.0 | ICCA
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

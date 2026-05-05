import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useState, useEffect } from "react";
import { fetchHealth } from "../../utils/api";

function useAppVersion() {
  const [version, setVersion] = useState("2.0.0");
  useEffect(() => {
    fetchHealth()
      .then((data) => {
        if (data.version) setVersion(data.version);
      })
      .catch(() => {});
  }, []);
  return version;
}

export default function Sidebar({ activeTab, isMobileOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const version = useAppVersion();

  const tabs = React.useMemo(() => {
    if (user?.is_admin === true) {
      return [
        // Admin tool — their special access
        { id: "admin", label: "Admin Dashboard", path: "/admin" },
        // Full community access — admins are iCAA members too
        { id: "collaboration", label: "Collaboration Hub", path: "/collaboration" },
        { id: "chat", label: "SyncChat", path: "/chat" },
        { id: "directory", label: "Member Directory", path: "/directory" },
        { id: "opportunities", label: "Opportunity Board", path: "/opportunities" },
        { id: "mentorship", label: "Mentorship Bridge", path: "/mentorship" },
        { id: "portfolio", label: "Project Portfolio", path: "/portfolio" },
      ];
    }

    const isCommunityMember = ["alumni", "resident"].includes(
      user?.role,
    );

    const items = [
      {
        id: "collaboration",
        label: "Collaboration Hub",
        path: "/collaboration",
      },
    ];

    if (isCommunityMember) {
      items.push({ id: "chat", label: "SyncChat", path: "/chat" });
      items.push({ id: "directory", label: "Member Directory", path: "/directory" });
      items.push({
        id: "opportunities",
        label: "Opportunity Board",
        path: "/opportunities",
      });
    }

    if (user?.role === "intern") {
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
  }, [user?.is_admin, user?.role]);

  const handleTabClick = (tab) => {
    navigate(tab.path);
    onClose?.();
  };

  const getActiveTab = () => {
    const currentTab = tabs.find((tab) => tab.path === location.pathname);
    return currentTab ? currentTab.id : activeTab;
  };

  const content = (
      <div className="relative flex h-full w-64 flex-col overflow-hidden rounded-r-2xl bg-primary p-6 text-white shadow-lg dark:bg-accent">
        <div className="mb-10 pt-2">
          <h2 className="text-3xl font-black text-white">*iCAA</h2>
          <p className="mt-0.5 text-xs font-semibold uppercase text-white/60">
            SyncUp HQ
          </p>
        </div>

      <nav
        aria-label="Main Navigation"
        data-onboarding="sidebar"
        className="flex flex-col gap-2"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`rounded-lg px-4 py-2.5 text-left text-sm font-semibold transition-all duration-300 ${
              getActiveTab() === tab.id ?
                "bg-white text-primary shadow-md ring-1 ring-white/60"
              : "text-white/90 hover:bg-white/10 hover:text-white"
            }`}
            aria-current={getActiveTab() === tab.id ? "page" : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>



      <footer className="mt-auto border-t border-white/15 pt-6 text-xs text-white/80">
        <p className="font-semibold">SyncUp v{version}</p>
        <p className="mt-1 text-white/55">iCAA community platform</p>
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

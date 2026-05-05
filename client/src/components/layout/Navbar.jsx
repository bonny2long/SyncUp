import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Menu,
  X,
  User,
  HelpCircle,
  Download,
  Moon,
  Sun,
  FileText,
  Database,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useTheme } from "../../context/ThemeContext";
import NotificationBell from "../NotificationBell";
import HelpModal from "../shared/HelpModal";
import { generateResumePDF } from "../../utils/resumeExport";
import { getAvatarUrl } from "../../utils/api";

export default function Navbar({ activeTab, onToggleSidebar }) {
  const { user: ctxUser, logout } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const menuRef = useRef(null);

  // Use ctxUser directly instead of local state
  const user = ctxUser;

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setExportMenuOpen(false);
        setActiveButton(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setExportMenuOpen(false);
    setActiveButton(activeButton === "menu" ? null : "menu");
  };

  const handleProfileClick = () => {
    if (user?.id) {
      navigate(`/profile/${user.id}`);
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setActiveButton(null);
  };

  const handleHelp = () => {
    setMenuOpen(false);
    setShowHelp(true);
  };

  const handleExportResume = async () => {
    try {
      const res = await fetch(`/api/users/${user?.id}/profile`);
      const profileData = await res.json();
      generateResumePDF(profileData);
    } catch (err) {
      console.error("Export failed:", err);
    }
    setMenuOpen(false);
    setExportMenuOpen(false);
  };

  const handleExportProjects = async () => {
    try {
      const res = await fetch(`/api/projects/user/${user?.id}`);
      const projects = await res.json();
      const dataStr = JSON.stringify(projects, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `projects-export-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
    setMenuOpen(false);
    setExportMenuOpen(false);
  };

  const handleExportSkills = () => {
    setMenuOpen(false);
    setExportMenuOpen(false);
  };

  const titleMap = {
    collaboration: "Collaboration Hub",
    mentorship: "Mentorship Bridge",
    skills: "Skill Tracker",
    portfolio: "Project Portfolio",
    chat: "SyncChat",
    lobby: "Intern Lobby",
    directory: "Member Directory",
    opportunities: "Opportunity Board",
    settings: "Settings",
  };
  const pageTitle = titleMap[activeTab] || "SyncUp";

  return (
    <div className="w-full border-b border-border bg-neutralLight px-4 pt-4 md:px-6">
      <header className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 transition hover:bg-neutralLight md:hidden"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5 text-neutral-dark" />
          </button>
          <div className="flex min-w-0 flex-col gap-1">
            {user ?
              <div className="flex items-center gap-2">
                <button
                  data-onboarding="profile"
                  onClick={handleProfileClick}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-primary/10 font-black text-primary ring-1 ring-primary/10 transition hover:bg-primary/15"
                  title="View your profile"
                >
                  {(() => {
                    let imageUrl = user.profile_pic;
                    if (imageUrl && imageUrl.startsWith("avatar:")) {
                      imageUrl = getAvatarUrl(imageUrl.split(":")[1]);
                    }
                    return imageUrl ?
                        <img
                          src={imageUrl}
                          alt={`${user.name}'s profile`}
                          className="h-full w-full object-cover"
                        />
                      : user.name.charAt(0);
                  })()}
                </button>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-neutral-dark">
                      Welcome,{" "}
                      <span className="text-primary font-semibold">
                        {user.name.split(" ")[0]}
                      </span>
                    </p>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <h1 className="text-sm font-black text-primary">
                      {pageTitle}
                    </h1>
                  </div>
                  <p className="text-[11px] font-medium capitalize text-text-secondary">
                    {user.role}
                    {user.cycle ? ` - ${user.cycle}` : ""}
                  </p>
                </div>
              </div>
            : <div className="text-gray-400 text-sm">Loading user...</div>}
          </div>
        </div>

        <div className="relative flex items-center gap-2" ref={menuRef}>
          <NotificationBell />

          <button
            onClick={toggleMenu}
            className={`rounded-lg p-2 transition-all duration-300 hover:bg-neutralLight
            ${activeButton === "menu" ? "ring-2 ring-primary/40" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            {menuOpen ?
              <X className="h-5 w-5 rotate-180 text-neutral-dark transition-transform duration-300" />
            : <Menu className="h-5 w-5 text-neutral-dark transition-transform duration-300" />
            }
          </button>

          <div
            className={`absolute right-0 top-12 z-10 w-60 origin-top-right transform overflow-hidden rounded-xl border border-border bg-surface shadow-xl transition-all duration-300 ${
              menuOpen ?
                "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
            }`}
          >
            <div className="border-b border-border bg-accent px-4 py-3 text-white">
              <p className="text-sm font-black">{user?.name || "SyncUp"}</p>
              <p className="text-xs capitalize text-white/65">
                {user?.role || "member"}
                {user?.cycle ? ` - ${user.cycle}` : ""}
              </p>
            </div>
            <ul className="text-sm">
              {/* Account Section */}
              <li>
                <button
                  onClick={handleProfileClick}
                  className="w-full text-left px-4 py-2.5 hover:bg-neutralLight text-neutral-dark transition-colors flex items-center gap-3"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  View Profile
                </button>
              </li>
              <li className="px-4 py-2.5 hover:bg-neutralLight cursor-pointer text-neutral-dark transition-colors">
                <button
                  onClick={() => {
                    navigate("/settings");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left"
                >
                  Settings
                </button>
              </li>

              <li className="border-t border-border" />

              {/* Preferences Section */}
              <li>
                <button
                  onClick={() => {
                    toggleTheme();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-neutralLight text-neutral-dark transition-colors flex items-center justify-between"
                  aria-label={
                    isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  <span className="flex items-center gap-3">
                    {isDarkMode ?
                      <Sun className="w-4 h-4 text-gray-500" />
                    : <Moon className="w-4 h-4 text-gray-500" />}
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={handleHelp}
                  className="w-full text-left px-4 py-2.5 hover:bg-neutralLight text-neutral-dark transition-colors flex items-center gap-3"
                >
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                  Help & Support
                </button>
              </li>

              <li className="border-t border-border" />

              {/* Export Data Section */}
              <li>
                <button
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className="w-full text-left px-4 py-2.5 hover:bg-neutralLight text-neutral-dark transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <Download className="w-4 h-4 text-gray-500" />
                    Export Data
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-gray-400 transition-transform ${exportMenuOpen ? "rotate-90" : ""}`}
                  />
                </button>

                {/* Export Submenu */}
                {exportMenuOpen && (
                  <div className="bg-surface-highlight border-t border-border">
                    <button
                      onClick={handleExportResume}
                      className="w-full text-left px-6 py-2 hover:bg-neutralLight text-neutral-dark transition-colors flex items-center gap-3 text-xs"
                    >
                      <FileText className="w-3 h-3 text-gray-500" />
                      Resume PDF
                    </button>
                    <button
                      onClick={handleExportSkills}
                      className="w-full text-left px-6 py-2 hover:bg-neutralLight text-neutral-dark transition-colors flex items-center gap-3 text-xs"
                    >
                      <FileText className="w-3 h-3 text-gray-500" />
                      Skills Report
                    </button>
                    <button
                      onClick={handleExportProjects}
                      className="w-full text-left px-6 py-2 hover:bg-neutralLight text-neutral-dark transition-colors flex items-center gap-3 text-xs"
                    >
                      <Database className="w-3 h-3 text-gray-500" />
                      Projects (JSON)
                    </button>
                  </div>
                )}
              </li>

              <li className="border-t border-border" />

              {/* Logout */}
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-500 cursor-pointer font-medium transition-colors"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

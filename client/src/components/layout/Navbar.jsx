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
import { generateResumePDF } from "../../utils/resumeExport";

export default function Navbar({ activeTab, onToggleSidebar }) {
  const { user: ctxUser, logout } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (ctxUser) setUser(ctxUser);
  }, [ctxUser]);

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
  };

  const handleExportResume = () => {
    const profileData = {
      user,
      skills: [],
      projects: [],
      stats: {},
    };
    try {
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
    health: "System Health",
    chat: "Team Chat",
  };
  const pageTitle = titleMap[activeTab] || "SyncUp";

  return (
    <header className="flex justify-between items-start bg-surface rounded-2xl shadow-md px-4 md:px-6 py-3 mb-6 transition-all duration-300">
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="md:hidden p-2 rounded-full hover:bg-neutralLight transition"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5 text-neutral-dark" />
        </button>
        <div className="flex flex-col gap-1">
          {user ?
            <div className="flex items-center gap-2">
              <button
                onClick={handleProfileClick}
                className="w-9 h-9 bg-secondary/20 flex items-center justify-center rounded-full text-secondary font-semibold hover:bg-secondary/30 transition cursor-pointer"
                title="View your profile"
              >
                {user.name.charAt(0)}
              </button>
              <div>
                <p className="text-sm font-medium text-neutral-dark">
                  Welcome,{" "}
                  <span className="text-primary font-semibold">
                    {user.name.split(" ")[0]}
                  </span>
                </p>
                <p className="text-[11px] text-gray-500 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          : <div className="text-gray-400 text-sm">Loading user...</div>}
          <h1 className="text-lg font-semibold text-primary">{pageTitle}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4 relative" ref={menuRef}>
        <NotificationBell />

        <button
          onClick={toggleMenu}
          className={`p-2 rounded-full transition-all duration-300 hover:bg-neutralLight
            ${activeButton === "menu" ? "ring-2 ring-accent" : ""}`}
        >
          {menuOpen ?
            <X className="w-5 h-5 text-neutral-dark transition-transform duration-300 rotate-180" />
          : <Menu className="w-5 h-5 text-neutral-dark transition-transform duration-300" />
          }
        </button>

        <div
          className={`absolute right-0 top-12 w-56 bg-surface shadow-lg rounded-xl border border-border z-10 overflow-hidden transform transition-all duration-300 origin-top-right ${
            menuOpen ?
              "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }`}
        >
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
              Settings
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
  );
}

import React, { useState, useEffect, useRef } from "react";
import { Bell, Menu, X, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import NotificationBell from "../NotificationBell";

export default function Navbar({ activeTab, onToggleSidebar }) {
  const { user: ctxUser, logout } = useUser();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (ctxUser) setUser(ctxUser);
  }, [ctxUser]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setActiveButton(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle menu toggle
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setActiveButton(activeButton === "menu" ? null : "menu");
  };

  // Handle notification focus state
  const toggleNotification = () => {
    setActiveButton(activeButton === "notification" ? null : "notification");
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

  const titleMap = {
    collaboration: "Collaboration Hub",
    mentorship: "Mentorship Bridge",
    skills: "Skill Tracker",
    portfolio: "Project Portfolio",
    health: "System Health",
  };
  const pageTitle = titleMap[activeTab] || "SyncUp";

  return (
    <header className="flex justify-between items-start bg-white rounded-2xl shadow-md px-4 md:px-6 py-3 mb-6 transition-all duration-300">
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="md:hidden p-2 rounded-full hover:bg-neutralLight transition"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5 text-neutralDark" />
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
                <p className="text-sm font-medium text-neutralDark">
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

      {/* Notification + Menu */}
      <div className="flex items-center gap-4 relative" ref={menuRef}>
        {/* Notifications */}
        {/* Notifications */}
        <NotificationBell />

        {/* Hamburger Menu */}
        <button
          onClick={toggleMenu}
          className={`p-2 rounded-full transition-all duration-300 hover:bg-neutralLight
            ${activeButton === "menu" ? "ring-2 ring-accent" : ""}`}
        >
          {menuOpen ?
            <X className="w-5 h-5 text-neutralDark transition-transform duration-300 rotate-180" />
          : <Menu className="w-5 h-5 text-neutralDark transition-transform duration-300" />
          }
        </button>

        {/* Dropdown */}
        <div
          className={`absolute right-0 top-12 w-44 bg-white shadow-lg rounded-xl border border-gray-100 z-10 overflow-hidden transform transition-all duration-300 origin-top-right ${
            menuOpen ?
              "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }`}
        >
          <ul className="text-sm">
            <li>
              <button
                onClick={handleProfileClick}
                className="w-full text-left px-4 py-2 hover:bg-neutralLight text-neutralDark transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                View Profile
              </button>
            </li>
            <li className="px-4 py-2 hover:bg-neutralLight cursor-pointer text-neutralDark transition-colors">
              Settings
            </li>
            <li className="border-t border-gray-100">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500 cursor-pointer font-medium transition-colors"
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

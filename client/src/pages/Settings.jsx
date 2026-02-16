import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, Shield, Settings as SettingsIcon, ArrowLeft, Home } from "lucide-react";
import ProfileSection from "../components/settings/ProfileSection";
import NotificationsSection from "../components/settings/NotificationsSection";
import PrivacySection from "../components/settings/PrivacySection";
import AccountSection from "../components/settings/AccountSection";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "account", label: "Account", icon: SettingsIcon },
];

export default function Settings() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSection />;
      case "notifications":
        return <NotificationsSection />;
      case "privacy":
        return <PrivacySection />;
      case "account":
        return <AccountSection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="flex h-screen bg-neutralLight dark:bg-[#1a1a2e] overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-surface dark:bg-surface-highlight flex-col border-r border-border dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-neutral-dark dark:text-white">Settings</h2>
        </div>
        <nav className="flex-1 px-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all duration-200 mb-1
                  ${
                    activeSection === section.id
                      ? "bg-primary text-white shadow-md"
                      : "text-neutral-dark dark:text-gray-300 hover:bg-neutralLight dark:hover:bg-gray-800"
                  }`}
              >
                <Icon className="w-5 h-5" />
                {section.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border dark:border-gray-700">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium text-neutral-dark dark:text-gray-300 hover:bg-neutralLight dark:hover:bg-gray-800 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to App
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="p-4 md:p-6 overflow-y-auto h-full">
          {/* Mobile Header with Back Button */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 text-sm text-neutral-dark dark:text-gray-300 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="text-sm font-medium text-neutral-dark dark:text-white">Settings</span>
          </div>

          {/* Mobile Section Selector */}
          <div className="md:hidden mb-4">
            <select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              className="w-full border border-border dark:border-gray-600 rounded-lg px-4 py-3 bg-surface dark:bg-surface-highlight text-neutral-dark dark:text-white font-medium"
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.label}
                </option>
              ))}
            </select>
          </div>

          {/* Section Content */}
          <main className="max-w-5xl mx-auto">
            {renderSection()}
          </main>
        </div>
      </div>
    </div>
  );
}

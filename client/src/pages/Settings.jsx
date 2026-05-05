import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, Shield, Settings as SettingsIcon, ArrowLeft } from "lucide-react";
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
  const activeConfig = sections.find((section) => section.id === activeSection) || sections[0];

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
    <div className="flex h-screen overflow-hidden bg-neutralLight dark:bg-[#1a1a2e]">
      {/* Sidebar */}
      <aside className="hidden w-72 flex-col bg-primary text-white shadow-xl dark:bg-accent md:flex">
        <div className="p-6">
          <div className="text-3xl font-black leading-none tracking-normal">*iCAA</div>
          <div className="mt-2 text-xs font-bold uppercase text-white/75">SyncUp HQ</div>
          <div className="mt-8">
            <p className="text-xs font-bold uppercase text-white/65">Account Center</p>
            <h2 className="mt-1 text-2xl font-black">Settings</h2>
          </div>
        </div>
        <nav className="flex-1 px-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold transition-all duration-200
                  ${
                    activeSection === section.id
                      ? "bg-white text-primary shadow-md"
                      : "text-white/90 hover:bg-white/10"
                  }`}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-white/20 p-3">
          <button
            onClick={() => navigate("/")}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold text-white/90 transition-all duration-200 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 md:p-6">
          {/* Mobile Header with Back Button */}
          <div className="mb-4 flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 text-sm font-semibold text-neutral-dark transition-colors hover:text-primary dark:text-gray-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="text-sm font-bold text-primary dark:text-white">Settings</span>
          </div>

          <div className="mx-auto mb-5 max-w-5xl">
            <div className="brand-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-primary">Account Center</p>
                <h1 className="mt-1 text-2xl font-black text-neutral-dark dark:text-white">
                  {activeConfig.label}
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                  Keep your SyncUp profile, notifications, and account controls aligned.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <activeConfig.icon className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Mobile Section Selector */}
          <div className="mb-4 grid grid-cols-2 gap-2 md:hidden">
              {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                  activeSection === section.id
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-surface text-neutral-dark dark:bg-surface-highlight dark:text-white"
                }`}
              >
                  {section.label}
              </button>
              ))}
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

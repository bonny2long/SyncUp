import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  BookOpen,
  MessageCircle,
  ChevronRight,
  Zap,
  Users,
  FolderKanban,
  GraduationCap,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

const faqs = [
  {
    question: "How do I find a mentor?",
    answer: "Navigate to the Mentorship Bridge section from the sidebar. Browse available mentors by their expertise and request a session with one that matches your learning goals.",
  },
  {
    question: "How do I join a project?",
    answer: "Go to the Collaboration Hub to see available projects. Click on any project card and select 'Join Project' to send a request to the project owner.",
  },
  {
    question: "How do I track my skills?",
    answer: "Visit the Skill Tracker to log your daily learning activities. Add skills you're working on and mark them as complete when you've mastered them.",
  },
  {
    question: "Can I export my data?",
    answer: "Yes! Click on your profile in the top navigation, then select 'Export Data' from the menu. You can export your resume, skills report, and projects as JSON.",
  },
  {
    question: "How do I update my profile?",
    answer: "Click on your profile avatar in the top navigation bar, then select 'View Profile' to access and edit your information.",
  },
];

const gettingStartedSteps = [
  {
    icon: <Users className="w-5 h-5" />,
    title: "Complete Your Profile",
    description: "Add your bio, skills, and profile picture so others can find you.",
  },
  {
    icon: <FolderKanban className="w-5 h-5" />,
    title: "Join a Project",
    description: "Find a project that matches your interests and contribute to the team.",
  },
  {
    icon: <GraduationCap className="w-5 h-5" />,
    title: "Find a Mentor",
    description: "Connect with experienced mentors to accelerate your learning.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Track Your Progress",
    description: "Log your daily learning activities and watch your skills grow.",
  },
];

export default function HelpModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("getting-started");

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-neutral-dark">Help & Support</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-highlight text-text-secondary hover:text-neutral-dark transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("getting-started")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "getting-started"
                ? "text-primary border-b-2 border-primary"
                : "text-text-secondary hover:text-neutral-dark"
            }`}
          >
            Getting Started
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "faq"
                ? "text-primary border-b-2 border-primary"
                : "text-text-secondary hover:text-neutral-dark"
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "contact"
                ? "text-primary border-b-2 border-primary"
                : "text-text-secondary hover:text-neutral-dark"
            }`}
          >
            Contact
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "getting-started" && (
            <div className="space-y-4">
              <p className="text-text-secondary text-sm mb-6">
                Welcome to SyncUp! Here's how to get the most out of your experience.
              </p>
              {gettingStartedSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-xl bg-surface-highlight hover:bg-surface-highlight/80 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-dark">{step.title}</h3>
                    <p className="text-sm text-text-secondary mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "faq" && (
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group rounded-xl bg-surface-highlight overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-surface-highlight/80 transition-colors">
                    <span className="font-medium text-neutral-dark pr-4">{faq.question}</span>
                    <ChevronRight className="w-5 h-5 text-text-secondary group-open:rotate-90 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-sm text-text-secondary">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-4">
              <p className="text-text-secondary text-sm">
                Need more help? Get in touch with our support team.
              </p>
              <a
                href="mailto:support@syncup.com"
                className="flex items-center gap-3 p-4 rounded-xl bg-surface-highlight hover:bg-surface-highlight/80 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <h3 className="font-medium text-neutral-dark">Email Support</h3>
                  <p className="text-sm text-text-secondary">support@syncup.com</p>
                </div>
                <ExternalLink className="w-4 h-4 text-text-secondary" />
              </a>
              <div className="flex items-center gap-2 p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-400">
                  We're typically able to respond within 24 hours
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
  Suspense,
} from "react";
import { useNavigate } from "react-router-dom";
import { AgCharts } from "ag-charts-react";
import { useToast } from "../context/ToastContext";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { API_BASE } from "../utils/api";
import {
  fetchUsers,
  fetchProjects,
  fetchSessions,
  fetchUpdates,
  deleteUser,
  updateUser,
  deleteProject,
  updateProjectStatus,
  fetchHealth,
  fetchErrors,
  fetchErrorStats,
  fetchRecentErrors,
  updateErrorStatus,
  deleteError,
  fetchAdminStats,
  fetchActiveSessions,
  fetchPlatformStats,
  fetchGrowthStats,
  fetchMaintenanceSettings,
  updateMaintenanceSettings,
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  fetchGovernancePositions,
  assignGovernancePosition,
  removeGovernancePosition,
  fetchCycles,
  createCycle,
  updateCycleStatus,
  getUserHeaders,
} from "../utils/api";
import HelpModal from "../components/shared/HelpModal";
import ConfirmModal from "../components/shared/ConfirmModal";
import InvitationPanel from "../components/admin/InvitationPanel";
import GovernanceBadge from "../components/shared/GovernanceBadge";
import { calculateProfileCompleteness } from "../utils/profileCompleteness";
const Chat = React.lazy(() => import("./Chat/Chat"));

const GOVERNANCE_POSITIONS = [
  { value: "president", label: "President" },
  { value: "vice_president", label: "Vice President" },
  { value: "treasurer", label: "Treasurer" },
  { value: "secretary", label: "Secretary" },
  { value: "parliamentarian", label: "Parliamentarian" },
  { value: "tech_lead", label: "Tech Lead" },
  { value: "tech_member", label: "Tech Member" },
];
import {
  Users,
  FolderKanban,
  GraduationCap,
  Zap,
  Bell,
  User,
  Flame,
  AlertTriangle,
  CheckCircle,
  Users2,
  Trophy,
  Activity,
  FileText,
  BarChart3,
  Settings,
  Server,
  Database,
  Clock,
  Check,
  MoreHorizontal,
  Search,
  UserPlus,
  Shield,
  Eye,
  Pencil,
  Trash2,
  X,
  Menu,
  Moon,
  Sun,
  Download,
  ChevronRight,
  HelpCircle,
  Info,
  ExternalLink,
  Calendar,
  RefreshCw,
  FileSpreadsheet,
  File,
  Archive,
  Medal,
  MessageSquare,
} from "lucide-react";

const StatCard = memo(function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}) {
  const colorClasses = {
    blue: "text-primary",
    green: "text-emerald-600",
    purple: "text-primary",
    yellow: "text-amber-600",
    red: "text-red-600",
  };
  const dotClasses = {
    green: "bg-emerald-500",
    yellow: "bg-amber-500",
    red: "bg-red-500",
    blue: "bg-primary",
    purple: "bg-primary",
  };
  return (
    <div className="brand-card brand-card-hover relative overflow-hidden p-5">
      <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
      <div className="mb-3 flex items-start justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ${colorClasses[color] || "text-primary"}`}
        >
          {React.createElement(Icon, { size: 20 })}
        </span>
        <span
          className={`h-2 w-2 rounded-full ${dotClasses[color] || "bg-primary"}`}
        ></span>
      </div>
      <p className="text-3xl font-black text-neutral-dark dark:text-white">{value}</p>
      <p className="mt-1 text-sm font-semibold text-text-secondary">{label}</p>
      {subtext && <p className="mt-1 text-xs font-semibold text-primary">{subtext}</p>}
    </div>
  );
});

const ActivityItem = memo(function ActivityItem({
  icon: Icon,
  text,
  time,
  color,
}) {
  return (
    <div className="rounded-lg border border-transparent px-3 py-3 transition last:border-0 hover:border-primary/20 hover:bg-primary/5">
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ${color}`}>
          {React.createElement(Icon, { size: 16 })}
        </span>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-dark dark:text-gray-100">{text}</p>
          <p className="text-xs text-text-secondary">{time}</p>
        </div>
      </div>
    </div>
  );
});

const AlertItem = memo(function AlertItem({
  icon: Icon,
  text,
  count,
  severity,
  onClick,
}) {
  const severityColors = {
    critical: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20",
    warning: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20",
    info: "border-primary/20 bg-primary/5",
    error: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20",
  };
  const iconColors = {
    critical: "text-red-600",
    warning: "text-amber-600",
    info: "text-primary",
    error: "text-red-600",
  };
  return (
    <div
      className={`mb-2 rounded-xl border p-3 ${severityColors[severity]} ${onClick ? "cursor-pointer hover:opacity-80" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={iconColors[severity]}>
            {React.createElement(Icon, { size: 16 })}
          </span>
          <span className="text-sm font-semibold text-neutral-dark dark:text-gray-100">{text}</span>
        </div>
        {count !== undefined && count !== null && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-black text-white">
            {count}
          </span>
        )}
      </div>
    </div>
  );
});

const ActionMenu = memo(function ActionMenu({ isOpen, onClose, actions }) {
  if (!isOpen) return null;
  return (
    <div className="absolute right-0 top-8 bg-surface border border-border rounded-lg shadow-lg z-10 py-1 min-w-[150px]">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => {
            action.onClick();
            onClose();
          }}
          className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-surface-highlight ${action.danger ? "text-red-500" : "text-primary"}`}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
});

export default function AdminDashboard() {
  const { user, logout, updateUser: updateCurrentUser } = useUser();
  const { addToast, handleError } = useToast();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const menuRef = useRef(null);
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    mentors: 0,
    sessions: 0,
    interns: 0,
    inactive: 0,
    activeProjects: 0,
    completedProjects: 0,
    seekingMembers: 0,
  });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedError, setSelectedError] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [sessionsExpanded, setSessionsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilters, setUserFilters] = useState({
    role: "all",
    status: "all",
  });
  const [userPagination, setUserPagination] = useState({
    page: 1,
    perPage: 10,
  });
  const [projectFilters, setProjectFilters] = useState({ status: "all" });
  const [projectPagination, setProjectPagination] = useState({
    page: 1,
    perPage: 10,
  });
  const [healthData, setHealthData] = useState(null);
  const [errorStats, setErrorStats] = useState({
    total: 0,
    open: 0,
    byType: [],
  });
  const [errors, setErrors] = useState([]);
  const [errorsPagination, setErrorsPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
  });
  const [errorFilter, setErrorFilter] = useState({
    status: "all",
    type: "all",
  });
  const [selectedErrors, setSelectedErrors] = useState([]);
  const [activeSessions, setActiveSessions] = useState(0);
  const [platformStats, setPlatformStats] = useState(null);
  const [recentErrors, setRecentErrors] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [settings, setSettings] = useState({
    platformName: "SyncUp",
    supportEmail: "support@syncup.com",
    timezone: "UTC",
    allowRegistrations: true,
  });
  const [featureFlags, setFeatureFlags] = useState({
    enableMentorship: true,
    enableProjectDiscovery: true,
    maintenanceMode: false,
    showLeaderboards: true,
  });
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "We are doing some work on the app. Please check back soon.",
  );
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [communityEvents, setCommunityEvents] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [loadingCommunityEvents, setLoadingCommunityEvents] = useState(false);
  const [governancePositions, setGovernancePositions] = useState([]);
  const [loadingGovernance, setLoadingGovernance] = useState(false);
  const [governanceBusy, setGovernanceBusy] = useState(false);
  const [governanceForm, setGovernanceForm] = useState({
    user_id: "",
    position: "president",
  });
  const [cycles, setCycles] = useState([]);
  const [loadingCycles, setLoadingCycles] = useState(false);
  const [cyclesLoaded, setCyclesLoaded] = useState(false);
  const [cycleBusy, setCycleBusy] = useState(false);
  const [cycleForm, setCycleForm] = useState({
    cycle_name: "",
    start_date: "",
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    announcement_type: "news",
    expires_at: "",
    poll_enabled: false,
    poll_question: "",
    poll_type: "yes_no",
    poll_options: "",
    poll_closes_at: "",
  });
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    requires_rsvp: false,
    max_attendees: "",
  });
  const [editingEventId, setEditingEventId] = useState(null);
  const [editUserRole, setEditUserRole] = useState("intern");
  const [editUserCommenced, setEditUserCommenced] = useState(false);
  const [editUserCycleId, setEditUserCycleId] = useState("");
  const [editUserCycleText, setEditUserCycleText] = useState("");
  const [editUserIsAdmin, setEditUserIsAdmin] = useState(false);

  // Special invitation state
  const [specialInvite, setSpecialInvite] = useState({ email: '', role: 'alumni', note: '' });

  // Phase 1: Load critical data needed for initial overview render
  useEffect(() => {
    async function loadCriticalData() {
      try {
        const [usersData, projectsData, sessionsData, updatesData] =
          await Promise.all([
            fetchUsers(),
            fetchProjects(),
            fetchSessions(),
            fetchUpdates(),
          ]);
        setUsers(usersData);
        setProjects(projectsData);
        setSessions(sessionsData);
        setUpdates(updatesData);

        // Calculate real stats from critical data
        const communityMembers = usersData.filter((u) =>
          ["resident", "alumni"].includes(u.role),
        ).length;
        const interns = usersData.filter((u) => u.role === "intern").length;
        const activeProjects = projectsData.filter(
          (p) => p.status === "active",
        ).length;
        const completedProjects = projectsData.filter(
          (p) => p.status === "completed",
        ).length;
        const seekingMembers =
          projectsData.filter((p) => p.status === "seeking_members").length ||
          0;

        setStats({
          users: usersData.length,
          projects: projectsData.length,
          mentors: communityMembers, // All iCAA community members can mentor
          interns,
          sessions: sessionsData.length,
          activeProjects,
          completedProjects,
          seekingMembers,
          inactive: 0,
        });
      } catch (err) {
        handleError(err, "loadCriticalData");
      } finally {
        setLoading(false);
      }
    }
    loadCriticalData();
  }, []);

  // Phase 2: Load deferred/secondary data after initial render
  useEffect(() => {
    if (loading) return; // Wait until critical data is loaded
    async function loadDeferredData() {
      try {
        const [
          health,
          errorStatsData,
          adminStatsData,
          activeSessionsData,
          platformStatsData,
          recentErrorsData,
          growthDataResult,
        ] = await Promise.all([
          fetchHealth().catch(() => null),
          fetchErrorStats().catch(() => ({ total: 0, open: 0, byType: [] })),
          fetchAdminStats().catch(() => ({ inactiveUsers: 0 })),
          fetchActiveSessions().catch(() => ({ activeSessions: 0 })),
          fetchPlatformStats().catch(() => null),
          fetchRecentErrors().catch(() => []),
          fetchGrowthStats().catch((err) => {
            console.error("Failed to load growth stats:", err);
            return [];
          }),
        ]);
        setHealthData(health);
        setErrorStats(errorStatsData);
        setActiveSessions(activeSessionsData?.activeSessions || 0);
        setPlatformStats(platformStatsData);
        setRecentErrors(recentErrorsData || []);
        setGrowthData(growthDataResult || []);

        // Update inactive count now that we have admin stats
        setStats((prev) => ({
          ...prev,
          inactive: adminStatsData?.inactiveUsers || 0,
        }));
      } catch (err) {
        handleError(err, "loadDeferredData");
      }
    }
    loadDeferredData();
  }, [loading]);

  // Load maintenance settings
  useEffect(() => {
    async function loadMaintenanceSettings() {
      try {
        const data = await fetchMaintenanceSettings();
        setFeatureFlags((prev) => ({
          ...prev,
          maintenanceMode: data.enabled,
        }));
        setMaintenanceMessage(data.message);
      } catch (err) {
        console.error("Failed to load maintenance settings:", err);
      }
    }
    loadMaintenanceSettings();
  }, []);

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoadingAnnouncements(true);
      const data = await fetchAnnouncements(user?.id);
      setAnnouncements(data);
    } catch (err) {
      console.error("Failed to load announcements:", err);
      addToast("Failed to load announcements", "error");
    } finally {
      setLoadingAnnouncements(false);
    }
  }, [addToast, user?.id]);

  const loadCommunityEvents = useCallback(async () => {
    try {
      setLoadingCommunityEvents(true);
      const data = await fetchEvents(user?.id);
      setCommunityEvents(data);
    } catch (err) {
      console.error("Failed to load events:", err);
      addToast("Failed to load events", "error");
    } finally {
      setLoadingCommunityEvents(false);
    }
  }, [addToast, user?.id]);

  const loadGovernancePositions = useCallback(async () => {
    try {
      setLoadingGovernance(true);
      const data = await fetchGovernancePositions();
      setGovernancePositions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load governance positions:", err);
      addToast("Failed to load governance positions", "error");
    } finally {
      setLoadingGovernance(false);
    }
  }, [addToast]);

  const loadCycles = useCallback(async () => {
    try {
      setLoadingCycles(true);
      const data = await fetchCycles();
      setCycles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load cycles:", err);
      addToast("Failed to load cycles", "error");
    } finally {
      setLoadingCycles(false);
      setCyclesLoaded(true);
    }
  }, [addToast]);

  useEffect(() => {
    if (activeTab === "announcements") {
      loadAnnouncements();
    }
  }, [activeTab, loadAnnouncements]);

  useEffect(() => {
    if (activeTab === "events") {
      loadCommunityEvents();
    }
  }, [activeTab, loadCommunityEvents]);

  useEffect(() => {
    if (activeTab === "governance") {
      loadGovernancePositions();
    }
  }, [activeTab, loadGovernancePositions]);

  useEffect(() => {
    if (activeTab === "cycles") {
      loadCycles();
    }
  }, [activeTab, loadCycles]);

  useEffect(() => {
    if (!selectedUser) return;

    setEditUserRole(selectedUser.role || "intern");
    setEditUserCommenced(Boolean(selectedUser.has_commenced));
    setEditUserCycleText(selectedUser.cycle || "");
    setEditUserIsAdmin(Boolean(selectedUser.is_admin));

    const matchedCycle =
      cycles.find(
        (cycle) => Number(cycle.id) === Number(selectedUser.intern_cycle_id),
      ) ||
      cycles.find((cycle) => cycle.cycle_name === selectedUser.cycle);

    setEditUserCycleId(matchedCycle ? String(matchedCycle.id) : "");
  }, [cycles, selectedUser]);

  useEffect(() => {
    if (selectedUser && !cyclesLoaded) {
      loadCycles();
    }
  }, [cyclesLoaded, loadCycles, selectedUser]);

  // Handle click outside for menu
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "mentorship", label: "Mentorship", icon: GraduationCap },
    { id: "governance", label: "Governance", icon: Medal },
    { id: "cycles", label: "Cycles", icon: Activity },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "announcements", label: "Announcements", icon: Bell },
    { id: "events", label: "Events", icon: Calendar },
    { id: "errors", label: "Errors", icon: AlertTriangle },
    { id: "system", label: "System", icon: Server },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "invitations", label: "Invitations", icon: UserPlus },
  ];
  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  // Load errors when Errors tab is active
  const loadErrors = async (page = 1) => {
    try {
      const data = await fetchErrors(
        errorFilter.status,
        errorFilter.type,
        page,
        15,
      );
      setErrors(data.errors || []);
      setErrorsPagination(data.pagination || { page: 1, total: 0, pages: 0 });
    } catch (err) {
      console.error("Failed to load errors:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "errors") {
      loadErrors();
    }
  }, [activeTab, errorFilter]);

  // Filter users based on search and filters
  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesSearch =
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.role?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole =
          userFilters.role === "all" || user.role === userFilters.role;
        const matchesStatus =
          userFilters.status === "all" ||
          (userFilters.status === "active" && user.is_active !== false) ||
          (userFilters.status === "inactive" && user.is_active === false);

        return matchesSearch && matchesRole && matchesStatus;
      }),
    [users, searchQuery, userFilters],
  );
  // Paginate users
  const paginatedUsers = filteredUsers.slice(
    (userPagination.page - 1) * userPagination.perPage,
    userPagination.page * userPagination.perPage,
  );
  const totalUserPages = Math.ceil(
    filteredUsers.length / userPagination.perPage,
  );

  // Filter projects based on search and filters
  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const matchesSearch =
          project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(project.owner_id)
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          project.status?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          projectFilters.status === "all" ||
          project.status === projectFilters.status;

        return matchesSearch && matchesStatus;
      }),
    [projects, searchQuery, projectFilters],
  );

  // Paginate projects
  const paginatedProjects = filteredProjects.slice(
    (projectPagination.page - 1) * projectPagination.perPage,
    projectPagination.page * projectPagination.perPage,
  );
  const totalProjectPages = Math.ceil(
    filteredProjects.length / projectPagination.perPage,
  );

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    setConfirmModal({
      open: true,
      title: "Delete User",
      message:
        "Are you sure you want to delete this user? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteUser(userId);
          setUsers(users.filter((u) => u.id !== userId));
          addToast("User deleted successfully", "success");
        } catch (err) {
          console.error("Failed to delete user:", err);
          addToast("Failed to delete user. Please try again.", "error");
        }
        setConfirmModal({ ...confirmModal, open: false });
      },
    });
  };

  // Handle update user
  const handleUpdateUser = async (userId, data) => {
    try {
      const updatedUser = await updateUser(userId, data);
      setUsers(users.map((u) => (u.id === userId ? updatedUser : u)));
      if (user?.id === userId) {
        updateCurrentUser(updatedUser);
      }
      if (cyclesLoaded) {
        await loadCycles();
      }
      setSelectedUser(null);
      addToast("User updated successfully", "success");
    } catch (err) {
      console.error("Failed to update user:", err);
      addToast(err.message || "Failed to update user. Please try again.", "error");
    }
  };

  // Handle special invitation
  const handleSpecialInvite = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/invitations/special`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: specialInvite.email,
          intended_role: specialInvite.role,
          verification_note: specialInvite.note,
          admin_id: user.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast("Special invitation sent!", "success");
        setSpecialInvite({ email: '', role: 'alumni', note: '' });
      } else {
        addToast(data.error || "Failed to send invitation", "error");
      }
    } catch {
      addToast("Failed to send invitation", "error");
    }
  };

  // Handle admin password reset
  const handleAdminResetPassword = async (targetUserId) => {
    try {
      const res = await fetch(`${API_BASE}/auth/admin-reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_user_id: targetUserId, admin_id: user.id }),
      });
      const data = await res.json();
      if (data.reset_link) {
        navigator.clipboard.writeText(data.reset_link);
        addToast(`Reset link copied to clipboard. Share with ${selectedUser.name}. Valid 24h.`, "success");
      }
    } catch {
      addToast("Failed to generate reset link", "error");
    }
  };

  // Handle delete project
  const handleDeleteProject = async (projectId) => {
    setConfirmModal({
      open: true,
      title: "Delete Project",
      message:
        "Are you sure you want to delete this project? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteProject(projectId);
          setProjects(projects.filter((p) => p.id !== projectId));
          addToast("Project deleted successfully", "success");
        } catch (err) {
          console.error("Failed to delete project:", err);
          addToast("Failed to delete project. Please try again.", "error");
        }
        setConfirmModal({ ...confirmModal, open: false });
      },
    });
  };

  // Handle update project status
  const handleUpdateProjectStatus = async (projectId, status) => {
    try {
      await updateProjectStatus(projectId, status);
      setProjects(
        projects.map((p) => (p.id === projectId ? { ...p, status } : p)),
      );
      setSelectedProject(null);
      addToast(`Project status updated to ${status}`, "success");
    } catch (err) {
      console.error("Failed to update project:", err);
      addToast("Failed to update project. Please try again.", "error");
    }
  };

  // Handle settings save
  const handleSaveSettings = async () => {
    try {
      addToast("Settings saved successfully", "success");
    } catch (err) {
      console.error("Failed to save settings:", err);
      addToast("Failed to save settings. Please try again.", "error");
    }
  };

  const formatDateTimeLocal = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().slice(0, 16);
  };

  const parseRsvpAttendees = (value) => {
    if (!value) return [];
    return String(value)
      .split("||")
      .filter(Boolean)
      .map((attendee) => {
        const [name, role, cycle] = attendee.split("::");
        return { name, role, cycle };
      });
  };

  const parseAnnouncementReaders = (value) => {
    if (!value) return [];
    return String(value)
      .split("||")
      .filter(Boolean)
      .map((reader) => {
        const [name, role, cycle, readAt] = reader.split("::");
        return { name, role, cycle, readAt };
      });
  };

  const resetAnnouncementForm = () => {
    setAnnouncementForm({
      title: "",
      content: "",
      announcement_type: "news",
      expires_at: "",
      poll_enabled: false,
      poll_question: "",
      poll_type: "yes_no",
      poll_options: "",
      poll_closes_at: "",
    });
    setEditingAnnouncementId(null);
  };

  const resetEventForm = () => {
    setEventForm({
      title: "",
      description: "",
      event_date: "",
      location: "",
      requires_rsvp: false,
      max_attendees: "",
    });
    setEditingEventId(null);
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();

    try {
      const isEditing = Boolean(editingAnnouncementId);
      const {
        poll_enabled,
        poll_question,
        poll_type,
        poll_options,
        poll_closes_at,
        ...announcementFields
      } = announcementForm;
      const payload = {
        ...announcementFields,
        expires_at: announcementForm.expires_at || null,
      };

      if (!isEditing && poll_enabled) {
        const normalizedOptions = poll_options
          .split(/\r?\n/)
          .map((option) => option.trim())
          .filter(Boolean);

        if (poll_type === "multiple_choice" && normalizedOptions.length < 2) {
          addToast("Multiple choice polls need at least two options", "error");
          return;
        }

        payload.poll = {
          enabled: true,
          question: poll_question.trim(),
          poll_type,
          options: poll_type === "multiple_choice" ? normalizedOptions : undefined,
          closes_at: poll_closes_at || null,
        };
      }

      if (isEditing) {
        await updateAnnouncement(editingAnnouncementId, payload, user.id);
      } else {
        await createAnnouncement(payload, user.id);
      }
      resetAnnouncementForm();
      await loadAnnouncements();
      addToast(
        isEditing ? "Announcement updated" : "Announcement created",
        "success",
      );
    } catch (err) {
      console.error("Failed to create announcement:", err);
      addToast(err.message || "Failed to save announcement", "error");
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncementId(announcement.id);
    setAnnouncementForm({
      title: announcement.title || "",
      content: announcement.content || "",
      announcement_type: announcement.announcement_type || "news",
      expires_at: formatDateTimeLocal(announcement.expires_at),
      poll_enabled: false,
      poll_question: "",
      poll_type: "yes_no",
      poll_options: "",
      poll_closes_at: "",
    });
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    setConfirmModal({
      open: true,
      title: "Delete Announcement",
      message: "Are you sure you want to deactivate this announcement?",
      onConfirm: async () => {
        try {
          await deleteAnnouncement(announcementId, user?.id);
          if (editingAnnouncementId === announcementId) {
            resetAnnouncementForm();
          }
          await loadAnnouncements();
          addToast("Announcement deleted", "success");
        } catch (err) {
          console.error("Failed to delete announcement:", err);
          addToast("Failed to delete announcement", "error");
        }
        setConfirmModal({ ...confirmModal, open: false });
      },
    });
  };

  const handleCreateCommunityEvent = async (e) => {
    e.preventDefault();

    try {
      const isEditing = Boolean(editingEventId);
      const payload = {
        ...eventForm,
        max_attendees:
          eventForm.max_attendees ? Number(eventForm.max_attendees) : null,
      };

      if (isEditing) {
        await updateEvent(editingEventId, payload, user.id);
      } else {
        await createEvent(payload, user.id);
      }
      resetEventForm();
      await loadCommunityEvents();
      addToast(isEditing ? "Event updated" : "Event created", "success");
    } catch (err) {
      console.error("Failed to create event:", err);
      addToast(err.message || "Failed to save event", "error");
    }
  };

  const handleEditCommunityEvent = (event) => {
    setEditingEventId(event.id);
    setEventForm({
      title: event.title || "",
      description: event.description || "",
      event_date: formatDateTimeLocal(event.event_date),
      location: event.location || "",
      requires_rsvp: Boolean(event.requires_rsvp),
      max_attendees: event.max_attendees || "",
    });
  };

  const handleDeleteCommunityEvent = async (eventId) => {
    setConfirmModal({
      open: true,
      title: "Delete Event",
      message: "Are you sure you want to deactivate this event?",
      onConfirm: async () => {
        try {
          await deleteEvent(eventId, user?.id);
          if (editingEventId === eventId) {
            resetEventForm();
          }
          await loadCommunityEvents();
          addToast("Event deleted", "success");
        } catch (err) {
          console.error("Failed to delete event:", err);
          addToast("Failed to delete event", "error");
        }
        setConfirmModal({ ...confirmModal, open: false });
      },
    });
  };

  const eligibleGovernanceUsers = useMemo(
    () =>
      users
        .filter((item) => ["resident", "alumni", "admin"].includes(item.role))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  );

  const handleAssignGovernance = async (e) => {
    e.preventDefault();
    if (!governanceForm.user_id || !governanceForm.position) return;

    try {
      setGovernanceBusy(true);
      await assignGovernancePosition({
        user_id: Number(governanceForm.user_id),
        position: governanceForm.position,
        admin_id: user?.id,
      });
      setGovernanceForm((current) => ({ ...current, user_id: "" }));
      await loadGovernancePositions();
      addToast("Governance position assigned", "success");
    } catch (err) {
      console.error("Failed to assign governance position:", err);
      addToast(err.message || "Failed to assign governance position", "error");
    } finally {
      setGovernanceBusy(false);
    }
  };

  const handleRemoveGovernance = (position) => {
    setConfirmModal({
      open: true,
      title: "Remove Governance Position",
      message: `Remove ${position.name} from this governance position?`,
      onConfirm: async () => {
        try {
          await removeGovernancePosition(position.id);
          await loadGovernancePositions();
          addToast("Governance position removed", "success");
        } catch (err) {
          console.error("Failed to remove governance position:", err);
          addToast("Failed to remove governance position", "error");
        }
        setConfirmModal({ ...confirmModal, open: false });
      },
    });
  };

  const handleCreateCycle = async (e) => {
    e.preventDefault();
    if (!cycleForm.cycle_name.trim() || cycleBusy) return;

    try {
      setCycleBusy(true);
      await createCycle({
        ...cycleForm,
        admin_id: user?.id,
      });
      setCycleForm({ cycle_name: "", start_date: "" });
      await loadCycles();
      addToast("Cycle created", "success");
    } catch (err) {
      console.error("Failed to create cycle:", err);
      addToast(err.message || "Failed to create cycle", "error");
    } finally {
      setCycleBusy(false);
    }
  };

  const handleUpdateCycleStatus = async (cycle, status) => {
    try {
      await updateCycleStatus(cycle.id, status, user?.id);
      await loadCycles();
      addToast(`Cycle marked ${status}`, "success");
    } catch (err) {
      console.error("Failed to update cycle:", err);
      addToast(err.message || "Failed to update cycle", "error");
    }
  };

  // Handle error status update
  const handleErrorStatusUpdate = async (errorId, status) => {
    try {
      await updateErrorStatus(errorId, status, user?.id);
      loadErrors(errorsPagination.page);
      // Refresh error stats
      const stats = await fetchErrorStats();
      setErrorStats(stats);
      addToast(`Error marked as ${status}`, "success");
    } catch (err) {
      console.error("Failed to update error:", err);
      addToast("Failed to update error. Please try again.", "error");
    }
  };

  // Handle error delete
  const handleErrorDelete = async (errorId) => {
    setConfirmModal({
      open: true,
      title: "Delete Error",
      message:
        "Are you sure you want to delete this error? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteError(errorId);
          loadErrors(errorsPagination.page);
          const stats = await fetchErrorStats();
          setErrorStats(stats);
          addToast("Error deleted successfully", "success");
        } catch (err) {
          console.error("Failed to delete error:", err);
          addToast("Failed to delete error. Please try again.", "error");
        }
        setConfirmModal({ ...confirmModal, open: false });
      },
    });
  };

  // Bulk error actions
  const toggleSelectError = (errorId) => {
    setSelectedErrors((prev) =>
      prev.includes(errorId) ?
        prev.filter((id) => id !== errorId)
      : [...prev, errorId],
    );
  };

  const selectAllErrors = () => {
    if (selectedErrors.length === errors.length) {
      setSelectedErrors([]);
    } else {
      setSelectedErrors(errors.map((e) => e.id));
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedErrors.length === 0) {
      addToast("No errors selected", "warning");
      return;
    }
    try {
      for (const errorId of selectedErrors) {
        await updateErrorStatus(errorId, status, user?.id);
      }
      await loadErrors(errorsPagination.page);
      const stats = await fetchErrorStats();
      setErrorStats(stats);
      setSelectedErrors([]);
      addToast(
        `${selectedErrors.length} errors marked as ${status}`,
        "success",
      );
    } catch (err) {
      console.error("Failed to bulk update errors:", err);
      addToast("Failed to update errors. Please try again.", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedErrors.length === 0) {
      addToast("No errors selected", "warning");
      return;
    }
    setConfirmModal({
      open: true,
      title: "Delete Selected Errors",
      message: `Are you sure you want to delete ${selectedErrors.length} error(s)? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          for (const errorId of selectedErrors) {
            await deleteError(errorId);
          }
          await loadErrors(errorsPagination.page);
          const stats = await fetchErrorStats();
          setErrorStats(stats);
          setSelectedErrors([]);
          addToast(`${selectedErrors.length} errors deleted`, "success");
        } catch (err) {
          console.error("Failed to bulk delete errors:", err);
          addToast("Failed to delete errors. Please try again.", "error");
        }
        setConfirmModal({ ...confirmModal, open: false });
      },
    });
  };

  // Export errors to CSV
  const exportErrorsToCSV = () => {
    if (errors.length === 0) {
      addToast("No errors to export", "warning");
      return;
    }
    const headers = [
      "ID",
      "Type",
      "Message",
      "Page URL",
      "Status",
      "Created At",
      "Resolved At",
    ];
    const csvContent = [
      headers.join(","),
      ...errors.map((e) =>
        [
          e.id,
          e.error_type || "",
          `"${(e.message || "").replace(/"/g, '""')}"`,
          e.page_url || "",
          e.status || "",
          e.created_at ? new Date(e.created_at).toISOString() : "",
          e.resolved_at ? new Date(e.resolved_at).toISOString() : "",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `errors_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    addToast("Errors exported to CSV", "success");
  };

  // Export errors to JSON
  const exportErrorsToJSON = () => {
    if (errors.length === 0) {
      addToast("No errors to export", "warning");
      return;
    }
    const exportData = errors.map((e) => ({
      id: e.id,
      type: e.error_type,
      message: e.message,
      pageUrl: e.page_url,
      status: e.status,
      createdAt: e.created_at,
      resolvedAt: e.resolved_at,
      stack: e.stack,
      userAgent: e.user_agent,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `errors_export_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    addToast("Errors exported to JSON", "success");
  };

  // Mentorship analytics (memoized)
  const {
    pendingSessions,
    completionRate,
    mentorPerformance,
  } = useMemo(() => {
    const completed = sessions.filter((s) => s.status === "completed").length;
    const pending = sessions.filter((s) => s.status === "pending").length;
    const rate =
      sessions.length > 0 ? Math.round((completed / sessions.length) * 100) : 0;

    // Calculate mentor performance
    const mStats = sessions.reduce((acc, session) => {
      if (!session.mentor) return acc;
      if (!acc[session.mentor]) {
        acc[session.mentor] = { name: session.mentor, total: 0, completed: 0 };
      }
      acc[session.mentor].total++;
      if (session.status === "completed") {
        acc[session.mentor].completed++;
      }
      return acc;
    }, {});

    const perf = Object.values(mStats)
      .map((m) => ({
        name: m.name,
        sessions: m.total,
        completed: m.completed,
        rate: m.total > 0 ? Math.round((m.completed / m.total) * 100) : 0,
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .map((mentor, idx) => ({
        ...mentor,
        rank: idx + 1,
        medalColor:
          idx === 0 ? "text-primary"
          : idx === 1 ? "text-gray-300"
          : idx === 2 ? "text-amber-600"
          : null,
      }));

    return {
      completedSessions: completed,
      pendingSessions: pending,
      completionRate: rate,
      mentorPerformance: perf,
    };
  }, [sessions]);

  // Build activity from real updates data
  const recentActivity = useMemo(() => {
    const items = updates.map((update) => ({
      icon: Activity,
      text: `${update.user_name || "Someone"}: ${update.content?.substring(0, 50) || "posted an update"}...`,
      time:
        update.created_at ?
          new Date(update.created_at).toLocaleDateString()
        : "Recently",
      color: "text-primary",
    }));
    return showAllActivity ? items : items.slice(0, 5);
  }, [updates, showAllActivity]);

  // Alerts based on real data
  const alerts = [
    {
      icon: FileText,
      text: "Join Requests",
      count: stats.seekingMembers,
      severity: "info",
    },
    {
      icon: AlertTriangle,
      text: "Pending Sessions",
      count: sessions.filter((s) => s.status === "pending").length || 0,
      severity: "warning",
    },
    {
      icon: AlertTriangle,
      text: "Open Errors",
      count: errorStats.open || 0,
      severity: "error",
      onClick: () => setActiveTab("errors"),
    },
  ];

  // System status based on health data
  const systemStatus =
    healthData?.status === "ok" ? "All systems operational"
    : healthData?.status === "error" ? "System error detected"
    : "Checking system status...";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutralLight">
        <div className="brand-card flex flex-col items-center gap-3 p-8">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-bold text-text-secondary">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutralLight dark:bg-[#1a1a2e]">
      {/* Header */}
      <header className="px-4 pt-4 md:px-6">
        <div className="brand-card flex items-center justify-between px-4 py-3">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase text-primary">iCAA Admin</p>
              <h1 className="truncate text-xl font-black text-neutral-dark dark:text-white">
                Admin Dashboard
              </h1>
            </div>
            <button
              onClick={() => navigate("/collaboration")}
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary sm:flex"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Community
            </button>
          </div>
          <div className="flex items-center gap-4 relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-xl border border-border p-2 text-neutral-dark transition hover:border-primary/30 hover:bg-primary/10 hover:text-primary dark:text-white"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              {menuOpen ?
                <X className="w-5 h-5" />
              : <Menu className="w-5 h-5" />}
            </button>

            {/* Hamburger Menu */}
            {menuOpen && (
              <div className="absolute right-0 top-12 z-10 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
                <ul className="text-sm">
                  <li>
                    <button
                      onClick={() => {
                        setShowHelp(true);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-semibold text-neutral-dark transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-500" />
                      Help & Support
                    </button>
                  </li>
                  <li className="border-t border-border" />
                  <li>
                    <button
                      onClick={() => {
                        toggleTheme();
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left font-semibold text-neutral-dark transition-colors hover:bg-primary/10 hover:text-primary"
                      aria-label={
                        isDarkMode ?
                          "Switch to light mode"
                        : "Switch to dark mode"
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
                  <li className="border-t border-border" />
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        navigate("/login");
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-500 cursor-pointer font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ ...confirmModal, open: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Delete"
        confirmColor="red"
      />

      {/* Navigation Tabs */}
      <nav className="px-4 py-4 md:px-6" aria-label="Admin tabs">
        <div className="brand-card overflow-hidden p-2">
          <div className="mb-3 flex items-center gap-3 px-2 pt-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {React.createElement(activeTabConfig.icon, { className: "h-4 w-4" })}
            </div>
            <div>
              <p className="text-xs font-black uppercase text-primary">Current Workspace</p>
              <h2 className="text-lg font-black text-neutral-dark dark:text-white">
                {activeTabConfig.label}
              </h2>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto" role="tablist">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={selected}
                  aria-label={tab.label}
                  className={`inline-flex flex-shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-black transition-all ${
                    selected
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-secondary hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="px-4 pb-6 md:px-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Total Users"
                value={stats.users}
                subtext={`${stats.mentors} mentors, ${stats.interns} interns`}
                color="blue"
              />
              <StatCard
                icon={FolderKanban}
                label="Active Projects"
                value={stats.activeProjects}
                subtext={`${stats.completedProjects} completed`}
                color="green"
              />
              <StatCard
                icon={GraduationCap}
                label="Active Mentors"
                value={stats.mentors}
                subtext={`${stats.sessions} sessions`}
                color="purple"
              />
              <StatCard
                icon={Zap}
                label="Total Updates"
                value={updates.length}
                subtext="All time"
                color="yellow"
              />
            </div>

            {/* Platform Activity Chart */}
            <div className="bg-surface rounded-xl p-5 border border-border">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <BarChart3 className="text-accent" size={20} /> Platform
                Activity (Last 30 Days)
              </h3>
              {growthData.length === 0 ?
                <div className="h-80 flex items-center justify-center text-gray-500">
                  No data available. Check console for errors.
                </div>
              : <div className="h-80">
                  <AgCharts
                    options={{
                      data: growthData,
                      background: {
                        fill: isDarkMode ? "#282827" : "#ffffff",
                      },
                      theme: {
                        baseTheme:
                          isDarkMode ? "ag-default-dark" : "ag-default",
                        palette: {
                          fills: ["#3b82f6", "#22c55e"],
                          strokes: ["#3b82f6", "#22c55e"],
                        },
                        overrides: {
                          line: {
                            series: {
                              highlightStyle: {
                                series: {
                                  strokeWidth: 4,
                                },
                              },
                              marker: {
                                size: 6,
                                strokeWidth: 2,
                              },
                            },
                          },
                        },
                      },
                      axes: [
                        {
                          type: "category",
                          position: "bottom",
                          label: {
                            enabled: true,
                            color: isDarkMode ? "#9ca3af" : "#6b7280",
                            fontSize: 10,
                            padding: 8,
                            formatter: (params) => {
                              // Simple date formatter: "Oct 12" instead of "2024-10-12"
                              try {
                                const d = new Date(params.value);
                                return d.toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                });
                              } catch {
                                return params.value;
                              }
                            },
                          },
                          tick: { enabled: false },
                          line: { color: isDarkMode ? "#4a4848" : "#e5e7eb" },
                        },
                        {
                          type: "number",
                          position: "left",
                          label: {
                            color: isDarkMode ? "#9ca3af" : "#6b7280",
                            fontSize: 11,
                            padding: 8,
                          },
                          gridLine: {
                            style: [
                              {
                                stroke: isDarkMode ? "#383838" : "#f1f5f9",
                                lineDash: [4, 4],
                              },
                            ],
                          },
                          line: { color: isDarkMode ? "#4a4848" : "#e5e7eb" },
                        },
                      ],
                      legend: {
                        position: "top",
                        item: {
                          label: {
                            color: isDarkMode ? "#e5e7eb" : "#374151",
                            fontSize: 12,
                          },
                          marker: {
                            padding: 4,
                          },
                        },
                      },
                      series: [
                        {
                          type: "line",
                          xKey: "date",
                          yKey: "users",
                          yName: "New Users",
                          stroke: "#3b82f6",
                          strokeWidth: 3,
                          marker: { 
                            enabled: true,
                            fill: "#3b82f6",
                            stroke: isDarkMode ? "#282827" : "#ffffff",
                            strokeWidth: 2
                          },
                        },
                        {
                          type: "line",
                          xKey: "date",
                          yKey: "projects",
                          yName: "New Projects",
                          stroke: "#22c55e",
                          strokeWidth: 3,
                          marker: { 
                            enabled: true,
                            fill: "#22c55e",
                            stroke: isDarkMode ? "#282827" : "#ffffff",
                            strokeWidth: 2
                          },
                        },
                      ],
                    }}
                  />
                </div>
              }
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-surface rounded-xl p-5 border border-border">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <Flame className="text-orange-500" size={20} /> Recent
                  Activity
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Latest updates from the platform
                </p>
                <div className="space-y-0">
                  {recentActivity.length > 0 ?
                    recentActivity.map((item, idx) => (
                      <ActivityItem key={idx} {...item} />
                    ))
                  : <p className="text-sm text-gray-500 py-4 text-center">
                      No recent activity
                    </p>
                  }
                </div>
                <button
                  onClick={() => setShowAllActivity(!showAllActivity)}
                  className="w-full mt-4 text-sm text-accent hover:underline"
                >
                  {showAllActivity ? "Show Less" : "View All Activity"}
                </button>
              </div>

              {/* Needs Attention */}
              <div className="bg-surface rounded-xl p-5 border border-border">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-yellow-500" size={20} /> Needs
                  Attention
                </h3>
                <div className="space-y-2">
                  {alerts
                    .filter((a) => a.count > 0)
                    .map((alert, idx) => (
                      <AlertItem key={idx} {...alert} />
                    ))}
                  {alerts.filter((a) => a.count > 0).length === 0 && (
                    <p className="text-sm text-gray-500 py-4 text-center">
                      No items need attention
                    </p>
                  )}
                </div>
                <div className="mt-4 p-3 rounded bg-green-500/10 border-l-4 border-green-500 flex items-center gap-2">
                  <CheckCircle className="text-green-500 w-4 h-4" />
                  <p className="text-sm text-green-400">{systemStatus}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-surface rounded-xl p-5 border border-border">
              <h3 className="text-lg font-semibold text-primary mb-4">
                Quick Actions
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab("users")}
                  aria-label="Manage Users"
                  className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition flex items-center gap-2"
                >
                  <Users size={18} aria-hidden="true" /> Manage Users
                </button>
                <button
                  onClick={() => setActiveTab("projects")}
                  aria-label="View Projects"
                  className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition flex items-center gap-2"
                >
                  <FolderKanban size={18} aria-hidden="true" /> View Projects
                </button>
                <button
                  onClick={() => setActiveTab("system")}
                  aria-label="System Health"
                  className="px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-lg hover:bg-yellow-500/30 transition flex items-center gap-2"
                >
                  <BarChart3 size={18} aria-hidden="true" /> System Health
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="h-[calc(100vh-250px)]">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
              }
            >
              <Chat />
            </Suspense>
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="grid grid-cols-1 xl:grid-cols-[380px,1fr] gap-6">
            <form
              onSubmit={handleCreateAnnouncement}
              className="bg-surface rounded-xl border border-border p-5 space-y-4"
            >
              <div>
                <h3 className="text-lg font-semibold text-primary">
                  {editingAnnouncementId ? "Edit Announcement" : "Create Announcement"}
                </h3>
                <p className="text-sm text-gray-400">
                  Manage pinned resources and community news.
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) =>
                    setAnnouncementForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <select
                  value={announcementForm.announcement_type}
                  onChange={(e) =>
                    setAnnouncementForm((prev) => ({
                      ...prev,
                      announcement_type: e.target.value,
                    }))
                  }
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                >
                  <option value="news">News</option>
                  <option value="pinned">Pinned</option>
                  <option value="event_promo">Event Promo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Content</label>
                <textarea
                  value={announcementForm.content}
                  onChange={(e) =>
                    setAnnouncementForm((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={5}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Expires At
                </label>
                <input
                  type="datetime-local"
                  value={announcementForm.expires_at}
                  onChange={(e) =>
                    setAnnouncementForm((prev) => ({
                      ...prev,
                      expires_at: e.target.value,
                    }))
                  }
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                />
              </div>

              {!editingAnnouncementId && (
                <div className="rounded-lg border border-border bg-surface-highlight/30 p-4 space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-primary">
                    <input
                      type="checkbox"
                      checked={announcementForm.poll_enabled}
                      onChange={(e) =>
                        setAnnouncementForm((prev) => ({
                          ...prev,
                          poll_enabled: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-border"
                    />
                    Attach poll
                  </label>

                  {announcementForm.poll_enabled && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          Poll Question
                        </label>
                        <input
                          type="text"
                          value={announcementForm.poll_question}
                          onChange={(e) =>
                            setAnnouncementForm((prev) => ({
                              ...prev,
                              poll_question: e.target.value,
                            }))
                          }
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                          required={announcementForm.poll_enabled}
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          Poll Type
                        </label>
                        <select
                          value={announcementForm.poll_type}
                          onChange={(e) =>
                            setAnnouncementForm((prev) => ({
                              ...prev,
                              poll_type: e.target.value,
                            }))
                          }
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                        >
                          <option value="yes_no">Yes / No</option>
                          <option value="multiple_choice">Multiple Choice</option>
                        </select>
                      </div>

                      {announcementForm.poll_type === "multiple_choice" && (
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">
                            Options
                          </label>
                          <textarea
                            value={announcementForm.poll_options}
                            onChange={(e) =>
                              setAnnouncementForm((prev) => ({
                                ...prev,
                                poll_options: e.target.value,
                              }))
                            }
                            rows={4}
                            placeholder={"One option per line\nUp to 5 options"}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary resize-none"
                            required={announcementForm.poll_type === "multiple_choice"}
                          />
                          <p className="mt-1 text-xs text-gray-400">
                            Add at least two options. Extra options after five are ignored.
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          Poll Closes At
                        </label>
                        <input
                          type="datetime-local"
                          value={announcementForm.poll_closes_at}
                          onChange={(e) =>
                            setAnnouncementForm((prev) => ({
                              ...prev,
                              poll_closes_at: e.target.value,
                            }))
                          }
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition"
              >
                {editingAnnouncementId ? "Update Announcement" : "Publish Announcement"}
              </button>
              {editingAnnouncementId && (
                <button
                  type="button"
                  onClick={resetAnnouncementForm}
                  className="w-full px-4 py-2 border border-border text-primary rounded-lg hover:bg-surface-highlight transition"
                >
                  Cancel Edit
                </button>
              )}
            </form>

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-primary">Active Announcements</h3>
                  <p className="text-sm text-gray-400">
                    Pinned resources and recent posts shown in SyncChat.
                  </p>
                </div>
                <button
                  onClick={loadAnnouncements}
                  className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-surface-highlight"
                >
                  Refresh
                </button>
              </div>

              <div className="p-4 space-y-3">
                {loadingAnnouncements ?
                  <p className="text-sm text-gray-400">Loading announcements...</p>
                : announcements.length === 0 ?
                  <p className="text-sm text-gray-400">No announcements yet.</p>
                : announcements.map((announcement) => {
                    const readers = parseAnnouncementReaders(
                      announcement.read_receipts,
                    );
                    const readCount = Number(announcement.read_count || 0);
                    const audienceCount = Number(
                      announcement.audience_count || 0,
                    );
                    const unreadCount = Math.max(audienceCount - readCount, 0);

                    return (
                    <div
                      key={announcement.id}
                      className="border border-border rounded-lg p-4 bg-surface-highlight/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-primary">
                              {announcement.title}
                            </h4>
                            <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary">
                              {announcement.announcement_type}
                            </span>
                            {announcement.has_poll ? (
                              <span className="px-2 py-0.5 rounded text-xs bg-secondary/20 text-secondary">
                                Poll
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {announcement.author_name} |{" "}
                            {new Date(announcement.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditAnnouncement(announcement)}
                            className="text-primary hover:text-accent"
                            aria-label={`Edit ${announcement.title}`}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteAnnouncement(announcement.id)
                            }
                            className="text-red-400 hover:text-red-300"
                            aria-label={`Delete ${announcement.title}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-primary mt-3 whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                      <div className="mt-3 border-t border-border pt-3">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <p className="text-xs font-semibold uppercase text-gray-400">
                            Read Tracking
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-1 rounded-full bg-green-500/15 text-green-400">
                              {readCount} read
                            </span>
                            <span className="px-2 py-1 rounded-full bg-background border border-border text-gray-300">
                              {unreadCount} unread
                            </span>
                          </div>
                        </div>
                        {readers.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {readers.map((reader) => (
                              <span
                                key={`${announcement.id}-${reader.name}-${reader.readAt}`}
                                className="px-2 py-1 rounded-full bg-background border border-border text-xs text-primary"
                                title={
                                  reader.readAt ?
                                    new Date(reader.readAt).toLocaleString()
                                  : ""
                                }
                              >
                                {reader.name}
                                {reader.role ? ` (${reader.role})` : ""}
                                {reader.cycle ? ` - ${reader.cycle}` : ""}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 mt-3">
                            No reads yet.
                          </p>
                        )}
                      </div>
                    </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="grid grid-cols-1 xl:grid-cols-[380px,1fr] gap-6">
            <form
              onSubmit={handleCreateCommunityEvent}
              className="bg-surface rounded-xl border border-border p-5 space-y-4"
            >
              <div>
                <h3 className="text-lg font-semibold text-primary">
                  {editingEventId ? "Edit Event" : "Create Event"}
                </h3>
                <p className="text-sm text-gray-400">
                  Publish upcoming ICCA events for the community feed.
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Event Date
                </label>
                <input
                  type="datetime-local"
                  value={eventForm.event_date}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      event_date: e.target.value,
                    }))
                  }
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Max Attendees
                </label>
                <input
                  type="number"
                  min="1"
                  value={eventForm.max_attendees}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      max_attendees: e.target.value,
                    }))
                  }
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-primary">
                <input
                  type="checkbox"
                  checked={eventForm.requires_rsvp}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      requires_rsvp: e.target.checked,
                    }))
                  }
                />
                Require RSVP
              </label>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition"
              >
                {editingEventId ? "Update Event" : "Publish Event"}
              </button>
              {editingEventId && (
                <button
                  type="button"
                  onClick={resetEventForm}
                  className="w-full px-4 py-2 border border-border text-primary rounded-lg hover:bg-surface-highlight transition"
                >
                  Cancel Edit
                </button>
              )}
            </form>

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-primary">Upcoming Events</h3>
                  <p className="text-sm text-gray-400">
                    Active events currently visible in the community feed.
                  </p>
                </div>
                <button
                  onClick={loadCommunityEvents}
                  className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-surface-highlight"
                >
                  Refresh
                </button>
              </div>

              <div className="p-4 space-y-3">
                {loadingCommunityEvents ?
                  <p className="text-sm text-gray-400">Loading events...</p>
                : communityEvents.length === 0 ?
                  <p className="text-sm text-gray-400">No upcoming events yet.</p>
                : communityEvents.map((event) => {
                    const attendees = parseRsvpAttendees(event.rsvp_attendees);

                    return (
                      <div
                        key={event.id}
                        className="border border-border rounded-lg p-4 bg-surface-highlight/30"
                      >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-primary">
                              {event.title}
                            </h4>
                            {event.requires_rsvp && (
                              <span className="px-2 py-0.5 rounded text-xs bg-accent/20 text-accent">
                                RSVP
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(event.event_date).toLocaleString()}
                            {event.location ? ` | ${event.location}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditCommunityEvent(event)}
                            className="text-primary hover:text-accent"
                            aria-label={`Edit ${event.title}`}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCommunityEvent(event.id)}
                            className="text-red-400 hover:text-red-300"
                            aria-label={`Delete ${event.title}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-sm text-primary mt-3">
                          {event.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-3">
                        RSVPs: {event.rsvp_count || 0}
                        {event.max_attendees ? ` / ${event.max_attendees}` : ""}
                      </p>
                      {event.requires_rsvp && (
                        <div className="mt-3 border-t border-border pt-3">
                          <p className="text-xs font-semibold uppercase text-gray-400 mb-2">
                            RSVP Roster
                          </p>
                          {attendees.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {attendees.map((attendee) => (
                                <span
                                  key={`${event.id}-${attendee.name}`}
                                  className="px-2 py-1 rounded-full bg-background border border-border text-xs text-primary"
                                >
                                  {attendee.name}
                                  {attendee.role ? ` (${attendee.role})` : ""}
                                  {attendee.cycle ? ` - ${attendee.cycle}` : ""}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400">
                              No RSVPs yet.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
        )}

        {activeTab === "governance" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                icon={Shield}
                label="Active Positions"
                value={governancePositions.length}
                color="blue"
              />
              <StatCard
                icon={Users2}
                label="Eligible Members"
                value={eligibleGovernanceUsers.length}
                color="purple"
              />
              <StatCard
                icon={Medal}
                label="Position Types"
                value={GOVERNANCE_POSITIONS.length}
                color="yellow"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
              <form
                onSubmit={handleAssignGovernance}
                className="bg-surface rounded-xl border border-border p-5 space-y-4"
              >
                <div>
                  <h3 className="font-semibold text-primary">
                    Assign Governance Position
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Governance is separate from role. Assign offices to
                    residents, alumni, or iCAA admins.
                  </p>
                </div>

                <label className="block">
                  <span className="block text-xs font-medium text-gray-400 uppercase mb-1">
                    Member
                  </span>
                  <select
                    value={governanceForm.user_id}
                    onChange={(e) =>
                      setGovernanceForm({
                        ...governanceForm,
                        user_id: e.target.value,
                      })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-primary"
                    required
                  >
                    <option value="">Select member</option>
                    {eligibleGovernanceUsers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} - {member.role}
                        {member.cycle ? ` - ${member.cycle}` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="block text-xs font-medium text-gray-400 uppercase mb-1">
                    Position
                  </span>
                  <select
                    value={governanceForm.position}
                    onChange={(e) =>
                      setGovernanceForm({
                        ...governanceForm,
                        position: e.target.value,
                      })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-primary"
                    required
                  >
                    {GOVERNANCE_POSITIONS.map((position) => (
                      <option key={position.value} value={position.value}>
                        {position.label}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="submit"
                  disabled={
                    governanceBusy ||
                    !governanceForm.user_id ||
                    !governanceForm.position
                  }
                  className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition disabled:opacity-50"
                >
                  {governanceBusy ? "Assigning..." : "Assign Position"}
                </button>
              </form>

              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-primary">
                      Current Governance
                    </h3>
                    <p className="text-sm text-gray-400">
                      Active board and iCAA body positions.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={loadGovernancePositions}
                    className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-surface-highlight"
                  >
                    Refresh
                  </button>
                </div>

                {loadingGovernance ? (
                  <p className="p-4 text-sm text-gray-400">
                    Loading governance positions...
                  </p>
                ) : governancePositions.length === 0 ? (
                  <div className="p-8 text-center">
                    <Shield className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                    <p className="text-primary font-medium">
                      No governance positions assigned yet
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Assign the first position using the form.
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-surface-highlight">
                      <tr>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                          Position
                        </th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                          Member
                        </th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                          Cycle
                        </th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                          Assigned
                        </th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {governancePositions.map((position) => (
                        <tr
                          key={position.id}
                          className="border-t border-border hover:bg-surface-highlight/50"
                        >
                          <td className="p-3">
                            <GovernanceBadge position={position.position} />
                          </td>
                          <td className="p-3">
                            <div className="text-sm font-medium text-primary">
                              {position.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {position.role}
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-400">
                            {position.cycle || "-"}
                          </td>
                          <td className="p-3 text-sm text-gray-400">
                            {position.assigned_at ?
                              new Date(position.assigned_at).toLocaleDateString()
                            : "-"}
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => handleRemoveGovernance(position)}
                              className="inline-flex items-center gap-1 text-sm text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "cycles" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                icon={Users}
                label="Total Cycles"
                value={cycles.length}
                color="blue"
              />
              <StatCard
                icon={Activity}
                label="Active Cycles"
                value={cycles.filter((cycle) => cycle.status === "active").length}
                color="green"
              />
              <StatCard
                icon={GraduationCap}
                label="Commenced / Closed"
                value={
                  cycles.filter((cycle) =>
                    ["commenced", "closed"].includes(cycle.status),
                  ).length
                }
                color="purple"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
              <form
                onSubmit={handleCreateCycle}
                className="bg-surface rounded-xl border border-border p-5 space-y-4"
              >
                <div>
                  <h3 className="font-semibold text-primary">Create Cycle</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Create the next intern cohort, such as C-61. This does not
                    change lobby filtering yet.
                  </p>
                </div>

                <label className="block">
                  <span className="block text-xs font-medium text-gray-400 uppercase mb-1">
                    Cycle Name
                  </span>
                  <input
                    value={cycleForm.cycle_name}
                    onChange={(e) =>
                      setCycleForm({
                        ...cycleForm,
                        cycle_name: e.target.value,
                      })
                    }
                    placeholder="C-61"
                    maxLength={10}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-primary"
                    required
                  />
                </label>

                <label className="block">
                  <span className="block text-xs font-medium text-gray-400 uppercase mb-1">
                    Start Date
                  </span>
                  <input
                    type="date"
                    value={cycleForm.start_date}
                    onChange={(e) =>
                      setCycleForm({
                        ...cycleForm,
                        start_date: e.target.value,
                      })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-primary"
                  />
                </label>

                <button
                  type="submit"
                  disabled={cycleBusy || !cycleForm.cycle_name.trim()}
                  className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition disabled:opacity-50"
                >
                  {cycleBusy ? "Creating..." : "Create Cycle"}
                </button>
              </form>

              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-primary">Intern Cycles</h3>
                    <p className="text-sm text-gray-400">
                      Cohort records that will power the rotating Intern Lobby.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={loadCycles}
                    className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-surface-highlight"
                  >
                    Refresh
                  </button>
                </div>

                {loadingCycles ? (
                  <p className="p-4 text-sm text-gray-400">Loading cycles...</p>
                ) : cycles.length === 0 ? (
                  <div className="p-8 text-center">
                    <GraduationCap className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                    <p className="text-primary font-medium">
                      No cycles created yet
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Create the first active cohort to begin cycle tracking.
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-surface-highlight">
                      <tr>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                          Cycle
                        </th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                          Status
                        </th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                          Interns
                        </th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                          Dates
                        </th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cycles.map((cycle) => (
                        <tr
                          key={cycle.id}
                          className="border-t border-border hover:bg-surface-highlight/50"
                        >
                          <td className="p-3">
                            <div className="text-sm font-semibold text-primary">
                              {cycle.cycle_name}
                            </div>
                            <div className="text-xs text-gray-400">
                              Created by {cycle.created_by_name || "Admin"}
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                cycle.status === "active" ?
                                  "bg-green-500/20 text-green-400"
                                : cycle.status === "commenced" ?
                                  "bg-secondary/20 text-secondary"
                                : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {cycle.status}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-gray-400">
                            {cycle.intern_count || 0}
                          </td>
                          <td className="p-3 text-sm text-gray-400">
                            {cycle.start_date ?
                              new Date(cycle.start_date).toLocaleDateString()
                            : "No start"}
                            {cycle.end_date ?
                              ` - ${new Date(cycle.end_date).toLocaleDateString()}`
                            : ""}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-2">
                              {cycle.status === "active" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateCycleStatus(cycle, "commenced")
                                  }
                                  className="text-xs text-secondary hover:text-secondary"
                                >
                                  Mark Commenced
                                </button>
                              )}
                              {cycle.status !== "closed" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateCycleStatus(cycle, "closed")
                                  }
                                  className="text-xs text-gray-400 hover:text-gray-300"
                                >
                                  Close
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Total Users"
                value={stats.users}
                color="blue"
              />
              <StatCard
                icon={User}
                label="Interns"
                value={stats.interns}
                color="green"
              />
              <StatCard
                icon={Trophy}
                label="Community Mentors"
                value={stats.mentors}
                color="purple"
              />
              <StatCard
                icon={Users2}
                label="Inactive Users"
                value={stats.inactive}
                color="yellow"
              />
            </div>

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center flex-wrap gap-4">
                <h3 className="font-semibold text-primary">All Users</h3>
                <div className="flex gap-3 items-center">
                  <select
                    value={userFilters.role}
                    onChange={(e) =>
                      setUserFilters({ ...userFilters, role: e.target.value })
                    }
                    className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-primary"
                  >
                    <option value="all">All Roles</option>
                    <option value="intern">Intern</option>
                    <option value="resident">Resident</option>
                    <option value="alumni">Alumni</option>
                    <option value="admin">Admins Only</option>
                  </select>
                  <select
                    value={userFilters.status}
                    onChange={(e) =>
                      setUserFilters({ ...userFilters, status: e.target.value })
                    }
                    className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-background border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-primary placeholder-gray-500"
                      aria-label="Search users"
                    />
                  </div>
                </div>
              </div>
              <table className="w-full">
                <thead className="bg-surface-highlight">
                  <tr>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Verified
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Credential
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Joined
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length > 0 ?
                    paginatedUsers.map((user) => {
                      const completeness = calculateProfileCompleteness(user);
                      const credentialColor =
                        completeness.percent >= 85 ?
                          "bg-green-500/20 text-green-400"
                        : completeness.percent >= 60 ?
                          "bg-yellow-500/20 text-yellow-500"
                        : "bg-red-500/20 text-red-400";

                      return (
                        <tr
                          key={user.id}
                          className="border-t border-border hover:bg-surface-highlight/50 transition cursor-pointer"
                          onClick={() => setSelectedUser(user)}
                        >
                        <td className="p-3 text-sm text-gray-400">{user.id}</td>
                        <td className="p-3 text-sm text-primary font-medium">
                          {user.name}
                        </td>
                        <td className="p-3 text-sm text-gray-400">
                          {user.email || "N/A"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              user.role === "resident" ?
                                "bg-secondary/20 text-secondary"
                              : user.role === "alumni" ?
                                "bg-yellow-500/20 text-yellow-500"
                              : user.role === "mentor" ?
                                "bg-primary/20 text-primary"
                              : user.role === "admin" ?
                                "bg-red-500/20 text-red-400"
                              : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {user.role}
                          </span>
                          {user.is_admin === 1 || user.is_admin === true ? (
                            <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#b9123f] text-white">
                              ADMIN
                            </span>
                          ) : null}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={`flex items-center gap-1 text-xs ${
                                user.is_active === false ?
                                  "text-gray-400"
                                : "text-green-400"
                              }`}
                            >
                              <Check size={12} />
                              {user.is_active === false ? "Inactive" : "Active"}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            user.email_verified
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {user.email_verified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${credentialColor}`}
                            >
                              {completeness.percent}%
                            </span>
                            <div className="h-1.5 w-16 rounded-full bg-surface-highlight overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${completeness.percent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-gray-400">
                          {user.created_at ?
                            new Date(user.created_at).toLocaleDateString(
                              "en-US",
                              { month: "short", year: "numeric" },
                            )
                          : user.join_date ?
                            new Date(user.join_date).toLocaleDateString(
                              "en-US",
                              { month: "short", year: "numeric" },
                            )
                          : "N/A"}
                        </td>
                        <td className="p-3 relative">
                          <button
                            className="text-gray-400 hover:text-primary p-1"
                            onClick={() =>
                              setOpenMenu(
                                (
                                  openMenu?.type === "user" &&
                                    openMenu?.id === user.id
                                ) ?
                                  null
                                : { type: "user", id: user.id },
                              )
                            }
                          >
                            <MoreHorizontal
                              size={18}
                              aria-label="More options"
                            />
                          </button>
                          {openMenu?.type === "user" &&
                            openMenu?.id === user.id && (
                              <ActionMenu
                                isOpen={true}
                                onClose={() => setOpenMenu(null)}
                                actions={[
                                  {
                                    icon: <Pencil size={14} />,
                                    label: "Edit User",
                                    onClick: () => setSelectedUser(user),
                                  },
                                  {
                                    icon: <Trash2 size={14} />,
                                    label: "Delete User",
                                    danger: true,
                                    onClick: () => handleDeleteUser(user.id),
                                  },
                                ]}
                              />
                            )}
                        </td>
                      </tr>
                      );
                    })
                  : <tr>
                      <td colSpan={8}>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Search className="w-10 h-10 text-gray-600 mb-3" />
                          <p className="text-white font-semibold mb-1">
                            No users found
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            Try adjusting your filters or search query
                          </p>
                          <button
                            onClick={() => {
                              setUserFilters({ role: "all", status: "all" });
                              setSearchQuery("");
                            }}
                            className="px-3 py-1.5 text-sm bg-surface border border-border rounded-lg text-gray-400 hover:text-primary hover:border-accent/30 transition"
                          >
                            Clear Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
              {/* Pagination */}
              {totalUserPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-border">
                  <span className="text-sm text-gray-400">
                    Showing{" "}
                    {(userPagination.page - 1) * userPagination.perPage + 1} to{" "}
                    {Math.min(
                      userPagination.page * userPagination.perPage,
                      filteredUsers.length,
                    )}{" "}
                    of {filteredUsers.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setUserPagination({
                          ...userPagination,
                          page: userPagination.page - 1,
                        })
                      }
                      disabled={userPagination.page === 1}
                      className="px-3 py-1 rounded bg-surface border border-border disabled:opacity-50 text-sm"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-400">
                      Page {userPagination.page} of {totalUserPages}
                    </span>
                    <button
                      onClick={() =>
                        setUserPagination({
                          ...userPagination,
                          page: userPagination.page + 1,
                        })
                      }
                      disabled={userPagination.page === totalUserPages}
                      className="px-3 py-1 rounded bg-surface border border-border disabled:opacity-50 text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={FolderKanban}
                label="Total Projects"
                value={stats.projects}
                color="blue"
              />
              <StatCard
                icon={Check}
                label="Active"
                value={stats.activeProjects}
                color="green"
              />
              <StatCard
                icon={Search}
                label="Seeking Members"
                value={stats.seekingMembers}
                color="yellow"
              />
              <StatCard
                icon={Trophy}
                label="Completed"
                value={stats.completedProjects}
                color="purple"
              />
            </div>

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center flex-wrap gap-4">
                <h3 className="font-semibold text-primary">All Projects</h3>
                <div className="flex gap-3 items-center">
                  <select
                    value={projectFilters.status}
                    onChange={(e) => {
                      setProjectFilters({
                        ...projectFilters,
                        status: e.target.value,
                      });
                      setProjectPagination({ ...projectPagination, page: 1 });
                    }}
                    className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="planned">Planned</option>
                    <option value="seeking_members">Seeking Members</option>
                    <option value="archived">Archived</option>
                  </select>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-background border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-primary placeholder-gray-500"
                      aria-label="Search projects"
                    />
                  </div>
                </div>
              </div>
              <table className="w-full">
                <thead className="bg-surface-highlight">
                  <tr>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Owner
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Team
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProjects.length > 0 ?
                    paginatedProjects.map((project) => (
                      <tr
                        key={project.id}
                        className="border-t border-border hover:bg-surface-highlight/50 transition cursor-pointer"
                        onClick={() => setSelectedProject(project)}
                      >
                        <td className="p-3 text-sm text-gray-400">
                          {project.id}
                        </td>
                        <td className="p-3 text-sm text-primary font-medium">
                          {project.title}
                        </td>
                        <td className="p-3 text-sm text-gray-400">
                          {project.owner_name || "Unknown"}
                        </td>
                        <td className="p-3 text-sm text-gray-400">
                          {project.team_count || 1}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                            {project.status || "active"}
                          </span>
                        </td>
                        <td className="p-3 relative">
                          <button
                            className="text-gray-400 hover:text-primary p-1"
                            onClick={() =>
                              setOpenMenu(
                                (
                                  openMenu?.type === "project" &&
                                    openMenu?.id === project.id
                                ) ?
                                  null
                                : { type: "project", id: project.id },
                              )
                            }
                          >
                            <MoreHorizontal
                              size={18}
                              aria-label="More options"
                            />
                          </button>
                          {openMenu?.type === "project" &&
                            openMenu?.id === project.id && (
                              <ActionMenu
                                isOpen={true}
                                onClose={() => setOpenMenu(null)}
                                actions={[
                                  {
                                    icon: <Eye size={14} />,
                                    label: "View Project",
                                    onClick: () => {},
                                  },
                                  {
                                    icon: <Pencil size={14} />,
                                    label: "Edit Project",
                                    onClick: () => setSelectedProject(project),
                                  },
                                  {
                                    icon: <Archive size={14} />,
                                    label: "Archive",
                                    onClick: () =>
                                      handleUpdateProjectStatus(
                                        project.id,
                                        "archived",
                                      ),
                                  },
                                  {
                                    icon: <Trash2 size={14} />,
                                    label: "Delete Project",
                                    danger: true,
                                    onClick: () =>
                                      handleDeleteProject(project.id),
                                  },
                                ]}
                              />
                            )}
                        </td>
                      </tr>
                    ))
                  : <tr>
                      <td colSpan={6}>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <FolderKanban className="w-10 h-10 text-gray-600 mb-3" />
                          <p className="text-white font-semibold mb-1">
                            No projects found
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            Try adjusting your filters or search query
                          </p>
                          <button
                            onClick={() => {
                              setProjectFilters({ status: "all" });
                              setSearchQuery("");
                            }}
                            className="px-3 py-1.5 text-sm bg-surface border border-border rounded-lg text-gray-400 hover:text-primary hover:border-accent/30 transition"
                          >
                            Clear Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
              {/* Pagination */}
              {totalProjectPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-border">
                  <span className="text-sm text-gray-400">
                    Showing{" "}
                    {(projectPagination.page - 1) * projectPagination.perPage +
                      1}{" "}
                    to{" "}
                    {Math.min(
                      projectPagination.page * projectPagination.perPage,
                      filteredProjects.length,
                    )}{" "}
                    of {filteredProjects.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setProjectPagination({
                          ...projectPagination,
                          page: projectPagination.page - 1,
                        })
                      }
                      disabled={projectPagination.page === 1}
                      className="px-3 py-1 rounded bg-surface border border-border disabled:opacity-50 text-sm"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-400">
                      Page {projectPagination.page} of {totalProjectPages}
                    </span>
                    <button
                      onClick={() =>
                        setProjectPagination({
                          ...projectPagination,
                          page: projectPagination.page + 1,
                        })
                      }
                      disabled={projectPagination.page === totalProjectPages}
                      className="px-3 py-1 rounded bg-surface border border-border disabled:opacity-50 text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "mentorship" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={Clock}
                label="Total Sessions"
                value={sessions.length}
                color="blue"
              />
              <StatCard
                icon={GraduationCap}
                label="Active Mentors"
                value={stats.mentors}
                color="purple"
              />
              <StatCard
                icon={Trophy}
                label="Completion Rate"
                value={`${completionRate}%`}
                color="green"
              />
              <StatCard
                icon={Activity}
                label="Pending"
                value={pendingSessions}
                color="yellow"
              />
            </div>

            {/* Pending Requests */}
            {pendingSessions > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <h3 className="font-semibold text-yellow-500 mb-3 flex items-center gap-2">
                  <AlertTriangle size={18} /> {pendingSessions} Pending Session
                  {pendingSessions > 1 ? "s" : ""} Need Attention
                </h3>
                <div className="space-y-2">
                  {sessions
                    .filter((s) => s.status === "pending")
                    .slice(0, 3)
                    .map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between bg-surface p-3 rounded-lg"
                      >
                        <div>
                          <p className="text-primary font-medium">
                            {session.mentor || "Unassigned"} →{" "}
                            {session.intern || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-400">
                            {session.topic || "No topic"}
                          </p>
                        </div>
                        <span className="text-xs text-yellow-500">
                          Needs review
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Mentor Performance */}
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-primary">
                  Mentor Performance
                </h3>
              </div>
              {mentorPerformance.length > 0 ?
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-highlight">
                      <tr>
                        <th
                          scope="col"
                          className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                        >
                          Mentor
                        </th>
                        <th
                          scope="col"
                          className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                        >
                          Sessions
                        </th>
                        <th
                          scope="col"
                          className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                        >
                          Completed
                        </th>
                        <th
                          scope="col"
                          className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                        >
                          Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mentorPerformance.map((mentor) => (
                        <tr
                          key={mentor.rank}
                          className="border-t border-border hover:bg-surface-highlight/50"
                        >
                          <td className="p-3 text-sm text-primary font-medium">
                            {mentor.rank <= 3 && (
                              <Medal
                                className={`inline w-4 h-4 mr-1 ${mentor.medalColor}`}
                              />
                            )}
                            {mentor.name}
                          </td>
                          <td className="p-3 text-sm text-gray-400">
                            {mentor.sessions}
                          </td>
                          <td className="p-3 text-sm text-gray-400">
                            {mentor.completed}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                mentor.rate >= 80 ?
                                  "bg-green-500/20 text-green-400"
                                : mentor.rate >= 50 ?
                                  "bg-yellow-500/20 text-yellow-500"
                                : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {mentor.rate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              : <div className="p-8 text-center text-gray-500">
                  No mentor data available
                </div>
              }
            </div>

            {/* Recent Sessions - Collapsible */}
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div
                className="p-4 border-b border-border flex justify-between items-center cursor-pointer hover:bg-surface-highlight/30"
                onClick={() => setSessionsExpanded(!sessionsExpanded)}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-primary">
                    Recent Sessions
                  </h3>
                  <span className="text-xs text-gray-400">
                    ({sessions.length} total)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-surface-highlight text-xs text-gray-400 rounded-full">
                    {sessionsExpanded ? "Collapse" : "View all"}
                  </span>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transition-transform ${sessionsExpanded ? "rotate-90" : ""}`}
                  />
                </div>
              </div>

              {sessionsExpanded && (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full">
                    <thead className="bg-surface-highlight sticky top-0">
                      <tr>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                          Mentor
                        </th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                          Mentee
                        </th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                          Topic
                        </th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                          Date
                        </th>
                        <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.length > 0 ?
                        sessions.map((session) => (
                          <tr
                            key={session.id}
                            className="border-t border-border hover:bg-surface-highlight/50"
                          >
                            <td className="p-3 text-sm text-primary font-medium">
                              {session.mentor || "N/A"}
                            </td>
                            <td className="p-3 text-sm text-gray-400">
                              {session.intern || "N/A"}
                            </td>
                            <td className="p-3 text-sm text-gray-400 max-w-xs truncate">
                              {session.topic || "N/A"}
                            </td>
                            <td className="p-3 text-sm text-gray-400">
                              {session.session_date ?
                                new Date(
                                  session.session_date,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : session.scheduled_at ?
                                new Date(
                                  session.scheduled_at,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "N/A"}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  session.status === "completed" ?
                                    "bg-green-500/20 text-green-400"
                                  : session.status === "pending" ?
                                    "bg-yellow-500/20 text-yellow-500"
                                  : "bg-primary/20 text-primary"
                                }`}
                              >
                                {session.status || "scheduled"}
                              </span>
                            </td>
                          </tr>
                        ))
                      : <tr>
                          <td
                            colSpan={5}
                            className="p-8 text-center text-gray-500"
                          >
                            No sessions found
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              )}

              {!sessionsExpanded && sessions.length > 0 && (
                <div
                  className="p-3 border-t border-border cursor-pointer hover:bg-surface-highlight/30 flex items-center justify-center gap-2"
                  onClick={() => setSessionsExpanded(true)}
                >
                  <span className="text-xs text-gray-400">
                    Click to view all {sessions.length} sessions
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "errors" && (
          <div className="space-y-6">
            {/* Error Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={FileText}
                label="Total Errors"
                value={errorStats.total || 0}
                color="blue"
              />
              <StatCard
                icon={AlertTriangle}
                label="Open"
                value={errorStats.open || 0}
                color="yellow"
              />
              <StatCard
                icon={CheckCircle}
                label="Resolved"
                value={
                  errorStats.byType?.find((t) => t.error_type === "resolved")
                    ?.count || 0
                }
                color="green"
              />
              <StatCard
                icon={Activity}
                label="Ignored"
                value={
                  errorStats.byType?.find((t) => t.error_type === "ignored")
                    ?.count || 0
                }
                color="purple"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center justify-between bg-surface rounded-xl p-4 border border-border">
              <div className="flex gap-4 items-center">
                <select
                  value={errorFilter.status}
                  onChange={(e) =>
                    setErrorFilter({ ...errorFilter, status: e.target.value })
                  }
                  className="bg-background border border-border rounded-lg px-3 py-2 text-primary"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                  <option value="ignored">Ignored</option>
                </select>
                <select
                  value={errorFilter.type}
                  onChange={(e) =>
                    setErrorFilter({ ...errorFilter, type: e.target.value })
                  }
                  className="bg-background border border-border rounded-lg px-3 py-2 text-primary"
                >
                  <option value="all">All Types</option>
                  <option value="javascript">JavaScript</option>
                  <option value="api">API</option>
                  <option value="server">Server</option>
                  <option value="validation">Validation</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportErrorsToCSV}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition text-sm"
                  title="Export to CSV"
                >
                  <FileSpreadsheet size={16} /> CSV
                </button>
                <button
                  onClick={exportErrorsToJSON}
                  className="flex items-center gap-2 px-3 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition text-sm"
                  title="Export to JSON"
                >
                  <File size={16} /> JSON
                </button>
              </div>
            </div>

            {/* Errors Table */}
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              {selectedErrors.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-surface-highlight border-b border-border">
                  <span className="text-sm text-gray-400">
                    {selectedErrors.length} error(s) selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkStatusUpdate("resolved")}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition"
                    >
                      <Check size={14} /> Resolve
                    </button>
                    <button
                      onClick={() => handleBulkStatusUpdate("ignored")}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 transition"
                    >
                      Ignore
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              )}
              <table className="w-full">
                <thead className="bg-surface-highlight">
                  <tr>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase w-10"
                    >
                      <input
                        type="checkbox"
                        checked={
                          selectedErrors.length === errors.length &&
                          errors.length > 0
                        }
                        onChange={selectAllErrors}
                        className="w-4 h-4 rounded border-gray-600 bg-surface text-accent focus:ring-accent"
                        aria-label="Select all errors"
                      />
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Message
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Page
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="text-left p-3 text-xs font-medium text-gray-400 uppercase"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {errors.length > 0 ?
                    errors.map((error) => (
                      <tr
                        key={error.id}
                        className={`border-t border-border hover:bg-surface-highlight/50 ${
                          selectedErrors.includes(error.id) ? "bg-accent/5" : ""
                        }`}
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedErrors.includes(error.id)}
                            onChange={() => toggleSelectError(error.id)}
                            className="w-4 h-4 rounded border-gray-600 bg-surface text-accent focus:ring-accent"
                          />
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              error.error_type === "javascript" ?
                                "bg-yellow-500/20 text-yellow-500"
                              : error.error_type === "api" ?
                                "bg-red-500/20 text-red-400"
                              : error.error_type === "server" ?
                                "bg-secondary/20 text-secondary"
                              : "bg-primary/20 text-primary"
                            }`}
                          >
                            {error.error_type}
                          </span>
                        </td>
                        <td
                          className="p-3 text-sm text-primary max-w-xs truncate cursor-pointer hover:text-accent"
                          title="Click to view full error"
                          onClick={() => setSelectedError(error)}
                        >
                          {error.message?.substring(0, 50)}...
                        </td>
                        <td className="p-3 text-sm text-gray-400">
                          {error.page_url || "N/A"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              error.status === "open" ?
                                "bg-red-500/20 text-red-400"
                              : error.status === "resolved" ?
                                "bg-green-500/20 text-green-400"
                              : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {error.status}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-400">
                          {error.created_at ?
                            new Date(error.created_at).toLocaleDateString()
                          : "N/A"}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="text-sm text-primary">
                              {error.user_name || "Anonymous"}
                            </span>
                            {error.user_role && (
                              <span className="text-xs text-gray-500 uppercase">
                                {error.user_role}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            {error.status === "open" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleErrorStatusUpdate(
                                      error.id,
                                      "resolved",
                                    )
                                  }
                                  className="text-xs text-green-500 hover:text-green-400"
                                >
                                  Resolve
                                </button>
                                <button
                                  onClick={() =>
                                    handleErrorStatusUpdate(error.id, "ignored")
                                  }
                                  className="text-xs text-gray-500 hover:text-gray-400"
                                >
                                  Ignore
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleErrorDelete(error.id)}
                              className="text-xs text-red-500 hover:text-red-400"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  : <tr>
                      <td colSpan={7}>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <CheckCircle className="w-10 h-10 text-gray-600 mb-3" />
                          <p className="text-white font-semibold mb-1">
                            No errors found
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            {(
                              errorFilter.status === "all" &&
                              errorFilter.type === "all"
                            ) ?
                              "Your app is running clean"
                            : "Try adjusting your filters"}
                          </p>
                          {(errorFilter.status !== "all" ||
                            errorFilter.type !== "all") && (
                            <button
                              onClick={() =>
                                setErrorFilter({ status: "all", type: "all" })
                              }
                              className="px-3 py-1.5 text-sm bg-surface border border-border rounded-lg text-gray-400 hover:text-primary hover:border-accent/30 transition"
                            >
                              Clear Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {errorsPagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => loadErrors(errorsPagination.page - 1)}
                  disabled={errorsPagination.page === 1}
                  className="px-3 py-1 rounded bg-surface border border-border disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-gray-400">
                  Page {errorsPagination.page} of {errorsPagination.pages}
                </span>
                <button
                  onClick={() => loadErrors(errorsPagination.page + 1)}
                  disabled={errorsPagination.page === errorsPagination.pages}
                  className="px-3 py-1 rounded bg-surface border border-border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "system" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Active Sessions"
                value={activeSessions}
                subtext="Currently online"
                color="green"
              />
              <StatCard
                icon={Database}
                label="Database"
                value={
                  healthData?.database === "connected" ? "Healthy"
                  : healthData?.database === "disconnected" ?
                    "Error"
                  : "..."
                }
                color={healthData?.database === "connected" ? "green" : "red"}
              />
              <StatCard
                icon={Server}
                label="API Status"
                value={
                  healthData?.status === "ok" ? "Operational"
                  : healthData?.status === "error" ?
                    "Error"
                  : "..."
                }
                color={healthData?.status === "ok" ? "green" : "red"}
              />
              <StatCard
                icon={Settings}
                label="Last Check"
                value={
                  healthData?.timestamp ?
                    new Date(healthData.timestamp).toLocaleTimeString()
                  : "..."
                }
                color="blue"
              />
            </div>

            <div className="bg-surface rounded-xl border border-border p-5">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <BarChart3 className="text-accent" size={20} /> System Status
              </h3>
              {healthData ?
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                    <span className="text-primary">Database Connection</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        healthData.database === "connected" ?
                          "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                      }`}
                    >
                      {healthData.database}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                    <span className="text-primary">API Status</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        healthData.status === "ok" ?
                          "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                      }`}
                    >
                      {healthData.status}
                    </span>
                  </div>
                  {healthData.timestamp && (
                    <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                      <span className="text-primary">Last Checked</span>
                      <span className="text-primary">
                        {new Date(healthData.timestamp).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              : <div className="h-32 bg-surface-highlight/30 rounded flex items-center justify-center text-gray-500">
                  Loading system status...
                </div>
              }
            </div>

            {/* Recent Error Summary */}
            <div className="bg-surface rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <AlertTriangle className="text-yellow-500" size={20} /> Recent
                  Errors
                </h3>
                <button
                  onClick={() => setActiveTab("errors")}
                  className="text-sm text-accent hover:underline flex items-center gap-1"
                >
                  View All <ExternalLink size={14} />
                </button>
              </div>
              {recentErrors.length > 0 ?
                <div className="space-y-2">
                  {recentErrors.slice(0, 5).map((error) => (
                    <div
                      key={error.id}
                      className="p-3 bg-surface-highlight/30 rounded-lg flex items-center justify-between hover:bg-surface-highlight/50 cursor-pointer"
                      onClick={() => setActiveTab("errors")}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            error.error_type === "javascript" ?
                              "bg-yellow-500/20 text-yellow-500"
                            : error.error_type === "api" ?
                              "bg-red-500/20 text-red-400"
                            : error.error_type === "server" ?
                              "bg-secondary/20 text-secondary"
                            : "bg-primary/20 text-primary"
                          }`}
                        >
                          {error.error_type}
                        </span>
                        <span className="text-sm text-primary truncate max-w-md">
                          {error.message?.substring(0, 60)}...
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {error.created_at ?
                          new Date(error.created_at).toLocaleDateString()
                        : ""}
                      </span>
                    </div>
                  ))}
                </div>
              : <div className="h-24 bg-surface-highlight/30 rounded flex items-center justify-center text-gray-500">
                  No recent errors
                </div>
              }
            </div>

            {/* Platform Stats */}
            <div className="bg-surface rounded-xl border border-border p-5">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Info className="text-primary" size={20} /> Platform Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-surface-highlight/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {platformStats?.totalUsers || 0}
                  </p>
                  <p className="text-sm text-gray-400">Total Users</p>
                </div>
                <div className="p-3 bg-surface-highlight/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {platformStats?.totalProjects || 0}
                  </p>
                  <p className="text-sm text-gray-400">Total Projects</p>
                </div>
                <div className="p-3 bg-surface-highlight/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {platformStats?.totalSessions || 0}
                  </p>
                  <p className="text-sm text-gray-400">Total Sessions</p>
                </div>
                <div className="p-3 bg-surface-highlight/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {platformStats?.appVersion || "1.0.0"}
                  </p>
                  <p className="text-sm text-gray-400">App Version</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock size={14} />
                  <span>
                    Server Timezone: {platformStats?.timezone || "UTC"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Database size={14} />
                  <span>
                    DB Records:{" "}
                    {(platformStats?.totalUsers || 0) +
                      (platformStats?.totalProjects || 0) +
                      (platformStats?.totalSessions || 0) +
                      (platformStats?.totalErrors || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* General Settings - Left Column */}
            <div className="bg-surface rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-primary mb-6 flex items-center gap-2">
                <Settings className="text-accent" size={20} /> General Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) =>
                      setSettings({ ...settings, platformName: e.target.value })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, supportEmail: e.target.value })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) =>
                      setSettings({ ...settings, timezone: e.target.value })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New York</option>
                    <option value="America/Los_Angeles">
                      America/Los Angeles
                    </option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                  <div>
                    <span className="text-primary font-medium">
                      Allow User Registrations
                    </span>
                    <p className="text-xs text-gray-400">
                      Allow new users to sign up
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        allowRegistrations: !settings.allowRegistrations,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.allowRegistrations ? "bg-green-500" : (
                        "bg-gray-400"
                      )
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.allowRegistrations ? "translate-x-6" : (
                          "translate-x-1"
                        )
                      }`}
                    />
                  </button>
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition flex items-center gap-2"
                >
                  <Check size={18} /> Save Changes
                </button>
              </div>
            </div>

            {/* Feature Flags - Right Column */}
            <div className="bg-surface rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-primary mb-6 flex items-center gap-2">
                <Zap className="text-yellow-500" size={20} /> Feature Flags
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                  <div>
                    <span className="text-primary font-medium">
                      Enable Mentorship
                    </span>
                    <p className="text-xs text-gray-400">
                      Allow mentorship sessions
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFeatureFlags({
                        ...featureFlags,
                        enableMentorship: !featureFlags.enableMentorship,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      featureFlags.enableMentorship ? "bg-green-500" : (
                        "bg-gray-400"
                      )
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        featureFlags.enableMentorship ? "translate-x-6" : (
                          "translate-x-1"
                        )
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                  <div>
                    <span className="text-primary font-medium">
                      Enable Project Discovery
                    </span>
                    <p className="text-xs text-gray-400">
                      Show projects to all users
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFeatureFlags({
                        ...featureFlags,
                        enableProjectDiscovery:
                          !featureFlags.enableProjectDiscovery,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      featureFlags.enableProjectDiscovery ? "bg-green-500" : (
                        "bg-gray-400"
                      )
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        featureFlags.enableProjectDiscovery ? "translate-x-6"
                        : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                  <div>
                    <span className="text-primary font-medium">
                      Maintenance Mode
                    </span>
                    <p className="text-xs text-gray-400">
                      Restrict access to admins
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const newValue = !featureFlags.maintenanceMode;
                      try {
                        await updateMaintenanceSettings(
                          newValue,
                          maintenanceMessage,
                        );
                        setFeatureFlags({
                          ...featureFlags,
                          maintenanceMode: newValue,
                        });
                      } catch (err) {
                        console.error(
                          "Failed to update maintenance mode:",
                          err,
                        );
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      featureFlags.maintenanceMode ? "bg-red-500" : (
                        "bg-gray-400"
                      )
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        featureFlags.maintenanceMode ? "translate-x-6" : (
                          "translate-x-1"
                        )
                      }`}
                    />
                  </button>
                </div>
                {featureFlags.maintenanceMode && (
                  <div className="mt-2 p-3 bg-surface-highlight/30 rounded-lg">
                    <label className="block text-xs text-gray-400 mb-1">
                      Maintenance Message
                    </label>
                    <input
                      type="text"
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      onBlur={async () => {
                        try {
                          await updateMaintenanceSettings(
                            featureFlags.maintenanceMode,
                            maintenanceMessage,
                          );
                        } catch (err) {
                          console.error(
                            "Failed to update maintenance message:",
                            err,
                          );
                        }
                      }}
                      className="w-full px-3 py-2 bg-background border border-gray-600 rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
                      placeholder="Enter maintenance message..."
                    />
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                  <div>
                    <span className="text-primary font-medium">
                      Show Leaderboards
                    </span>
                    <p className="text-xs text-gray-400">
                      Display mentor/intern rankings
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFeatureFlags({
                        ...featureFlags,
                        showLeaderboards: !featureFlags.showLeaderboards,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      featureFlags.showLeaderboards ? "bg-green-500" : (
                        "bg-gray-400"
                      )
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        featureFlags.showLeaderboards ? "translate-x-6" : (
                          "translate-x-1"
                        )
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-surface rounded-xl border-2 border-red-500/30 p-6">
              <h3 className="text-lg font-semibold text-red-500 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} /> Danger Zone
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                These actions are irreversible. Please proceed with caution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    setConfirmModal({
                      open: true,
                      title: "Clear All Error Logs",
                      message:
                        "This will permanently delete all error logs. This action cannot be undone.",
                      onConfirm: async () => {
                        try {
                          const res = await fetch(`${API_BASE}/errors/clear`, {
                            method: "DELETE",
                            headers: getUserHeaders(),
                          });
                          if (res.ok) {
                            addToast("All error logs cleared", "success");
                            setErrorStats({ total: 0, open: 0, byType: [] });
                            setErrors([]);
                          } else {
                            addToast("Failed to clear error logs", "error");
                          }
                        } catch {
                          addToast("Failed to clear error logs", "error");
                        }
                        setConfirmModal({ ...confirmModal, open: false });
                      },
                    });
                  }}
                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2"
                >
                  <Trash2 size={18} /> Clear All Error Logs
                </button>
                <button
                  onClick={() => {
                    setConfirmModal({
                      open: true,
                      title: "Reset Demo Data",
                      message:
                        "This will delete ALL users, projects, and sessions and create fresh demo data. This cannot be undone.",
                      onConfirm: async () => {
                        try {
                          const res = await fetch(`${API_BASE}/admin/reset-demo`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ apiKey: "syncup-reset-key-2024" }),
                          });
                          const data = await res.json();
                          if (res.ok) {
                            addToast(`Demo data reset! Created: 1 admin, ${data.summary.mentors} mentors, ${data.summary.interns} interns, ${data.summary.projects} projects`, "success");
                          } else {
                            addToast(data.error || "Failed to reset demo data", "error");
                          }
                        } catch {
                          addToast("Failed to reset demo data", "error");
                        }
                        setConfirmModal({ ...confirmModal, open: false });
                      },
                    });
                  }}
                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2"
                >
                  <RefreshCw size={18} /> Reset Demo Data
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "invitations" && (
          <div className="space-y-6">
            <InvitationPanel />

            {/* Special Access Invitation Section */}
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="text-lg font-semibold mb-4">Special Access Invitation</h3>
              <p className="text-sm text-text-secondary mb-4">
                For verified ic.stars members who cannot access their @icstars.org email.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  className="input"
                  placeholder="Email address"
                  value={specialInvite.email}
                  onChange={e => setSpecialInvite(s => ({ ...s, email: e.target.value }))}
                />
                <select
                  className="input"
                  value={specialInvite.role}
                  onChange={e => setSpecialInvite(s => ({ ...s, role: e.target.value }))}
                >
                  <option value="alumni">Alumni</option>
                  <option value="resident">Resident</option>
                  <option value="intern">Intern</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <textarea
                className="input w-full mt-4"
                rows={3}
                placeholder="Verification note (required): Why does this person get special access?"
                value={specialInvite.note}
                onChange={e => setSpecialInvite(s => ({ ...s, note: e.target.value }))}
              />
              <button
                onClick={handleSpecialInvite}
                className="btn btn-secondary mt-4"
              >
                Send Special Invitation
              </button>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary">
                  Edit User
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-primary"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedUser.name}
                    id="editUserName"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={selectedUser.email}
                    id="editUserEmail"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Role
                  </label>
                  {/* REMOVE Mentor and Admin from role options */}
                  <select
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value)}
                    id="editUserRole"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  >
                    <option value="intern">Intern</option>
                    <option value="resident">Resident</option>
                    <option value="alumni">Alumni</option>
                  </select>

                  {/* ADD a separate Admin Access toggle below the role dropdown */}
                  <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg mt-3">
                    <div>
                      <span className="text-primary font-medium">Admin Access</span>
                      <p className="text-xs text-gray-400">
                        Grants access to Admin Dashboard. Only grant to iCAA governing body members.
                      </p>
                    </div>
                    <button
                      type="button"
                      id="editUserIsAdmin"
                      onClick={() => setEditUserIsAdmin((prev) => !prev)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        editUserIsAdmin ? "bg-[#b9123f]" : "bg-gray-400"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          editUserIsAdmin ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Cycle
                  </label>
                  {cycles.length > 0 ? (
                    <>
                      <select
                        value={editUserCycleId}
                        onChange={(e) => {
                          const selectedCycle = cycles.find(
                            (cycle) => String(cycle.id) === e.target.value,
                          );
                          setEditUserCycleId(e.target.value);
                          setEditUserCycleText(selectedCycle?.cycle_name || "");
                        }}
                        id="editUserCycle"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                      >
                        <option value="">No cycle assigned</option>
                        {cycles.map((cycle) => (
                          <option key={cycle.id} value={cycle.id}>
                            {cycle.cycle_name} - {cycle.status}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-400 mt-1">
                        Selecting a cycle sets both permanent cycle identity and
                        active intern-cycle enrollment.
                      </p>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={editUserCycleText}
                        onChange={(e) => setEditUserCycleText(e.target.value)}
                        id="editUserCycle"
                        placeholder="C-58"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Create cycles in the Cycles tab to use a safer dropdown.
                      </p>
                    </>
                  )}
                </div>
                {editUserRole === "intern" && (
                  <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                    <div>
                      <span className="text-primary font-medium">
                        Commence as Resident
                      </span>
                      <p className="text-xs text-gray-400">
                        Promotes this intern into the ICAA community and posts an introduction
                      </p>
                    </div>
                    <button
                      type="button"
                      id="editUserCommenced"
                      onClick={() => setEditUserCommenced((prev) => !prev)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        editUserCommenced ? "bg-accent" : "bg-gray-400"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          editUserCommenced ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                )}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Notes
                  </label>
                  <textarea
                    defaultValue={selectedUser.notes || selectedUser.bio || ""}
                    id="editUserNotes"
                    rows={3}
                    placeholder="Admin notes..."
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary placeholder-gray-500 resize-none"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                  <div>
                    <span className="text-primary font-medium">Ban User</span>
                    <p className="text-xs text-gray-400">
                      Set user as inactive
                    </p>
                  </div>
                  <button
                    type="button"
                    id="editUserBanned"
                    onClick={(e) => {
                      const btn = e.currentTarget;
                      btn.classList.toggle("bg-red-500");
                      btn.classList.toggle("bg-gray-400");
                      const span = btn.querySelector("span");
                      span.classList.toggle("translate-x-6");
                      span.classList.toggle("translate-x-1");
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      selectedUser.is_active === false ?
                        "bg-red-500"
                      : "bg-gray-400"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        selectedUser.is_active === false ?
                          "translate-x-6"
                        : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                {/* Password Reset Button */}
                <button
                  type="button"
                  onClick={() => handleAdminResetPassword(selectedUser.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-surface-highlight text-text-secondary rounded-lg text-sm hover:bg-border transition w-full justify-center"
                >
                  Generate Password Reset Link
                </button>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg text-primary hover:bg-surface-highlight"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const name =
                        document.getElementById("editUserName").value;
                      const email =
                        document.getElementById("editUserEmail").value;
                      const notes =
                        document.getElementById("editUserNotes").value;
                      const selectedCycle = cycles.find(
                        (cycle) => String(cycle.id) === editUserCycleId,
                      );
                      const cycle =
                        selectedCycle?.cycle_name ||
                        editUserCycleText.trim() ||
                        null;
                      const isActiveToggle =
                        document.getElementById("editUserBanned");
                      const isBanned =
                        isActiveToggle.classList.contains("bg-red-500");
                      const is_admin = editUserIsAdmin;

                      handleUpdateUser(selectedUser.id, {
                        name,
                        email,
                        role:
                          editUserRole === "intern" && editUserCommenced ?
                            "resident"
                          : editUserRole,
                        notes,
                        is_active: !isBanned,
                        cycle: cycle || null,
                        has_commenced:
                          editUserRole === "intern" ? editUserCommenced : true,
                        is_admin,  // ADD THIS
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Project Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary">
                  Edit Project
                </h3>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-primary"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedProject.name || selectedProject.title}
                    id="editProjectName"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    defaultValue={selectedProject.description || ""}
                    id="editProjectDescription"
                    rows={3}
                    placeholder="Project description..."
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary placeholder-gray-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Status
                  </label>
                  <select
                    defaultValue={selectedProject.status}
                    id="editProjectStatus"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-primary"
                  >
                    <option value="draft">Draft</option>
                    <option value="seeking_members">Seeking Members</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-highlight/30 rounded-lg">
                  <div>
                    <span className="text-primary font-medium">Featured</span>
                    <p className="text-xs text-gray-400">Show on homepage</p>
                  </div>
                  <button
                    type="button"
                    id="editProjectFeatured"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      selectedProject.is_featured ? "bg-yellow-500" : (
                        "bg-gray-400"
                      )
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        selectedProject.is_featured ? "translate-x-6" : (
                          "translate-x-1"
                        )
                      }`}
                    />
                  </button>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg text-primary hover:bg-surface-highlight"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const status =
                        document.getElementById("editProjectStatus").value;
                      handleUpdateProjectStatus(selectedProject.id, status);
                    }}
                    className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Detail Modal */}
        {selectedError && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary">
                    Error Details
                  </h3>
                  <p className="text-sm text-gray-400">
                    ID: {selectedError.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedError(null)}
                  className="text-gray-400 hover:text-primary"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      selectedError.error_type === "javascript" ?
                        "bg-yellow-500/20 text-yellow-500"
                      : selectedError.error_type === "api" ?
                        "bg-red-500/20 text-red-400"
                      : selectedError.error_type === "server" ?
                        "bg-secondary/20 text-secondary"
                      : "bg-primary/20 text-primary"
                    }`}
                  >
                    {selectedError.error_type}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      selectedError.status === "open" ?
                        "bg-red-500/20 text-red-400"
                      : selectedError.status === "resolved" ?
                        "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {selectedError.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Message
                  </label>
                  <p className="text-primary bg-surface-highlight p-3 rounded-lg">
                    {selectedError.message}
                  </p>
                </div>

                {selectedError.stack && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Stack Trace
                    </label>
                    <pre className="text-xs text-primary bg-surface-highlight p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                      {selectedError.stack}
                    </pre>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Page URL
                    </label>
                    <p className="text-primary text-sm">
                      {selectedError.page_url || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      User
                    </label>
                    <div className="flex flex-col">
                      <p className="text-primary text-sm">
                        {selectedError.user_name || "Anonymous"}
                      </p>
                      {selectedError.user_id && (
                        <p className="text-xs text-gray-500">
                          ID: {selectedError.user_id}
                          {selectedError.user_role &&
                            ` (${selectedError.user_role})`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    User Agent
                  </label>
                  <p className="text-primary text-xs bg-surface-highlight p-2 rounded-lg">
                    {selectedError.user_agent || "N/A"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Created
                    </label>
                    <p className="text-primary text-sm">
                      {selectedError.created_at ?
                        new Date(selectedError.created_at).toLocaleString()
                      : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Resolved
                    </label>
                    <p className="text-primary text-sm">
                      {selectedError.resolved_at ?
                        new Date(selectedError.resolved_at).toLocaleString()
                      : "Not resolved"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setSelectedError(null)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-primary hover:bg-surface-highlight"
                >
                  Close
                </button>
                {selectedError.status === "open" && (
                  <>
                    <button
                      onClick={() => {
                        handleErrorStatusUpdate(selectedError.id, "resolved");
                        setSelectedError(null);
                      }}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => {
                        handleErrorStatusUpdate(selectedError.id, "ignored");
                        setSelectedError(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Ignore
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

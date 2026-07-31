import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaShieldAlt,
  FaThLarge,
  FaUsers,
  FaChartBar,
  FaFileAlt,
  FaBuilding,
  FaBriefcase,
  FaMoneyBillWave,
  FaTasks,
  FaCalendarCheck,
  FaFileContract,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaGraduationCap,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaUserPlus,
  FaClipboardList,
  FaEnvelope,
  FaClipboard,
  FaChartLine,
  FaChartPie,
  FaHeadset,
  FaChalkboardTeacher,
  FaEye,
  FaUserTie,
  FaBars,
  FaTimes,
  FaTrash,
  FaCheckCircle,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaDownload,
  FaCalendarAlt,
  FaEdit,
  FaSearch as FaSearchIcon,
  FaPhoneAlt,
  FaBullseye,
  FaComments,
  FaLanguage,
  FaWaveSquare,
  FaArrowLeft,
  FaCircle,
} from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import styles from "./SuperAdminDashboard.module.css";
import { superAdminAPI } from "../../services/api";
import { getToken, getUser, clearAuth } from "../../services/auth";
import api from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { useSocketEvents } from "../../hooks/useSocketEvents";
import TrainerManagement from "../../pages/dashboard/AdminDashboard/TrannerManagement/TrainerManagement";
import Admission from "../../pages/dashboard/CounselorDashboard/Admission/Admission";
import CounselorManagement from "./CounselorManagement";

/* Sales Dashboard sub-modules */
import DashboardOverview from "../../pages/dashboard/SalesDashboard/DashboardOverview/DashboardOverview";
import CallsTracker from "../../pages/dashboard/SalesDashboard/CallsTracker/CallsTracker";
import LeadsManager from "../../pages/dashboard/SalesDashboard/LeadsManager/LeadsManager";
import SalesPipeline from "../../pages/dashboard/SalesDashboard/SalesPipeline/SalesPipeline";
import TargetsTracker from "../../pages/dashboard/SalesDashboard/TargetsTracker/TargetsTracker";
import ReportsAnalytics from "../../pages/dashboard/SalesDashboard/ReportsAnalytics/ReportsAnalytics";

/* Tasks & Admin (AdminDashboard) sub-modules */
import AdminDashboardOverview from "../../pages/dashboard/AdminDashboard/AdminDashboardOverview";
import AdminTrainerManagementContent from "../../pages/dashboard/AdminDashboard/AdminTrainerManagementContent";

/* HR Dashboard sub-modules */
import HRDashboardOverview from "../../pages/dashboard/HRDashboard/HRDashboardOverview";
import CompaniesManager from "../../pages/dashboard/HRDashboard/Companies/CompaniesManagement";
import InterviewsManager from "../../pages/dashboard/HRDashboard/HRInterview/hrInterviewManagement";
import HRStudents from "../../pages/dashboard/HRDashboard/HRstudent/hrStudentsManagement";
import PlacementDrives from "../../pages/dashboard/HRDashboard/PlacementDrive/PlacementDriveManagement";
import HRReportsAnalytics from "../../pages/dashboard/HRDashboard/Reports/hrReportsManagement";

/* Counselor Dashboard sub-modules */
import CounselorDashboardOverview from "../../pages/dashboard/CounselorDashboard/CounselorDashboardOverview";
import CounselorLeads from "../../pages/dashboard/CounselorDashboard/Leads/Leades";
import CounselorCalls from "../../pages/dashboard/CounselorDashboard/CallsCounsler/Calls";
import RevenueManagement from "../SuperAdminDashboard/RevenueManagement/RevenueManagement";
import Reports from "../SuperAdminDashboard/ReportsAnalytics/Reports";

/* ============================================================ */
/* MENU ITEMS
/* ============================================================ */
const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: FaThLarge },
  { id: "students", label: "Students", icon: FaUsers },
  { id: "counselor", label: "Counselor", icon: FaHeadset },
  // { id: "leads", label: "Leads", icon: FaChartBar },
  // { id: "placement", label: "Placement", icon: FaGraduationCap },
  { id: "hr", label: "HR & Placement Drive", icon: FaUserTie },
  { id: "sales", label: "Sales", icon: FaChartLine },
  { id: "revenue", label: "Revenue", icon: FaMoneyBillWave },
  { id: "reports", label: "Reports & Analytics", icon: FaFileContract },
  { id: "tasks", label: "Tasks & Admin", icon: FaTasks },
  { id: "employees", label: "Employee Monitoring", icon: FaEye },
  { id: "trainers", label: "Trainer & Batch", icon: FaChalkboardTeacher },
  // { id: "audit", label: "Audit Logs", icon: FaClipboard },
  // { id: "notifications", label: "Notifications", icon: FaBell },
  { id: "settings", label: "Settings", icon: FaCog },
];

/* Sub-menu items shown in the Sales dropdown */
const SALES_SUBMENU = [
  { id: "sales-dashboard", label: "Dashboard", icon: FaThLarge },
  { id: "sales-calls", label: "Calls Tracker", icon: FaPhoneAlt },
  { id: "sales-leads", label: "Leads Management", icon: FaClipboardList },
  { id: "sales-pipeline", label: "Sales Pipeline", icon: FaChartLine },
  { id: "sales-targets", label: "Targets", icon: FaBullseye },
  { id: "sales-reports", label: "Reports", icon: FaFileAlt },
];

/* Sub-menu items shown in the HR & Placement Drive dropdown */
const HR_SUBMENU = [
  { id: "hr-dashboard", label: "Dashboard", icon: FaThLarge },
  { id: "hr-companies", label: "Companies", icon: FaBuilding },
  {
    id: "hr-placement-drives",
    label: "Placement Drives",
    icon: FaCalendarCheck,
  },
  { id: "hr-students", label: "Students", icon: FaUsers },
  { id: "hr-interviews", label: "Interviews", icon: FaComments },
  { id: "hr-reports", label: "Reports", icon: FaChartBar },
  { id: "hr-tasks", label: "Tasks", icon: FaTasks },
  { id: "hr-meetings", label: "Meetings", icon: FaBriefcase },
];

/* Sub-menu items shown in the Tasks & Admin dropdown */
const TASKS_SUBMENU = [
  { id: "admin-dashboard", label: "Dashboard", icon: FaThLarge },
  { id: "admin-employees", label: "Employee Management", icon: FaUsers },
  {
    id: "admin-trainers",
    label: "Trainer Management",
    icon: FaChalkboardTeacher,
  },
  { id: "admin-sales", label: "Sales Team", icon: FaChartLine },
  { id: "admin-hr", label: "HR Management", icon: FaBuilding },
  {
    id: "admin-attendance",
    label: "Attendance Monitoring",
    icon: FaCalendarCheck,
  },
  { id: "admin-tasks", label: "Task Management", icon: FaTasks },
  { id: "admin-reports", label: "Reports", icon: FaFileAlt },
];

/* Sub-menu items shown in the Counselor dropdown */
const COUNSELOR_SUBMENU = [
  { id: "counselor-dashboard", label: "Dashboard", icon: FaThLarge },
  { id: "counselor-leads", label: "Leads", icon: FaChartBar },
  { id: "counselor-calls", label: "Calls", icon: FaPhoneAlt },
  { id: "counselor-admissions", label: "Admissions", icon: FaClipboardList },
  { id: "counselor-settings", label: "Settings", icon: FaCog },
];

// Placeholder component
const PlaceholderContent = ({ title }) => (
  <div className={styles.placeholderBox}>
    <div className={styles.placeholderIcon}>🚧</div>
    <h3>{title}</h3>
    <p>This module is under development</p>
    <p className={styles.placeholderHint}>Coming soon...</p>
  </div>
);

/* ============================================================ */
/* Small inline SVG "Weekly Activity" area/line chart
/* No chart library required - pure SVG so it drops in safely
/* ============================================================ */
const WeeklyActivityChart = () => {
  const width = 560;
  const height = 190;
  const paymentPoints = [40, 70, 55, 95, 80, 120, 100, 140, 118, 150, 130, 160];
  const expensePoints = [90, 60, 100, 70, 110, 85, 95, 75, 105, 80, 92, 70];
  const days = [
    "1",
    "3",
    "5",
    "7",
    "9",
    "11",
    "13",
    "15",
    "17",
    "19",
    "21",
    "23",
  ];

  const toPath = (points, close) => {
    const stepX = width / (points.length - 1);
    const coords = points.map((p, i) => [i * stepX, height - p]);
    let d = `M ${coords[0][0]},${coords[0][1]}`;
    for (let i = 1; i < coords.length; i++) {
      const [x0, y0] = coords[i - 1];
      const [x1, y1] = coords[i];
      const midX = (x0 + x1) / 2;
      d += ` C ${midX},${y0} ${midX},${y1} ${x1},${y1}`;
    }
    if (close) {
      d += ` L ${width},${height} L 0,${height} Z`;
    }
    return d;
  };

  return (
    <div className={styles.areaChartWrap}>
      <svg viewBox={`0 0 ${width} ${height + 24}`} width="100%" height="auto">
        <defs>
          <linearGradient id="paymentFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5fc98d" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#5fc98d" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1="0"
            x2={width}
            y1={height * f}
            y2={height * f}
            stroke="#ecebe5"
            strokeWidth="1"
          />
        ))}
        <path
          d={toPath(paymentPoints, true)}
          fill="url(#paymentFill)"
          stroke="none"
        />
        <path
          d={toPath(paymentPoints, false)}
          fill="none"
          stroke="#3fae72"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d={toPath(expensePoints, false)}
          fill="none"
          stroke="#f0806c"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="1 0"
          opacity="0.85"
        />
        {days.map((d, i) => (
          <text
            key={d}
            x={(width / (days.length - 1)) * i}
            y={height + 18}
            fontSize="10"
            fill="#97a0b3"
            textAnchor={
              i === 0 ? "start" : i === days.length - 1 ? "end" : "middle"
            }
          >
            {d}
          </text>
        ))}
      </svg>
    </div>
  );
};

/* ============================================================ */
/* Small inline SVG donut chart for a status breakdown
/* ============================================================ */
const StatusDonutChart = ({ segments, total }) => {
  const size = 128;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  return (
    <div className={styles.donutWrap}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f0eb"
          strokeWidth={stroke}
        />
        {segments.map((seg, i) => {
          const segLength = (seg.value / total) * circumference;
          const dashArray = `${segLength} ${circumference - segLength}`;
          const dashOffset = -offsetAcc;
          offsetAcc += segLength;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
      </svg>
      <div className={styles.donutCenter}>
        <span className={styles.donutValue}>{total}</span>
        <span className={styles.donutLabel}>Total Leads</span>
      </div>
    </div>
  );
};

// Dashboard Component
const DashboardContent = () => {
  const [stats, setStats] = useState({
    totalStudents: 1248,
    totalRevenue: "₹62.4L",
    placementRate: "74.2%",
    activeLeads: 482,
    totalCompanies: 156,
    avgRating: "4.8",
  });

  const statusSegments = [
    { label: "Converted", value: 305, color: "#5fc98d" },
    { label: "In Progress", value: 260, color: "#16213e" },
    { label: "Lost", value: 70, color: "#f0806c" },
  ];
  const statusTotal = statusSegments.reduce((a, b) => a + b.value, 0);

  return (
    <div className={styles.dashboardContent}>
      <div className={styles.welcomeSection}>
        <div>
          <h1 className={styles.welcomeTitle}>Welcome back, Admin!</h1>
          <p className={styles.welcomeSubtitle}>
            Here's what's happening with your institute today.
          </p>
        </div>
        <div className={styles.dateRange}>
          <FaCalendarAlt />
          <span>
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {[
          {
            label: "Total Students",
            value: stats.totalStudents,
            icon: FaUsers,
            color: "#5b8def",
          },
          {
            label: "Total Revenue",
            value: stats.totalRevenue,
            icon: FaMoneyBillWave,
            color: "#5fc98d",
          },
          {
            label: "Placement Rate",
            value: stats.placementRate,
            icon: FaGraduationCap,
            color: "#9b7ede",
          },
          {
            label: "Active Leads",
            value: stats.activeLeads,
            icon: FaChartBar,
            color: "#f2b84b",
          },
          {
            label: "Companies",
            value: stats.totalCompanies,
            icon: FaBuilding,
            color: "#5b8def",
          },
          {
            label: "Avg Rating",
            value: stats.avgRating,
            icon: FaStar,
            color: "#e88bb8",
          },
        ].map((stat, idx) => (
          <div key={idx} className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: `${stat.color}1f`, color: stat.color }}
            >
              <stat.icon size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly activity + status donut - mirrors the reference analytics layout */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartCardHead}>
            <div>
              <h3>
                <FaWaveSquare style={{ marginRight: 8, color: "#3fae72" }} />
                Daily Activity
              </h3>
              <span className={styles.chartCardSub}>
                Payments vs. expenses, this month
              </span>
            </div>
          </div>
          <div className={styles.chartLegend}>
            <span className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ background: "#3fae72" }}
              />{" "}
              Payment
            </span>
            <span className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ background: "#f0806c" }}
              />{" "}
              Expenses
            </span>
          </div>
          <WeeklyActivityChart />
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartCardHead}>
            <div>
              <h3>
                <FaChartPie style={{ marginRight: 8, color: "#3fae72" }} />
                Leads Status
              </h3>
              <span className={styles.chartCardSub}>
                Current pipeline breakdown
              </span>
            </div>
          </div>
          <div className={styles.donutRow}>
            <StatusDonutChart segments={statusSegments} total={statusTotal} />
            <div className={styles.donutLegend}>
              {statusSegments.map((seg) => (
                <div key={seg.label} className={styles.donutLegendItem}>
                  <span className={styles.donutLegendLeft}>
                    <span
                      className={styles.legendDot}
                      style={{ background: seg.color }}
                    />
                    {seg.label}
                  </span>
                  <span className={styles.donutLegendValue}>{seg.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <h3>Recent Activities</h3>
          <div className={styles.activityList}>
            {[
              {
                text: "New student Rahul Sharma enrolled in Full Stack course",
                time: "2 hours ago",
                icon: "👨‍🎓",
              },
              {
                text: "Placement drive scheduled with TCS",
                time: "5 hours ago",
                icon: "🏢",
              },
              {
                text: "Revenue target achieved for this month",
                time: "1 day ago",
                icon: "💰",
              },
              {
                text: "New trainer joined the team",
                time: "2 days ago",
                icon: "👨‍🏫",
              },
            ].map((activity, idx) => (
              <div key={idx} className={styles.activityItem}>
                <div className={styles.activityIcon}>{activity.icon}</div>
                <div className={styles.activityContent}>
                  <p>{activity.text}</p>
                  <span>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.chartCard}>
          <h3>Quick Actions</h3>
          <div className={styles.quickActions}>
            <button className={styles.quickActionBtn}>
              <FaUserPlus /> Add Student
            </button>
            <button className={styles.quickActionBtn}>
              <FaBuilding /> Add Company
            </button>
            <button className={styles.quickActionBtn}>
              <FaChartLine /> View Reports
            </button>
            <button className={styles.quickActionBtn}>
              <FaCalendarCheck /> Schedule Drive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Friendly page title shown in the header (mirrors the reference design's
// "Analytics Overview" style heading rather than a raw menu id).
const getPageTitle = (menu) => {
  if (menu.startsWith("sales")) return "Sales Overview";
  if (menu.startsWith("hr")) return "HR & Placement";
  if (menu.startsWith("admin") || menu === "tasks") return "Tasks & Admin";
  if (menu.startsWith("counselor")) return "Counselor Overview";

  switch (menu) {
    case "dashboard":
      return "Analytics Overview";
    case "students":
      return "Students";
    case "revenue":
      return "RevenueManagement";
    case "reports":
      return "Reports & Analytics";
    case "employees":
      return "Employee Monitoring";
    case "trainers":
      return "Trainer & Batch";
    case "notifications":
      return "Notifications";
    case "settings":
      return "Settings";
    default:
      return "Dashboard";
  }
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [activeLang, setActiveLang] = useState("EN");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Sales dropdown states
  const [salesDropdownOpen, setSalesDropdownOpen] = useState(false);
  const [salesDropdownPos, setSalesDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const salesItemRef = useRef(null);
  const salesCloseTimeout = useRef(null);

  // HR & Placement Drive dropdown states
  const [hrDropdownOpen, setHrDropdownOpen] = useState(false);
  const [hrDropdownPos, setHrDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const hrItemRef = useRef(null);
  const hrCloseTimeout = useRef(null);

  // Tasks & Admin dropdown states
  const [tasksDropdownOpen, setTasksDropdownOpen] = useState(false);
  const [tasksDropdownPos, setTasksDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const tasksItemRef = useRef(null);
  const tasksCloseTimeout = useRef(null);

  // Counselor dropdown states
  const [counselorDropdownOpen, setCounselorDropdownOpen] = useState(false);
  const [counselorDropdownPos, setCounselorDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const counselorItemRef = useRef(null);
  const counselorCloseTimeout = useRef(null);

  // Panel States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState({});
  const [conversations, setConversations] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showNewChatList, setShowNewChatList] = useState(false);
  const [typingFrom, setTypingFrom] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const { isConnected, reconnectSocket } = useSocket();

  // User Management States
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "sales_executive",
    department: "sales",
    phone: "",
    isActive: true,
  });

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      if (res.data.success) {
        setNotifications(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // ─── SOCKET.IO: live notifications ───────────────────────────────
  const handleNewNotification = React.useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    toast(notification.title, { icon: "🔔" });
  }, []);

  const handleNotificationRead = React.useCallback((data) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === data.notificationId ? { ...n, read: true } : n,
      ),
    );
  }, []);

  const { emit } = useSocketEvents({
    onNewNotification: handleNewNotification,
    onNotificationRead: handleNotificationRead,
    onNewMessage: (message) => {
      // Use stable string IDs throughout — MongoDB ObjectId vs string
      // mismatches are the root cause of wrong-side bubble rendering.
      // Backend emits new-message ONLY to receiver's room.
      // We need to handle both cases: we sent it (sender echo) or we received it.
      const senderId = String(message.sender?._id || message.sender);
      const receiverId = String(message.receiver?._id || message.receiver);
      const myId = String(getUser()?._id || getUser()?.id || "");

      // If we are the sender, skip — we already added it via the REST response
      if (senderId === myId) return;

      // We are the receiver — the other party is the sender
      const otherUserId = senderId;

      // If that thread is currently open, append it straight into the view.
      setSelectedChat((current) => {
        if (current && String(current._id) === otherUserId) {
          setChatHistory((prev) => ({
            ...prev,
            [otherUserId]: [...(prev[otherUserId] || []), message],
          }));
          api.put(`/messages/${message._id}/read`).catch(() => {});
        }
        return current;
      });

      // Update conversation list preview inline — no full refetch needed.
      setConversations((prev) => {
        const exists = prev.find((c) => String(c.user?._id) === otherUserId);
        if (exists) {
          return prev.map((c) =>
            String(c.user?._id) === otherUserId
              ? {
                  ...c,
                  lastMessage: message,
                  unreadCount: (c.unreadCount || 0) + 1,
                }
              : c,
          );
        }
        // New conversation partner — trigger a background refresh once.
        fetchConversations();
        return prev;
      });

      // Always toast since we are the receiver
      toast(`${message.sender?.name || "New message"}: ${message.text}`, {
        icon: "💬",
      });
    },
    onMessageRead: (data) => {
      if (!data.conversationWith && !data.messageId) return;
      setChatHistory((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = updated[key].map((m) =>
            m._id === data.messageId || data.all ? { ...m, read: true } : m,
          );
        });
        return updated;
      });
    },
    onTyping: (data) => {
      setTypingFrom(data.senderId);
    },
    onStopTyping: () => {
      setTypingFrom(null);
    },
    onUserOnline: (data) => {
      setOnlineUserIds((prev) =>
        prev.includes(data.userId) ? prev : [...prev, data.userId],
      );
    },
    onUserOffline: (data) => {
      setOnlineUserIds((prev) => prev.filter((id) => id !== data.userId));
    },
    onOnlineUsers: (data) => {
      setOnlineUserIds(data.userIds || []);
    },
  });

  const fetchConversations = async () => {
    try {
      const res = await api.get("/messages/conversations");
      if (res.data.success) {
        setConversations(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    const token = getToken();
    const parsedUser = getUser();

    if (!token || !parsedUser) {
      navigate("/super-admin-login");
      return;
    }

    if (parsedUser.role !== "super_admin") {
      navigate("/super-admin-login");
      return;
    }

    setUser(parsedUser);
    setIsLoading(false);
    fetchUsers();
    fetchNotifications();
    fetchConversations();
  }, []);

  // Cleanup dropdown timeouts on unmount
  useEffect(() => {
    return () => {
      if (salesCloseTimeout.current) clearTimeout(salesCloseTimeout.current);
      if (hrCloseTimeout.current) clearTimeout(hrCloseTimeout.current);
      if (tasksCloseTimeout.current) clearTimeout(tasksCloseTimeout.current);
      if (counselorCloseTimeout.current)
        clearTimeout(counselorCloseTimeout.current);
    };
  }, []);

  // Lock body scroll while the mobile sidebar drawer is open, and
  // close it automatically if the viewport is resized back to desktop.
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        if (mobileMenuOpen) setMobileMenuOpen(false);
        if (mobileSearchOpen) setMobileSearchOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen, mobileSearchOpen]);

  // Fetch all users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await superAdminAPI.getUsers();
      if (response.data.success) {
        setUsers(response.data.data.users);
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      if (error.response?.status !== 401) {
        toast.error("Failed to fetch users");
      }
    } finally {
      setUsersLoading(false);
    }
  };

  // Create/Update/Delete User Functions
  const openCreateUserModal = () => {
    setEditingUser(null);
    setUserFormData({
      name: "",
      email: "",
      password: "",
      role: "sales_executive",
      department: "sales",
      phone: "",
      isActive: true,
    });
    setShowUserModal(true);
  };

  const openEditUserModal = (user) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      department: user.department || "sales",
      phone: user.phone || "",
      isActive: user.isActive,
    });
    setShowUserModal(true);
  };

  const handleUserFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setUsersLoading(true);
    try {
      let response;
      if (editingUser) {
        const updateData = {
          name: userFormData.name,
          email: userFormData.email,
          role: userFormData.role,
          department: userFormData.department,
          phone: userFormData.phone,
          isActive: userFormData.isActive,
        };
        if (userFormData.password) updateData.password = userFormData.password;
        response = await superAdminAPI.updateUser(editingUser._id, updateData);
        toast.success("User updated successfully");
      } else {
        response = await superAdminAPI.createUser(userFormData);
        toast.success("User created successfully");
      }
      if (response.data.success) {
        setShowUserModal(false);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        const response = await superAdminAPI.deleteUser(userId);
        if (response.data.success) {
          toast.success("User deleted successfully");
          fetchUsers();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole =
      userRoleFilter === "all" || user.role === userRoleFilter;
    return matchesSearch && matchesRole && user.role !== "super_admin";
  });

  const handleLogout = () => {
    clearAuth();
    if (reconnectSocket) reconnectSocket(null);
    toast.success("Logged out successfully");
    navigate("/super-admin-login");
  };

  /* ---------------- SALES DROPDOWN HANDLERS ---------------- */
  const openSalesDropdown = () => {
    if (salesCloseTimeout.current) clearTimeout(salesCloseTimeout.current);
    if (salesItemRef.current) {
      const rect = salesItemRef.current.getBoundingClientRect();
      setSalesDropdownPos({
        top: rect.bottom + 6,
        left: sidebarCollapsed ? rect.right + 8 : rect.left,
        width: Math.max(rect.width, 220),
      });
    }
    setSalesDropdownOpen(true);
  };

  const scheduleCloseSalesDropdown = () => {
    salesCloseTimeout.current = setTimeout(
      () => setSalesDropdownOpen(false),
      200,
    );
  };

  const cancelCloseSalesDropdown = () => {
    if (salesCloseTimeout.current) clearTimeout(salesCloseTimeout.current);
  };

  const handleSalesClick = () => {
    if (!activeMenu.startsWith("sales-")) {
      setActiveMenu("sales-dashboard");
    }
    openSalesDropdown();
  };

  const handleSalesSubmenuClick = (id) => {
    setActiveMenu(id);
    setSalesDropdownOpen(false);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };
  /* ----------------------------------------------------------- */

  /* ---------------- HR & PLACEMENT DROPDOWN HANDLERS ---------------- */
  const openHrDropdown = () => {
    if (hrCloseTimeout.current) clearTimeout(hrCloseTimeout.current);
    if (hrItemRef.current) {
      const rect = hrItemRef.current.getBoundingClientRect();
      setHrDropdownPos({
        top: rect.bottom + 6,
        left: sidebarCollapsed ? rect.right + 8 : rect.left,
        width: Math.max(rect.width, 220),
      });
    }
    setHrDropdownOpen(true);
  };

  const scheduleCloseHrDropdown = () => {
    hrCloseTimeout.current = setTimeout(() => setHrDropdownOpen(false), 200);
  };

  const cancelCloseHrDropdown = () => {
    if (hrCloseTimeout.current) clearTimeout(hrCloseTimeout.current);
  };

  const handleHrClick = () => {
    if (!activeMenu.startsWith("hr-")) {
      setActiveMenu("hr-dashboard");
    }
    openHrDropdown();
  };

  const handleHrSubmenuClick = (id) => {
    setActiveMenu(id);
    setHrDropdownOpen(false);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };
  /* ----------------------------------------------------------- */

  /* ---------------- TASKS & ADMIN DROPDOWN HANDLERS ---------------- */
  const openTasksDropdown = () => {
    if (tasksCloseTimeout.current) clearTimeout(tasksCloseTimeout.current);
    if (tasksItemRef.current) {
      const rect = tasksItemRef.current.getBoundingClientRect();
      setTasksDropdownPos({
        top: rect.bottom + 6,
        left: sidebarCollapsed ? rect.right + 8 : rect.left,
        width: Math.max(rect.width, 220),
      });
    }
    setTasksDropdownOpen(true);
  };

  const scheduleCloseTasksDropdown = () => {
    tasksCloseTimeout.current = setTimeout(
      () => setTasksDropdownOpen(false),
      200,
    );
  };

  const cancelCloseTasksDropdown = () => {
    if (tasksCloseTimeout.current) clearTimeout(tasksCloseTimeout.current);
  };

  const handleTasksClick = () => {
    if (!activeMenu.startsWith("admin-")) {
      setActiveMenu("admin-dashboard");
    }
    openTasksDropdown();
  };

  const handleTasksSubmenuClick = (id) => {
    setActiveMenu(id);
    setTasksDropdownOpen(false);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };
  /* ----------------------------------------------------------- */

  /* ---------------- COUNSELOR DROPDOWN HANDLERS ---------------- */
  const openCounselorDropdown = () => {
    if (counselorCloseTimeout.current)
      clearTimeout(counselorCloseTimeout.current);
    if (counselorItemRef.current) {
      const rect = counselorItemRef.current.getBoundingClientRect();
      setCounselorDropdownPos({
        top: rect.bottom + 6,
        left: sidebarCollapsed ? rect.right + 8 : rect.left,
        width: Math.max(rect.width, 220),
      });
    }
    setCounselorDropdownOpen(true);
  };

  const scheduleCloseCounselorDropdown = () => {
    counselorCloseTimeout.current = setTimeout(
      () => setCounselorDropdownOpen(false),
      200,
    );
  };

  const cancelCloseCounselorDropdown = () => {
    if (counselorCloseTimeout.current)
      clearTimeout(counselorCloseTimeout.current);
  };

  const handleCounselorClick = () => {
    if (!activeMenu.startsWith("counselor-")) {
      setActiveMenu("counselor-dashboard");
    }
    openCounselorDropdown();
  };

  const handleCounselorSubmenuClick = (id) => {
    setActiveMenu(id);
    setCounselorDropdownOpen(false);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };
  /* ----------------------------------------------------------- */

  // Closing the mobile drawer whenever a top-level (non-dropdown) item is picked
  const handleMenuSelect = (id) => {
    setActiveMenu(id);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  // ✅ Complete renderContent with all cases
  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <DashboardContent />;

      case "students":
        return <Admission />;

      /* -------- Counselor sub-modules -------- */
      case "counselor":
      case "counselor-dashboard":
        return <CounselorDashboardOverview />;

      case "counselor-leads":
        return <CounselorLeads />;

      case "counselor-calls":
        return <CounselorCalls />;

      case "counselor-admissions":
        return <Admission />;

      case "counselor-settings":
        return <PlaceholderContent title="Settings" />;
      /* ---------------------------------------------- */

      case "leads":
        return <PlaceholderContent title="Lead Management" />;

      case "placement":
        return <PlaceholderContent title="Placement Management" />;

      /* -------- HR & Placement Drive sub-modules -------- */
      case "hr":
      case "hr-dashboard":
        return <HRDashboardOverview />;

      case "hr-companies":
        return <CompaniesManager />;

      case "hr-placement-drives":
        return <PlacementDrives />;

      case "hr-students":
        return <HRStudents />;

      case "hr-interviews":
        return <InterviewsManager />;

      case "hr-reports":
        return <HRReportsAnalytics />;

      case "hr-tasks":
        return <PlaceholderContent title="Tasks" />;

      case "hr-meetings":
        return <PlaceholderContent title="Meetings" />;
      /* ---------------------------------------------- */

      /* -------- Sales Dashboard sub-modules -------- */
      case "sales":
      case "sales-dashboard":
        return <DashboardOverview />;

      case "sales-calls":
        return <CallsTracker />;

      case "sales-leads":
        return <LeadsManager />;

      case "sales-pipeline":
        return <SalesPipeline />;

      case "sales-targets":
        return <TargetsTracker />;

      case "sales-reports":
        return <ReportsAnalytics />;
      /* ---------------------------------------------- */

      case "revenue":
        return <RevenueManagement />;

      case "reports":
        return <Reports />;

      /* -------- Tasks & Admin (AdminDashboard) sub-modules -------- */
      case "tasks":
      case "admin-dashboard":
        return <AdminDashboardOverview />;

      case "admin-employees":
        return <PlaceholderContent title="Employee Management" />;

      case "admin-trainers":
        return <AdminTrainerManagementContent />;

      case "admin-sales":
        return <PlaceholderContent title="Sales Team" />;

      case "admin-hr":
        return <PlaceholderContent title="HR Management" />;

      case "admin-attendance":
        return <PlaceholderContent title="Attendance Monitoring" />;

      case "admin-tasks":
        return <PlaceholderContent title="Task Management" />;

      case "admin-reports":
        return <PlaceholderContent title="Reports" />;
      /* ---------------------------------------------- */

      case "employees":
        return (
          <div className={styles.userManagement}>
            <div className={styles.userHeader}>
              <div>
                <h2 className={styles.sectionTitle}>
                  <FaUsers /> Employee Monitoring
                </h2>
                <p className={styles.sectionSubtitle}>
                  Manage all system users
                </p>
              </div>
              <button
                className={styles.createUserBtn}
                onClick={openCreateUserModal}
              >
                <FaUserPlus /> Create New User
              </button>
            </div>

            <div className={styles.userFilters}>
              <div className={styles.searchBox}>
                <FaSearchIcon />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <select
                className={styles.filterSelect}
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin_manager">Admin Manager</option>
                <option value="sales_executive">Sales Executive</option>
                <option value="hr_executive">HR Executive</option>
                <option value="trainer">Trainer</option>
                <option value="counselor">Counselor</option>
              </select>
            </div>

            <div className={styles.userTable}>
              <table className={styles.userTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{ textAlign: "center", padding: "40px" }}
                      >
                        <FaSpinner className={styles.spinner} /> Loading
                        users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{ textAlign: "center", padding: "40px" }}
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <strong>{user.name}</strong>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={styles.roleBadge}>
                            {user.role === "admin_manager"
                              ? "Admin Manager"
                              : user.role === "sales_executive"
                                ? "Sales Executive"
                                : user.role === "hr_executive"
                                  ? "HR Executive"
                                  : user.role === "trainer"
                                    ? "Trainer"
                                    : user.role === "counselor"
                                      ? "Counselor"
                                      : user.role}
                          </span>
                        </td>
                        <td>{user.department || "-"}</td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${user.isActive ? styles.statusActive : styles.statusInactive}`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className={styles.userActions}>
                          <button onClick={() => openEditUserModal(user)}>
                            <FaEdit />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteUser(user._id, user.name)
                            }
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "trainers":
        return <TrainerManagement />;

      case "audit":
        return <PlaceholderContent title="Audit Logs" />;

      case "notifications":
        return <PlaceholderContent title="Notifications" />;

      case "settings":
        return <PlaceholderContent title="Settings" />;

      default:
        return <DashboardContent />;
    }
  };

  // Notification Functions
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showMessages) setShowMessages(false);
  };

  const toggleMessages = () => {
    setShowMessages(!showMessages);
    if (showNotifications) setShowNotifications(false);
    if (!showMessages) {
      setSelectedChat(null);
      setShowNewChatList(false);
      fetchConversations();
    }
  };

  const closePanels = () => {
    setShowNotifications(false);
    setShowMessages(false);
    setSelectedChat(null);
  };

  const openChat = async (chatUser) => {
    // Normalise _id to plain string to prevent ObjectId vs string comparison
    // mismatches in the isMine check and chatHistory keying.
    const normalised = { ...chatUser, _id: String(chatUser._id) };
    setSelectedChat(normalised);
    setShowNewChatList(false);

    const chatId = String(chatUser._id);

    // Fetch the thread if we don't already have it cached
    if (!chatHistory[chatId]) {
      setChatLoading(true);
      try {
        const res = await api.get(`/messages/${chatId}`);
        if (res.data.success) {
          setChatHistory((prev) => ({
            ...prev,
            [chatId]: res.data.data || [],
          }));
        }
      } catch (error) {
        console.error("Error fetching chat thread:", error);
        toast.error("Failed to load messages");
      } finally {
        setChatLoading(false);
      }
    }

    // Mark any unread messages from this person as read
    try {
      await api.put(`/messages/read-all/${chatId}`);
      setConversations((prev) =>
        prev.map((c) =>
          String(c.user?._id) === chatId ? { ...c, unreadCount: 0 } : c,
        ),
      );
    } catch (error) {
      console.error("Error marking messages read:", error);
    }
  };

  const typingTimeoutRef = useRef(null);
  const handleTypingInput = (value) => {
    setNewMessage(value);
    if (!selectedChat) return;
    emit("typing", { receiverId: selectedChat._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emit("stop-typing", { receiverId: selectedChat._id });
    }, 1500);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const text = newMessage.trim();
    setNewMessage("");
    emit("stop-typing", { receiverId: selectedChat._id });

    try {
      const res = await api.post("/messages", {
        receiverId: selectedChat._id,
        text,
      });
      if (res.data.success) {
        // Append the message we just sent (from REST response).
        // The socket server NO LONGER echoes new-message back to sender
        // so this is the only place it gets added — no duplicates.
        const chatId = String(selectedChat._id);
        setChatHistory((prev) => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), res.data.data],
        }));
        // Update conversation preview without a full refetch.
        setConversations((prev) => {
          const exists = prev.find((c) => String(c.user?._id) === chatId);
          if (exists) {
            return prev.map((c) =>
              String(c.user?._id) === chatId
                ? { ...c, lastMessage: res.data.data }
                : c,
            );
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n._id !== id));
    toast.success("Notification deleted");
  };

  const markNotificationAsRead = async (id) => {
    setNotifications(
      notifications.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.put("/notifications/read-all");
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const unreadMessageCount = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0,
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div
      className={`${styles.app} ${sidebarCollapsed ? styles.appCollapsed : ""}`}
    >
      {/* Overlay for panels */}
      {(showNotifications || showMessages) && (
        <div className={styles.panelOverlay} onClick={closePanels}></div>
      )}

      {/* Overlay + backdrop for the MOBILE sidebar drawer */}
      {mobileMenuOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* SALES DROPDOWN (fixed positioned, escapes sidebar overflow) */}
      {salesDropdownOpen && (
        <div
          className={styles.salesDropdown}
          style={{ top: salesDropdownPos.top, left: salesDropdownPos.left }}
          onMouseEnter={cancelCloseSalesDropdown}
          onMouseLeave={scheduleCloseSalesDropdown}
        >
          {SALES_SUBMENU.map((sub) => (
            <button
              key={sub.id}
              className={`${styles.salesDropdownItem} ${activeMenu === sub.id ? styles.salesDropdownItemActive : ""}`}
              onClick={() => handleSalesSubmenuClick(sub.id)}
            >
              <sub.icon className={styles.salesDropdownIcon} />
              <span>{sub.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* HR & PLACEMENT DRIVE DROPDOWN (fixed positioned, escapes sidebar overflow) */}
      {hrDropdownOpen && (
        <div
          className={styles.salesDropdown}
          style={{ top: hrDropdownPos.top, left: hrDropdownPos.left }}
          onMouseEnter={cancelCloseHrDropdown}
          onMouseLeave={scheduleCloseHrDropdown}
        >
          {HR_SUBMENU.map((sub) => (
            <button
              key={sub.id}
              className={`${styles.salesDropdownItem} ${activeMenu === sub.id ? styles.salesDropdownItemActive : ""}`}
              onClick={() => handleHrSubmenuClick(sub.id)}
            >
              <sub.icon className={styles.salesDropdownIcon} />
              <span>{sub.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* TASKS & ADMIN DROPDOWN (fixed positioned, escapes sidebar overflow) */}
      {tasksDropdownOpen && (
        <div
          className={styles.salesDropdown}
          style={{ top: tasksDropdownPos.top, left: tasksDropdownPos.left }}
          onMouseEnter={cancelCloseTasksDropdown}
          onMouseLeave={scheduleCloseTasksDropdown}
        >
          {TASKS_SUBMENU.map((sub) => (
            <button
              key={sub.id}
              className={`${styles.salesDropdownItem} ${activeMenu === sub.id ? styles.salesDropdownItemActive : ""}`}
              onClick={() => handleTasksSubmenuClick(sub.id)}
            >
              <sub.icon className={styles.salesDropdownIcon} />
              <span>{sub.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* COUNSELOR DROPDOWN (fixed positioned, escapes sidebar overflow) */}
      {counselorDropdownOpen && (
        <div
          className={styles.salesDropdown}
          style={{
            top: counselorDropdownPos.top,
            left: counselorDropdownPos.left,
          }}
          onMouseEnter={cancelCloseCounselorDropdown}
          onMouseLeave={scheduleCloseCounselorDropdown}
        >
          {COUNSELOR_SUBMENU.map((sub) => (
            <button
              key={sub.id}
              className={`${styles.salesDropdownItem} ${activeMenu === sub.id ? styles.salesDropdownItemActive : ""}`}
              onClick={() => handleCounselorSubmenuClick(sub.id)}
            >
              <sub.icon className={styles.salesDropdownIcon} />
              <span>{sub.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* NOTIFICATION PANEL */}
      <div
        className={`${styles.slidePanel} ${showNotifications ? styles.slidePanelOpen : ""}`}
      >
        <div className={styles.panelHeader}>
          <h3>
            <FaBell /> Notifications
            {unreadCount > 0 && (
              <span className={styles.notifHeaderBadge}>{unreadCount}</span>
            )}
          </h3>
          <div className={styles.panelHeaderActions}>
            <span
              className={
                isConnected ? styles.liveStatusOn : styles.liveStatusOff
              }
            >
              {isConnected ? "● Live" : "● Offline"}
            </span>
            {unreadCount > 0 && (
              <button
                className={styles.panelMarkAllBtn}
                onClick={markAllNotificationsAsRead}
                title="Mark all as read"
              >
                <FaCheckCircle />
              </button>
            )}
            <button className={styles.panelClose} onClick={toggleNotifications}>
              <FaTimes />
            </button>
          </div>
        </div>
        <div className={styles.panelContent}>
          {notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <FaBell size={40} />
              <p>No notifications</p>
            </div>
          ) : (
            <div className={styles.notifItemList}>
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`${styles.notifItem} ${!n.read ? styles.notifItemUnread : ""}`}
                >
                  <div
                    className={styles.notifItemBody}
                    onClick={() => !n.read && markNotificationAsRead(n._id)}
                  >
                    <span className={styles.notifItemTitle}>{n.title}</span>
                    <span className={styles.notifItemMsg}>{n.message}</span>
                  </div>
                  <button
                    className={styles.notifItemDelete}
                    onClick={() => deleteNotification(n._id)}
                    title="Delete"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MESSAGE PANEL */}
      <div
        className={`${styles.slidePanel} ${showMessages ? styles.slidePanelOpen : ""}`}
      >
        <div className={styles.panelHeader}>
          {selectedChat ? (
            <h3>
              <button
                className={styles.chatBackBtn}
                onClick={() => setSelectedChat(null)}
              >
                <FaArrowLeft />
              </button>
              {selectedChat.name}
              {onlineUserIds.includes(selectedChat._id) && (
                <FaCircle className={styles.onlineDot} />
              )}
            </h3>
          ) : (
            <h3>
              <FaEnvelope /> Messages
              {unreadMessageCount > 0 && (
                <span className={styles.notifHeaderBadge}>
                  {unreadMessageCount}
                </span>
              )}
            </h3>
          )}
          <div className={styles.panelHeaderActions}>
            <span
              className={
                isConnected ? styles.liveStatusOn : styles.liveStatusOff
              }
            >
              {isConnected ? "● Live" : "● Offline"}
            </span>
            {!selectedChat && (
              <button
                className={styles.panelMarkAllBtn}
                onClick={() => setShowNewChatList((s) => !s)}
                title="New chat"
              >
                <FaUserPlus />
              </button>
            )}
            <button className={styles.panelClose} onClick={toggleMessages}>
              <FaTimes />
            </button>
          </div>
        </div>

        <div className={styles.panelContent}>
          {/* ─── ACTIVE CHAT THREAD ─── */}
          {selectedChat ? (
            <div className={styles.chatThreadWrapper}>
              <div className={styles.chatThreadMessages}>
                {chatLoading ? (
                  <div className={styles.emptyState}>
                    <FaSpinner className={styles.spinIcon} />
                    <p>Loading conversation...</p>
                  </div>
                ) : (chatHistory[selectedChat._id] || []).length === 0 ? (
                  <div className={styles.emptyState}>
                    <FaEnvelope size={32} />
                    <p>Say hello to {selectedChat.name}</p>
                  </div>
                ) : (
                  (chatHistory[selectedChat._id] || []).map((m, idx) => {
                    // Anchored on the known OTHER party's id rather than the
                    // current user's id — this is correct for a 1:1 thread
                    // no matter what shape/format the logged-in user object
                    // happens to store its id in.
                    const senderId = m.sender?._id || m.sender;
                    const isMine =
                      String(senderId) !== String(selectedChat._id);
                    const senderName = isMine
                      ? user?.name || "You"
                      : m.sender?.name || selectedChat.name;

                    // Only show the name label when the sender changes from
                    // the previous message (WhatsApp-style grouping) —
                    // always show it on the very first message.
                    const prev =
                      idx > 0
                        ? (chatHistory[selectedChat._id] || [])[idx - 1]
                        : null;
                    const prevSenderId = prev
                      ? prev.sender?._id || prev.sender
                      : null;
                    const showName =
                      !prev || String(prevSenderId) !== String(senderId);

                    return (
                      <div
                        key={m._id}
                        className={`${styles.chatBubbleRow} ${isMine ? styles.chatBubbleRowMine : ""}`}
                      >
                        <div
                          className={`${styles.chatBubble} ${isMine ? styles.chatBubbleMine : ""}`}
                        >
                          {showName && (
                            <span className={styles.chatSenderName}>
                              {senderName}
                            </span>
                          )}
                          <span>{m.text}</span>
                          <span className={styles.chatBubbleTime}>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                {typingFrom === selectedChat._id && (
                  <div className={styles.typingIndicator}>
                    {selectedChat.name} is typing...
                  </div>
                )}
              </div>
              <div className={styles.chatInputRow}>
                <input
                  type="text"
                  value={newMessage}
                  placeholder="Type a message..."
                  onChange={(e) => handleTypingInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                />
                <button onClick={sendMessage} title="Send">
                  <FiSend />
                </button>
              </div>
            </div>
          ) : showNewChatList ? (
            /* ─── START A NEW CHAT ─── */
            <div className={styles.notifItemList}>
              {users
                .filter((u) => u._id !== user?._id)
                .map((u) => (
                  <div
                    key={u._id}
                    className={styles.notifItem}
                    style={{ cursor: "pointer" }}
                    onClick={() => openChat(u)}
                  >
                    <div className={styles.notifItemBody}>
                      <span className={styles.notifItemTitle}>
                        {u.name}
                        {onlineUserIds.includes(u._id) && (
                          <FaCircle className={styles.onlineDot} />
                        )}
                      </span>
                      <span className={styles.notifItemMsg}>{u.role}</span>
                    </div>
                  </div>
                ))}
              {users.length === 0 && (
                <div className={styles.emptyState}>
                  <p>No users available</p>
                </div>
              )}
            </div>
          ) : (
            /* ─── CONVERSATION LIST ─── */
            <>
              {conversations.filter((c) => c.user).length === 0 ? (
                <div className={styles.emptyState}>
                  <FaEnvelope size={40} />
                  <p>No messages yet</p>
                  <button
                    className={styles.panelMarkAllBtn}
                    style={{ marginTop: "12px" }}
                    onClick={() => setShowNewChatList(true)}
                  >
                    Start a conversation
                  </button>
                </div>
              ) : (
                <div className={styles.notifItemList}>
                  {conversations
                    .filter((c) => c.user)
                    .map((c) => (
                      <div
                        key={c.user._id}
                        className={`${styles.notifItem} ${c.unreadCount > 0 ? styles.notifItemUnread : ""}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => openChat(c.user)}
                      >
                        <div className={styles.notifItemBody}>
                          <span className={styles.notifItemTitle}>
                            {c.user.name}
                            {onlineUserIds.includes(c.user._id) && (
                              <FaCircle className={styles.onlineDot} />
                            )}
                          </span>
                          <span className={styles.notifItemMsg}>
                            {c.lastMessage?.text}
                          </span>
                        </div>
                        {c.unreadCount > 0 && (
                          <span className={styles.notifHeaderBadge}>
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ""} ${mobileMenuOpen ? styles.sidebarMobile : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <FaShieldAlt />
            </div>
            {!sidebarCollapsed && (
              <span className={styles.logoText}>IDA ERP CRM</span>
            )}
          </div>

          {/* Desktop collapse / expand controls */}
          {!sidebarCollapsed && (
            <button
              className={styles.collapseBtn}
              onClick={() => setSidebarCollapsed(true)}
            >
              <FaChevronLeft />
            </button>
          )}
          {sidebarCollapsed && (
            <button
              className={styles.expandBtn}
              onClick={() => setSidebarCollapsed(false)}
            >
              <FaChevronRight />
            </button>
          )}

          {/* Mobile-only close ("X") button for the drawer */}
          <button
            className={styles.mobileCloseBtn}
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>
        <nav className={styles.nav}>
          {MENU_ITEMS.map((item, index) => {
            /* -------- Special handling for Counselor (hover/click dropdown) -------- */
            if (item.id === "counselor") {
              return (
                <div
                  key={item.id}
                  className={styles.navItemWrapper}
                  ref={counselorItemRef}
                  onMouseEnter={openCounselorDropdown}
                  onMouseLeave={scheduleCloseCounselorDropdown}
                >
                  <button
                    className={`${styles.navItem} ${activeMenu.startsWith("counselor") ? styles.active : ""}`}
                    onClick={handleCounselorClick}
                  >
                    <item.icon className={styles.navIcon} />
                    {!sidebarCollapsed && (
                      <span className={styles.navLabel}>{item.label}</span>
                    )}
                    {!sidebarCollapsed && (
                      <FaChevronDown
                        className={`${styles.navDropdownArrow} ${counselorDropdownOpen ? styles.navDropdownArrowOpen : ""}`}
                      />
                    )}
                  </button>
                </div>
              );
            }
            /* --------------------------------------------------------------------- */

            /* -------- Special handling for Sales (hover/click dropdown) -------- */
            if (item.id === "sales") {
              return (
                <div
                  key={item.id}
                  className={styles.navItemWrapper}
                  ref={salesItemRef}
                  onMouseEnter={openSalesDropdown}
                  onMouseLeave={scheduleCloseSalesDropdown}
                >
                  <button
                    className={`${styles.navItem} ${activeMenu.startsWith("sales") ? styles.active : ""}`}
                    onClick={handleSalesClick}
                  >
                    <item.icon className={styles.navIcon} />
                    {!sidebarCollapsed && (
                      <span className={styles.navLabel}>{item.label}</span>
                    )}
                    {!sidebarCollapsed && (
                      <FaChevronDown
                        className={`${styles.navDropdownArrow} ${salesDropdownOpen ? styles.navDropdownArrowOpen : ""}`}
                      />
                    )}
                  </button>
                </div>
              );
            }
            /* --------------------------------------------------------------------- */

            /* -------- Special handling for HR & Placement Drive (hover/click dropdown) -------- */
            if (item.id === "hr") {
              return (
                <div
                  key={item.id}
                  className={styles.navItemWrapper}
                  ref={hrItemRef}
                  onMouseEnter={openHrDropdown}
                  onMouseLeave={scheduleCloseHrDropdown}
                >
                  <button
                    className={`${styles.navItem} ${activeMenu.startsWith("hr") ? styles.active : ""}`}
                    onClick={handleHrClick}
                  >
                    <item.icon className={styles.navIcon} />
                    {!sidebarCollapsed && (
                      <span className={styles.navLabel}>{item.label}</span>
                    )}
                    {!sidebarCollapsed && (
                      <FaChevronDown
                        className={`${styles.navDropdownArrow} ${hrDropdownOpen ? styles.navDropdownArrowOpen : ""}`}
                      />
                    )}
                  </button>
                </div>
              );
            }
            /* --------------------------------------------------------------------- */

            /* -------- Special handling for Tasks & Admin (hover/click dropdown) -------- */
            if (item.id === "tasks") {
              return (
                <div
                  key={item.id}
                  className={styles.navItemWrapper}
                  ref={tasksItemRef}
                  onMouseEnter={openTasksDropdown}
                  onMouseLeave={scheduleCloseTasksDropdown}
                >
                  <button
                    className={`${styles.navItem} ${activeMenu.startsWith("admin") || activeMenu === "tasks" ? styles.active : ""}`}
                    onClick={handleTasksClick}
                  >
                    <item.icon className={styles.navIcon} />
                    {!sidebarCollapsed && (
                      <span className={styles.navLabel}>{item.label}</span>
                    )}
                    {!sidebarCollapsed && (
                      <FaChevronDown
                        className={`${styles.navDropdownArrow} ${tasksDropdownOpen ? styles.navDropdownArrowOpen : ""}`}
                      />
                    )}
                  </button>
                </div>
              );
            }
            /* --------------------------------------------------------------------- */

            return (
              <div key={item.id} className={styles.navItemWrapper}>
                <button
                  className={`${styles.navItem} ${activeMenu === item.id ? styles.active : ""}`}
                  onClick={() => handleMenuSelect(item.id)}
                  onMouseEnter={() => {
                    if (sidebarCollapsed) setHoveredItem(index);
                  }}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <item.icon className={styles.navIcon} />
                  {!sidebarCollapsed && (
                    <span className={styles.navLabel}>{item.label}</span>
                  )}
                  {sidebarCollapsed && hoveredItem === index && (
                    <div className={styles.navTooltip}>{item.label}</div>
                  )}
                </button>
              </div>
            );
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FaSignOutAlt /> {!sidebarCollapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.menuToggle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <FaBars />
            </button>
            <span className={styles.headerTitle}>
              {getPageTitle(activeMenu)}
            </span>
          </div>

          {/* Centered search bar - desktop only, replaced by a button + slide-down panel on mobile */}
          <div className={styles.headerCenter}>
            <div className={styles.searchBar}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search anything..."
                className={styles.searchInput}
              />
              <kbd className={styles.searchKbd}>⌘K</kbd>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.dateRangeHeader}>
              <FaCalendarAlt />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>

            <div className={styles.langSwitch}>
              <button
                className={`${styles.langBtn} ${activeLang === "EN" ? styles.langBtnActive : ""}`}
                onClick={() => setActiveLang("EN")}
              >
                EN
              </button>
              <button
                className={`${styles.langBtn} ${activeLang === "HI" ? styles.langBtnActive : ""}`}
                onClick={() => setActiveLang("HI")}
              >
                HI
              </button>
            </div>

            <div className={styles.headerDivider}></div>

            {/* Mobile-only: opens/closes the slide-down search panel that
                sits directly underneath (visually "behind") the header */}
            <button
              className={`${styles.mobileSearchToggle} ${mobileSearchOpen ? styles.mobileSearchToggleActive : ""}`}
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              aria-label={mobileSearchOpen ? "Close search" : "Open search"}
              aria-expanded={mobileSearchOpen}
            >
              {mobileSearchOpen ? <FaTimes /> : <FaSearch />}
            </button>

            <button className={styles.iconBtn} onClick={toggleMessages}>
              <FaEnvelope />
              {unreadMessageCount > 0 && (
                <span className={styles.badge}>{unreadMessageCount}</span>
              )}
            </button>

            {/* Desktop notification pill, like the reference design */}
            <button className={styles.notifPill} onClick={toggleNotifications}>
              <span className={styles.notifPillIconWrap}>
                <FaBell />
                {unreadCount > 0 && (
                  <span className={styles.badge}>{unreadCount}</span>
                )}
              </span>
              <span className={styles.notifPillText}>
                <span className={styles.notifPillMessage}>
                  {unreadCount > 0
                    ? `You have ${unreadCount} new notification${unreadCount > 1 ? "s" : ""}`
                    : "No new notifications"}
                </span>
                <span className={styles.notifPillLink}>View Inbox</span>
              </span>
            </button>

            {/* Mobile-only compact bell (the pill above is too wide for small screens) */}
            <button
              className={styles.mobileNotifBtn}
              onClick={toggleNotifications}
            >
              <FaBell />
              {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </button>

            <div className={styles.userProfile}>
              <div className={styles.avatar}>
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.name || "Admin"}</span>
                <span className={styles.userRole}>Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Slide-down mobile search panel - lives right under the header so it
            visually opens out from (and retracts back behind) the header bar */}
        <div
          className={`${styles.mobileSearchPanel} ${mobileSearchOpen ? styles.mobileSearchPanelOpen : ""}`}
        >
          <div className={styles.mobileSearchInner}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search anything..."
              autoFocus={mobileSearchOpen}
            />
            <button
              className={styles.mobileSearchClose}
              onClick={() => setMobileSearchOpen(false)}
              aria-label="Close search"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className={styles.content}>{renderContent()}</div>
      </main>

      {/* User Modal */}
      {showUserModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowUserModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingUser ? "Edit User" : "Create New User"}</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowUserModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={userFormData.name}
                    onChange={handleUserFormChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={userFormData.email}
                    onChange={handleUserFormChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{editingUser ? "New Password" : "Password *"}</label>
                  <input
                    type="password"
                    name="password"
                    value={userFormData.password}
                    onChange={handleUserFormChange}
                    required={!editingUser}
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Role *</label>
                    <select
                      name="role"
                      value={userFormData.role}
                      onChange={handleUserFormChange}
                    >
                      <option value="admin_manager">Admin Manager</option>
                      <option value="sales_executive">Sales Executive</option>
                      <option value="hr_executive">HR Executive</option>
                      <option value="trainer">Trainer</option>
                      <option value="counselor">Counselor</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Department</label>
                    <select
                      name="department"
                      value={userFormData.department}
                      onChange={handleUserFormChange}
                    >
                      <option value="management">Management</option>
                      <option value="sales">Sales</option>
                      <option value="hr">HR</option>
                      <option value="training">Training</option>
                      <option value="counseling">Counseling</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={userFormData.phone}
                    onChange={handleUserFormChange}
                  />
                </div>
                <div className={styles.formGroupCheckbox}>
                  <label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={userFormData.isActive}
                      onChange={handleUserFormChange}
                    />{" "}
                    Account Active
                  </label>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={usersLoading}>
                  {usersLoading
                    ? "Saving..."
                    : editingUser
                      ? "Update"
                      : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;

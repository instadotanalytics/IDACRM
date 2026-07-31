import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaBars,
  FaBell,
  FaEnvelope,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTachometerAlt,
  FaBuilding,
  FaCalendarAlt,
  FaUsers,
  FaChartLine,
  FaTasks,
  FaComments,
  FaCog,
  FaSun,
  FaMoon,
  FaSearch,
  FaPlus,
  FaFilter,
  FaDownload,
  FaEye,
  FaEdit,
  FaTrash,
  FaUserTie,
  FaBriefcase,
  FaGraduationCap,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChartBar,
  FaFileAlt,
  FaCalendarWeek,
  FaMapMarkerAlt,
  FaLink,
  FaPhone,
  FaEnvelope as FaEnvelopeIcon,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaUserCheck,
  FaUserPlus,
  FaArrowLeft,
  FaCircle,
  FaTimes,
} from "react-icons/fa";
import { FiSend, FiUsers } from "react-icons/fi";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import api from "../../../services/api";
import { useSocket } from "../../../context/SocketContext";
import { getUser, clearAuth } from "../../../services/auth";
import { useSocketEvents } from "../../../hooks/useSocketEvents";
import styles from "./HRDashboard.module.css";
import CompaniesManagement from "./Companies/CompaniesManagement";
import PlacementDriveManagement from "./PlacementDrive/PlacementDriveManagement";
import HRStudentsManagement from "./HRstudent/hrStudentsManagement";
import HRInterviewManagement from "./HRInterview/hrInterviewManagement";
import HRDailyReport from "./Reports/hrReportsManagement";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
);

// Placeholder for future components
const PlaceholderContent = ({ title }) => (
  <div className={styles.placeholderBox}>
    <div className={styles.placeholderIcon}>🚧</div>
    <h3>{title}</h3>
    <p>Component will be loaded here</p>
  </div>
);

const HRDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Dashboard Stats
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    placementDrives: 0,
    eligibleStudents: 0,
    appliedStudents: 0,
    selectedStudents: 0,
    joinedStudents: 0,
    placementRatio: 0,
    avgPackage: 0,
    pendingFollowups: 0,
  });

  // Chart Data
  const [monthlyCompanies, setMonthlyCompanies] = useState([
    12, 19, 15, 17, 14, 18, 22, 25, 28, 30, 32, 35,
  ]);
  const [placementSuccess, setPlacementSuccess] = useState([65, 20, 15]);
  const [industryDistribution, setIndustryDistribution] = useState([
    { industry: "IT Services", count: 25 },
    { industry: "Banking", count: 18 },
    { industry: "Consulting", count: 15 },
    { industry: "Manufacturing", count: 12 },
    { industry: "Healthcare", count: 8 },
    { industry: "Other", count: 10 },
  ]);

  // Companies Data
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [students, setStudents] = useState([]);

  const [notifications, setNotifications] = useState([]);

  // Messaging
  const [conversations, setConversations] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatHistory, setChatHistory] = useState({});
  const [chatLoading, setChatLoading] = useState(false);
  const [showNewChatList, setShowNewChatList] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typingFrom, setTypingFrom] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const typingTimeoutRef = React.useRef(null);

  const { isConnected, reconnectSocket } = useSocket();

  useEffect(() => {
    const userData = getUser();
    if (userData) setUser(userData);
    fetchDashboardData();
    fetchNotifications();
  }, []);

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

  const userId = user?._id || user?.id;

  const fetchConversations = async () => {
    try {
      const res = await api.get("/messages/conversations");
      if (res.data.success) setConversations(res.data.data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const res = await api.get("/messages/users/list");
      if (res.data.success) setAvailableUsers(res.data.data || []);
    } catch (error) {
      console.error("Error fetching users list:", error);
    }
  };

  const openMessagesPanel = () => {
    setShowMessages(true);
    setShowNotifications(false);
    setSelectedChat(null);
    setShowNewChatList(false);
    fetchConversations();
    fetchAvailableUsers();
  };

  const openChat = async (chatUser) => {
    setSelectedChat(chatUser);
    setShowNewChatList(false);
    if (!chatHistory[chatUser._id]) {
      setChatLoading(true);
      try {
        const res = await api.get(`/messages/${chatUser._id}`);
        if (res.data.success) {
          setChatHistory((prev) => ({
            ...prev,
            [chatUser._id]: res.data.data || [],
          }));
        }
      } catch (error) {
        console.error("Error fetching chat thread:", error);
      } finally {
        setChatLoading(false);
      }
    }
    try {
      await api.put(`/messages/read-all/${chatUser._id}`);
      setConversations((prev) =>
        prev.map((c) =>
          c.user?._id === chatUser._id ? { ...c, unreadCount: 0 } : c,
        ),
      );
    } catch (error) {
      console.error("Error marking messages read:", error);
    }
  };

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
    const chatId = String(selectedChat._id);
    setNewMessage("");
    emit("stop-typing", { receiverId: chatId });
    try {
      const res = await api.post("/messages", { receiverId: chatId, text });
      if (res.data.success) {
        setChatHistory((prev) => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), res.data.data],
        }));
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

  const unreadMessageCount = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0,
  );

  const { emit } = useSocketEvents({
    onNewNotification: handleNewNotification,
    onNotificationRead: handleNotificationRead,
    onNewMessage: (message) => {
      // Backend emits new-message ONLY to receiver — we are always the receiver here
      const otherUserId = String(message.sender?._id || message.sender);

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
        fetchConversations();
        return prev;
      });

      toast(`${message.sender?.name || "New message"}: ${message.text}`, {
        icon: "💬",
      });
    },
    onMessageRead: (data) => {
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
    onTyping: (data) => setTypingFrom(data.senderId),
    onStopTyping: () => setTypingFrom(null),
    onUserOnline: (data) =>
      setOnlineUserIds((prev) =>
        prev.includes(data.userId) ? prev : [...prev, data.userId],
      ),
    onUserOffline: (data) =>
      setOnlineUserIds((prev) => prev.filter((id) => id !== data.userId)),
    onOnlineUsers: (data) => setOnlineUserIds(data.userIds || []),
  });

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const markNotifRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  const markAllNotifsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.put("/notifications/read-all");
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications read:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch companies
      const companiesRes = await api.get("/companies");
      if (companiesRes.data.success) {
        setCompanies(companiesRes.data.data || []);
        const totalCompanies = companiesRes.data.data?.length || 0;
        const activeCompanies =
          companiesRes.data.data?.filter((c) => c.status === "active").length ||
          0;
        setStats((prev) => ({ ...prev, totalCompanies, activeCompanies }));
      }

      // Fetch placement drives
      const drivesRes = await api.get("/placement-drives");
      if (drivesRes.data.success) {
        setDrives(drivesRes.data.data || []);
        const placementDrives = drivesRes.data.data?.length || 0;
        setStats((prev) => ({ ...prev, placementDrives }));
      }

      // Fetch students
      const studentsRes = await api.get("/admissions");
      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data || []);
        const eligibleStudents =
          studentsRes.data.data?.filter((s) => s.isEligible).length || 0;
        const selectedStudents =
          studentsRes.data.data?.filter((s) => s.isSelected).length || 0;
        const placementRatio =
          eligibleStudents > 0
            ? (selectedStudents / eligibleStudents) * 100
            : 0;
        setStats((prev) => ({
          ...prev,
          eligibleStudents,
          selectedStudents,
          placementRatio: placementRatio.toFixed(1),
        }));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set demo data if API fails
      setStats({
        totalCompanies: 48,
        activeCompanies: 32,
        placementDrives: 12,
        eligibleStudents: 180,
        appliedStudents: 156,
        selectedStudents: 124,
        joinedStudents: 98,
        placementRatio: 68.9,
        avgPackage: 6.5,
        pendingFollowups: 8,
      });
    }
  };

  const handleLogout = () => {
    clearAuth();
    if (reconnectSocket) reconnectSocket(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "H";
  };

  // Sidebar Menu Items
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { id: "companies", label: "Companies", icon: FaBuilding },
    { id: "placementDrives", label: "Placement Drives", icon: FaCalendarAlt },
    { id: "students", label: "Students", icon: FaUsers },
    { id: "interviews", label: "Interviews", icon: FaComments },
    { id: "reports", label: "Reports", icon: FaChartLine },
    { id: "tasks", label: "Tasks", icon: FaTasks },
    { id: "meetings", label: "Meetings", icon: FaCalendarWeek },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "settings", label: "Settings", icon: FaCog },
  ];

  const displayName = user?.name || "HR Executive";
  const displayRole = "HR Executive";

  // Chart Configurations
  const monthlyCompaniesData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Companies Onboarded",
        data: monthlyCompanies,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const placementSuccessData = {
    labels: ["Selected", "Rejected", "Pending"],
    datasets: [
      {
        data: [
          stats.selectedStudents,
          stats.eligibleStudents - stats.selectedStudents,
          stats.eligibleStudents,
        ],
        backgroundColor: ["#22c55e", "#ef4444", "#f59e0b"],
        borderWidth: 0,
      },
    ],
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <div className={styles.dashboardContent}>
            {/* Stats Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaBuilding />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    {stats.totalCompanies}
                  </span>
                  <span className={styles.statLabel}>Total Companies</span>
                </div>
                <div className={styles.statTrend}>
                  <FaArrowUp className={styles.trendUp} />
                  <span>+12% this month</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaBriefcase />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    {stats.placementDrives}
                  </span>
                  <span className={styles.statLabel}>Placement Drives</span>
                </div>
                <div className={styles.statTrend}>
                  <FaArrowUp className={styles.trendUp} />
                  <span>+3 this week</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaGraduationCap />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    {stats.eligibleStudents}
                  </span>
                  <span className={styles.statLabel}>Eligible Students</span>
                </div>
                <div className={styles.statTrend}>
                  <FaArrowUp className={styles.trendUp} />
                  <span>+8% this month</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaUserCheck />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    {stats.selectedStudents}
                  </span>
                  <span className={styles.statLabel}>Students Selected</span>
                </div>
                <div className={styles.statTrend}>
                  <FaArrowUp className={styles.trendUp} />
                  <span>+15% this week</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaChartLine />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    {stats.placementRatio}%
                  </span>
                  <span className={styles.statLabel}>Placement Ratio</span>
                </div>
                <div className={styles.statTrend}>
                  <FaArrowUp className={styles.trendUp} />
                  <span>+5% vs last month</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaStar />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    ₹{stats.avgPackage} LPA
                  </span>
                  <span className={styles.statLabel}>Average Package</span>
                </div>
                <div className={styles.statTrend}>
                  <FaArrowUp className={styles.trendUp} />
                  <span>+2 LPA vs last year</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className={styles.chartsSection}>
              <div className={styles.chartCard}>
                <h3>Monthly Company Onboarding</h3>
                <div className={styles.chartContainer}>
                  <Line
                    data={monthlyCompaniesData}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>
              <div className={styles.chartCard}>
                <h3>Placement Success Rate</h3>
                <div className={styles.doughnutContainer}>
                  <Doughnut
                    data={placementSuccessData}
                    options={{
                      cutout: "60%",
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Companies & Drives */}
            <div className={styles.twoColumnLayout}>
              <div className={styles.recentCard}>
                <div className={styles.cardHeader}>
                  <h3>Recent Companies</h3>
                  <button className={styles.viewAllBtn}>View All</button>
                </div>
                <div className={styles.recentList}>
                  {companies.slice(0, 5).map((company) => (
                    <div key={company._id} className={styles.recentItem}>
                      <div className={styles.recentIcon}>
                        <FaBuilding />
                      </div>
                      <div className={styles.recentInfo}>
                        <div className={styles.recentTitle}>{company.name}</div>
                        <div className={styles.recentSub}>
                          {company.industry} • {company.location}
                        </div>
                      </div>
                      <div className={styles.recentStatus}>Active</div>
                    </div>
                  ))}
                  {companies.length === 0 && (
                    <div className={styles.emptyState}>
                      No companies added yet
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.recentCard}>
                <div className={styles.cardHeader}>
                  <h3>Upcoming Drives</h3>
                  <button className={styles.viewAllBtn}>View All</button>
                </div>
                <div className={styles.recentList}>
                  {drives.slice(0, 5).map((drive) => (
                    <div key={drive._id} className={styles.recentItem}>
                      <div className={styles.recentIcon}>
                        <FaCalendarAlt />
                      </div>
                      <div className={styles.recentInfo}>
                        <div className={styles.recentTitle}>
                          {drive.companyName}
                        </div>
                        <div className={styles.recentSub}>
                          {new Date(drive.driveDate).toLocaleDateString()} •{" "}
                          {drive.ctc} LPA
                        </div>
                      </div>
                      <div className={styles.recentStatus}>Upcoming</div>
                    </div>
                  ))}
                  {drives.length === 0 && (
                    <div className={styles.emptyState}>No drives scheduled</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "companies":
        return <CompaniesManagement />;
      case "placementDrives":
        return <PlacementDriveManagement />;
      case "students":
        return <HRStudentsManagement />;
      case "interviews":
        return <HRInterviewManagement />;
      case "reports":
        return <HRDailyReport />;
      case "tasks":
        return <PlaceholderContent title="Task Management" />;
      case "meetings":
        return <PlaceholderContent title="Meeting Management" />;
      case "notifications":
        return <PlaceholderContent title="Notification Center" />;
      case "settings":
        return <PlaceholderContent title="Settings" />;
      default:
        return <PlaceholderContent title="Dashboard" />;
    }
  };

  return (
    <div
      className={`${styles.app} ${darkMode ? styles.darkMode : ""} ${sidebarCollapsed ? styles.appCollapsed : ""}`}
    >
      {/* Mobile sidebar backdrop */}
      {mobileMenuOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Notification Panel */}
      {showNotifications && (
        <>
          <div className={styles.slidePanel}>
            <div className={styles.panelHeader}>
              <h3>
                <FaBell /> Notifications{" "}
                {unreadNotifCount > 0 && (
                  <span className={styles.badge}>{unreadNotifCount}</span>
                )}
              </h3>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: isConnected ? "#22c55e" : "#ef4444",
                    fontWeight: 600,
                  }}
                >
                  {isConnected ? "● Live" : "● Offline"}
                </span>
                {unreadNotifCount > 0 && (
                  <button onClick={markAllNotifsRead} title="Mark all read">
                    <FaCheckCircle />
                  </button>
                )}
                <button onClick={() => setShowNotifications(false)}>
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className={styles.panelContent}>
              {notifications.length === 0 ? (
                <div className={styles.emptyState}>No new notifications</div>
              ) : (
                <div className={styles.recentList}>
                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      className={styles.recentItem}
                      style={{ cursor: "pointer", opacity: n.read ? 0.6 : 1 }}
                      onClick={() => !n.read && markNotifRead(n._id)}
                    >
                      <div className={styles.recentIcon}>
                        <FaBell />
                      </div>
                      <div className={styles.recentInfo}>
                        <div className={styles.recentTitle}>{n.title}</div>
                        <div className={styles.recentSub}>{n.message}</div>
                      </div>
                      {!n.read && (
                        <div className={styles.recentStatus}>New</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div
            className={styles.panelOverlay}
            onClick={() => setShowNotifications(false)}
          />
        </>
      )}

      {/* Messages Panel */}
      {showMessages && (
        <>
          <div className={styles.slidePanel}>
            <div className={styles.panelHeader}>
              <h3>
                {selectedChat ? (
                  <>
                    <button
                      onClick={() => setSelectedChat(null)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        marginRight: 6,
                        color: "inherit",
                      }}
                    >
                      <FaArrowLeft />
                    </button>
                    {selectedChat.name}
                    {onlineUserIds.includes(selectedChat._id) && (
                      <FaCircle
                        style={{ fontSize: 8, color: "#22c55e", marginLeft: 8 }}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <FaEnvelope /> Messages
                    {unreadMessageCount > 0 && (
                      <span
                        className={styles.badge}
                        style={{ position: "static", marginLeft: 8 }}
                      >
                        {unreadMessageCount}
                      </span>
                    )}
                  </>
                )}
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: isConnected ? "#22c55e" : "#ef4444",
                  }}
                >
                  {isConnected ? "● Live" : "● Offline"}
                </span>
                {!selectedChat && (
                  <button
                    onClick={() => setShowNewChatList((s) => !s)}
                    title="New chat"
                  >
                    <FaUserPlus />
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMessages(false);
                    setSelectedChat(null);
                  }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className={styles.panelContent}>
              {selectedChat ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {chatLoading ? (
                      <div className={styles.emptyState}>Loading...</div>
                    ) : (chatHistory[selectedChat._id] || []).length === 0 ? (
                      <div className={styles.emptyState}>
                        Say hello to {selectedChat.name}
                      </div>
                    ) : (
                      (chatHistory[selectedChat._id] || []).map((m, idx) => {
                        const senderId = m.sender?._id || m.sender;
                        const isMine =
                          String(senderId) !== String(selectedChat._id);
                        const senderName = isMine
                          ? user?.name || "You"
                          : m.sender?.name || selectedChat.name;
                        const list = chatHistory[selectedChat._id] || [];
                        const prev = idx > 0 ? list[idx - 1] : null;
                        const prevSenderId = prev
                          ? prev.sender?._id || prev.sender
                          : null;
                        const showName =
                          !prev || String(prevSenderId) !== String(senderId);
                        return (
                          <div
                            key={m._id}
                            style={{
                              display: "flex",
                              justifyContent: isMine
                                ? "flex-end"
                                : "flex-start",
                            }}
                          >
                            <div
                              style={{
                                maxWidth: "75%",
                                padding: "8px 12px",
                                borderRadius: isMine
                                  ? "14px 14px 4px 14px"
                                  : "14px 14px 14px 4px",
                                background: isMine ? "#2563eb" : "#e2e8f0",
                                color: isMine ? "#fff" : "#0f172a",
                                fontSize: 13,
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                              }}
                            >
                              {showName && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    opacity: 0.75,
                                  }}
                                >
                                  {senderName}
                                </span>
                              )}
                              <span>{m.text}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                    {typingFrom === selectedChat._id && (
                      <div
                        style={{
                          fontSize: 12,
                          fontStyle: "italic",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {selectedChat.name} is typing...
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      paddingTop: 12,
                      borderTop: "1px solid var(--border-light)",
                    }}
                  >
                    <input
                      type="text"
                      value={newMessage}
                      placeholder="Type a message..."
                      onChange={(e) => handleTypingInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") sendMessage();
                      }}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        borderRadius: 20,
                        border: "1px solid var(--border-light)",
                        background: "var(--bg-tertiary)",
                        color: "var(--text-primary)",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        border: "none",
                        background: "var(--primary)",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FiSend />
                    </button>
                  </div>
                </div>
              ) : showNewChatList ? (
                <div className={styles.recentList}>
                  {availableUsers.map((u) => (
                    <div
                      key={u._id}
                      className={styles.recentItem}
                      style={{ cursor: "pointer" }}
                      onClick={() => openChat(u)}
                    >
                      <div className={styles.recentIcon}>
                        <FaEnvelope />
                      </div>
                      <div className={styles.recentInfo}>
                        <div className={styles.recentTitle}>
                          {u.name}
                          {onlineUserIds.includes(u._id) && (
                            <FaCircle
                              style={{
                                fontSize: 8,
                                color: "#22c55e",
                                marginLeft: 8,
                              }}
                            />
                          )}
                        </div>
                        <div className={styles.recentSub}>{u.role}</div>
                      </div>
                    </div>
                  ))}
                  {availableUsers.length === 0 && (
                    <div className={styles.emptyState}>No users available</div>
                  )}
                </div>
              ) : conversations.filter((c) => c.user).length === 0 ? (
                <div className={styles.emptyState}>No messages yet</div>
              ) : (
                <div className={styles.recentList}>
                  {conversations
                    .filter((c) => c.user)
                    .map((c) => (
                      <div
                        key={c.user._id}
                        className={styles.recentItem}
                        style={{
                          cursor: "pointer",
                          opacity: c.unreadCount > 0 ? 1 : 0.75,
                        }}
                        onClick={() => openChat(c.user)}
                      >
                        <div className={styles.recentIcon}>
                          <FaEnvelope />
                        </div>
                        <div className={styles.recentInfo}>
                          <div className={styles.recentTitle}>
                            {c.user?.name}
                            {onlineUserIds.includes(c.user?._id) && (
                              <FaCircle
                                style={{
                                  fontSize: 8,
                                  color: "#22c55e",
                                  marginLeft: 8,
                                }}
                              />
                            )}
                          </div>
                          <div className={styles.recentSub}>
                            {c.lastMessage?.text}
                          </div>
                        </div>
                        {c.unreadCount > 0 && (
                          <div className={styles.recentStatus}>
                            {c.unreadCount}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          <div
            className={styles.panelOverlay}
            onClick={() => {
              setShowMessages(false);
              setSelectedChat(null);
            }}
          />
        </>
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ""} ${mobileMenuOpen ? styles.sidebarMobile : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>🏢</div>
            {!sidebarCollapsed && (
              <span className={styles.logoText}>IDA ERP CRM</span>
            )}
          </div>
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
          <button
            className={styles.mobileCloseBtn}
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeMenu === item.id ? styles.active : ""}`}
              onClick={() => {
                setActiveMenu(item.id);
                setMobileMenuOpen(false);
              }}
            >
              <item.icon className={styles.navIcon} />
              {!sidebarCollapsed && (
                <span className={styles.navLabel}>{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{getInitial(displayName)}</div>
            {!sidebarCollapsed && (
              <div className={styles.userDetails}>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.userRole}>{displayRole}</span>
              </div>
            )}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FaSignOutAlt /> {!sidebarCollapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.menuToggle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <FaBars />
            </button>
            <div className={styles.searchBar}>
              <FaSearch />
              <input
                type="text"
                placeholder="Search companies, drives, students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.headerRight}>
            <button
              className={styles.iconBtn}
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            <button className={styles.iconBtn} onClick={openMessagesPanel}>
              <FaEnvelope />
              {unreadMessageCount > 0 && (
                <span className={styles.badge}>{unreadMessageCount}</span>
              )}
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => {
                setShowNotifications(true);
                setShowMessages(false);
              }}
            >
              <FaBell />
              {unreadNotifCount > 0 && (
                <span className={styles.badge}>{unreadNotifCount}</span>
              )}
            </button>
            <button className={styles.quickActionBtn}>
              <FaPlus /> <span>Quick Action</span>
            </button>
            <div className={styles.userProfile}>
              <div className={styles.avatarSmall}>
                {getInitial(displayName)}
              </div>
              <div className={styles.userInfoText}>
                <span className={styles.userNameText}>{displayName}</span>
                <span className={styles.userRoleText}>{displayRole}</span>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.content}>{renderContent()}</div>
      </main>
    </div>
  );
};

export default HRDashboard;

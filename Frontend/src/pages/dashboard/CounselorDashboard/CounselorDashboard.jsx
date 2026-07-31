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
  FaUsers,
  FaChartLine,
  FaFileAlt,
  FaPhoneAlt,
  FaCog,
  FaClock,
  FaTimes,
  FaPhone,
  FaEnvelope as FaEnvelopeIcon,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaUserGraduate,
  FaPhoneVolume,
  FaUserTie,
  FaCheckCircle,
  FaArrowLeft,
  FaCircle,
  FaUserPlus,
} from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import styles from "./CounselorDashboard.module.css";
import Admission from "./Admission/Admission";
import Leads from "./Leads/Leades";
import Calls from "./CallsCounsler/Calls";
import api, {
  getCurrentUser,
  getCurrentUserId,
  getCurrentUserRole,
} from "../../../services/api";
import { getToken, getUser, clearAuth } from "../../../services/auth";
import { useSocket } from "../../../context/SocketContext";
import { useSocketEvents } from "../../../hooks/useSocketEvents";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
);

const PlaceholderContent = ({ title, description }) => (
  <div className={styles.placeholderBox}>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

const DashboardOverview = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalCalls: 0,
    connectedCalls: 0,
    pendingFollowups: 0,
    totalAdmissions: 0,
    newLeadsThisWeek: 0,
    newCallsToday: 0,
    conversionRate: 0,
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
  });

  const [courses, setCourses] = useState([]);
  const [pendingFollowups, setPendingFollowups] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const currentUser = getCurrentUser();
      const userId = getCurrentUserId();
      const userRole = getCurrentUserRole();

      console.log("=== DASHBOARD DEBUG ===");
      console.log("Current User:", currentUser?.name);
      console.log("User Role:", userRole);
      console.log("User ID:", userId);

      let leads = [];
      let calls = [];
      let admissions = [];

      if (userRole === "admin_manager" || userRole === "super_admin") {
        const [leadsRes, callsRes, admissionsRes] = await Promise.all([
          api.get("/leads"),
          api.get("/calls"),
          api.get("/admissions"),
        ]);
        leads = leadsRes.data.success ? leadsRes.data.data : [];
        calls = callsRes.data.success ? callsRes.data.data : [];
        admissions = admissionsRes.data.success ? admissionsRes.data.data : [];
      } else {
        try {
          const [leadsRes, callsRes, admissionsRes] = await Promise.all([
            api.get(`/leads/counselor/${userId}`),
            api.get(`/calls/counselor/${userId}`),
            api.get(`/admissions/counselor/${userId}`),
          ]);
          leads = leadsRes.data.success ? leadsRes.data.data : [];
          calls = callsRes.data.success ? callsRes.data.data : [];
          admissions = admissionsRes.data.success
            ? admissionsRes.data.data
            : [];
        } catch (err) {
          console.log("Counselor endpoints failed, using fallback");
          const [leadsRes, callsRes, admissionsRes] = await Promise.all([
            api.get("/leads"),
            api.get("/calls"),
            api.get("/admissions"),
          ]);

          const allLeads = leadsRes.data.success ? leadsRes.data.data : [];
          const allCalls = callsRes.data.success ? callsRes.data.data : [];
          const allAdmissions = admissionsRes.data.success
            ? admissionsRes.data.data
            : [];

          leads = allLeads.filter(
            (l) =>
              l.assignedTo === userId ||
              l.counselorId === userId ||
              l.counselorId?._id === userId ||
              l.assignedTo?._id === userId,
          );

          calls = allCalls.filter(
            (c) => c.counselorId === userId || c.counselorId?._id === userId,
          );

          admissions = allAdmissions.filter(
            (a) => a.counselorId === userId || a.counselorId?._id === userId,
          );
        }
      }

      // Weekly data calculation
      const weeklyData = [0, 0, 0, 0, 0, 0, 0];
      leads.forEach((lead) => {
        const date = new Date(lead.createdAt || lead.enquiryDate);
        const day = date.getDay();
        if (day >= 0 && day <= 6) weeklyData[day]++;
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());

      const newLeadsThisWeek = leads.filter(
        (lead) => new Date(lead.createdAt || lead.enquiryDate) >= thisWeekStart,
      ).length;
      const todayCalls = calls.filter((call) => {
        const callDate = new Date(call.callTime || call.createdAt);
        return callDate.toDateString() === today.toDateString();
      });
      const totalCalls = calls.length;
      const connectedCalls = calls.filter(
        (call) =>
          call.callStatus === "Connected" || call.status === "Connected",
      ).length;
      const totalLeads = leads.length;
      const totalAdmissions = admissions.length;
      const pendingFollowupsLeads = leads.filter(
        (lead) => lead.status === "Pending" || lead.status === "Follow-up",
      ).length;
      const conversionRate =
        totalLeads > 0 ? Math.round((totalAdmissions / totalLeads) * 100) : 0;

      // Course distribution
      const courseMap = new Map();
      leads.forEach((lead) => {
        const course = lead.courseInterest || lead.course || "Other";
        courseMap.set(course, (courseMap.get(course) || 0) + 1);
      });

      const courseData = Array.from(courseMap.entries())
        .map(([name, count]) => ({ name, count }))
        .slice(0, 4);

      // Pending follow-ups
      const pendingData = leads
        .filter(
          (lead) => lead.status === "Pending" || lead.status === "Follow-up",
        )
        .slice(0, 4)
        .map((lead) => ({
          id: lead._id,
          name: lead.name,
          phone: lead.phone,
          course: lead.courseInterest || lead.course,
          daysPending: Math.floor(
            (new Date() - new Date(lead.createdAt || lead.enquiryDate)) /
              (1000 * 60 * 60 * 24),
          ),
        }));

      // Recent activities
      const recentCallsData = calls.slice(0, 4).map((call) => ({
        id: call._id,
        type: "call",
        message: `📞 Called ${call.leadName}`,
        status: call.callStatus || call.status,
        time: new Date(call.callTime || call.createdAt).toLocaleString(),
      }));

      const recentLeadsData = leads.slice(0, 4).map((lead) => ({
        id: lead._id,
        type: "lead",
        message: `🆕 New lead: ${lead.name}`,
        status: lead.status,
        time: new Date(lead.createdAt || lead.enquiryDate).toLocaleString(),
      }));

      const activities = [...recentCallsData, ...recentLeadsData]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5);

      setStats({
        totalLeads,
        totalCalls,
        connectedCalls,
        pendingFollowups: pendingFollowupsLeads,
        totalAdmissions,
        newLeadsThisWeek,
        newCallsToday: todayCalls.length,
        conversionRate,
        weeklyData,
      });

      setCourses(courseData);
      setPendingFollowups(pendingData);
      setRecentActivities(activities);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const lineChartData = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Leads",
        data: stats.weeklyData,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#6366f1",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      y: {
        grid: { color: "rgba(255,255,255,0.1)" },
        ticks: { color: "#a0a0a0" },
        beginAtZero: true,
      },
      x: { grid: { display: false }, ticks: { color: "#a0a0a0" } },
    },
  };

  const doughnutData = {
    labels: courses.map((c) => c.name),
    datasets: [
      {
        data: courses.map((c) => c.count),
        backgroundColor: [
          "#6366f1",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
        ],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    cutout: "60%",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#a0a0a0", font: { size: 11 } },
      },
    },
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className={styles.dashboardOverview}>
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeText}>
          <h1>Welcome back, {user?.name?.split(" ")[0] || "Counselor"}! 👋</h1>
          <p>Track your leads, calls, and admissions at a glance.</p>
        </div>
        <div className={styles.dateBadge}>
          <FaCalendarAlt />
          <span>
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div
            className={styles.statIconWrapper}
            style={{ background: "rgba(99, 102, 241, 0.15)" }}
          >
            <FaUsers className={styles.statIcon} style={{ color: "#6366f1" }} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.totalLeads}</span>
            <span className={styles.statLabel}>Total Leads</span>
          </div>
          <div className={styles.statTrend}>
            <FaArrowUp className={styles.trendUp} />
            <span>{stats.newLeadsThisWeek} this week</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIconWrapper}
            style={{ background: "rgba(16, 185, 129, 0.15)" }}
          >
            <FaPhoneVolume
              className={styles.statIcon}
              style={{ color: "#10b981" }}
            />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.totalCalls}</span>
            <span className={styles.statLabel}>Total Calls</span>
          </div>
          <div className={styles.statTrend}>
            <FaArrowUp className={styles.trendUp} />
            <span>{stats.connectedCalls} connected</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIconWrapper}
            style={{ background: "rgba(245, 158, 11, 0.15)" }}
          >
            <FaClock className={styles.statIcon} style={{ color: "#f59e0b" }} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.pendingFollowups}</span>
            <span className={styles.statLabel}>Pending Follow-ups</span>
          </div>
          <div className={styles.statTrend}>
            <span>Action required</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIconWrapper}
            style={{ background: "rgba(139, 92, 246, 0.15)" }}
          >
            <FaUserGraduate
              className={styles.statIcon}
              style={{ color: "#8b5cf6" }}
            />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.totalAdmissions}</span>
            <span className={styles.statLabel}>Admissions</span>
          </div>
          <div className={styles.statTrend}>
            <span>{stats.conversionRate}% conversion</span>
          </div>
        </div>
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.lineChartCard}>
          <div className={styles.cardHeader}>
            <h3>Weekly Leads Trend</h3>
            <span className={styles.headerBadge}>
              +{stats.newLeadsThisWeek} this week
            </span>
          </div>
          <div className={styles.lineChartContainer}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {courses.length > 0 && (
          <div className={styles.doughnutCard}>
            <div className={styles.cardHeader}>
              <h3>Course Distribution</h3>
            </div>
            <div className={styles.doughnutContainer}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        )}
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.followupCard}>
          <div className={styles.cardHeader}>
            <h3>⏳ Pending Follow-ups</h3>
            <button className={styles.viewAllBtn}>View All →</button>
          </div>
          <div className={styles.followupList}>
            {pendingFollowups.length === 0 ? (
              <div className={styles.emptyState}>No pending follow-ups 🎉</div>
            ) : (
              pendingFollowups.map((item) => (
                <div key={item.id} className={styles.followupItem}>
                  <div className={styles.followupAvatar}>
                    <span>{item.name.charAt(0)}</span>
                  </div>
                  <div className={styles.followupInfo}>
                    <div className={styles.followupName}>{item.name}</div>
                    <div className={styles.followupDetails}>
                      {item.course} • {item.phone}
                    </div>
                    <div className={styles.followupDays}>
                      Pending for {item.daysPending} days
                    </div>
                  </div>
                  <div className={styles.followupActions}>
                    <button className={styles.callBtn}>
                      <FaPhone />
                    </button>
                    <button className={styles.messageBtn}>
                      <FaEnvelopeIcon />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.activityCard}>
          <div className={styles.cardHeader}>
            <h3>🔄 Recent Activities</h3>
            <button className={styles.viewAllBtn}>View All →</button>
          </div>
          <div className={styles.activityTimeline}>
            {recentActivities.length === 0 ? (
              <div className={styles.emptyState}>No recent activities</div>
            ) : (
              recentActivities.map((activity, idx) => (
                <div key={idx} className={styles.timelineItem}>
                  <div className={styles.timelineDot}></div>
                  <div className={styles.timelineContent}>
                    <div className={styles.activityMessage}>
                      {activity.message}
                    </div>
                    <div className={styles.activityStatus}>
                      <span
                        className={`${styles.statusDot} ${activity.status === "Connected" ? styles.success : styles.warning}`}
                      ></span>
                      {activity.status || "New"}
                    </div>
                    <div className={styles.activityTime}>{activity.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CounselorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Messaging
  const [showMsgDropdown, setShowMsgDropdown] = useState(false);
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
    const token = getToken();
    const userData = getUser();

    console.log("=== COUNSELOR DASHBOARD ===");
    console.log("Token exists:", !!token);

    if (userData) {
      setUser(userData);
      console.log("✅ User loaded:", userData.name);
      console.log("✅ User Role:", userData.role);
    } else {
      console.log("❌ No user data found");
    }

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    fetchNotifications();
    fetchConversations();
  }, [navigate]);

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

  const openMessages = () => {
    setShowMsgDropdown((s) => !s);
    setShowNotifDropdown(false);
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

  const handleLogout = () => {
    clearAuth();
    if (reconnectSocket) reconnectSocket(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "C";
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { id: "leads", label: "Leads", icon: FaChartLine },
    { id: "calls", label: "Calls", icon: FaPhoneAlt },
    { id: "admissions", label: "Admissions", icon: FaFileAlt },
    { id: "settings", label: "Settings", icon: FaCog },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview user={user} />;
      case "leads":
        return <Leads />;
      case "calls":
        return <Calls />;
      case "admissions":
        return <Admission />;
      case "settings":
        return (
          <PlaceholderContent
            title="Settings"
            description="Configure system settings"
          />
        );
      default:
        return <DashboardOverview user={user} />;
    }
  };

  const displayName = user?.name || "Counselor";
  const displayRole =
    user?.role === "counselor"
      ? "Counselor"
      : user?.role === "admin_manager"
        ? "Admin Manager"
        : user?.role === "super_admin"
          ? "Super Admin"
          : "Counselor";

  return (
    <div
      className={`${styles.app} ${sidebarCollapsed ? styles.appCollapsed : ""}`}
    >
      {/* Mobile sidebar backdrop */}
      {mobileMenuOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ""} ${mobileMenuOpen ? styles.sidebarMobile : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>CRM</div>
            {!sidebarCollapsed && (
              <span className={styles.logoText}>Counselor Portal</span>
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
              className={`${styles.navItem} ${activeTab === item.id ? styles.active : ""}`}
              onClick={() => {
                setActiveTab(item.id);
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
            <div className={styles.pageTitle}>
              <h2>
                {menuItems.find((item) => item.id === activeTab)?.label ||
                  "Dashboard"}
              </h2>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button
              className={styles.iconBtn}
              onClick={() => {
                openMessages();
                setShowNotifDropdown(false);
              }}
            >
              <FaEnvelope />
              {unreadMessageCount > 0 && (
                <span className={styles.notifBadgeDot}>
                  {unreadMessageCount}
                </span>
              )}
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => {
                setShowNotifDropdown((s) => !s);
                setShowMsgDropdown(false);
                setSelectedChat(null);
              }}
            >
              <FaBell />
              {unreadNotifCount > 0 && (
                <span className={styles.notifBadgeDot}>{unreadNotifCount}</span>
              )}
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

        {/* ─── NOTIFICATIONS SLIDE PANEL ─── */}
        {showNotifDropdown && (
          <>
            <div
              className={styles.msgPanelOverlay}
              onClick={() => setShowNotifDropdown(false)}
            />
            <div className={styles.msgSlidePanel}>
              <div className={styles.msgPanelHeader}>
                <span>
                  <FaBell /> Notifications
                  {unreadNotifCount > 0 && (
                    <span className={styles.notifHeaderBadge}>
                      {unreadNotifCount}
                    </span>
                  )}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    className={
                      isConnected ? styles.liveDotOn : styles.liveDotOff
                    }
                  >
                    {isConnected ? "● Live" : "● Offline"}
                  </span>
                  {unreadNotifCount > 0 && (
                    <button onClick={markAllNotifsRead} title="Mark all read">
                      <FaCheckCircle />
                    </button>
                  )}
                  <button onClick={() => setShowNotifDropdown(false)}>
                    <FaTimes />
                  </button>
                </div>
              </div>
              <div className={styles.msgPanelContent}>
                {notifications.length === 0 ? (
                  <div className={styles.msgEmpty}>No notifications</div>
                ) : (
                  <div className={styles.msgList}>
                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`${styles.msgItem} ${!n.read ? styles.msgItemUnread : ""}`}
                        onClick={() => !n.read && markNotifRead(n._id)}
                      >
                        <div className={styles.msgItemBody}>
                          <span className={styles.msgItemTitle}>{n.title}</span>
                          <span className={styles.msgItemSub}>{n.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ─── MESSAGES SLIDE PANEL ─── */}
        {showMsgDropdown && (
          <>
            <div
              className={styles.msgPanelOverlay}
              onClick={() => {
                setShowMsgDropdown(false);
                setSelectedChat(null);
              }}
            />
            <div className={styles.msgSlidePanel}>
              <div className={styles.msgPanelHeader}>
                {selectedChat ? (
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <button
                      onClick={() => setSelectedChat(null)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "inherit",
                        cursor: "pointer",
                        display: "flex",
                      }}
                    >
                      <FaArrowLeft />
                    </button>
                    {selectedChat.name}
                    {onlineUserIds.includes(selectedChat._id) && (
                      <FaCircle style={{ fontSize: 8, color: "#10b981" }} />
                    )}
                  </span>
                ) : (
                  <span>
                    <FaEnvelope /> Messages
                    {unreadMessageCount > 0 && (
                      <span className={styles.notifHeaderBadge}>
                        {unreadMessageCount}
                      </span>
                    )}
                  </span>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    className={
                      isConnected ? styles.liveDotOn : styles.liveDotOff
                    }
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
                      setShowMsgDropdown(false);
                      setSelectedChat(null);
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              <div className={styles.msgPanelContent}>
                {selectedChat ? (
                  <div className={styles.msgThread}>
                    <div className={styles.msgThreadMessages}>
                      {chatLoading ? (
                        <div className={styles.msgEmpty}>Loading...</div>
                      ) : (chatHistory[selectedChat._id] || []).length === 0 ? (
                        <div className={styles.msgEmpty}>
                          Say hello to {selectedChat.name}
                        </div>
                      ) : (
                        (chatHistory[selectedChat._id] || []).map((m, idx) => {
                          const list = chatHistory[selectedChat._id] || [];
                          const senderId = m.sender?._id || m.sender;
                          const isMine =
                            String(senderId) !== String(selectedChat._id);
                          const senderName = isMine
                            ? user?.name || "You"
                            : m.sender?.name || selectedChat.name;
                          const prev = idx > 0 ? list[idx - 1] : null;
                          const prevSenderId = prev
                            ? prev.sender?._id || prev.sender
                            : null;
                          const showName =
                            !prev || String(prevSenderId) !== String(senderId);
                          return (
                            <div
                              key={m._id}
                              className={`${styles.msgBubbleRow} ${isMine ? styles.msgBubbleRowMine : ""}`}
                            >
                              <div
                                className={`${styles.msgBubble} ${isMine ? styles.msgBubbleMine : ""}`}
                              >
                                {showName && (
                                  <span className={styles.msgSenderName}>
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
                        <div className={styles.msgTypingIndicator}>
                          {selectedChat.name} is typing...
                        </div>
                      )}
                    </div>
                    <div className={styles.msgInputRow}>
                      <input
                        type="text"
                        value={newMessage}
                        placeholder="Type a message..."
                        onChange={(e) => handleTypingInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") sendMessage();
                        }}
                      />
                      <button onClick={sendMessage}>
                        <FiSend size={14} />
                      </button>
                    </div>
                  </div>
                ) : showNewChatList ? (
                  <div className={styles.msgList}>
                    {availableUsers.map((u) => (
                      <div
                        key={u._id}
                        className={styles.msgItem}
                        onClick={() => openChat(u)}
                      >
                        <div className={styles.msgItemBody}>
                          <span className={styles.msgItemTitle}>
                            {u.name}
                            {onlineUserIds.includes(u._id) && (
                              <FaCircle
                                style={{
                                  fontSize: 8,
                                  color: "#10b981",
                                  marginLeft: 6,
                                }}
                              />
                            )}
                          </span>
                          <span className={styles.msgItemSub}>{u.role}</span>
                        </div>
                      </div>
                    ))}
                    {availableUsers.length === 0 && (
                      <div className={styles.msgEmpty}>No users available</div>
                    )}
                  </div>
                ) : conversations.filter((c) => c.user).length === 0 ? (
                  <div className={styles.msgEmpty}>No messages yet</div>
                ) : (
                  <div className={styles.msgList}>
                    {conversations
                      .filter((c) => c.user)
                      .map((c) => (
                        <div
                          key={c.user._id}
                          className={`${styles.msgItem} ${c.unreadCount > 0 ? styles.msgItemUnread : ""}`}
                          onClick={() => openChat(c.user)}
                        >
                          <div className={styles.msgItemBody}>
                            <span className={styles.msgItemTitle}>
                              {c.user.name}
                              {onlineUserIds.includes(c.user._id) && (
                                <FaCircle
                                  style={{
                                    fontSize: 8,
                                    color: "#10b981",
                                    marginLeft: 6,
                                  }}
                                />
                              )}
                            </span>
                            <span className={styles.msgItemSub}>
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
              </div>
            </div>
          </>
        )}

        <div className={styles.content}>{renderContent()}</div>
      </main>
    </div>
  );
};

export default CounselorDashboard;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaChalkboardTeacher,
  FaUsers,
  FaCalendarCheck,
  FaTasks,
  FaBookOpen,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaUserGraduate,
  FaChartLine,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaSignOutAlt,
  FaBell,
  FaTimes,
  FaEye,
  FaDownload,
  FaPlus,
  FaEdit,
  FaTrash,
  FaStar,
  FaAward,
  FaTrophy,
  FaClipboardList,
  FaSpinner,
  FaLayerGroup,
  FaUserTie,
  FaEnvelope,
  FaArrowLeft,
  FaCircle,
  FaUserPlus,
} from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import styles from "./TrainerDashboard.module.css";
import api from "../../../services/api";
import { getUser, clearAuth } from "../../../services/auth";
import { useSocket } from "../../../context/SocketContext";
import { useSocketEvents } from "../../../hooks/useSocketEvents";

// Attendance Component
import AttendanceTable from "./AttendanceTable/TrainerAttendanceMarker";

// Batch Management Component
import BatchManagement from "./Betch/BatchManagement";
import StudentPerformance from "./Performance/StudentPerformance";
import Assignments from "./Performance/Assignments";
import Tests from "./Performance/Tests";
import CourseMaterials from "./CourseMaterials";

const TrainerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBatchManagement, setShowBatchManagement] = useState(false);
  const [loading, setLoading] = useState(true);

  // Messaging
  const [showMessages, setShowMessages] = useState(false);
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

  // Real data from database
  const [batches, setBatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalStudents: 0,
    activeAssignments: 0,
    upcomingTests: 0,
  });

  const { isConnected, reconnectSocket } = useSocket();

  useEffect(() => {
    const parsedUser = getUser();
    if (parsedUser) {
      setUser(parsedUser);
      console.log("=== TRAINER DASHBOARD ===");
      console.log("✅ Trainer loaded:", parsedUser.name);
      console.log("✅ Trainer Role:", parsedUser.role);
    }
    fetchTrainerData();
  }, []);

  // Fetch real data from backend
  const fetchTrainerData = async () => {
    setLoading(true);
    try {
      const batchesResponse = await api.get("/batches/trainer/assigned");
      if (batchesResponse.data.success) {
        const batchesData = batchesResponse.data.data;
        setBatches(batchesData);

        const totalStudents = batchesData.reduce(
          (sum, batch) => sum + (batch.studentsCount || 0),
          0,
        );
        setStats({
          totalBatches: batchesData.length,
          totalStudents: totalStudents,
          activeAssignments: batchesData.reduce(
            (sum, batch) => sum + (batch.activeAssignments || 0),
            0,
          ),
          upcomingTests: batchesData.reduce(
            (sum, batch) => sum + (batch.upcomingTests || 0),
            0,
          ),
        });
      }

      const notifResponse = await api.get("/notifications");
      if (notifResponse.data.success) {
        setNotifications(notifResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching trainer data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
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

  const toggleMessages = () => {
    setShowMessages((s) => !s);
    if (!showMessages) {
      setSelectedChat(null);
      setShowNewChatList(false);
      fetchConversations();
      fetchAvailableUsers();
    }
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
        // Add to UI immediately from REST response — no socket echo back to sender
        setChatHistory((prev) => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), res.data.data],
        }));
        // Update conversation preview inline — no fetchConversations needed
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
      // Backend ONLY emits new-message to the RECEIVER's room.
      // So this handler is ALWAYS processing an incoming message —
      // we are ALWAYS the receiver, the sender is ALWAYS the other party.
      const otherUserId = String(message.sender?._id || message.sender);

      setSelectedChat((current) => {
        if (current && String(current._id) === otherUserId) {
          setChatHistory((prev) => ({
            ...prev,
            [otherUserId]: [...(prev[otherUserId] || []), message],
          }));
          // Auto-mark as read since the chat is open
          api.put(`/messages/${message._id}/read`).catch(() => {});
        }
        return current;
      });

      // Update conversation list — no full refetch, just inline update
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
        // New conversation — do a one-time background fetch
        fetchConversations();
        return prev;
      });

      // Always toast for incoming messages (since we are always the receiver here)
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

  const handleLogout = () => {
    clearAuth();
    if (reconnectSocket) reconnectSocket(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "T";
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(
        notifications.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif,
        ),
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter((notif) => notif._id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ✅ Get display name and role from user object
  const displayName = user?.name || "Trainer";
  const displayRole = "Trainer";

  // Sidebar Menu Items
  const menuItems = [
    { id: "overview", label: "Batch Overview", icon: FaChalkboardTeacher },
    { id: "attendance", label: "Attendance Table", icon: FaCalendarCheck },
    { id: "assignments", label: "Assignments", icon: FaTasks },
    { id: "tests", label: "Tests", icon: FaFileAlt },
    { id: "performance", label: "Student Performance", icon: FaChartLine },
    { id: "materials", label: "Course Materials", icon: FaBookOpen },
  ];

  // Overview Component
  const OverviewComponent = () => (
    <div className={styles.overviewContainer}>
      {/* Trainer Welcome */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <h2>Welcome back, {displayName}! 👋</h2>
          <p>Here's what's happening with your batches today.</p>
        </div>
        <div className={styles.trainerBadge}>
          <FaUserTie /> {displayRole}
        </div>
      </div>

      {/* Batch Management Button */}
      <div className={styles.batchManagementBtnContainer}>
        <button
          className={styles.batchManagementBtn}
          onClick={() => setShowBatchManagement(true)}
        >
          <FaLayerGroup /> Manage Batches
        </button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaChalkboardTeacher />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.totalBatches}</span>
            <span className={styles.statLabel}>Total Batches</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUsers />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.totalStudents}</span>
            <span className={styles.statLabel}>Total Students</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaTasks />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.activeAssignments}</span>
            <span className={styles.statLabel}>Active Assignments</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaFileAlt />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.upcomingTests}</span>
            <span className={styles.statLabel}>Upcoming Tests</span>
          </div>
        </div>
      </div>

      {/* Batches Section */}
      <div className={styles.batchesSection}>
        <div className={styles.sectionHeader}>
          <h3>My Batches</h3>
          <button className={styles.viewAllBtn}>View All</button>
        </div>
        <div className={styles.batchesGrid}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <FaSpinner className={styles.spinner} /> Loading batches...
            </div>
          ) : batches.length === 0 ? (
            <div className={styles.emptyContainer}>
              No batches assigned yet.
            </div>
          ) : (
            batches.map((batch) => (
              <div key={batch._id} className={styles.batchCard}>
                <div className={styles.batchHeader}>
                  <h4>{batch.name}</h4>
                  <span
                    className={`${styles.batchStatus} ${batch.status === "active" ? styles.active : styles.completed}`}
                  >
                    {batch.status === "active" ? "Active" : "Completed"}
                  </span>
                </div>
                <div className={styles.batchDetails}>
                  <p>
                    <span>📚 Code:</span> {batch.code}
                  </p>
                  <p>
                    <span>👨‍🎓 Students:</span> {batch.studentsCount || 0}
                  </p>
                  <p>
                    <span>⏰ Time:</span> {batch.timings || "Not set"}
                  </p>
                  <p>
                    <span>📅 Days:</span> {batch.days || "Not set"}
                  </p>
                </div>
                <div className={styles.progressSection}>
                  <div className={styles.progressLabel}>
                    <span>Course Progress</span>
                    <span>{batch.progress || 0}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${batch.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className={styles.batchActions}>
                  <button className={styles.actionBtn}>
                    <FaEye /> View
                  </button>
                  <button className={styles.actionBtn}>
                    <FaEdit /> Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.recentActivity}>
        <div className={styles.sectionHeader}>
          <h3>Recent Activity</h3>
          <button className={styles.viewAllBtn}>View All</button>
        </div>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <FaUserGraduate />
            </div>
            <div className={styles.activityContent}>
              <p>New student joined your batch</p>
              <span>2 hours ago</span>
            </div>
          </div>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <FaTasks />
            </div>
            <div className={styles.activityContent}>
              <p>New assignment submitted</p>
              <span>5 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Placeholder components
  const PlaceholderContent = ({ title, description }) => (
    <div className={styles.placeholderBox}>
      <h3>{title}</h3>
      <p>{description}</p>
      <p className={styles.placeholderHint}>
        👉 Baad me aap apna component yahan import kar lena
      </p>
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    if (showBatchManagement) {
      return <BatchManagement onBack={() => setShowBatchManagement(false)} />;
    }

    switch (activeTab) {
      case "overview":
        return <OverviewComponent />;
      case "attendance":
        return <AttendanceTable />;
      case "assignments":
        return <Assignments />;
      case "tests":
        return <Tests />;
      case "performance":
        return <StudentPerformance />;
      case "materials":
        return <CourseMaterials />;
      default:
        return <OverviewComponent />;
    }
  };

  if (loading && batches.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

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

      {/* Notification Panel */}
      {showNotifications && (
        <>
          <div className={styles.notificationPanel}>
            <div className={styles.notificationHeader}>
              <h3>
                <FaBell /> Notifications{" "}
                <span className={styles.notifBadge}>{unreadCount}</span>
              </h3>
              <div className={styles.notifActions}>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} title="Mark all as read">
                    <FaCheckCircle />
                  </button>
                )}
                <button onClick={() => setShowNotifications(false)}>
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className={styles.trackingInfo}>
              {isConnected ? "🟢 Live" : "🔴 Offline"}
            </div>
            <div className={styles.notificationList}>
              {notifications.length === 0 ? (
                <div className={styles.emptyNotifications}>
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`${styles.notificationItem} ${!notif.read ? styles.unread : ""}`}
                  >
                    <div className={styles.notifContent}>
                      <h4>{notif.title}</h4>
                      <p>{notif.message}</p>
                      <span>{notif.time}</span>
                    </div>
                    <div className={styles.notifActions}>
                      {!notif.read && (
                        <button
                          onClick={() => markAsRead(notif._id)}
                          title="Mark as read"
                        >
                          <FaCheckCircle />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif._id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div
            className={styles.overlay}
            onClick={() => setShowNotifications(false)}
          ></div>
        </>
      )}

      {/* Messages Panel */}
      {showMessages && (
        <>
          <div className={styles.notificationPanel}>
            <div className={styles.notificationHeader}>
              <h3>
                {selectedChat ? (
                  <>
                    <button
                      onClick={() => setSelectedChat(null)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        marginRight: 6,
                      }}
                    >
                      <FaArrowLeft />
                    </button>
                    {selectedChat.name}
                    {onlineUserIds.includes(selectedChat._id) && (
                      <FaCircle
                        style={{ fontSize: 8, color: "#10b981", marginLeft: 8 }}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <FaEnvelope /> Messages{" "}
                    {unreadMessageCount > 0 && (
                      <span className={styles.notifBadge}>
                        {unreadMessageCount}
                      </span>
                    )}
                  </>
                )}
              </h3>
              <div className={styles.notifActions}>
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
            <div className={styles.trackingInfo}>
              {isConnected ? "🟢 Live" : "🔴 Offline"}
            </div>

            {selectedChat ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "calc(100% - 90px)",
                }}
              >
                <div className={styles.notificationList} style={{ flex: 1 }}>
                  {chatLoading ? (
                    <div className={styles.emptyNotifications}>
                      <p>Loading...</p>
                    </div>
                  ) : (chatHistory[selectedChat._id] || []).length === 0 ? (
                    <div className={styles.emptyNotifications}>
                      <p>Say hello to {selectedChat.name}</p>
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
                          style={{
                            display: "flex",
                            justifyContent: isMine ? "flex-end" : "flex-start",
                            padding: "4px 12px",
                          }}
                        >
                          <div
                            style={{
                              maxWidth: "75%",
                              padding: "8px 12px",
                              borderRadius: isMine
                                ? "14px 14px 4px 14px"
                                : "14px 14px 14px 4px",
                              background: isMine ? "#8b5cf6" : "#334155",
                              color: "white",
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
                        padding: "4px 12px",
                        fontSize: 12,
                        color: "#94a3b8",
                        fontStyle: "italic",
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
                    padding: 12,
                    borderTop: "1px solid #334155",
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
                      padding: "8px 12px",
                      borderRadius: 20,
                      border: "1px solid #334155",
                      background: "#0f172a",
                      color: "white",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      border: "none",
                      background: "#8b5cf6",
                      color: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FiSend />
                  </button>
                </div>
              </div>
            ) : showNewChatList ? (
              <div className={styles.notificationList}>
                {availableUsers.map((u) => (
                  <div
                    key={u._id}
                    className={styles.notificationItem}
                    style={{ cursor: "pointer" }}
                    onClick={() => openChat(u)}
                  >
                    <div className={styles.notifContent}>
                      <h4>
                        {u.name}
                        {onlineUserIds.includes(u._id) && (
                          <FaCircle
                            style={{
                              fontSize: 8,
                              color: "#10b981",
                              marginLeft: 8,
                            }}
                          />
                        )}
                      </h4>
                      <p>{u.role}</p>
                    </div>
                  </div>
                ))}
                {availableUsers.length === 0 && (
                  <div className={styles.emptyNotifications}>
                    <p>No users available</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.notificationList}>
                {conversations.filter((c) => c.user).length === 0 ? (
                  <div className={styles.emptyNotifications}>
                    <p>No messages yet</p>
                  </div>
                ) : (
                  conversations
                    .filter((c) => c.user)
                    .map((c) => (
                      <div
                        key={c.user._id}
                        className={`${styles.notificationItem} ${c.unreadCount > 0 ? styles.unread : ""}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => openChat(c.user)}
                      >
                        <div className={styles.notifContent}>
                          <h4>
                            {c.user.name}
                            {onlineUserIds.includes(c.user._id) && (
                              <FaCircle
                                style={{
                                  fontSize: 8,
                                  color: "#10b981",
                                  marginLeft: 8,
                                }}
                              />
                            )}
                          </h4>
                          <p>{c.lastMessage?.text}</p>
                        </div>
                        {c.unreadCount > 0 && (
                          <span className={styles.notifBadge}>
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
          <div
            className={styles.overlay}
            onClick={() => {
              setShowMessages(false);
              setSelectedChat(null);
            }}
          ></div>
        </>
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ""} ${mobileMenuOpen ? styles.sidebarMobile : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <FaChalkboardTeacher />
            </div>
            {!sidebarCollapsed && (
              <span className={styles.logoText}>Trainer Portal</span>
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
                setShowBatchManagement(false);
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
          {/* ✅ Trainer Info in Sidebar */}
          <div className={styles.sidebarUserInfo}>
            <div className={styles.sidebarAvatar}>
              {getInitial(displayName)}
            </div>
            {!sidebarCollapsed && (
              <div className={styles.sidebarUserDetails}>
                <span className={styles.sidebarUserName}>{displayName}</span>
                <span className={styles.sidebarUserRole}>{displayRole}</span>
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
        {/* Header */}
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
                {showBatchManagement
                  ? "Batch Management"
                  : menuItems.find((item) => item.id === activeTab)?.label ||
                    "Dashboard"}
              </h2>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.iconBtn} onClick={toggleMessages}>
              <FaEnvelope />
              {unreadMessageCount > 0 && (
                <span className={styles.badge}>{unreadMessageCount}</span>
              )}
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell />
              {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </button>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>{getInitial(displayName)}</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.userRole}>{displayRole}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className={styles.content}>{renderContent()}</div>
      </main>
    </div>
  );
};

export default TrainerDashboard;

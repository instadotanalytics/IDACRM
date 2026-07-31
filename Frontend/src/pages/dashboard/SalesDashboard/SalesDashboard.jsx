// SalesDashboard.jsx — Main shell: sidebar + header + routing
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FaTachometerAlt,
  FaPhoneAlt,
  FaChartLine,
  FaCalendarAlt,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBell,
  FaSearch,
  FaFileAlt,
  FaChevronLeft,
  FaEnvelope,
} from "react-icons/fa";
import { FiTarget } from "react-icons/fi";
import { HiOutlineUsers } from "react-icons/hi";
import { RiCustomerService2Fill } from "react-icons/ri";

import NotificationPanel from "../SalesDashboard/NotificationPanel/NotificationPanel";
import MessagePanel from "../SalesDashboard/MessagePanel/MessagePanel";
import ProfileDropdown from "../SalesDashboard/ProfileDropdown/ProfileDropdown";
import DashboardOverview from "../SalesDashboard/DashboardOverview/DashboardOverview";
import CallsTracker from "../SalesDashboard/CallsTracker/CallsTracker";
import LeadsManager from "../SalesDashboard/LeadsManager/LeadsManager";
import SalesPipeline from "../SalesDashboard/SalesPipeline/SalesPipeline";
import TargetsTracker from "../SalesDashboard/TargetsTracker/TargetsTracker";
import ReportsAnalytics from "../SalesDashboard/ReportsAnalytics/ReportsAnalytics";
import CalendarView from "../SalesDashboard/CalendarView/CalendarView";
import SettingsView from "../SalesDashboard/SettingsView/SettingsView";

import styles from "./SalesDashboard.module.css";
import { getToken, getUser, clearAuth } from "../../../services/auth";
import api from "../../../services/api";
import { useSocket } from "../../../context/SocketContext";
import { useSocketEvents } from "../../../hooks/useSocketEvents";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
  { id: "calls", label: "Calls Tracker", icon: <FaPhoneAlt /> },
  { id: "leads", label: "Leads Management", icon: <HiOutlineUsers /> },
  { id: "pipeline", label: "Sales Pipeline", icon: <FaChartLine /> },
  { id: "targets", label: "Targets", icon: <FiTarget /> },
  { id: "reports", label: "Reports", icon: <FaFileAlt /> },
  { id: "calendar", label: "Calendar", icon: <FaCalendarAlt /> },
  { id: "settings", label: "Settings", icon: <FaCog /> },
];

const SalesDashboard = () => {
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const { isConnected, reconnectSocket } = useSocket();

  useEffect(() => {
    const token = getToken();
    const userData = getUser();
    if (!token || !userData) {
      window.location.replace("/login");
      return;
    }
    setUser(userData);
    fetchNotifications();
    fetchConversations();
  }, []);

  const userId = user?._id || user?.id;

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      if (res.data.success) setNotifications(res.data.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

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
    setShowMessages((s) => !s);
    setNotifOpen(false);
    setProfileOpen(false);
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

  const sendChatMessage = async () => {
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
    onNewNotification: (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    },
    onNotificationRead: (data) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === data.notificationId ? { ...n, read: true } : n,
        ),
      );
    },
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

  // ─── THE FIX: clear storage, show toast, then redirect ───────────────────
  const handleLogout = () => {
    if (isLoggingOut) return; // prevent double-click
    setIsLoggingOut(true);

    // Clear all session data (sessionStorage + localStorage via clearAuth)
    clearAuth();

    // Disconnect socket cleanly
    if (reconnectSocket) reconnectSocket(null);

    toast.success("Logged out successfully", { duration: 1500 });

    setTimeout(() => {
      window.location.replace("/login");
    }, 1200);
  };

  const handleMouseEnter = (item, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({ x: rect.right + 10, y: rect.top + rect.height / 2 });
    setHoveredItem(item);
  };

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const toggleBell = () => {
    setNotifOpen((prev) => !prev);
    setProfileOpen(false);
  };

  const toggleProfile = () => {
    setProfileOpen((prev) => !prev);
    setNotifOpen(false);
  };

  const handleMarkRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  const handleMarkAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.put("/notifications/read-all");
    } catch (error) {
      console.error("Error marking all notifications read:", error);
    }
  };

  const notifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={styles.app}>
      {/* Sidebar tooltip */}
      {hoveredItem && sidebarCollapsed && (
        <div
          className={styles.tooltip}
          style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
        >
          {hoveredItem.label}
        </div>
      )}

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside
        className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ""} ${isMobileOpen ? styles.mobileOpen : ""}`}
      >
        <div className={styles.sidebarTop}>
          <div className={styles.logoArea}>
            {sidebarCollapsed ? (
              <span className={styles.logoIcon}>
                <RiCustomerService2Fill />
              </span>
            ) : (
              <span className={styles.logoText}>IDA ERP CRM</span>
            )}
          </div>
          <button
            className={styles.collapseBtn}
            onClick={() => setSidebarCollapsed((p) => !p)}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <FaBars /> : <FaChevronLeft />}
          </button>
          <button
            className={styles.mobileCloseBtn}
            onClick={() => setIsMobileOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className={styles.sidebarUser}>
          <div className={styles.userAvatar}>
            {user?.avatar || (user?.name?.charAt(0) ?? "S")}
          </div>
          {!sidebarCollapsed && (
            <div className={styles.userMeta}>
              <span className={styles.uName}>
                {user?.name || "Sales Executive"}
              </span>
              <span className={styles.uRole}>
                {user?.role || "Sales Executive"}
              </span>
            </div>
          )}
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeTab === item.id ? styles.active : ""}`}
              onClick={() => handleNavClick(item.id)}
              onMouseEnter={(e) => handleMouseEnter(item, e)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!sidebarCollapsed && (
                <span className={styles.navLabel}>{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            className={`${styles.navItem} ${isLoggingOut ? styles.loggingOut : ""}`}
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Logout"
          >
            <span
              className={`${styles.navIcon} ${isLoggingOut ? styles.spinIcon : ""}`}
            >
              <FaSignOutAlt />
            </span>
            {!sidebarCollapsed && (
              <span className={styles.navLabel}>
                {isLoggingOut ? "Logging out..." : "Logout"}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.mobileMenuBtn}
              onClick={() => setIsMobileOpen(true)}
            >
              <FaBars />
            </button>
            <div className={styles.searchBar}>
              <FaSearch />
              <input
                type="text"
                placeholder="Search leads, opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.headerRight}>
            {/* Messages */}
            <button className={styles.bellBtn} onClick={openMessages}>
              <FaEnvelope />
              {unreadMessageCount > 0 && (
                <span className={styles.bellBadge}>{unreadMessageCount}</span>
              )}
            </button>

            {/* Bell */}
            <button className={styles.bellBtn} onClick={toggleBell}>
              <FaBell />
              {notifCount > 0 && (
                <span className={styles.bellBadge}>{notifCount}</span>
              )}
            </button>

            {/* Profile */}
            <ProfileDropdown
              user={user}
              isOpen={profileOpen}
              onToggle={toggleProfile}
              onClose={() => setProfileOpen(false)}
              onLogout={handleLogout}
              onNavigate={handleNavClick}
              isLoggingOut={isLoggingOut}
            />
          </div>
        </header>

        {/* Notification panel */}
        <NotificationPanel
          isOpen={notifOpen}
          onClose={() => setNotifOpen(false)}
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onMarkAll={handleMarkAll}
        />

        {/* Messages panel */}
        <MessagePanel
          isOpen={showMessages}
          onClose={() => {
            setShowMessages(false);
            setSelectedChat(null);
          }}
          userId={userId}
          currentUserName={user?.name}
          isConnected={isConnected}
          selectedChat={selectedChat}
          onSelectChat={openChat}
          onBack={() => setSelectedChat(null)}
          conversations={conversations}
          availableUsers={availableUsers}
          showNewChatList={showNewChatList}
          onToggleNewChatList={() => setShowNewChatList((s) => !s)}
          chatHistory={chatHistory}
          chatLoading={chatLoading}
          typingFrom={typingFrom}
          onlineUserIds={onlineUserIds}
          newMessage={newMessage}
          onTypingInput={handleTypingInput}
          onSend={sendChatMessage}
        />

        {/* Content */}
        <div className={styles.content}>
          {activeTab === "dashboard" && (
            <DashboardOverview user={user} onNavigate={handleNavClick} />
          )}
          {activeTab === "calls" && <CallsTracker />}
          {activeTab === "leads" && <LeadsManager />}
          {activeTab === "pipeline" && <SalesPipeline />}
          {activeTab === "targets" && <TargetsTracker />}
          {activeTab === "reports" && <ReportsAnalytics />}
          {activeTab === "calendar" && <CalendarView />}
          {activeTab === "settings" && <SettingsView user={user} />}
        </div>
      </main>
    </div>
  );
};

export default SalesDashboard;

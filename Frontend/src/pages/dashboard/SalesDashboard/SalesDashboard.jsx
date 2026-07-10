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
} from "react-icons/fa";
import { FiTarget } from "react-icons/fi";
import { HiOutlineUsers } from "react-icons/hi";
import { RiCustomerService2Fill } from "react-icons/ri";

import NotificationPanel from "../SalesDashboard/NotificationPanel/NotificationPanel";
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
  const [notifCount, setNotifCount] = useState(3);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    // If no user or token at all, redirect immediately to login
    if (!localStorage.getItem("token") && !userData) {
      window.location.replace("/login");
      return;
    }
    setUser(
      userData
        ? JSON.parse(userData)
        : {
            name: "Sales Manager",
            role: "sales_executive",
            email: "sales@ida.com",
            avatar: "S",
          },
    );
  }, []);

  // ─── THE FIX: clear storage, show toast, then redirect ───────────────────
  const handleLogout = () => {
    if (isLoggingOut) return; // prevent double-click
    setIsLoggingOut(true);

    // Clear all session data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    toast.success("Logged out successfully", { duration: 1500 });

    // Small delay so the toast is visible before the page changes
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

  const handleMarkRead = (id) => {
    setNotifCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAll = () => setNotifCount(0);

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
          onMarkRead={handleMarkRead}
          onMarkAll={handleMarkAll}
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

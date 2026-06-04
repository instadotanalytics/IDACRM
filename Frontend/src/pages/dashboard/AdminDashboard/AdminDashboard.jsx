// AdminDashboard.jsx
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
  FaChevronDown,
  FaTachometerAlt,
  FaUsers,
  FaChalkboardTeacher,
  FaChartLine,
  FaBuilding,
  FaCalendarCheck,
  FaTasks,
  FaFileAlt,
  FaTimes,
  FaBookOpen,
  FaDownload,
  FaClipboardList,
  FaQuestionCircle,
} from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import styles from "./AdminDashboard.module.css";
import TrainerManagement from "./TrannerManagement/TrainerManagement";

const TRAINER_SUB_TABS = [
  { id: "trainers", label: "Trainers List", icon: FaChalkboardTeacher },
  { id: "batches", label: "Batch Assignment", icon: FaBookOpen },
  { id: "attendance", label: "Attendance", icon: FaCalendarCheck },
  { id: "assignments", label: "Assignments", icon: FaClipboardList },
  { id: "tests", label: "Tests", icon: FaQuestionCircle },
  { id: "materials", label: "Study Materials", icon: FaDownload },
  { id: "performance", label: "Analytics", icon: FaChartLine },
];

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: FaTachometerAlt },
  { id: "employees", label: "Employee Management", icon: FaUsers },
  {
    id: "trainers",
    label: "Trainer Management",
    icon: FaChalkboardTeacher,
    hasDropdown: true,
  },
  { id: "sales", label: "Sales Team", icon: FaChartLine },
  { id: "hr", label: "HR Management", icon: FaBuilding },
  { id: "attendance", label: "Attendance Monitoring", icon: FaCalendarCheck },
  { id: "tasks", label: "Task Management", icon: FaTasks },
  { id: "reports", label: "Reports", icon: FaFileAlt },
  { id: "settings", label: "Settings", icon: IoMdSettings },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeTrainerSubTab, setActiveTrainerSubTab] = useState("trainers");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "A");

  const handleTrainerSubTabClick = (tabId) => {
    setActiveTab("trainers");
    setActiveTrainerSubTab(tabId);
    setOpenDropdown(null);
    setTooltip(null);
  };

  const handleNavClick = (item) => {
    setActiveTab(item.id);
    if (item.hasDropdown) {
      setOpenDropdown(openDropdown === item.id ? null : item.id);
    } else {
      setOpenDropdown(null);
    }
    setTooltip(null);
  };

  const handleNavMouseEnter = (item, e) => {
    if (!sidebarCollapsed) return;

    if (hoverTimeout) clearTimeout(hoverTimeout);

    const rect = e.currentTarget.getBoundingClientRect();
    if (item.hasDropdown) {
      setTooltip({
        type: "trainer",
        label: item.label,
        top: rect.top,
        left: rect.right,
      });
    } else {
      setTooltip({
        type: "simple",
        label: item.label,
        top: rect.top + rect.height / 2,
        left: rect.right,
      });
    }
  };

  const handleNavMouseLeave = () => {
    const timeout = setTimeout(() => {
      setTooltip(null);
    }, 300);
    setHoverTimeout(timeout);
  };

  const handleTooltipMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleTooltipMouseLeave = () => {
    setTooltip(null);
  };

  const getPageTitle = () => {
    if (activeTab === "trainers") {
      const sub = TRAINER_SUB_TABS.find((t) => t.id === activeTrainerSubTab);
      return `Trainer Management — ${sub?.label || ""}`;
    }
    return MENU_ITEMS.find((i) => i.id === activeTab)?.label || "Dashboard";
  };

  const stats = {
    employees: { total: 85, active: 72, inactive: 13 },
    trainers: { total: 12, activeBatches: 8, totalStudents: 245 },
    sales: { totalLeads: 348, convertedLeads: 156 },
    hr: { companies: 48, placementDrives: 12, studentsPlaced: 124 },
    attendance: { present: 68, absent: 12 },
    tasks: { pending: 18, completed: 42 },
  };

  const activities = [
    {
      id: 1,
      icon: "👤",
      text: "New employee Rahul Sharma joined Sales department",
      time: "2 hours ago",
    },
    {
      id: 2,
      icon: "✅",
      text: 'Task "Review monthly report" completed',
      time: "5 hours ago",
    },
    {
      id: 3,
      icon: "🎓",
      text: "New admission for Full Stack Development course",
      time: "1 day ago",
    },
    {
      id: 4,
      icon: "📊",
      text: "Attendance marked for FSD Batch today",
      time: "1 day ago",
    },
  ];

  const StatsCards = () => (
    <div className={styles.statsGrid}>
      {[
        {
          icon: <FaUsers />,
          val: stats.employees.total,
          label: "Total Employees",
          sub: `Active: ${stats.employees.active} | Inactive: ${stats.employees.inactive}`,
        },
        {
          icon: <FaChalkboardTeacher />,
          val: stats.trainers.total,
          label: "Trainers",
          sub: `Active Batches: ${stats.trainers.activeBatches}`,
        },
        {
          icon: <FaChartLine />,
          val: stats.sales.totalLeads,
          label: "Total Leads",
          sub: `Converted: ${stats.sales.convertedLeads}`,
        },
        {
          icon: <FaBuilding />,
          val: stats.hr.companies,
          label: "Companies",
          sub: `Drives: ${stats.hr.placementDrives}`,
        },
        {
          icon: <FaCalendarCheck />,
          val: stats.attendance.present,
          label: "Present Today",
          sub: `Absent: ${stats.attendance.absent}`,
        },
        {
          icon: <FaTasks />,
          val: stats.tasks.pending,
          label: "Pending Tasks",
          sub: `Completed: ${stats.tasks.completed}`,
        },
      ].map((s, i) => (
        <div key={i} className={styles.statCard}>
          <div className={styles.statIcon}>{s.icon}</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{s.val}</span>
            <span className={styles.statLabel}>{s.label}</span>
            <div className={styles.statSub}>{s.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const ChartsSection = () => (
    <div className={styles.chartsSection}>
      <div className={styles.chartCard}>
        <h3>Attendance Overview</h3>
        <div className={styles.donutChart}>
          <div
            className={styles.donutSegment}
            style={{ width: "68%", background: "#10b981" }}
          >
            Present 68%
          </div>
          <div
            className={styles.donutSegment}
            style={{ width: "12%", background: "#ef4444" }}
          >
            Absent 12%
          </div>
          <div
            className={styles.donutSegment}
            style={{ width: "20%", background: "#f59e0b" }}
          >
            Leave/Other 20%
          </div>
        </div>
      </div>
      <div className={styles.chartCard}>
        <h3>Sales Conversion</h3>
        <div className={styles.barChart}>
          <div className={styles.bar} style={{ height: "45%" }}>
            <span>Leads 45%</span>
          </div>
          <div className={styles.bar} style={{ height: "30%" }}>
            <span>Converted 30%</span>
          </div>
          <div className={styles.bar} style={{ height: "25%" }}>
            <span>Lost 25%</span>
          </div>
        </div>
      </div>
      <div className={styles.chartCard}>
        <h3>Placement Analytics</h3>
        <div className={styles.placementStats}>
          <div className={styles.placementItem}>
            <span>Students Placed: {stats.hr.studentsPlaced}</span>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: "65%" }}
              ></div>
            </div>
          </div>
          <div className={styles.placementItem}>
            <span>Placement Ratio: 65%</span>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: "65%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const RecentActivities = () => (
    <div className={styles.recentActivities}>
      <h3>Recent Activities</h3>
      <div className={styles.activityList}>
        {activities.map((a) => (
          <div key={a.id} className={styles.activityItem}>
            <div className={styles.activityIcon}>{a.icon}</div>
            <div className={styles.activityContent}>
              <p>{a.text}</p>
              <span>{a.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Placeholder = () => (
    <div className={styles.placeholderBox}>Content coming soon...</div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <StatsCards />
            <ChartsSection />
            <RecentActivities />
          </>
        );
      case "trainers":
        return (
          <TrainerManagement
            activeSubTab={activeTrainerSubTab}
            setActiveSubTab={setActiveTrainerSubTab}
          />
        );
      default:
        return <Placeholder />;
    }
  };

  return (
    <div
      className={`${styles.app} ${sidebarCollapsed ? styles.appCollapsed : ""}`}
    >
      {/* Notification Panel */}
      {showNotifications && (
        <div className={styles.notificationPanel}>
          <div className={styles.panelHeader}>
            <h3>
              <FaBell /> Notifications
            </h3>
            <button onClick={() => setShowNotifications(false)}>
              <FaTimes />
            </button>
          </div>
          <div className={styles.notificationList}>
            <div className={styles.notificationItem}>
              <div className={styles.notifContent}>
                <h4>No new notifications</h4>
                <p>You are all caught up!</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {showChat && (
        <div className={styles.chatPanel}>
          <div className={styles.panelHeader}>
            <h3>
              <FaEnvelope /> Messages
            </h3>
            <button onClick={() => setShowChat(false)}>
              <FaTimes />
            </button>
          </div>
          <div className={styles.chatMessages}>
            <div className={styles.emptyChat}>
              <p>Select a contact to start messaging</p>
            </div>
          </div>
        </div>
      )}
      {(showNotifications || showChat) && (
        <div
          className={styles.overlay}
          onClick={() => {
            setShowNotifications(false);
            setShowChat(false);
          }}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ""} ${mobileMenuOpen ? styles.sidebarMobile : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>🏢</div>
            {!sidebarCollapsed && (
              <span className={styles.logoText}>Admin Portal</span>
            )}
          </div>
          {!sidebarCollapsed ? (
            <button
              className={styles.collapseBtn}
              onClick={() => setSidebarCollapsed(true)}
            >
              <FaChevronLeft />
            </button>
          ) : (
            <button
              className={styles.expandBtn}
              onClick={() => setSidebarCollapsed(false)}
            >
              <FaChevronRight />
            </button>
          )}
        </div>

        <nav className={styles.nav}>
          {MENU_ITEMS.map((item) => {
            const isTrainer = item.hasDropdown;
            const isActive = activeTab === item.id;
            const isDropdownOpen = openDropdown === item.id;

            return (
              <div
                key={item.id}
                className={styles.navItemWrapper}
                onMouseEnter={(e) => handleNavMouseEnter(item, e)}
                onMouseLeave={handleNavMouseLeave}
              >
                <button
                  className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                  onClick={() => handleNavClick(item)}
                >
                  <item.icon className={styles.navIcon} />
                  {!sidebarCollapsed && (
                    <>
                      <span className={styles.navLabel}>{item.label}</span>
                      {isTrainer && (
                        <FaChevronDown
                          className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.rotated : ""}`}
                        />
                      )}
                    </>
                  )}
                </button>

                {/* Dropdown for expanded sidebar */}
                {!sidebarCollapsed && isTrainer && isDropdownOpen && (
                  <div className={styles.expandedDropdown}>
                    {TRAINER_SUB_TABS.map((sub) => (
                      <button
                        key={sub.id}
                        className={`${styles.subNavItem} ${isActive && activeTrainerSubTab === sub.id ? styles.subNavActive : ""}`}
                        onClick={() => handleTrainerSubTabClick(sub.id)}
                      >
                        <sub.icon className={styles.subNavIcon} />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{getInitial(user?.name)}</div>
            {!sidebarCollapsed && (
              <div>
                <div className={styles.userName}>{user?.name || "Admin"}</div>
                <div className={styles.userRole}>Admin Manager</div>
              </div>
            )}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FaSignOutAlt /> {!sidebarCollapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* Tooltip for collapsed sidebar */}
      {sidebarCollapsed && tooltip && (
        <div
          className={
            tooltip.type === "trainer"
              ? styles.fixedFlyout
              : styles.fixedTooltip
          }
          style={{
            top: tooltip.top - (tooltip.type === "trainer" ? 0 : 15),
            left: tooltip.left + 12,
          }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          {tooltip.type === "simple" && <span>{tooltip.label}</span>}
          {tooltip.type === "trainer" && (
            <>
              <div className={styles.flyoutTitle}>Trainer Management</div>
              {TRAINER_SUB_TABS.map((sub) => (
                <button
                  key={sub.id}
                  className={`${styles.flyoutItem} ${activeTab === "trainers" && activeTrainerSubTab === sub.id ? styles.flyoutItemActive : ""}`}
                  onClick={() => handleTrainerSubTabClick(sub.id)}
                >
                  <sub.icon className={styles.subNavIcon} />
                  <span>{sub.label}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* MAIN */}
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
              <h2>{getPageTitle()}</h2>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button
              className={styles.iconBtn}
              onClick={() => setShowChat(!showChat)}
            >
              <FaEnvelope />
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell />
            </button>
            <div className={styles.userProfile}>
              <div className={styles.avatarSmall}>{getInitial(user?.name)}</div>
              <div>
                <div className={styles.userName}>{user?.name || "Admin"}</div>
                <div className={styles.userRole}>Admin Manager</div>
              </div>
            </div>
          </div>
        </header>
        <div className={styles.content}>{renderContent()}</div>
      </main>
    </div>
  );
};

export default AdminDashboard;

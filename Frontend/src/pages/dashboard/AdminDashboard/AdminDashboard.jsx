// AdminDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
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
  FaPhoneAlt,
  FaClipboardList,
  FaBullseye,
  FaComments,
  FaBriefcase,
  FaHeadset,
  FaUserGraduate,
  FaDollarSign,
  FaPercent,
  FaUserPlus,
  FaHandshake,
  FaRocket,
  FaStar,
  FaRegCalendarAlt,
  FaRegFileAlt,
} from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { MdOutlineAccountBalance } from "react-icons/md";
import styles from "./AdminDashboard.module.css";
import BatchManagement from "../TrainerDashboard/Betch/BatchManagement";
import TrainerAttendanceMarker from "../TrainerDashboard/AttendanceTable/TrainerAttendanceMarker";
import Assignments from "../TrainerDashboard/Performance/Assignments";
import Tests from "../TrainerDashboard/Performance/Tests";
import CourseMaterials from "../TrainerDashboard/CourseMaterials";
import StudentPerformance from "../TrainerDashboard/Performance/StudentPerformance";

/* Sales Dashboard sub-modules */
import SalesDashboardOverview from "../SalesDashboard/DashboardOverview/DashboardOverview";
import SalesCallsTracker from "../SalesDashboard/CallsTracker/CallsTracker";
import SalesLeadsManager from "../SalesDashboard/LeadsManager/LeadsManager";
import SalesPipeline from "../SalesDashboard/SalesPipeline/SalesPipeline";
import SalesTargetsTracker from "../SalesDashboard/TargetsTracker/TargetsTracker";
import SalesReportsAnalytics from "../SalesDashboard/ReportsAnalytics/ReportsAnalytics";

/* HR Dashboard sub-modules */
import HRDashboardOverview from "../HRDashboard/HRDashboardOverview";
import HRCompaniesManager from "../HRDashboard/Companies/CompaniesManagement";
import HRInterviewsManager from "../HRDashboard/HRInterview/hrInterviewManagement";
import HRStudents from "../HRDashboard/HRstudent/hrStudentsManagement";
import HRPlacementDrives from "../HRDashboard/PlacementDrive/PlacementDriveManagement";
import HRReportsAnalytics from "../HRDashboard/Reports/hrReportsManagement";

/* Counselor Dashboard sub-modules */
import CounselorDashboardOverview from "../CounselorDashboard/CounselorDashboardOverview";
import CounselorLeads from "../CounselorDashboard/Leads/Leades";
import CounselorCalls from "../CounselorDashboard/CallsCounsler/Calls";
import CounselorAdmissions from "../CounselorDashboard/Admission/Admission";

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: FaTachometerAlt },
  { id: "counselor", label: "Counselor", icon: FaHeadset },
  { id: "trainers", label: "Trainer Management", icon: FaChalkboardTeacher },
  { id: "sales", label: "Sales Team", icon: FaChartLine },
  { id: "hr", label: "HR Management", icon: FaBuilding },
  { id: "attendance", label: "Attendance Monitoring", icon: FaCalendarCheck },
  { id: "tasks", label: "Task Management", icon: FaTasks },
  { id: "reports", label: "Reports", icon: FaFileAlt },
  { id: "settings", label: "Settings", icon: IoMdSettings },
];

const TRAINER_TABS = [
  { id: "batches", label: "Batch Assignment", icon: "📚" },
  { id: "attendance", label: "Attendance", icon: "📅" },
  { id: "assignments", label: "Assignments", icon: "📝" },
  { id: "tests", label: "Tests", icon: "✍️" },
  { id: "materials", label: "Study Materials", icon: "📖" },
  { id: "performance", label: "Analytics", icon: "📊" },
];

const SALES_SUBMENU = [
  { id: "salesDashboard", label: "Dashboard", icon: FaTachometerAlt },
  { id: "salesCalls", label: "Calls Tracker", icon: FaPhoneAlt },
  { id: "salesLeads", label: "Leads Management", icon: FaClipboardList },
  { id: "salesPipeline", label: "Sales Pipeline", icon: FaChartLine },
  { id: "salesTargets", label: "Targets", icon: FaBullseye },
  { id: "salesReports", label: "Reports", icon: FaFileAlt },
];

const HR_SUBMENU = [
  { id: "hrDashboard", label: "Dashboard", icon: FaTachometerAlt },
  { id: "hrCompanies", label: "Companies", icon: FaBuilding },
  { id: "hrPlacementDrives", label: "Placement Drives", icon: FaCalendarCheck },
  { id: "hrStudents", label: "Students", icon: FaUsers },
  { id: "hrInterviews", label: "Interviews", icon: FaComments },
  { id: "hrReports", label: "Reports", icon: FaChartLine },
  { id: "hrTasks", label: "Tasks", icon: FaTasks },
  { id: "hrMeetings", label: "Meetings", icon: FaBriefcase },
];

const COUNSELOR_SUBMENU = [
  { id: "counselorDashboard", label: "Dashboard", icon: FaTachometerAlt },
  { id: "counselorLeads", label: "Leads", icon: FaChartLine },
  { id: "counselorCalls", label: "Calls", icon: FaPhoneAlt },
  { id: "counselorAdmissions", label: "Admissions", icon: FaFileAlt },
  { id: "counselorSettings", label: "Settings", icon: IoMdSettings },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeTrainerTab, setActiveTrainerTab] = useState("batches");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [salesDropdownOpen, setSalesDropdownOpen] = useState(false);
  const [salesDropdownPos, setSalesDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const salesItemRef = useRef(null);
  const salesCloseTimeout = useRef(null);

  const [hrDropdownOpen, setHrDropdownOpen] = useState(false);
  const [hrDropdownPos, setHrDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const hrItemRef = useRef(null);
  const hrCloseTimeout = useRef(null);

  const [counselorDropdownOpen, setCounselorDropdownOpen] = useState(false);
  const [counselorDropdownPos, setCounselorDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const counselorItemRef = useRef(null);
  const counselorCloseTimeout = useRef(null);

  const sidebarRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    return () => {
      if (salesCloseTimeout.current) clearTimeout(salesCloseTimeout.current);
      if (hrCloseTimeout.current) clearTimeout(hrCloseTimeout.current);
      if (counselorCloseTimeout.current)
        clearTimeout(counselorCloseTimeout.current);
    };
  }, []);

  // Handle click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    // Handle escape key
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [mobileMenuOpen]);

  // Handle window resize - close mobile menu on large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "A");

  const handleNavClick = (item) => {
    setActiveTab(item.id);
    if (item.id !== "trainers") {
      setActiveTrainerTab("batches");
    }
    if (item.id !== "sales") {
      setSalesDropdownOpen(false);
    }
    if (item.id !== "hr") {
      setHrDropdownOpen(false);
    }
    if (item.id !== "counselor") {
      setCounselorDropdownOpen(false);
    }
    // Close mobile menu on nav click
    if (window.innerWidth <= 768) {
      setMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const getPageTitle = () => {
    if (activeTab === "trainers") {
      const currentTab = TRAINER_TABS.find((t) => t.id === activeTrainerTab);
      return `Trainer Management — ${currentTab?.label || "Batch Assignment"}`;
    }
    const salesTab = SALES_SUBMENU.find((t) => t.id === activeTab);
    if (salesTab) {
      return `Sales Team — ${salesTab.label}`;
    }
    const hrTab = HR_SUBMENU.find((t) => t.id === activeTab);
    if (hrTab) {
      return `HR Management — ${hrTab.label}`;
    }
    const counselorTab = COUNSELOR_SUBMENU.find((t) => t.id === activeTab);
    if (counselorTab) {
      return `Counselor — ${counselorTab.label}`;
    }
    return MENU_ITEMS.find((i) => i.id === activeTab)?.label || "Dashboard";
  };

  const renderTrainerContent = () => {
    switch (activeTrainerTab) {
      case "batches":
        return <BatchManagement />;
      case "attendance":
        return <TrainerAttendanceMarker />;
      case "assignments":
        return <Assignments />;
      case "tests":
        return <Tests />;
      case "materials":
        return <CourseMaterials />;
      case "performance":
        return <StudentPerformance />;
      default:
        return <BatchManagement />;
    }
  };

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
    if (!activeTab.startsWith("sales")) {
      setActiveTab("salesDashboard");
    }
    openSalesDropdown();
  };

  const handleSalesSubmenuClick = (id) => {
    setActiveTab(id);
    setSalesDropdownOpen(false);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

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
    if (!activeTab.startsWith("hr") || activeTab === "hr") {
      setActiveTab("hrDashboard");
    }
    openHrDropdown();
  };

  const handleHrSubmenuClick = (id) => {
    setActiveTab(id);
    setHrDropdownOpen(false);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

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
    if (!activeTab.startsWith("counselor")) {
      setActiveTab("counselorDashboard");
    }
    openCounselorDropdown();
  };

  const handleCounselorSubmenuClick = (id) => {
    setActiveTab(id);
    setCounselorDropdownOpen(false);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const dashboardStats = [
    {
      icon: <FaUserGraduate />,
      value: "1,248",
      label: "Total Students",
      trend: "+12.5%",
      color: "#818cf8",
      bgColor: "rgba(99, 102, 241, 0.15)",
    },
    {
      icon: <FaDollarSign />,
      value: "62.4L",
      label: "Total Revenue",
      trend: "+8.2%",
      color: "#34d399",
      bgColor: "rgba(52, 211, 153, 0.15)",
    },
    {
      icon: <FaPercent />,
      value: "74.2%",
      label: "Placement Rate",
      trend: "+5.1%",
      color: "#fbbf24",
      bgColor: "rgba(251, 191, 36, 0.15)",
    },
    {
      icon: <FaUserPlus />,
      value: "482",
      label: "Active Leads",
      trend: "+3.8%",
      color: "#f87171",
      bgColor: "rgba(248, 113, 113, 0.15)",
    },
  ];

  const quickActions = [
    { icon: <FaUserPlus />, label: "Add Student", color: "#818cf8" },
    { icon: <FaHandshake />, label: "New Lead", color: "#34d399" },
    { icon: <FaRocket />, label: "Launch Drive", color: "#fbbf24" },
    { icon: <FaFileAlt />, label: "Generate Report", color: "#f87171" },
  ];

  const recentActivity = [
    {
      user: "Sarah Johnson",
      action: "placed 5 students at Google",
      time: "2 hours ago",
      avatar: "SJ",
    },
    {
      user: "Carlos Rodriguez",
      action: "closed a deal worth $128K",
      time: "4 hours ago",
      avatar: "CR",
    },
    {
      user: "Raj Patel",
      action: "scheduled 3 interviews for tomorrow",
      time: "6 hours ago",
      avatar: "RP",
    },
    {
      user: "Leila Ahmadi",
      action: "updated placement drive status",
      time: "1 day ago",
      avatar: "LA",
    },
  ];

  const StatsCards = () => (
    <div className={styles.statsGrid}>
      {dashboardStats.map((stat, index) => (
        <div key={index} className={styles.statCard}>
          <div
            className={styles.statIconWrapper}
            style={{ background: stat.bgColor }}
          >
            <div className={styles.statIcon} style={{ color: stat.color }}>
              {stat.icon}
            </div>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statTrend} style={{ color: stat.color }}>
              {stat.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const QuickActions = () => (
    <div className={styles.quickActions}>
      <h3 className={styles.sectionTitle}>Quick Actions</h3>
      <div className={styles.quickActionsGrid}>
        {quickActions.map((action, index) => (
          <button key={index} className={styles.quickActionBtn}>
            <div
              className={styles.quickActionIcon}
              style={{ background: action.color }}
            >
              {action.icon}
            </div>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const RecentActivity = () => (
    <div className={styles.recentActivities}>
      <h3 className={styles.sectionTitle}>Recent Activity</h3>
      <div className={styles.activityList}>
        {recentActivity.map((item, index) => (
          <div key={index} className={styles.activityItem}>
            <div className={styles.activityAvatar}>{item.avatar}</div>
            <div className={styles.activityContent}>
              <p>
                <strong>{item.user}</strong> {item.action}
              </p>
              <span>{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PerformanceChart = () => (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3>Monthly Performance</h3>
        <select className={styles.chartSelect}>
          <option>Last 6 Months</option>
          <option>Last 12 Months</option>
        </select>
      </div>
      <div className={styles.barChart}>
        {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, i) => (
          <div key={i} className={styles.barWrapper}>
            <div
              className={styles.bar}
              style={{ height: `${40 + Math.random() * 50}%` }}
            >
              <span className={styles.barTooltip}>
                ${(20 + Math.random() * 80).toFixed(1)}K
              </span>
            </div>
            <span className={styles.barLabel}>{month}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const Placeholder = ({ title }) => (
    <div className={styles.placeholderBox}>
      <h3>{title}</h3>
      <p>Content coming soon...</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <div className={styles.dashboardWelcome}>
              <div>
                <h1 className={styles.welcomeTitle}>
                  Welcome back, {user?.name || "Admin"}! 👋
                </h1>
                <p className={styles.welcomeSub}>
                  Here's what's happening with your institute today.
                </p>
                <div className={styles.dateDisplay}>
                  <FaRegCalendarAlt />
                  <span>
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className={styles.welcomeBadge}>
                <FaStar /> Admin Dashboard
              </div>
            </div>
            <StatsCards />
            <div className={styles.dashboardTwoCol}>
              <PerformanceChart />
              <RecentActivity />
            </div>
            <QuickActions />
          </>
        );
      case "trainers":
        return (
          <div className={styles.trainerManagementContainer}>
            <div className={styles.trainerTabs}>
              {TRAINER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`${styles.trainerTab} ${activeTrainerTab === tab.id ? styles.activeTrainerTab : ""}`}
                  onClick={() => setActiveTrainerTab(tab.id)}
                >
                  <span className={styles.tabIcon}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <div className={styles.trainerContent}>
              {renderTrainerContent()}
            </div>
          </div>
        );

      case "salesDashboard":
        return (
          <div className={styles.salesContentWrapper}>
            <SalesDashboardOverview />
          </div>
        );
      case "salesCalls":
        return (
          <div className={styles.salesContentWrapper}>
            <SalesCallsTracker />
          </div>
        );
      case "salesLeads":
        return (
          <div className={styles.salesContentWrapper}>
            <SalesLeadsManager />
          </div>
        );
      case "salesPipeline":
        return (
          <div className={styles.salesContentWrapper}>
            <SalesPipeline />
          </div>
        );
      case "salesTargets":
        return (
          <div className={styles.salesContentWrapper}>
            <SalesTargetsTracker />
          </div>
        );
      case "salesReports":
        return (
          <div className={styles.salesContentWrapper}>
            <SalesReportsAnalytics />
          </div>
        );

      case "hrDashboard":
        return (
          <div className={styles.salesContentWrapper}>
            <HRDashboardOverview />
          </div>
        );
      case "hrCompanies":
        return (
          <div className={styles.salesContentWrapper}>
            <HRCompaniesManager />
          </div>
        );
      case "hrPlacementDrives":
        return (
          <div className={styles.salesContentWrapper}>
            <HRPlacementDrives />
          </div>
        );
      case "hrStudents":
        return (
          <div className={styles.salesContentWrapper}>
            <HRStudents />
          </div>
        );
      case "hrInterviews":
        return (
          <div className={styles.salesContentWrapper}>
            <HRInterviewsManager />
          </div>
        );
      case "hrReports":
        return (
          <div className={styles.salesContentWrapper}>
            <HRReportsAnalytics />
          </div>
        );
      case "hrTasks":
        return <Placeholder title="Tasks" />;
      case "hrMeetings":
        return <Placeholder title="Meetings" />;

      case "counselorDashboard":
        return (
          <div className={styles.salesContentWrapper}>
            <CounselorDashboardOverview />
          </div>
        );
      case "counselorLeads":
        return (
          <div className={styles.salesContentWrapper}>
            <CounselorLeads />
          </div>
        );
      case "counselorCalls":
        return (
          <div className={styles.salesContentWrapper}>
            <CounselorCalls />
          </div>
        );
      case "counselorAdmissions":
        return (
          <div className={styles.salesContentWrapper}>
            <CounselorAdmissions />
          </div>
        );
      case "counselorSettings":
        return <Placeholder title="Settings" />;

      case "attendance":
        return <Placeholder title="Attendance Monitoring" />;
      case "tasks":
        return <Placeholder title="Task Management" />;
      case "reports":
        return <Placeholder title="Reports" />;
      case "settings":
        return <Placeholder title="Settings" />;
      default:
        return (
          <>
            <StatsCards />
            <PerformanceChart />
            <RecentActivity />
          </>
        );
    }
  };

  return (
    <div
      className={`${styles.app} ${sidebarCollapsed ? styles.appCollapsed : ""}`}
    >
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

      {salesDropdownOpen && (
        <div
          className={styles.fixedFlyout}
          style={{ top: salesDropdownPos.top, left: salesDropdownPos.left }}
          onMouseEnter={cancelCloseSalesDropdown}
          onMouseLeave={scheduleCloseSalesDropdown}
        >
          <div className={styles.flyoutTitle}>Sales Team</div>
          {SALES_SUBMENU.map((sub) => (
            <button
              key={sub.id}
              className={`${styles.flyoutItem} ${activeTab === sub.id ? styles.flyoutItemActive : ""}`}
              onClick={() => handleSalesSubmenuClick(sub.id)}
            >
              <sub.icon className={styles.subNavIcon} />
              <span>{sub.label}</span>
            </button>
          ))}
        </div>
      )}

      {hrDropdownOpen && (
        <div
          className={styles.fixedFlyout}
          style={{ top: hrDropdownPos.top, left: hrDropdownPos.left }}
          onMouseEnter={cancelCloseHrDropdown}
          onMouseLeave={scheduleCloseHrDropdown}
        >
          <div className={styles.flyoutTitle}>HR Management</div>
          {HR_SUBMENU.map((sub) => (
            <button
              key={sub.id}
              className={`${styles.flyoutItem} ${activeTab === sub.id ? styles.flyoutItemActive : ""}`}
              onClick={() => handleHrSubmenuClick(sub.id)}
            >
              <sub.icon className={styles.subNavIcon} />
              <span>{sub.label}</span>
            </button>
          ))}
        </div>
      )}

      {counselorDropdownOpen && (
        <div
          className={styles.fixedFlyout}
          style={{
            top: counselorDropdownPos.top,
            left: counselorDropdownPos.left,
          }}
          onMouseEnter={cancelCloseCounselorDropdown}
          onMouseLeave={scheduleCloseCounselorDropdown}
        >
          <div className={styles.flyoutTitle}>Counselor</div>
          {COUNSELOR_SUBMENU.map((sub) => (
            <button
              key={sub.id}
              className={`${styles.flyoutItem} ${activeTab === sub.id ? styles.flyoutItemActive : ""}`}
              onClick={() => handleCounselorSubmenuClick(sub.id)}
            >
              <sub.icon className={styles.subNavIcon} />
              <span>{sub.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={closeMobileMenu} />
      )}

      <aside
        ref={sidebarRef}
        className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ""} ${mobileMenuOpen ? styles.sidebarMobile : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <MdOutlineAccountBalance />
            </div>
            {!sidebarCollapsed && (
              <span className={styles.logoText}>Admin Portal</span>
            )}
          </div>
          {/* Desktop collapse/expand buttons */}
          {window.innerWidth > 768 &&
            (!sidebarCollapsed ? (
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
            ))}
          {/* Mobile close button */}
          {window.innerWidth <= 768 && (
            <button className={styles.mobileCloseBtn} onClick={closeMobileMenu}>
              <FaTimes />
            </button>
          )}
        </div>

        <nav className={styles.nav}>
          {MENU_ITEMS.map((item) => {
            if (item.id === "counselor") {
              const isCounselorActive = activeTab.startsWith("counselor");
              return (
                <div
                  key={item.id}
                  className={styles.navItemWrapper}
                  ref={counselorItemRef}
                  onMouseEnter={openCounselorDropdown}
                  onMouseLeave={scheduleCloseCounselorDropdown}
                >
                  <button
                    className={`${styles.navItem} ${isCounselorActive ? styles.active : ""}`}
                    onClick={handleCounselorClick}
                  >
                    <item.icon className={styles.navIcon} />
                    {!sidebarCollapsed && (
                      <span className={styles.navLabel}>{item.label}</span>
                    )}
                    {!sidebarCollapsed && (
                      <FaChevronDown
                        className={`${styles.dropdownArrow} ${counselorDropdownOpen ? styles.rotated : ""}`}
                      />
                    )}
                  </button>
                </div>
              );
            }

            if (item.id === "sales") {
              const isSalesActive = activeTab.startsWith("sales");
              return (
                <div
                  key={item.id}
                  className={styles.navItemWrapper}
                  ref={salesItemRef}
                  onMouseEnter={openSalesDropdown}
                  onMouseLeave={scheduleCloseSalesDropdown}
                >
                  <button
                    className={`${styles.navItem} ${isSalesActive ? styles.active : ""}`}
                    onClick={handleSalesClick}
                  >
                    <item.icon className={styles.navIcon} />
                    {!sidebarCollapsed && (
                      <span className={styles.navLabel}>{item.label}</span>
                    )}
                    {!sidebarCollapsed && (
                      <FaChevronDown
                        className={`${styles.dropdownArrow} ${salesDropdownOpen ? styles.rotated : ""}`}
                      />
                    )}
                  </button>
                </div>
              );
            }

            if (item.id === "hr") {
              const isHrActive = activeTab.startsWith("hr");
              return (
                <div
                  key={item.id}
                  className={styles.navItemWrapper}
                  ref={hrItemRef}
                  onMouseEnter={openHrDropdown}
                  onMouseLeave={scheduleCloseHrDropdown}
                >
                  <button
                    className={`${styles.navItem} ${isHrActive ? styles.active : ""}`}
                    onClick={handleHrClick}
                  >
                    <item.icon className={styles.navIcon} />
                    {!sidebarCollapsed && (
                      <span className={styles.navLabel}>{item.label}</span>
                    )}
                    {!sidebarCollapsed && (
                      <FaChevronDown
                        className={`${styles.dropdownArrow} ${hrDropdownOpen ? styles.rotated : ""}`}
                      />
                    )}
                  </button>
                </div>
              );
            }

            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className={styles.navItemWrapper}>
                <button
                  className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                  onClick={() => handleNavClick(item)}
                >
                  <item.icon className={styles.navIcon} />
                  {!sidebarCollapsed && (
                    <span className={styles.navLabel}>{item.label}</span>
                  )}
                </button>
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

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.menuToggle} onClick={toggleMobileMenu}>
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

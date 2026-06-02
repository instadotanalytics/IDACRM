// SalesDashboard.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
    FaTachometerAlt,
    FaPhoneAlt,
    FaUsers,
    FaChartLine,
    FaCalendarAlt,
    FaCog,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaDollarSign,
    FaUserCircle,
    FaBullhorn,
    FaFileAlt,
    FaEnvelope,
    FaChartPie,
    FaStar,
    FaBell,
    FaSearch,
    FaFilter,
    FaDownload,
    FaEye,
    FaThumbsUp,
    FaChartBar,
    FaWallet,
    FaTrophy,
    FaArrowUp,
    FaArrowDown,
    FaInfoCircle,
    FaPlus,
    FaEdit,
    FaTrash,
    FaPhone,
    FaVideo,
    FaWhatsapp,
    FaLinkedin,
    FaTwitter,
    FaEnvelopeOpenText,
    FaHandshake,
    FaPercentage,
    FaBuilding,
    FaMapMarkerAlt,
    FaCalendarWeek,
    FaSpinner,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa";
import {
    MdOutlinePendingActions,
    MdOutlineAttachMoney,
    MdOutlinePeopleAlt,
} from "react-icons/md";
import { RiCustomerService2Fill, RiMailSendLine } from "react-icons/ri";
import { HiOutlineUsers } from "react-icons/hi";
import { GiAchievement } from "react-icons/gi";
import { IoIosCall, IoIosTrendingUp, IoIosTrendingDown } from "react-icons/io";
import { FiTarget } from "react-icons/fi";
import styles from "./SalesDashboard.module.css";

const SalesDashboard = () => {
    const [user, setUser] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [hoveredItem, setHoveredItem] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notifications] = useState(3);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            setUser({
                name: "Alex Jenkin",
                role: "Senior Sales Executive",
                email: "alex.jenkin@ida.com",
                avatar: "AJ",
            });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.success("Logged out successfully");
    };

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : "S";
    };

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

    const handleMouseEnter = (item, e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPosition({ x: rect.right + 10, y: rect.top + rect.height / 2 });
        setHoveredItem(item);
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
        if (!sidebarCollapsed && isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className={styles.appContainer}>
            {/* Tooltip */}
            {hoveredItem && sidebarCollapsed && (
                <div
                    className={styles.tooltip}
                    style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
                >
                    {hoveredItem.label}
                </div>
            )}

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className={styles.mobileOverlay} onClick={toggleMobileMenu} />
            )}

            {/* Sidebar */}
            <aside
                className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ""} ${isMobileMenuOpen ? styles.mobileOpen : ""}`}
            >
                <div className={styles.sidebarHeader}>
                    <div className={styles.logoArea}>
                        {!sidebarCollapsed && (
                            <span className={styles.logoText}>IDA ERP CRM</span>
                        )}
                        {sidebarCollapsed && (
                            <span className={styles.logoIcon}>
                                <RiCustomerService2Fill />
                            </span>
                        )}
                    </div>
                    <button onClick={toggleSidebar} className={styles.collapseBtn}>
                        <FaBars />
                    </button>
                    <button onClick={toggleMobileMenu} className={styles.mobileCloseBtn}>
                        <FaTimes />
                    </button>
                </div>

                <div className={styles.sidebarUser}>
                    <div className={styles.userAvatar}>
                        {user?.avatar || getInitial(user?.name)}
                    </div>
                    {!sidebarCollapsed && (
                        <div className={styles.userDetails}>
                            <span className={styles.userName}>
                                {user?.name || "Sales Executive"}
                            </span>
                            <span className={styles.userRole}>
                                {user?.role || "Sales Executive"}
                            </span>
                        </div>
                    )}
                </div>

                <nav className={styles.sidebarNav}>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`${styles.navItem} ${activeTab === item.id ? styles.active : ""}`}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (isMobileMenuOpen) toggleMobileMenu();
                            }}
                            onMouseEnter={(e) => handleMouseEnter(item, e)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            {!sidebarCollapsed && (
                                <span className={styles.navLabel}>{item.label}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <button className={styles.navItem} onClick={handleLogout}>
                        <span className={styles.navIcon}>
                            <FaSignOutAlt />
                        </span>
                        {!sidebarCollapsed && (
                            <span className={styles.navLabel}>Logout</span>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button onClick={toggleMobileMenu} className={styles.mobileMenuBtn}>
                            <FaBars />
                        </button>
                        <div className={styles.searchBar}>
                            <FaSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search leads, opportunities..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className={styles.headerRight}>
                        <button className={styles.notificationBtn}>
                            <FaBell />
                            {notifications > 0 && (
                                <span className={styles.notificationBadge}>
                                    {notifications}
                                </span>
                            )}
                        </button>
                        <div className={styles.userInfo}>
                            <div className={styles.userAvatarSmall}>
                                {user?.avatar || getInitial(user?.name)}
                            </div>
                            <div className={styles.userDetailsHeader}>
                                <span className={styles.userNameHeader}>
                                    {user?.name || "Sales Executive"}
                                </span>
                                <span className={styles.userRoleHeader}>
                                    {user?.role || "Sales Executive"}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <div className={styles.contentArea}>
                    {activeTab === "dashboard" && <DashboardOverview user={user} />}
                    {activeTab === "calls" && <CallsTracker />}
                    {activeTab === "leads" && <LeadsManager />}
                    {activeTab === "pipeline" && <SalesPipeline />}
                    {activeTab === "targets" && <TargetsTracker />}
                    {activeTab === "reports" && <ReportsAnalytics />}
                    {activeTab === "calendar" && <CalendarView />}
                    {activeTab === "settings" && <SettingsView />}
                </div>
            </main>
        </div>
    );
};

// ─── Dashboard Overview ───────────────────────────────────────────────────────
const DashboardOverview = ({ user }) => {
    const stats = [
        {
            title: "Today's Calls",
            value: "24",
            icon: <FaPhoneAlt />,
            change: "+8%",
            trend: "up",
        },
        {
            title: "Leads Assigned",
            value: "45",
            icon: <HiOutlineUsers />,
            change: "+12%",
            trend: "up",
        },
        {
            title: "Conversions",
            value: "12",
            icon: <FaThumbsUp />,
            change: "+5%",
            trend: "up",
        },
        {
            title: "Revenue Generated",
            value: "$212,000",
            icon: <FaDollarSign />,
            change: "+18%",
            trend: "up",
        },
        {
            title: "Target Achievement",
            value: "68%",
            icon: <FiTarget />,
            change: "-2%",
            trend: "down",
        },
        {
            title: "Pending Follow-ups",
            value: "18",
            icon: <MdOutlinePendingActions />,
            change: "+3",
            trend: "up",
        },
    ];

    const recentActivities = [
        {
            id: 1,
            lead: "Shine Bright",
            action: "Contract signed",
            time: "2 hours ago",
            icon: <FaHandshake />,
            status: "success",
        },
        {
            id: 2,
            lead: "Fabricatorz",
            action: "Proposal sent",
            time: "5 hours ago",
            icon: <FaEnvelopeOpenText />,
            status: "pending",
        },
        {
            id: 3,
            lead: "Inky",
            action: "Demo completed",
            time: "Yesterday",
            icon: <FaVideo />,
            status: "success",
        },
        {
            id: 4,
            lead: "AKP",
            action: "Follow-up call",
            time: "Yesterday",
            icon: <FaPhone />,
            status: "pending",
        },
    ];

    const topPerformers = [
        { name: "Alex Jenkin", revenue: "$158,000", deals: 8, avatar: "AJ" },
        { name: "Kelly Smart", revenue: "$215,000", deals: 6, avatar: "KS" },
        { name: "Tamika Marshall", revenue: "$115,000", deals: 5, avatar: "TM" },
        { name: "Jamal King", revenue: "$48,000", deals: 3, avatar: "JK" },
    ];

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.welcomeSection}>
                <div className={styles.welcomeText}>
                    <h1>
                        Welcome back, {user?.name?.split(" ")[0] || "Sales Executive"}! 👋
                    </h1>
                    <p>Here's what's happening with your sales today.</p>
                </div>
                <div className={styles.dateDisplay}>
                    <FaCalendarWeek />
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

            <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <div key={index} className={styles.statCard}>
                        <div className={styles.statIcon}>{stat.icon}</div>
                        <div className={styles.statContent}>
                            <span className={styles.statTitle}>{stat.title}</span>
                            <span className={styles.statValue}>{stat.value}</span>
                            <span className={`${styles.statChange} ${styles[stat.trend]}`}>
                                {stat.trend === "up" ? <FaArrowUp /> : <FaArrowDown />}
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.twoColumnGrid}>
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <h3>
                            <FaClock /> Recent Activities
                        </h3>
                        <button className={styles.viewAllBtn}>
                            View All <FaEye />
                        </button>
                    </div>
                    <div className={styles.activityList}>
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className={styles.activityItem}>
                                <div
                                    className={`${styles.activityIcon} ${styles[activity.status]}`}
                                >
                                    {activity.icon}
                                </div>
                                <div className={styles.activityDetails}>
                                    <span className={styles.activityLead}>{activity.lead}</span>
                                    <span className={styles.activityAction}>
                                        {activity.action}
                                    </span>
                                </div>
                                <span className={styles.activityTime}>{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <h3>
                            <FaTrophy /> Top Performers
                        </h3>
                        <button className={styles.viewAllBtn}>
                            View All <FaEye />
                        </button>
                    </div>
                    <div className={styles.performerList}>
                        {topPerformers.map((performer, idx) => (
                            <div key={idx} className={styles.performerItem}>
                                <div className={styles.performerRank}>#{idx + 1}</div>
                                <div className={styles.performerAvatar}>{performer.avatar}</div>
                                <div className={styles.performerInfo}>
                                    <span className={styles.performerName}>{performer.name}</span>
                                    <span className={styles.performerDeals}>
                                        {performer.deals} deals
                                    </span>
                                </div>
                                <div className={styles.performerRevenue}>
                                    <FaDollarSign />
                                    {performer.revenue}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.fullWidthCard}>
                <div className={styles.sectionHeader}>
                    <h3>
                        <FaChartBar /> Sales Pipeline Overview
                    </h3>
                    <div className={styles.headerActions}>
                        <button className={styles.filterBtn}>
                            <FaFilter /> Filter
                        </button>
                        <button className={styles.downloadBtn}>
                            <FaDownload /> Export
                        </button>
                    </div>
                </div>
                <div className={styles.pipelineTable}>
                    <table>
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Primary</th>
                                <th>Sales Stage</th>
                                <th>Forecast Amount</th>
                                <th>Expected Close</th>
                                <th>Probability</th>
                                <th>Sales Rep</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>🟢</td>
                                <td>Shine Bright</td>
                                <td>4 - Contracts</td>
                                <td>$100,000</td>
                                <td>03/26/21</td>
                                <td>90%</td>
                                <td>Alex Jenkin</td>
                                <td>
                                    <button className={styles.actionBtn}>
                                        <FaEye />
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>🟢</td>
                                <td>Fabricatorz</td>
                                <td>3 - Proposal</td>
                                <td>$125,000</td>
                                <td>04/01/21</td>
                                <td>75%</td>
                                <td>Kelly Smart</td>
                                <td>
                                    <button className={styles.actionBtn}>
                                        <FaEye />
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>🟡</td>
                                <td>Inky</td>
                                <td>2 - Assessment</td>
                                <td>$75,000</td>
                                <td>03/11/21</td>
                                <td>50%</td>
                                <td>Tamika Marshall</td>
                                <td>
                                    <button className={styles.actionBtn}>
                                        <FaEye />
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>🟡</td>
                                <td>AKP</td>
                                <td>2 - Assessment</td>
                                <td>$48,000</td>
                                <td>03/26/21</td>
                                <td>50%</td>
                                <td>Jamal King</td>
                                <td>
                                    <button className={styles.actionBtn}>
                                        <FaEye />
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>🟢</td>
                                <td>Cross Time Moving</td>
                                <td>3 - Proposal</td>
                                <td>$90,000</td>
                                <td>02/21/21</td>
                                <td>100%</td>
                                <td>Kelly Smart</td>
                                <td>
                                    <button className={styles.actionBtn}>
                                        <FaEye />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ─── Calls Tracker ────────────────────────────────────────────────────────────
const CallsTracker = () => {
    const [calls] = useState([
        {
            id: 1,
            customer: "Rahul Sharma",
            phone: "+91 98765 43210",
            time: "10:30 AM",
            status: "pending",
            type: "Follow-up",
            notes: "Interested in Full Stack course",
        },
        {
            id: 2,
            customer: "Priya Patel",
            phone: "+91 98765 43211",
            time: "11:00 AM",
            status: "completed",
            type: "Demo",
            notes: "Demo scheduled for tomorrow",
        },
        {
            id: 3,
            customer: "Ankit Verma",
            phone: "+91 98765 43212",
            time: "12:00 PM",
            status: "pending",
            type: "New Lead",
            notes: "Call pending - first contact",
        },
        {
            id: 4,
            customer: "Neha Gupta",
            phone: "+91 98765 43213",
            time: "02:00 PM",
            status: "completed",
            type: "Follow-up",
            notes: "Interested, sent proposal",
        },
        {
            id: 5,
            customer: "Amit Kumar",
            phone: "+91 98765 43214",
            time: "03:30 PM",
            status: "missed",
            type: "Closure",
            notes: "Converted to admission",
        },
    ]);

    const stats = [
        {
            label: "Total Calls",
            value: "24",
            icon: <FaPhoneAlt />,
            color: "#810B38",
        },
        {
            label: "Completed",
            value: "12",
            icon: <FaCheckCircle />,
            color: "#10b981",
        },
        { label: "Pending", value: "8", icon: <FaClock />, color: "#f59e0b" },
        { label: "Missed", value: "4", icon: <FaTimesCircle />, color: "#ef4444" },
    ];

    return (
        <div className={styles.componentContainer}>
            <div className={styles.componentHeader}>
                <h2>
                    <FaPhoneAlt /> Calls Tracker
                </h2>
                <button className={styles.primaryBtn}>
                    <FaPlus /> Schedule Call
                </button>
            </div>
            <div className={styles.statsSmallGrid}>
                {stats.map((stat, idx) => (
                    <div key={idx} className={styles.statSmallCard}>
                        <div className={styles.statSmallIcon} style={{ color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className={styles.statSmallInfo}>
                            <span className={styles.statSmallLabel}>{stat.label}</span>
                            <span className={styles.statSmallValue}>{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                    <h3>Scheduled Calls Today</h3>
                    <div className={styles.tableFilters}>
                        <select className={styles.filterSelect}>
                            <option>All Status</option>
                            <option>Pending</option>
                            <option>Completed</option>
                            <option>Missed</option>
                        </select>
                    </div>
                </div>
                <div className={styles.tableResponsive}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Phone</th>
                                <th>Time</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Notes</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {calls.map((call) => (
                                <tr key={call.id}>
                                    <td>
                                        <strong>{call.customer}</strong>
                                    </td>
                                    <td>{call.phone}</td>
                                    <td>{call.time}</td>
                                    <td>
                                        <span className={styles.callType}>{call.type}</span>
                                    </td>
                                    <td>
                                        <span
                                            className={`${styles.statusBadge} ${styles[call.status]}`}
                                        >
                                            {call.status}
                                        </span>
                                    </td>
                                    <td>{call.notes}</td>
                                    <td>
                                        <div className={styles.actionIcons}>
                                            <button className={styles.iconBtn}>
                                                <FaPhone />
                                            </button>
                                            <button className={styles.iconBtn}>
                                                <FaWhatsapp />
                                            </button>
                                            <button className={styles.iconBtn}>
                                                <FaEdit />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ─── Leads Manager ────────────────────────────────────────────────────────────
const LeadsManager = () => {
    const leads = [
        {
            id: 1,
            name: "Rahul Sharma",
            company: "Tech Solutions",
            status: "New",
            source: "Website",
            assignedTo: "Alex Jenkin",
            value: "$25,000",
            probability: "30%",
        },
        {
            id: 2,
            name: "Priya Patel",
            company: "Digital Innovations",
            status: "Contacted",
            source: "Referral",
            assignedTo: "Kelly Smart",
            value: "$45,000",
            probability: "50%",
        },
        {
            id: 3,
            name: "Ankit Verma",
            company: "Business Hub",
            status: "Qualified",
            source: "LinkedIn",
            assignedTo: "Tamika Marshall",
            value: "$60,000",
            probability: "70%",
        },
        {
            id: 4,
            name: "Neha Gupta",
            company: "Creative Agency",
            status: "Proposal",
            source: "Email",
            assignedTo: "Jamal King",
            value: "$35,000",
            probability: "85%",
        },
        {
            id: 5,
            name: "Amit Kumar",
            company: "Enterprise Ltd",
            status: "Negotiation",
            source: "Event",
            assignedTo: "Alex Jenkin",
            value: "$120,000",
            probability: "90%",
        },
    ];

    const statusColors = {
        New: "#3b82f6",
        Contacted: "#f59e0b",
        Qualified: "#8b5cf6",
        Proposal: "#ec489a",
        Negotiation: "#10b981",
    };

    return (
        <div className={styles.componentContainer}>
            <div className={styles.componentHeader}>
                <h2>
                    <HiOutlineUsers /> Leads Management
                </h2>
                <div className={styles.headerButtons}>
                    <button className={styles.secondaryBtn}>
                        <FaDownload /> Import
                    </button>
                    <button className={styles.primaryBtn}>
                        <FaPlus /> Add Lead
                    </button>
                </div>
            </div>
            <div className={styles.funnelContainer}>
                <div className={styles.funnelStep}>
                    <span>New (12)</span>
                    <div className={styles.funnelBar} style={{ width: "100%" }}></div>
                </div>
                <div className={styles.funnelStep}>
                    <span>Contacted (8)</span>
                    <div className={styles.funnelBar} style={{ width: "66%" }}></div>
                </div>
                <div className={styles.funnelStep}>
                    <span>Qualified (6)</span>
                    <div className={styles.funnelBar} style={{ width: "50%" }}></div>
                </div>
                <div className={styles.funnelStep}>
                    <span>Proposal (4)</span>
                    <div className={styles.funnelBar} style={{ width: "33%" }}></div>
                </div>
                <div className={styles.funnelStep}>
                    <span>Negotiation (3)</span>
                    <div className={styles.funnelBar} style={{ width: "25%" }}></div>
                </div>
            </div>
            <div className={styles.tableCard}>
                <div className={styles.tableResponsive}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Lead Name</th>
                                <th>Company</th>
                                <th>Status</th>
                                <th>Source</th>
                                <th>Sales Rep</th>
                                <th>Value</th>
                                <th>Prob.</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead) => (
                                <tr key={lead.id}>
                                    <td>
                                        <strong>{lead.name}</strong>
                                    </td>
                                    <td>{lead.company}</td>
                                    <td>
                                        <span
                                            className={styles.statusDot}
                                            style={{ backgroundColor: statusColors[lead.status] }}
                                        ></span>
                                        {lead.status}
                                    </td>
                                    <td>{lead.source}</td>
                                    <td>{lead.assignedTo}</td>
                                    <td>{lead.value}</td>
                                    <td>{lead.probability}</td>
                                    <td>
                                        <div className={styles.actionIcons}>
                                            <button className={styles.iconBtn}>
                                                <FaEye />
                                            </button>
                                            <button className={styles.iconBtn}>
                                                <FaEdit />
                                            </button>
                                            <button className={styles.iconBtn}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ─── Sales Pipeline ───────────────────────────────────────────────────────────
const SalesPipeline = () => {
    const pipelineStages = [
        {
            name: "Prospect",
            count: 8,
            value: "$220,000",
            color: "#810B38",
            deals: [
                "Transland Shipping - $55k",
                "Metro Logistics - $45k",
                "City Express - $35k",
            ],
        },
        {
            name: "Assessment",
            count: 12,
            value: "$315,000",
            color: "#9b59b6",
            deals: ["Inky - $75k", "AKP - $48k", "NW Logistics - $40k"],
        },
        {
            name: "Proposal",
            count: 7,
            value: "$425,000",
            color: "#3498db",
            deals: [
                "Fabricatorz - $125k",
                "Cross Time Moving - $90k",
                "Speed Cargo - $80k",
            ],
        },
        {
            name: "Contracts",
            count: 4,
            value: "$280,000",
            color: "#2ecc71",
            deals: [
                "Shine Bright - $100k",
                "Global Trade - $95k",
                "Ocean Freight - $85k",
            ],
        },
        {
            name: "Closed Won",
            count: 15,
            value: "$1,250,000",
            color: "#27ae60",
            deals: [],
        },
        {
            name: "Closed Lost",
            count: 6,
            value: "$180,000",
            color: "#e74c3c",
            deals: [],
        },
    ];

    return (
        <div className={styles.componentContainer}>
            <div className={styles.componentHeader}>
                <h2>
                    <FaChartLine /> Sales Pipeline
                </h2>
                <button className={styles.primaryBtn}>
                    <FaPlus /> New Opportunity
                </button>
            </div>
            <div className={styles.pipelineGrid}>
                {pipelineStages.map((stage, idx) => (
                    <div key={idx} className={styles.pipelineStage}>
                        <div
                            className={styles.stageHeader}
                            style={{ backgroundColor: stage.color }}
                        >
                            <h4>{stage.name}</h4>
                            <div className={styles.stageStats}>
                                <span>{stage.count} deals</span>
                                <span>{stage.value}</span>
                            </div>
                        </div>
                        <div className={styles.stageDeals}>
                            {stage.deals?.map((deal, i) => (
                                <div key={i} className={styles.stageDeal}>
                                    <span>{deal}</span>
                                    <button className={styles.dealAction}>
                                        <FaEye />
                                    </button>
                                </div>
                            ))}
                            {stage.deals?.length === 0 && (
                                <div className={styles.emptyStage}>No deals</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Targets Tracker ──────────────────────────────────────────────────────────
const TargetsTracker = () => {
    const targets = [
        {
            metric: "Monthly Revenue",
            target: "$500,000",
            achieved: "$325,000",
            percentage: 65,
            rep: "Team Total",
        },
        {
            metric: "New Customers",
            target: 50,
            achieved: 32,
            percentage: 64,
            rep: "Team Total",
        },
        {
            metric: "Calls Made",
            target: 500,
            achieved: 380,
            percentage: 76,
            rep: "Team Total",
        },
        {
            metric: "Deals Closed",
            target: 40,
            achieved: 28,
            percentage: 70,
            rep: "Team Total",
        },
    ];

    const repTargets = [
        {
            name: "Alex Jenkin",
            revenue: "$158,000",
            target: "$200,000",
            percentage: 79,
            deals: 8,
        },
        {
            name: "Kelly Smart",
            revenue: "$215,000",
            target: "$250,000",
            percentage: 86,
            deals: 6,
        },
        {
            name: "Tamika Marshall",
            revenue: "$115,000",
            target: "$150,000",
            percentage: 77,
            deals: 5,
        },
        {
            name: "Jamal King",
            revenue: "$48,000",
            target: "$80,000",
            percentage: 60,
            deals: 3,
        },
    ];

    return (
        <div className={styles.componentContainer}>
            <div className={styles.componentHeader}>
                <h2>
                    <FiTarget /> Targets & Achievements
                </h2>
                <button className={styles.primaryBtn}>
                    <FaPlus /> Set Target
                </button>
            </div>
            <div className={styles.targetsGrid}>
                {targets.map((target, idx) => (
                    <div key={idx} className={styles.targetCard}>
                        <div className={styles.targetInfo}>
                            <span className={styles.targetMetric}>{target.metric}</span>
                            <span className={styles.targetValues}>
                                {target.achieved} / {target.target}
                            </span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${target.percentage}%` }}
                            ></div>
                        </div>
                        <div className={styles.targetFooter}>
                            <span className={styles.targetPercentage}>
                                {target.percentage}% achieved
                            </span>
                            <span className={styles.targetRep}>{target.rep}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.tableCard}>
                <h3>Sales Rep Performance</h3>
                <div className={styles.tableResponsive}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Sales Rep</th>
                                <th>Revenue</th>
                                <th>Target</th>
                                <th>Achievement</th>
                                <th>Deals</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {repTargets.map((rep, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <strong>{rep.name}</strong>
                                    </td>
                                    <td>{rep.revenue}</td>
                                    <td>{rep.target}</td>
                                    <td>
                                        <div className={styles.progressSmall}>
                                            <div
                                                className={styles.progressSmallFill}
                                                style={{ width: `${rep.percentage}%` }}
                                            ></div>
                                            <span>{rep.percentage}%</span>
                                        </div>
                                    </td>
                                    <td>{rep.deals}</td>
                                    <td>
                                        {rep.percentage >= 80 ? (
                                            <FaCheckCircle style={{ color: "#10b981" }} />
                                        ) : (
                                            <FaClock style={{ color: "#f59e0b" }} />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ─── Reports Analytics ────────────────────────────────────────────────────────
const ReportsAnalytics = () => {
    return (
        <div className={styles.componentContainer}>
            <div className={styles.componentHeader}>
                <h2>
                    <FaFileAlt /> Reports & Analytics
                </h2>
                <div className={styles.headerButtons}>
                    <button className={styles.secondaryBtn}>
                        <FaDownload /> Export Report
                    </button>
                    <button className={styles.primaryBtn}>
                        <FaCalendarAlt /> Select Date Range
                    </button>
                </div>
            </div>
            <div className={styles.reportsGrid}>
                <div className={styles.reportCard}>
                    <div className={styles.reportIcon}>
                        <FaChartPie />
                    </div>
                    <h4>Revenue by Source</h4>
                    <div className={styles.pieChart}>
                        <div
                            className={styles.pieSegment}
                            style={{ backgroundColor: "#810B38" }}
                        >
                            Website 45%
                        </div>
                        <div
                            className={styles.pieSegment}
                            style={{ backgroundColor: "#9b59b6" }}
                        >
                            Referral 25%
                        </div>
                        <div
                            className={styles.pieSegment}
                            style={{ backgroundColor: "#3498db" }}
                        >
                            LinkedIn 20%
                        </div>
                        <div
                            className={styles.pieSegment}
                            style={{ backgroundColor: "#2ecc71" }}
                        >
                            Email 10%
                        </div>
                    </div>
                </div>
                <div className={styles.reportCard}>
                    <div className={styles.reportIcon}>
                        <IoIosTrendingUp />
                    </div>
                    <h4>Monthly Trend</h4>
                    <div className={styles.trendChart}>
                        <div className={styles.trendBar}>
                            <span>Jan</span>
                            <div
                                style={{
                                    width: "100%",
                                    height: "60%",
                                    backgroundColor: "#810B38",
                                    borderRadius: "6px",
                                }}
                            ></div>
                        </div>
                        <div className={styles.trendBar}>
                            <span>Feb</span>
                            <div
                                style={{
                                    width: "100%",
                                    height: "75%",
                                    backgroundColor: "#810B38",
                                    borderRadius: "6px",
                                }}
                            ></div>
                        </div>
                        <div className={styles.trendBar}>
                            <span>Mar</span>
                            <div
                                style={{
                                    width: "100%",
                                    height: "45%",
                                    backgroundColor: "#810B38",
                                    borderRadius: "6px",
                                }}
                            ></div>
                        </div>
                        <div className={styles.trendBar}>
                            <span>Apr</span>
                            <div
                                style={{
                                    width: "100%",
                                    height: "85%",
                                    backgroundColor: "#810B38",
                                    borderRadius: "6px",
                                }}
                            ></div>
                        </div>
                        <div className={styles.trendBar}>
                            <span>May</span>
                            <div
                                style={{
                                    width: "100%",
                                    height: "70%",
                                    backgroundColor: "#810B38",
                                    borderRadius: "6px",
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
                <div className={styles.reportCard}>
                    <div className={styles.reportIcon}>
                        <FaWallet />
                    </div>
                    <h4>Profit Analysis</h4>
                    <div className={styles.kpiDisplay}>
                        <div className={styles.kpiItem}>
                            <span>Total Profit</span>
                            <strong>$92,500</strong>
                        </div>
                        <div className={styles.kpiItem}>
                            <span>Avg Profit/Deal</span>
                            <strong>$3,703</strong>
                        </div>
                        <div className={styles.kpiItem}>
                            <span>Profit Margin</span>
                            <strong>32%</strong>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.tableCard}>
                <h3>Sales Performance Report</h3>
                <div className={styles.tableResponsive}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Sales Rep</th>
                                <th>Leads</th>
                                <th>Calls</th>
                                <th>Meetings</th>
                                <th>Proposals</th>
                                <th>Closed</th>
                                <th>Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Alex Jenkin</td>
                                <td>12</td>
                                <td>45</td>
                                <td>8</td>
                                <td>5</td>
                                <td>4</td>
                                <td>$158,000</td>
                            </tr>
                            <tr>
                                <td>Kelly Smart</td>
                                <td>10</td>
                                <td>38</td>
                                <td>7</td>
                                <td>6</td>
                                <td>5</td>
                                <td>$215,000</td>
                            </tr>
                            <tr>
                                <td>Tamika Marshall</td>
                                <td>8</td>
                                <td>32</td>
                                <td>5</td>
                                <td>4</td>
                                <td>3</td>
                                <td>$115,000</td>
                            </tr>
                            <tr>
                                <td>Jamal King</td>
                                <td>6</td>
                                <td>25</td>
                                <td>3</td>
                                <td>2</td>
                                <td>2</td>
                                <td>$48,000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ─── Calendar View ────────────────────────────────────────────────────────────
const CalendarView = () => {
    const events = [
        {
            date: "June 2, 2026",
            time: "10:00 AM",
            title: "Demo with Shine Bright",
            type: "meeting",
        },
        {
            date: "June 2, 2026",
            time: "2:00 PM",
            title: "Follow-up call - Fabricatorz",
            type: "call",
        },
        {
            date: "June 3, 2026",
            time: "11:00 AM",
            title: "Proposal review - Inky",
            type: "meeting",
        },
        {
            date: "June 4, 2026",
            time: "3:30 PM",
            title: "Contract signing",
            type: "important",
        },
    ];

    return (
        <div className={styles.componentContainer}>
            <div className={styles.componentHeader}>
                <h2>
                    <FaCalendarAlt /> Calendar
                </h2>
                <button className={styles.primaryBtn}>
                    <FaPlus /> Add Event
                </button>
            </div>
            <div className={styles.calendarGrid}>
                <div className={styles.calendarSidebar}>
                    <h3>Upcoming Events</h3>
                    <div className={styles.eventList}>
                        {events.map((event, idx) => (
                            <div
                                key={idx}
                                className={`${styles.calendarEvent} ${styles[event.type]}`}
                            >
                                <div className={styles.eventDate}>
                                    <span className={styles.eventDay}>
                                        {event.date.split(",")[1]?.trim().split(" ")[1]}
                                    </span>
                                    <span className={styles.eventMonth}>
                                        {event.date.split(",")[0]}
                                    </span>
                                </div>
                                <div className={styles.eventInfo}>
                                    <span className={styles.eventTime}>{event.time}</span>
                                    <span className={styles.eventTitle}>{event.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.calendarMain}>
                    <div className={styles.calendarHeader}>
                        <button>
                            <FaChevronLeft />
                        </button>
                        <h3>June 2026</h3>
                        <button>
                            <FaChevronRight />
                        </button>
                    </div>
                    <div className={styles.calendarWeekdays}>
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div key={day}>{day}</div>
                        ))}
                    </div>
                    <div className={styles.calendarDays}>
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                            <div
                                key={day}
                                className={`${styles.calendarDay} ${day === 2 || day === 3 ? styles.hasEvent : ""}`}
                            >
                                {day}
                                {(day === 2 || day === 3) && (
                                    <span className={styles.eventDot}></span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Settings View ────────────────────────────────────────────────────────────
const SettingsView = () => {
    return (
        <div className={styles.componentContainer}>
            <div className={styles.componentHeader}>
                <h2>
                    <FaCog /> Settings
                </h2>
            </div>
            <div className={styles.settingsGrid}>
                <div className={styles.settingsCard}>
                    <h3>
                        <FaUserCircle /> Profile Settings
                    </h3>
                    <div className={styles.settingItem}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            defaultValue="Alex Jenkin"
                            className={styles.settingInput}
                        />
                    </div>
                    <div className={styles.settingItem}>
                        <label>Email</label>
                        <input
                            type="email"
                            defaultValue="alex.jenkin@ida.com"
                            className={styles.settingInput}
                        />
                    </div>
                    <div className={styles.settingItem}>
                        <label>Phone</label>
                        <input
                            type="tel"
                            defaultValue="+1 234 567 8900"
                            className={styles.settingInput}
                        />
                    </div>
                    <button className={styles.primaryBtn}>Save Changes</button>
                </div>
                <div className={styles.settingsCard}>
                    <h3>
                        <FaBell /> Notification Settings
                    </h3>
                    <div className={styles.settingToggle}>
                        <span>Email Notifications</span>
                        <label className={styles.switch}>
                            <input type="checkbox" defaultChecked />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                    <div className={styles.settingToggle}>
                        <span>Push Notifications</span>
                        <label className={styles.switch}>
                            <input type="checkbox" />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                    <div className={styles.settingToggle}>
                        <span>SMS Alerts</span>
                        <label className={styles.switch}>
                            <input type="checkbox" defaultChecked />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                </div>
                <div className={styles.settingsCard}>
                    <h3>
                        <FaChartLine /> Display Preferences
                    </h3>
                    <div className={styles.settingItem}>
                        <label>Theme</label>
                        <select className={styles.settingSelect}>
                            <option>Light</option>
                            <option>Dark</option>
                            <option>System Default</option>
                        </select>
                    </div>
                    <div className={styles.settingItem}>
                        <label>Default View</label>
                        <select className={styles.settingSelect}>
                            <option>Dashboard</option>
                            <option>Pipeline</option>
                            <option>Reports</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;

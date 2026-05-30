import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FaChalkboardTeacher, FaUsers, FaCalendarCheck, FaTasks,
  FaBookOpen, FaFileAlt, FaClock, FaCheckCircle,
  FaUserGraduate, FaChartLine, FaChevronLeft, FaChevronRight,
  FaBars, FaSignOutAlt, FaBell, FaTimes, FaEye,
  FaDownload, FaPlus, FaEdit, FaTrash, FaStar,
  FaAward, FaTrophy, FaClipboardList
} from 'react-icons/fa';
import styles from './TrainerDashboard.module.css';
import AttendanceTable from './AttendanceTable/TrainerAttendanceMarker';


const TrainerDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [showNotifications, setShowNotifications] = useState(false);

    // Sample Data for Overview
    const [batches, setBatches] = useState([
        { id: 1, name: 'Full Stack Development', code: 'FSD-2024', students: 28, time: '10:00 AM - 1:00 PM', days: 'Mon, Wed, Fri', progress: 75, status: 'active' },
        { id: 2, name: 'Data Science', code: 'DS-2024', students: 22, time: '2:00 PM - 5:00 PM', days: 'Tue, Thu, Sat', progress: 60, status: 'active' },
        { id: 3, name: 'React Advanced', code: 'REACT-2024', students: 16, time: '11:00 AM - 2:00 PM', days: 'Mon, Thu', progress: 100, status: 'completed' },
        { id: 4, name: 'Python Programming', code: 'PY-2024', students: 20, time: '9:00 AM - 12:00 PM', days: 'Tue, Fri', progress: 45, status: 'active' },
    ]);

    // Sample Notifications Data
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'New Assignment', message: 'React Components Assignment due on June 10', time: '2 hours ago', read: false },
        { id: 2, title: 'Attendance Alert', message: '3 students absent today in FSD batch', time: '5 hours ago', read: false },
        { id: 3, title: 'Test Scheduled', message: 'Data Science test on June 15', time: '1 day ago', read: true },
        { id: 4, title: 'New Student Added', message: 'Rahul Sharma joined React batch', time: '2 days ago', read: true },
    ]);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'T';
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(notif => 
            notif.id === id ? { ...notif, read: true } : notif
        ));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(notif => notif.id !== id));
        toast.success('Notification deleted');
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    // Sidebar Menu Items
    const menuItems = [
        { id: 'overview', label: 'Batch Overview', icon: FaChalkboardTeacher },
        { id: 'attendance', label: 'Attendance Table', icon: FaCalendarCheck },
        { id: 'assignments', label: 'Assignments', icon: FaTasks },
        { id: 'tests', label: 'Tests', icon: FaFileAlt },
        { id: 'performance', label: 'Student Performance', icon: FaChartLine },
        { id: 'materials', label: 'Course Materials', icon: FaBookOpen },
    ];

    // Overview Component - Complete Data
    const OverviewComponent = () => (
        <div className={styles.overviewContainer}>
            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><FaChalkboardTeacher /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{batches.length}</span>
                        <span className={styles.statLabel}>Total Batches</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><FaUsers /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{batches.reduce((sum, b) => sum + b.students, 0)}</span>
                        <span className={styles.statLabel}>Total Students</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><FaTasks /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>8</span>
                        <span className={styles.statLabel}>Active Assignments</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><FaFileAlt /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>4</span>
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
                    {batches.map(batch => (
                        <div key={batch.id} className={styles.batchCard}>
                            <div className={styles.batchHeader}>
                                <h4>{batch.name}</h4>
                                <span className={`${styles.batchStatus} ${batch.status === 'active' ? styles.active : styles.completed}`}>
                                    {batch.status === 'active' ? 'Active' : 'Completed'}
                                </span>
                            </div>
                            <div className={styles.batchDetails}>
                                <p><span>📚 Code:</span> {batch.code}</p>
                                <p><span>👨‍🎓 Students:</span> {batch.students}</p>
                                <p><span>⏰ Time:</span> {batch.time}</p>
                                <p><span>📅 Days:</span> {batch.days}</p>
                            </div>
                            <div className={styles.progressSection}>
                                <div className={styles.progressLabel}>
                                    <span>Course Progress</span>
                                    <span>{batch.progress}%</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill} style={{ width: `${batch.progress}%` }}></div>
                                </div>
                            </div>
                            <div className={styles.batchActions}>
                                <button className={styles.actionBtn}><FaEye /> View</button>
                                <button className={styles.actionBtn}><FaEdit /> Edit</button>
                            </div>
                        </div>
                    ))}
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
                        <div className={styles.activityIcon}><FaUserGraduate /></div>
                        <div className={styles.activityContent}>
                            <p>New student <strong>Rahul Sharma</strong> joined Full Stack batch</p>
                            <span>2 hours ago</span>
                        </div>
                    </div>
                    <div className={styles.activityItem}>
                        <div className={styles.activityIcon}><FaTasks /></div>
                        <div className={styles.activityContent}>
                            <p>Assignment <strong>React Components</strong> submitted by 20 students</p>
                            <span>5 hours ago</span>
                        </div>
                    </div>
                    <div className={styles.activityItem}>
                        <div className={styles.activityIcon}><FaCheckCircle /></div>
                        <div className={styles.activityContent}>
                            <p>Test <strong>JavaScript Basics</strong> completed by Data Science batch</p>
                            <span>1 day ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render content based on active tab
    const renderContent = () => {
        switch(activeTab) {
            case 'overview':
                return <OverviewComponent />;
            case 'attendance':
                return <div className={styles.placeholderBox}><AttendanceTable/></div>;
            case 'assignments':
                return <div className={styles.placeholderBox}>📝 Assignments Component - Yahan Assignments ka content aayega</div>;
            case 'tests':
                return <div className={styles.placeholderBox}>📋 Tests Component - Yahan Tests ka content aayega</div>;
            case 'performance':
                return <div className={styles.placeholderBox}>📈 Student Performance Component - Yahan Performance Graph aayega</div>;
            case 'materials':
                return <div className={styles.placeholderBox}>📚 Course Materials Component - Yahan Course Materials ka content aayega</div>;
            default:
                return <OverviewComponent />;
        }
    };

    return (
        <div className={`${styles.app} ${sidebarCollapsed ? styles.appCollapsed : ''}`}>
            
            {/* Notification Panel */}
            {showNotifications && (
                <>
                    <div className={styles.notificationPanel}>
                        <div className={styles.notificationHeader}>
                            <h3><FaBell /> Notifications <span className={styles.notifBadge}>{unreadCount}</span></h3>
                            <button onClick={() => setShowNotifications(false)}><FaTimes /></button>
                        </div>
                        <div className={styles.notificationList}>
                            {notifications.length === 0 ? (
                                <div className={styles.emptyNotifications}>
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div key={notif.id} className={`${styles.notificationItem} ${!notif.read ? styles.unread : ''}`}>
                                        <div className={styles.notifContent}>
                                            <h4>{notif.title}</h4>
                                            <p>{notif.message}</p>
                                            <span>{notif.time}</span>
                                        </div>
                                        <div className={styles.notifActions}>
                                            {!notif.read && (
                                                <button onClick={() => markAsRead(notif.id)} title="Mark as read">
                                                    <FaCheckCircle />
                                                </button>
                                            )}
                                            <button onClick={() => deleteNotification(notif.id)} title="Delete">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className={styles.overlay} onClick={() => setShowNotifications(false)}></div>
                </>
            )}

            {/* ============================================================ */}
            {/* SIDEBAR */}
            {/* ============================================================ */}
            <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''} ${mobileMenuOpen ? styles.sidebarMobile : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}><FaChalkboardTeacher /></div>
                        {!sidebarCollapsed && <span className={styles.logoText}>Trainer Portal</span>}
                    </div>
                    {!sidebarCollapsed && (
                        <button className={styles.collapseBtn} onClick={() => setSidebarCollapsed(true)}>
                            <FaChevronLeft />
                        </button>
                    )}
                    {sidebarCollapsed && (
                        <button className={styles.expandBtn} onClick={() => setSidebarCollapsed(false)}>
                            <FaChevronRight />
                        </button>
                    )}
                </div>

                <nav className={styles.nav}>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <item.icon className={styles.navIcon} />
                            {!sidebarCollapsed && <span className={styles.navLabel}>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <FaSignOutAlt /> {!sidebarCollapsed && 'Logout'}
                    </button>
                </div>
            </aside>

            {/* ============================================================ */}
            {/* MAIN CONTENT */}
            {/* ============================================================ */}
            <main className={styles.main}>
                
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button className={styles.menuToggle} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            <FaBars />
                        </button>
                        <div className={styles.pageTitle}>
                            <h2>{menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}</h2>
                        </div>
                    </div>
                    <div className={styles.headerRight}>
                        <button className={styles.iconBtn} onClick={() => setShowNotifications(!showNotifications)}>
                            <FaBell />
                            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                        </button>
                        <div className={styles.userProfile}>
                            <div className={styles.avatar}>{getInitial(user?.name)}</div>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{user?.name || 'Trainer'}</span>
                                <span className={styles.userRole}>Trainer</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className={styles.content}>
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default TrainerDashboard;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FaChalkboardTeacher, FaUsers, FaCalendarCheck, FaTasks,
  FaBookOpen, FaFileAlt, FaClock, FaCheckCircle,
  FaUserGraduate, FaChartLine, FaChevronLeft, FaChevronRight,
  FaBars, FaSignOutAlt, FaBell, FaTimes, FaEye,
  FaDownload, FaPlus, FaEdit, FaTrash, FaStar,
  FaAward, FaTrophy, FaClipboardList, FaSpinner,
  FaLayerGroup, FaUserTie
} from 'react-icons/fa';
import styles from './TrainerDashboard.module.css';
import api from '../../../services/api';

// Attendance Component
import AttendanceTable from './AttendanceTable/TrainerAttendanceMarker';

// Batch Management Component
import BatchManagement from './Betch/BatchManagement';
import StudentPerformance from './Performance/StudentPerformance';
import Assignments from './Performance/Assignments';
import Tests from './Performance/Tests';
import CourseMaterials from './CourseMaterials';

const TrainerDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showBatchManagement, setShowBatchManagement] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Real data from database
    const [batches, setBatches] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({
        totalBatches: 0,
        totalStudents: 0,
        activeAssignments: 0,
        upcomingTests: 0
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            console.log('=== TRAINER DASHBOARD ===');
            console.log('✅ Trainer loaded:', parsedUser.name);
            console.log('✅ Trainer Role:', parsedUser.role);
        }
        fetchTrainerData();
    }, []);

    // Fetch real data from backend
    const fetchTrainerData = async () => {
        setLoading(true);
        try {
            const batchesResponse = await api.get('/batches/trainer/assigned');
            if (batchesResponse.data.success) {
                const batchesData = batchesResponse.data.data;
                setBatches(batchesData);
                
                const totalStudents = batchesData.reduce((sum, batch) => sum + (batch.studentsCount || 0), 0);
                setStats({
                    totalBatches: batchesData.length,
                    totalStudents: totalStudents,
                    activeAssignments: batchesData.reduce((sum, batch) => sum + (batch.activeAssignments || 0), 0),
                    upcomingTests: batchesData.reduce((sum, batch) => sum + (batch.upcomingTests || 0), 0)
                });
            }
            
            const notifResponse = await api.get('/notifications/trainer');
            if (notifResponse.data.success) {
                setNotifications(notifResponse.data.data);
            }
        } catch (error) {
            console.error('Error fetching trainer data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'T';
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(notif => 
                notif.id === id ? { ...notif, read: true } : notif
            ));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(notif => notif.id !== id));
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    // ✅ Get display name and role from user object
    const displayName = user?.name || 'Trainer';
    const displayRole = 'Trainer';

    // Sidebar Menu Items
    const menuItems = [
        { id: 'overview', label: 'Batch Overview', icon: FaChalkboardTeacher },
        { id: 'attendance', label: 'Attendance Table', icon: FaCalendarCheck },
        { id: 'assignments', label: 'Assignments', icon: FaTasks },
        { id: 'tests', label: 'Tests', icon: FaFileAlt },
        { id: 'performance', label: 'Student Performance', icon: FaChartLine },
        { id: 'materials', label: 'Course Materials', icon: FaBookOpen },
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
                    <div className={styles.statIcon}><FaChalkboardTeacher /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.totalBatches}</span>
                        <span className={styles.statLabel}>Total Batches</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><FaUsers /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.totalStudents}</span>
                        <span className={styles.statLabel}>Total Students</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><FaTasks /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.activeAssignments}</span>
                        <span className={styles.statLabel}>Active Assignments</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><FaFileAlt /></div>
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
                        batches.map(batch => (
                            <div key={batch._id} className={styles.batchCard}>
                                <div className={styles.batchHeader}>
                                    <h4>{batch.name}</h4>
                                    <span className={`${styles.batchStatus} ${batch.status === 'active' ? styles.active : styles.completed}`}>
                                        {batch.status === 'active' ? 'Active' : 'Completed'}
                                    </span>
                                </div>
                                <div className={styles.batchDetails}>
                                    <p><span>📚 Code:</span> {batch.code}</p>
                                    <p><span>👨‍🎓 Students:</span> {batch.studentsCount || 0}</p>
                                    <p><span>⏰ Time:</span> {batch.timings || 'Not set'}</p>
                                    <p><span>📅 Days:</span> {batch.days || 'Not set'}</p>
                                </div>
                                <div className={styles.progressSection}>
                                    <div className={styles.progressLabel}>
                                        <span>Course Progress</span>
                                        <span>{batch.progress || 0}%</span>
                                    </div>
                                    <div className={styles.progressBar}>
                                        <div className={styles.progressFill} style={{ width: `${batch.progress || 0}%` }}></div>
                                    </div>
                                </div>
                                <div className={styles.batchActions}>
                                    <button className={styles.actionBtn}><FaEye /> View</button>
                                    <button className={styles.actionBtn}><FaEdit /> Edit</button>
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
                        <div className={styles.activityIcon}><FaUserGraduate /></div>
                        <div className={styles.activityContent}>
                            <p>New student joined your batch</p>
                            <span>2 hours ago</span>
                        </div>
                    </div>
                    <div className={styles.activityItem}>
                        <div className={styles.activityIcon}><FaTasks /></div>
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
            <p className={styles.placeholderHint}>👉 Baad me aap apna component yahan import kar lena</p>
        </div>
    );

    // Render content based on active tab
    const renderContent = () => {
        if (showBatchManagement) {
            return <BatchManagement onBack={() => setShowBatchManagement(false)} />;
        }
        
        switch(activeTab) {
            case 'overview':
                return <OverviewComponent />;
            case 'attendance':
                return <AttendanceTable />;
            case 'assignments':
                return <Assignments/>;
            case 'tests':
                return <Tests/>;
            case 'performance':
                return <StudentPerformance/>;
            case 'materials':
                return <CourseMaterials/>;
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

            {/* Sidebar */}
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
                    {/* ✅ Trainer Info in Sidebar */}
                    <div className={styles.sidebarUserInfo}>
                        <div className={styles.sidebarAvatar}>{getInitial(displayName)}</div>
                        {!sidebarCollapsed && (
                            <div className={styles.sidebarUserDetails}>
                                <span className={styles.sidebarUserName}>{displayName}</span>
                                <span className={styles.sidebarUserRole}>{displayRole}</span>
                            </div>
                        )}
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <FaSignOutAlt /> {!sidebarCollapsed && 'Logout'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button className={styles.menuToggle} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            <FaBars />
                        </button>
                        <div className={styles.pageTitle}>
                            <h2>
                                {showBatchManagement ? 'Batch Management' : (menuItems.find(item => item.id === activeTab)?.label || 'Dashboard')}
                            </h2>
                        </div>
                    </div>
                    <div className={styles.headerRight}>
                        <button className={styles.iconBtn} onClick={() => setShowNotifications(!showNotifications)}>
                            <FaBell />
                            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
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
                <div className={styles.content}>
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default TrainerDashboard;
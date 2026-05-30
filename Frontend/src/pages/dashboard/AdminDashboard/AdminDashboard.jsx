import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FaBars, FaBell, FaEnvelope, FaSignOutAlt, FaChevronLeft, FaChevronRight,
  FaTachometerAlt, FaUsers, FaChalkboardTeacher, FaChartLine, FaBuilding,
  FaCalendarCheck, FaTasks, FaFileAlt, FaTimes
} from 'react-icons/fa';
import { IoMdSettings } from 'react-icons/io';
import styles from './AdminDashboard.module.css';
import TrainerManagement from './TrannerManagement/TrainerManagement';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showChat, setShowChat] = useState(false);

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
        return name ? name.charAt(0).toUpperCase() : 'A';
    };

    // Sample stats for overview (static display data)
    const stats = {
        employees: { total: 85, active: 72, inactive: 13 },
        trainers: { total: 12, activeBatches: 8, totalStudents: 245 },
        sales: { totalLeads: 348, convertedLeads: 156, pendingFollowups: 45 },
        hr: { companies: 48, placementDrives: 12, studentsPlaced: 124 },
        attendance: { present: 68, absent: 12, leaveRequests: 5 },
        tasks: { pending: 18, completed: 42, overdue: 6 }
    };

    const activities = [
        { id: 1, icon: '👤', text: 'New employee Rahul Sharma joined Sales department', time: '2 hours ago' },
        { id: 2, icon: '✅', text: 'Task "Review monthly report" completed', time: '5 hours ago' },
        { id: 3, icon: '🎓', text: 'New admission for Full Stack Development course', time: '1 day ago' },
        { id: 4, icon: '📊', text: 'Attendance marked for FSD Batch today', time: '1 day ago' },
    ];

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
        { id: 'employees', label: 'Employee Management', icon: FaUsers },
        { id: 'trainers', label: 'Trainer Management', icon: FaChalkboardTeacher },
        { id: 'sales', label: 'Sales Team', icon: FaChartLine },
        { id: 'hr', label: 'HR Management', icon: FaBuilding },
        { id: 'attendance', label: 'Attendance Monitoring', icon: FaCalendarCheck },
        { id: 'tasks', label: 'Task Management', icon: FaTasks },
        { id: 'reports', label: 'Reports', icon: FaFileAlt },
        { id: 'settings', label: 'Settings', icon: IoMdSettings },
    ];

    // Stats Cards Component (Only for Overview)
    const StatsCards = () => (
        <div className={styles.statsGrid}>
            <div className={styles.statCard}>
                <div className={styles.statIcon}><FaUsers /></div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.employees.total}</span>
                    <span className={styles.statLabel}>Total Employees</span>
                    <div className={styles.statSub}>Active: {stats.employees.active} | Inactive: {stats.employees.inactive}</div>
                </div>
            </div>
            <div className={styles.statCard}>
                <div className={styles.statIcon}><FaChalkboardTeacher /></div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.trainers.total}</span>
                    <span className={styles.statLabel}>Trainers</span>
                    <div className={styles.statSub}>Active Batches: {stats.trainers.activeBatches}</div>
                </div>
            </div>
            <div className={styles.statCard}>
                <div className={styles.statIcon}><FaChartLine /></div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.sales.totalLeads}</span>
                    <span className={styles.statLabel}>Total Leads</span>
                    <div className={styles.statSub}>Converted: {stats.sales.convertedLeads}</div>
                </div>
            </div>
            <div className={styles.statCard}>
                <div className={styles.statIcon}><FaBuilding /></div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.hr.companies}</span>
                    <span className={styles.statLabel}>Companies</span>
                    <div className={styles.statSub}>Drives: {stats.hr.placementDrives}</div>
                </div>
            </div>
            <div className={styles.statCard}>
                <div className={styles.statIcon}><FaCalendarCheck /></div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.attendance.present}</span>
                    <span className={styles.statLabel}>Present Today</span>
                    <div className={styles.statSub}>Absent: {stats.attendance.absent}</div>
                </div>
            </div>
            <div className={styles.statCard}>
                <div className={styles.statIcon}><FaTasks /></div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.tasks.pending}</span>
                    <span className={styles.statLabel}>Pending Tasks</span>
                    <div className={styles.statSub}>Completed: {stats.tasks.completed}</div>
                </div>
            </div>
        </div>
    );

    // Charts Section (Only for Overview)
    const ChartsSection = () => (
        <div className={styles.chartsSection}>
            <div className={styles.chartCard}>
                <h3>Attendance Overview</h3>
                <div className={styles.chartPlaceholder}>
                    <div className={styles.donutChart}>
                        <div className={styles.donutSegment} style={{ width: '68%', background: '#10b981' }}>Present 68%</div>
                        <div className={styles.donutSegment} style={{ width: '12%', background: '#ef4444' }}>Absent 12%</div>
                        <div className={styles.donutSegment} style={{ width: '20%', background: '#f59e0b' }}>Leave/Other 20%</div>
                    </div>
                </div>
            </div>
            <div className={styles.chartCard}>
                <h3>Sales Conversion</h3>
                <div className={styles.barChart}>
                    <div className={styles.bar} style={{ height: '45%' }}><span>Leads 45%</span></div>
                    <div className={styles.bar} style={{ height: '30%' }}><span>Converted 30%</span></div>
                    <div className={styles.bar} style={{ height: '25%' }}><span>Lost 25%</span></div>
                </div>
            </div>
            <div className={styles.chartCard}>
                <h3>Placement Analytics</h3>
                <div className={styles.placementStats}>
                    <div className={styles.placementItem}>
                        <span>Students Placed: {stats.hr.studentsPlaced}</span>
                        <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '65%' }}></div></div>
                    </div>
                    <div className={styles.placementItem}>
                        <span>Placement Ratio: 65%</span>
                        <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '65%' }}></div></div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Recent Activities (Only for Overview)
    const RecentActivities = () => (
        <div className={styles.recentActivities}>
            <h3>Recent Activities</h3>
            <div className={styles.activityList}>
                {activities.map(activity => (
                    <div key={activity.id} className={styles.activityItem}>
                        <div className={styles.activityIcon}>{activity.icon}</div>
                        <div className={styles.activityContent}>
                            <p>{activity.text}</p>
                            <span>{activity.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Placeholder components for other tabs (sirf text dikhega)
    const PlaceholderComponent = ({ title }) => (
        <div className={styles.placeholderBox}>
            
        </div>
    );

    // Render content based on active tab
    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard':
                return (
                    <>
                        <StatsCards />
                        <ChartsSection />
                        <RecentActivities />
                    </>
                );
            case 'employees':
                return <PlaceholderComponent title="Employee Management" />;
            case 'trainers':
                return <TrainerManagement title="Trainer Management"/>;
            case 'sales':
                return <PlaceholderComponent title="Sales Team" />;
            case 'hr':
                return <PlaceholderComponent title="HR Management" />;
            case 'attendance':
                return <PlaceholderComponent title="Attendance Monitoring" />;
            case 'tasks':
                return <PlaceholderComponent title="Task Management" />;
            case 'reports':
                return <PlaceholderComponent title="Reports" />;
            case 'settings':
                return <PlaceholderComponent title="Settings" />;
            default:
                return (
                    <>
                        <StatsCards />
                        <ChartsSection />
                        <RecentActivities />
                    </>
                );
        }
    };

    return (
        <div className={`${styles.app} ${sidebarCollapsed ? styles.appCollapsed : ''}`}>
            
            {/* Notification Panel */}
            {showNotifications && (
                <div className={styles.notificationPanel}>
                    <div className={styles.panelHeader}>
                        <h3><FaBell /> Notifications</h3>
                        <button onClick={() => setShowNotifications(false)}><FaTimes /></button>
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

            {/* Chat Panel */}
            {showChat && (
                <div className={styles.chatPanel}>
                    <div className={styles.panelHeader}>
                        <h3><FaEnvelope /> Messages</h3>
                        <button onClick={() => setShowChat(false)}><FaTimes /></button>
                    </div>
                    <div className={styles.chatMessages}>
                        <div className={styles.emptyChat}>
                            <p>Select a contact to start messaging</p>
                        </div>
                    </div>
                </div>
            )}

            {(showNotifications || showChat) && (
                <div className={styles.overlay} onClick={() => { setShowNotifications(false); setShowChat(false); }}></div>
            )}

            {/* ============================================================ */}
            {/* SIDEBAR */}
            {/* ============================================================ */}
            <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''} ${mobileMenuOpen ? styles.sidebarMobile : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>🏢</div>
                        {!sidebarCollapsed && <span className={styles.logoText}>Admin Portal</span>}
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
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>{getInitial(user?.name)}</div>
                        {!sidebarCollapsed && (
                            <div>
                                <div className={styles.userName}>{user?.name || 'Admin'}</div>
                                <div className={styles.userRole}>Admin Manager</div>
                            </div>
                        )}
                    </div>
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
                        <button className={styles.iconBtn} onClick={() => setShowChat(!showChat)}>
                            <FaEnvelope />
                        </button>
                        <button className={styles.iconBtn} onClick={() => setShowNotifications(!showNotifications)}>
                            <FaBell />
                        </button>
                        <div className={styles.userProfile}>
                            <div className={styles.avatarSmall}>{getInitial(user?.name)}</div>
                            <div>
                                <div className={styles.userName}>{user?.name || 'Admin'}</div>
                                <div className={styles.userRole}>Admin Manager</div>
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

export default AdminDashboard;
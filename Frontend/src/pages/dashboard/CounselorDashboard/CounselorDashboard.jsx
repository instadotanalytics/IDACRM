import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FaBars, FaBell, FaEnvelope, FaSignOutAlt, FaChevronLeft, FaChevronRight,
  FaTachometerAlt, FaUsers, FaChartLine, FaFileAlt, FaPhoneAlt,
  FaUserGraduate, FaCog, FaCheckCircle, FaClock, FaGraduationCap,
  FaTimes, FaPhone, FaEnvelope as FaEnvelopeIcon
} from 'react-icons/fa';
import styles from './CounselorDashboard.module.css';
import Admission from './Admission/Admission';

// Placeholder Component for other tabs
const PlaceholderContent = ({ title, description }) => (
  <div className={styles.placeholderBox}>
    <h3>{title}</h3>
    <p>{description}</p>
    <p className={styles.placeholderHint}>👉 Baad me aap apna component yahan import kar lena</p>
  </div>
);

// Dashboard Overview Component
const DashboardOverview = ({ user }) => {
  const stats = {
    totalStudents: 124,
    activeStudents: 98,
    placedStudents: 45,
    completedCourses: 32,
    newThisWeek: 12
  };

  const courses = [
    { name: 'Node.js Development', students: 45, color: '#3b82f6' },
    { name: 'Web Development', students: 38, color: '#10b981' },
  ];

  const pendingFollowups = [
    { id: 1, name: 'Rahul Sharma', action: 'Call back tomorrow', phone: '+91 98765 43210' },
    { id: 2, name: 'Priya Patel', action: 'Send course details', phone: '+91 98765 43211' },
    { id: 3, name: 'Ankit Verma', action: 'Schedule demo class', phone: '+91 98765 43212' },
    { id: 4, name: 'Neha Gupta', action: 'Share fee structure', phone: '+91 98765 43213' },
  ];

  return (
    <div className={styles.dashboardOverview}>
      <div className={styles.welcomeCard}>
        <div className={styles.welcomeContent}>
          <h1>Welcome back, {user?.name || 'Counselor'}! 👋</h1>
          <p>Here's what's happening with your students today.</p>
        </div>
        <div className={styles.dateDisplay}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className={styles.chartCard}>
        <h3>Students by Course</h3>
        <div className={styles.courseList}>
          {courses.map((course, idx) => (
            <div key={idx} className={styles.courseItem}>
              <div className={styles.courseInfo}>
                <span className={styles.courseName}>{course.name}</span>
                <span className={styles.courseCount}>{course.students} Students</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${(course.students / 124) * 100}%`, background: course.color }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaUsers /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.totalStudents}</span>
            <span className={styles.statLabel}>Total Students</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaCheckCircle /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.activeStudents}</span>
            <span className={styles.statLabel}>Active Students</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaGraduationCap /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.placedStudents}</span>
            <span className={styles.statLabel}>Placed Students</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaClock /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.completedCourses}</span>
            <span className={styles.statLabel}>Completed Courses</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🆕</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.newThisWeek}</span>
            <span className={styles.statLabel}>New This Week</span>
          </div>
        </div>
      </div>

      <div className={styles.followupCard}>
        <div className={styles.cardHeader}>
          <h3>📞 Pending Follow-ups</h3>
          <button className={styles.viewAllBtn}>View All</button>
        </div>
        <div className={styles.followupList}>
          {pendingFollowups.map(item => (
            <div key={item.id} className={styles.followupItem}>
              <div className={styles.followupInfo}>
                <div className={styles.followupName}>{item.name}</div>
                <div className={styles.followupAction}>{item.action}</div>
                <div className={styles.followupPhone}>{item.phone}</div>
              </div>
              <div className={styles.followupActions}>
                <button className={styles.callBtn}><FaPhone /></button>
                <button className={styles.messageBtn}><FaEnvelopeIcon /></button>
              </div>
            </div>
          ))}
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
    return name ? name.charAt(0).toUpperCase() : 'C';
  };

  // ✅ Updated Sidebar Menu Items - REMOVED "Students"
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { id: 'leads', label: 'Leads', icon: FaChartLine },
    { id: 'calls', label: 'Calls', icon: FaPhoneAlt },
    { id: 'admissions', label: 'Admissions', icon: FaFileAlt },
    { id: 'reports', label: 'Reports', icon: FaUserGraduate },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview user={user} />;
      case 'leads':
        return <PlaceholderContent title="Leads" description="Track and manage all incoming leads and enquiries." />;
      case 'calls':
        return <PlaceholderContent title="Calls" description="Manage call logs, schedules, and follow-up calls." />;
      case 'admissions':
        return <Admission />;
      case 'reports':
        return <PlaceholderContent title="Reports" description="Generate and export various reports." />;
      case 'settings':
        return <PlaceholderContent title="Settings" description="Configure system settings and preferences." />;
      default:
        return <DashboardOverview user={user} />;
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
              <p>No new notifications</p>
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
          <div className={styles.chatContent}>
            <p>Select a contact to start messaging</p>
          </div>
        </div>
      )}

      {(showNotifications || showChat) && (
        <div className={styles.overlay} onClick={() => { setShowNotifications(false); setShowChat(false); }} />
      )}

      {/* ============================================================ */}
      {/* SIDEBAR */}
      {/* ============================================================ */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''} ${mobileMenuOpen ? styles.sidebarMobile : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>💬</div>
            {!sidebarCollapsed && <span className={styles.logoText}>Counselor Portal</span>}
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
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user?.name || 'Counselor'}</span>
                <span className={styles.userRole}>Counselor</span>
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
              <div className={styles.userInfoText}>
                <span className={styles.userNameText}>{user?.name || 'Counselor'}</span>
                <span className={styles.userRoleText}>Counselor</span>
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

export default CounselorDashboard;
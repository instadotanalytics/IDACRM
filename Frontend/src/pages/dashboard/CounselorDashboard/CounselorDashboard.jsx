import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FaBars, FaBell, FaEnvelope, FaSignOutAlt, FaChevronLeft, FaChevronRight,
  FaTachometerAlt, FaUsers, FaChartLine, FaFileAlt, FaPhoneAlt,
  FaCog, FaClock, FaTimes, FaPhone, 
  FaEnvelope as FaEnvelopeIcon, FaSpinner, FaArrowUp, FaArrowDown,
  FaCalendarAlt, FaUserGraduate, FaPhoneVolume
} from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import styles from './CounselorDashboard.module.css';
import Admission from './Admission/Admission';
import Leads from './Leads/Leades';
import Calls from './CallsCounsler/Calls';
import api from '../../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const PlaceholderContent = ({ title, description }) => (
  <div className={styles.placeholderBox}>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

const DashboardOverview = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalCalls: 0,
    connectedCalls: 0,
    pendingFollowups: 0,
    totalAdmissions: 0,
    newLeadsThisWeek: 0,
    newCallsToday: 0,
    conversionRate: 0,
    weeklyData: [0, 0, 0, 0, 0, 0, 0]
  });
  
  const [courses, setCourses] = useState([]);
  const [pendingFollowups, setPendingFollowups] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('user');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      const userRole = currentUser?.role || 'counselor';
      const userId = currentUser?._id || currentUser?.id;

      let leads = [];
      let calls = [];
      let admissions = [];

      if (userRole === 'admin_manager' || userRole === 'super_admin') {
        const [leadsRes, callsRes, admissionsRes] = await Promise.all([
          api.get('/leads'),
          api.get('/calls'),
          api.get('/admissions')
        ]);
        leads = leadsRes.data.success ? leadsRes.data.data : [];
        calls = callsRes.data.success ? callsRes.data.data : [];
        admissions = admissionsRes.data.success ? admissionsRes.data.data : [];
      } else {
        try {
          const [leadsRes, callsRes, admissionsRes] = await Promise.all([
            api.get(`/leads/counselor/${userId}`),
            api.get(`/calls/counselor/${userId}`),
            api.get('/admissions')
          ]);
          leads = leadsRes.data.success ? leadsRes.data.data : [];
          calls = callsRes.data.success ? callsRes.data.data : [];
          admissions = admissionsRes.data.success ? admissionsRes.data.data : [];
        } catch (err) {
          const [leadsRes, callsRes, admissionsRes] = await Promise.all([
            api.get('/leads'),
            api.get('/calls'),
            api.get('/admissions')
          ]);
          const allLeads = leadsRes.data.success ? leadsRes.data.data : [];
          const allCalls = callsRes.data.success ? callsRes.data.data : [];
          leads = allLeads.filter(l => l.assignedTo === userId || l.counselorId === userId);
          calls = allCalls.filter(c => c.counselorId === userId);
          admissions = admissionsRes.data.success ? admissionsRes.data.data : [];
        }
      }

      const weeklyData = [0, 0, 0, 0, 0, 0, 0];
      leads.forEach(lead => {
        const date = new Date(lead.createdAt);
        const day = date.getDay();
        if (day >= 0 && day <= 6) {
          weeklyData[day]++;
        }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      
      const newLeadsThisWeek = leads.filter(lead => new Date(lead.createdAt) >= thisWeekStart).length;
      const todayCalls = calls.filter(call => {
        const callDate = new Date(call.callTime || call.createdAt);
        return callDate.toDateString() === today.toDateString();
      });
      const totalCalls = calls.length;
      const connectedCalls = calls.filter(call => call.callStatus === 'Connected' || call.status === 'Connected').length;
      const totalLeads = leads.length;
      const totalAdmissions = admissions.length;
      const pendingFollowupsLeads = leads.filter(lead => lead.status === 'Pending' || lead.status === 'Follow-up').length;
      const conversionRate = totalLeads > 0 ? Math.round((totalAdmissions / totalLeads) * 100) : 0;

      const courseMap = new Map();
      leads.forEach(lead => {
        const course = lead.courseInterest || lead.course || 'Other';
        courseMap.set(course, (courseMap.get(course) || 0) + 1);
      });
      
      const courseData = Array.from(courseMap.entries())
        .map(([name, count]) => ({ name, count }))
        .slice(0, 4);

      const pendingData = leads
        .filter(lead => lead.status === 'Pending' || lead.status === 'Follow-up')
        .slice(0, 4)
        .map(lead => ({
          id: lead._id,
          name: lead.name,
          phone: lead.phone,
          course: lead.courseInterest || lead.course,
          daysPending: Math.floor((new Date() - new Date(lead.createdAt || lead.enquiryDate)) / (1000 * 60 * 60 * 24))
        }));

      const recentCallsData = calls.slice(0, 4).map(call => ({
        id: call._id,
        type: 'call',
        message: `📞 Called ${call.leadName}`,
        status: call.callStatus || call.status,
        time: new Date(call.callTime || call.createdAt).toLocaleString(),
      }));

      const recentLeadsData = leads.slice(0, 4).map(lead => ({
        id: lead._id,
        type: 'lead',
        message: `🆕 New lead: ${lead.name}`,
        status: lead.status,
        time: new Date(lead.createdAt || lead.enquiryDate).toLocaleString(),
      }));

      const activities = [...recentCallsData, ...recentLeadsData]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5);

      setStats({
        totalLeads,
        totalCalls,
        connectedCalls,
        pendingFollowups: pendingFollowupsLeads,
        totalAdmissions,
        newLeadsThisWeek,
        newCallsToday: todayCalls.length,
        conversionRate,
        weeklyData
      });
      
      setCourses(courseData);
      setPendingFollowups(pendingData);
      setRecentActivities(activities);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const lineChartData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Leads',
        data: stats.weeklyData,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { 
        grid: { color: 'rgba(255,255,255,0.1)' }, 
        ticks: { color: '#a0a0a0' },
        beginAtZero: true
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: '#a0a0a0' } 
      }
    }
  };

  const doughnutData = {
    labels: courses.map(c => c.name),
    datasets: [{
      data: courses.map(c => c.count),
      backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      borderWidth: 0,
    }]
  };

  const doughnutOptions = {
    cutout: '60%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { color: '#a0a0a0', font: { size: 11 } } 
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className={styles.dashboardOverview}>
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeText}>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'Counselor'}! 👋</h1>
          <p>Track your leads, calls, and admissions at a glance.</p>
        </div>
        <div className={styles.dateBadge}>
          <FaCalendarAlt />
          <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
            <FaUsers className={styles.statIcon} style={{ color: '#6366f1' }} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.totalLeads}</span>
            <span className={styles.statLabel}>Total Leads</span>
          </div>
          <div className={styles.statTrend}>
            <FaArrowUp className={styles.trendUp} />
            <span>{stats.newLeadsThisWeek} this week</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
            <FaPhoneVolume className={styles.statIcon} style={{ color: '#10b981' }} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.totalCalls}</span>
            <span className={styles.statLabel}>Total Calls</span>
          </div>
          <div className={styles.statTrend}>
            <FaArrowUp className={styles.trendUp} />
            <span>{stats.connectedCalls} connected</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
            <FaClock className={styles.statIcon} style={{ color: '#f59e0b' }} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.pendingFollowups}</span>
            <span className={styles.statLabel}>Pending Follow-ups</span>
          </div>
          <div className={styles.statTrend}>
            <span>Action required</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
            <FaUserGraduate className={styles.statIcon} style={{ color: '#8b5cf6' }} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.totalAdmissions}</span>
            <span className={styles.statLabel}>Admissions</span>
          </div>
          <div className={styles.statTrend}>
            <span>{stats.conversionRate}% conversion</span>
          </div>
        </div>
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.lineChartCard}>
          <div className={styles.cardHeader}>
            <h3>Weekly Leads Trend</h3>
            <span className={styles.headerBadge}>+{stats.newLeadsThisWeek} this week</span>
          </div>
          <div className={styles.lineChartContainer}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {courses.length > 0 && (
          <div className={styles.doughnutCard}>
            <div className={styles.cardHeader}>
              <h3>Course Distribution</h3>
            </div>
            <div className={styles.doughnutContainer}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        )}
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.followupCard}>
          <div className={styles.cardHeader}>
            <h3>⏳ Pending Follow-ups</h3>
            <button className={styles.viewAllBtn}>View All →</button>
          </div>
          <div className={styles.followupList}>
            {pendingFollowups.length === 0 ? (
              <div className={styles.emptyState}>No pending follow-ups 🎉</div>
            ) : (
              pendingFollowups.map(item => (
                <div key={item.id} className={styles.followupItem}>
                  <div className={styles.followupAvatar}>
                    <span>{item.name.charAt(0)}</span>
                  </div>
                  <div className={styles.followupInfo}>
                    <div className={styles.followupName}>{item.name}</div>
                    <div className={styles.followupDetails}>{item.course} • {item.phone}</div>
                    <div className={styles.followupDays}>Pending for {item.daysPending} days</div>
                  </div>
                  <div className={styles.followupActions}>
                    <button className={styles.callBtn}><FaPhone /></button>
                    <button className={styles.messageBtn}><FaEnvelopeIcon /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.activityCard}>
          <div className={styles.cardHeader}>
            <h3>🔄 Recent Activities</h3>
            <button className={styles.viewAllBtn}>View All →</button>
          </div>
          <div className={styles.activityTimeline}>
            {recentActivities.length === 0 ? (
              <div className={styles.emptyState}>No recent activities</div>
            ) : (
              recentActivities.map((activity, idx) => (
                <div key={idx} className={styles.timelineItem}>
                  <div className={styles.timelineDot}></div>
                  <div className={styles.timelineContent}>
                    <div className={styles.activityMessage}>{activity.message}</div>
                    <div className={styles.activityStatus}>
                      <span className={`${styles.statusDot} ${activity.status === 'Connected' ? styles.success : styles.warning}`}></span>
                      {activity.status || 'New'}
                    </div>
                    <div className={styles.activityTime}>{activity.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
    
    if (!token || !userData) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'C';
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { id: 'leads', label: 'Leads', icon: FaChartLine },
    { id: 'calls', label: 'Calls', icon: FaPhoneAlt },
    { id: 'admissions', label: 'Admissions', icon: FaFileAlt },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardOverview user={user} />;
      case 'leads': return <Leads />;
      case 'calls': return <Calls />;
      case 'admissions': return <Admission />;
      case 'settings': return <PlaceholderContent title="Settings" description="Configure system settings" />;
      default: return <DashboardOverview user={user} />;
    }
  };

  return (
    <div className={`${styles.app} ${sidebarCollapsed ? styles.appCollapsed : ''}`}>
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''} ${mobileMenuOpen ? styles.sidebarMobile : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>CRM</div>
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
                <span className={styles.userRole}>
                  {user?.role === 'admin_manager' ? 'Admin Manager' : user?.role === 'super_admin' ? 'Super Admin' : 'Counselor'}
                </span>
              </div>
            )}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FaSignOutAlt /> {!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </aside>

      <main className={styles.main}>
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
            <button className={styles.iconBtn}><FaEnvelope /></button>
            <button className={styles.iconBtn}><FaBell /></button>
            <div className={styles.userProfile}>
              <div className={styles.avatarSmall}>{getInitial(user?.name)}</div>
              <div className={styles.userInfoText}>
                <span className={styles.userNameText}>{user?.name || 'Counselor'}</span>
                <span className={styles.userRoleText}>
                  {user?.role === 'admin_manager' ? 'Admin' : user?.role === 'super_admin' ? 'Super Admin' : 'Counselor'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default CounselorDashboard;
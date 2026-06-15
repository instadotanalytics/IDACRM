import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FaBars, FaBell, FaEnvelope, FaSignOutAlt, FaChevronLeft, FaChevronRight,
  FaTachometerAlt, FaBuilding, FaCalendarAlt, FaUsers, FaChartLine,
  FaTasks, FaComments, FaCog, FaSun, FaMoon, FaSearch,
  FaPlus, FaFilter, FaDownload, FaEye, FaEdit, FaTrash,
  FaUserTie, FaBriefcase, FaGraduationCap, FaCheckCircle,
  FaTimesCircle, FaClock, FaChartBar, FaFileAlt, FaCalendarWeek,
  FaMapMarkerAlt, FaLink, FaPhone, FaEnvelope as FaEnvelopeIcon,
  FaStar, FaArrowUp, FaArrowDown, FaUserCheck, FaUserPlus
} from 'react-icons/fa';
import { FiSend, FiUsers } from 'react-icons/fi';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import api from '../../../services/api';
import styles from './HRDashboard.module.css';
import CompaniesManagement from './Companies/CompaniesManagement';
import PlacementDriveManagement from './PlacementDrive/PlacementDriveManagement';
import HRStudentsManagement from './HRstudent/hrStudentsManagement';
import HRInterviewManagement from './HRInterview/hrInterviewManagement';
import HRDailyReport from './Reports/hrReportsManagement';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Placeholder for future components
const PlaceholderContent = ({ title }) => (
  <div className={styles.placeholderBox}>
    <div className={styles.placeholderIcon}>🚧</div>
    <h3>{title}</h3>
    <p>Component will be loaded here</p>
  </div>
);

const HRDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    placementDrives: 0,
    eligibleStudents: 0,
    appliedStudents: 0,
    selectedStudents: 0,
    joinedStudents: 0,
    placementRatio: 0,
    avgPackage: 0,
    pendingFollowups: 0
  });

  // Chart Data
  const [monthlyCompanies, setMonthlyCompanies] = useState([12, 19, 15, 17, 14, 18, 22, 25, 28, 30, 32, 35]);
  const [placementSuccess, setPlacementSuccess] = useState([65, 20, 15]);
  const [industryDistribution, setIndustryDistribution] = useState([
    { industry: 'IT Services', count: 25 },
    { industry: 'Banking', count: 18 },
    { industry: 'Consulting', count: 15 },
    { industry: 'Manufacturing', count: 12 },
    { industry: 'Healthcare', count: 8 },
    { industry: 'Other', count: 10 }
  ]);
  
  // Companies Data
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch companies
      const companiesRes = await api.get('/companies');
      if (companiesRes.data.success) {
        setCompanies(companiesRes.data.data || []);
        const totalCompanies = companiesRes.data.data?.length || 0;
        const activeCompanies = companiesRes.data.data?.filter(c => c.status === 'active').length || 0;
        setStats(prev => ({ ...prev, totalCompanies, activeCompanies }));
      }
      
      // Fetch placement drives
      const drivesRes = await api.get('/placement-drives');
      if (drivesRes.data.success) {
        setDrives(drivesRes.data.data || []);
        const placementDrives = drivesRes.data.data?.length || 0;
        setStats(prev => ({ ...prev, placementDrives }));
      }
      
      // Fetch students
      const studentsRes = await api.get('/admissions');
      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data || []);
        const eligibleStudents = studentsRes.data.data?.filter(s => s.isEligible).length || 0;
        const selectedStudents = studentsRes.data.data?.filter(s => s.isSelected).length || 0;
        const placementRatio = eligibleStudents > 0 ? (selectedStudents / eligibleStudents) * 100 : 0;
        setStats(prev => ({ 
          ...prev, 
          eligibleStudents, 
          selectedStudents,
          placementRatio: placementRatio.toFixed(1)
        }));
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set demo data if API fails
      setStats({
        totalCompanies: 48,
        activeCompanies: 32,
        placementDrives: 12,
        eligibleStudents: 180,
        appliedStudents: 156,
        selectedStudents: 124,
        joinedStudents: 98,
        placementRatio: 68.9,
        avgPackage: 6.5,
        pendingFollowups: 8
      });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'H';
  };

  // Sidebar Menu Items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { id: 'companies', label: 'Companies', icon: FaBuilding },
    { id: 'placementDrives', label: 'Placement Drives', icon: FaCalendarAlt },
    { id: 'students', label: 'Students', icon: FaUsers },
    { id: 'interviews', label: 'Interviews', icon: FaComments },
    { id: 'reports', label: 'Reports', icon: FaChartLine },
    { id: 'tasks', label: 'Tasks', icon: FaTasks },
    { id: 'meetings', label: 'Meetings', icon: FaCalendarWeek },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  const displayName = user?.name || 'HR Executive';
  const displayRole = 'HR Executive';

  // Chart Configurations
  const monthlyCompaniesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Companies Onboarded',
      data: monthlyCompanies,
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  const placementSuccessData = {
    labels: ['Selected', 'Rejected', 'Pending'],
    datasets: [{
      data: [stats.selectedStudents, stats.eligibleStudents - stats.selectedStudents, stats.eligibleStudents],
      backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
      borderWidth: 0,
    }]
  };

  const renderContent = () => {
    switch(activeMenu) {
      case 'dashboard':
        return (
          <div className={styles.dashboardContent}>
            {/* Stats Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><FaBuilding /></div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{stats.totalCompanies}</span>
                  <span className={styles.statLabel}>Total Companies</span>
                </div>
                <div className={styles.statTrend}>
                  <FaArrowUp className={styles.trendUp} />
                  <span>+12% this month</span>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}><FaBriefcase /></div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{stats.placementDrives}</span>
                  <span className={styles.statLabel}>Placement Drives</span>
                </div>
                <div className={styles.statTrend}>
                  <FaArrowUp className={styles.trendUp} />
                  <span>+3 this week</span>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}><FaGraduationCap /></div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{stats.eligibleStudents}</span>
                  <span className={styles.statLabel}>Eligible Students</span>
                </div>
                <div className={styles.statTrend}>
                  <FaArrowUp className={styles.trendUp} />
                  <span>+8% this month</span>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}><FaUserCheck /></div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{stats.selectedStudents}</span>
                  <span className={styles.statLabel}>Students Selected</span>
                </div>
                <div className={styles.statTrend}>
                  <FaArrowUp className={styles.trendUp} />
                  <span>+15% this week</span>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}><FaChartLine /></div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{stats.placementRatio}%</span>
                  <span className={styles.statLabel}>Placement Ratio</span>
                </div>
                <div className={styles.statTrend}>
                  <FaArrowUp className={styles.trendUp} />
                  <span>+5% vs last month</span>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}><FaStar /></div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>₹{stats.avgPackage} LPA</span>
                  <span className={styles.statLabel}>Average Package</span>
                </div>
                <div className={styles.statTrend}>
                  <FaArrowUp className={styles.trendUp} />
                  <span>+2 LPA vs last year</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className={styles.chartsSection}>
              <div className={styles.chartCard}>
                <h3>Monthly Company Onboarding</h3>
                <div className={styles.chartContainer}>
                  <Line data={monthlyCompaniesData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
              <div className={styles.chartCard}>
                <h3>Placement Success Rate</h3>
                <div className={styles.doughnutContainer}>
                  <Doughnut data={placementSuccessData} options={{ cutout: '60%', responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>

            {/* Recent Companies & Drives */}
            <div className={styles.twoColumnLayout}>
              <div className={styles.recentCard}>
                <div className={styles.cardHeader}>
                  <h3>Recent Companies</h3>
                  <button className={styles.viewAllBtn}>View All</button>
                </div>
                <div className={styles.recentList}>
                  {companies.slice(0, 5).map(company => (
                    <div key={company._id} className={styles.recentItem}>
                      <div className={styles.recentIcon}><FaBuilding /></div>
                      <div className={styles.recentInfo}>
                        <div className={styles.recentTitle}>{company.name}</div>
                        <div className={styles.recentSub}>{company.industry} • {company.location}</div>
                      </div>
                      <div className={styles.recentStatus}>Active</div>
                    </div>
                  ))}
                  {companies.length === 0 && (
                    <div className={styles.emptyState}>No companies added yet</div>
                  )}
                </div>
              </div>
              <div className={styles.recentCard}>
                <div className={styles.cardHeader}>
                  <h3>Upcoming Drives</h3>
                  <button className={styles.viewAllBtn}>View All</button>
                </div>
                <div className={styles.recentList}>
                  {drives.slice(0, 5).map(drive => (
                    <div key={drive._id} className={styles.recentItem}>
                      <div className={styles.recentIcon}><FaCalendarAlt /></div>
                      <div className={styles.recentInfo}>
                        <div className={styles.recentTitle}>{drive.companyName}</div>
                        <div className={styles.recentSub}>{new Date(drive.driveDate).toLocaleDateString()} • {drive.ctc} LPA</div>
                      </div>
                      <div className={styles.recentStatus}>Upcoming</div>
                    </div>
                  ))}
                  {drives.length === 0 && (
                    <div className={styles.emptyState}>No drives scheduled</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'companies':
        return <CompaniesManagement/>;
      case 'placementDrives':
        return <PlacementDriveManagement/>;
      case 'students':
        return <HRStudentsManagement/>;
      case 'interviews':
        return <HRInterviewManagement/>;
      case 'reports':
        return <HRDailyReport/>;
      case 'tasks':
        return <PlaceholderContent title="Task Management" />;
      case 'meetings':
        return <PlaceholderContent title="Meeting Management" />;
      case 'notifications':
        return <PlaceholderContent title="Notification Center" />;
      case 'settings':
        return <PlaceholderContent title="Settings" />;
      default:
        return <PlaceholderContent title="Dashboard" />;
    }
  };

  return (
    <div className={`${styles.app} ${darkMode ? styles.darkMode : ''} ${sidebarCollapsed ? styles.appCollapsed : ''}`}>
      
      {/* Notification Panel */}
      {showNotifications && (
        <>
          <div className={styles.slidePanel}>
            <div className={styles.panelHeader}>
              <h3><FaBell /> Notifications</h3>
              <button onClick={() => setShowNotifications(false)}><FaTimes /></button>
            </div>
            <div className={styles.panelContent}>
              <div className={styles.emptyState}>No new notifications</div>
            </div>
          </div>
          <div className={styles.panelOverlay} onClick={() => setShowNotifications(false)} />
        </>
      )}

      {/* Messages Panel */}
      {showMessages && (
        <>
          <div className={styles.slidePanel}>
            <div className={styles.panelHeader}>
              <h3><FaEnvelope /> Messages</h3>
              <button onClick={() => setShowMessages(false)}><FaTimes /></button>
            </div>
            <div className={styles.panelContent}>
              <div className={styles.emptyState}>No messages</div>
            </div>
          </div>
          <div className={styles.panelOverlay} onClick={() => setShowMessages(false)} />
        </>
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''} ${mobileMenuOpen ? styles.sidebarMobile : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>🏢</div>
            {!sidebarCollapsed && <span className={styles.logoText}>IDA ERP CRM</span>}
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
              className={`${styles.navItem} ${activeMenu === item.id ? styles.active : ''}`}
              onClick={() => setActiveMenu(item.id)}
            >
              <item.icon className={styles.navIcon} />
              {!sidebarCollapsed && <span className={styles.navLabel}>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{getInitial(displayName)}</div>
            {!sidebarCollapsed && (
              <div className={styles.userDetails}>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.userRole}>{displayRole}</span>
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
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.menuToggle} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <FaBars />
            </button>
            <div className={styles.searchBar}>
              <FaSearch />
              <input
                type="text"
                placeholder="Search companies, drives, students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.iconBtn} onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            <button className={styles.iconBtn} onClick={() => setShowMessages(true)}>
              <FaEnvelope />
            </button>
            <button className={styles.iconBtn} onClick={() => setShowNotifications(true)}>
              <FaBell />
              <span className={styles.badge}>3</span>
            </button>
            <button className={styles.quickActionBtn}>
              <FaPlus /> Quick Action
            </button>
            <div className={styles.userProfile}>
              <div className={styles.avatarSmall}>{getInitial(displayName)}</div>
              <div className={styles.userInfoText}>
                <span className={styles.userNameText}>{displayName}</span>
                <span className={styles.userRoleText}>{displayRole}</span>
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

export default HRDashboard;
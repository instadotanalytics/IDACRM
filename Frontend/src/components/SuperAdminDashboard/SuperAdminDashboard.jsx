import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FaSignOutAlt, FaUserCircle, FaTachometerAlt, 
  FaUsers, FaChartLine, FaBuilding, FaMoneyBillWave,
  FaGraduationCap, FaBriefcase, FaFileAlt, FaCog 
} from 'react-icons/fa';
import styles from './SuperAdminDashboard.module.css';
import { authAPI } from '../../services/api';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalLeads: 0,
    totalCompanies: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await authAPI.getStats();
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/super-admin-login');
  };

  const statsCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: FaUsers, color: 'iconBlue' },
    { title: 'Total Leads', value: stats.totalLeads, icon: FaChartLine, color: 'iconGreen' },
    { title: 'Companies', value: stats.totalCompanies, icon: FaBuilding, color: 'iconPurple' },
    { title: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: FaMoneyBillWave, color: 'iconOrange' }
  ];

  const actions = [
    { title: 'Student Management', icon: FaGraduationCap, action: () => alert('Student Management') },
    { title: 'Lead Management', icon: FaChartLine, action: () => alert('Lead Management') },
    { title: 'Placement Drives', icon: FaBriefcase, action: () => alert('Placement Drives') },
    { title: 'Reports', icon: FaFileAlt, action: () => alert('Reports') },
    { title: 'Settings', icon: FaCog, action: () => alert('Settings') }
  ];

  return (
    <div className={styles.dashboard}>
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <div className={styles.navLogo}>
            <FaTachometerAlt />
            <span>Super Admin Dashboard</span>
          </div>
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className={styles.userName}>{user?.name}</span>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className={styles.content}>
        <div className={styles.welcomeBanner}>
          <h2>Welcome back, {user?.name}! 👋</h2>
          <p>Here's what's happening with your CRM today.</p>
        </div>

        <div className={styles.statsGrid}>
          {statsCards.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles[stat.color]}`}>
                <stat.icon />
              </div>
              <div className={styles.statInfo}>
                <h3>{stat.title}</h3>
                <p className={styles.statNumber}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.quickActions}>
          <h3>Quick Actions</h3>
          <div className={styles.actionGrid}>
            {actions.map((action, index) => (
              <div key={index} className={styles.actionCard} onClick={action.action}>
                <action.icon />
                <p>{action.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FaShieldAlt, FaThLarge, FaUsers, FaChartBar, FaFileAlt,
  FaBuilding, FaBriefcase, FaMoneyBillWave, FaTasks,
  FaCalendarCheck, FaFileContract, FaCog, FaSignOutAlt,
  FaBell, FaSearch, FaGraduationCap, FaStar,
  FaChevronLeft, FaChevronRight,
  FaUserPlus, FaClipboardList,
  FaEnvelope, FaClipboard, FaChartLine,
  FaHeadset, FaChalkboardTeacher, FaEye,
  FaUserTie,
  FaBars, FaTimes, FaTrash,
  FaCheckCircle,
  FaSpinner,
  FaArrowUp, FaArrowDown, FaDownload, FaCalendarAlt,
  FaEdit, FaSearch as FaSearchIcon,
} from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';
import styles from './SuperAdminDashboard.module.css';
import { superAdminAPI } from '../../services/api';
import TrainerManagement from "../../pages/dashboard/AdminDashboard/TrannerManagement/TrainerManagement";
import Admission from '../../pages/dashboard/CounselorDashboard/Admission/Admission';
import CounselorManagement from './CounselorManagement';

/* ============================================================ */
/* MENU ITEMS
/* ============================================================ */
const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: FaThLarge },
  { id: 'students', label: 'Students', icon: FaUsers },
  { id: 'counselor', label: 'Counselor', icon: FaHeadset },
  { id: 'leads', label: 'Leads', icon: FaChartBar },
  { id: 'placement', label: 'Placement', icon: FaGraduationCap },
  { id: 'hr', label: 'HR & Placement Drive', icon: FaUserTie },
  { id: 'sales', label: 'Sales', icon: FaChartLine },
  { id: 'revenue', label: 'Revenue', icon: FaMoneyBillWave },
  { id: 'reports', label: 'Reports & Analytics', icon: FaFileContract },
  { id: 'tasks', label: 'Tasks & Admin', icon: FaTasks },
  { id: 'employees', label: 'Employee Monitoring', icon: FaEye },
  { id: 'trainers', label: 'Trainer & Batch', icon: FaChalkboardTeacher },
  { id: 'audit', label: 'Audit Logs', icon: FaClipboard },
  { id: 'notifications', label: 'Notifications', icon: FaBell },
  { id: 'settings', label: 'Settings', icon: FaCog },
];

// Placeholder component
const PlaceholderContent = ({ title }) => (
  <div className={styles.placeholderBox}>
    <div className={styles.placeholderIcon}>🚧</div>
    <h3>{title}</h3>
    <p>This module is under development</p>
    <p className={styles.placeholderHint}>Coming soon...</p>
  </div>
);

// Dashboard Component
const DashboardContent = () => {
  const [stats, setStats] = useState({
    totalStudents: 1248,
    totalRevenue: '₹62.4L',
    placementRate: '74.2%',
    activeLeads: 482,
    totalCompanies: 156,
    avgRating: '4.8'
  });

  return (
    <div className={styles.dashboardContent}>
      <div className={styles.welcomeSection}>
        <div>
          <h1 className={styles.welcomeTitle}>Welcome back, Admin!</h1>
          <p className={styles.welcomeSubtitle}>Here's what's happening with your institute today.</p>
        </div>
        <div className={styles.dateRange}>
          <FaCalendarAlt />
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {[
          { label: 'Total Students', value: stats.totalStudents, icon: FaUsers, color: '#3b82f6' },
          { label: 'Total Revenue', value: stats.totalRevenue, icon: FaMoneyBillWave, color: '#10b981' },
          { label: 'Placement Rate', value: stats.placementRate, icon: FaGraduationCap, color: '#8b5cf6' },
          { label: 'Active Leads', value: stats.activeLeads, icon: FaChartBar, color: '#f59e0b' },
          { label: 'Companies', value: stats.totalCompanies, icon: FaBuilding, color: '#06b6d4' },
          { label: 'Avg Rating', value: stats.avgRating, icon: FaStar, color: '#ec4899' },
        ].map((stat, idx) => (
          <div key={idx} className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <h3>Recent Activities</h3>
          <div className={styles.activityList}>
            {[
              { text: 'New student Rahul Sharma enrolled in Full Stack course', time: '2 hours ago', icon: '👨‍🎓' },
              { text: 'Placement drive scheduled with TCS', time: '5 hours ago', icon: '🏢' },
              { text: 'Revenue target achieved for this month', time: '1 day ago', icon: '💰' },
              { text: 'New trainer joined the team', time: '2 days ago', icon: '👨‍🏫' },
            ].map((activity, idx) => (
              <div key={idx} className={styles.activityItem}>
                <div className={styles.activityIcon}>{activity.icon}</div>
                <div className={styles.activityContent}>
                  <p>{activity.text}</p>
                  <span>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.chartCard}>
          <h3>Quick Actions</h3>
          <div className={styles.quickActions}>
            <button className={styles.quickActionBtn}><FaUserPlus /> Add Student</button>
            <button className={styles.quickActionBtn}><FaBuilding /> Add Company</button>
            <button className={styles.quickActionBtn}><FaChartLine /> View Reports</button>
            <button className={styles.quickActionBtn}><FaCalendarCheck /> Schedule Drive</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  // Panel States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState({});

  // User Management States
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales_executive',
    department: 'sales',
    phone: '',
    isActive: true
  });

  // INITIAL LOAD
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/super-admin-login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'super_admin') {
        navigate('/super-admin-login');
        return;
      }
      setUser(parsedUser);
      setIsLoading(false);
      fetchUsers();
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/super-admin-login');
    }
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await superAdminAPI.getUsers();
      if (response.data.success) {
        setUsers(response.data.data.users);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to fetch users');
      }
    } finally {
      setUsersLoading(false);
    }
  };

  // Create/Update/Delete User Functions
  const openCreateUserModal = () => {
    setEditingUser(null);
    setUserFormData({
      name: '',
      email: '',
      password: '',
      role: 'sales_executive',
      department: 'sales',
      phone: '',
      isActive: true
    });
    setShowUserModal(true);
  };

  const openEditUserModal = (user) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department || 'sales',
      phone: user.phone || '',
      isActive: user.isActive
    });
    setShowUserModal(true);
  };

  const handleUserFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setUsersLoading(true);
    try {
      let response;
      if (editingUser) {
        const updateData = {
          name: userFormData.name,
          email: userFormData.email,
          role: userFormData.role,
          department: userFormData.department,
          phone: userFormData.phone,
          isActive: userFormData.isActive
        };
        if (userFormData.password) updateData.password = userFormData.password;
        response = await superAdminAPI.updateUser(editingUser._id, updateData);
        toast.success('User updated successfully');
      } else {
        response = await superAdminAPI.createUser(userFormData);
        toast.success('User created successfully');
      }
      if (response.data.success) {
        setShowUserModal(false);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        const response = await superAdminAPI.deleteUser(userId);
        if (response.data.success) {
          toast.success('User deleted successfully');
          fetchUsers();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                          user.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    return matchesSearch && matchesRole && user.role !== 'super_admin';
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/super-admin-login');
  };

  // ✅ FIXED: Complete renderContent with all cases
  const renderContent = () => {
    switch(activeMenu) {
      case 'dashboard':
        return <DashboardContent />;
      
      case 'students':
        return <Admission/>;
      
      case 'counselor':
        return <CounselorManagement/>;
      
      case 'leads':
        return <PlaceholderContent title="Lead Management" />;
      
      case 'placement':
        return <PlaceholderContent title="Placement Management" />;
      
      case 'hr':
        return <PlaceholderContent title="HR & Placement Drive" />;
      
      case 'sales':
        return <PlaceholderContent title="Sales Dashboard" />;
      
      case 'revenue':
        return <PlaceholderContent title="Revenue Management" />;
      
      case 'reports':
        return <PlaceholderContent title="Reports & Analytics" />;
      
      case 'tasks':
        return <PlaceholderContent title="Tasks & Admin" />;
      
      case 'employees':
        return (
          <div className={styles.userManagement}>
            <div className={styles.userHeader}>
              <div>
                <h2 className={styles.sectionTitle}><FaUsers /> Employee Monitoring</h2>
                <p className={styles.sectionSubtitle}>Manage all system users</p>
              </div>
              <button className={styles.createUserBtn} onClick={openCreateUserModal}>
                <FaUserPlus /> Create New User
              </button>
            </div>

            <div className={styles.userFilters}>
              <div className={styles.searchBox}>
                <FaSearchIcon />
                <input 
                  type="text" 
                  placeholder="Search by name or email..." 
                  value={userSearch} 
                  onChange={(e) => setUserSearch(e.target.value)} 
                />
              </div>
              <select 
                className={styles.filterSelect} 
                value={userRoleFilter} 
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin_manager">Admin Manager</option>
                <option value="sales_executive">Sales Executive</option>
                <option value="hr_executive">HR Executive</option>
                <option value="trainer">Trainer</option>
                <option value="counselor">Counselor</option>
              </select>
            </div>

            <div className={styles.userTable}>
              <table className={styles.userTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                      <FaSpinner className={styles.spinner} /> Loading users...
                    </td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No users found</td></tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user._id}>
                        <td><strong>{user.name}</strong></td>
                        <td>{user.email}</td>
                        <td>
                          <span className={styles.roleBadge}>
                            {user.role === 'admin_manager' ? 'Admin Manager' :
                             user.role === 'sales_executive' ? 'Sales Executive' :
                             user.role === 'hr_executive' ? 'HR Executive' :
                             user.role === 'trainer' ? 'Trainer' :
                             user.role === 'counselor' ? 'Counselor' : user.role}
                          </span>
                        </td>
                        <td>{user.department || '-'}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${user.isActive ? styles.statusActive : styles.statusInactive}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className={styles.userActions}>
                          <button onClick={() => openEditUserModal(user)}><FaEdit /></button>
                          <button onClick={() => handleDeleteUser(user._id, user.name)}><FaTrash /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'trainers':
        return <TrainerManagement/>;
      
      case 'audit':
        return <PlaceholderContent title="Audit Logs" />;
      
      case 'notifications':
        return <PlaceholderContent title="Notifications" />;
      
      case 'settings':
        return <PlaceholderContent title="Settings" />;
      
      default:
        return <DashboardContent />;
    }
  };

  // Notification Functions
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showMessages) setShowMessages(false);
  };

  const toggleMessages = () => {
    setShowMessages(!showMessages);
    if (showNotifications) setShowNotifications(false);
    if (!showMessages) setSelectedChat(null);
  };

  const closePanels = () => {
    setShowNotifications(false);
    setShowMessages(false);
    setSelectedChat(null);
  };

  const openChat = (message) => {
    setSelectedChat(message);
  };

  const sendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const newChat = {
        id: Date.now(),
        text: newMessage,
        sender: 'admin',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory(prev => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), newChat]
      }));
      toast.success(`Message sent to ${selectedChat.name}`);
      setNewMessage('');
    }
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const unreadMessageCount = messages.filter(m => m.unread).length;

  // Show loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`${styles.app} ${sidebarCollapsed ? styles.appCollapsed : ''}`}>
      
      {/* Overlay for panels */}
      {(showNotifications || showMessages) && (
        <div className={styles.panelOverlay} onClick={closePanels}></div>
      )}

      {/* NOTIFICATION PANEL */}
      <div className={`${styles.slidePanel} ${showNotifications ? styles.slidePanelOpen : ''}`}>
        <div className={styles.panelHeader}>
          <h3><FaBell /> Notifications</h3>
          <button className={styles.panelClose} onClick={toggleNotifications}><FaTimes /></button>
        </div>
        <div className={styles.panelContent}>
          <div className={styles.emptyState}><FaBell size={40} /><p>No notifications</p></div>
        </div>
      </div>

      {/* MESSAGE PANEL */}
      <div className={`${styles.slidePanel} ${showMessages ? styles.slidePanelOpen : ''}`}>
        <div className={styles.panelHeader}>
          <h3><FaEnvelope /> Messages</h3>
          <button className={styles.panelClose} onClick={toggleMessages}><FaTimes /></button>
        </div>
        <div className={styles.panelContent}>
          <div className={styles.emptyState}><FaEnvelope size={40} /><p>No messages</p></div>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''} ${mobileMenuOpen ? styles.sidebarMobile : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}><FaShieldAlt /></div>
            {!sidebarCollapsed && <span className={styles.logoText}>IDA ERP CRM</span>}
          </div>
          {!sidebarCollapsed && <button className={styles.collapseBtn} onClick={() => setSidebarCollapsed(true)}><FaChevronLeft /></button>}
          {sidebarCollapsed && <button className={styles.expandBtn} onClick={() => setSidebarCollapsed(false)}><FaChevronRight /></button>}
        </div>
        <nav className={styles.nav}>
          {MENU_ITEMS.map((item, index) => (
            <div key={item.id} className={styles.navItemWrapper}>
              <button
                className={`${styles.navItem} ${activeMenu === item.id ? styles.active : ''}`}
                onClick={() => setActiveMenu(item.id)}
                onMouseEnter={() => { if (sidebarCollapsed) setHoveredItem(index); }}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <item.icon className={styles.navIcon} />
                {!sidebarCollapsed && <span className={styles.navLabel}>{item.label}</span>}
                {sidebarCollapsed && hoveredItem === index && <div className={styles.navTooltip}>{item.label}</div>}
              </button>
            </div>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}><FaSignOutAlt /> {!sidebarCollapsed && 'Logout'}</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.menuToggle} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><FaBars /></button>
            <div className={styles.searchBar}>
              <FaSearch className={styles.searchIcon} />
              <input type="text" placeholder="Search anything..." className={styles.searchInput} />
              <kbd className={styles.searchKbd}>⌘K</kbd>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.iconBtn} onClick={toggleMessages}><FaEnvelope /></button>
            <button className={styles.iconBtn} onClick={toggleNotifications}><FaBell /></button>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>{user?.name?.charAt(0) || 'A'}</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.name || 'Admin'}</span>
                <span className={styles.userRole}>Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {renderContent()}
        </div>
      </main>

      {/* User Modal */}
      {showUserModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUserModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingUser ? 'Edit User' : 'Create New User'}</h3>
              <button className={styles.modalClose} onClick={() => setShowUserModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}><label>Full Name *</label><input type="text" name="name" value={userFormData.name} onChange={handleUserFormChange} required /></div>
                <div className={styles.formGroup}><label>Email *</label><input type="email" name="email" value={userFormData.email} onChange={handleUserFormChange} required /></div>
                <div className={styles.formGroup}><label>{editingUser ? 'New Password' : 'Password *'}</label><input type="password" name="password" value={userFormData.password} onChange={handleUserFormChange} required={!editingUser} /></div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}><label>Role *</label><select name="role" value={userFormData.role} onChange={handleUserFormChange}>
                    <option value="admin_manager">Admin Manager</option>
                    <option value="sales_executive">Sales Executive</option>
                    <option value="hr_executive">HR Executive</option>
                    <option value="trainer">Trainer</option>
                    <option value="counselor">Counselor</option>
                  </select></div>
                  <div className={styles.formGroup}><label>Department</label><select name="department" value={userFormData.department} onChange={handleUserFormChange}>
                    <option value="management">Management</option>
                    <option value="sales">Sales</option>
                    <option value="hr">HR</option>
                    <option value="training">Training</option>
                    <option value="counseling">Counseling</option>
                  </select></div>
                </div>
                <div className={styles.formGroup}><label>Phone</label><input type="tel" name="phone" value={userFormData.phone} onChange={handleUserFormChange} /></div>
                <div className={styles.formGroupCheckbox}><label><input type="checkbox" name="isActive" checked={userFormData.isActive} onChange={handleUserFormChange} /> Account Active</label></div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button type="submit" disabled={usersLoading}>{usersLoading ? 'Saving...' : (editingUser ? 'Update' : 'Create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FaShieldAlt, FaThLarge, FaUsers, FaChartBar, FaFileAlt,
  FaBuilding, FaBriefcase, FaMoneyBillWave, FaTasks,
  FaCalendarCheck, FaFileContract, FaCog, FaSignOutAlt,
  FaUserCircle, FaBell, FaSearch, FaGraduationCap,
  FaClock, FaSchool, FaCheck, FaChevronLeft, FaChevronRight,
  FaChevronDown, FaPlus, FaUserPlus, FaRocket, FaClipboardList,
  FaDatabase, FaServer, FaHdd, FaUserFriends,
  FaEnvelope, FaClipboard, FaChartLine, FaFunnelDollar,
  FaStar, FaHeadset, FaChalkboardTeacher, FaEye,
  FaSlidersH, FaChartPie, FaUserTie, FaBullseye,
  FaBars, FaTimes, FaPaperPlane, FaReply, FaTrash,
  FaCheckCircle, FaExclamationTriangle, FaInfoCircle,
  FaSpinner, FaFileInvoice, FaHandshake, FaArrowUp,
  FaArrowDown, FaFilter, FaDownload, FaCalendarAlt,
  FaCircle, FaRegCircle, FaImage, FaVideo, FaFile,
  FaEdit, FaSearch as FaSearchIcon, FaToggleOn, FaToggleOff,
  FaPhone, FaEnvelope as FaEmailIcon, FaUserTag
} from 'react-icons/fa';
import { 
  FiUsers, FiTrendingUp, FiDollarSign,
  FiActivity, FiBookOpen, FiBarChart2, FiSend
} from 'react-icons/fi';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import styles from './SuperAdminDashboard.module.css';
import { superAdminAPI } from '../../services/api';

/* ============================================================ */
/* NAVIGATION CONFIGURATION
/* ============================================================ */
const NAV = [
  { label: 'Dashboard', icon: FaThLarge, path: '/super-admin-dashboard' },
  { label: 'Students', icon: FaUsers, path: '/students' },
  { label: 'Counselor & Admissions', icon: FaHeadset, path: '/admissions' },
  { label: 'Leads', icon: FaChartBar, path: '/leads' },
  { label: 'Placement', icon: FaGraduationCap, path: '/placements' },
  { label: 'HR & Placement Drive', icon: FaUserTie, path: '/hr-management' },
  { label: 'Sales', icon: FaChartLine, path: '/sales-dashboard' },
  { label: 'Revenue', icon: FaMoneyBillWave, path: '/revenue' },
  { label: 'Reports & Analytics', icon: FaFileContract, path: '/reports' },
  { label: 'Tasks & Admin', icon: FaTasks, path: '/tasks' },
  { label: 'Employee Monitoring', icon: FaEye, path: '/employees' },
  { label: 'Trainer & Batch', icon: FaChalkboardTeacher, path: '/trainers' },
  { label: 'Audit Logs', icon: FaClipboard, path: '/audit-logs' },
  { label: 'Notifications', icon: FaBell, path: '/notifications' },
  { label: 'Settings', icon: FaCog, path: '/settings' },
];

/* ============================================================ */
// CHART DATA
/* ============================================================ */
const revenueData = [
  { name: 'Jan', revenue: 4200, bookings: 3800 },
  { name: 'Feb', revenue: 3800, bookings: 3400 },
  { name: 'Mar', revenue: 5100, bookings: 4600 },
  { name: 'Apr', revenue: 4600, bookings: 4200 },
  { name: 'May', revenue: 5400, bookings: 4900 },
  { name: 'Jun', revenue: 5800, bookings: 5300 },
  { name: 'Jul', revenue: 6200, bookings: 5600 },
];

const placementData = [
  { name: 'Placed', value: 72, color: '#10b981' },
  { name: 'Training', value: 18, color: '#f59e0b' },
  { name: 'Not Placed', value: 10, color: '#ef4444' },
];

const leadFunnel = [
  { stage: 'New Leads', count: 3482, percentage: 100 },
  { stage: 'Contacted', count: 2450, percentage: 70 },
  { stage: 'Interested', count: 1650, percentage: 47 },
  { stage: 'Demo', count: 820, percentage: 24 },
  { stage: 'Converted', count: 420, percentage: 12 },
];

/* ============================================================ */
// QUICK ACCESS MODULES
/* ============================================================ */
const QUICK_MODULES = [
  { name: 'Students', icon: FiUsers, color: '#3b82f6', path: '/students', bg: 'rgba(59,130,246,0.1)' },
  { name: 'Leads', icon: FaChartBar, color: '#f59e0b', path: '/leads', bg: 'rgba(245,158,11,0.1)' },
  { name: 'Placements', icon: FaGraduationCap, color: '#10b981', path: '/placements', bg: 'rgba(16,185,129,0.1)' },
  { name: 'Revenue', icon: FiDollarSign, color: '#8b5cf6', path: '/revenue', bg: 'rgba(139,92,246,0.1)' },
  { name: 'Companies', icon: FaBuilding, color: '#06b6d4', path: '/companies', bg: 'rgba(6,182,212,0.1)' },
  { name: 'Tasks', icon: FaTasks, color: '#ec4899', path: '/tasks', bg: 'rgba(236,72,153,0.1)' },
  { name: 'HR', icon: FaUserTie, color: '#f43f5e', path: '/hr-management', bg: 'rgba(244,63,94,0.1)' },
  { name: 'Reports', icon: FaFileContract, color: '#6366f1', path: '/reports', bg: 'rgba(99,102,241,0.1)' },
];

/* ============================================================ */
// STATS CARDS DATA
/* ============================================================ */
const STATS = [
  { title: 'Total Students', value: '1,284', change: '+12%', trend: 'up', color: '#3b82f6', icon: FiUsers },
  { title: 'Total Revenue', value: '₹62.4L', change: '+18%', trend: 'up', color: '#10b981', icon: FiDollarSign },
  { title: 'Placement Rate', value: '74.2%', change: '+5%', trend: 'up', color: '#8b5cf6', icon: FiTrendingUp },
  { title: 'Active Leads', value: '482', change: '-3%', trend: 'down', color: '#f59e0b', icon: FaChartBar },
  { title: 'Companies', value: '156', change: '+8%', trend: 'up', color: '#06b6d4', icon: FaBuilding },
  { title: 'Avg. Satisfaction', value: '4.8/5', change: '+0.3', trend: 'up', color: '#ec4899', icon: FaStar },
];

/* ============================================================ */
// RECENT ACTIVITIES
/* ============================================================ */
const RECENT_ACTIVITIES = [
  { id: 1, user: 'Rahul Sharma', action: 'New Admission', target: 'Full Stack Development', time: '5 min ago', icon: FaUserPlus, color: '#3b82f6' },
  { id: 2, user: 'Priya Patel', action: 'Lead Converted', target: 'Data Science Course', time: '15 min ago', icon: FaCheckCircle, color: '#10b981' },
  { id: 3, user: 'Ankit Verma', action: 'Payment Received', target: '₹45,000', time: '1 hour ago', icon: FaMoneyBillWave, color: '#f59e0b' },
  { id: 4, user: 'Microsoft HR', action: 'Drive Scheduled', target: 'Tech Recruitment Drive', time: '2 hours ago', icon: FaBriefcase, color: '#8b5cf6' },
  { id: 5, user: 'Neha Gupta', action: 'New Company', target: 'Amazon Added', time: '3 hours ago', icon: FaBuilding, color: '#06b6d4' },
];

/* ============================================================ */
// NOTIFICATIONS DATA
/* ============================================================ */
const NOTIFICATIONS_DATA = [
  { id: 1, title: 'New Student Registration', message: 'Rahul Sharma has registered for Full Stack course', time: '5 min ago', read: false, type: 'student', icon: FaUserPlus, color: '#3b82f6' },
  { id: 2, title: 'Payment Received', message: '₹45,000 received from Priya Patel', time: '1 hour ago', read: false, type: 'payment', icon: FaMoneyBillWave, color: '#10b981' },
  { id: 3, title: 'Placement Drive', message: 'TCS placement drive scheduled for tomorrow', time: '2 hours ago', read: true, type: 'drive', icon: FaBriefcase, color: '#f59e0b' },
  { id: 4, title: 'New Company Added', message: 'Microsoft has been added as hiring partner', time: '5 hours ago', read: true, type: 'company', icon: FaBuilding, color: '#8b5cf6' },
  { id: 5, title: 'Task Assigned', message: 'Review monthly report assigned to you', time: '1 day ago', read: true, type: 'task', icon: FaTasks, color: '#ec4899' },
];

/* ============================================================ */
// MESSAGES DATA
/* ============================================================ */
const MESSAGES_DATA = [
  { id: 1, name: 'Rahul Sharma', role: 'Student', avatar: 'R', message: 'Sir, when will the next batch start?', time: '10:30 AM', unread: true, online: true },
  { id: 2, name: 'Priya Patel', role: 'Sales Executive', avatar: 'P', message: 'Client meeting scheduled for tomorrow', time: '9:15 AM', unread: false, online: true },
  { id: 3, name: 'Amit Kumar', role: 'Trainer', avatar: 'A', message: 'Course materials uploaded for React batch', time: 'Yesterday', unread: false, online: false },
  { id: 4, name: 'Neha Gupta', role: 'HR Executive', avatar: 'N', message: 'New placement drive details shared', time: 'Yesterday', unread: true, online: true },
  { id: 5, name: 'Microsoft HR', role: 'Company', avatar: 'M', message: 'Interview schedule for selected candidates', time: '2 days ago', unread: false, online: false },
];

/* ============================================================ */
// UPCOMING EVENTS
/* ============================================================ */
const UPCOMING_EVENTS = [
  { id: 1, title: 'TCS Placement Drive', date: 'June 15, 2024', time: '10:00 AM', type: 'drive', color: '#ef4444' },
  { id: 2, title: 'Faculty Meeting', date: 'June 16, 2024', time: '2:00 PM', type: 'meeting', color: '#f59e0b' },
  { id: 3, title: 'New Batch Orientation', date: 'June 18, 2024', time: '11:00 AM', type: 'orientation', color: '#10b981' },
  { id: 4, title: 'Fee Deadline', date: 'June 20, 2024', time: '11:59 PM', type: 'deadline', color: '#ef4444' },
];

/* ============================================================ */
// HELPER FUNCTIONS
/* ============================================================ */
const getDayFromDate = (dateStr) => {
  return dateStr.split(',')[0].split(' ')[1];
};

const getMonthFromDate = (dateStr) => {
  return dateStr.split(',')[0].split(' ')[0];
};

/* ============================================================ */
// MAIN COMPONENT
/* ============================================================ */
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // Panel States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);
  const [messages, setMessages] = useState(MESSAGES_DATA);
  const [chatHistory, setChatHistory] = useState({});

  // User Management States
  const [activeTab, setActiveTab] = useState('dashboard');
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

  // INITIAL LOAD - Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('=== SUPER ADMIN DASHBOARD ===');
    console.log('Token exists:', !!token);
    console.log('UserData exists:', !!userData);
    
    // If no token, redirect to login
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/super-admin-login');
      return;
    }
    
    // If no user data, redirect to login
    if (!userData) {
      console.log('No user data found, redirecting to login');
      navigate('/super-admin-login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      console.log('User role:', parsedUser.role);
      
      // Check if user is super admin
      if (parsedUser.role !== 'super_admin') {
        console.log('Not super admin, redirecting to login');
        navigate('/super-admin-login');
        return;
      }
      
      setUser(parsedUser);
      setIsLoading(false);
      
      // Only fetch users after authentication is confirmed
      fetchUsers();
      
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/super-admin-login');
    }
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token, skipping fetchUsers');
      return;
    }
    
    setUsersLoading(true);
    try {
      const response = await superAdminAPI.getUsers();
      if (response.data.success) {
        setUsers(response.data.data.users);
      }
    } catch (error) {
      console.error('Fetch users error:', error.response?.status);
      // Don't show toast for 401 - let interceptor handle it
      if (error.response?.status !== 401) {
        toast.error('Failed to fetch users');
      }
    } finally {
      setUsersLoading(false);
    }
  };

  // Open create user modal
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

  // Open edit user modal
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

  // Handle user form change
  const handleUserFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Create or update user
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

  // Delete user
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

  // Filtered users
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

  // Notification Functions
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showMessages) setShowMessages(false);
    if (!showNotifications) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  const toggleMessages = () => {
    setShowMessages(!showMessages);
    if (showNotifications) setShowNotifications(false);
    if (!showMessages) {
      setSelectedChat(null);
    }
  };

  const closePanels = () => {
    setShowNotifications(false);
    setShowMessages(false);
    setSelectedChat(null);
  };

  const openChat = (message) => {
    setSelectedChat(message);
    setMessages(messages.map(m => 
      m.id === message.id ? { ...m, unread: false } : m
    ));
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

  const StatCard = ({ title, value, change, trend, color, icon: Icon }) => (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <span className={styles.statTitle}>{title}</span>
        <div className={styles.statIcon} style={{ backgroundColor: `${color}10`, color: color }}>
          <Icon size={20} />
        </div>
      </div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statChange}>
        {trend === 'up' ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
        <span style={{ color: trend === 'up' ? '#10b981' : '#ef4444' }}>{change}</span>
        <span className={styles.statPeriod}> vs last month</span>
      </div>
    </div>
  );

  const ActivityItem = ({ user, action, target, time, icon: Icon, color }) => (
    <div className={styles.activityItem}>
      <div className={styles.activityIcon} style={{ backgroundColor: `${color}10`, color: color }}>
        <Icon size={14} />
      </div>
      <div className={styles.activityContent}>
        <span className={styles.activityUser}>{user}</span>
        <span className={styles.activityAction}>{action}</span>
        <span className={styles.activityTarget}>{target}</span>
        <div className={styles.activityTime}>{time}</div>
      </div>
    </div>
  );

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'admin_manager': return styles.roleAdminManager;
      case 'sales_executive': return styles.roleSales;
      case 'hr_executive': return styles.roleHR;
      case 'trainer': return styles.roleTrainer;
      case 'counselor': return styles.roleCounselor;
      default: return styles.roleDefault;
    }
  };

  const getRoleDisplayName = (role) => {
    switch(role) {
      case 'admin_manager': return 'Admin Manager';
      case 'sales_executive': return 'Sales Executive';
      case 'hr_executive': return 'HR Executive';
      case 'trainer': return 'Trainer';
      case 'counselor': return 'Counselor';
      default: return role;
    }
  };

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

      {/* ============================================================ */}
      {/* NOTIFICATION PANEL */}
      {/* ============================================================ */}
      <div className={`${styles.slidePanel} ${showNotifications ? styles.slidePanelOpen : ''}`}>
        <div className={styles.panelHeader}>
          <h3><FaBell /> Notifications {unreadCount > 0 && <span className={styles.panelBadge}>{unreadCount}</span>}</h3>
          <button className={styles.panelClose} onClick={toggleNotifications}><FaTimes /></button>
        </div>
        <div className={styles.panelContent}>
          {notifications.length === 0 ? (
            <div className={styles.emptyState}><FaBell size={40} /><p>No notifications</p></div>
          ) : (
            notifications.map(notif => (
              <div key={notif.id} className={`${styles.notifCard} ${!notif.read ? styles.unread : ''}`}>
                <div className={styles.notifCardIcon} style={{ backgroundColor: `${notif.color}15`, color: notif.color }}>
                  <notif.icon size={18} />
                </div>
                <div className={styles.notifCardContent}>
                  <div className={styles.notifCardTitle}>{notif.title}</div>
                  <div className={styles.notifCardMessage}>{notif.message}</div>
                  <div className={styles.notifCardTime}>{notif.time}</div>
                </div>
                <div className={styles.notifCardActions}>
                  {!notif.read && <button onClick={() => markNotificationAsRead(notif.id)}><FaCheckCircle size={14} /></button>}
                  <button onClick={() => deleteNotification(notif.id)}><FaTrash size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MESSAGE PANEL */}
      {/* ============================================================ */}
      <div className={`${styles.slidePanel} ${showMessages ? styles.slidePanelOpen : ''}`}>
        <div className={styles.panelHeader}>
          <h3><FaEnvelope /> Messages {unreadMessageCount > 0 && <span className={styles.panelBadge}>{unreadMessageCount}</span>}</h3>
          <button className={styles.panelClose} onClick={toggleMessages}><FaTimes /></button>
        </div>
        {!selectedChat ? (
          <div className={styles.panelContent}>
            {messages.map(msg => (
              <div key={msg.id} className={`${styles.chatUserCard} ${msg.unread ? styles.unreadChat : ''}`} onClick={() => openChat(msg)}>
                <div className={styles.chatUserAvatar}>{msg.avatar}{msg.online && <span className={styles.onlineDot}></span>}</div>
                <div className={styles.chatUserInfo}>
                  <div className={styles.chatUserName}>{msg.name}</div>
                  <div className={styles.chatUserRole}>{msg.role}</div>
                  <div className={styles.chatUserLastMsg}>{msg.message}</div>
                </div>
                <div className={styles.chatUserTime}>{msg.time}{msg.unread && <span className={styles.unreadDot}></span>}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.chatView}>
            <div className={styles.chatViewHeader}>
              <button className={styles.backBtn} onClick={() => setSelectedChat(null)}><FaChevronLeft /></button>
              <div className={styles.chatViewUser}>
                <div className={styles.chatViewAvatar}>{selectedChat.avatar}</div>
                <div><div className={styles.chatViewName}>{selectedChat.name}</div><div className={styles.chatViewRole}>{selectedChat.role}</div></div>
              </div>
              <div className={styles.chatViewStatus}>{selectedChat.online && <span className={styles.onlineStatus}>Online</span>}</div>
            </div>
            <div className={styles.chatMessages}>
              {chatHistory[selectedChat.id]?.map(msg => (
                <div key={msg.id} className={msg.sender === 'admin' ? styles.messageSent : styles.messageReceived}>
                  <div className={styles.messageBubble}>{msg.text}</div>
                  <div className={styles.messageTime}>{msg.time}</div>
                </div>
              ))}
              {(!chatHistory[selectedChat.id] || chatHistory[selectedChat.id].length === 0) && (
                <div className={styles.messageReceived}><div className={styles.messageBubble}>Hello! How can I help you today?</div><div className={styles.messageTime}>Just now</div></div>
              )}
            </div>
            <div className={styles.chatInput}>
              <input type="text" placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} />
              <button onClick={sendMessage}><FiSend /></button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* SIDEBAR */}
      {/* ============================================================ */}
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
          {NAV.map((item, index) => (
            <NavLink key={index} to={item.path} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`} onMouseEnter={() => { if (sidebarCollapsed) setHoveredItem(index); }} onMouseLeave={() => setHoveredItem(null)}>
              <item.icon className={styles.navIcon} />
              {!sidebarCollapsed && <span className={styles.navLabel}>{item.label}</span>}
              {sidebarCollapsed && hoveredItem === index && <div className={styles.navTooltip}>{item.label}</div>}
            </NavLink>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}><FaSignOutAlt /> {!sidebarCollapsed && 'Logout'}</button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================================ */}
      <main className={styles.main}>
        
        {/* Header */}
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
            <button className={`${styles.iconBtn} ${activeTab === 'users' ? styles.activeTabBtn : ''}`} onClick={() => setActiveTab(activeTab === 'users' ? 'dashboard' : 'users')} title="User Management">
              <FaUsers />
            </button>
            <button className={styles.iconBtn} onClick={toggleMessages}><FaEnvelope />{unreadMessageCount > 0 && <span className={styles.badge}>{unreadMessageCount}</span>}</button>
            <button className={styles.iconBtn} onClick={toggleNotifications}><FaBell />{unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}</button>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>A</div>
              <div className={styles.userInfo}><span className={styles.userName}>Admin User</span><span className={styles.userRole}>Super Admin</span></div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className={styles.content}>
          
          {activeTab === 'users' ? (
            /* ============================================================ */
            /* USER MANAGEMENT SECTION */
            /* ============================================================ */
            <div className={styles.userManagement}>
              <div className={styles.userHeader}>
                <div>
                  <h2 className={styles.sectionTitle}><FaUsers /> User Management</h2>
                  <p className={styles.sectionSubtitle}>Manage all system users (Admin, Sales, HR, Trainer, Counselor)</p>
                </div>
                <button className={styles.createUserBtn} onClick={openCreateUserModal}><FaUserPlus /> Create New User</button>
              </div>

              {/* Filters */}
              <div className={styles.userFilters}>
                <div className={styles.searchBox}>
                  <FaSearchIcon /><input type="text" placeholder="Search by name or email..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
                </div>
                <select className={styles.filterSelect} value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
                  <option value="all">All Roles</option>
                  <option value="admin_manager">Admin Manager</option>
                  <option value="sales_executive">Sales Executive</option>
                  <option value="hr_executive">HR Executive</option>
                  <option value="trainer">Trainer</option>
                  <option value="counselor">Counselor</option>
                </select>
              </div>

              {/* Users Table */}
              <div className={styles.userTable}>
                <table>
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Loading users...</td></tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No users found</td></tr>
                    ) : (
                      filteredUsers.map(user => (
                        <tr key={user._id}>
                          <td><strong>{user.name}</strong></td>
                          <td>{user.email}</td>
                          <td><span className={`${styles.roleBadge} ${getRoleBadgeClass(user.role)}`}>{getRoleDisplayName(user.role)}</span></td>
                          <td>{user.department || '-'}</td>
                          <td><span className={`${styles.statusBadge} ${user.isActive ? styles.statusActive : styles.statusInactive}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                          <td className={styles.userActions}>
                            <button onClick={() => openEditUserModal(user)} title="Edit"><FaEdit /></button>
                            <button onClick={() => handleDeleteUser(user._id, user.name)} title="Delete"><FaTrash /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Create/Edit User Modal */}
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
                        <div className={styles.formGroup}><label>{editingUser ? 'New Password (leave blank to keep same)' : 'Password *'}</label><input type="password" name="password" value={userFormData.password} onChange={handleUserFormChange} required={!editingUser} /></div>
                        <div className={styles.formRow}>
                          <div className={styles.formGroup}><label>Role *</label><select name="role" value={userFormData.role} onChange={handleUserFormChange}><option value="admin_manager">Admin Manager</option><option value="sales_executive">Sales Executive</option><option value="hr_executive">HR Executive</option><option value="trainer">Trainer</option><option value="counselor">Counselor</option></select></div>
                          <div className={styles.formGroup}><label>Department</label><select name="department" value={userFormData.department} onChange={handleUserFormChange}><option value="management">Management</option><option value="sales">Sales</option><option value="hr">HR</option><option value="training">Training</option><option value="counseling">Counseling</option></select></div>
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
          ) : (
            /* ============================================================ */
            /* DASHBOARD CONTENT */
            /* ============================================================ */
            <>
              {/* Stats Grid */}
              <div className={styles.statsGrid}>
                {STATS.map((stat, idx) => (<StatCard key={idx} {...stat} />))}
              </div>

              {/* Charts Section */}
              <div className={styles.chartsSection}>
                <div className={styles.chartCard}>
                  <div className={styles.chartHeader}>
                    <div><h3 className={styles.chartTitle}>Revenue Overview</h3><p className={styles.chartSubtitle}>Monthly revenue & bookings</p></div>
                    <select className={styles.chartSelect} value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}><option>This Month</option><option>Last Month</option><option>This Quarter</option><option>This Year</option></select>
                  </div>
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueData}>
                        <defs><linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revenueGradient)" strokeWidth={2} />
                        <Area type="monotone" dataKey="bookings" stroke="#8b5cf6" fill="none" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={styles.chartCard}>
                  <div className={styles.chartHeader}><h3 className={styles.chartTitle}>Placement Overview</h3></div>
                  <div className={styles.placementStats}>
                    <div className={styles.placementDonut}>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart><Pie data={placementData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{placementData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie></PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className={styles.placementLegendContainer}>{placementData.map((item, idx) => (<div key={idx} className={styles.placementLegend}><span className={styles.legendDot} style={{ backgroundColor: item.color }} /><span className={styles.legendLabel}>{item.name}</span><span className={styles.legendValue}>{item.value}%</span></div>))}</div>
                  </div>
                </div>
              </div>

              {/* Lead Funnel */}
              <div className={styles.funnelCard}>
                <div className={styles.funnelHeader}><h3 className={styles.funnelTitle}>Lead Conversion Funnel</h3><button className={styles.downloadBtn}><FaDownload /> Download Report</button></div>
                <div className={styles.funnelContainer}>{leadFunnel.map((stage, idx) => (<div key={idx} className={styles.funnelStage}><div className={styles.funnelStageInfo}><span className={styles.funnelStageName}>{stage.stage}</span><span className={styles.funnelStageCount}>{stage.count.toLocaleString()}</span></div><div className={styles.funnelBarWrapper}><div className={styles.funnelBar} style={{ width: `${stage.percentage}%` }} /></div></div>))}</div>
              </div>

              {/* Two Column Layout */}
              <div className={styles.twoColumn}>
                <div className={styles.activityCard}>
                  <div className={styles.cardHeader}><h3 className={styles.cardTitle}>Recent Activities</h3><button className={styles.viewAllBtn}>View All</button></div>
                  <div className={styles.activityList}>{RECENT_ACTIVITIES.map(activity => (<ActivityItem key={activity.id} {...activity} />))}</div>
                </div>
                <div className={styles.rightColumn}>
                  <div className={styles.quickAccessCard}><h3 className={styles.cardTitle}>Quick Access</h3><div className={styles.quickModules}>{QUICK_MODULES.map((module, idx) => (<button key={idx} className={styles.quickModule} onClick={() => navigate(module.path)}><div className={styles.quickModuleIcon} style={{ backgroundColor: module.bg, color: module.color }}><module.icon size={18} /></div><span className={styles.quickModuleName}>{module.name}</span></button>))}</div></div>
                  <div className={styles.eventsCard}><h3 className={styles.cardTitle}>Upcoming Events</h3>{UPCOMING_EVENTS.map(event => (<div key={event.id} className={styles.eventItem}><div className={styles.eventDate}><span className={styles.eventDay}>{getDayFromDate(event.date)}</span><span className={styles.eventMonth}>{getMonthFromDate(event.date)}</span></div><div className={styles.eventInfo}><span className={styles.eventTitle}>{event.title}</span><span className={styles.eventTime}>{event.time}</span></div><div className={styles.eventBadge} style={{ backgroundColor: `${event.color}15`, color: event.color }}>{event.type}</div></div>))}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
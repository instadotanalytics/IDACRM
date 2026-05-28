import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FaShieldAlt, FaThLarge, FaUsers, FaChartBar, FaFileAlt,
  FaBuilding, FaBriefcase, FaMoneyBillWave, FaTasks,
  FaCalendarCheck, FaFileContract, FaCog, FaSignOutAlt,
  FaUserCircle, FaBell, FaSearch, FaGraduationCap,
  FaClock, FaSchool, FaCheck, FaChevronLeft, FaChevronRight,
  FaChevronDown,
  FaPlus, FaUserPlus, FaRocket, FaClipboardList,
  FaDatabase, FaServer, FaHdd, FaUserFriends,
  FaEnvelope, FaClipboard, FaChartLine, FaFunnelDollar,
  FaStar, FaHeadset, FaChalkboardTeacher, FaEye,
  FaSlidersH, FaChartPie, FaUserTie, FaBullseye,
  FaBars, FaTimes, FaPaperPlane, FaReply, FaTrash,
  FaCheckCircle, FaExclamationTriangle, FaInfoCircle,
  FaSpinner, FaFileInvoice, FaHandshake, FaArrowUp,
  FaArrowDown, FaFilter, FaDownload, FaCalendarAlt,
  FaCircle, FaRegCircle, FaImage, FaVideo, FaFile
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
  { id: 6, title: 'System Update', message: 'New version v2.0 available', time: '2 days ago', read: true, type: 'system', icon: FaServer, color: '#6366f1' },
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

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

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
      // Mark all as read when opened
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  // Message Functions
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
    // Mark as read
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

  return (
    <div className={`${styles.app} ${sidebarCollapsed ? styles.appCollapsed : ''}`}>
      
      {/* Overlay for panels */}
      {(showNotifications || showMessages) && (
        <div className={styles.panelOverlay} onClick={closePanels}></div>
      )}

      {/* ============================================================ */}
      {/* NOTIFICATION PANEL - SLIDE FROM RIGHT */}
      {/* ============================================================ */}
      <div className={`${styles.slidePanel} ${showNotifications ? styles.slidePanelOpen : ''}`}>
        <div className={styles.panelHeader}>
          <h3>
            <FaBell /> Notifications
            {unreadCount > 0 && <span className={styles.panelBadge}>{unreadCount}</span>}
          </h3>
          <button className={styles.panelClose} onClick={toggleNotifications}>
            <FaTimes />
          </button>
        </div>
        <div className={styles.panelContent}>
          {notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <FaBell size={40} />
              <p>No notifications</p>
            </div>
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
                  {!notif.read && (
                    <button onClick={() => markNotificationAsRead(notif.id)} title="Mark as read">
                      <FaCheckCircle size={14} />
                    </button>
                  )}
                  <button onClick={() => deleteNotification(notif.id)} title="Delete">
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MESSAGE PANEL - SLIDE FROM RIGHT */}
      {/* ============================================================ */}
      <div className={`${styles.slidePanel} ${showMessages ? styles.slidePanelOpen : ''}`}>
        <div className={styles.panelHeader}>
          <h3>
            <FaEnvelope /> Messages
            {unreadMessageCount > 0 && <span className={styles.panelBadge}>{unreadMessageCount}</span>}
          </h3>
          <button className={styles.panelClose} onClick={toggleMessages}>
            <FaTimes />
          </button>
        </div>
        
        {!selectedChat ? (
          // User List View
          <div className={styles.panelContent}>
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`${styles.chatUserCard} ${msg.unread ? styles.unreadChat : ''}`}
                onClick={() => openChat(msg)}
              >
                <div className={styles.chatUserAvatar}>
                  {msg.avatar}
                  {msg.online && <span className={styles.onlineDot}></span>}
                </div>
                <div className={styles.chatUserInfo}>
                  <div className={styles.chatUserName}>{msg.name}</div>
                  <div className={styles.chatUserRole}>{msg.role}</div>
                  <div className={styles.chatUserLastMsg}>{msg.message}</div>
                </div>
                <div className={styles.chatUserTime}>
                  {msg.time}
                  {msg.unread && <span className={styles.unreadDot}></span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Chat View
          <div className={styles.chatView}>
            <div className={styles.chatViewHeader}>
              <button className={styles.backBtn} onClick={() => setSelectedChat(null)}>
                <FaChevronLeft />
              </button>
              <div className={styles.chatViewUser}>
                <div className={styles.chatViewAvatar}>{selectedChat.avatar}</div>
                <div>
                  <div className={styles.chatViewName}>{selectedChat.name}</div>
                  <div className={styles.chatViewRole}>{selectedChat.role}</div>
                </div>
              </div>
              <div className={styles.chatViewStatus}>
                {selectedChat.online && <span className={styles.onlineStatus}>Online</span>}
              </div>
            </div>
            <div className={styles.chatMessages}>
              {chatHistory[selectedChat.id]?.map(msg => (
                <div key={msg.id} className={msg.sender === 'admin' ? styles.messageSent : styles.messageReceived}>
                  <div className={styles.messageBubble}>{msg.text}</div>
                  <div className={styles.messageTime}>{msg.time}</div>
                </div>
              ))}
              {/* Default welcome message if no history */}
              {(!chatHistory[selectedChat.id] || chatHistory[selectedChat.id].length === 0) && (
                <div className={styles.messageReceived}>
                  <div className={styles.messageBubble}>Hello! How can I help you today?</div>
                  <div className={styles.messageTime}>Just now</div>
                </div>
              )}
            </div>
            <div className={styles.chatInput}>
              <input 
                type="text" 
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage}>
                <FiSend />
              </button>
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
            <div className={styles.logoIcon}>
              <FaShieldAlt />
            </div>
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
          {NAV.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              onMouseEnter={() => { if (sidebarCollapsed) setHoveredItem(index); }}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <item.icon className={styles.navIcon} />
              {!sidebarCollapsed && <span className={styles.navLabel}>{item.label}</span>}
              {sidebarCollapsed && hoveredItem === index && (
                <div className={styles.navTooltip}>{item.label}</div>
              )}
            </NavLink>
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
            <div className={styles.searchBar}>
              <FaSearch className={styles.searchIcon} />
              <input type="text" placeholder="Search anything..." className={styles.searchInput} />
              <kbd className={styles.searchKbd}>⌘K</kbd>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.iconBtn} onClick={toggleMessages}>
              <FaEnvelope />
              {unreadMessageCount > 0 && <span className={styles.badge}>{unreadMessageCount}</span>}
            </button>
            <button className={styles.iconBtn} onClick={toggleNotifications}>
              <FaBell />
              {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
            </button>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>A</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>Admin User</span>
                <span className={styles.userRole}>Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className={styles.content}>
          
        
          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            {STATS.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))}
          </div>

          {/* Charts Section */}
          <div className={styles.chartsSection}>
            {/* Revenue Chart */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <div>
                  <h3 className={styles.chartTitle}>Revenue Overview</h3>
                  <p className={styles.chartSubtitle}>Monthly revenue & bookings</p>
                </div>
                <select className={styles.chartSelect} value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>This Quarter</option>
                  <option>This Year</option>
                </select>
              </div>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revenueGradient)" strokeWidth={2} />
                    <Area type="monotone" dataKey="bookings" stroke="#8b5cf6" fill="none" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Placement Chart */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>Placement Overview</h3>
              </div>
              <div className={styles.placementStats}>
                <div className={styles.placementDonut}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={placementData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {placementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.placementLegendContainer}>
                  {placementData.map((item, idx) => (
                    <div key={idx} className={styles.placementLegend}>
                      <span className={styles.legendDot} style={{ backgroundColor: item.color }} />
                      <span className={styles.legendLabel}>{item.name}</span>
                      <span className={styles.legendValue}>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lead Funnel */}
          <div className={styles.funnelCard}>
            <div className={styles.funnelHeader}>
              <h3 className={styles.funnelTitle}>Lead Conversion Funnel</h3>
              <button className={styles.downloadBtn}>
                <FaDownload /> Download Report
              </button>
            </div>
            <div className={styles.funnelContainer}>
              {leadFunnel.map((stage, idx) => (
                <div key={idx} className={styles.funnelStage}>
                  <div className={styles.funnelStageInfo}>
                    <span className={styles.funnelStageName}>{stage.stage}</span>
                    <span className={styles.funnelStageCount}>{stage.count.toLocaleString()}</span>
                  </div>
                  <div className={styles.funnelBarWrapper}>
                    <div className={styles.funnelBar} style={{ width: `${stage.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className={styles.twoColumn}>
            
            {/* Recent Activities */}
            <div className={styles.activityCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Recent Activities</h3>
                <button className={styles.viewAllBtn}>View All</button>
              </div>
              <div className={styles.activityList}>
                {RECENT_ACTIVITIES.map(activity => (
                  <ActivityItem key={activity.id} {...activity} />
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className={styles.rightColumn}>
              {/* Quick Access */}
              <div className={styles.quickAccessCard}>
                <h3 className={styles.cardTitle}>Quick Access</h3>
                <div className={styles.quickModules}>
                  {QUICK_MODULES.map((module, idx) => (
                    <button key={idx} className={styles.quickModule} onClick={() => navigate(module.path)}>
                      <div className={styles.quickModuleIcon} style={{ backgroundColor: module.bg, color: module.color }}>
                        <module.icon size={18} />
                      </div>
                      <span className={styles.quickModuleName}>{module.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className={styles.eventsCard}>
                <h3 className={styles.cardTitle}>Upcoming Events</h3>
                {UPCOMING_EVENTS.map(event => (
                  <div key={event.id} className={styles.eventItem}>
                    <div className={styles.eventDate}>
                      <span className={styles.eventDay}>{getDayFromDate(event.date)}</span>
                      <span className={styles.eventMonth}>{getMonthFromDate(event.date)}</span>
                    </div>
                    <div className={styles.eventInfo}>
                      <span className={styles.eventTitle}>{event.title}</span>
                      <span className={styles.eventTime}>{event.time}</span>
                    </div>
                    <div className={styles.eventBadge} style={{ backgroundColor: `${event.color}15`, color: event.color }}>
                      {event.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
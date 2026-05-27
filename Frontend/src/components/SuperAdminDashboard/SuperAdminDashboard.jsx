import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FaShieldAlt, FaThLarge, FaUsers, FaChartBar, FaFileAlt,
  FaBuilding, FaBriefcase, FaMoneyBillWave, FaTasks,
  FaCalendarCheck, FaFileContract, FaCog, FaSignOutAlt,
  FaUserCircle, FaBell, FaSearch, FaGraduationCap,
  FaClock, FaSchool, FaCheck, FaExclamationCircle,
} from 'react-icons/fa';
import styles from './SuperAdminDashboard.module.css';
import { authAPI } from '../../services/api';

/* ─── static nav config ─── */
const NAV = [
  { section: 'Main' },
  { label: 'Dashboard',  icon: FaThLarge,       path: '/super-admin-dashboard', badge: null },
  { section: 'CRM' },
  { label: 'Students',   icon: FaUsers,          path: '/students',   badge: null },
  { label: 'Leads',      icon: FaChartBar,       path: '/leads',      badge: 'leads' },
  { label: 'Admissions', icon: FaFileAlt,        path: '/admissions', badge: null },
  { section: 'Placement' },
  { label: 'Companies',  icon: FaBuilding,       path: '/companies',  badge: null },
  { label: 'Drives',     icon: FaBriefcase,      path: '/drives',     badge: 'drives' },
  { section: 'Operations' },
  { label: 'Revenue',    icon: FaMoneyBillWave,  path: '/revenue',    badge: null },
  { label: 'Tasks',      icon: FaTasks,          path: '/tasks',      badge: null },
  { label: 'Attendance', icon: FaCalendarCheck,  path: '/attendance', badge: null },
  { label: 'Reports',    icon: FaFileContract,   path: '/reports',    badge: null },
  { section: 'System' },
  { label: 'Settings',   icon: FaCog,            path: '/settings',   badge: null },
];

/* ─── recent leads (replaced by API in production) ─── */
const RECENT_LEADS_STATIC = [
  { initials: 'AK', name: 'Ankit Kumar',  course: 'Full Stack Dev', status: 'New',       statusClass: 'sNew' },
  { initials: 'PS', name: 'Priya Sharma', course: 'Data Science',   status: 'Follow-up', statusClass: 'sFollowup' },
  { initials: 'RV', name: 'Rohit Verma',  course: 'UI/UX Design',   status: 'Interested',statusClass: 'sInterested' },
  { initials: 'NP', name: 'Neha Patel',   course: 'DevOps',         status: 'Demo',      statusClass: 'sDemo' },
];

/* ─── tasks ─── */
const TASKS_STATIC = [
  { text: 'Review Q2 sales report',    priority: 'High',   done: true },
  { text: 'Call TCS HR for drive',     priority: 'High',   done: false },
  { text: 'Update fee records – May',  priority: 'Medium', done: false },
  { text: 'Assign trainer to batch B7',priority: 'Low',    done: false },
];

/* ─── activity ─── */
const ACTIVITY_STATIC = [
  { text: 'New admission — Priya S.',    color: '#15a7ea', time: '2m' },
  { text: 'Drive confirmed — Infosys',   color: '#3b6d11', time: '14m' },
  { text: 'Fee due — Rohit V.',          color: '#854f0b', time: '1h' },
  { text: 'Task assigned to Meena',      color: '#534ab7', time: '2h' },
  { text: 'Lead rejected — No contact',  color: '#a32d2d', time: '3h' },
];

/* ─── upcoming drives ─── */
const DRIVES_STATIC = [
  { abbr: 'TC', name: 'TCS',     role: 'Full Stack Dev', date: '2 Jun',  mode: 'Hybrid' },
  { abbr: 'IN', name: 'Infosys', role: 'Data Analyst',   date: '8 Jun',  mode: 'Offline' },
  { abbr: 'WP', name: 'Wipro',   role: 'QA Engineer',    date: '15 Jun', mode: 'Online' },
];

/* ─── sales perf ─── */
const PERF_STATIC = [
  { name: 'Meena R.',  pct: 82 },
  { name: 'Arjun K.',  pct: 67 },
  { name: 'Sunita P.', pct: 55 },
  { name: 'Dev M.',    pct: 40 },
];

/* ────────────────────────────────────── */

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser]   = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) setUser(JSON.parse(raw));
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await authAPI.getStats();
      if (res.data.success) setStats(res.data.stats);
    } catch (e) {
      console.error('Stats fetch error:', e);
    }
  };

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/super-admin-login');
  };

  const fmt  = (n) => (n != null ? n.toLocaleString('en-IN') : '—');
  const fmtR = (n) => (n != null ? `₹${n.toLocaleString('en-IN')}` : '—');
  const fmtP = (n) => (n != null ? `${n}%` : '—');

  const STAT_CARDS = [
    { label: 'Total students',    value: fmt(stats?.totalStudents),    icon: FaUsers,          cls: 'siBlue',   sub: '+8 this month' },
    { label: 'Active leads',      value: fmt(stats?.totalLeads),       icon: FaChartBar,       cls: 'siAmber',  sub: '12 follow-up today' },
    { label: 'Revenue (month)',   value: fmtR(stats?.monthRevenue),    icon: FaMoneyBillWave,  cls: 'siGreen',  sub: `Pending: ${fmtR(stats?.pendingFees)}` },
    { label: 'Placement %',       value: fmtP(stats?.placementPct),   icon: FaBriefcase,      cls: 'siPurple', sub: '3 drives upcoming' },
    { label: 'Companies',         value: fmt(stats?.totalCompanies),   icon: FaBuilding,       cls: 'siTeal',   sub: '5 new this month' },
    { label: 'Pending fees',      value: fmtR(stats?.pendingFees),     icon: FaExclamationCircle, cls: 'siRed', sub: '18 students overdue' },
    { label: 'Active trainers',   value: fmt(stats?.activeTrainers),   icon: FaSchool,         cls: 'siBlue',   sub: '9 batches running' },
    { label: 'Pending tasks',     value: fmt(stats?.pendingTasks),     icon: FaTasks,          cls: 'siAmber',  sub: '4 overdue' },
  ];

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className={styles.app}>
      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}><FaShieldAlt /></div>
          <div>
            <div className={styles.brandName}>IDA ERP CRM</div>
            <div className={styles.brandRole}>Super Admin</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV.map((item, i) =>
            item.section ? (
              <div key={i} className={styles.navSection}>{item.section}</div>
            ) : (
              <NavLink
                key={i}
                to={item.path}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navActive : ''}`
                }
              >
                <item.icon className={styles.navIcon} />
                <span>{item.label}</span>
                {item.badge === 'leads'  && stats?.totalLeads  > 0 && <span className={styles.badge}>{stats.totalLeads}</span>}
                {item.badge === 'drives' && stats?.upcomingDrives > 0 && <span className={styles.badge}>{stats.upcomingDrives}</span>}
              </NavLink>
            )
          )}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.userRow}>
            <div className={styles.avatar}>{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
            <div>
              <div className={styles.userName}>{user?.name || 'Super Admin'}</div>
              <div className={styles.userRole}>Owner</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className={styles.main}>
        {/* topbar */}
        <header className={styles.topbar}>
          <div>
            <h2 className={styles.pageTitle}>Dashboard</h2>
            <p className={styles.pageDate}>{today}</p>
          </div>
          <div className={styles.topbarRight}>
            <button className={styles.iconBtn} aria-label="Search"><FaSearch /></button>
            <button className={styles.iconBtn} aria-label="Notifications" style={{ position: 'relative' }}>
              <FaBell />
              <span className={styles.notifDot} />
            </button>
            <button className={styles.iconBtn} aria-label="Profile"><FaUserCircle /></button>
          </div>
        </header>

        {/* scrollable content */}
        <div className={styles.content}>
          {/* stat cards */}
          <div className={styles.statsGrid}>
            {STAT_CARDS.map((s, i) => (
              <div key={i} className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles[s.cls]}`}>
                  <s.icon />
                </div>
                <div className={styles.statBody}>
                  <div className={styles.statLabel}>{s.label}</div>
                  <div className={styles.statVal}>{s.value}</div>
                  <div className={styles.statSub}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* row 2: leads + tasks */}
          <div className={styles.row2}>
            <div className={styles.card}>
              <div className={styles.cardHdr}>
                <span className={styles.cardTitle}>Recent leads</span>
                <span className={styles.cardLink} onClick={() => navigate('/leads')}>View all →</span>
              </div>
              {RECENT_LEADS_STATIC.map((l, i) => (
                <div key={i} className={styles.leadItem}>
                  <div className={styles.leadInit}>{l.initials}</div>
                  <div>
                    <div className={styles.leadName}>{l.name}</div>
                    <div className={styles.leadCourse}>{l.course}</div>
                  </div>
                  <span className={`${styles.leadStatus} ${styles[l.statusClass]}`}>{l.status}</span>
                </div>
              ))}
            </div>

            <div className={styles.card}>
              <div className={styles.cardHdr}>
                <span className={styles.cardTitle}>Tasks</span>
                <span className={styles.cardLink} onClick={() => navigate('/tasks')}>View all →</span>
              </div>
              {TASKS_STATIC.map((t, i) => (
                <div key={i} className={styles.taskItem}>
                  <div className={`${styles.taskCheck} ${t.done ? styles.taskDone : ''}`}>
                    {t.done && <FaCheck />}
                  </div>
                  <span className={`${styles.taskText} ${t.done ? styles.taskTextDone : ''}`}>{t.text}</span>
                  <span className={`${styles.taskPri} ${
                    t.priority === 'High' ? styles.priHigh : t.priority === 'Medium' ? styles.priMed : styles.priLow
                  }`}>{t.priority}</span>
                </div>
              ))}
            </div>
          </div>

          {/* row 3: activity + drives + performance */}
          <div className={styles.row3}>
            <div className={styles.card}>
              <div className={styles.cardHdr}><span className={styles.cardTitle}>Activity log</span></div>
              {ACTIVITY_STATIC.map((a, i) => (
                <div key={i} className={styles.actItem}>
                  <span className={styles.actDot} style={{ background: a.color }} />
                  <span className={styles.actText}>{a.text}</span>
                  <span className={styles.actTime}>{a.time}</span>
                </div>
              ))}
            </div>

            <div className={styles.card}>
              <div className={styles.cardHdr}><span className={styles.cardTitle}>Upcoming drives</span></div>
              {DRIVES_STATIC.map((d, i) => (
                <div key={i} className={styles.driveItem}>
                  <div className={styles.driveLogo}>{d.abbr}</div>
                  <div>
                    <div className={styles.driveCo}>{d.name}</div>
                    <div className={styles.driveRole}>{d.role}</div>
                  </div>
                  <div className={styles.driveDate}>
                    <div>{d.date}</div>
                    <div className={styles.driveMode}>{d.mode}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.card}>
              <div className={styles.cardHdr}><span className={styles.cardTitle}>Sales performance</span></div>
              {PERF_STATIC.map((p, i) => (
                <div key={i} className={styles.perfRow}>
                  <div className={styles.perfName}>{p.name}</div>
                  <div className={styles.perfBarBg}>
                    <div className={styles.perfBar} style={{ width: `${p.pct}%` }} />
                  </div>
                  <div className={styles.perfVal}>{p.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
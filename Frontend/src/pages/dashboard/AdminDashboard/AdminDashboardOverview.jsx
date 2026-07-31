import React from "react";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaChartLine,
  FaBuilding,
  FaCalendarCheck,
  FaTasks,
} from "react-icons/fa";
import styles from "./AdminDashboardOverview.module.css";

const AdminDashboardOverview = () => {
  const stats = {
    employees: { total: 85, active: 72, inactive: 13 },
    trainers: { total: 12, activeBatches: 8, totalStudents: 245 },
    sales: { totalLeads: 348, convertedLeads: 156 },
    hr: { companies: 48, placementDrives: 12, studentsPlaced: 124 },
    attendance: { present: 68, absent: 12 },
    tasks: { pending: 18, completed: 42 },
  };

  const activities = [
    {
      id: 1,
      icon: "👤",
      text: "New employee Rahul Sharma joined Sales department",
      time: "2 hours ago",
    },
    {
      id: 2,
      icon: "✅",
      text: 'Task "Review monthly report" completed',
      time: "5 hours ago",
    },
    {
      id: 3,
      icon: "🎓",
      text: "New admission for Full Stack Development course",
      time: "1 day ago",
    },
    {
      id: 4,
      icon: "📊",
      text: "Attendance marked for FSD Batch today",
      time: "1 day ago",
    },
  ];

  // Each stat now carries its own accent color, same pattern used across
  // the other dashboards - keeps this card visually consistent with the
  // rest of the app instead of a plain, uncolored icon.
  const statCards = [
    {
      icon: <FaUsers />,
      val: stats.employees.total,
      label: "Total Employees",
      sub: `Active: ${stats.employees.active} | Inactive: ${stats.employees.inactive}`,
      color: "#5b8def",
    },
    {
      icon: <FaChalkboardTeacher />,
      val: stats.trainers.total,
      label: "Trainers",
      sub: `Active Batches: ${stats.trainers.activeBatches}`,
      color: "#9b7ede",
    },
    {
      icon: <FaChartLine />,
      val: stats.sales.totalLeads,
      label: "Total Leads",
      sub: `Converted: ${stats.sales.convertedLeads}`,
      color: "#5fc98d",
    },
    {
      icon: <FaBuilding />,
      val: stats.hr.companies,
      label: "Companies",
      sub: `Drives: ${stats.hr.placementDrives}`,
      color: "#f2b84b",
    },
    {
      icon: <FaCalendarCheck />,
      val: stats.attendance.present,
      label: "Present Today",
      sub: `Absent: ${stats.attendance.absent}`,
      color: "#3fae72",
    },
    {
      icon: <FaTasks />,
      val: stats.tasks.pending,
      label: "Pending Tasks",
      sub: `Completed: ${stats.tasks.completed}`,
      color: "#f0806c",
    },
  ];

  const attendanceSegments = [
    { label: "Present", value: 68, color: "#3fae72" },
    { label: "Absent", value: 12, color: "#f0806c" },
    { label: "Leave/Other", value: 20, color: "#f2b84b" },
  ];

  return (
    <>
      <div className={styles.statsGrid}>
        {statCards.map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: `${s.color}1f`, color: s.color }}
            >
              {s.icon}
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{s.val}</span>
              <span className={styles.statLabel}>{s.label}</span>
              <div className={styles.statSub}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <h3>Attendance Overview</h3>
          <div className={styles.donutChart}>
            {attendanceSegments.map((seg) => (
              <div
                key={seg.label}
                className={styles.donutSegment}
                style={{ width: `${seg.value}%`, background: seg.color }}
              >
                {seg.value >= 15
                  ? `${seg.label} ${seg.value}%`
                  : `${seg.value}%`}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Sales Conversion</h3>
          <div className={styles.barChart}>
            <div className={styles.bar} style={{ height: "45%" }}>
              <span>45%</span>
            </div>
            <div className={styles.bar} style={{ height: "30%" }}>
              <span>30%</span>
            </div>
            <div className={styles.bar} style={{ height: "25%" }}>
              <span>25%</span>
            </div>
          </div>
          <div className={styles.barLabelsRow}>
            <span>Leads</span>
            <span>Converted</span>
            <span>Lost</span>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Placement Analytics</h3>
          <div className={styles.placementStats}>
            <div className={styles.placementItem}>
              <span>Students Placed: {stats.hr.studentsPlaced}</span>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: "65%" }}
                ></div>
              </div>
            </div>
            <div className={styles.placementItem}>
              <span>Placement Ratio: 65%</span>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: "65%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.recentActivities}>
        <h3>Recent Activities</h3>
        <div className={styles.activityList}>
          {activities.map((a) => (
            <div key={a.id} className={styles.activityItem}>
              <div className={styles.activityIcon}>{a.icon}</div>
              <div className={styles.activityContent}>
                <p>{a.text}</p>
                <span>{a.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminDashboardOverview;

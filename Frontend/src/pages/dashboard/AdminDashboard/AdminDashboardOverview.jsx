import React from "react";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaChartLine,
  FaBuilding,
  FaCalendarCheck,
  FaTasks,
} from "react-icons/fa";
import styles from "./AdminDashboard.module.css";

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

  return (
    <>
      <div className={styles.statsGrid}>
        {[
          {
            icon: <FaUsers />,
            val: stats.employees.total,
            label: "Total Employees",
            sub: `Active: ${stats.employees.active} | Inactive: ${stats.employees.inactive}`,
          },
          {
            icon: <FaChalkboardTeacher />,
            val: stats.trainers.total,
            label: "Trainers",
            sub: `Active Batches: ${stats.trainers.activeBatches}`,
          },
          {
            icon: <FaChartLine />,
            val: stats.sales.totalLeads,
            label: "Total Leads",
            sub: `Converted: ${stats.sales.convertedLeads}`,
          },
          {
            icon: <FaBuilding />,
            val: stats.hr.companies,
            label: "Companies",
            sub: `Drives: ${stats.hr.placementDrives}`,
          },
          {
            icon: <FaCalendarCheck />,
            val: stats.attendance.present,
            label: "Present Today",
            sub: `Absent: ${stats.attendance.absent}`,
          },
          {
            icon: <FaTasks />,
            val: stats.tasks.pending,
            label: "Pending Tasks",
            sub: `Completed: ${stats.tasks.completed}`,
          },
        ].map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statIcon}>{s.icon}</div>
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
            <div
              className={styles.donutSegment}
              style={{ width: "68%", background: "#10b981" }}
            >
              Present 68%
            </div>
            <div
              className={styles.donutSegment}
              style={{ width: "12%", background: "#ef4444" }}
            >
              Absent 12%
            </div>
            <div
              className={styles.donutSegment}
              style={{ width: "20%", background: "#f59e0b" }}
            >
              Leave/Other 20%
            </div>
          </div>
        </div>
        <div className={styles.chartCard}>
          <h3>Sales Conversion</h3>
          <div className={styles.barChart}>
            <div className={styles.bar} style={{ height: "45%" }}>
              <span>Leads 45%</span>
            </div>
            <div className={styles.bar} style={{ height: "30%" }}>
              <span>Converted 30%</span>
            </div>
            <div className={styles.bar} style={{ height: "25%" }}>
              <span>Lost 25%</span>
            </div>
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

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FaUsers,
  FaClock,
  FaPhone,
  FaEnvelope as FaEnvelopeIcon,
  FaSpinner,
  FaArrowUp,
  FaCalendarAlt,
  FaUserGraduate,
  FaPhoneVolume,
} from "react-icons/fa";
import { Line, Doughnut } from "react-chartjs-2";
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
  Filler,
} from "chart.js";
import styles from "./CounselorDashboardOverview.module.css";
import api, {
  getCurrentUser,
  getCurrentUserId,
  getCurrentUserRole,
} from "../../../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
);

const CounselorDashboardOverview = () => {
  const [user, setUser] = useState(null);
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
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
  });

  const [courses, setCourses] = useState([]);
  const [pendingFollowups, setPendingFollowups] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    setUser(getCurrentUser());
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const userId = getCurrentUserId();
      const userRole = getCurrentUserRole();

      let leads = [];
      let calls = [];
      let admissions = [];

      if (userRole === "admin_manager" || userRole === "super_admin") {
        const [leadsRes, callsRes, admissionsRes] = await Promise.all([
          api.get("/leads"),
          api.get("/calls"),
          api.get("/admissions"),
        ]);
        leads = leadsRes.data.success ? leadsRes.data.data : [];
        calls = callsRes.data.success ? callsRes.data.data : [];
        admissions = admissionsRes.data.success ? admissionsRes.data.data : [];
      } else {
        try {
          const [leadsRes, callsRes, admissionsRes] = await Promise.all([
            api.get(`/leads/counselor/${userId}`),
            api.get(`/calls/counselor/${userId}`),
            api.get(`/admissions/counselor/${userId}`),
          ]);
          leads = leadsRes.data.success ? leadsRes.data.data : [];
          calls = callsRes.data.success ? callsRes.data.data : [];
          admissions = admissionsRes.data.success
            ? admissionsRes.data.data
            : [];
        } catch (err) {
          const [leadsRes, callsRes, admissionsRes] = await Promise.all([
            api.get("/leads"),
            api.get("/calls"),
            api.get("/admissions"),
          ]);

          const allLeads = leadsRes.data.success ? leadsRes.data.data : [];
          const allCalls = callsRes.data.success ? callsRes.data.data : [];
          const allAdmissions = admissionsRes.data.success
            ? admissionsRes.data.data
            : [];

          leads = allLeads.filter(
            (l) =>
              l.assignedTo === userId ||
              l.counselorId === userId ||
              l.counselorId?._id === userId ||
              l.assignedTo?._id === userId,
          );

          calls = allCalls.filter(
            (c) => c.counselorId === userId || c.counselorId?._id === userId,
          );

          admissions = allAdmissions.filter(
            (a) => a.counselorId === userId || a.counselorId?._id === userId,
          );
        }
      }

      const weeklyData = [0, 0, 0, 0, 0, 0, 0];
      leads.forEach((lead) => {
        const date = new Date(lead.createdAt || lead.enquiryDate);
        const day = date.getDay();
        if (day >= 0 && day <= 6) weeklyData[day]++;
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());

      const newLeadsThisWeek = leads.filter(
        (lead) => new Date(lead.createdAt || lead.enquiryDate) >= thisWeekStart,
      ).length;
      const todayCalls = calls.filter((call) => {
        const callDate = new Date(call.callTime || call.createdAt);
        return callDate.toDateString() === today.toDateString();
      });
      const totalCalls = calls.length;
      const connectedCalls = calls.filter(
        (call) =>
          call.callStatus === "Connected" || call.status === "Connected",
      ).length;
      const totalLeads = leads.length;
      const totalAdmissions = admissions.length;
      const pendingFollowupsLeads = leads.filter(
        (lead) => lead.status === "Pending" || lead.status === "Follow-up",
      ).length;
      const conversionRate =
        totalLeads > 0 ? Math.round((totalAdmissions / totalLeads) * 100) : 0;

      const courseMap = new Map();
      leads.forEach((lead) => {
        const course = lead.courseInterest || lead.course || "Other";
        courseMap.set(course, (courseMap.get(course) || 0) + 1);
      });

      const courseData = Array.from(courseMap.entries())
        .map(([name, count]) => ({ name, count }))
        .slice(0, 4);

      const pendingData = leads
        .filter(
          (lead) => lead.status === "Pending" || lead.status === "Follow-up",
        )
        .slice(0, 4)
        .map((lead) => ({
          id: lead._id,
          name: lead.name,
          phone: lead.phone,
          course: lead.courseInterest || lead.course,
          daysPending: Math.floor(
            (new Date() - new Date(lead.createdAt || lead.enquiryDate)) /
              (1000 * 60 * 60 * 24),
          ),
        }));

      const recentCallsData = calls.slice(0, 4).map((call) => ({
        id: call._id,
        type: "call",
        message: `📞 Called ${call.leadName}`,
        status: call.callStatus || call.status,
        time: new Date(call.callTime || call.createdAt).toLocaleString(),
      }));

      const recentLeadsData = leads.slice(0, 4).map((lead) => ({
        id: lead._id,
        type: "lead",
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
        weeklyData,
      });

      setCourses(courseData);
      setPendingFollowups(pendingData);
      setRecentActivities(activities);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const lineChartData = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Leads",
        data: stats.weeklyData,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.12)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#6366f1",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Recalibrated for a LIGHT card background (the originals -
  // rgba(255,255,255,0.1) gridlines and #a0a0a0 ticks - were tuned for
  // a dark page and were barely visible here).
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      y: {
        grid: { color: "rgba(22, 33, 62, 0.06)" },
        ticks: { color: "#5b6478" },
        beginAtZero: true,
      },
      x: {
        grid: { display: false },
        ticks: { color: "#5b6478" },
      },
    },
  };

  const doughnutData = {
    labels: courses.map((c) => c.name),
    datasets: [
      {
        data: courses.map((c) => c.count),
        backgroundColor: [
          "#6366f1",
          "#3fae72",
          "#f2b84b",
          "#f0806c",
          "#9b7ede",
        ],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    cutout: "60%",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#5b6478", font: { size: 11 } },
      },
    },
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
          <h1>Welcome back, {user?.name?.split(" ")[0] || "Counselor"}! 👋</h1>
          <p>Track your leads, calls, and admissions at a glance.</p>
        </div>
        <div className={styles.dateBadge}>
          <FaCalendarAlt />
          <span>
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div
            className={styles.statIconWrapper}
            style={{ background: "rgba(99, 102, 241, 0.15)" }}
          >
            <FaUsers className={styles.statIcon} style={{ color: "#6366f1" }} />
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
          <div
            className={styles.statIconWrapper}
            style={{ background: "rgba(63, 174, 114, 0.15)" }}
          >
            <FaPhoneVolume
              className={styles.statIcon}
              style={{ color: "#3fae72" }}
            />
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
          <div
            className={styles.statIconWrapper}
            style={{ background: "rgba(242, 184, 75, 0.18)" }}
          >
            <FaClock className={styles.statIcon} style={{ color: "#d9971f" }} />
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
          <div
            className={styles.statIconWrapper}
            style={{ background: "rgba(155, 126, 222, 0.15)" }}
          >
            <FaUserGraduate
              className={styles.statIcon}
              style={{ color: "#9b7ede" }}
            />
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
            <span className={styles.headerBadge}>
              +{stats.newLeadsThisWeek} this week
            </span>
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
              pendingFollowups.map((item) => (
                <div key={item.id} className={styles.followupItem}>
                  <div className={styles.followupAvatar}>
                    <span>{item.name.charAt(0)}</span>
                  </div>
                  <div className={styles.followupInfo}>
                    <div className={styles.followupName}>{item.name}</div>
                    <div className={styles.followupDetails}>
                      {item.course} • {item.phone}
                    </div>
                    <div className={styles.followupDays}>
                      Pending for {item.daysPending} days
                    </div>
                  </div>
                  <div className={styles.followupActions}>
                    <button className={styles.callBtn}>
                      <FaPhone />
                    </button>
                    <button className={styles.messageBtn}>
                      <FaEnvelopeIcon />
                    </button>
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
                    <div className={styles.activityMessage}>
                      {activity.message}
                    </div>
                    <div className={styles.activityStatus}>
                      <span
                        className={`${styles.statusDot} ${activity.status === "Connected" ? styles.success : styles.warning}`}
                      ></span>
                      {activity.status || "New"}
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

export default CounselorDashboardOverview;

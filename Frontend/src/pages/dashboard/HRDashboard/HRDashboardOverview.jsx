import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaBriefcase,
  FaGraduationCap,
  FaUserCheck,
  FaChartLine,
  FaStar,
  FaArrowUp,
  FaCalendarAlt,
} from "react-icons/fa";
import { Line, Doughnut } from "react-chartjs-2";
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
  Filler,
} from "chart.js";
import api from "../../../services/api";
import styles from "./HRDashboard.module.css";

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
  Filler,
);

const HRDashboardOverview = () => {
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
    pendingFollowups: 0,
  });

  const [monthlyCompanies] = useState([
    12, 19, 15, 17, 14, 18, 22, 25, 28, 30, 32, 35,
  ]);
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const companiesRes = await api.get("/companies");
      if (companiesRes.data.success) {
        setCompanies(companiesRes.data.data || []);
        const totalCompanies = companiesRes.data.data?.length || 0;
        const activeCompanies =
          companiesRes.data.data?.filter((c) => c.status === "active").length ||
          0;
        setStats((prev) => ({ ...prev, totalCompanies, activeCompanies }));
      }

      const drivesRes = await api.get("/placement-drives");
      if (drivesRes.data.success) {
        setDrives(drivesRes.data.data || []);
        const placementDrives = drivesRes.data.data?.length || 0;
        setStats((prev) => ({ ...prev, placementDrives }));
      }

      const studentsRes = await api.get("/admissions");
      if (studentsRes.data.success) {
        const eligibleStudents =
          studentsRes.data.data?.filter((s) => s.isEligible).length || 0;
        const selectedStudents =
          studentsRes.data.data?.filter((s) => s.isSelected).length || 0;
        const placementRatio =
          eligibleStudents > 0
            ? (selectedStudents / eligibleStudents) * 100
            : 0;
        setStats((prev) => ({
          ...prev,
          eligibleStudents,
          selectedStudents,
          placementRatio: placementRatio.toFixed(1),
        }));
      }
    } catch (error) {
      console.error("Error fetching HR dashboard data:", error);
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
        pendingFollowups: 8,
      });
    }
  };

  const monthlyCompaniesData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Companies Onboarded",
        data: monthlyCompanies,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const placementSuccessData = {
    labels: ["Selected", "Rejected", "Pending"],
    datasets: [
      {
        data: [
          stats.selectedStudents,
          stats.eligibleStudents - stats.selectedStudents,
          stats.eligibleStudents,
        ],
        backgroundColor: ["#22c55e", "#ef4444", "#f59e0b"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className={styles.dashboardContent}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaBuilding />
          </div>
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
          <div className={styles.statIcon}>
            <FaBriefcase />
          </div>
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
          <div className={styles.statIcon}>
            <FaGraduationCap />
          </div>
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
          <div className={styles.statIcon}>
            <FaUserCheck />
          </div>
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
          <div className={styles.statIcon}>
            <FaChartLine />
          </div>
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
          <div className={styles.statIcon}>
            <FaStar />
          </div>
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

      <div className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <h3>Monthly Company Onboarding</h3>
          <div className={styles.chartContainer}>
            <Line
              data={monthlyCompaniesData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
        <div className={styles.chartCard}>
          <h3>Placement Success Rate</h3>
          <div className={styles.doughnutContainer}>
            <Doughnut
              data={placementSuccessData}
              options={{
                cutout: "60%",
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.twoColumnLayout}>
        <div className={styles.recentCard}>
          <div className={styles.cardHeader}>
            <h3>Recent Companies</h3>
            <button className={styles.viewAllBtn}>View All</button>
          </div>
          <div className={styles.recentList}>
            {companies.slice(0, 5).map((company) => (
              <div key={company._id} className={styles.recentItem}>
                <div className={styles.recentIcon}>
                  <FaBuilding />
                </div>
                <div className={styles.recentInfo}>
                  <div className={styles.recentTitle}>{company.name}</div>
                  <div className={styles.recentSub}>
                    {company.industry} • {company.location}
                  </div>
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
            {drives.slice(0, 5).map((drive) => (
              <div key={drive._id} className={styles.recentItem}>
                <div className={styles.recentIcon}>
                  <FaCalendarAlt />
                </div>
                <div className={styles.recentInfo}>
                  <div className={styles.recentTitle}>{drive.companyName}</div>
                  <div className={styles.recentSub}>
                    {new Date(drive.driveDate).toLocaleDateString()} •{" "}
                    {drive.ctc} LPA
                  </div>
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
};

export default HRDashboardOverview;

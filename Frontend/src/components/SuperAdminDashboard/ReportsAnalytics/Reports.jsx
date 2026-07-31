// components/SuperAdminDashboard/ReportsAnalytics/ReportsAnalytics.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  FaChartPie,
  FaChartLine,
  FaChartBar,
  FaUsers,
  FaMoneyBillWave,
  FaDownload,
  FaSyncAlt,
  FaArrowUp,
  FaArrowDown,
  FaSpinner,
  FaUserTie,
  FaClock,
  FaLayerGroup,
  FaTags,
  FaGraduationCap,
  FaBookOpen,
  FaChalkboardTeacher,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { reportsAPI } from "../../../services/api";
import styles from "./Reports.module.css";

const TREND_COLORS = {
  income: "#5fc98d",
  expense: "#f0806c",
};

const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [trendMonths, setTrendMonths] = useState(6);

  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [staff, setStaff] = useState(null);
  const [categories, setCategories] = useState(null);
  const [academic, setAcademic] = useState(null);
  const [enrollmentTrends, setEnrollmentTrends] = useState([]);
  const [courseDistribution, setCourseDistribution] = useState([]);
  const [batchUtilization, setBatchUtilization] = useState([]);

  const fetchAll = useCallback(
    async (months = trendMonths) => {
      setIsLoading(true);
      try {
        const [
          overviewRes,
          trendsRes,
          staffRes,
          categoriesRes,
          academicRes,
          enrollmentRes,
          courseDistRes,
          batchUtilRes,
        ] = await Promise.all([
          reportsAPI.getOverview(),
          reportsAPI.getRevenueTrends({ months }),
          reportsAPI.getStaffDistribution(),
          reportsAPI.getCategoryBreakdown(),
          reportsAPI.getAcademicOverview(),
          reportsAPI.getEnrollmentTrends({ months }),
          reportsAPI.getCourseDistribution(),
          reportsAPI.getBatchUtilization(),
        ]);

        if (overviewRes.data.success) setOverview(overviewRes.data.data);
        if (trendsRes.data.success) setTrends(trendsRes.data.data);
        if (staffRes.data.success) setStaff(staffRes.data.data);
        if (categoriesRes.data.success) setCategories(categoriesRes.data.data);
        if (academicRes.data.success) setAcademic(academicRes.data.data);
        if (enrollmentRes.data.success)
          setEnrollmentTrends(enrollmentRes.data.data);
        if (courseDistRes.data.success)
          setCourseDistribution(courseDistRes.data.data);
        if (batchUtilRes.data.success)
          setBatchUtilization(batchUtilRes.data.data);
      } catch (error) {
        console.error("Error fetching reports data:", error);
        toast.error("Failed to load reports data");
        setFallbackData();
      } finally {
        setIsLoading(false);
      }
    },
    [trendMonths],
  );

  useEffect(() => {
    fetchAll(trendMonths);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMonthsChange = (months) => {
    setTrendMonths(months);
    fetchAll(months);
  };

  const setFallbackData = () => {
    setOverview({
      totalRevenue: 6240000,
      totalRevenueFormatted: "₹62,40,000",
      thisMonthRevenue: 820000,
      thisMonthRevenueFormatted: "₹8,20,000",
      growthPercent: 8.2,
      totalTransactions: 2456,
      totalStaff: 42,
      activeStaff: 38,
      inactiveStaff: 4,
      pendingAmount: 156000,
      pendingAmountFormatted: "₹1,56,000",
    });
    setTrends([
      { month: "Feb", income: 420000, expense: 135000, net: 285000 },
      { month: "Mar", income: 490000, expense: 145000, net: 345000 },
      { month: "Apr", income: 520000, expense: 158000, net: 362000 },
      { month: "May", income: 580000, expense: 162000, net: 418000 },
      { month: "Jun", income: 620000, expense: 175000, net: 445000 },
      { month: "Jul", income: 820000, expense: 190000, net: 630000 },
    ]);
    setStaff({
      byRole: [
        {
          role: "sales_executive",
          label: "Sales Executive",
          count: 12,
          percentage: 29,
          color: "#5fc98d",
        },
        {
          role: "trainer",
          label: "Trainer",
          count: 10,
          percentage: 24,
          color: "#9b7ede",
        },
        {
          role: "hr_executive",
          label: "HR Executive",
          count: 6,
          percentage: 14,
          color: "#f2b84b",
        },
        {
          role: "counselor",
          label: "Counselor",
          count: 8,
          percentage: 19,
          color: "#4dd0c9",
        },
        {
          role: "admin_manager",
          label: "Admin Manager",
          count: 4,
          percentage: 10,
          color: "#5b8def",
        },
        {
          role: "super_admin",
          label: "Super Admin",
          count: 2,
          percentage: 5,
          color: "#f0806c",
        },
      ],
      byDepartment: [
        { department: "sales", count: 12 },
        { department: "training", count: 10 },
        { department: "hr", count: 6 },
        { department: "counseling", count: 8 },
        { department: "management", count: 6 },
      ],
      active: 38,
      inactive: 4,
      total: 42,
    });
    setCategories({
      income: [
        {
          category: "course_fee",
          total: 4800000,
          totalFormatted: "₹48,00,000",
          count: 890,
          percentage: 77,
        },
        {
          category: "placement_fee",
          total: 1440000,
          totalFormatted: "₹14,40,000",
          count: 210,
          percentage: 23,
        },
      ],
      expense: [
        {
          category: "trainer_salary",
          total: 620000,
          totalFormatted: "₹6,20,000",
          count: 45,
          percentage: 52,
        },
        {
          category: "operational",
          total: 340000,
          totalFormatted: "₹3,40,000",
          count: 78,
          percentage: 28,
        },
        {
          category: "marketing",
          total: 140000,
          totalFormatted: "₹1,40,000",
          count: 22,
          percentage: 12,
        },
        {
          category: "infrastructure",
          total: 95000,
          totalFormatted: "₹95,000",
          count: 14,
          percentage: 8,
        },
      ],
      incomeTotal: 6240000,
      expenseTotal: 1195000,
      incomeTotalFormatted: "₹62,40,000",
      expenseTotalFormatted: "₹11,95,000",
    });
    setAcademic({
      totalStudents: 640,
      activeStudents: 520,
      inactiveStudents: 60,
      completedStudents: 60,
      totalBatches: 28,
      upcomingBatches: 5,
      activeBatches: 19,
      completedBatches: 4,
      totalMaterials: 312,
      totalCapacity: 780,
      totalFilled: 610,
      fillRate: 78,
    });
    setEnrollmentTrends([
      { month: "Feb", enrollments: 62 },
      { month: "Mar", enrollments: 78 },
      { month: "Apr", enrollments: 85 },
      { month: "May", enrollments: 94 },
      { month: "Jun", enrollments: 101 },
      { month: "Jul", enrollments: 118 },
    ]);
    setCourseDistribution([
      {
        course: "Full Stack Development",
        count: 210,
        percentage: 33,
        color: "#5fc98d",
      },
      { course: "Data Science", count: 150, percentage: 23, color: "#5b8def" },
      {
        course: "Digital Marketing",
        count: 110,
        percentage: 17,
        color: "#f2b84b",
      },
      { course: "UI/UX Design", count: 95, percentage: 15, color: "#9b7ede" },
      { course: "Cloud & DevOps", count: 75, percentage: 12, color: "#4dd0c9" },
    ]);
    setBatchUtilization([
      {
        id: "1",
        name: "FSD Morning A1",
        code: "FSD-A1",
        course: "Full Stack Development",
        capacity: 30,
        enrolled: 28,
        fillRate: 93,
        status: "active",
      },
      {
        id: "2",
        name: "DS Evening B2",
        code: "DS-B2",
        course: "Data Science",
        capacity: 25,
        enrolled: 24,
        fillRate: 96,
        status: "active",
      },
      {
        id: "3",
        name: "UI/UX Weekend",
        code: "UX-W1",
        course: "UI/UX Design",
        capacity: 20,
        enrolled: 12,
        fillRate: 60,
        status: "upcoming",
      },
    ]);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await reportsAPI.exportReport({ months: trendMonths });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `reports-analytics-${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Report exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      course_fee: "Course Fee",
      placement_fee: "Placement Fee",
      trainer_salary: "Trainer Salary",
      operational: "Operational",
      marketing: "Marketing",
      infrastructure: "Infrastructure",
    };
    return labels[category] || category;
  };

  const maxTrendValue = Math.max(
    ...trends.map((t) => Math.max(t.income, t.expense)),
    1,
  );

  if (isLoading && !overview) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <p>Loading reports data...</p>
      </div>
    );
  }

  return (
    <div className={styles.reportsContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>
            <FaChartPie /> Reports &amp; Analytics
          </h1>
          <p className={styles.pageSubtitle}>
            Institute-wide performance across revenue, staff, and operations
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.refreshBtn}
            onClick={() => fetchAll(trendMonths)}
            disabled={isLoading}
          >
            <FaSyncAlt className={isLoading ? styles.spinning : ""} /> Refresh
          </button>
          <button
            className={styles.exportBtn}
            onClick={handleExport}
            disabled={isExporting}
          >
            <FaDownload /> {isExporting ? "Exporting..." : "Export Report"}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabBtn} ${activeTab === "overview" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <FaChartPie /> Overview
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "revenue" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("revenue")}
        >
          <FaChartLine /> Revenue Trends
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "staff" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("staff")}
        >
          <FaUsers /> Staff Analytics
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "categories" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          <FaTags /> Categories
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "academic" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("academic")}
        >
          <FaGraduationCap /> Academic
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && overview && (
        <div className={styles.tabContent}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#5fc98d20", color: "#5fc98d" }}
              >
                <FaMoneyBillWave />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>
                  {overview.totalRevenueFormatted}
                </span>
                <span className={styles.statLabel}>
                  Total Revenue (All Time)
                </span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#5b8def20", color: "#5b8def" }}
              >
                <FaChartLine />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>
                  {overview.thisMonthRevenueFormatted}
                </span>
                <span className={styles.statLabel}>This Month</span>
              </div>
              <span
                className={styles.statTrend}
                style={{
                  color: overview.growthPercent >= 0 ? "#5fc98d" : "#f0806c",
                }}
              >
                {overview.growthPercent >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                {Math.abs(overview.growthPercent)}%
              </span>
            </div>

            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#9b7ede20", color: "#9b7ede" }}
              >
                <FaUserTie />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{overview.totalStaff}</span>
                <span className={styles.statLabel}>Total Staff</span>
              </div>
              <span className={styles.statTrend}>
                {overview.activeStaff} active
              </span>
            </div>

            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#f2b84b20", color: "#f2b84b" }}
              >
                <FaClock />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>
                  {overview.pendingAmountFormatted}
                </span>
                <span className={styles.statLabel}>Pending Amount</span>
              </div>
            </div>
          </div>

          <div className={styles.overviewGrid}>
            <div className={styles.chartCard}>
              <h3>Revenue Trend (Last {trendMonths} Months)</h3>
              <MiniBarChart trends={trends} maxValue={maxTrendValue} />
            </div>

            <div className={styles.chartCard}>
              <h3>Staff by Role</h3>
              {staff && <DonutChart segments={staff.byRole} />}
            </div>
          </div>
        </div>
      )}

      {/* REVENUE TRENDS TAB */}
      {activeTab === "revenue" && (
        <div className={styles.tabContent}>
          <div className={styles.trendControls}>
            <span>Showing last</span>
            {[3, 6, 12].map((m) => (
              <button
                key={m}
                className={`${styles.monthPill} ${trendMonths === m ? styles.monthPillActive : ""}`}
                onClick={() => handleMonthsChange(m)}
              >
                {m} months
              </button>
            ))}
          </div>

          <div className={styles.chartCard}>
            <h3>Income vs Expense</h3>
            <div className={styles.barChart}>
              {trends.map((data, index) => (
                <div key={index} className={styles.barGroup}>
                  <div className={styles.barContainer}>
                    <div
                      className={styles.barIncome}
                      style={{
                        height: `${(data.income / maxTrendValue) * 100}%`,
                      }}
                      title={`Income: ${data.income}`}
                    />
                    <div
                      className={styles.barExpense}
                      style={{
                        height: `${(data.expense / maxTrendValue) * 100}%`,
                      }}
                      title={`Expense: ${data.expense}`}
                    />
                  </div>
                  <span className={styles.barLabel}>{data.month}</span>
                </div>
              ))}
            </div>
            <div className={styles.chartLegend}>
              <span>
                <span
                  className={styles.legendDot}
                  style={{ background: TREND_COLORS.income }}
                />{" "}
                Income
              </span>
              <span>
                <span
                  className={styles.legendDot}
                  style={{ background: TREND_COLORS.expense }}
                />{" "}
                Expense
              </span>
            </div>
          </div>

          <div className={styles.trendTableWrap}>
            <table className={styles.trendTable}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Income</th>
                  <th>Expense</th>
                  <th>Net</th>
                  <th>Transactions</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((t, i) => (
                  <tr key={i}>
                    <td>
                      {t.month} {t.year}
                    </td>
                    <td className={styles.incomeText}>
                      ₹{t.income.toLocaleString("en-IN")}
                    </td>
                    <td className={styles.expenseText}>
                      ₹{t.expense.toLocaleString("en-IN")}
                    </td>
                    <td
                      className={
                        t.net >= 0 ? styles.incomeText : styles.expenseText
                      }
                    >
                      ₹{t.net.toLocaleString("en-IN")}
                    </td>
                    <td>{t.transactionCount ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STAFF ANALYTICS TAB */}
      {activeTab === "staff" && staff && (
        <div className={styles.tabContent}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#5fc98d20", color: "#5fc98d" }}
              >
                <FaUsers />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{staff.total}</span>
                <span className={styles.statLabel}>Total Staff</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#5b8def20", color: "#5b8def" }}
              >
                <FaUserTie />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{staff.active}</span>
                <span className={styles.statLabel}>Active</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#f0806c20", color: "#f0806c" }}
              >
                <FaClock />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{staff.inactive}</span>
                <span className={styles.statLabel}>Inactive</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#9b7ede20", color: "#9b7ede" }}
              >
                <FaLayerGroup />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>
                  {staff.byDepartment.length}
                </span>
                <span className={styles.statLabel}>Departments</span>
              </div>
            </div>
          </div>

          <div className={styles.overviewGrid}>
            <div className={styles.chartCard}>
              <h3>Distribution by Role</h3>
              <div className={styles.donutWrap}>
                <DonutChart segments={staff.byRole} size={200} />
                <div className={styles.sourceLegend}>
                  {staff.byRole.map((r) => (
                    <div key={r.role} className={styles.sourceItem}>
                      <span
                        className={styles.sourceColor}
                        style={{ background: r.color }}
                      />
                      <span className={styles.sourceName}>{r.label}</span>
                      <span className={styles.sourceValue}>
                        {r.count} ({r.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3>By Department</h3>
              <div className={styles.deptList}>
                {staff.byDepartment.map((d) => {
                  const max = Math.max(
                    ...staff.byDepartment.map((x) => x.count),
                    1,
                  );
                  return (
                    <div key={d.department} className={styles.deptRow}>
                      <span className={styles.deptName}>{d.department}</span>
                      <div className={styles.deptBarTrack}>
                        <div
                          className={styles.deptBarFill}
                          style={{ width: `${(d.count / max) * 100}%` }}
                        />
                      </div>
                      <span className={styles.deptCount}>{d.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === "categories" && categories && (
        <div className={styles.tabContent}>
          <div className={styles.categoriesGrid}>
            <div className={styles.chartCard}>
              <h3>
                Income by Category{" "}
                <span className={styles.chartCardTotal}>
                  {categories.incomeTotalFormatted}
                </span>
              </h3>
              <div className={styles.categoryList}>
                {categories.income.map((c) => (
                  <div key={c.category} className={styles.categoryRow}>
                    <div className={styles.categoryRowTop}>
                      <span>{getCategoryLabel(c.category)}</span>
                      <span className={styles.incomeText}>
                        {c.totalFormatted}
                      </span>
                    </div>
                    <div className={styles.deptBarTrack}>
                      <div
                        className={styles.deptBarFill}
                        style={{
                          width: `${c.percentage}%`,
                          background: "#5fc98d",
                        }}
                      />
                    </div>
                    <span className={styles.categoryMeta}>
                      {c.count} transactions · {c.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3>
                Expense by Category{" "}
                <span className={styles.chartCardTotal}>
                  {categories.expenseTotalFormatted}
                </span>
              </h3>
              <div className={styles.categoryList}>
                {categories.expense.map((c) => (
                  <div key={c.category} className={styles.categoryRow}>
                    <div className={styles.categoryRowTop}>
                      <span>{getCategoryLabel(c.category)}</span>
                      <span className={styles.expenseText}>
                        {c.totalFormatted}
                      </span>
                    </div>
                    <div className={styles.deptBarTrack}>
                      <div
                        className={styles.deptBarFill}
                        style={{
                          width: `${c.percentage}%`,
                          background: "#f0806c",
                        }}
                      />
                    </div>
                    <span className={styles.categoryMeta}>
                      {c.count} transactions · {c.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ACADEMIC TAB */}
      {activeTab === "academic" && academic && (
        <div className={styles.tabContent}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#5fc98d20", color: "#5fc98d" }}
              >
                <FaGraduationCap />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>
                  {academic.totalStudents}
                </span>
                <span className={styles.statLabel}>Total Students</span>
              </div>
              <span className={styles.statTrend}>
                {academic.activeStudents} active
              </span>
            </div>

            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#5b8def20", color: "#5b8def" }}
              >
                <FaChalkboardTeacher />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>
                  {academic.totalBatches}
                </span>
                <span className={styles.statLabel}>Total Batches</span>
              </div>
              <span className={styles.statTrend}>
                {academic.activeBatches} active
              </span>
            </div>

            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#f2b84b20", color: "#f2b84b" }}
              >
                <FaLayerGroup />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{academic.fillRate}%</span>
                <span className={styles.statLabel}>Seat Fill Rate</span>
              </div>
              <span className={styles.statTrend}>
                {academic.totalFilled}/{academic.totalCapacity} seats
              </span>
            </div>

            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#9b7ede20", color: "#9b7ede" }}
              >
                <FaBookOpen />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>
                  {academic.totalMaterials}
                </span>
                <span className={styles.statLabel}>Course Materials</span>
              </div>
            </div>
          </div>

          <div className={styles.overviewGrid}>
            <div className={styles.chartCard}>
              <h3>New Enrollments (Last {trendMonths} Months)</h3>
              <div className={styles.barChart}>
                {enrollmentTrends.map((data, index) => {
                  const max = Math.max(
                    ...enrollmentTrends.map((d) => d.enrollments),
                    1,
                  );
                  return (
                    <div key={index} className={styles.barGroup}>
                      <div className={styles.barContainer}>
                        <div
                          className={styles.barIncome}
                          style={{
                            height: `${(data.enrollments / max) * 100}%`,
                            width: "18px",
                          }}
                          title={`${data.enrollments} enrollments`}
                        />
                      </div>
                      <span className={styles.barLabel}>{data.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3>Students by Course</h3>
              <div className={styles.donutWrap}>
                <DonutChart
                  segments={courseDistribution.map((c) => ({
                    ...c,
                    percentage: c.percentage,
                  }))}
                  size={200}
                />
                <div className={styles.sourceLegend}>
                  {courseDistribution.map((c) => (
                    <div key={c.course} className={styles.sourceItem}>
                      <span
                        className={styles.sourceColor}
                        style={{ background: c.color }}
                      />
                      <span className={styles.sourceName}>{c.course}</span>
                      <span className={styles.sourceValue}>
                        {c.count} ({c.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.trendTableWrap}>
            <table className={styles.trendTable}>
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Course</th>
                  <th>Enrolled / Capacity</th>
                  <th>Fill Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {batchUtilization.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{ textAlign: "center", color: "#94a3b8" }}
                    >
                      No batches found
                    </td>
                  </tr>
                ) : (
                  batchUtilization.map((b) => (
                    <tr key={b.id}>
                      <td>
                        {b.name} {b.code ? `(${b.code})` : ""}
                      </td>
                      <td>{b.course}</td>
                      <td>
                        {b.enrolled} / {b.capacity}
                      </td>
                      <td
                        className={
                          b.fillRate >= 80
                            ? styles.incomeText
                            : styles.expenseText
                        }
                      >
                        {b.fillRate}%
                      </td>
                      <td style={{ textTransform: "capitalize" }}>
                        {b.status}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Small bar chart used inside the Overview tab
const MiniBarChart = ({ trends, maxValue }) => (
  <div className={styles.barChart}>
    {trends.map((data, index) => (
      <div key={index} className={styles.barGroup}>
        <div className={styles.barContainer}>
          <div
            className={styles.barIncome}
            style={{ height: `${(data.income / maxValue) * 100}%` }}
          />
          <div
            className={styles.barExpense}
            style={{ height: `${(data.expense / maxValue) * 100}%` }}
          />
        </div>
        <span className={styles.barLabel}>{data.month}</span>
      </div>
    ))}
  </div>
);

// Reusable SVG donut chart
const DonutChart = ({ segments, size = 160 }) => {
  const radius = size / 2 - 20;
  const center = size / 2;

  let cumulativeAngle = 0;
  const paths = segments.map((seg, index) => {
    const angle = (seg.percentage / 100) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;

    const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return <path key={index} d={path} fill={seg.color} />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths}
      <circle cx={center} cy={center} r={radius * 0.55} fill="#ffffff" />
    </svg>
  );
};

export default ReportsAnalytics;

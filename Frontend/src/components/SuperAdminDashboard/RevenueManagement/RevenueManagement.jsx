// components/SuperAdminDashboard/RevenueManagement/RevenueManagement.jsx
import React, { useState, useEffect } from "react";
import {
  FaMoneyBillWave,
  FaChartLine,
  FaChartPie,
  FaCalendarAlt,
  FaDownload,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaTimes,
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
  FaArrowUp,
  FaArrowDown,
  FaFileInvoice,
  FaWallet,
  FaCreditCard,
  FaUniversity,
  FaMobileAlt,
  FaClock,
  FaExclamationTriangle,
  FaTag,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { revenueAPI } from "../../../services/api"; // Updated import path
import styles from "./RevenueManagement.module.css";

const RevenueManagement = () => {
  // State Management
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [paymentSources, setPaymentSources] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [formData, setFormData] = useState({
    type: "income",
    category: "course_fee",
    amount: "",
    description: "",
    paymentMethod: "cash",
    status: "completed",
    date: new Date().toISOString().split("T")[0],
    reference: "",
    studentId: "",
    courseId: "",
    notes: "",
  });

  // Fetch revenue data on component mount
  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    setIsLoading(true);
    try {
      const response = await revenueAPI.getDashboardData();
      if (response.data.success) {
        const data = response.data.data;
        setRevenueData(data.overview);
        setTransactions(data.transactions || []);
        setPaymentSources(data.paymentSources || []);
        setMonthlyTrend(data.monthlyTrend || []);
        setRecentActivity(data.recentActivity || []);
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      toast.error("Failed to load revenue data");
      // Set fallback demo data for UI demonstration
      setFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const setFallbackData = () => {
    setRevenueData({
      totalRevenue: 6240000,
      totalRevenueFormatted: "₹62.4L",
      monthlyRevenue: 820000,
      monthlyRevenueFormatted: "₹8.2L",
      pendingAmount: 156000,
      pendingAmountFormatted: "₹1.56L",
      totalTransactions: 2456,
      successRate: 94.2,
      averageTransaction: 2540,
      averageTransactionFormatted: "₹2,540",
    });
    setTransactions([
      {
        id: "1",
        type: "income",
        category: "course_fee",
        amount: 45000,
        description: "Full Stack Development Course - John Doe",
        paymentMethod: "online",
        status: "completed",
        date: "2026-07-15",
        reference: "INV-2026-001",
        studentName: "John Doe",
        courseName: "Full Stack Development",
      },
      {
        id: "2",
        type: "income",
        category: "placement_fee",
        amount: 25000,
        description: "Placement Service Fee - TCS",
        paymentMethod: "bank_transfer",
        status: "completed",
        date: "2026-07-14",
        reference: "INV-2026-002",
        studentName: "Sarah Smith",
        courseName: "Data Science",
      },
      {
        id: "3",
        type: "expense",
        category: "trainer_salary",
        amount: 15000,
        description: "Trainer Salary - June 2026",
        paymentMethod: "cash",
        status: "pending",
        date: "2026-07-13",
        reference: "EXP-2026-003",
        trainerName: "Mr. Sharma",
      },
    ]);
    setPaymentSources([
      { name: "Online Payment", value: 45, color: "#5fc98d" },
      { name: "Bank Transfer", value: 30, color: "#5b8def" },
      { name: "Cash", value: 15, color: "#f2b84b" },
      { name: "UPI", value: 10, color: "#9b7ede" },
    ]);
    setMonthlyTrend([
      { month: "Jan", income: 380000, expense: 120000 },
      { month: "Feb", income: 420000, expense: 135000 },
      { month: "Mar", income: 490000, expense: 145000 },
      { month: "Apr", income: 520000, expense: 158000 },
      { month: "May", income: 580000, expense: 162000 },
      { month: "Jun", income: 620000, expense: 175000 },
    ]);
    setRecentActivity([
      {
        type: "income",
        amount: 45000,
        description: "New enrollment - Full Stack",
        time: "2 hours ago",
        status: "completed",
      },
      {
        type: "income",
        amount: 25000,
        description: "Placement fee - TCS",
        time: "5 hours ago",
        status: "completed",
      },
      {
        type: "expense",
        amount: 15000,
        description: "Trainer salary payment",
        time: "1 day ago",
        status: "pending",
      },
    ]);
  };

  // CRUD Operations
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const response = await revenueAPI.createTransaction(formData);
      if (response.data.success) {
        toast.success("Transaction added successfully");
        setShowAddModal(false);
        resetForm();
        fetchRevenueData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add transaction");
    }
  };

  const handleEditTransaction = async (e) => {
    e.preventDefault();
    try {
      const response = await revenueAPI.updateTransaction(
        selectedTransaction.id,
        formData,
      );
      if (response.data.success) {
        toast.success("Transaction updated successfully");
        setShowEditModal(false);
        resetForm();
        fetchRevenueData();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update transaction",
      );
    }
  };

  const handleDeleteTransaction = async () => {
    try {
      const response = await revenueAPI.deleteTransaction(
        selectedTransaction.id,
      );
      if (response.data.success) {
        toast.success("Transaction deleted successfully");
        setShowDeleteModal(false);
        fetchRevenueData();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete transaction",
      );
    }
  };

  const handleExportData = async (format = "csv") => {
    try {
      const response = await revenueAPI.exportData({
        format,
        startDate: dateRange.start,
        endDate: dateRange.end,
      });
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `revenue-data.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const openEditModal = (transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description,
      paymentMethod: transaction.paymentMethod,
      status: transaction.status,
      date: transaction.date,
      reference: transaction.reference || "",
      studentId: transaction.studentId || "",
      courseId: transaction.courseId || "",
      notes: transaction.notes || "",
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: "income",
      category: "course_fee",
      amount: "",
      description: "",
      paymentMethod: "cash",
      status: "completed",
      date: new Date().toISOString().split("T")[0],
      reference: "",
      studentId: "",
      courseId: "",
      notes: "",
    });
    setSelectedTransaction(null);
  };

  // Filter and sort transactions
  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(term) ||
          t.reference?.toLowerCase().includes(term) ||
          t.studentName?.toLowerCase().includes(term) ||
          t.courseName?.toLowerCase().includes(term),
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter((t) => t.date >= dateRange.start);
    }
    if (dateRange.end) {
      filtered = filtered.filter((t) => t.date <= dateRange.end);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === "amount") {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }
      if (typeof aVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return styles.statusCompleted;
      case "pending":
        return styles.statusPending;
      case "failed":
        return styles.statusFailed;
      case "refunded":
        return styles.statusRefunded;
      default:
        return styles.statusPending;
    }
  };

  // Get payment method icon
  const getPaymentIcon = (method) => {
    switch (method) {
      case "online":
        return <FaCreditCard />;
      case "bank_transfer":
        return <FaUniversity />;
      case "cash":
        return <FaWallet />;
      case "upi":
        return <FaMobileAlt />;
      default:
        return <FaCreditCard />;
    }
  };

  // Get category label
  const getCategoryLabel = (category) => {
    const categories = {
      course_fee: "Course Fee",
      placement_fee: "Placement Fee",
      trainer_salary: "Trainer Salary",
      operational: "Operational",
      marketing: "Marketing",
      infrastructure: "Infrastructure",
    };
    return categories[category] || category;
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <p>Loading revenue data...</p>
      </div>
    );
  }

  return (
    <div className={styles.revenueContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>
            <FaMoneyBillWave /> Revenue Management
          </h1>
          <p className={styles.pageSubtitle}>
            Track and manage all financial transactions
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.exportBtn}
            onClick={() => handleExportData("csv")}
          >
            <FaDownload /> Export
          </button>
          <button
            className={styles.addBtn}
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Add Transaction
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
          className={`${styles.tabBtn} ${activeTab === "transactions" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("transactions")}
        >
          <FaFileInvoice /> Transactions
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "trends" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("trends")}
        >
          <FaChartLine /> Trends
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "sources" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("sources")}
        >
          <FaTag /> Payment Sources
        </button>
      </div>

      {/* Render tabs content - Keeping the rest of the JSX as provided */}
      {activeTab === "overview" && (
        <div className={styles.tabContent}>
          {/* Stats Cards */}
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
                  {revenueData?.totalRevenueFormatted || "₹0"}
                </span>
                <span className={styles.statLabel}>Total Revenue</span>
              </div>
              <span className={styles.statTrend}>
                <FaArrowUp /> 12.5%
              </span>
            </div>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#5b8def20", color: "#5b8def" }}
              >
                <FaCalendarAlt />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>
                  {revenueData?.monthlyRevenueFormatted || "₹0"}
                </span>
                <span className={styles.statLabel}>This Month</span>
              </div>
              <span className={styles.statTrend}>
                <FaArrowUp /> 8.2%
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
                  {revenueData?.pendingAmountFormatted || "₹0"}
                </span>
                <span className={styles.statLabel}>Pending Amount</span>
              </div>
              <span className={styles.statTrend} style={{ color: "#f0806c" }}>
                <FaArrowDown /> 3.1%
              </span>
            </div>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#9b7ede20", color: "#9b7ede" }}
              >
                <FaFileInvoice />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>
                  {revenueData?.totalTransactions || 0}
                </span>
                <span className={styles.statLabel}>Transactions</span>
              </div>
              <span className={styles.statTrend}>
                <FaArrowUp /> 5.4%
              </span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={styles.recentActivity}>
            <h3>Recent Activity</h3>
            <div className={styles.activityList}>
              {recentActivity.map((activity, index) => (
                <div key={index} className={styles.activityItem}>
                  <div
                    className={`${styles.activityIcon} ${activity.type === "income" ? styles.incomeIcon : styles.expenseIcon}`}
                  >
                    {activity.type === "income" ? (
                      <FaArrowUp />
                    ) : (
                      <FaArrowDown />
                    )}
                  </div>
                  <div className={styles.activityContent}>
                    <p>{activity.description}</p>
                    <span>{activity.time}</span>
                  </div>
                  <div className={styles.activityAmount}>
                    <span
                      className={
                        activity.type === "income"
                          ? styles.incomeAmount
                          : styles.expenseAmount
                      }
                    >
                      {activity.type === "income" ? "+" : "-"}{" "}
                      {formatCurrency(activity.amount)}
                    </span>
                    <span className={getStatusBadge(activity.status)}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <button onClick={() => setShowAddModal(true)}>
              <FaPlus /> New Transaction
            </button>
            <button onClick={() => handleExportData("csv")}>
              <FaDownload /> Export Data
            </button>
            <button onClick={() => setActiveTab("transactions")}>
              <FaEye /> View All
            </button>
          </div>
        </div>
      )}

      {/* Transactions Tab - Keep existing code */}
      {activeTab === "transactions" && (
        <div className={styles.tabContent}>
          {/* Filters */}
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <FaSearch />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className={styles.filterSelect}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              className={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <input
              type="date"
              className={styles.dateInput}
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
            />
            <input
              type="date"
              className={styles.dateInput}
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
            />
          </div>

          {/* Transactions Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.transactionTable}>
              <thead>
                <tr>
                  <th
                    onClick={() => {
                      setSortField("date");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    Date{" "}
                    {sortField === "date" &&
                      (sortOrder === "asc" ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      ))}
                  </th>
                  <th>Reference</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th
                    onClick={() => {
                      setSortField("amount");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    Amount{" "}
                    {sortField === "amount" &&
                      (sortOrder === "asc" ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      ))}
                  </th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className={styles.noData}>
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        {new Date(transaction.date).toLocaleDateString("en-IN")}
                      </td>
                      <td>
                        <span className={styles.reference}>
                          {transaction.reference}
                        </span>
                      </td>
                      <td>{transaction.description}</td>
                      <td>
                        <span className={styles.categoryBadge}>
                          {getCategoryLabel(transaction.category)}
                        </span>
                      </td>
                      <td
                        className={
                          transaction.type === "income"
                            ? styles.incomeAmount
                            : styles.expenseAmount
                        }
                      >
                        {transaction.type === "income" ? "+" : "-"}{" "}
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td>
                        {getPaymentIcon(transaction.paymentMethod)}{" "}
                        {transaction.paymentMethod}
                      </td>
                      <td>
                        <span className={getStatusBadge(transaction.status)}>
                          {transaction.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => openEditModal(transaction)}
                            className={styles.editBtn}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => openDeleteModal(transaction)}
                            className={styles.deleteBtn}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className={styles.transactionSummary}>
            <div className={styles.summaryItem}>
              <span>Total Income:</span>
              <span className={styles.incomeAmount}>
                {formatCurrency(
                  filteredTransactions
                    .filter((t) => t.type === "income")
                    .reduce((sum, t) => sum + t.amount, 0),
                )}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Expenses:</span>
              <span className={styles.expenseAmount}>
                {formatCurrency(
                  filteredTransactions
                    .filter((t) => t.type === "expense")
                    .reduce((sum, t) => sum + t.amount, 0),
                )}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span>Net Profit:</span>
              <span className={styles.netProfit}>
                {formatCurrency(
                  filteredTransactions
                    .filter((t) => t.type === "income")
                    .reduce((sum, t) => sum + t.amount, 0) -
                    filteredTransactions
                      .filter((t) => t.type === "expense")
                      .reduce((sum, t) => sum + t.amount, 0),
                )}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Transactions:</span>
              <span>{filteredTransactions.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab - Keep existing code */}
      {activeTab === "trends" && (
        <div className={styles.tabContent}>
          <div className={styles.trendsContainer}>
            <div className={styles.chartCard}>
              <h3>Monthly Revenue Trend</h3>
              <div className={styles.barChart}>
                {monthlyTrend.map((data, index) => {
                  const maxIncome = Math.max(
                    ...monthlyTrend.map((d) => d.income),
                    1,
                  );
                  const maxExpense = Math.max(
                    ...monthlyTrend.map((d) => d.expense),
                    1,
                  );
                  return (
                    <div key={index} className={styles.barGroup}>
                      <div className={styles.barContainer}>
                        <div
                          className={styles.barIncome}
                          style={{
                            height: `${(data.income / maxIncome) * 80}%`,
                          }}
                        />
                        <div
                          className={styles.barExpense}
                          style={{
                            height: `${(data.expense / maxExpense) * 80}%`,
                          }}
                        />
                      </div>
                      <span className={styles.barLabel}>{data.month}</span>
                    </div>
                  );
                })}
              </div>
              <div className={styles.chartLegend}>
                <span>
                  <span
                    className={styles.legendDot}
                    style={{ background: "#5fc98d" }}
                  ></span>{" "}
                  Income
                </span>
                <span>
                  <span
                    className={styles.legendDot}
                    style={{ background: "#f0806c" }}
                  ></span>{" "}
                  Expense
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Sources Tab - Keep existing code */}
      {activeTab === "sources" && (
        <div className={styles.tabContent}>
          <div className={styles.sourcesContainer}>
            <div className={styles.sourcesCard}>
              <h3>Payment Source Distribution</h3>
              <div className={styles.donutChart}>
                <div className={styles.donutWrapper}>
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    {paymentSources.reduce((acc, source, index) => {
                      const startAngle =
                        index === 0
                          ? 0
                          : paymentSources
                              .slice(0, index)
                              .reduce(
                                (sum, s) => sum + (s.value / 100) * 360,
                                0,
                              );
                      const angle = (source.value / 100) * 360;
                      const endAngle = startAngle + angle;
                      const startRad = ((startAngle - 90) * Math.PI) / 180;
                      const endRad = ((endAngle - 90) * Math.PI) / 180;
                      const x1 = 100 + 80 * Math.cos(startRad);
                      const y1 = 100 + 80 * Math.sin(startRad);
                      const x2 = 100 + 80 * Math.cos(endRad);
                      const y2 = 100 + 80 * Math.sin(endRad);
                      const largeArc = angle > 180 ? 1 : 0;

                      const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;

                      acc.push(
                        <path key={index} d={path} fill={source.color} />,
                      );
                      return acc;
                    }, [])}
                    <circle cx="100" cy="100" r="50" fill="#ffffff" />
                    <text
                      x="100"
                      y="105"
                      textAnchor="middle"
                      fontSize="16"
                      fontWeight="700"
                      fill="#16213e"
                    >
                      100%
                    </text>
                  </svg>
                </div>
                <div className={styles.sourceLegend}>
                  {paymentSources.map((source, index) => (
                    <div key={index} className={styles.sourceItem}>
                      <span
                        className={styles.sourceColor}
                        style={{ background: source.color }}
                      ></span>
                      <span className={styles.sourceName}>{source.name}</span>
                      <span className={styles.sourceValue}>
                        {source.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowAddModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                <FaPlus /> Add Transaction
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowAddModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddTransaction}>
              <div className={styles.modalBody}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      required
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                    >
                      <option value="course_fee">Course Fee</option>
                      <option value="placement_fee">Placement Fee</option>
                      <option value="trainer_salary">Trainer Salary</option>
                      <option value="operational">Operational</option>
                      <option value="marketing">Marketing</option>
                      <option value="infrastructure">Infrastructure</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Amount (₹) *</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      placeholder="Enter amount"
                      required
                      min="0"
                      step="1"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Description *</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter description"
                    required
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Payment Method *</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="cash">Cash</option>
                      <option value="online">Online</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="upi">UPI</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      required
                    >
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Reference / Invoice No.</label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={(e) =>
                      setFormData({ ...formData, reference: e.target.value })
                    }
                    placeholder="Enter reference number"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Additional notes"
                    rows="2"
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit">Add Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowEditModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                <FaEdit /> Edit Transaction
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleEditTransaction}>
              <div className={styles.modalBody}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      required
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                    >
                      <option value="course_fee">Course Fee</option>
                      <option value="placement_fee">Placement Fee</option>
                      <option value="trainer_salary">Trainer Salary</option>
                      <option value="operational">Operational</option>
                      <option value="marketing">Marketing</option>
                      <option value="infrastructure">Infrastructure</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Amount (₹) *</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      placeholder="Enter amount"
                      required
                      min="0"
                      step="1"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Description *</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter description"
                    required
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Payment Method *</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="cash">Cash</option>
                      <option value="online">Online</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="upi">UPI</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      required
                    >
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Reference / Invoice No.</label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={(e) =>
                      setFormData({ ...formData, reference: e.target.value })
                    }
                    placeholder="Enter reference number"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Additional notes"
                    rows="2"
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit">Update Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className={`${styles.modal} ${styles.deleteModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>
                <FaTrash /> Delete Transaction
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowDeleteModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.deleteConfirmation}>
                <FaExclamationTriangle className={styles.deleteIcon} />
                <p>Are you sure you want to delete this transaction?</p>
                <p className={styles.deleteDetails}>
                  <strong>{selectedTransaction?.description}</strong>
                  <br />
                  Amount: {formatCurrency(selectedTransaction?.amount || 0)}
                </p>
                <p className={styles.deleteWarning}>
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={handleDeleteTransaction}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueManagement;

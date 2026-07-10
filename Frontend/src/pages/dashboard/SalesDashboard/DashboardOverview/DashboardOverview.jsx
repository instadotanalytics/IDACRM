// DashboardOverview.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FaPhoneAlt,
  FaThumbsUp,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaHandshake,
  FaEnvelopeOpenText,
  FaPhone,
  FaVideo,
  FaTrophy,
  FaClock,
  FaEye,
  FaFilter,
  FaDownload,
  FaChartBar,
  FaCalendarWeek,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import { HiOutlineUsers } from "react-icons/hi";
import { FiTarget } from "react-icons/fi";
import { MdOutlinePendingActions } from "react-icons/md";
import {
  getDashboardStats,
  getRecentActivities,
  getTopPerformers,
  getPipelineOverview,
} from "../salesApi";
import styles from "./DashboardOverview.module.css";

// ─── Defaults ─────────────────────────────────────────────────────────────────
const defaultStats = [
  {
    title: "Today's Calls",
    value: "24",
    icon: <FaPhoneAlt />,
    change: "+8%",
    trend: "up",
  },
  {
    title: "Leads Assigned",
    value: "45",
    icon: <HiOutlineUsers />,
    change: "+12%",
    trend: "up",
  },
  {
    title: "Conversions",
    value: "12",
    icon: <FaThumbsUp />,
    change: "+5%",
    trend: "up",
  },
  {
    title: "Revenue Generated",
    value: "$212,000",
    icon: <FaDollarSign />,
    change: "+18%",
    trend: "up",
  },
  {
    title: "Target Achievement",
    value: "68%",
    icon: <FiTarget />,
    change: "-2%",
    trend: "down",
  },
  {
    title: "Pending Follow-ups",
    value: "18",
    icon: <MdOutlinePendingActions />,
    change: "+3",
    trend: "up",
  },
];

const defaultActivities = [
  {
    _id: "1",
    lead: "Shine Bright",
    action: "Contract signed",
    time: "2 hours ago",
    icon: "deal",
    status: "success",
  },
  {
    _id: "2",
    lead: "Fabricatorz",
    action: "Proposal sent",
    time: "5 hours ago",
    icon: "email",
    status: "pending",
  },
  {
    _id: "3",
    lead: "Inky",
    action: "Demo completed",
    time: "Yesterday",
    icon: "video",
    status: "success",
  },
  {
    _id: "4",
    lead: "AKP",
    action: "Follow-up call",
    time: "Yesterday",
    icon: "call",
    status: "pending",
  },
];

const defaultPerformers = [
  { name: "Alex Jenkin", revenue: "$158,000", deals: 8, avatar: "AJ" },
  { name: "Kelly Smart", revenue: "$215,000", deals: 6, avatar: "KS" },
  { name: "Tamika Marshall", revenue: "$115,000", deals: 5, avatar: "TM" },
  { name: "Jamal King", revenue: "$48,000", deals: 3, avatar: "JK" },
];

const defaultPipeline = [
  {
    status: "🟢",
    primary: "Shine Bright",
    stage: "4 - Contracts",
    amount: "$100,000",
    close: "03/26/21",
    prob: "90%",
    rep: "Alex Jenkin",
  },
  {
    status: "🟢",
    primary: "Fabricatorz",
    stage: "3 - Proposal",
    amount: "$125,000",
    close: "04/01/21",
    prob: "75%",
    rep: "Kelly Smart",
  },
  {
    status: "🟡",
    primary: "Inky",
    stage: "2 - Assessment",
    amount: "$75,000",
    close: "03/11/21",
    prob: "50%",
    rep: "Tamika Marshall",
  },
  {
    status: "🟡",
    primary: "AKP",
    stage: "2 - Assessment",
    amount: "$48,000",
    close: "03/26/21",
    prob: "50%",
    rep: "Jamal King",
  },
  {
    status: "🟢",
    primary: "Cross Time Moving",
    stage: "3 - Proposal",
    amount: "$90,000",
    close: "02/21/21",
    prob: "100%",
    rep: "Kelly Smart",
  },
];

const activityIcons = {
  deal: <FaHandshake />,
  email: <FaEnvelopeOpenText />,
  video: <FaVideo />,
  call: <FaPhone />,
};

// ─── CSV Export ───────────────────────────────────────────────────────────────
const escCsv = (v) => {
  const s = String(v ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
};

const downloadCsv = (rows, filename) => {
  const csv = rows.map((r) => r.map(escCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const exportPipeline = (rows) => {
  const headers = [
    "Status",
    "Primary",
    "Sales Stage",
    "Forecast Amount",
    "Close Date",
    "Probability",
    "Sales Rep",
  ];
  const data = rows.map((r) => [
    r.status.replace(/\p{Emoji}/gu, "").trim() || r.status,
    r.primary,
    r.stage,
    r.amount,
    r.close,
    r.prob,
    r.rep,
  ]);
  downloadCsv(
    [
      [`IDA ERP CRM — Sales Pipeline Overview`],
      [`Generated: ${new Date().toLocaleString()}`],
      [],
      headers,
      ...data,
    ],
    `Pipeline_Overview_${Date.now()}.csv`,
  );
};

// ─── Pipeline Filter helpers ──────────────────────────────────────────────────
const INIT_PIPE_FILTER = { stages: [], reps: [], statuses: [] };

const applyPipeFilter = (rows, f) => {
  let out = [...rows];
  if (f.stages.length) out = out.filter((r) => f.stages.includes(r.stage));
  if (f.reps.length) out = out.filter((r) => f.reps.includes(r.rep));
  if (f.statuses.length) out = out.filter((r) => f.statuses.includes(r.status));
  return out;
};

// ─── Component ────────────────────────────────────────────────────────────────
const DashboardOverview = ({ user, onNavigate }) => {
  const [stats, setStats] = useState(defaultStats);
  const [activities, setActivities] = useState(defaultActivities);
  const [performers, setPerformers] = useState(defaultPerformers);
  const [pipeline, setPipeline] = useState(defaultPipeline);

  // Pipeline feature state
  const [pipeFilter, setPipeFilter] = useState(INIT_PIPE_FILTER);
  const [pendingFilter, setPendingFilter] = useState(INIT_PIPE_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewRow, setViewRow] = useState(null); // detail modal
  const [exporting, setExporting] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, actRes, perfRes, pipeRes] = await Promise.allSettled([
          getDashboardStats(),
          getRecentActivities(),
          getTopPerformers(),
          getPipelineOverview(),
        ]);
        if (statsRes.status === "fulfilled")
          setStats(statsRes.value.data.data || defaultStats);
        if (actRes.status === "fulfilled")
          setActivities(actRes.value.data.data || defaultActivities);
        if (perfRes.status === "fulfilled")
          setPerformers(perfRes.value.data.data || defaultPerformers);
        if (pipeRes.status === "fulfilled")
          setPipeline(pipeRes.value.data.data || defaultPipeline);
      } catch {}
    };
    fetchAll();
  }, []);

  // Close filter on outside click
  useEffect(() => {
    const h = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
    };
    if (filterOpen) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [filterOpen]);

  // Close detail modal on Escape
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") setViewRow(null);
    };
    if (viewRow) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [viewRow]);

  // Live option lists derived from actual pipeline data
  const allStages = useMemo(
    () => [...new Set(pipeline.map((r) => r.stage))],
    [pipeline],
  );
  const allReps = useMemo(
    () => [...new Set(pipeline.map((r) => r.rep))],
    [pipeline],
  );
  const allStatuses = useMemo(
    () => [...new Set(pipeline.map((r) => r.status))],
    [pipeline],
  );

  const filteredPipeline = useMemo(
    () => applyPipeFilter(pipeline, pipeFilter),
    [pipeline, pipeFilter],
  );

  const activeFilterCount = [
    pipeFilter.stages.length > 0,
    pipeFilter.reps.length > 0,
    pipeFilter.statuses.length > 0,
  ].filter(Boolean).length;

  // ─── Filter helpers ───────────────────────────────────────────────────────
  const openFilter = () => {
    setPendingFilter({ ...pipeFilter });
    setFilterOpen(true);
  };

  const toggleOpt = (key, val) => {
    setPendingFilter((prev) => ({
      ...prev,
      [key]: prev[key].includes(val)
        ? prev[key].filter((v) => v !== val)
        : [...prev[key], val],
    }));
  };

  const applyFilter = () => {
    setPipeFilter({ ...pendingFilter });
    setFilterOpen(false);
  };
  const clearFilter = () => {
    setPendingFilter(INIT_PIPE_FILTER);
    setPipeFilter(INIT_PIPE_FILTER);
    setFilterOpen(false);
  };

  // ─── Export ───────────────────────────────────────────────────────────────
  const handleExport = () => {
    setExporting(true);
    try {
      exportPipeline(filteredPipeline);
    } catch {}
    setTimeout(() => setExporting(false), 800);
  };

  const firstName = user?.name?.split(" ")[0] || "Sales Executive";

  return (
    <div className={styles.container}>
      {/* Welcome */}
      <div className={styles.welcome}>
        <div>
          <h1>Welcome back, {firstName}! 👋</h1>
          <p>Here's what's happening with your sales today.</p>
        </div>
        <div className={styles.dateChip}>
          <FaCalendarWeek />
          <span>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {stats.map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statIcon}>{s.icon}</div>
            <div className={styles.statBody}>
              <span className={styles.statTitle}>{s.title}</span>
              <span className={styles.statValue}>{s.value}</span>
              <span className={`${styles.statChange} ${styles[s.trend]}`}>
                {s.trend === "up" ? <FaArrowUp /> : <FaArrowDown />} {s.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Two col */}
      <div className={styles.twoCol}>
        {/* Recent Activities */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>
              <FaClock /> Recent Activities
            </h3>
            <button
              className={styles.viewAllBtn}
              onClick={() => onNavigate && onNavigate("calls")}
            >
              View All <FaEye />
            </button>
          </div>
          <div className={styles.activityList}>
            {activities.map((a) => (
              <div key={a._id} className={styles.activityItem}>
                <div className={`${styles.actIcon} ${styles[a.status]}`}>
                  {activityIcons[a.icon] || <FaHandshake />}
                </div>
                <div className={styles.actBody}>
                  <span className={styles.actLead}>{a.lead}</span>
                  <span className={styles.actAction}>{a.action}</span>
                </div>
                <span className={styles.actTime}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>
              <FaTrophy /> Top Performers
            </h3>
            <button
              className={styles.viewAllBtn}
              onClick={() => onNavigate && onNavigate("targets")}
            >
              View All <FaEye />
            </button>
          </div>
          <div className={styles.perfList}>
            {performers.map((p, i) => (
              <div key={i} className={styles.perfItem}>
                <span className={styles.rank}>#{i + 1}</span>
                <div className={styles.perfAvatar}>{p.avatar}</div>
                <div className={styles.perfInfo}>
                  <span className={styles.perfName}>{p.name}</span>
                  <span className={styles.perfDeals}>{p.deals} deals</span>
                </div>
                <span className={styles.perfRev}>
                  <FaDollarSign />
                  {p.revenue}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Pipeline Table ─── */}
      <div className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleRow}>
            <h3>
              <FaChartBar /> Sales Pipeline Overview
            </h3>
            {activeFilterCount > 0 && (
              <span className={styles.filterBadge}>
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className={styles.cardActions} ref={filterRef}>
            {/* ── Filter Button ── */}
            <button
              className={`${styles.actionChip} ${filterOpen ? styles.actionChipActive : ""} ${activeFilterCount > 0 ? styles.actionChipDirty : ""}`}
              onClick={openFilter}
            >
              <FaFilter /> Filter
              {activeFilterCount > 0 && (
                <span className={styles.chipDot}>{activeFilterCount}</span>
              )}
            </button>

            {/* ── Export Button ── */}
            <button
              className={styles.actionChip}
              onClick={handleExport}
              disabled={exporting}
            >
              <FaDownload /> {exporting ? "Exporting..." : "Export"}
            </button>

            {/* ── Filter Panel ── */}
            {filterOpen && (
              <div className={styles.filterPanel}>
                <div className={styles.filterPanelHeader}>
                  <span>Filter Pipeline</span>
                  <button
                    className={styles.filterPanelClose}
                    onClick={() => setFilterOpen(false)}
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Stage */}
                <div className={styles.filterSection}>
                  <label className={styles.filterLabel}>Sales Stage</label>
                  <div className={styles.checkList}>
                    {allStages.map((s) => {
                      const checked = pendingFilter.stages.includes(s);
                      return (
                        <label key={s} className={styles.checkRow}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleOpt("stages", s)}
                          />
                          <span
                            className={`${styles.checkBox} ${checked ? styles.checkBoxOn : ""}`}
                          >
                            {checked && <FaCheckCircle />}
                          </span>
                          <span>{s}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Rep */}
                <div className={styles.filterSection}>
                  <label className={styles.filterLabel}>Sales Rep</label>
                  <div className={styles.checkList}>
                    {allReps.map((r) => {
                      const checked = pendingFilter.reps.includes(r);
                      return (
                        <label key={r} className={styles.checkRow}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleOpt("reps", r)}
                          />
                          <span
                            className={`${styles.checkBox} ${checked ? styles.checkBoxOn : ""}`}
                          >
                            {checked && <FaCheckCircle />}
                          </span>
                          <span>{r}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Status */}
                <div className={styles.filterSection}>
                  <label className={styles.filterLabel}>Status</label>
                  <div className={styles.checkList}>
                    {allStatuses.map((s) => {
                      const checked = pendingFilter.statuses.includes(s);
                      return (
                        <label key={s} className={styles.checkRow}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleOpt("statuses", s)}
                          />
                          <span
                            className={`${styles.checkBox} ${checked ? styles.checkBoxOn : ""}`}
                          >
                            {checked && <FaCheckCircle />}
                          </span>
                          <span>{s}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.filterPanelFooter}>
                  <button className={styles.clearBtn} onClick={clearFilter}>
                    Clear All
                  </button>
                  <button className={styles.applyBtn} onClick={applyFilter}>
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Primary</th>
                <th>Sales Stage</th>
                <th>Forecast</th>
                <th>Close Date</th>
                <th>Probability</th>
                <th>Sales Rep</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPipeline.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyRow}>
                    No results match the current filters.
                  </td>
                </tr>
              ) : (
                filteredPipeline.map((row, i) => (
                  <tr
                    key={i}
                    className={styles.clickableRow}
                    onClick={() => setViewRow(row)}
                  >
                    <td>{row.status}</td>
                    <td>
                      <strong>{row.primary}</strong>
                    </td>
                    <td>{row.stage}</td>
                    <td>{row.amount}</td>
                    <td>{row.close}</td>
                    <td>{row.prob}</td>
                    <td>{row.rep}</td>
                    <td>
                      <button
                        className={styles.eyeBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewRow(row);
                        }}
                        title="View details"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Detail Modal ─── */}
      {viewRow && (
        <div className={styles.modalOverlay} onClick={() => setViewRow(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <span className={styles.modalEmoji}>{viewRow.status}</span>
                <h3>{viewRow.primary}</h3>
              </div>
              <button
                className={styles.modalClose}
                onClick={() => setViewRow(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.stageBadge}>{viewRow.stage}</div>

              <div className={styles.detailGrid}>
                {[
                  {
                    label: "Forecast Amount",
                    value: viewRow.amount,
                    highlight: true,
                  },
                  { label: "Probability", value: viewRow.prob },
                  { label: "Close Date", value: viewRow.close },
                  { label: "Sales Rep", value: viewRow.rep },
                  { label: "Sales Stage", value: viewRow.stage },
                  { label: "Status", value: viewRow.status },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className={styles.detailRow}>
                    <span className={styles.detailLabel}>{label}</span>
                    <span
                      className={`${styles.detailValue} ${highlight ? styles.detailHighlight : ""}`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.modalSecBtn}
                onClick={() => setViewRow(null)}
              >
                Close
              </button>
              <button
                className={styles.modalPrimBtn}
                onClick={() => {
                  onNavigate && onNavigate("pipeline");
                  setViewRow(null);
                }}
              >
                View in Pipeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;

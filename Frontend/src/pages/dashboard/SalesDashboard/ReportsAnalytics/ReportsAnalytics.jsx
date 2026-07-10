// ReportsAnalytics.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FaFileAlt,
  FaDownload,
  FaChartPie,
  FaWallet,
  FaFilter,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import { IoIosTrendingUp } from "react-icons/io";
import {
  getSalesPerformanceReport,
  getRevenueBySource,
  getMonthlyTrend,
} from "../salesApi";
import styles from "./ReportsAnalytics.module.css";

const defaultRevSource = [
  { label: "Website", pct: 45, color: "#810b38" },
  { label: "Referral", pct: 25, color: "#9b59b6" },
  { label: "LinkedIn", pct: 20, color: "#3498db" },
  { label: "Email", pct: 10, color: "#2ecc71" },
];

const defaultMonthly = [
  { month: "Jan", value: 60 },
  { month: "Feb", value: 75 },
  { month: "Mar", value: 45 },
  { month: "Apr", value: 85 },
  { month: "May", value: 70 },
  { month: "Jun", value: 90 },
];

const defaultProfit = { total: "$92,500", avgPerDeal: "$3,703", margin: "32%" };

const defaultPerf = [
  {
    name: "Alex Jenkin",
    leads: 12,
    calls: 45,
    meetings: 8,
    proposals: 5,
    closed: 4,
    revenue: "$158,000",
  },
  {
    name: "Kelly Smart",
    leads: 10,
    calls: 38,
    meetings: 7,
    proposals: 6,
    closed: 5,
    revenue: "$215,000",
  },
  {
    name: "Tamika Marshall",
    leads: 8,
    calls: 32,
    meetings: 5,
    proposals: 4,
    closed: 3,
    revenue: "$115,000",
  },
  {
    name: "Jamal King",
    leads: 6,
    calls: 25,
    meetings: 3,
    proposals: 2,
    closed: 2,
    revenue: "$48,000",
  },
];

// ─── Export Helpers ───────────────────────────────────────────────────────────
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

const buildExportRows = (perf, revSource, monthly, dateRange) => {
  const rows = [];
  rows.push([`IDA ERP CRM — Sales Report (${dateRange})`]);
  rows.push([`Generated: ${new Date().toLocaleString()}`]);
  rows.push([]);
  rows.push(["SALES PERFORMANCE"]);
  rows.push([
    "Sales Rep",
    "Leads",
    "Calls",
    "Meetings",
    "Proposals",
    "Closed",
    "Revenue",
    "Conv. Rate %",
  ]);
  perf.forEach((r) => {
    const convRate = r.leads > 0 ? Math.round((r.closed / r.leads) * 100) : 0;
    rows.push([
      r.name,
      r.leads,
      r.calls,
      r.meetings,
      r.proposals,
      r.closed,
      r.revenue,
      `${convRate}%`,
    ]);
  });
  rows.push([]);
  rows.push(["REVENUE BY SOURCE"]);
  rows.push(["Source", "Percentage"]);
  revSource.forEach((s) => rows.push([s.label, `${s.pct}%`]));
  rows.push([]);
  rows.push(["MONTHLY TREND"]);
  rows.push(["Month", "Value"]);
  monthly.forEach((m) => rows.push([m.month, m.value]));
  return rows;
};

// ─── Filter Helpers ───────────────────────────────────────────────────────────
const INITIAL_FILTERS = {
  reps: [], // [] = all reps shown
  minClosed: "",
  minRevenue: "",
  sortBy: "revenue",
  sortDir: "desc",
};

const applyFilters = (data, filters) => {
  let rows = [...data];

  if (filters.reps.length > 0) {
    rows = rows.filter((r) => filters.reps.includes(r.name));
  }
  if (filters.minClosed !== "") {
    rows = rows.filter((r) => r.closed >= Number(filters.minClosed));
  }
  if (filters.minRevenue !== "") {
    const threshold = parseFloat(
      String(filters.minRevenue).replace(/[$,]/g, ""),
    );
    rows = rows.filter((r) => {
      const rev = parseFloat(String(r.revenue).replace(/[$,]/g, ""));
      return rev >= threshold;
    });
  }

  const dir = filters.sortDir === "asc" ? 1 : -1;
  rows.sort((a, b) => {
    if (filters.sortBy === "revenue") {
      const av = parseFloat(String(a.revenue).replace(/[$,]/g, ""));
      const bv = parseFloat(String(b.revenue).replace(/[$,]/g, ""));
      return (av - bv) * dir;
    }
    if (filters.sortBy === "leads") return (a.leads - b.leads) * dir;
    if (filters.sortBy === "closed") return (a.closed - b.closed) * dir;
    if (filters.sortBy === "convRate") {
      const ar = a.leads > 0 ? a.closed / a.leads : 0;
      const br = b.leads > 0 ? b.closed / b.leads : 0;
      return (ar - br) * dir;
    }
    return 0;
  });

  return rows;
};

const ReportsAnalytics = () => {
  const [revSource, setRevSource] = useState(defaultRevSource);
  const [monthly, setMonthly] = useState(defaultMonthly);
  const [profit, setProfit] = useState(defaultProfit);
  const [perf, setPerf] = useState(defaultPerf);
  const [dateRange, setDateRange] = useState("This Month");

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [pendingFilters, setPendingFilters] = useState(INITIAL_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const filterRef = useRef(null);

  // ─── KEY FIX: derive rep names from live `perf` state, not defaultPerf ────
  // Whenever the API returns new data (different rep names), this list
  // automatically updates to match what's actually in the table.
  const liveRepNames = useMemo(
    () => [...new Set(perf.map((p) => p.name))],
    [perf],
  );

  // When perf data changes (new API data = new rep names), clear any stale
  // rep selections that no longer exist in the new dataset.
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      reps: prev.reps.filter((r) => liveRepNames.includes(r)),
    }));
    setPendingFilters((prev) => ({
      ...prev,
      reps: prev.reps.filter((r) => liveRepNames.includes(r)),
    }));
  }, [liveRepNames]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [srcRes, trendRes, perfRes] = await Promise.allSettled([
          getRevenueBySource(),
          getMonthlyTrend(),
          getSalesPerformanceReport(),
        ]);
        if (srcRes.status === "fulfilled" && srcRes.value.data?.data)
          setRevSource(srcRes.value.data.data);
        if (trendRes.status === "fulfilled" && trendRes.value.data?.data)
          setMonthly(trendRes.value.data.data);
        if (perfRes.status === "fulfilled" && perfRes.value.data?.data)
          setPerf(perfRes.value.data.data);
      } catch {}
    };
    fetchData();
  }, [dateRange]);

  // Close filter panel on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [filterOpen]);

  const maxBar = Math.max(...monthly.map((m) => m.value), 1);
  const filteredPerf = applyFilters(perf, filters);

  const activeFilterCount = [
    filters.reps.length > 0,
    filters.minClosed !== "",
    filters.minRevenue !== "",
    filters.sortBy !== "revenue" || filters.sortDir !== "desc",
  ].filter(Boolean).length;

  // ─── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    setExporting(true);
    try {
      const rows = buildExportRows(filteredPerf, revSource, monthly, dateRange);
      const filename = `IDA_Sales_Report_${dateRange.replace(/\s+/g, "_")}_${Date.now()}.csv`;
      downloadCsv(rows, filename);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setTimeout(() => setExporting(false), 800);
    }
  };

  // ─── Filter panel actions ──────────────────────────────────────────────────
  const openFilter = () => {
    setPendingFilters({ ...filters });
    setFilterOpen(true);
  };

  const toggleRep = (name) => {
    setPendingFilters((prev) => ({
      ...prev,
      reps: prev.reps.includes(name)
        ? prev.reps.filter((r) => r !== name)
        : [...prev.reps, name],
    }));
  };

  const selectAllReps = () => {
    setPendingFilters((prev) => ({ ...prev, reps: [] }));
  };

  const applyPending = () => {
    setFilters({ ...pendingFilters });
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setPendingFilters(INITIAL_FILTERS);
    setFilters(INITIAL_FILTERS);
    setFilterOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          <FaFileAlt /> Reports &amp; Analytics
        </h2>
        <div className={styles.headerBtns}>
          <select
            className={styles.dateSelect}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            {["This Week", "This Month", "This Quarter", "This Year"].map(
              (r) => (
                <option key={r}>{r}</option>
              ),
            )}
          </select>
          <button
            className={styles.primaryBtn}
            onClick={handleExport}
            disabled={exporting}
          >
            <FaDownload />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* ─── Charts ─── */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartIcon}>
            <FaChartPie />
          </div>
          <h4>Revenue by Source</h4>
          <div className={styles.sourceList}>
            {revSource.map((s, i) => (
              <div key={i} className={styles.sourceItem}>
                <div className={styles.sourceBar}>
                  <div
                    className={styles.sourceFill}
                    style={{ width: `${s.pct}%`, background: s.color }}
                  />
                </div>
                <div className={styles.sourceMeta}>
                  <span
                    className={styles.sourceDot}
                    style={{ background: s.color }}
                  />
                  <span className={styles.sourceLabel}>{s.label}</span>
                  <span className={styles.sourcePct}>{s.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartIcon}>
            <IoIosTrendingUp />
          </div>
          <h4>Monthly Revenue Trend</h4>
          <div className={styles.barChart}>
            {monthly.map((m, i) => (
              <div key={i} className={styles.barGroup}>
                <div className={styles.barWrap}>
                  <div
                    className={styles.bar}
                    style={{ height: `${(m.value / maxBar) * 100}%` }}
                    title={`${m.month}: ${m.value}`}
                  />
                </div>
                <span className={styles.barLabel}>{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartIcon}>
            <FaWallet />
          </div>
          <h4>Profit Analysis</h4>
          <div className={styles.kpiList}>
            {[
              { label: "Total Profit", value: profit.total },
              { label: "Avg Profit / Deal", value: profit.avgPerDeal },
              { label: "Profit Margin", value: profit.margin },
            ].map((k, i) => (
              <div key={i} className={styles.kpiItem}>
                <span className={styles.kpiLabel}>{k.label}</span>
                <strong className={styles.kpiValue}>{k.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Performance Table ─── */}
      <div className={styles.tableCard}>
        <div className={styles.tableTop}>
          <div className={styles.tableTopLeft}>
            <h3>Sales Performance Report</h3>
            {activeFilterCount > 0 && (
              <span className={styles.activeFilterBadge}>
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}{" "}
                applied
              </span>
            )}
          </div>

          <div className={styles.tableActions} ref={filterRef}>
            <button
              className={`${styles.filterBtn} ${filterOpen ? styles.filterBtnActive : ""} ${activeFilterCount > 0 ? styles.filterBtnDirty : ""}`}
              onClick={openFilter}
            >
              <FaFilter />
              Filter
              {activeFilterCount > 0 && (
                <span className={styles.filterDot}>{activeFilterCount}</span>
              )}
            </button>

            {/* ─── Filter Panel ─── */}
            {filterOpen && (
              <div className={styles.filterPanel}>
                <div className={styles.filterPanelHeader}>
                  <span>Filter &amp; Sort</span>
                  <button
                    className={styles.filterPanelClose}
                    onClick={() => setFilterOpen(false)}
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* ── Sales Rep — built from liveRepNames, matches the actual table ── */}
                <div className={styles.filterSection}>
                  <div className={styles.filterLabelRow}>
                    <label className={styles.filterLabel}>Sales Rep</label>
                    {pendingFilters.reps.length > 0 && (
                      <button
                        className={styles.selectAllBtn}
                        onClick={selectAllReps}
                      >
                        Show All
                      </button>
                    )}
                  </div>
                  <div className={styles.repCheckList}>
                    {liveRepNames.map((rep) => {
                      const checked = pendingFilters.reps.includes(rep);
                      return (
                        <label key={rep} className={styles.repCheck}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleRep(rep)}
                          />
                          <span
                            className={`${styles.checkBox} ${checked ? styles.checkBoxChecked : ""}`}
                          >
                            {checked && <FaCheckCircle />}
                          </span>
                          <span className={styles.repName}>{rep}</span>
                        </label>
                      );
                    })}
                  </div>
                  {pendingFilters.reps.length > 0 && (
                    <p className={styles.repHint}>
                      {pendingFilters.reps.length} of {liveRepNames.length}{" "}
                      selected
                    </p>
                  )}
                </div>

                {/* Min Closed Deals */}
                <div className={styles.filterSection}>
                  <label className={styles.filterLabel}>
                    Min. Deals Closed
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={styles.filterInput}
                    placeholder="e.g. 3"
                    value={pendingFilters.minClosed}
                    onChange={(e) =>
                      setPendingFilters((p) => ({
                        ...p,
                        minClosed: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Min Revenue */}
                <div className={styles.filterSection}>
                  <label className={styles.filterLabel}>Min. Revenue ($)</label>
                  <input
                    type="number"
                    min="0"
                    className={styles.filterInput}
                    placeholder="e.g. 100000"
                    value={pendingFilters.minRevenue}
                    onChange={(e) =>
                      setPendingFilters((p) => ({
                        ...p,
                        minRevenue: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Sort By */}
                <div className={styles.filterSection}>
                  <label className={styles.filterLabel}>Sort By</label>
                  <div className={styles.sortRow}>
                    <select
                      className={styles.filterSelect}
                      value={pendingFilters.sortBy}
                      onChange={(e) =>
                        setPendingFilters((p) => ({
                          ...p,
                          sortBy: e.target.value,
                        }))
                      }
                    >
                      <option value="revenue">Revenue</option>
                      <option value="leads">Leads</option>
                      <option value="closed">Deals Closed</option>
                      <option value="convRate">Conv. Rate</option>
                    </select>
                    <select
                      className={styles.filterSelect}
                      value={pendingFilters.sortDir}
                      onChange={(e) =>
                        setPendingFilters((p) => ({
                          ...p,
                          sortDir: e.target.value,
                        }))
                      }
                    >
                      <option value="desc">High → Low</option>
                      <option value="asc">Low → High</option>
                    </select>
                  </div>
                </div>

                <div className={styles.filterPanelFooter}>
                  <button className={styles.clearBtn} onClick={clearFilters}>
                    Clear All
                  </button>
                  <button className={styles.applyBtn} onClick={applyPending}>
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sales Rep</th>
                <th>Leads</th>
                <th>Calls</th>
                <th>Meetings</th>
                <th>Proposals</th>
                <th>Closed</th>
                <th>Revenue</th>
                <th>Conv. Rate</th>
              </tr>
            </thead>
            <tbody>
              {filteredPerf.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyRow}>
                    No results match the current filters.
                  </td>
                </tr>
              ) : (
                filteredPerf.map((rep, i) => {
                  const convRate =
                    rep.leads > 0
                      ? Math.round((rep.closed / rep.leads) * 100)
                      : 0;
                  return (
                    <tr key={i}>
                      <td>
                        <strong>{rep.name}</strong>
                      </td>
                      <td>{rep.leads}</td>
                      <td>{rep.calls}</td>
                      <td>{rep.meetings}</td>
                      <td>{rep.proposals}</td>
                      <td>
                        <span className={styles.closedBadge}>{rep.closed}</span>
                      </td>
                      <td>
                        <strong className={styles.revText}>
                          {rep.revenue}
                        </strong>
                      </td>
                      <td>
                        <div className={styles.convBar}>
                          <div
                            className={styles.convFill}
                            style={{ width: `${convRate}%` }}
                          />
                          <span>{convRate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;

// TargetsTracker.jsx
import React, { useState, useEffect } from "react";
import { FiTarget } from "react-icons/fi";
import {
  FaPlus,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
} from "react-icons/fa";
import {
  getTargets,
  createTarget,
  updateTarget,
  getRepPerformance,
} from "../salesApi";
import { toast } from "react-hot-toast";
import styles from "./TargetsTracker.module.css";

const emptyTarget = {
  metric: "",
  target: "",
  achieved: "",
  rep: "Team Total",
  period: "Monthly",
};

const defaultTargets = [
  {
    _id: "1",
    metric: "Monthly Revenue",
    target: "$500,000",
    achieved: "$325,000",
    percentage: 65,
    rep: "Team Total",
    period: "Monthly",
  },
  {
    _id: "2",
    metric: "New Customers",
    target: "50",
    achieved: "32",
    percentage: 64,
    rep: "Team Total",
    period: "Monthly",
  },
  {
    _id: "3",
    metric: "Calls Made",
    target: "500",
    achieved: "380",
    percentage: 76,
    rep: "Team Total",
    period: "Monthly",
  },
  {
    _id: "4",
    metric: "Deals Closed",
    target: "40",
    achieved: "28",
    percentage: 70,
    rep: "Team Total",
    period: "Monthly",
  },
];

const defaultRepPerf = [
  {
    name: "Alex Jenkin",
    revenue: "$158,000",
    target: "$200,000",
    percentage: 79,
    deals: 8,
  },
  {
    name: "Kelly Smart",
    revenue: "$215,000",
    target: "$250,000",
    percentage: 86,
    deals: 6,
  },
  {
    name: "Tamika Marshall",
    revenue: "$115,000",
    target: "$150,000",
    percentage: 77,
    deals: 5,
  },
  {
    name: "Jamal King",
    revenue: "$48,000",
    target: "$80,000",
    percentage: 60,
    deals: 3,
  },
];

const TargetsTracker = () => {
  const [targets, setTargets] = useState(defaultTargets);
  const [repPerf, setRepPerf] = useState(defaultRepPerf);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyTarget);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [tRes, rRes] = await Promise.allSettled([
          getTargets(),
          getRepPerformance(),
        ]);
        if (tRes.status === "fulfilled" && tRes.value.data?.data?.length > 0)
          setTargets(tRes.value.data.data);
        if (rRes.status === "fulfilled" && rRes.value.data?.data?.length > 0)
          setRepPerf(rRes.value.data.data);
      } catch {}
    };
    fetch();
  }, []);

  const calcPct = (achieved, target) => {
    const a = parseFloat(String(achieved).replace(/[$,]/g, "")) || 0;
    const t = parseFloat(String(target).replace(/[$,]/g, "")) || 1;
    return Math.min(Math.round((a / t) * 100), 100);
  };

  const openAdd = () => {
    setForm(emptyTarget);
    setEditTarget(null);
    setModalOpen(true);
  };
  const openEdit = (t) => {
    setForm({ ...t });
    setEditTarget(t);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
    setForm(emptyTarget);
  };

  const handleSubmit = async () => {
    if (!form.metric || !form.target)
      return toast.error("Metric and target are required");
    const pct = calcPct(form.achieved, form.target);
    setLoading(true);
    try {
      if (editTarget) {
        const res = await updateTarget(editTarget._id, {
          ...form,
          percentage: pct,
        });
        const updated = res.data?.data || {
          ...editTarget,
          ...form,
          percentage: pct,
        };
        setTargets((prev) =>
          prev.map((t) => (t._id === editTarget._id ? updated : t)),
        );
        toast.success("Target updated");
      } else {
        const res = await createTarget({ ...form, percentage: pct });
        const newT = res.data?.data || {
          ...form,
          percentage: pct,
          _id: Date.now().toString(),
        };
        setTargets((prev) => [newT, ...prev]);
        toast.success("Target set");
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setTargets((prev) => prev.filter((t) => t._id !== id));
    toast.success("Target removed");
    setDeleteConfirm(null);
  };

  const getBarColor = (pct) =>
    pct >= 80 ? "#10b981" : pct >= 50 ? "#810b38" : "#f59e0b";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          <FiTarget /> Targets &amp; Achievements
        </h2>
        <button className={styles.primaryBtn} onClick={openAdd}>
          <FaPlus /> Set Target
        </button>
      </div>

      {/* Target Cards */}
      <div className={styles.targetsGrid}>
        {targets.map((t) => {
          const pct = t.percentage ?? calcPct(t.achieved, t.target);
          return (
            <div key={t._id} className={styles.targetCard}>
              <div className={styles.cardTop}>
                <div>
                  <span className={styles.metricName}>{t.metric}</span>
                  <span className={styles.metricPeriod}>{t.period}</span>
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={styles.iconBtn}
                    onClick={() => openEdit(t)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className={`${styles.iconBtn} ${styles.delBtn}`}
                    onClick={() => setDeleteConfirm(t._id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className={styles.values}>
                <span>{t.achieved}</span>
                <span className={styles.slash}>/</span>
                <span className={styles.targetVal}>{t.target}</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${pct}%`, background: getBarColor(pct) }}
                />
              </div>
              <div className={styles.cardBottom}>
                <span
                  className={styles.pctLabel}
                  style={{ color: getBarColor(pct) }}
                >
                  {pct}% achieved
                </span>
                <span className={styles.repLabel}>{t.rep}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rep Performance Table */}
      <div className={styles.tableCard}>
        <h3>Sales Rep Performance</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sales Rep</th>
                <th>Revenue</th>
                <th>Target</th>
                <th>Achievement</th>
                <th>Deals</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {repPerf.map((rep, i) => (
                <tr key={i}>
                  <td>
                    <strong>{rep.name}</strong>
                  </td>
                  <td>{rep.revenue}</td>
                  <td>{rep.target}</td>
                  <td>
                    <div className={styles.inlineBar}>
                      <div
                        className={styles.inlineFill}
                        style={{
                          width: `${rep.percentage}%`,
                          background: getBarColor(rep.percentage),
                        }}
                      />
                      <span>{rep.percentage}%</span>
                    </div>
                  </td>
                  <td>{rep.deals}</td>
                  <td>
                    {rep.percentage >= 80 ? (
                      <FaCheckCircle style={{ color: "#10b981" }} />
                    ) : (
                      <FaClock style={{ color: "#f59e0b" }} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editTarget ? "Edit Target" : "Set New Target"}</h3>
              <button className={styles.modalClose} onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Metric Name *</label>
                  <input
                    value={form.metric}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, metric: e.target.value }))
                    }
                    placeholder="e.g. Monthly Revenue"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Target Value *</label>
                  <input
                    value={form.target}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, target: e.target.value }))
                    }
                    placeholder="e.g. $500,000 or 50"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Achieved So Far</label>
                  <input
                    value={form.achieved}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, achieved: e.target.value }))
                    }
                    placeholder="e.g. $325,000 or 32"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Sales Rep / Team</label>
                  <input
                    value={form.rep}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, rep: e.target.value }))
                    }
                    placeholder="Team Total"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Period</label>
                  <select
                    value={form.period}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, period: e.target.value }))
                    }
                  >
                    {["Weekly", "Monthly", "Quarterly", "Yearly"].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>
                Cancel
              </button>
              <button
                className={styles.primaryBtn}
                onClick={handleSubmit}
                disabled={loading}
              >
                <FaSave />{" "}
                {loading ? "Saving..." : editTarget ? "Update" : "Set Target"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Remove Target?</h4>
            <p>This cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(deleteConfirm)}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TargetsTracker;

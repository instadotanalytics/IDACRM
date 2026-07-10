// SalesPipeline.jsx
import React, { useState, useEffect } from "react";
import {
  FaChartLine,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaBuilding,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  getPipeline,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from "../salesApi";
import { toast } from "react-hot-toast";
import styles from "./SalesPipeline.module.css";

const stageList = [
  "Prospect",
  "Assessment",
  "Proposal",
  "Contracts",
  "Closed Won",
  "Closed Lost",
];
const stageColors = {
  Prospect: "#810b38",
  Assessment: "#9b59b6",
  Proposal: "#3498db",
  Contracts: "#2ecc71",
  "Closed Won": "#27ae60",
  "Closed Lost": "#e74c3c",
};

const emptyForm = {
  name: "",
  company: "",
  stage: "Prospect",
  value: "",
  probability: "30%",
  closeDate: "",
  rep: "",
  notes: "",
};

const defaultDeals = [
  {
    _id: "1",
    name: "Transland Shipping",
    company: "Transland",
    stage: "Prospect",
    value: "$55,000",
    probability: "30%",
    closeDate: "2026-07-15",
    rep: "Alex Jenkin",
    notes: "",
  },
  {
    _id: "2",
    name: "Metro Logistics",
    company: "Metro Co",
    stage: "Prospect",
    value: "$45,000",
    probability: "25%",
    closeDate: "2026-07-20",
    rep: "Kelly Smart",
    notes: "",
  },
  {
    _id: "3",
    name: "Inky Deal",
    company: "Inky",
    stage: "Assessment",
    value: "$75,000",
    probability: "50%",
    closeDate: "2026-08-01",
    rep: "Tamika Marshall",
    notes: "",
  },
  {
    _id: "4",
    name: "AKP Project",
    company: "AKP",
    stage: "Assessment",
    value: "$48,000",
    probability: "50%",
    closeDate: "2026-08-10",
    rep: "Jamal King",
    notes: "",
  },
  {
    _id: "5",
    name: "Fabricatorz ERP",
    company: "Fabricatorz",
    stage: "Proposal",
    value: "$125,000",
    probability: "75%",
    closeDate: "2026-07-30",
    rep: "Kelly Smart",
    notes: "",
  },
  {
    _id: "6",
    name: "Cross Time Moving",
    company: "Cross Time",
    stage: "Proposal",
    value: "$90,000",
    probability: "80%",
    closeDate: "2026-08-05",
    rep: "Kelly Smart",
    notes: "",
  },
  {
    _id: "7",
    name: "Shine Bright CRM",
    company: "Shine Bright",
    stage: "Contracts",
    value: "$100,000",
    probability: "90%",
    closeDate: "2026-07-25",
    rep: "Alex Jenkin",
    notes: "",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const parseValue = (val) =>
  parseFloat(String(val || "0").replace(/[^0-9.]/g, "")) || 0;
const formatCurrency = (val) => `$${parseValue(val).toLocaleString()}`;
const parseProbability = (val) =>
  parseFloat(String(val || "0").replace(/[^0-9.]/g, "")) || 0;
const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const SalesPipeline = () => {
  const [deals, setDeals] = useState(defaultDeals);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [viewDeal, setViewDeal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await getPipeline();
        if (res.data?.data?.length > 0) setDeals(res.data.data);
      } catch {}
    };
    fetchDeals();
  }, []);

  const dealsByStage = (stage) => deals.filter((d) => d.stage === stage);
  const totalPipelineValue = deals.reduce(
    (sum, d) => sum + parseValue(d.value),
    0,
  );

  const openAdd = () => {
    setForm(emptyForm);
    setEditDeal(null);
    setModalOpen(true);
  };
  const openEdit = (deal) => {
    setForm({ ...deal });
    setEditDeal(deal);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditDeal(null);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.stage)
      return toast.error("Deal name and stage are required");
    setLoading(true);
    try {
      // Normalize value/probability before saving so display is always consistent
      const payload = {
        ...form,
        value: formatCurrency(form.value),
        probability: `${parseProbability(form.probability)}%`,
      };
      if (editDeal) {
        const res = await updateOpportunity(editDeal._id, payload);
        const updated = res.data?.data || { ...editDeal, ...payload };
        setDeals((prev) =>
          prev.map((d) => (d._id === editDeal._id ? updated : d)),
        );
        toast.success("Deal updated");
      } else {
        const res = await createOpportunity(payload);
        const newDeal = res.data?.data || {
          ...payload,
          _id: Date.now().toString(),
        };
        setDeals((prev) => [newDeal, ...prev]);
        toast.success("Opportunity created");
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOpportunity(id);
      setDeals((prev) => prev.filter((d) => d._id !== id));
      toast.success("Opportunity removed");
    } catch {
      toast.error("Delete failed");
    }
    setDeleteConfirm(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>
            <FaChartLine /> Sales Pipeline
          </h2>
          <p className={styles.subtext}>
            Total pipeline value:{" "}
            <strong>${totalPipelineValue.toLocaleString()}</strong>
          </p>
        </div>
        <button className={styles.primaryBtn} onClick={openAdd}>
          <FaPlus /> New Opportunity
        </button>
      </div>

      {/* Kanban Columns */}
      <div className={styles.kanban}>
        {stageList.map((stage) => {
          const stageDeals = dealsByStage(stage);
          const stageTotal = stageDeals.reduce(
            (s, d) => s + parseValue(d.value),
            0,
          );
          const color = stageColors[stage];
          return (
            <div key={stage} className={styles.column}>
              <div
                className={styles.colHeader}
                style={{ "--stage-color": color }}
              >
                <div className={styles.colTitleRow}>
                  <span
                    className={styles.colDot}
                    style={{ background: color }}
                  />
                  <span className={styles.colTitle}>{stage}</span>
                </div>
                <div className={styles.colMeta}>
                  <span className={styles.colCount}>
                    {stageDeals.length} deal{stageDeals.length !== 1 ? "s" : ""}
                  </span>
                  <span className={styles.colValue}>
                    ${stageTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className={styles.cards}>
                {stageDeals.map((deal) => {
                  const prob = parseProbability(deal.probability);
                  return (
                    <div
                      key={deal._id}
                      className={styles.dealCard}
                      style={{ "--stage-color": color }}
                    >
                      <div className={styles.dealActions}>
                        <button
                          className={styles.iconBtn}
                          onClick={() => setViewDeal(deal)}
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          className={`${styles.iconBtn} ${styles.editBtn}`}
                          onClick={() => openEdit(deal)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={`${styles.iconBtn} ${styles.delBtn}`}
                          onClick={() => setDeleteConfirm(deal._id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>

                      <span className={styles.dealName}>{deal.name}</span>

                      {deal.company && (
                        <span className={styles.dealCompany}>
                          <FaBuilding /> {deal.company}
                        </span>
                      )}

                      <div className={styles.dealValueRow}>
                        <span className={styles.dealValue}>
                          {formatCurrency(deal.value)}
                        </span>
                      </div>

                      <div className={styles.probWrap}>
                        <div className={styles.probTrack}>
                          <div
                            className={styles.probFill}
                            style={{ width: `${prob}%`, background: color }}
                          />
                        </div>
                        <span className={styles.probLabel}>{prob}%</span>
                      </div>

                      <div className={styles.dealFooter}>
                        <div className={styles.repChip}>
                          {deal.rep && (
                            <>
                              <span
                                className={styles.repAvatar}
                                style={{ background: color }}
                              >
                                {getInitials(deal.rep)}
                              </span>
                              <span className={styles.repName}>{deal.rep}</span>
                            </>
                          )}
                        </div>
                        {deal.closeDate && (
                          <span className={styles.dealDate}>
                            <FaCalendarAlt /> {formatDate(deal.closeDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {stageDeals.length === 0 && (
                  <div className={styles.emptyCol}>No deals</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editDeal ? "Edit Opportunity" : "New Opportunity"}</h3>
              <button className={styles.modalClose} onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                {[
                  {
                    label: "Deal Name *",
                    key: "name",
                    placeholder: "Opportunity name",
                  },
                  { label: "Company", key: "company", placeholder: "Company" },
                  {
                    label: "Deal Value",
                    key: "value",
                    placeholder: "e.g. 50000",
                  },
                  { label: "Sales Rep", key: "rep", placeholder: "Rep name" },
                  { label: "Close Date", key: "closeDate", type: "date" },
                ].map((f) => (
                  <div key={f.key} className={styles.formGroup}>
                    <label>{f.label}</label>
                    <input
                      type={f.type || "text"}
                      value={form[f.key]}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, [f.key]: e.target.value }))
                      }
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
                <div className={styles.formGroup}>
                  <label>Stage</label>
                  <select
                    value={form.stage}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, stage: e.target.value }))
                    }
                  >
                    {stageList.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Probability</label>
                  <select
                    value={form.probability}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, probability: e.target.value }))
                    }
                  >
                    {[
                      "10%",
                      "25%",
                      "30%",
                      "50%",
                      "75%",
                      "80%",
                      "90%",
                      "100%",
                    ].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, notes: e.target.value }))
                    }
                    rows={3}
                    placeholder="Deal notes..."
                  />
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
                {loading ? "Saving..." : editDeal ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewDeal && (
        <div className={styles.modalOverlay} onClick={() => setViewDeal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Deal Details</h3>
              <button
                className={styles.modalClose}
                onClick={() => setViewDeal(null)}
              >
                <FaTimes />
              </button>
            </div>
            <div className={styles.viewBody}>
              <div
                className={styles.viewHeader}
                style={{ background: stageColors[viewDeal.stage] }}
              >
                <h4>{viewDeal.name}</h4>
                <span>{viewDeal.stage}</span>
              </div>
              <div className={styles.viewGrid}>
                {[
                  ["Company", viewDeal.company],
                  ["Value", formatCurrency(viewDeal.value)],
                  ["Probability", viewDeal.probability],
                  ["Close Date", viewDeal.closeDate],
                  ["Sales Rep", viewDeal.rep],
                  ["Notes", viewDeal.notes],
                ].map(
                  ([k, v]) =>
                    v && (
                      <div key={k} className={styles.viewRow}>
                        <span className={styles.viewKey}>{k}</span>
                        <span className={styles.viewVal}>{v}</span>
                      </div>
                    ),
                )}
              </div>
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
            <h4>Remove this opportunity?</h4>
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

export default SalesPipeline;

// LeadsManager.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaDownload,
  FaSpinner,
} from "react-icons/fa";
import { HiOutlineUsers } from "react-icons/hi";
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  getLeadFunnel,
} from "../salesApi";
import { toast } from "react-hot-toast";
import styles from "./LeadsManager.module.css";

const empty = {
  name: "",
  company: "",
  status: "New",
  source: "Website",
  assignedTo: "",
  value: "",
  probability: "30%",
  email: "",
  phone: "",
};

const defaultLeads = [
  {
    _id: "1",
    name: "Rahul Sharma",
    company: "Tech Solutions",
    status: "New",
    source: "Website",
    assignedTo: "Alex Jenkin",
    value: "$25,000",
    probability: "30%",
    email: "rahul@tech.com",
    phone: "+91 98765 43210",
  },
  {
    _id: "2",
    name: "Priya Patel",
    company: "Digital Innovations",
    status: "Contacted",
    source: "Referral",
    assignedTo: "Kelly Smart",
    value: "$45,000",
    probability: "50%",
    email: "priya@digital.com",
    phone: "+91 98765 43211",
  },
  {
    _id: "3",
    name: "Ankit Verma",
    company: "Business Hub",
    status: "Qualified",
    source: "LinkedIn",
    assignedTo: "Tamika Marshall",
    value: "$60,000",
    probability: "70%",
    email: "ankit@biz.com",
    phone: "+91 98765 43212",
  },
  {
    _id: "4",
    name: "Neha Gupta",
    company: "Creative Agency",
    status: "Proposal",
    source: "Email",
    assignedTo: "Jamal King",
    value: "$35,000",
    probability: "85%",
    email: "neha@creative.com",
    phone: "+91 98765 43213",
  },
  {
    _id: "5",
    name: "Amit Kumar",
    company: "Enterprise Ltd",
    status: "Negotiation",
    source: "Event",
    assignedTo: "Alex Jenkin",
    value: "$120,000",
    probability: "90%",
    email: "amit@enterprise.com",
    phone: "+91 98765 43214",
  },
];

const statusColors = {
  New: "#3b82f6",
  Contacted: "#f59e0b",
  Qualified: "#8b5cf6",
  Proposal: "#ec4899",
  Negotiation: "#10b981",
};
const statuses = ["New", "Contacted", "Qualified", "Proposal", "Negotiation"];
const sources = [
  "Website",
  "Referral",
  "LinkedIn",
  "Email",
  "Event",
  "Cold Call",
];

// ─── CSV Import Helpers ──────────────────────────────────────────────────────
// Expected header row (case-insensitive, order-flexible):
// name,company,status,source,assignedTo,value,probability,email,phone
const REQUIRED_FIELDS = ["name", "company"];
const KNOWN_FIELDS = [
  "name",
  "company",
  "status",
  "source",
  "assignedTo",
  "value",
  "probability",
  "email",
  "phone",
];

const parseCsvLine = (line) => {
  // Handles simple comma-separated values, respects quoted commas
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
};

const normalizeHeader = (h) => {
  const clean = h
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");
  const map = {
    name: "name",
    leadname: "name",
    fullname: "name",
    company: "company",
    status: "status",
    source: "source",
    assignedto: "assignedTo",
    salesrep: "assignedTo",
    rep: "assignedTo",
    value: "value",
    dealvalue: "value",
    probability: "probability",
    prob: "probability",
    email: "email",
    phone: "phone",
    phonenumber: "phone",
  };
  return map[clean] || null;
};

const parseCsvText = (text) => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { rows: [], errors: ["File has no data rows"] };

  const headerCells = parseCsvLine(lines[0]);
  const fieldKeys = headerCells.map(normalizeHeader);

  const rows = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const obj = {};
    fieldKeys.forEach((key, idx) => {
      if (key) obj[key] = (cells[idx] || "").trim();
    });

    const missing = REQUIRED_FIELDS.filter((f) => !obj[f]);
    if (missing.length > 0) {
      errors.push(`Row ${i + 1}: missing ${missing.join(", ")} — skipped`);
      continue;
    }

    rows.push({
      name: obj.name,
      company: obj.company,
      status: statuses.includes(obj.status) ? obj.status : "New",
      source: sources.includes(obj.source) ? obj.source : "Website",
      assignedTo: obj.assignedTo || "",
      value: obj.value || "",
      probability: obj.probability || "30%",
      email: obj.email || "",
      phone: obj.phone || "",
    });
  }

  return { rows, errors };
};

const LeadsManager = () => {
  const [leads, setLeads] = useState(defaultLeads);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewLead, setViewLead] = useState(null);
  const [editLead, setEditLead] = useState(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await getLeads();
      if (res.data?.data?.length > 0) setLeads(res.data.data);
    } catch {}
  };

  const funnelData = statuses.map((s) => ({
    label: s,
    count: leads.filter((l) => l.status === s).length,
  }));
  const maxFunnel = Math.max(...funnelData.map((f) => f.count), 1);

  const filtered =
    filterStatus === "All"
      ? leads
      : leads.filter((l) => l.status === filterStatus);

  const openAdd = () => {
    setForm(empty);
    setEditLead(null);
    setModalOpen(true);
  };
  const openEdit = (lead) => {
    setForm({ ...lead });
    setEditLead(lead);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditLead(null);
    setForm(empty);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.company)
      return toast.error("Name and company are required");
    setLoading(true);
    try {
      if (editLead) {
        const res = await updateLead(editLead._id, form);
        const updated = res.data?.data || { ...editLead, ...form };
        setLeads((prev) =>
          prev.map((l) => (l._id === editLead._id ? updated : l)),
        );
        toast.success("Lead updated");
      } else {
        const res = await createLead(form);
        const newLead = res.data?.data || {
          ...form,
          _id: Date.now().toString(),
        };
        setLeads((prev) => [newLead, ...prev]);
        toast.success("Lead added");
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
      await deleteLead(id);
      setLeads((prev) => prev.filter((l) => l._id !== id));
      toast.success("Lead deleted");
    } catch {
      toast.error("Delete failed");
    }
    setDeleteConfirm(null);
  };

  // ─── Import ──────────────────────────────────────────────────────────────
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please select a .csv file");
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const { rows, errors } = parseCsvText(text);

      if (rows.length === 0) {
        toast.error("No valid rows found in that file");
        return;
      }

      // Try to persist each row to the backend; fall back to local id if it fails
      const results = await Promise.allSettled(
        rows.map((row) => createLead(row)),
      );

      const imported = results.map((res, idx) => {
        if (res.status === "fulfilled" && res.value?.data?.data) {
          return res.value.data.data;
        }
        return { ...rows[idx], _id: `import-${Date.now()}-${idx}` };
      });

      setLeads((prev) => [...imported, ...prev]);

      const failedCount = results.filter((r) => r.status === "rejected").length;
      let msg = `Imported ${imported.length} lead${imported.length !== 1 ? "s" : ""}`;
      if (errors.length > 0)
        msg += `, skipped ${errors.length} invalid row${errors.length !== 1 ? "s" : ""}`;
      toast.success(msg);

      if (failedCount > 0) {
        toast.error(
          `${failedCount} lead${failedCount !== 1 ? "s" : ""} saved locally only — sync failed`,
        );
      }
    } catch (err) {
      toast.error("Could not read that file");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          <HiOutlineUsers /> Leads Management
        </h2>
        <div className={styles.headerBtns}>
          {/* Hidden file input driving the Import button */}
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileSelected}
            style={{ display: "none" }}
          />
          <button
            className={styles.secondaryBtn}
            onClick={handleImportClick}
            disabled={importing}
          >
            {importing ? <FaSpinner className={styles.spin} /> : <FaDownload />}
            {importing ? "Importing..." : "Import"}
          </button>
          <button className={styles.primaryBtn} onClick={openAdd}>
            <FaPlus /> Add Lead
          </button>
        </div>
      </div>

      {/* Funnel */}
      <div className={styles.funnelCard}>
        <h3>Lead Funnel</h3>
        {funnelData.map((f, i) => (
          <div key={i} className={styles.funnelRow}>
            <span className={styles.funnelLabel}>
              {f.label} ({f.count})
            </span>
            <div className={styles.funnelTrack}>
              <div
                className={styles.funnelFill}
                style={{ width: `${(f.count / maxFunnel) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className={styles.filterTabs}>
        {["All", ...statuses].map((s) => (
          <button
            key={s}
            className={`${styles.filterTab} ${filterStatus === s ? styles.activeTab : ""}`}
            onClick={() => setFilterStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Lead Name</th>
                <th>Company</th>
                <th>Status</th>
                <th>Source</th>
                <th>Sales Rep</th>
                <th>Value</th>
                <th>Prob.</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead._id}>
                  <td>
                    <strong>{lead.name}</strong>
                  </td>
                  <td>{lead.company}</td>
                  <td>
                    <span
                      className={styles.statusDot}
                      style={{ background: statusColors[lead.status] }}
                    />
                    {lead.status}
                  </td>
                  <td>{lead.source}</td>
                  <td>{lead.assignedTo}</td>
                  <td>
                    <strong>{lead.value}</strong>
                  </td>
                  <td>{lead.probability}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => setViewLead(lead)}
                      >
                        <FaEye />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.editBtn}`}
                        onClick={() => openEdit(lead)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.delBtn}`}
                        onClick={() => setDeleteConfirm(lead._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className={styles.empty}>No leads found.</div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editLead ? "Edit Lead" : "Add New Lead"}</h3>
              <button className={styles.modalClose} onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                {[
                  {
                    label: "Full Name *",
                    key: "name",
                    placeholder: "Lead name",
                  },
                  {
                    label: "Company *",
                    key: "company",
                    placeholder: "Company name",
                  },
                  {
                    label: "Email",
                    key: "email",
                    placeholder: "Email address",
                    type: "email",
                  },
                  { label: "Phone", key: "phone", placeholder: "Phone number" },
                  { label: "Deal Value", key: "value", placeholder: "$0" },
                  {
                    label: "Assigned To",
                    key: "assignedTo",
                    placeholder: "Sales rep name",
                  },
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
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, status: e.target.value }))
                    }
                  >
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Source</label>
                  <select
                    value={form.source}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, source: e.target.value }))
                    }
                  >
                    {sources.map((s) => (
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
                      "20%",
                      "30%",
                      "40%",
                      "50%",
                      "60%",
                      "70%",
                      "80%",
                      "90%",
                      "100%",
                    ].map((v) => (
                      <option key={v}>{v}</option>
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
                {loading ? "Saving..." : editLead ? "Update Lead" : "Add Lead"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewLead && (
        <div className={styles.modalOverlay} onClick={() => setViewLead(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Lead Details</h3>
              <button
                className={styles.modalClose}
                onClick={() => setViewLead(null)}
              >
                <FaTimes />
              </button>
            </div>
            <div className={styles.viewBody}>
              <div className={styles.viewAvatar}>{viewLead.name.charAt(0)}</div>
              <h4>{viewLead.name}</h4>
              <p className={styles.viewCompany}>{viewLead.company}</p>
              <div className={styles.viewGrid}>
                {[
                  ["Status", viewLead.status],
                  ["Source", viewLead.source],
                  ["Assigned To", viewLead.assignedTo],
                  ["Value", viewLead.value],
                  ["Probability", viewLead.probability],
                  ["Email", viewLead.email],
                  ["Phone", viewLead.phone],
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

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Delete Lead?</h4>
            <p>This action cannot be undone.</p>
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsManager;

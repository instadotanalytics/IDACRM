// CallsTracker.jsx - UPDATED WITH CORRECT ICONS
import React, { useState, useEffect } from "react";
import {
  FaPhoneAlt,
  FaPlus,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaPhone,
  FaWhatsapp,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaWifi,
  FaSignal,
} from "react-icons/fa";
import {
  getCalls,
  createCall,
  updateCall,
  deleteCall,
  getCallStats,
} from "../salesApi";
import { toast } from "react-hot-toast";
import { useSocket } from "../../../../context/SocketContext";
import { useSocketEvents } from "../../../../hooks/useSocketEvents";
import styles from "./CallsTracker.module.css";

const empty = {
  customer: "",
  phone: "",
  time: "",
  type: "New Lead",
  status: "pending",
  notes: "",
};

const defaultCalls = [
  {
    _id: "1",
    customer: "Rahul Sharma",
    phone: "+91 98765 43210",
    time: "10:30 AM",
    status: "pending",
    type: "Follow-up",
    notes: "Interested in Full Stack course",
  },
  {
    _id: "2",
    customer: "Priya Patel",
    phone: "+91 98765 43211",
    time: "11:00 AM",
    status: "completed",
    type: "Demo",
    notes: "Demo scheduled for tomorrow",
  },
  {
    _id: "3",
    customer: "Ankit Verma",
    phone: "+91 98765 43212",
    time: "12:00 PM",
    status: "pending",
    type: "New Lead",
    notes: "First contact",
  },
  {
    _id: "4",
    customer: "Neha Gupta",
    phone: "+91 98765 43213",
    time: "02:00 PM",
    status: "completed",
    type: "Follow-up",
    notes: "Interested, sent proposal",
  },
  {
    _id: "5",
    customer: "Amit Kumar",
    phone: "+91 98765 43214",
    time: "03:30 PM",
    status: "missed",
    type: "Closure",
    notes: "Converted to admission",
  },
];

const CallsTracker = () => {
  const [calls, setCalls] = useState(defaultCalls);
  const [filter, setFilter] = useState("All Status");
  const [modalOpen, setModalOpen] = useState(false);
  const [editCall, setEditCall] = useState(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Socket.IO
  const { socket, isConnected } = useSocket();

  // Fetch initial data
  useEffect(() => {
    fetchCalls();
  }, []);

  // Socket event handlers
  const handleCallCreated = (data) => {
    console.log("📞 New call received via socket:", data);
    if (data.callLog) {
      // For CallLog model
      setCalls((prev) => [data.callLog, ...prev]);
      toast.success(
        `New call from ${data.callLog.leadName || data.callLog.customer}`,
      );
    } else if (data.call) {
      // For SalesCall model
      setCalls((prev) => [data.call, ...prev]);
      toast.success(`New call scheduled with ${data.call.customer}`);
    }
  };

  const handleCallUpdated = (data) => {
    console.log("✏️ Call updated via socket:", data);
    const updatedCall = data.callLog || data.call;
    if (updatedCall) {
      setCalls((prev) =>
        prev.map((call) => (call._id === updatedCall._id ? updatedCall : call)),
      );
      toast.info(
        `Call updated: ${updatedCall.leadName || updatedCall.customer}`,
      );
    }
  };

  const handleCallDeleted = (data) => {
    console.log("🗑️ Call deleted via socket:", data);
    const callId = data.callId || data._id;
    if (callId) {
      setCalls((prev) => prev.filter((call) => call._id !== callId));
      toast.warning("A call was deleted");
    }
  };

  const handleCallStatusChanged = (data) => {
    console.log("📊 Call status changed via socket:", data);
    const { callId, newStatus, callLog, call } = data;
    const updatedCall = callLog || call;
    if (updatedCall) {
      setCalls((prev) =>
        prev.map((c) =>
          c._id === callId || c._id === updatedCall._id ? updatedCall : c,
        ),
      );
      toast.success(
        `Call status changed to ${newStatus || updatedCall.status}`,
      );
    }
  };

  const handleStatsUpdate = (stats) => {
    console.log("📊 Stats update received:", stats);
    // Update stats if needed
  };

  // Use socket events hook
  const { emit } = useSocketEvents({
    onCallLogCreated: handleCallCreated,
    onCallLogUpdated: handleCallUpdated,
    onCallLogDeleted: handleCallDeleted,
    onCallStatusChanged: handleCallStatusChanged,
    onSalesCallCreated: handleCallCreated,
    onSalesCallUpdated: handleCallUpdated,
    onSalesCallDeleted: handleCallDeleted,
    onSalesCallStatusChanged: handleCallStatusChanged,
    onStatsUpdate: handleStatsUpdate,
  });

  const fetchCalls = async () => {
    try {
      const res = await getCalls();
      if (res.data?.data?.length > 0) setCalls(res.data.data);
    } catch (error) {
      console.error("Error fetching calls:", error);
      toast.error("Failed to load calls");
    }
  };

  const stats = [
    {
      label: "Total Calls",
      value: calls.length,
      icon: <FaPhoneAlt />,
      color: "#810B38",
    },
    {
      label: "Completed",
      value: calls.filter((c) => c.status === "completed").length,
      icon: <FaCheckCircle />,
      color: "#10b981",
    },
    {
      label: "Pending",
      value: calls.filter((c) => c.status === "pending").length,
      icon: <FaClock />,
      color: "#f59e0b",
    },
    {
      label: "Missed",
      value: calls.filter((c) => c.status === "missed").length,
      icon: <FaTimesCircle />,
      color: "#ef4444",
    },
  ];

  const filtered =
    filter === "All Status"
      ? calls
      : calls.filter((c) => c.status.toLowerCase() === filter.toLowerCase());

  const openAdd = () => {
    setForm(empty);
    setEditCall(null);
    setModalOpen(true);
  };

  const openEdit = (call) => {
    setForm({ ...call });
    setEditCall(call);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditCall(null);
    setForm(empty);
  };

  const handleSubmit = async () => {
    if (!form.customer || !form.phone)
      return toast.error("Customer and phone are required");
    setLoading(true);
    try {
      if (editCall) {
        const res = await updateCall(editCall._id, form);
        const updated = res.data?.data || { ...editCall, ...form };
        setCalls((prev) =>
          prev.map((c) => (c._id === editCall._id ? updated : c)),
        );
        toast.success("Call updated");

        // Emit socket event
        emit("sales-call-updated", {
          callId: editCall._id,
          call: updated,
          updatedBy: JSON.parse(localStorage.getItem("user"))?.name || "User",
        });
      } else {
        const res = await createCall(form);
        const newCall = res.data?.data || {
          ...form,
          _id: Date.now().toString(),
        };
        setCalls((prev) => [newCall, ...prev]);
        toast.success("Call scheduled");

        // Emit socket event
        emit("sales-call-created", {
          call: newCall,
          createdBy: JSON.parse(localStorage.getItem("user"))?.name || "User",
        });
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
      await deleteCall(id);
      setCalls((prev) => prev.filter((c) => c._id !== id));
      toast.success("Call deleted");

      // Emit socket event
      emit("sales-call-deleted", {
        callId: id,
        deletedBy: JSON.parse(localStorage.getItem("user"))?.name || "User",
      });
    } catch {
      toast.error("Delete failed");
    }
    setDeleteConfirm(null);
  };

  // Function to handle phone call
  const handlePhoneCall = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, "");
    const formattedNumber = cleanNumber.startsWith("+")
      ? cleanNumber
      : `+91${cleanNumber}`;
    window.open(`tel:${formattedNumber}`, "_blank");
    toast.success(`Calling ${phoneNumber}...`);
  };

  // Function to handle WhatsApp
  const handleWhatsApp = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, "");
    const formattedNumber = cleanNumber.startsWith("+")
      ? cleanNumber.replace("+", "")
      : `91${cleanNumber}`;
    window.open(`https://wa.me/${formattedNumber}`, "_blank");
    toast.success(`Opening WhatsApp for ${phoneNumber}...`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          <FaPhoneAlt /> Calls Tracker
          {isConnected ? (
            <span
              className={styles.connectionStatus}
              style={{ color: "#10b981" }}
            >
              <FaWifi /> Live
            </span>
          ) : (
            <span
              className={styles.connectionStatus}
              style={{ color: "#ef4444" }}
            >
              <FaSignal /> Offline
            </span>
          )}
        </h2>
        <button className={styles.primaryBtn} onClick={openAdd}>
          <FaPlus /> Schedule Call
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        {stats.map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: s.color }}>
              {s.icon}
            </div>
            <div>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statVal}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableTop}>
          <h3>Scheduled Calls Today</h3>
          <select
            className={styles.filterSelect}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {["All Status", "Pending", "Completed", "Missed"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Time</th>
                <th>Type</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((call) => (
                <tr key={call._id}>
                  <td>
                    <strong>{call.customer}</strong>
                  </td>
                  <td>{call.phone}</td>
                  <td>{call.time}</td>
                  <td>
                    <span className={styles.typeBadge}>{call.type}</span>
                  </td>
                  <td>
                    <span className={`${styles.status} ${styles[call.status]}`}>
                      {call.status}
                    </span>
                  </td>
                  <td className={styles.notesCell}>{call.notes}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={`${styles.iconBtn} ${styles.callBtn}`}
                        onClick={() => handlePhoneCall(call.phone)}
                        title="Call"
                      >
                        <FaPhone />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.whatsappBtn}`}
                        onClick={() => handleWhatsApp(call.phone)}
                        title="WhatsApp"
                      >
                        <FaWhatsapp />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.editBtn}`}
                        onClick={() => openEdit(call)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.delBtn}`}
                        onClick={() => setDeleteConfirm(call._id)}
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
            <div className={styles.empty}>No calls found.</div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editCall ? "Edit Call" : "Schedule New Call"}</h3>
              <button className={styles.modalClose} onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Customer Name *</label>
                  <input
                    value={form.customer}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, customer: e.target.value }))
                    }
                    placeholder="Enter customer name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone Number *</label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Call Time</label>
                  <input
                    value={form.time}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, time: e.target.value }))
                    }
                    placeholder="e.g. 10:30 AM"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Call Type</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, type: e.target.value }))
                    }
                  >
                    {[
                      "New Lead",
                      "Follow-up",
                      "Demo",
                      "Closure",
                      "Support",
                    ].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, status: e.target.value }))
                    }
                  >
                    {["pending", "completed", "missed"].map((s) => (
                      <option key={s}>{s}</option>
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
                    placeholder="Call notes..."
                    rows={3}
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
                {loading
                  ? "Saving..."
                  : editCall
                    ? "Update Call"
                    : "Schedule Call"}
              </button>
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
            <h4>Delete Call?</h4>
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

export default CallsTracker;

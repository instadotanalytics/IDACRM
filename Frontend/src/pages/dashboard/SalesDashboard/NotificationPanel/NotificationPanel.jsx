// NotificationPanel.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  FaTimes,
  FaBell,
  FaHandshake,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaArrowLeft,
  FaEnvelopeOpen,
} from "react-icons/fa";
import styles from "./NotificationPanel.module.css";

const iconMap = {
  deal: <FaHandshake />,
  call: <FaPhone />,
  email: <FaEnvelope />,
  default: <FaBell />,
};

const defaultNotifs = [
  {
    _id: "1",
    type: "deal",
    title: "Contract Signed",
    message: "Shine Bright signed the contract for $100,000",
    time: "2 hours ago",
    read: false,
  },
  {
    _id: "2",
    type: "call",
    title: "Missed Call",
    message: "Rahul Sharma tried to reach you at 3:30 PM",
    time: "3 hours ago",
    read: false,
  },
  {
    _id: "3",
    type: "email",
    title: "Proposal Viewed",
    message: "Fabricatorz opened your proposal email",
    time: "5 hours ago",
    read: true,
  },
  {
    _id: "4",
    type: "deal",
    title: "New Lead Assigned",
    message: "Ankit Verma from Business Hub assigned to you",
    time: "Yesterday",
    read: true,
  },
  {
    _id: "5",
    type: "call",
    title: "Follow-up Due",
    message: "Follow-up call with Neha Gupta is due today",
    time: "Yesterday",
    read: true,
  },
];

const VISIBLE_LIMIT = 4;

const NotificationPanel = ({
  isOpen,
  onClose,
  notifications = [],
  onMarkRead,
  onMarkAll,
}) => {
  const panelRef = useRef(null);

  // Internal source of truth so read/unread state actually persists & re-renders.
  const [notifList, setNotifList] = useState(() =>
    notifications.length > 0 ? notifications : defaultNotifs,
  );
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState(null); // notification being viewed in detail

  // If parent later supplies real notifications (e.g. after an API fetch), adopt them.
  useEffect(() => {
    if (notifications.length > 0) setNotifList(notifications);
  }, [notifications]);

  // Reset to list view + collapsed state whenever the panel closes
  useEffect(() => {
    if (!isOpen) {
      setSelected(null);
      setShowAll(false);
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  // Close on Escape (or go back from detail view first)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key !== "Escape") return;
      if (selected) setSelected(null);
      else onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, selected]);

  const unreadCount = notifList.filter((n) => !n.read).length;
  const visibleList = showAll ? notifList : notifList.slice(0, VISIBLE_LIMIT);

  const markRead = (id) => {
    setNotifList((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
    onMarkRead && onMarkRead(id);
  };

  const markUnread = (id) => {
    setNotifList((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: false } : n)),
    );
  };

  const handleMarkAll = () => {
    setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));
    onMarkAll && onMarkAll();
  };

  const openDetail = (notif) => {
    if (!notif.read) markRead(notif._id);
    setSelected(notif);
  };

  const closeDetail = () => setSelected(null);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ""}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`${styles.panel} ${isOpen ? styles.open : ""}`}
      >
        {/* ─── LIST HEADER ─── */}
        {!selected && (
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <FaBell />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </div>
            <div className={styles.headerActions}>
              {unreadCount > 0 && (
                <button className={styles.markAllBtn} onClick={handleMarkAll}>
                  <FaCheckCircle /> Mark all read
                </button>
              )}
              <button className={styles.closeBtn} onClick={onClose}>
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {/* ─── DETAIL HEADER ─── */}
        {selected && (
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <button className={styles.backBtn} onClick={closeDetail}>
                <FaArrowLeft />
              </button>
              <span>Notification</span>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.closeBtn} onClick={onClose}>
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {/* ─── LIST VIEW ─── */}
        {!selected && (
          <>
            <div className={styles.list}>
              {visibleList.map((notif) => (
                <div
                  key={notif._id}
                  className={`${styles.item} ${!notif.read ? styles.unread : ""}`}
                  onClick={() => openDetail(notif)}
                >
                  <div className={`${styles.icon} ${styles[notif.type]}`}>
                    {iconMap[notif.type] || iconMap.default}
                  </div>
                  <div className={styles.content}>
                    <span className={styles.title}>{notif.title}</span>
                    <span className={styles.message}>{notif.message}</span>
                    <span className={styles.time}>{notif.time}</span>
                  </div>
                  {!notif.read && <div className={styles.dot} />}
                </div>
              ))}
              {notifList.length === 0 && (
                <div className={styles.emptyState}>
                  <FaBell />
                  <p>You're all caught up</p>
                </div>
              )}
            </div>

            {notifList.length > VISIBLE_LIMIT && (
              <div className={styles.footer}>
                <button
                  className={styles.viewAllBtn}
                  onClick={() => setShowAll((s) => !s)}
                >
                  {showAll
                    ? "Show Less"
                    : `View All Notifications (${notifList.length})`}
                </button>
              </div>
            )}
          </>
        )}

        {/* ─── DETAIL VIEW ─── */}
        {selected && (
          <div className={styles.detailView}>
            <div
              className={`${styles.detailIcon} ${styles[selected.type] || ""}`}
            >
              {iconMap[selected.type] || iconMap.default}
            </div>
            <h3 className={styles.detailTitle}>{selected.title}</h3>
            <p className={styles.detailMessage}>{selected.message}</p>
            <span className={styles.detailTime}>{selected.time}</span>

            <div className={styles.detailActions}>
              {selected.read ? (
                <button
                  className={styles.secondaryActionBtn}
                  onClick={() => {
                    markUnread(selected._id);
                    setSelected((s) => (s ? { ...s, read: false } : s));
                  }}
                >
                  <FaEnvelope /> Mark as Unread
                </button>
              ) : (
                <button
                  className={styles.secondaryActionBtn}
                  onClick={() => {
                    markRead(selected._id);
                    setSelected((s) => (s ? { ...s, read: true } : s));
                  }}
                >
                  <FaEnvelopeOpen /> Mark as Read
                </button>
              )}
              <button className={styles.primaryActionBtn} onClick={closeDetail}>
                Back to List
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPanel;

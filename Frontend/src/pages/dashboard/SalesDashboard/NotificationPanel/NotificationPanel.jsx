// NotificationPanel.jsx - UPDATED: removed defaultNotifs (was causing 500 errors on mark-as-read)
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FaTimes,
  FaBell,
  FaHandshake,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaArrowLeft,
  FaEnvelopeOpen,
  FaWifi,
  FaSignal,
} from "react-icons/fa";
import { useSocket } from "../../../../context/SocketContext";
import { useSocketEvents } from "../../../../hooks/useSocketEvents";
import { markNotificationRead, markAllNotificationsRead } from "../salesApi";
import { toast } from "react-hot-toast";
import styles from "./NotificationPanel.module.css";

const iconMap = {
  deal: <FaHandshake />,
  call: <FaPhone />,
  email: <FaEnvelope />,
  default: <FaBell />,
};

const VISIBLE_LIMIT = 4;

// Stable reference so an omitted `notifications` prop doesn't create a new
// array on every render (that was causing an infinite effect/re-render loop,
// which is why useSocketEvents kept unregistering/re-registering rapidly).
const EMPTY_NOTIFICATIONS = [];

const NotificationPanel = ({
  isOpen,
  onClose,
  notifications = EMPTY_NOTIFICATIONS,
  onMarkRead,
  onMarkAll,
}) => {
  const panelRef = useRef(null);
  const { isConnected } = useSocket();

  // Internal state — starts from whatever the parent passes in (real data only)
  const [notifList, setNotifList] = useState(notifications);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState(null);

  // Keep in sync whenever the parent supplies new/updated notifications
  useEffect(() => {
    setNotifList(notifications);
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

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key !== "Escape") return;
      if (selected) setSelected(null);
      else onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, selected]);

  // Socket event handlers — wrapped in useCallback so their identity stays
  // stable across renders. Without this, useSocketEvents (which likely
  // depends on these functions) would tear down and re-register its
  // listeners on every single render.
  const handleNewNotification = useCallback((notification) => {
    setNotifList((prev) => [notification, ...prev]);
    toast(notification.title, { icon: "🔔" });
  }, []);

  const handleNotificationRead = useCallback((data) => {
    setNotifList((prev) =>
      prev.map((n) =>
        n._id === data.notificationId ? { ...n, read: true } : n,
      ),
    );
  }, []);

  // Use socket events
  useSocketEvents({
    onNewNotification: handleNewNotification,
    onNotificationRead: handleNotificationRead,
  });

  const unreadCount = notifList.filter((n) => !n.read).length;
  const visibleList = showAll ? notifList : notifList.slice(0, VISIBLE_LIMIT);

  const markRead = async (id) => {
    setNotifList((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
    onMarkRead && onMarkRead(id);

    try {
      await markNotificationRead(id);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markUnread = (id) => {
    setNotifList((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: false } : n)),
    );
  };

  const handleMarkAll = async () => {
    setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));
    onMarkAll && onMarkAll();

    try {
      await markAllNotificationsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
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
        {/* Connection Status */}
        <div className={styles.connectionStatus}>
          {isConnected ? (
            <>
              <FaWifi className={styles.onlineIcon} />
              <span className={styles.onlineText}>Live</span>
            </>
          ) : (
            <>
              <FaSignal className={styles.offlineIcon} />
              <span className={styles.offlineText}>Offline</span>
            </>
          )}
        </div>

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

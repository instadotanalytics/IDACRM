// ProfileDropdown.jsx
import React, { useEffect, useRef } from "react";
import {
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaSpinner,
} from "react-icons/fa";
import styles from "./ProfileDropdown.module.css";

const ProfileDropdown = ({
  user,
  isOpen,
  onToggle,
  onClose,
  onLogout,
  onNavigate,
  isLoggingOut = false,
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "S");

  const handleSignOut = () => {
    if (isLoggingOut) return;
    onClose(); // close the dropdown visually first
    onLogout(); // triggers toast + redirect in parent
  };

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.active : ""}`}
        onClick={onToggle}
        disabled={isLoggingOut}
      >
        <div className={styles.avatar}>
          {isLoggingOut ? (
            <FaSpinner className={styles.spin} />
          ) : (
            user?.avatar || getInitial(user?.name)
          )}
        </div>
        <div className={styles.info}>
          <span className={styles.name}>{user?.name || "Sales Executive"}</span>
          <span className={styles.role}>
            {isLoggingOut ? "Logging out..." : user?.role || "Sales Executive"}
          </span>
        </div>
        <FaChevronDown
          className={`${styles.chevron} ${isOpen ? styles.rotated : ""}`}
        />
      </button>

      <div className={`${styles.dropdown} ${isOpen ? styles.open : ""}`}>
        {/* Profile header */}
        <div className={styles.profileSection}>
          <div className={styles.bigAvatar}>
            {user?.avatar || getInitial(user?.name)}
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>
              {user?.name || "Sales Executive"}
            </span>
            <span className={styles.profileRole}>
              {user?.role || "Sales Executive"}
            </span>
          </div>
        </div>

        {user?.email && (
          <div className={styles.metaRow}>
            <FaEnvelope /> <span>{user.email}</span>
          </div>
        )}
        {user?.phone && (
          <div className={styles.metaRow}>
            <FaPhone /> <span>{user.phone}</span>
          </div>
        )}

        <div className={styles.divider} />

        <button
          type="button"
          className={styles.menuItem}
          onClick={() => {
            onNavigate && onNavigate("settings");
            onClose();
          }}
        >
          <FaUserCircle /> My Profile
        </button>
        <button
          type="button"
          className={styles.menuItem}
          onClick={() => {
            onNavigate && onNavigate("settings");
            onClose();
          }}
        >
          <FaCog /> Settings
        </button>
        <button
          type="button"
          className={styles.menuItem}
          onClick={() => {
            onClose();
          }}
        >
          <FaShieldAlt /> Privacy
        </button>

        <div className={styles.divider} />

        {/* ─── SIGN OUT — THE FIX ─── */}
        <button
          type="button"
          className={`${styles.menuItem} ${styles.logout} ${isLoggingOut ? styles.logoutBusy : ""}`}
          onClick={handleSignOut}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <FaSpinner className={styles.spin} />
          ) : (
            <FaSignOutAlt />
          )}
          <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;

// SettingsView.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FaCog,
  FaUserCircle,
  FaBell,
  FaChartLine,
  FaShieldAlt,
  FaSave,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { updateProfile, updateNotificationSettings } from "../salesApi";
import { toast } from "react-hot-toast";
import styles from "./SettingsView.module.css";

const DISPLAY_KEY = "ida_crm_display_prefs";

// ─── Theme engine helpers ──────────────────────────────────────────────────
const resolveTheme = (theme) => {
  if (theme === "System Default") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme.toLowerCase();
};

const applyTheme = (theme) => {
  const resolved = resolveTheme(theme);
  document.documentElement.setAttribute("data-theme", resolved);
};

const applyCompact = (compact) => {
  document.documentElement.setAttribute(
    "data-compact",
    compact ? "true" : "false",
  );
};

const loadDisplayPrefs = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(DISPLAY_KEY) || "{}");
    return {
      theme: saved.theme || "Light",
      defaultView: saved.defaultView || "Dashboard",
      compactMode: saved.compactMode || false,
    };
  } catch {
    return { theme: "Light", defaultView: "Dashboard", compactMode: false };
  }
};

const SettingsView = ({ user }) => {
  const [profile, setProfile] = useState({
    name: user?.name || "Alex Jenkin",
    email: user?.email || "alex.jenkin@ida.com",
    phone: user?.phone || "+1 234 567 8900",
    role: user?.role || "Senior Sales Executive",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotif: true,
    pushNotif: false,
    smsAlerts: true,
    dealUpdates: true,
    callReminders: true,
    weeklyReport: false,
  });

  const [display, setDisplay] = useState(loadDisplayPrefs);
  const [showPass, setShowPass] = useState({
    curr: false,
    new: false,
    conf: false,
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [displayLoading, setDisplayLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const mqlRef = useRef(null);

  // Apply saved theme/compact mode on first mount
  useEffect(() => {
    applyTheme(display.theme);
    applyCompact(display.compactMode);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If "System Default" is active, react live to OS theme changes
  useEffect(() => {
    if (display.theme !== "System Default") {
      if (mqlRef.current) {
        mqlRef.current.removeEventListener?.("change", handleSystemChange);
        mqlRef.current = null;
      }
      return;
    }
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mqlRef.current = mql;
    function handleSystemChange() {
      applyTheme("System Default");
    }
    mql.addEventListener?.("change", handleSystemChange);
    return () => mql.removeEventListener?.("change", handleSystemChange);
  }, [display.theme]);

  const handleThemeChange = (value) => {
    setDisplay((p) => ({ ...p, theme: value }));
    applyTheme(value); // live preview immediately
  };

  const handleCompactChange = (value) => {
    setDisplay((p) => ({ ...p, compactMode: value }));
    applyCompact(value); // live preview immediately
  };

  const handleProfileSave = async () => {
    if (
      profile.newPassword &&
      profile.newPassword !== profile.confirmPassword
    ) {
      return toast.error("Passwords do not match");
    }
    setProfileLoading(true);
    try {
      await updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        currentPassword: profile.currentPassword || undefined,
        newPassword: profile.newPassword || undefined,
      });
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...userData,
          name: profile.name,
          email: profile.email,
        }),
      );
      toast.success("Profile updated successfully");
      setProfile((p) => ({
        ...p,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleNotifSave = async () => {
    setNotifLoading(true);
    try {
      await updateNotificationSettings(notifications);
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setNotifLoading(false);
    }
  };

  const handleDisplaySave = () => {
    setDisplayLoading(true);
    try {
      localStorage.setItem(DISPLAY_KEY, JSON.stringify(display));
      applyTheme(display.theme);
      applyCompact(display.compactMode);
      toast.success("Display preferences saved");
    } catch {
      toast.error("Could not save preferences");
    } finally {
      setDisplayLoading(false);
    }
  };

  const Toggle = ({ checked, onChange, label }) => (
    <div className={styles.toggleRow}>
      <span className={styles.toggleLabel}>{label}</span>
      <label className={styles.switch}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className={styles.slider} />
      </label>
    </div>
  );

  const sections = [
    { id: "profile", label: "Profile", icon: <FaUserCircle /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
    { id: "display", label: "Display", icon: <FaChartLine /> },
    { id: "security", label: "Security", icon: <FaShieldAlt /> },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          <FaCog /> Settings
        </h2>
      </div>

      <div className={styles.layout}>
        {/* Section nav */}
        <div className={styles.sectionNav}>
          {sections.map((s) => (
            <button
              key={s.id}
              className={`${styles.sectionBtn} ${activeSection === s.id ? styles.active : ""}`}
              onClick={() => setActiveSection(s.id)}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* PROFILE */}
          {activeSection === "profile" && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <FaUserCircle /> Profile Settings
              </div>
              <div className={styles.avatarSection}>
                <div className={styles.bigAvatar}>
                  {profile.name?.charAt(0) || "S"}
                </div>
                <div>
                  <p className={styles.avatarName}>{profile.name}</p>
                  <p className={styles.avatarRole}>{profile.role}</p>
                </div>
              </div>
              <div className={styles.formGrid}>
                {[
                  { label: "Full Name", key: "name", placeholder: "Full name" },
                  {
                    label: "Email",
                    key: "email",
                    placeholder: "Email",
                    type: "email",
                  },
                  { label: "Phone", key: "phone", placeholder: "Phone number" },
                  {
                    label: "Role",
                    key: "role",
                    placeholder: "Job title",
                    disabled: true,
                  },
                ].map((f) => (
                  <div key={f.key} className={styles.formGroup}>
                    <label>{f.label}</label>
                    <input
                      type={f.type || "text"}
                      value={profile[f.key]}
                      onChange={(e) =>
                        !f.disabled &&
                        setProfile((p) => ({ ...p, [f.key]: e.target.value }))
                      }
                      placeholder={f.placeholder}
                      disabled={f.disabled}
                    />
                  </div>
                ))}
              </div>
              <button
                className={styles.saveBtn}
                onClick={handleProfileSave}
                disabled={profileLoading}
              >
                <FaSave /> {profileLoading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <FaBell /> Notification Settings
              </div>
              <Toggle
                label="Email Notifications"
                checked={notifications.emailNotif}
                onChange={(v) =>
                  setNotifications((p) => ({ ...p, emailNotif: v }))
                }
              />
              <Toggle
                label="Push Notifications"
                checked={notifications.pushNotif}
                onChange={(v) =>
                  setNotifications((p) => ({ ...p, pushNotif: v }))
                }
              />
              <Toggle
                label="SMS Alerts"
                checked={notifications.smsAlerts}
                onChange={(v) =>
                  setNotifications((p) => ({ ...p, smsAlerts: v }))
                }
              />
              <Toggle
                label="Deal Update Alerts"
                checked={notifications.dealUpdates}
                onChange={(v) =>
                  setNotifications((p) => ({ ...p, dealUpdates: v }))
                }
              />
              <Toggle
                label="Call Reminders"
                checked={notifications.callReminders}
                onChange={(v) =>
                  setNotifications((p) => ({ ...p, callReminders: v }))
                }
              />
              <Toggle
                label="Weekly Performance Report"
                checked={notifications.weeklyReport}
                onChange={(v) =>
                  setNotifications((p) => ({ ...p, weeklyReport: v }))
                }
              />
              <button
                className={styles.saveBtn}
                onClick={handleNotifSave}
                disabled={notifLoading}
                style={{ marginTop: 20 }}
              >
                <FaSave /> {notifLoading ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          )}

          {/* DISPLAY */}
          {activeSection === "display" && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <FaChartLine /> Display Preferences
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Theme</label>
                  <select
                    value={display.theme}
                    onChange={(e) => handleThemeChange(e.target.value)}
                  >
                    {["Light", "Dark", "System Default"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Default View</label>
                  <select
                    value={display.defaultView}
                    onChange={(e) =>
                      setDisplay((p) => ({ ...p, defaultView: e.target.value }))
                    }
                  >
                    {[
                      "Dashboard",
                      "Calls Tracker",
                      "Leads Management",
                      "Sales Pipeline",
                      "Reports",
                    ].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Toggle
                label="Compact Mode"
                checked={display.compactMode}
                onChange={handleCompactChange}
              />
              <button
                className={styles.saveBtn}
                onClick={handleDisplaySave}
                disabled={displayLoading}
                style={{ marginTop: 20 }}
              >
                <FaSave /> {displayLoading ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          )}

          {/* SECURITY */}
          {activeSection === "security" && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <FaShieldAlt /> Change Password
              </div>
              {[
                {
                  label: "Current Password",
                  key: "currentPassword",
                  toggle: "curr",
                },
                { label: "New Password", key: "newPassword", toggle: "new" },
                {
                  label: "Confirm New Password",
                  key: "confirmPassword",
                  toggle: "conf",
                },
              ].map((f) => (
                <div
                  key={f.key}
                  className={`${styles.formGroup} ${styles.passGroup}`}
                >
                  <label>{f.label}</label>
                  <div className={styles.passWrap}>
                    <input
                      type={showPass[f.toggle] ? "text" : "password"}
                      value={profile[f.key]}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, [f.key]: e.target.value }))
                      }
                      placeholder="••••••••"
                    />
                    <button
                      className={styles.eyeBtn}
                      onClick={() =>
                        setShowPass((p) => ({ ...p, [f.toggle]: !p[f.toggle] }))
                      }
                    >
                      {showPass[f.toggle] ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              ))}
              <button
                className={styles.saveBtn}
                onClick={handleProfileSave}
                disabled={profileLoading}
                style={{ marginTop: 20 }}
              >
                <FaShieldAlt />{" "}
                {profileLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

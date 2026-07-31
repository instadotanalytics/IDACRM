// SuperAdminLogin.jsx - FIXED (sessionStorage for tab isolation)
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCrown,
  FaChartLine,
  FaUsers,
  FaLockOpen,
  FaLayerGroup,
  FaCertificate,
  FaSignInAlt,
} from "react-icons/fa";
import styles from "./SuperAdminLogin.module.css";
import { superAdminAPI } from "../../services/api";
import { saveAuth, getToken, getUser } from "../../services/auth";
import { useSocket } from "../../context/SocketContext";

const FEATURES = [
  { icon: <FaLayerGroup />, text: "Centralized dashboard control" },
  { icon: <FaUsers />, text: "Multi-tenant user management" },
  { icon: <FaChartLine />, text: "Real-time analytics & reports" },
  { icon: <FaLockOpen />, text: "Role-based access control" },
];

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const { reconnectSocket } = useSocket();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // Redirect if already authenticated as super_admin in THIS tab
  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (token && user?.role === "super_admin") {
      navigate("/super-admin-dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await superAdminAPI.login(formData);

      if (response.data.success) {
        const { token, user } = response.data;

        // Save to sessionStorage (tab-isolated) — also to localStorage if rememberMe
        saveAuth(token, user, rememberMe);

        // Reconnect THIS tab's socket with the new token
        if (reconnectSocket) reconnectSocket(token);

        console.log("=== SUPER ADMIN LOGIN SUCCESS ===");
        console.log("Name:", user.name, "| Role:", user.role);

        toast.success(`Welcome back, ${user.name}!`);
        navigate("/super-admin-dashboard", { replace: true });
      }
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.orb1} aria-hidden="true" />
      <div className={styles.orb2} aria-hidden="true" />
      <div className={styles.orb3} aria-hidden="true" />

      <div className={styles.card}>
        {/* LEFT */}
        <div className={styles.left}>
          <div className={styles.leftInner}>
            <div className={styles.brandIcon}>
              <FaCrown />
            </div>
            <h1 className={styles.brandName}>IDA ERP CRM</h1>
            <p className={styles.brandTag}>Super Admin Portal</p>
            <div className={styles.dividerH} />
            <ul className={styles.featureList}>
              {FEATURES.map(({ icon, text }) => (
                <li key={text} className={styles.featureItem}>
                  <span className={styles.featureIcon}>{icon}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <span className={`${styles.circle} ${styles.circleTop}`} />
          <span className={`${styles.circle} ${styles.circleBottom}`} />
        </div>

        {/* RIGHT */}
        <div className={styles.right}>
          <div className={styles.avatarBubble}>
            <FaCrown />
          </div>

          <div className={styles.welcome}>
            <h2 className={styles.welcomeTitle}>
              Welcome Back,{" "}
              <span className={styles.welcomeAccent}>Superadmin</span>
            </h2>
            <p className={styles.welcomeSub}>
              Please sign in to access the dashboard
            </p>
          </div>

          {error && <div className={styles.errorBanner}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                <FaEnvelope className={styles.labelIcon} /> Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                placeholder="superadmin@ida.com"
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                <FaLock className={styles.labelIcon} /> Password
              </label>
              <div className={styles.pwWrap}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${styles.input} ${styles.inputPw}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.pwToggle}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className={styles.row}>
              <label className={styles.remember}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.checkbox}
                />
                Remember me
              </label>
              <Link to="/forgot-password" className={styles.forgot}>
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} /> Signing in…
                </>
              ) : (
                <>
                  <FaSignInAlt /> Login to Dashboard
                </>
              )}
            </button>
          </form>

          <div className={styles.dividerRow}>
            <hr className={styles.hr} />
            <span className={styles.dividerText}>secured connection</span>
            <hr className={styles.hr} />
          </div>

          <div className={styles.secureBadge}>
            <FaCertificate className={styles.secureIcon} />
            <span>256-bit SSL encrypted · Enterprise grade security</span>
          </div>

          <p className={styles.footer}>
            © 2026 IDA CRM Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;

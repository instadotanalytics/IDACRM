// pages/auth/Login.jsx - FIXED (sessionStorage for tab isolation)
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaGraduationCap,
  FaEnvelope,
  FaLock,
  FaArrowRight,
} from "react-icons/fa";
import { authAPI } from "../../services/api";
import { saveAuth, getToken, getUser } from "../../services/auth";
import { useSocket } from "../../context/SocketContext";
import styles from "./Login.module.css";

const Login = () => {
  const navigate = useNavigate();
  const { reconnectSocket } = useSocket();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Redirect if already authenticated in THIS tab
  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (token && user?.role) {
      const dashboardMap = {
        super_admin: "/super-admin-dashboard",
        admin_manager: "/admin-dashboard",
        sales_executive: "/sales-dashboard",
        hr_executive: "/hr-dashboard",
        trainer: "/trainer-dashboard",
        counselor: "/counselor-dashboard",
      };
      const path = dashboardMap[user.role];
      if (path) navigate(path, { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData);

      if (response.data.success) {
        const { token, user } = response.data;

        // Save to sessionStorage (tab-isolated) — no more cross-tab contamination
        saveAuth(token, user, false);

        // Reconnect socket in this tab with the new token
        if (reconnectSocket) reconnectSocket(token);

        console.log("=== LOGIN SUCCESS ===");
        console.log("Name:", user.name, "| Role:", user.role);

        toast.success(`Welcome ${user.name}!`);

        const dashboardMap = {
          super_admin: "/super-admin-dashboard",
          admin_manager: "/admin-dashboard",
          sales_executive: "/sales-dashboard",
          hr_executive: "/hr-dashboard",
          trainer: "/trainer-dashboard",
          counselor: "/counselor-dashboard",
        };
        navigate(dashboardMap[user.role] || "/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />
      <div className={styles.blob3} aria-hidden="true" />

      <div className={styles.loginBox}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <FaGraduationCap />
          </div>
          <div className={styles.title}>IDA ERP CRM</div>
          <div className={styles.subtitle}>Sign in to your account</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrap}>
              <FaEnvelope className={styles.inputIcon} />
              <input
                type="email"
                name="email"
                className={styles.input}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <FaLock className={styles.inputIcon} />
              <input
                type="password"
                name="password"
                className={styles.input}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <Link to="/forgot-password" className={styles.forgotLink}>
            Forgot Password?
          </Link>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? (
              "Logging in..."
            ) : (
              <>
                {" "}
                Login <FaArrowRight className={styles.buttonArrow} />{" "}
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          © 2026 IDA ERP CRM. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;

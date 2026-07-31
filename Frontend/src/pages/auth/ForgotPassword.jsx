import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaGraduationCap,
  FaEnvelope,
  FaArrowRight,
  FaPaperPlane,
} from "react-icons/fa";
import api from "../../services/api";
import styles from "./ForgotPassword.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
      toast.success("Reset link sent to your email");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.blob1} aria-hidden="true" />
        <div className={styles.blob2} aria-hidden="true" />
        <div className={styles.blob3} aria-hidden="true" />

        <div className={styles.box}>
          <div className={styles.successBox}>
            <div className={styles.successIcon}>
              <FaPaperPlane />
            </div>
            <div className={styles.title}>Check your email</div>
            <div className={styles.subtitle}>
              We've sent a password reset link to
              <br />
              <strong className={styles.emailHighlight}>{email}</strong>
            </div>
            <Link to="/login" className={styles.backLink}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />
      <div className={styles.blob3} aria-hidden="true" />

      <div className={styles.box}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <FaGraduationCap />
          </div>
          <div className={styles.title}>Forgot Password?</div>
          <div className={styles.subtitle}>
            Enter your email to reset your password
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrap}>
              <FaEnvelope className={styles.inputIcon} />
              <input
                type="email"
                placeholder="Enter your email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? (
              "Sending..."
            ) : (
              <>
                Send Reset Link <FaArrowRight className={styles.buttonArrow} />
              </>
            )}
          </button>
        </form>

        <Link to="/login" className={styles.backLink}>
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;

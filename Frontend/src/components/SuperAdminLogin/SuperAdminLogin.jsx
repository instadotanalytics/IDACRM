import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserShield,
  FaChartLine,
  FaUsers,
  FaLockOpen,
  FaLayerGroup,
  FaCertificate,
  FaSignInAlt,
} from 'react-icons/fa';
import styles from './SuperAdminLogin.module.css';
import { superAdminAPI } from '../../services/api';

const FEATURES = [
  { icon: <FaLayerGroup />, text: 'Centralized dashboard control' },
  { icon: <FaUsers />,      text: 'Multi-tenant user management' },
  { icon: <FaChartLine />,  text: 'Real-time analytics & reports' },
  { icon: <FaLockOpen />,   text: 'Role-based access control' },
];

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role === 'super_admin') {
          console.log('Already logged in, redirecting to dashboard');
          navigate('/super-admin-dashboard');
        }
      } catch (e) {
        console.error('Error checking existing session:', e);
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await superAdminAPI.login(formData);
      console.log('Login Response:', response.data);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        console.log('Token stored:', !!localStorage.getItem('token'));
        console.log('User stored:', !!localStorage.getItem('user'));
        
        toast.success(`Welcome back, ${user.name}!`);
        
        // Use navigate instead of window.location for better React Router integration
        setTimeout(() => {
          navigate('/super-admin-dashboard');
        }, 100);
      }
    } catch (err) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* LEFT PANEL */}
        <div className={styles.left}>
          <div className={styles.leftInner}>
            <div className={styles.brandIcon}>
              <FaUserShield />
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

        {/* RIGHT PANEL */}
        <div className={styles.right}>
          <div className={styles.welcome}>
            <h2 className={styles.welcomeTitle}>Welcome back</h2>
            <p className={styles.welcomeSub}>Sign in to your super admin account</p>
          </div>

          {error && <div className={styles.errorBanner}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                <FaEnvelope className={styles.labelIcon} />
                Email address
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
                <FaLock className={styles.labelIcon} />
                Password
              </label>
              <div className={styles.pwWrap}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Signing in…
                </>
              ) : (
                <>
                  <FaSignInAlt />
                  Sign in
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

          <p className={styles.footer}>© 2024 IDA ERP CRM. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
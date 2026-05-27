import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserShield } from 'react-icons/fa';
import styles from './SuperAdminLogin.module.css';
import { authAPI } from '../../services/api';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      const response = await authAPI.login(formData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        toast.success(`Welcome back, ${response.data.user.name}!`);
        navigate('/super-admin-dashboard');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <FaUserShield />
          </div>
          <h1 className={styles.title}>IDA ERP CRM</h1>
          <p className={styles.subtitle}>Super Admin Portal</p>
        </div>

        <div className={styles.welcomeSection}>
          <h2 className={styles.welcomeTitle}>Welcome Back</h2>
          <p className={styles.welcomeSubtitle}>Sign in to continue</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              <FaEnvelope /> Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="superadmin@ida.com"
              autoComplete="email"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              <FaLock /> Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.loginButton}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.demoSection}>
          <div className={styles.demoTitle}>Demo Credentials</div>
          <div className={styles.demoInfo}>
            <p>📧 Email: superadmin@ida.com</p>
            <p>🔑 Password: admin123</p>
          </div>
        </div>

        <div className={styles.footer}>
          <p>© 2024 IDA ERP CRM. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
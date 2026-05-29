import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import styles from './ResetPassword.module.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('');
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tokenParam = params.get('token');
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            toast.error('Invalid reset link');
            navigate('/login');
        }
    }, [location, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/reset-password', {
                token: token,
                newPassword: formData.newPassword
            });

            toast.success('Password reset successful! Please login with your new password.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.box}>
                <div className={styles.title}>Reset Password</div>
                <div className={styles.subtitle}>Enter your new password</div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            className={styles.input}
                            placeholder="Enter new password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className={styles.input}
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <Link to="/login" className={styles.backLink}>Back to Login</Link>
            </div>
        </div>
    );
};

export default ResetPassword;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../services/api';
import styles from './Login.module.css';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authAPI.login(formData);

            if (response.data.success) {
                const { token, user } = response.data;

                // ✅ Clear old data first
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('userRole');
                
                // ✅ Store user with both _id and id for compatibility
                const userToStore = {
                    ...user,
                    _id: user._id || user.id,
                    id: user.id || user._id
                };
                
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userToStore));
                localStorage.setItem('userRole', user.role);

                console.log('=== LOGIN SUCCESS ===');
                console.log('User:', userToStore);
                console.log('User Name:', userToStore.name);
                console.log('User Role:', userToStore.role);
                console.log('User ID:', userToStore._id || userToStore.id);

                toast.success(`Welcome ${user.name}!`);

                // ✅ Role-based redirect
                switch (user.role) {
                    case 'super_admin':
                        navigate('/super-admin-dashboard');
                        break;
                    case 'admin_manager':
                        navigate('/admin-dashboard');
                        break;
                    case 'sales_executive':
                        navigate('/sales-dashboard');
                        break;
                    case 'hr_executive':
                        navigate('/hr-dashboard');
                        break;
                    case 'trainer':
                        navigate('/trainer-dashboard');
                        break;
                    case 'counselor':
                        navigate('/counselor-dashboard');
                        break;
                    default:
                        navigate('/dashboard');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>🏢</div>
                    <div className={styles.title}>IDA ERP CRM</div>
                    <div className={styles.subtitle}>Login to your account</div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address</label>
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

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
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

                    <Link to="/forgot-password" className={styles.forgotLink}>
                        Forgot Password?
                    </Link>

                    <button 
                        type="submit" 
                        className={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className={styles.footer}>
                    © 2024 IDA ERP CRM. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Login;
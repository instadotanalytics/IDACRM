import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'A';
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logo}>🏢 IDA ERP CRM - Admin Manager</div>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>{getInitial(user?.name)}</div>
                    <span className={styles.userName}>{user?.name || 'Admin'}</span>
                    <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.welcomeCard}>
                    <div className={styles.welcomeTitle}>Welcome, {user?.name || 'Admin'}! 👋</div>
                    <div className={styles.welcomeText}>Manage your team and monitor performance from here.</div>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Total Employees</div>
                        <div className={styles.statValue}>24</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Active Tasks</div>
                        <div className={styles.statValue}>12</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Pending Approvals</div>
                        <div className={styles.statValue}>5</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Attendance Today</div>
                        <div className={styles.statValue}>18</div>
                    </div>
                </div>

                <div className={styles.sectionCard}>
                    <h3 className={styles.sectionTitle}>Quick Actions</h3>
                    <div className={styles.quickActions}>
                        <button className={`${styles.actionBtn} ${styles.primaryBtn}`}>Manage Sales Team</button>
                        <button className={`${styles.actionBtn} ${styles.blueBtn}`}>Manage HR Team</button>
                        <button className={`${styles.actionBtn} ${styles.greenBtn}`}>View Reports</button>
                        <button className={`${styles.actionBtn} ${styles.orangeBtn}`}>Manage Tasks</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
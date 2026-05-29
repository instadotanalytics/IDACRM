import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import styles from './TrainerDashboard.module.css';

const TrainerDashboard = () => {
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
        return name ? name.charAt(0).toUpperCase() : 'T';
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logo}>🏢 IDA ERP CRM - Trainer</div>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>{getInitial(user?.name)}</div>
                    <span className={styles.userName}>{user?.name || 'Trainer'}</span>
                    <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.welcomeCard}>
                    <div className={styles.welcomeTitle}>Welcome, {user?.name || 'Trainer'}! 🎓</div>
                    <div className={styles.welcomeText}>Manage your batches, attendance, and assignments.</div>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Assigned Batches</div>
                        <div className={styles.statValue}>3</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Total Students</div>
                        <div className={styles.statValue}>68</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Attendance Today</div>
                        <div className={styles.statValue}>92%</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Pending Assignments</div>
                        <div className={styles.statValue}>12</div>
                    </div>
                </div>

                <div className={styles.sectionCard}>
                    <h3 className={styles.sectionTitle}>My Batches</h3>
                    <div className={styles.batchesList}>
                        <div className={styles.batchItem}>📚 Full Stack Development - Batch A (30 Students)</div>
                        <div className={styles.batchItem}>📚 Data Science - Batch B (22 Students)</div>
                        <div className={styles.batchItem}>📚 React Advanced - Batch C (16 Students)</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
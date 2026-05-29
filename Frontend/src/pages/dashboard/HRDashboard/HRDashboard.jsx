import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import styles from './HRDashboard.module.css';

const HRDashboard = () => {
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
        return name ? name.charAt(0).toUpperCase() : 'H';
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logo}>🏢 IDA ERP CRM - HR & Placement</div>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>{getInitial(user?.name)}</div>
                    <span className={styles.userName}>{user?.name || 'HR Executive'}</span>
                    <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.welcomeCard}>
                    <div className={styles.welcomeTitle}>Welcome, {user?.name || 'HR Executive'}! 👥</div>
                    <div className={styles.welcomeText}>Manage companies, placement drives, and student placements.</div>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Companies</div>
                        <div className={styles.statValue}>48</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Active Drives</div>
                        <div className={styles.statValue}>6</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Students Placed</div>
                        <div className={styles.statValue}>124</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Placement %</div>
                        <div className={styles.statValue}>72%</div>
                    </div>
                </div>

                <div className={styles.sectionCard}>
                    <h3 className={styles.sectionTitle}>Upcoming Placement Drives</h3>
                    <div className={styles.drivesList}>
                        <div className={styles.driveItem}>🎯 TCS - June 15, 2024 (10:00 AM)</div>
                        <div className={styles.driveItem}>🎯 Infosys - June 18, 2024 (11:00 AM)</div>
                        <div className={styles.driveItem}>🎯 Microsoft - June 22, 2024 (9:30 AM)</div>
                        <div className={styles.driveItem}>🎯 Amazon - June 25, 2024 (10:30 AM)</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import styles from './SalesDashboard.module.css';

const SalesDashboard = () => {
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
        return name ? name.charAt(0).toUpperCase() : 'S';
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logo}>🏢 IDA ERP CRM - Sales</div>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>{getInitial(user?.name)}</div>
                    <span className={styles.userName}>{user?.name || 'Sales Executive'}</span>
                    <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.welcomeCard}>
                    <div className={styles.welcomeTitle}>Welcome, {user?.name || 'Sales Executive'}! 📊</div>
                    <div className={styles.welcomeText}>Track your leads, calls, and conversions.</div>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Today's Calls</div>
                        <div className={styles.statValue}>24</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Leads Assigned</div>
                        <div className={styles.statValue}>45</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Conversions</div>
                        <div className={styles.statValue}>12</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Target Achievement</div>
                        <div className={styles.statValue}>68%</div>
                    </div>
                </div>

                <div className={styles.sectionCard}>
                    <h3 className={styles.sectionTitle}>Recent Leads</h3>
                    <div className={styles.leadsList}>
                        <div className={styles.leadItem}>1. Rahul Sharma - Interested in Full Stack (Follow-up: Tomorrow)</div>
                        <div className={styles.leadItem}>2. Priya Patel - Demo Scheduled (Today 3 PM)</div>
                        <div className={styles.leadItem}>3. Ankit Verma - New Lead (Call Pending)</div>
                        <div className={styles.leadItem}>4. Neha Gupta - Follow-up Done (Interested)</div>
                        <div className={styles.leadItem}>5. Amit Kumar - Converted to Admission</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;
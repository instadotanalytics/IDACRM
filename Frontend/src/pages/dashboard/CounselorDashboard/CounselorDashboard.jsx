import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import styles from './CounselorDashboard.module.css';

const CounselorDashboard = () => {
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
        return name ? name.charAt(0).toUpperCase() : 'C';
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logo}>🏢 IDA ERP CRM - Counselor</div>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>{getInitial(user?.name)}</div>
                    <span className={styles.userName}>{user?.name || 'Counselor'}</span>
                    <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.welcomeCard}>
                    <div className={styles.welcomeTitle}>Welcome, {user?.name || 'Counselor'}! 💬</div>
                    <div className={styles.welcomeText}>Manage leads, follow-ups, and student counselling.</div>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>New Leads</div>
                        <div className={styles.statValue}>28</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Follow-ups Today</div>
                        <div className={styles.statValue}>15</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Enquiries</div>
                        <div className={styles.statValue}>42</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statTitle}>Admissions</div>
                        <div className={styles.statValue}>8</div>
                    </div>
                </div>

                <div className={styles.sectionCard}>
                    <h3 className={styles.sectionTitle}>Pending Follow-ups</h3>
                    <div className={styles.followupsList}>
                        <div className={styles.followupItem}>📞 Rahul Sharma - Call back tomorrow</div>
                        <div className={styles.followupItem}>📞 Priya Patel - Send course details</div>
                        <div className={styles.followupItem}>📞 Ankit Verma - Schedule demo</div>
                        <div className={styles.followupItem}>📞 Neha Gupta - Share fee structure</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CounselorDashboard;
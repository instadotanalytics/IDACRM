import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaSearch, FaEye, FaPhone, FaEnvelope, FaPhoneAlt, FaArrowDown, FaArrowUp, FaCheckCircle, FaClock } from 'react-icons/fa';
import api from '../../../../services/api';
import styles from './CounselorCalls.module.css';

const CounselorCalls = () => {
    const [loading, setLoading] = useState(false);
    const [calls, setCalls] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Stats
    const [stats, setStats] = useState({
        totalCallsToday: 0,
        outgoing: 0,
        incoming: 0,
        connected: 0,
        totalDuration: 0
    });

    useEffect(() => {
        fetchCalls();
    }, []);

    const fetchCalls = async () => {
        setLoading(true);
        try {
            const response = await api.get('/calls');
            if (response.data.success) {
                setCalls(response.data.data);
                calculateStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching calls:', error);
            toast.error('Failed to fetch call history');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (callsData) => {
        const today = new Date().toDateString();
        const todayCalls = callsData.filter(call => new Date(call.createdAt).toDateString() === today);
        
        setStats({
            totalCallsToday: todayCalls.length,
            outgoing: callsData.filter(call => call.type === 'Outgoing').length,
            incoming: callsData.filter(call => call.type === 'Incoming').length,
            connected: callsData.filter(call => call.status === 'Connected').length,
            totalDuration: callsData.reduce((sum, call) => sum + (parseInt(call.duration) || 0), 0)
        });
    };

    const filteredCalls = calls.filter(call =>
        call.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.phone?.includes(searchTerm) ||
        call.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <FaSpinner className={styles.spinner} /> Loading call history...
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h2>Call Logs</h2>
                    <p className={styles.subHeader}>Manually record and manage all your calls</p>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.searchBox}>
                        <FaSearch />
                        <input 
                            type="text" 
                            placeholder="Search by name, phone or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><FaPhoneAlt /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.totalCallsToday}</span>
                        <span className={styles.statLabel}>Total Calls Today</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><FaArrowUp /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.outgoing}</span>
                        <span className={styles.statLabel}>Outgoing</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><FaArrowDown /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.incoming}</span>
                        <span className={styles.statLabel}>Incoming</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><FaCheckCircle /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.connected}</span>
                        <span className={styles.statLabel}>Connected</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><FaClock /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.totalDuration} min</span>
                        <span className={styles.statLabel}>Total Duration</span>
                    </div>
                </div>
            </div>

            {/* All Call History Table */}
            <div className={styles.tableSection}>
                <h3>All Call History</h3>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Type</th>
                                <th>Lead Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Course</th>
                                <th>Status</th>
                                <th>Duration</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCalls.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className={styles.emptyCell}>No call records found</td>
                                </tr>
                            ) : (
                                filteredCalls.map(call => (
                                    <tr key={call._id}>
                                        <td>{new Date(call.createdAt).toLocaleString()}</td>
                                        <td>
                                            <span className={`${styles.typeBadge} ${styles[call.type?.toLowerCase()]}`}>
                                                {call.type || 'Outgoing'}
                                            </span>
                                        </td>
                                        <td><strong>{call.leadName}</strong></td>
                                        <td><FaPhone className={styles.phoneIcon} /> {call.phone}</td>
                                        <td><FaEnvelope className={styles.emailIcon} /> {call.email}</td>
                                        <td>{call.course}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[call.status?.toLowerCase().replace(' ', '')]}`}>
                                                {call.status}
                                            </span>
                                        </td>
                                        <td>{call.duration} min</td>
                                        <td>
                                            <button className={styles.actionBtn} title="View Details">
                                                <FaEye />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CounselorCalls;
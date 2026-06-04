import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaSearch, FaUserGraduate } from 'react-icons/fa';
import api from '../../../../services/api';
import styles from './CounselorAdmissions.module.css';

const CounselorAdmissions = () => {
    const [loading, setLoading] = useState(false);
    const [admissions, setAdmissions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAdmissions();
    }, []);

    const fetchAdmissions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admissions');
            if (response.data.success) {
                setAdmissions(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching admissions:', error);
            toast.error('Failed to fetch admissions');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            'active': styles.badgeActive,
            'inactive': styles.badgeInactive,
            'completed': styles.badgeCompleted
        };
        return <span className={`${styles.badge} ${map[status] || ''}`}>{status}</span>;
    };

    const filteredAdmissions = admissions.filter(ad =>
        ad.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.enrollmentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <FaSpinner className={styles.spinner} /> Loading admissions...
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Student Admissions</h3>
                <div className={styles.searchBox}>
                    <FaSearch />
                    <input 
                        type="text" 
                        placeholder="Search by name, email or enrollment ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Course</th>
                            <th>Enrollment ID</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAdmissions.length === 0 ? (
                            <tr>
                                <td colSpan="7" className={styles.emptyCell}>No admissions found</td>
                            </tr>
                        ) : (
                            filteredAdmissions.map(ad => (
                                <tr key={ad._id}>
                                    <td><strong>{ad.name}</strong></td>
                                    <td>{ad.email}</td>
                                    <td>{ad.phone}</td>
                                    <td>{ad.course}</td>
                                    <td><FaUserGraduate className={styles.enrollIcon} /> {ad.enrollmentId}</td>
                                    <td>{getStatusBadge(ad.status)}</td>
                                    <td>{new Date(ad.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CounselorAdmissions;
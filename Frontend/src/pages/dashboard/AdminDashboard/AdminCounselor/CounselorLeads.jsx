import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaEye, FaEdit, FaTrash, FaSpinner, FaSearch } from 'react-icons/fa';
import api from '../../../../services/api';
import styles from './CounselorLeads.module.css';

const CounselorLeads = () => {
    const [loading, setLoading] = useState(false);
    const [leads, setLeads] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const response = await api.get('/leads');
            if (response.data.success) {
                setLeads(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
            toast.error('Failed to fetch leads');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            'New': styles.badgeNew,
            'Contacted': styles.badgeContacted,
            'Interested': styles.badgeInterested,
            'Follow-up': styles.badgeFollowup,
            'Converted': styles.badgeConverted,
            'Lost': styles.badgeLost
        };
        return <span className={`${styles.badge} ${map[status] || ''}`}>{status}</span>;
    };

    const filteredLeads = leads.filter(lead =>
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <FaSpinner className={styles.spinner} /> Loading leads...
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>All Leads</h3>
                <div className={styles.searchBox}>
                    <FaSearch />
                    <input 
                        type="text" 
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Course</th>
                            <th>Status</th>
                            <th>Source</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeads.length === 0 ? (
                            <tr>
                                <td colSpan="7" className={styles.emptyCell}>No leads found</td>
                            </tr>
                        ) : (
                            filteredLeads.map(lead => (
                                <tr key={lead._id}>
                                    <td><strong>{lead.name}</strong></td>
                                    <td>{lead.email || '-'}</td>
                                    <td>{lead.phone}</td>
                                    <td>{lead.courseInterest}</td>
                                    <td>{getStatusBadge(lead.status)}</td>
                                    <td>{lead.source}</td>
                                    <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                                 </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CounselorLeads;
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaPhone,
    FaSpinner, FaTimes, FaCheck, FaFilter, FaDownload,
    FaClock, FaCalendarAlt, FaUser, FaEnvelope, FaPhoneAlt,
    FaBuilding, FaBookOpen, FaComments, FaChartLine
} from 'react-icons/fa';
import api from '../../../../services/api';
import styles from './Leads.module.css';

const Leads = () => {
    const [loading, setLoading] = useState(false);
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showCallModal, setShowCallModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [editingLead, setEditingLead] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterSource, setFilterSource] = useState('all');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        source: 'Just Dial',
        courseInterest: '',
        status: 'New',
        followUpDate: '',
        followUpTime: '',
        followUpNotes: '',
        counsellorNotes: '',
        preferredBatch: '',
        budget: ''
    });

    const [callData, setCallData] = useState({
        duration: '',
        notes: '',
        callType: 'Outgoing'
    });

    useEffect(() => {
        fetchLeads();
    }, [filterStatus, filterSource, searchTerm]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterStatus !== 'all') params.status = filterStatus;
            if (filterSource !== 'all') params.source = filterSource;
            if (searchTerm) params.search = searchTerm;

            const response = await api.get('/leads', { params });
            if (response.data.success) {
                setLeads(response.data.data);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
            toast.error('Failed to fetch leads');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let response;
            if (editingLead) {
                response = await api.put(`/leads/${editingLead._id}`, formData);
                toast.success('Lead updated successfully');
            } else {
                response = await api.post('/leads', formData);
                toast.success('Lead created successfully');
            }
            
            if (response.data.success) {
                setShowModal(false);
                setEditingLead(null);
                setFormData({
                    name: '', email: '', phone: '', source: 'Just Dial',
                    courseInterest: '', status: 'New', followUpDate: '',
                    followUpTime: '', followUpNotes: '', counsellorNotes: '',
                    preferredBatch: '', budget: ''
                });
                fetchLeads();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Delete lead "${name}"?`)) {
            setLoading(true);
            try {
                const response = await api.delete(`/leads/${id}`);
                if (response.data.success) {
                    toast.success('Lead deleted successfully');
                    fetchLeads();
                }
            } catch (error) {
                toast.error('Delete failed');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAddCall = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post(`/leads/${selectedLead._id}/call`, callData);
            if (response.data.success) {
                toast.success('Call log added');
                setShowCallModal(false);
                setCallData({ duration: '', notes: '', callType: 'Outgoing' });
                fetchLeads();
            }
        } catch (error) {
            toast.error('Failed to add call log');
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
            'Demo Scheduled': styles.badgeDemo,
            'Converted': styles.badgeConverted,
            'Lost': styles.badgeLost,
            'Not Interested': styles.badgeLost
        };
        return <span className={`${styles.badge} ${map[status] || ''}`}>{status}</span>;
    };

    const getSourceIcon = (source) => {
        switch(source) {
            case 'Just Dial': return '🔍';
            case 'Google': return '🌐';
            case 'Facebook': return '📘';
            case 'Instagram': return '📷';
            case 'Reference': return '👥';
            default: return '📞';
        }
    };

    const StatsCards = () => (
        <div className={styles.statsGrid}>
            <div className={styles.statCard}>
                <div className={styles.statIcon}><FaChartLine /></div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.total || 0}</span>
                    <span className={styles.statLabel}>Total Leads</span>
                </div>
            </div>
            <div className={`${styles.statCard} ${styles.newCard}`}>
                <div className={styles.statIcon}>🆕</div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.new || 0}</span>
                    <span className={styles.statLabel}>New</span>
                </div>
            </div>
            <div className={`${styles.statCard} ${styles.contactedCard}`}>
                <div className={styles.statIcon}>📞</div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.contacted || 0}</span>
                    <span className={styles.statLabel}>Contacted</span>
                </div>
            </div>
            <div className={`${styles.statCard} ${styles.interestedCard}`}>
                <div className={styles.statIcon}>⭐</div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.interested || 0}</span>
                    <span className={styles.statLabel}>Interested</span>
                </div>
            </div>
            <div className={`${styles.statCard} ${styles.followupCard}`}>
                <div className={styles.statIcon}>⏰</div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.followup || 0}</span>
                    <span className={styles.statLabel}>Follow-up</span>
                </div>
            </div>
            <div className={`${styles.statCard} ${styles.convertedCard}`}>
                <div className={styles.statIcon}>✅</div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.converted || 0}</span>
                    <span className={styles.statLabel}>Converted</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIcon}><FaUser /></div>
                    <div>
                        <h1 className={styles.headerTitle}>Leads Management</h1>
                        <p className={styles.headerSub}>Track and manage all your leads from Just Dial and other sources</p>
                    </div>
                </div>
                <button className={styles.createBtn} onClick={() => { setEditingLead(null); setShowModal(true); }}>
                    <FaPlus /> Add New Lead
                </button>
            </div>

            {/* Stats Cards */}
            <StatsCards />

            {/* Filter Bar */}
            <div className={styles.filterBar}>
                <div className={styles.searchBox}>
                    <FaSearch />
                    <input 
                        type="text" 
                        placeholder="Search by name, email or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className={styles.clearSearch} onClick={() => setSearchTerm('')}>
                            <FaTimes />
                        </button>
                    )}
                </div>
                
                <div className={styles.filterGroup}>
                    <select 
                        className={styles.filterSelect}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interested">Interested</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Demo Scheduled">Demo Scheduled</option>
                        <option value="Converted">Converted</option>
                    </select>
                    
                    <select 
                        className={styles.filterSelect}
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                    >
                        <option value="all">All Sources</option>
                        <option value="Just Dial">Just Dial</option>
                        <option value="Google">Google</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Reference">Reference</option>
                    </select>
                </div>
            </div>

            {/* Leads Table */}
            <div className={styles.tableWrapper}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <FaSpinner className={styles.spinner} /> Loading leads...
                    </div>
                ) : leads.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FaUser className={styles.emptyIcon} />
                        <h3>No leads found</h3>
                        <p>Add your first lead using the "Add New Lead" button</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Lead Info</th>
                                <th>Contact</th>
                                <th>Course</th>
                                <th>Source</th>
                                <th>Status</th>
                                <th>Follow-up</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map(lead => (
                                <tr key={lead._id}>
                                    <td>
                                        <div className={styles.leadCell}>
                                            <div className={styles.leadName}>{lead.name}</div>
                                            <div className={styles.leadId}>{lead.leadId}</div>
                                        </div>
                                    </td>
                                    <td className={styles.contactCell}>
                                        <div>{lead.phone}</div>
                                        {lead.email && <div className={styles.leadEmail}>{lead.email}</div>}
                                    </td>
                                    <td>{lead.courseInterest}</td>
                                    <td className={styles.sourceCell}>
                                        <span className={styles.sourceIcon}>{getSourceIcon(lead.source)}</span> {lead.source}
                                    </td>
                                    <td>{getStatusBadge(lead.status)}</td>
                                    <td>
                                        {lead.followUpDate && (
                                            <div className={styles.followupDate}>
                                                <FaCalendarAlt /> {new Date(lead.followUpDate).toLocaleDateString()}
                                            </div>
                                        )}
                                    </td>
                                    <td className={styles.actionBtns}>
                                        <button className={styles.btnView} onClick={() => { setSelectedLead(lead); setShowViewModal(true); }} title="View">
                                            <FaEye />
                                        </button>
                                        <button className={styles.btnCall} onClick={() => { setSelectedLead(lead); setShowCallModal(true); }} title="Add Call">
                                            <FaPhone />
                                        </button>
                                        <button className={styles.btnEdit} onClick={() => { setEditingLead(lead); setFormData(lead); setShowModal(true); }} title="Edit">
                                            <FaEdit />
                                        </button>
                                        <button className={styles.btnDelete} onClick={() => handleDelete(lead._id, lead.name)} title="Delete">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingLead ? 'Edit Lead' : 'Add New Lead'}</h3>
                            <button onClick={() => setShowModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Full Name *</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Phone Number *</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Lead Source</label>
                                        <select name="source" value={formData.source} onChange={handleChange}>
                                            <option value="Just Dial">Just Dial</option>
                                            <option value="Google">Google</option>
                                            <option value="Facebook">Facebook</option>
                                            <option value="Instagram">Instagram</option>
                                            <option value="Reference">Reference</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Course Interest *</label>
                                        <input type="text" name="courseInterest" value={formData.courseInterest} onChange={handleChange} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Status</label>
                                        <select name="status" value={formData.status} onChange={handleChange}>
                                            <option value="New">New</option>
                                            <option value="Contacted">Contacted</option>
                                            <option value="Interested">Interested</option>
                                            <option value="Follow-up">Follow-up</option>
                                            <option value="Demo Scheduled">Demo Scheduled</option>
                                            <option value="Converted">Converted</option>
                                            <option value="Lost">Lost</option>
                                        </select>
                                    </div>
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Follow-up Date</label>
                                        <input type="date" name="followUpDate" value={formData.followUpDate} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Follow-up Time</label>
                                        <input type="time" name="followUpTime" value={formData.followUpTime} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Follow-up Notes</label>
                                    <textarea name="followUpNotes" rows="2" value={formData.followUpNotes} onChange={handleChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Counsellor Notes</label>
                                    <textarea name="counsellorNotes" rows="2" value={formData.counsellorNotes} onChange={handleChange} />
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Preferred Batch</label>
                                        <input type="text" name="preferredBatch" value={formData.preferredBatch} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Budget (₹)</label>
                                        <input type="text" name="budget" value={formData.budget} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className={styles.saveBtn} disabled={loading}>
                                    {loading ? <FaSpinner className={styles.spin} /> : <FaCheck />}
                                    {editingLead ? 'Update Lead' : 'Create Lead'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && selectedLead && (
                <div className={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3><FaEye /> Lead Details</h3>
                            <button onClick={() => setShowViewModal(false)}><FaTimes /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.viewRow}>
                                <div className={styles.viewLabel}>Name</div>
                                <div className={styles.viewValue}>{selectedLead.name}</div>
                            </div>
                            <div className={styles.viewRow}>
                                <div className={styles.viewLabel}>Phone</div>
                                <div className={styles.viewValue}>{selectedLead.phone}</div>
                            </div>
                            <div className={styles.viewRow}>
                                <div className={styles.viewLabel}>Email</div>
                                <div className={styles.viewValue}>{selectedLead.email || '-'}</div>
                            </div>
                            <div className={styles.viewRow}>
                                <div className={styles.viewLabel}>Course Interest</div>
                                <div className={styles.viewValue}>{selectedLead.courseInterest}</div>
                            </div>
                            <div className={styles.viewRow}>
                                <div className={styles.viewLabel}>Source</div>
                                <div className={styles.viewValue}>{selectedLead.source}</div>
                            </div>
                            <div className={styles.viewRow}>
                                <div className={styles.viewLabel}>Status</div>
                                <div className={styles.viewValue}>{getStatusBadge(selectedLead.status)}</div>
                            </div>
                            {selectedLead.followUpDate && (
                                <div className={styles.viewRow}>
                                    <div className={styles.viewLabel}>Follow-up</div>
                                    <div className={styles.viewValue}>
                                        {new Date(selectedLead.followUpDate).toLocaleDateString()} {selectedLead.followUpTime}
                                    </div>
                                </div>
                            )}
                            {selectedLead.counsellorNotes && (
                                <div className={styles.viewRow}>
                                    <div className={styles.viewLabel}>Notes</div>
                                    <div className={styles.viewValue}>{selectedLead.counsellorNotes}</div>
                                </div>
                            )}
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowViewModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Call Log Modal */}
            {showCallModal && selectedLead && (
                <div className={styles.modalOverlay} onClick={() => setShowCallModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3><FaPhone /> Add Call Log - {selectedLead.name}</h3>
                            <button onClick={() => setShowCallModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleAddCall}>
                            <div className={styles.modalBody}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Call Type</label>
                                        <select name="callType" value={callData.callType} onChange={(e) => setCallData({...callData, callType: e.target.value})}>
                                            <option value="Outgoing">Outgoing</option>
                                            <option value="Incoming">Incoming</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Duration (minutes)</label>
                                        <input type="text" name="duration" value={callData.duration} onChange={(e) => setCallData({...callData, duration: e.target.value})} placeholder="e.g., 5 mins" />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Call Notes</label>
                                    <textarea name="notes" rows="3" value={callData.notes} onChange={(e) => setCallData({...callData, notes: e.target.value})} placeholder="What was discussed?" />
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowCallModal(false)}>Cancel</button>
                                <button type="submit" className={styles.saveBtn} disabled={loading}>
                                    {loading ? <FaSpinner className={styles.spin} /> : <FaCheck />}
                                    Add Call Log
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leads;
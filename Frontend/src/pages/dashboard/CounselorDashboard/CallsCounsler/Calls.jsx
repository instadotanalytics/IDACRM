import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
    FaPhone, FaPhoneAlt, FaPhoneSlash, FaCalendarAlt,
    FaSpinner, FaSearch, FaPlus, FaEdit, FaTrash,
    FaEye, FaTimes, FaCheck, FaClock, FaChartLine,
    FaArrowUp, FaArrowDown, FaUser, FaEnvelope, FaBook,
    FaFilter, FaDownload
} from 'react-icons/fa';
import api from '../../../../services/api';
import styles from './Calls.module.css';

// ─────────────────────────────────────────────
// Helper functions (outside component)
// ─────────────────────────────────────────────
const formatDuration = (minutes) => {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};

const getStatusIcon = (status, stylesObj) => {
    switch (status) {
        case 'Connected': return <FaCheck className={stylesObj.statusConnected} />;
        case 'Not Answered': return <FaPhoneSlash className={stylesObj.statusNotAnswered} />;
        case 'Busy': return <FaPhoneSlash className={stylesObj.statusBusy} />;
        default: return <FaPhone className={stylesObj.statusDefault} />;
    }
};

const getCallTypeIcon = (type, stylesObj) => {
    return type === 'Outgoing'
        ? <FaArrowUp className={stylesObj.outgoing} />
        : <FaArrowDown className={stylesObj.incoming} />;
};

const getStatusBadge = (status, stylesObj) => {
    const map = {
        'Connected': stylesObj.badgeConnected,
        'Not Answered': stylesObj.badgeNotAnswered,
        'Busy': stylesObj.badgeBusy,
        'Wrong Number': stylesObj.badgeWrongNumber
    };
    return <span className={`${stylesObj.badge} ${map[status] || ''}`}>{status}</span>;
};

const DEFAULT_FORM = {
    leadName: '',
    leadPhone: '',
    leadEmail: '',
    courseInterest: '',
    callType: 'Outgoing',
    callStatus: 'Connected',
    duration: '',
    callTime: new Date().toISOString().slice(0, 16),
    notes: '',
    followUpRequired: false,
    followUpDate: ''
};

// ─────────────────────────────────────────────
// StatsCards — moved OUTSIDE Calls
// ─────────────────────────────────────────────
const StatsCards = ({ stats, stylesObj }) => (
    <div className={stylesObj.statsGrid}>
        <div className={stylesObj.statCard}>
            <div className={stylesObj.statIcon}><FaPhoneAlt /></div>
            <div className={stylesObj.statInfo}>
                <span className={stylesObj.statValue}>{stats.total}</span>
                <span className={stylesObj.statLabel}>Total Calls Today</span>
            </div>
        </div>
        <div className={stylesObj.statCard}>
            <div className={stylesObj.statIcon}><FaArrowUp /></div>
            <div className={stylesObj.statInfo}>
                <span className={stylesObj.statValue}>{stats.outgoing}</span>
                <span className={stylesObj.statLabel}>Outgoing</span>
            </div>
        </div>
        <div className={stylesObj.statCard}>
            <div className={stylesObj.statIcon}><FaArrowDown /></div>
            <div className={stylesObj.statInfo}>
                <span className={stylesObj.statValue}>{stats.incoming}</span>
                <span className={stylesObj.statLabel}>Incoming</span>
            </div>
        </div>
        <div className={stylesObj.statCard}>
            <div className={stylesObj.statIcon}><FaCheck /></div>
            <div className={stylesObj.statInfo}>
                <span className={stylesObj.statValue}>{stats.connected}</span>
                <span className={stylesObj.statLabel}>Connected</span>
            </div>
        </div>
        <div className={stylesObj.statCard}>
            <div className={stylesObj.statIcon}><FaClock /></div>
            <div className={stylesObj.statInfo}>
                <span className={stylesObj.statValue}>{formatDuration(stats.totalDuration)}</span>
                <span className={stylesObj.statLabel}>Total Duration</span>
            </div>
        </div>
    </div>
);

// ─────────────────────────────────────────────
// WeeklyChart — moved OUTSIDE Calls
// ─────────────────────────────────────────────
const WeeklyChart = ({ weeklyStats, stylesObj }) => (
    <div className={stylesObj.chartCard}>
        <h3>Weekly Call Activity</h3>
        <div className={stylesObj.barChart}>
            {weeklyStats.map((day, idx) => (
                <div key={idx} className={stylesObj.barItem}>
                    <div className={stylesObj.barLabel}>{day.date}</div>
                    <div className={stylesObj.barWrapper}>
                        <div
                            className={stylesObj.bar}
                            style={{ height: `${Math.min(day.calls * 15, 100)}%` }}
                        >
                            <span className={stylesObj.barValue}>{day.calls}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// ─────────────────────────────────────────────
// TodayCallsTable — moved OUTSIDE Calls
// ─────────────────────────────────────────────
const TodayCallsTable = ({ todayCalls, onAdd, onView, onEdit, onDelete, stylesObj }) => (
    <div className={stylesObj.tableCard}>
        <div className={stylesObj.tableHeader}>
            <h3>Today's Call Logs</h3>
            <button className={stylesObj.addBtn} onClick={onAdd}>
                <FaPlus /> Add Call
            </button>
        </div>
        <div className={stylesObj.tableWrapper}>
            <table className={stylesObj.table}>
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Lead Name</th>
                        <th>Phone</th>
                        <th>Course</th>
                        <th>Status</th>
                        <th>Duration</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {todayCalls.length === 0 ? (
                        <tr><td colSpan="8" className={stylesObj.emptyCell}>No calls today</td></tr>
                    ) : (
                        todayCalls.map(call => (
                            <tr key={call._id}>
                                <td>{new Date(call.callTime).toLocaleTimeString()}</td>
                                <td>{getCallTypeIcon(call.callType, stylesObj)} {call.callType}</td>
                                <td><strong>{call.leadName}</strong></td>
                                <td>{call.leadPhone}</td>
                                <td>{call.courseInterest || '-'}</td>
                                <td>{getStatusIcon(call.callStatus, stylesObj)} {call.callStatus}</td>
                                <td>{formatDuration(call.duration)}</td>
                                <td className={stylesObj.actionBtns}>
                                    <button className={stylesObj.viewBtn} onClick={() => onView(call)} title="View"><FaEye /></button>
                                    <button className={stylesObj.editBtn} onClick={() => onEdit(call)} title="Edit"><FaEdit /></button>
                                    <button className={stylesObj.deleteBtn} onClick={() => onDelete(call._id)} title="Delete"><FaTrash /></button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// ─────────────────────────────────────────────
// AllCallsTable — moved OUTSIDE Calls
// ─────────────────────────────────────────────
const AllCallsTable = ({
    filteredCalls, searchTerm, filterType, filterStatus,
    onSearchChange, onTypeChange, onStatusChange, onClearFilters,
    onView, onEdit, onDelete, stylesObj
}) => (
    <div className={stylesObj.tableCard}>
        <div className={stylesObj.tableHeader}>
            <h3>All Call History</h3>
            <div className={stylesObj.filterGroup}>
                <div className={stylesObj.searchBox}>
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search by name, phone or email..."
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                </div>
                <select className={stylesObj.filterSelect} value={filterType} onChange={onTypeChange}>
                    <option value="all">All Types</option>
                    <option value="Outgoing">Outgoing</option>
                    <option value="Incoming">Incoming</option>
                </select>
                <select className={stylesObj.filterSelect} value={filterStatus} onChange={onStatusChange}>
                    <option value="all">All Status</option>
                    <option value="Connected">Connected</option>
                    <option value="Not Answered">Not Answered</option>
                    <option value="Busy">Busy</option>
                    <option value="Wrong Number">Wrong Number</option>
                </select>
                {(filterType !== 'all' || filterStatus !== 'all' || searchTerm) && (
                    <button className={stylesObj.clearFilters} onClick={onClearFilters}>Clear Filters</button>
                )}
            </div>
        </div>
        <div className={stylesObj.tableWrapper}>
            <table className={stylesObj.table}>
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
                        <tr><td colSpan="9" className={stylesObj.emptyCell}>No calls found</td></tr>
                    ) : (
                        filteredCalls.map(call => (
                            <tr key={call._id}>
                                <td>
                                    {new Date(call.callTime).toLocaleDateString()}
                                    <br />
                                    <small>{new Date(call.callTime).toLocaleTimeString()}</small>
                                </td>
                                <td>{getCallTypeIcon(call.callType, stylesObj)} {call.callType}</td>
                                <td><strong>{call.leadName}</strong></td>
                                <td>{call.leadPhone}</td>
                                <td>{call.leadEmail || '-'}</td>
                                <td>{call.courseInterest || '-'}</td>
                                <td>{getStatusIcon(call.callStatus, stylesObj)} {call.callStatus}</td>
                                <td>{formatDuration(call.duration)}</td>
                                <td className={stylesObj.actionBtns}>
                                    <button className={stylesObj.viewBtn} onClick={() => onView(call)}><FaEye /></button>
                                    <button className={stylesObj.editBtn} onClick={() => onEdit(call)}><FaEdit /></button>
                                    <button className={stylesObj.deleteBtn} onClick={() => onDelete(call._id)}><FaTrash /></button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// ─────────────────────────────────────────────
// CallModal — moved OUTSIDE Calls
// ─────────────────────────────────────────────
const CallModal = ({ editingCall, callForm, loading, onClose, onChange, onSubmit }) => (
    <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
                <h3><FaPhone /> {editingCall ? 'Edit Call Log' : 'Add New Call'}</h3>
                <button onClick={onClose}><FaTimes /></button>
            </div>
            <form onSubmit={onSubmit}>
                <div className={styles.modalBody}>

                    <div className={styles.formSection}>
                        <h4>Lead Information (Manual Entry)</h4>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Lead Name *</label>
                                <input
                                    type="text"
                                    name="leadName"
                                    value={callForm.leadName}
                                    onChange={onChange}
                                    placeholder="Enter lead full name"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="leadPhone"
                                    value={callForm.leadPhone}
                                    onChange={onChange}
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="leadEmail"
                                    value={callForm.leadEmail}
                                    onChange={onChange}
                                    placeholder="Enter email address"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Course Interest</label>
                                <input
                                    type="text"
                                    name="courseInterest"
                                    value={callForm.courseInterest}
                                    onChange={onChange}
                                    placeholder="Enter course name"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h4>Call Details</h4>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Call Type</label>
                                <select name="callType" value={callForm.callType} onChange={onChange}>
                                    <option value="Outgoing">Outgoing</option>
                                    <option value="Incoming">Incoming</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Call Status</label>
                                <select name="callStatus" value={callForm.callStatus} onChange={onChange}>
                                    <option value="Connected">Connected</option>
                                    <option value="Not Answered">Not Answered</option>
                                    <option value="Busy">Busy</option>
                                    <option value="Wrong Number">Wrong Number</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Call Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="callTime"
                                    value={callForm.callTime}
                                    onChange={onChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Duration (minutes)</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={callForm.duration}
                                    onChange={onChange}
                                    placeholder="e.g., 5"
                                    min="0"
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Call Notes</label>
                            <textarea
                                rows="3"
                                name="notes"
                                value={callForm.notes}
                                onChange={onChange}
                                placeholder="What was discussed in the call?"
                            />
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h4>Follow-up Settings</h4>
                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="followUpRequired"
                                    checked={callForm.followUpRequired}
                                    onChange={onChange}
                                />
                                Follow-up Required
                            </label>
                        </div>
                        {callForm.followUpRequired && (
                            <div className={styles.formGroup}>
                                <label>Follow-up Date</label>
                                <input
                                    type="date"
                                    name="followUpDate"
                                    value={callForm.followUpDate}
                                    onChange={onChange}
                                />
                            </div>
                        )}
                    </div>

                </div>
                <div className={styles.modalFooter}>
                    <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button type="submit" className={styles.saveBtn} disabled={loading}>
                        {loading ? <FaSpinner className={styles.spinner} /> : <FaCheck />}
                        {editingCall ? 'Update Call' : 'Add Call'}
                    </button>
                </div>
            </form>
        </div>
    </div>
);

// ─────────────────────────────────────────────
// ViewModal — moved OUTSIDE Calls
// ─────────────────────────────────────────────
const ViewModal = ({ selectedCall, onClose, onEdit, stylesObj }) => (
    <div className={stylesObj.modalOverlay} onClick={onClose}>
        <div className={stylesObj.modal} onClick={(e) => e.stopPropagation()}>
            <div className={stylesObj.modalHeader}>
                <h3><FaEye /> Call Details</h3>
                <button onClick={onClose}><FaTimes /></button>
            </div>
            <div className={stylesObj.modalBody}>
                <div className={stylesObj.viewSection}>
                    <h4>Lead Information</h4>
                    <div className={stylesObj.viewRow}><div className={stylesObj.viewLabel}>Name</div><div className={stylesObj.viewValue}>{selectedCall?.leadName}</div></div>
                    <div className={stylesObj.viewRow}><div className={stylesObj.viewLabel}>Phone</div><div className={stylesObj.viewValue}>{selectedCall?.leadPhone}</div></div>
                    <div className={stylesObj.viewRow}><div className={stylesObj.viewLabel}>Email</div><div className={stylesObj.viewValue}>{selectedCall?.leadEmail || '-'}</div></div>
                    <div className={stylesObj.viewRow}><div className={stylesObj.viewLabel}>Course Interest</div><div className={stylesObj.viewValue}>{selectedCall?.courseInterest || '-'}</div></div>
                </div>
                <div className={stylesObj.viewSection}>
                    <h4>Call Information</h4>
                    <div className={stylesObj.viewRow}><div className={stylesObj.viewLabel}>Call Time</div><div className={stylesObj.viewValue}>{new Date(selectedCall?.callTime).toLocaleString()}</div></div>
                    <div className={stylesObj.viewRow}><div className={stylesObj.viewLabel}>Call Type</div><div className={stylesObj.viewValue}>{selectedCall?.callType}</div></div>
                    <div className={stylesObj.viewRow}><div className={stylesObj.viewLabel}>Call Status</div><div className={stylesObj.viewValue}>{getStatusBadge(selectedCall?.callStatus, stylesObj)}</div></div>
                    <div className={stylesObj.viewRow}><div className={stylesObj.viewLabel}>Duration</div><div className={stylesObj.viewValue}>{formatDuration(selectedCall?.duration)}</div></div>
                    <div className={stylesObj.viewRow}><div className={stylesObj.viewLabel}>Notes</div><div className={stylesObj.viewValue}>{selectedCall?.notes || '-'}</div></div>
                </div>
            </div>
            <div className={stylesObj.modalFooter}>
                <button className={stylesObj.cancelBtn} onClick={onClose}>Close</button>
                <button className={stylesObj.editBtn} onClick={() => { onClose(); onEdit(selectedCall); }}>Edit Call</button>
            </div>
        </div>
    </div>
);

// ─────────────────────────────────────────────
// Main Calls Component
// ─────────────────────────────────────────────
const Calls = () => {
    const [loading, setLoading] = useState(false);
    const [todayCalls, setTodayCalls] = useState([]);
    const [weeklyStats, setWeeklyStats] = useState([]);
    const [allCalls, setAllCalls] = useState([]);
    const [stats, setStats] = useState({
        total: 0, outgoing: 0, incoming: 0,
        connected: 0, notAnswered: 0, totalDuration: 0
    });
    const [activeTab, setActiveTab] = useState('today');
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedCall, setSelectedCall] = useState(null);
    const [editingCall, setEditingCall] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [callForm, setCallForm] = useState(DEFAULT_FORM);

    useEffect(() => {
        fetchTodayCalls();
        fetchWeeklyStats();
        fetchAllCalls();
    }, []);

    useEffect(() => {
        fetchAllCalls();
    }, [filterType, filterStatus, searchTerm]);

    const fetchTodayCalls = async () => {
        setLoading(true);
        try {
            const response = await api.get('/calls/today');
            if (response.data.success) {
                setTodayCalls(response.data.data);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching today calls:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWeeklyStats = async () => {
        try {
            const response = await api.get('/calls/weekly');
            if (response.data.success) setWeeklyStats(response.data.data);
        } catch (error) {
            console.error('Error fetching weekly stats:', error);
        }
    };

    const fetchAllCalls = async () => {
        try {
            const params = {};
            if (filterType !== 'all') params.callType = filterType;
            if (filterStatus !== 'all') params.callStatus = filterStatus;
            if (searchTerm) params.search = searchTerm;
            const response = await api.get('/calls', { params });
            if (response.data.success) setAllCalls(response.data.data);
        } catch (error) {
            console.error('Error fetching all calls:', error);
        }
    };

    // ✅ FIXED: Single generic handler for ALL form fields
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setCallForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!callForm.leadName) { toast.error('Please enter lead name'); return; }
        if (!callForm.leadPhone) { toast.error('Please enter phone number'); return; }

        setLoading(true);
        try {
            const submitData = {
                leadName: callForm.leadName,
                leadPhone: callForm.leadPhone,
                leadEmail: callForm.leadEmail,
                courseInterest: callForm.courseInterest,
                callType: callForm.callType,
                callStatus: callForm.callStatus,
                duration: parseInt(callForm.duration) || 0,
                callTime: callForm.callTime,
                notes: callForm.notes,
                followUpRequired: callForm.followUpRequired,
                followUpDate: callForm.followUpDate || null
            };

            let response;
            if (editingCall) {
                response = await api.put(`/calls/${editingCall._id}`, submitData);
                toast.success('Call log updated successfully');
            } else {
                response = await api.post('/calls', submitData);
                toast.success('Call log added successfully');
            }

            if (response.data.success) {
                closeModal();
                fetchTodayCalls();
                fetchWeeklyStats();
                fetchAllCalls();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCall = async (id) => {
        if (window.confirm('Delete this call record?')) {
            try {
                const response = await api.delete(`/calls/${id}`);
                if (response.data.success) {
                    toast.success('Call log deleted');
                    fetchTodayCalls();
                    fetchWeeklyStats();
                    fetchAllCalls();
                }
            } catch (error) {
                toast.error('Delete failed');
            }
        }
    };

    const openAddModal = () => {
        setEditingCall(null);
        setCallForm({ ...DEFAULT_FORM, callTime: new Date().toISOString().slice(0, 16) });
        setShowModal(true);
    };

    const openEditModal = (call) => {
        setEditingCall(call);
        setCallForm({
            leadName: call.leadName || '',
            leadPhone: call.leadPhone || '',
            leadEmail: call.leadEmail || '',
            courseInterest: call.courseInterest || '',
            callType: call.callType || 'Outgoing',
            callStatus: call.callStatus || 'Connected',
            duration: call.duration || '',
            callTime: call.callTime ? new Date(call.callTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
            notes: call.notes || '',
            followUpRequired: call.followUpRequired || false,
            followUpDate: call.followUpDate ? new Date(call.followUpDate).toISOString().slice(0, 10) : ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCall(null);
        setCallForm({ ...DEFAULT_FORM, callTime: new Date().toISOString().slice(0, 16) });
    };

    const filteredCalls = allCalls.filter(call =>
        call.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.leadPhone?.includes(searchTerm) ||
        call.leadEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const clearFilters = () => {
        setSearchTerm('');
        setFilterType('all');
        setFilterStatus('all');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIcon}><FaPhoneAlt /></div>
                    <div>
                        <h1 className={styles.headerTitle}>Call Logs</h1>
                        <p className={styles.headerSub}>Manually record and manage all your calls</p>
                    </div>
                </div>
            </div>

            <StatsCards stats={stats} stylesObj={styles} />

            <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab === 'today' ? styles.active : ''}`} onClick={() => setActiveTab('today')}>
                    <FaClock /> Today's Calls
                </button>
                <button className={`${styles.tab} ${activeTab === 'weekly' ? styles.active : ''}`} onClick={() => setActiveTab('weekly')}>
                    <FaChartLine /> Weekly Activity
                </button>
                <button className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`} onClick={() => setActiveTab('all')}>
                    <FaPhone /> All Calls
                </button>
            </div>

            {activeTab === 'today' && (
                <TodayCallsTable
                    todayCalls={todayCalls}
                    onAdd={openAddModal}
                    onView={(call) => { setSelectedCall(call); setShowViewModal(true); }}
                    onEdit={openEditModal}
                    onDelete={handleDeleteCall}
                    stylesObj={styles}
                />
            )}
            {activeTab === 'weekly' && (
                <WeeklyChart weeklyStats={weeklyStats} stylesObj={styles} />
            )}
            {activeTab === 'all' && (
                <AllCallsTable
                    filteredCalls={filteredCalls}
                    searchTerm={searchTerm}
                    filterType={filterType}
                    filterStatus={filterStatus}
                    onSearchChange={(e) => setSearchTerm(e.target.value)}
                    onTypeChange={(e) => setFilterType(e.target.value)}
                    onStatusChange={(e) => setFilterStatus(e.target.value)}
                    onClearFilters={clearFilters}
                    onView={(call) => { setSelectedCall(call); setShowViewModal(true); }}
                    onEdit={openEditModal}
                    onDelete={handleDeleteCall}
                    stylesObj={styles}
                />
            )}

            {showModal && (
                <CallModal
                    editingCall={editingCall}
                    callForm={callForm}
                    loading={loading}
                    onClose={closeModal}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                />
            )}

            {showViewModal && selectedCall && (
                <ViewModal
                    selectedCall={selectedCall}
                    onClose={() => setShowViewModal(false)}
                    onEdit={openEditModal}
                    stylesObj={styles}
                />
            )}
        </div>
    );
};

export default Calls;
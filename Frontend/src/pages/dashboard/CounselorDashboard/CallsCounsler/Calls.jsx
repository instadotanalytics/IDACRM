import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
    FaPhone, FaPhoneAlt, FaPhoneSlash, FaCalendarAlt,
    FaSpinner, FaSearch, FaPlus, FaEdit, FaTrash,
    FaEye, FaTimes, FaCheck, FaClock, FaChartLine,
    FaArrowUp, FaArrowDown, FaUser, FaEnvelope, FaBook,
    FaFilter, FaDownload, FaUserTie
} from 'react-icons/fa';
import api, { getCurrentUser, getCurrentUserId, getCurrentUserRole } from '../../../../services/api';
import styles from './Calls.module.css';

// Helper functions
const formatDuration = (minutes) => {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'Connected': return <FaCheck style={{ color: '#10b981' }} />;
        case 'Not Answered': return <FaPhoneSlash style={{ color: '#f59e0b' }} />;
        case 'Busy': return <FaPhoneSlash style={{ color: '#ef4444' }} />;
        default: return <FaPhone />;
    }
};

const getCallTypeIcon = (type) => {
    return type === 'Outgoing'
        ? <FaArrowUp style={{ color: '#10b981' }} />
        : <FaArrowDown style={{ color: '#f59e0b' }} />;
};

const getStatusBadge = (status) => {
    const map = {
        'Connected': styles.badgeConnected,
        'Not Answered': styles.badgeNotAnswered,
        'Busy': styles.badgeBusy,
        'Wrong Number': styles.badgeWrongNumber
    };
    return <span className={`${styles.badge} ${map[status] || ''}`}>{status}</span>;
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

// StatsCards Component
const StatsCards = ({ stats }) => (
    <div className={styles.statsGrid}>
        <div className={styles.statCard}>
            <div className={styles.statIcon}><FaPhoneAlt /></div>
            <div className={styles.statInfo}>
                <span className={styles.statValue}>{stats.total}</span>
                <span className={styles.statLabel}>Total Calls</span>
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
            <div className={styles.statIcon}><FaCheck /></div>
            <div className={styles.statInfo}>
                <span className={styles.statValue}>{stats.connected}</span>
                <span className={styles.statLabel}>Connected</span>
            </div>
        </div>
        <div className={styles.statCard}>
            <div className={styles.statIcon}><FaClock /></div>
            <div className={styles.statInfo}>
                <span className={styles.statValue}>{formatDuration(stats.totalDuration)}</span>
                <span className={styles.statLabel}>Total Duration</span>
            </div>
        </div>
    </div>
);

// WeeklyChart Component
const WeeklyChart = ({ weeklyStats }) => (
    <div className={styles.chartCard}>
        <h3>Weekly Call Activity</h3>
        <div className={styles.barChart}>
            {weeklyStats.map((day, idx) => (
                <div key={idx} className={styles.barItem}>
                    <div className={styles.barLabel}>{day.date}</div>
                    <div className={styles.barWrapper}>
                        <div
                            className={styles.bar}
                            style={{ height: `${Math.min(day.calls * 15, 100)}%` }}
                        >
                            <span className={styles.barValue}>{day.calls}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// TodayCallsTable Component
const TodayCallsTable = ({ todayCalls, onAdd, onView, onEdit, onDelete, userRole }) => (
    <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
            <h3>Today's Call Logs - {new Date().toLocaleDateString()}</h3>
            <button className={styles.addBtn} onClick={onAdd}>
                <FaPlus /> Add Call
            </button>
        </div>
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Lead Name</th>
                        <th>Phone</th>
                        <th>Course</th>
                        <th>Status</th>
                        <th>Duration</th>
                        {(userRole === 'admin_manager' || userRole === 'super_admin') && <th>Counselor</th>}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {todayCalls.length === 0 ? (
                        <tr><td colSpan={userRole === 'admin_manager' ? 9 : 8} className={styles.emptyCell}>
                            <div className={styles.emptyIcon}>📞</div>
                            <p>No calls recorded today</p>
                            <button className={styles.addFirstBtn} onClick={onAdd}>Add your first call</button>
                         </td>
                        </tr>
                    ) : (
                        todayCalls.map(call => (
                            <tr key={call._id}>
                                <td>{new Date(call.callTime).toLocaleTimeString()}</td>
                                <td>{getCallTypeIcon(call.callType)} {call.callType}</td>
                                <td><strong>{call.leadName}</strong></td>
                                <td>{call.leadPhone}</td>
                                <td>{call.courseInterest || '-'}</td>
                                <td>{getStatusIcon(call.callStatus)} {call.callStatus}</td>
                                <td>{formatDuration(call.duration)}</td>
                                {(userRole === 'admin_manager' || userRole === 'super_admin') && (
                                    <td className={styles.counselorCell}>
                                        {call.counselorName || call.counselorId?.name || '-'}
                                    </td>
                                )}
                                <td className={styles.actionBtns}>
                                    <button className={styles.viewBtn} onClick={() => onView(call)} title="View"><FaEye /></button>
                                    <button className={styles.editBtn} onClick={() => onEdit(call)} title="Edit"><FaEdit /></button>
                                    <button className={styles.deleteBtn} onClick={() => onDelete(call._id)} title="Delete"><FaTrash /></button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// AllCallsTable Component
const AllCallsTable = ({
    filteredCalls, searchTerm, filterType, filterStatus,
    onSearchChange, onTypeChange, onStatusChange, onClearFilters,
    onView, onEdit, onDelete, userRole
}) => (
    <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
            <h3>All Call History</h3>
            <div className={styles.filterGroup}>
                <div className={styles.searchBox}>
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search by name, phone or email..."
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                </div>
                <select className={styles.filterSelect} value={filterType} onChange={onTypeChange}>
                    <option value="all">All Types</option>
                    <option value="Outgoing">Outgoing</option>
                    <option value="Incoming">Incoming</option>
                </select>
                <select className={styles.filterSelect} value={filterStatus} onChange={onStatusChange}>
                    <option value="all">All Status</option>
                    <option value="Connected">Connected</option>
                    <option value="Not Answered">Not Answered</option>
                    <option value="Busy">Busy</option>
                    <option value="Wrong Number">Wrong Number</option>
                </select>
                {(filterType !== 'all' || filterStatus !== 'all' || searchTerm) && (
                    <button className={styles.clearFilters} onClick={onClearFilters}>Clear Filters</button>
                )}
            </div>
        </div>
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
                        {(userRole === 'admin_manager' || userRole === 'super_admin') && <th>Counselor</th>}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCalls.length === 0 ? (
                        <tr><td colSpan={userRole === 'admin_manager' ? 10 : 9} className={styles.emptyCell}>No calls found</td></tr>
                    ) : (
                        filteredCalls.map(call => (
                            <tr key={call._id}>
                                <td>
                                    {new Date(call.callTime).toLocaleDateString()}
                                    <br />
                                    <small>{new Date(call.callTime).toLocaleTimeString()}</small>
                                </td>
                                <td>{getCallTypeIcon(call.callType)} {call.callType}</td>
                                <td><strong>{call.leadName}</strong></td>
                                <td>{call.leadPhone}</td>
                                <td>{call.leadEmail || '-'}</td>
                                <td>{call.courseInterest || '-'}</td>
                                <td>{getStatusIcon(call.callStatus)} {call.callStatus}</td>
                                <td>{formatDuration(call.duration)}</td>
                                {(userRole === 'admin_manager' || userRole === 'super_admin') && (
                                    <td className={styles.counselorCell}>
                                        {call.counselorName || call.counselorId?.name || '-'}
                                    </td>
                                )}
                                <td className={styles.actionBtns}>
                                    <button className={styles.viewBtn} onClick={() => onView(call)}><FaEye /></button>
                                    <button className={styles.editBtn} onClick={() => onEdit(call)}><FaEdit /></button>
                                    <button className={styles.deleteBtn} onClick={() => onDelete(call._id)}><FaTrash /></button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// CallModal Component
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
                        <h4>Lead Information</h4>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Lead Name *</label>
                                <input type="text" name="leadName" value={callForm.leadName} onChange={onChange} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Phone Number *</label>
                                <input type="tel" name="leadPhone" value={callForm.leadPhone} onChange={onChange} required />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Email Address</label>
                                <input type="email" name="leadEmail" value={callForm.leadEmail} onChange={onChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Course Interest</label>
                                <input type="text" name="courseInterest" value={callForm.courseInterest} onChange={onChange} />
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
                                <input type="datetime-local" name="callTime" value={callForm.callTime} onChange={onChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Duration (minutes)</label>
                                <input type="number" name="duration" value={callForm.duration} onChange={onChange} min="0" step="1" />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Call Notes</label>
                            <textarea rows="3" name="notes" value={callForm.notes} onChange={onChange} placeholder="What was discussed?" />
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h4>Follow-up Settings</h4>
                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input type="checkbox" name="followUpRequired" checked={callForm.followUpRequired} onChange={onChange} />
                                Follow-up Required
                            </label>
                        </div>
                        {callForm.followUpRequired && (
                            <div className={styles.formGroup}>
                                <label>Follow-up Date</label>
                                <input type="date" name="followUpDate" value={callForm.followUpDate} onChange={onChange} />
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

// ViewModal Component
const ViewModal = ({ selectedCall, onClose, onEdit, userRole }) => (
    <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
                <h3><FaEye /> Call Details</h3>
                <button onClick={onClose}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
                <div className={styles.viewSection}>
                    <h4>Lead Information</h4>
                    <div className={styles.viewRow}><div className={styles.viewLabel}>Name:</div><div className={styles.viewValue}>{selectedCall?.leadName}</div></div>
                    <div className={styles.viewRow}><div className={styles.viewLabel}>Phone:</div><div className={styles.viewValue}>{selectedCall?.leadPhone}</div></div>
                    <div className={styles.viewRow}><div className={styles.viewLabel}>Email:</div><div className={styles.viewValue}>{selectedCall?.leadEmail || '-'}</div></div>
                    <div className={styles.viewRow}><div className={styles.viewLabel}>Course:</div><div className={styles.viewValue}>{selectedCall?.courseInterest || '-'}</div></div>
                </div>
                <div className={styles.viewSection}>
                    <h4>Call Information</h4>
                    <div className={styles.viewRow}><div className={styles.viewLabel}>Date & Time:</div><div className={styles.viewValue}>{new Date(selectedCall?.callTime).toLocaleString()}</div></div>
                    <div className={styles.viewRow}><div className={styles.viewLabel}>Call Type:</div><div className={styles.viewValue}>{selectedCall?.callType}</div></div>
                    <div className={styles.viewRow}><div className={styles.viewLabel}>Status:</div><div className={styles.viewValue}>{getStatusBadge(selectedCall?.callStatus)}</div></div>
                    <div className={styles.viewRow}><div className={styles.viewLabel}>Duration:</div><div className={styles.viewValue}>{formatDuration(selectedCall?.duration)}</div></div>
                    <div className={styles.viewRow}><div className={styles.viewLabel}>Notes:</div><div className={styles.viewValue}>{selectedCall?.notes || '-'}</div></div>
                </div>
                {(userRole === 'admin_manager' || userRole === 'super_admin') && (
                    <div className={styles.viewSection}>
                        <h4>Tracking Information</h4>
                        <div className={styles.viewRow}><div className={styles.viewLabel}>Counselor:</div><div className={styles.viewValue}>{selectedCall?.counselorName || '-'}</div></div>
                        <div className={styles.viewRow}><div className={styles.viewLabel}>Created At:</div><div className={styles.viewValue}>{new Date(selectedCall?.createdAt).toLocaleString()}</div></div>
                    </div>
                )}
            </div>
            <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={onClose}>Close</button>
                <button className={styles.editBtn} onClick={() => { onClose(); onEdit(selectedCall); }}>Edit Call</button>
            </div>
        </div>
    </div>
);

// Main Calls Component
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
    const [userRole, setUserRole] = useState('counselor');

    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            setUserRole(user.role);
        }
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

            <StatsCards stats={stats} />

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
                    userRole={userRole}
                />
            )}
            {activeTab === 'weekly' && (
                <WeeklyChart weeklyStats={weeklyStats} />
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
                    userRole={userRole}
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
                    userRole={userRole}
                />
            )}
        </div>
    );
};

export default Calls;
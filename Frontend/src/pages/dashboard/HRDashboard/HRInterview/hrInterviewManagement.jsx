import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    FaCalendarAlt, FaPlus, FaSearch, FaEdit, FaTrash, FaEye,
    FaTimes, FaCheck, FaSpinner, FaVideo, FaBuilding, FaUserTie,
    FaFilter, FaClock, FaCheckCircle, FaTimesCircle, FaEnvelope,
    FaPhone, FaMapMarkerAlt, FaCalendar, FaUserGraduate, FaTrophy,
    FaRupeeSign, FaChartLine, FaUsers, FaBriefcase
} from 'react-icons/fa';
import { hrInterviewService } from '../../../../services/hrInterviewservice';
import { hrStudentService } from '../../../../services/hrStudentservice';
import { companyService } from '../../../../services/companyService';
import styles from './hrInterviewManagement.module.css';

const HRInterviewManagement = () => {
    const [loading, setLoading] = useState(false);
    const [interviews, setInterviews] = useState([]);
    const [students, setStudents] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [stats, setStats] = useState({
        total: 0, scheduled: 0, completed: 0, selected: 0, rejected: 0, today: 0,
        selectionRate: 0, avgPackage: 0
    });
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({
        page: 1, limit: 10, total: 0, pages: 0
    });

    const [formData, setFormData] = useState({
        studentId: '',
        companyId: '',
        interviewDate: '',
        interviewTime: '10:00',
        interviewMode: 'Online',
        interviewLink: '',
        venue: '',
        venueAddress: '',
        interviewerName: '',
        interviewerEmail: '',
        interviewerPhone: '',
        remarks: ''
    });

    const [statusData, setStatusData] = useState({
        status: '',
        feedback: '',
        rating: 3,
        offeredPackage: '',
        technicalScore: '',
        communicationScore: '',
        resultDate: new Date().toISOString().split('T')[0],
        joiningDate: '',
        offerLetterSent: false,
        remarks: ''
    });

    useEffect(() => {
        fetchInterviews();
        fetchStats();
        fetchStudents();
        fetchCompanies();
    }, [pagination.page, statusFilter, searchTerm]);

    const resetForm = () => {
        setFormData({
            studentId: '',
            companyId: '',
            interviewDate: '',
            interviewTime: '10:00',
            interviewMode: 'Online',
            interviewLink: '',
            venue: '',
            venueAddress: '',
            interviewerName: '',
            interviewerEmail: '',
            interviewerPhone: '',
            remarks: ''
        });
    };

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            const response = await hrInterviewService.getInterviews({
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm,
                status: statusFilter
            });
            if (response.data.success) {
                setInterviews(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination.total,
                    pages: response.data.pagination.pages
                }));
            }
        } catch (error) {
            toast.error('Failed to fetch interviews');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await hrInterviewService.getInterviews({ limit: 1 });
            if (response.data.stats) {
                const interviewStats = response.data.stats;
                const selectionRate = interviewStats.completed > 0 
                    ? ((interviewStats.selected || 0) / interviewStats.completed * 100).toFixed(1)
                    : 0;
                setStats({
                    ...interviewStats,
                    selectionRate: selectionRate,
                    avgPackage: interviewStats.avgPackage || 0
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await hrStudentService.getStudents({ limit: 100 });
            if (res.data.success) setStudents(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCompanies = async () => {
        try {
            const res = await companyService.getCompanies({ limit: 100 });
            if (res.data.success) setCompanies(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.studentId) {
            toast.error('Please select a student');
            return;
        }
        if (!formData.companyId) {
            toast.error('Please select a company');
            return;
        }
        if (!formData.interviewDate) {
            toast.error('Please select interview date');
            return;
        }
        if (!formData.interviewTime) {
            toast.error('Please select interview time');
            return;
        }

        setLoading(true);
        try {
            const interviewData = {
                ...formData,
                interviewDate: new Date(formData.interviewDate),
                venue: formData.interviewMode === 'Online' ? formData.interviewLink : formData.venue,
                venueAddress: formData.interviewMode === 'Offline' ? formData.venueAddress : ''
            };

            await hrInterviewService.createInterview(interviewData);
            toast.success('Interview scheduled successfully');
            setShowModal(false);
            resetForm();
            fetchInterviews();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to schedule interview');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!statusData.status) {
            toast.error('Please select a status');
            return;
        }

        setLoading(true);
        try {
            // If status is Selected, also mark student as placed
            if (statusData.status === 'Selected') {
                // Update student as placed
                await hrStudentService.markAsPlaced(selectedInterview.studentId, {
                    companyId: selectedInterview.companyId,
                    placedPackage: statusData.offeredPackage,
                    placedDate: statusData.resultDate
                });
                toast.success(`Student marked as placed with ₹${statusData.offeredPackage} LPA package!`);
            }

            await hrInterviewService.updateStatus(selectedInterview._id, statusData);
            toast.success(`Interview marked as ${statusData.status}`);
            setShowStatusModal(false);
            setStatusData({
                status: '',
                feedback: '',
                rating: 3,
                offeredPackage: '',
                technicalScore: '',
                communicationScore: '',
                resultDate: new Date().toISOString().split('T')[0],
                joiningDate: '',
                offerLetterSent: false,
                remarks: ''
            });
            fetchInterviews();
            fetchStats();
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await hrInterviewService.deleteInterview(selectedInterview._id);
            toast.success('Interview deleted');
            setShowDeleteModal(false);
            fetchInterviews();
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete');
        } finally {
            setLoading(false);
        }
    };

    const openStatusModal = (interview) => {
        setSelectedInterview(interview);
        setStatusData({
            status: interview.status || 'Scheduled',
            feedback: interview.feedback || '',
            rating: interview.rating || 3,
            offeredPackage: interview.offeredPackage || '',
            technicalScore: interview.technicalScore || '',
            communicationScore: interview.communicationScore || '',
            resultDate: interview.resultDate?.split('T')[0] || new Date().toISOString().split('T')[0],
            joiningDate: interview.joiningDate?.split('T')[0] || '',
            offerLetterSent: interview.offerLetterSent || false,
            remarks: interview.remarks || ''
        });
        setShowStatusModal(true);
    };

    const openViewModal = (interview) => {
        setSelectedInterview(interview);
        setShowViewModal(true);
    };

    const openResultModal = (interview) => {
        setSelectedInterview(interview);
        setShowResultModal(true);
    };

    const getStatusBadge = (status) => {
        const badges = {
            'Scheduled': 'bg-yellow-100 text-yellow-800',
            'Completed': 'bg-blue-100 text-blue-800',
            'Selected': 'bg-green-100 text-green-800',
            'Rejected': 'bg-red-100 text-red-800',
            'Cancelled': 'bg-gray-100 text-gray-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'Scheduled': <FaClock />,
            'Completed': <FaCheckCircle />,
            'Selected': <FaTrophy />,
            'Rejected': <FaTimesCircle />,
            'Cancelled': <FaTimesCircle />
        };
        return icons[status] || <FaClock />;
    };

    const StatCard = ({ title, value, icon, color, subtitle }) => (
        <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: `${color}15`, color: color }}>{icon}</div>
            <div className={styles.statInfo}>
                <span className={styles.statValue}>{value}</span>
                <span className={styles.statLabel}>{title}</span>
                {subtitle && <small className={styles.statSubtitle}>{subtitle}</small>}
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <StatCard title="Total Interviews" value={stats.total} icon={<FaCalendarAlt />} color="#2563eb" />
                <StatCard title="Scheduled" value={stats.scheduled} icon={<FaClock />} color="#f59e0b" />
                <StatCard title="Selected" value={stats.selected} icon={<FaTrophy />} color="#22c55e" />
                <StatCard title="Rejected" value={stats.rejected} icon={<FaTimesCircle />} color="#ef4444" />
                <StatCard title="Selection Rate" value={`${stats.selectionRate}%`} icon={<FaChartLine />} color="#8b5cf6" subtitle={`Avg: ₹${stats.avgPackage} LPA`} />
                <StatCard title="Today's Interviews" value={stats.today} icon={<FaUsers />} color="#06b6d4" />
            </div>

            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h2><FaCalendarAlt /> Interview Management</h2>
                    <p>Schedule, track, and manage student interviews with results</p>
                </div>
                <button className={styles.addBtn} onClick={() => { resetForm(); setShowModal(true); }}>
                    <FaPlus /> Schedule Interview
                </button>
            </div>

            {/* Search and Filters */}
            <div className={styles.filterBar}>
                <div className={styles.searchBox}>
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search by student or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className={styles.filterSelect}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Selected">Selected (Placed)</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <button className={styles.clearFiltersBtn} onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                    <FaTimes /> Clear
                </button>
            </div>

            {/* Interviews Table */}
            <div className={styles.tableWrapper}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <FaSpinner className={styles.spinner} /> Loading interviews...
                    </div>
                ) : interviews.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FaCalendarAlt className={styles.emptyIcon} />
                        <h3>No interviews scheduled</h3>
                        <p>Click "Schedule Interview" to schedule your first interview</p>
                        <button className={styles.addBtn} onClick={() => { resetForm(); setShowModal(true); }}>
                            <FaPlus /> Schedule Interview
                        </button>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Company</th>
                                <th>Date & Time</th>
                                <th>Mode</th>
                                <th>Result / Package</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {interviews.map(interview => (
                                <tr key={interview._id}>
                                    <td className={styles.studentCell}>
                                        <strong>{interview.studentName}</strong>
                                        <small>{interview.studentRollNo}</small>
                                        <small>{interview.studentEmail}</small>
                                    </td>
                                    <td>
                                        <div className={styles.companyInfo}>
                                            <FaBuilding /> {interview.companyName}
                                        </div>
                                    </td>
                                    <td>
                                        <div>{new Date(interview.interviewDate).toLocaleDateString()}</div>
                                        <small>{interview.interviewTime}</small>
                                    </td>
                                    <td>
                                        <div className={styles.modeInfo}>
                                            {interview.interviewMode === 'Online' ? <FaVideo /> : <FaMapMarkerAlt />}
                                            <span>{interview.interviewMode}</span>
                                        </div>
                                        <small>{interview.interviewMode === 'Online' ? interview.interviewLink : interview.venue}</small>
                                    </td>
                                    <td>
                                        {interview.status === 'Selected' ? (
                                            <div className={styles.resultSuccess}>
                                                <FaTrophy className={styles.resultIcon} />
                                                <span className={styles.packageValue}>₹{interview.offeredPackage} LPA</span>
                                                <small>Selected</small>
                                            </div>
                                        ) : interview.status === 'Rejected' ? (
                                            <div className={styles.resultRejected}>
                                                <FaTimesCircle className={styles.resultIcon} />
                                                <span>Not Selected</span>
                                            </div>
                                        ) : interview.status === 'Completed' ? (
                                            <div className={styles.resultPending}>
                                                <FaClock className={styles.resultIcon} />
                                                <span>Result Awaited</span>
                                            </div>
                                        ) : (
                                            <div className={styles.resultPending}>
                                                <FaClock className={styles.resultIcon} />
                                                <span>Pending</span>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(interview.status)}`}>
                                            {getStatusIcon(interview.status)} {interview.status}
                                        </span>
                                    </td>
                                    <td className={styles.actionBtns}>
                                        <button onClick={() => openViewModal(interview)} title="View Details">
                                            <FaEye />
                                        </button>
                                        <button onClick={() => openStatusModal(interview)} title="Update Result/Status">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => { setSelectedInterview(interview); setShowDeleteModal(true); }} title="Delete">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className={styles.pagination}>
                    <button disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}>
                        Previous
                    </button>
                    <span>Page {pagination.page} of {pagination.pages}</span>
                    <button disabled={pagination.page === pagination.pages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}>
                        Next
                    </button>
                </div>
            )}

            {/* ==================== SCHEDULE INTERVIEW MODAL ==================== */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3><FaPlus /> Schedule New Interview</h3>
                            <button onClick={() => setShowModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                {/* Student & Company Selection */}
                                <div className={styles.formSection}>
                                    <h4><FaUserGraduate /> Select Details</h4>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Select Student *</label>
                                            <select
                                                value={formData.studentId}
                                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                                required
                                            >
                                                <option value="">-- Select Student --</option>
                                                {students.map(s => (
                                                    <option key={s._id} value={s._id}>
                                                        {s.studentName} ({s.studentRollNo}) - {s.course} {s.branch}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Select Company *</label>
                                            <select
                                                value={formData.companyId}
                                                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                                                required
                                            >
                                                <option value="">-- Select Company --</option>
                                                {companies.map(c => (
                                                    <option key={c._id} value={c._id}>{c.companyName} - {c.industry}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className={styles.formSection}>
                                    <h4><FaCalendar /> Schedule Date & Time</h4>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Interview Date *</label>
                                            <input
                                                type="date"
                                                value={formData.interviewDate}
                                                onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Interview Time *</label>
                                            <input
                                                type="time"
                                                value={formData.interviewTime}
                                                onChange={(e) => setFormData({ ...formData, interviewTime: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Mode Selection */}
                                <div className={styles.formSection}>
                                    <h4>Interview Mode</h4>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Mode *</label>
                                            <select
                                                value={formData.interviewMode}
                                                onChange={(e) => setFormData({ ...formData, interviewMode: e.target.value })}
                                            >
                                                <option value="Online">Online (Video Call)</option>
                                                <option value="Offline">Offline (In-Person)</option>
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>{formData.interviewMode === 'Online' ? 'Meeting Link' : 'Venue'}</label>
                                            <input
                                                type={formData.interviewMode === 'Online' ? 'url' : 'text'}
                                                value={formData.interviewMode === 'Online' ? formData.interviewLink : formData.venue}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    [formData.interviewMode === 'Online' ? 'interviewLink' : 'venue']: e.target.value
                                                })}
                                                placeholder={formData.interviewMode === 'Online' ? 'https://meet.google.com/...' : 'Company Name, City'}
                                            />
                                        </div>
                                    </div>
                                    {formData.interviewMode === 'Offline' && (
                                        <div className={styles.formGroup}>
                                            <label>Full Venue Address</label>
                                            <textarea
                                                rows="2"
                                                value={formData.venueAddress}
                                                onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                                                placeholder="Complete address with landmark, floor, etc."
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Interviewer Details */}
                                <div className={styles.formSection}>
                                    <h4><FaUserTie /> Interviewer Details</h4>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Interviewer Name</label>
                                            <input
                                                type="text"
                                                value={formData.interviewerName}
                                                onChange={(e) => setFormData({ ...formData, interviewerName: e.target.value })}
                                                placeholder="e.g., John Doe"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Interviewer Email</label>
                                            <input
                                                type="email"
                                                value={formData.interviewerEmail}
                                                onChange={(e) => setFormData({ ...formData, interviewerEmail: e.target.value })}
                                                placeholder="interviewer@company.com"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Interviewer Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.interviewerPhone}
                                            onChange={(e) => setFormData({ ...formData, interviewerPhone: e.target.value })}
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>

                                {/* Remarks */}
                                <div className={styles.formSection}>
                                    <h4>Additional Information</h4>
                                    <div className={styles.formGroup}>
                                        <label>Remarks / Instructions</label>
                                        <textarea
                                            rows="3"
                                            value={formData.remarks}
                                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                            placeholder="Any special instructions for the student..."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.saveBtn} disabled={loading}>
                                    {loading ? <FaSpinner className={styles.spinner} /> : <FaCheck />}
                                    Schedule Interview
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================== UPDATE STATUS / RESULT MODAL ==================== */}
            {showStatusModal && selectedInterview && (
                <div className={styles.modalOverlay} onClick={() => setShowStatusModal(false)}>
                    <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3><FaEdit /> Update Interview Result</h3>
                            <button onClick={() => setShowStatusModal(false)}><FaTimes /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.infoBox}>
                                <p><strong>Student:</strong> {selectedInterview.studentName} ({selectedInterview.studentRollNo})</p>
                                <p><strong>Company:</strong> {selectedInterview.companyName}</p>
                                <p><strong>Interview Date:</strong> {new Date(selectedInterview.interviewDate).toLocaleDateString()}</p>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Result Status *</label>
                                <select
                                    value={statusData.status}
                                    onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
                                    required
                                >
                                    <option value="">Select Result</option>
                                    <option value="Selected">✅ Selected (Placed)</option>
                                    <option value="Rejected">❌ Rejected</option>
                                    <option value="Scheduled">⏳ Scheduled (Pending)</option>
                                    <option value="Completed">📋 Completed (Result Awaited)</option>
                                    <option value="Cancelled">🚫 Cancelled</option>
                                </select>
                            </div>

                            {(statusData.status === 'Selected') && (
                                <div className={styles.resultSection}>
                                    <h4><FaTrophy /> Placement Details</h4>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Offered Package (LPA) *</label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={statusData.offeredPackage}
                                                onChange={(e) => setStatusData({ ...statusData, offeredPackage: e.target.value })}
                                                placeholder="e.g., 12.5"
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Result Date</label>
                                            <input
                                                type="date"
                                                value={statusData.resultDate}
                                                onChange={(e) => setStatusData({ ...statusData, resultDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Expected Joining Date</label>
                                            <input
                                                type="date"
                                                value={statusData.joiningDate}
                                                onChange={(e) => setStatusData({ ...statusData, joiningDate: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={statusData.offerLetterSent}
                                                    onChange={(e) => setStatusData({ ...statusData, offerLetterSent: e.target.checked })}
                                                />
                                                Offer Letter Sent
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label>Feedback / Interview Remarks</label>
                                <textarea
                                    rows="3"
                                    value={statusData.feedback}
                                    onChange={(e) => setStatusData({ ...statusData, feedback: e.target.value })}
                                    placeholder="Provide detailed feedback about the interview..."
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Technical Score (0-100)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={statusData.technicalScore}
                                        onChange={(e) => setStatusData({ ...statusData, technicalScore: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Communication Score (0-100)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={statusData.communicationScore}
                                        onChange={(e) => setStatusData({ ...statusData, communicationScore: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Overall Rating (1-5)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={statusData.rating}
                                        onChange={(e) => setStatusData({ ...statusData, rating: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Additional Remarks</label>
                                <textarea
                                    rows="2"
                                    value={statusData.remarks}
                                    onChange={(e) => setStatusData({ ...statusData, remarks: e.target.value })}
                                    placeholder="Any additional notes..."
                                />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowStatusModal(false)}>Cancel</button>
                            <button className={styles.saveBtn} onClick={handleStatusUpdate} disabled={loading}>
                                {loading ? <FaSpinner /> : <FaCheck />} Save Result
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== VIEW INTERVIEW MODAL ==================== */}
            {showViewModal && selectedInterview && (
                <div className={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
                    <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3><FaEye /> Complete Interview Details</h3>
                            <button onClick={() => setShowViewModal(false)}><FaTimes /></button>
                        </div>
                        <div className={styles.modalBody}>
                            {/* Student Information */}
                            <div className={styles.viewSection}>
                                <h4><FaUserGraduate /> Student Information</h4>
                                <div className={styles.viewRow}><span>Name:</span><strong>{selectedInterview.studentName}</strong></div>
                                <div className={styles.viewRow}><span>Roll Number:</span><span>{selectedInterview.studentRollNo}</span></div>
                                <div className={styles.viewRow}><span>Email:</span><span>{selectedInterview.studentEmail}</span></div>
                                <div className={styles.viewRow}><span>Phone:</span><span>{selectedInterview.studentPhone || 'N/A'}</span></div>
                            </div>

                            {/* Company Information */}
                            <div className={styles.viewSection}>
                                <h4><FaBuilding /> Company Information</h4>
                                <div className={styles.viewRow}><span>Company:</span><strong>{selectedInterview.companyName}</strong></div>
                                <div className={styles.viewRow}><span>Contact:</span><span>{selectedInterview.companyContact || 'N/A'}</span></div>
                            </div>

                            {/* Interview Details */}
                            <div className={styles.viewSection}>
                                <h4><FaCalendarAlt /> Interview Details</h4>
                                <div className={styles.viewRow}><span>Date:</span><span>{new Date(selectedInterview.interviewDate).toLocaleDateString()}</span></div>
                                <div className={styles.viewRow}><span>Time:</span><span>{selectedInterview.interviewTime}</span></div>
                                <div className={styles.viewRow}><span>Mode:</span><span>{selectedInterview.interviewMode === 'Online' ? <FaVideo /> : <FaMapMarkerAlt />} {selectedInterview.interviewMode}</span></div>
                                {selectedInterview.interviewMode === 'Online' ? (
                                    <div className={styles.viewRow}><span>Meeting Link:</span><a href={selectedInterview.interviewLink} target="_blank">{selectedInterview.interviewLink}</a></div>
                                ) : (
                                    <>
                                        <div className={styles.viewRow}><span>Venue:</span><span>{selectedInterview.venue}</span></div>
                                        <div className={styles.viewRow}><span>Address:</span><span>{selectedInterview.venueAddress || 'N/A'}</span></div>
                                    </>
                                )}
                            </div>

                            {/* Interviewer Details */}
                            <div className={styles.viewSection}>
                                <h4><FaUserTie /> Interviewer Details</h4>
                                <div className={styles.viewRow}><span>Name:</span><span>{selectedInterview.interviewerName || 'N/A'}</span></div>
                                <div className={styles.viewRow}><span>Email:</span><span>{selectedInterview.interviewerEmail || 'N/A'}</span></div>
                                <div className={styles.viewRow}><span>Phone:</span><span>{selectedInterview.interviewerPhone || 'N/A'}</span></div>
                            </div>

                            {/* Result & Feedback Section */}
                            <div className={styles.viewSection}>
                                <h4><FaTrophy /> Interview Result & Feedback</h4>
                                <div className={styles.viewRow}>
                                    <span>Result Status:</span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedInterview.status)}`}>
                                        {getStatusIcon(selectedInterview.status)} {selectedInterview.status}
                                    </span>
                                </div>
                                
                                {selectedInterview.status === 'Selected' && (
                                    <>
                                        <div className={styles.viewRow}>
                                            <span>Offered Package:</span>
                                            <span className={styles.highlight}>₹{selectedInterview.offeredPackage} LPA</span>
                                        </div>
                                        <div className={styles.viewRow}>
                                            <span>Result Date:</span>
                                            <span>{new Date(selectedInterview.resultDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className={styles.viewRow}>
                                            <span>Joining Date:</span>
                                            <span>{selectedInterview.joiningDate ? new Date(selectedInterview.joiningDate).toLocaleDateString() : 'Not specified'}</span>
                                        </div>
                                        <div className={styles.viewRow}>
                                            <span>Offer Letter:</span>
                                            <span>{selectedInterview.offerLetterSent ? '✅ Sent' : '📧 Not Sent Yet'}</span>
                                        </div>
                                    </>
                                )}
                                
                                {selectedInterview.feedback && (
                                    <div className={styles.viewRow}>
                                        <span>Feedback:</span>
                                        <span>{selectedInterview.feedback}</span>
                                    </div>
                                )}
                                
                                {(selectedInterview.technicalScore || selectedInterview.communicationScore) && (
                                    <>
                                        <div className={styles.viewRow}>
                                            <span>Technical Score:</span>
                                            <span>{selectedInterview.technicalScore || 'N/A'}/100</span>
                                        </div>
                                        <div className={styles.viewRow}>
                                            <span>Communication Score:</span>
                                            <span>{selectedInterview.communicationScore || 'N/A'}/100</span>
                                        </div>
                                    </>
                                )}
                                
                                {selectedInterview.rating && (
                                    <div className={styles.viewRow}>
                                        <span>Overall Rating:</span>
                                        <span>{'⭐'.repeat(selectedInterview.rating)} ({selectedInterview.rating}/5)</span>
                                    </div>
                                )}
                                
                                {selectedInterview.remarks && (
                                    <div className={styles.viewRow}>
                                        <span>Additional Remarks:</span>
                                        <span>{selectedInterview.remarks}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowViewModal(false)}>Close</button>
                            <button className={styles.editBtn} onClick={() => { setShowViewModal(false); openStatusModal(selectedInterview); }}>
                                <FaEdit /> Update Result
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedInterview && (
                <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3><FaTrash /> Delete Interview</h3>
                            <button onClick={() => setShowDeleteModal(false)}><FaTimes /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Delete interview for <strong>{selectedInterview.studentName}</strong> with <strong>{selectedInterview.companyName}</strong>?</p>
                            <p className={styles.warningText}>This action cannot be undone.</p>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className={styles.deleteBtn} onClick={handleDelete} disabled={loading}>
                                {loading ? <FaSpinner /> : <FaTrash />} Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRInterviewManagement;
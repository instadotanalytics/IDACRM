import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FaCalendarCheck, FaUsers, FaClock, FaChartLine, 
  FaFilter, FaDownload, FaSpinner, FaTimes, 
  FaUserGraduate, FaCheckCircle, FaExclamationCircle,
  FaClock as FaClockIcon, FaPlus, FaEdit, FaTrash,
  FaSave, FaTimesCircle, FaChartBar
} from 'react-icons/fa';
import api from '../../../../services/api';
import styles from './AdminAttendanceTable.module.css';

const AdminAttendanceTable = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalPresent: 0,
        totalAbsent: 0,
        leaveRequests: 0,
        lateEntries: 0,
        attendancePercentage: 0,
        totalStudents: 0
    });
    const [attendanceData, setAttendanceData] = useState([]);
    const [batchSummary, setBatchSummary] = useState([]);
    const [studentSummary, setStudentSummary] = useState([]);
    const [batches, setBatches] = useState([]);
    const [students, setStudents] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [showModal, setShowModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [formData, setFormData] = useState({
        studentId: '',
        batchId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
        clockIn: '',
        clockOut: '',
        remarks: ''
    });
    const [filters, setFilters] = useState({
        batchId: 'all',
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        status: 'all'
    });

    useEffect(() => {
        fetchBatches();
        fetchStudents();
        fetchStats();
        fetchAttendanceOverview();
    }, []);

    useEffect(() => {
        fetchAttendanceOverview();
    }, [filters]);

    const fetchBatches = async () => {
        try {
            const response = await api.get('/batches');
            if (response.data.success) {
                setBatches(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await api.get('/students');
            if (response.data.success) {
                setStudents(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/attendance/admin/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchAttendanceOverview = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.batchId !== 'all') params.batchId = filters.batchId;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            if (filters.status !== 'all') params.status = filters.status;

            const response = await api.get('/attendance/admin/overview', { params });
            if (response.data.success) {
                setAttendanceData(response.data.data.attendance);
                setBatchSummary(response.data.data.batchSummary);
                setStudentSummary(response.data.data.studentSummary);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
            toast.error('Failed to fetch attendance data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAttendance = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/attendance/mark', formData);
            if (response.data.success) {
                toast.success('Attendance marked successfully');
                setShowModal(false);
                setFormData({
                    studentId: '',
                    batchId: '',
                    date: new Date().toISOString().split('T')[0],
                    status: 'Present',
                    clockIn: '',
                    clockOut: '',
                    remarks: ''
                });
                fetchStats();
                fetchAttendanceOverview();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to mark attendance');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAttendance = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.put(`/attendance/${editingRecord._id}`, {
                status: formData.status,
                clockIn: formData.clockIn,
                clockOut: formData.clockOut,
                remarks: formData.remarks
            });
            if (response.data.success) {
                toast.success('Attendance updated successfully');
                setShowModal(false);
                setEditingRecord(null);
                setFormData({
                    studentId: '',
                    batchId: '',
                    date: new Date().toISOString().split('T')[0],
                    status: 'Present',
                    clockIn: '',
                    clockOut: '',
                    remarks: ''
                });
                fetchStats();
                fetchAttendanceOverview();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update attendance');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAttendance = async (id, studentName) => {
        if (window.confirm(`Delete attendance for ${studentName}?`)) {
            setLoading(true);
            try {
                const response = await api.delete(`/attendance/${id}`);
                if (response.data.success) {
                    toast.success('Attendance deleted successfully');
                    fetchStats();
                    fetchAttendanceOverview();
                }
            } catch (error) {
                toast.error('Failed to delete attendance');
            } finally {
                setLoading(false);
            }
        }
    };

    const openEditModal = (record) => {
        setEditingRecord(record);
        setFormData({
            studentId: record.studentId?._id || '',
            batchId: record.batchId?._id || '',
            date: new Date(record.date).toISOString().split('T')[0],
            status: record.status,
            clockIn: record.clockIn || '',
            clockOut: record.clockOut || '',
            remarks: record.remarks || ''
        });
        setShowModal(true);
    };

    const exportReport = async (format) => {
        try {
            const params = {};
            if (filters.batchId !== 'all') params.batchId = filters.batchId;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            params.format = format;

            const response = await api.get('/attendance/admin/export', { params });
            if (response.data.success) {
                if (format === 'excel') {
                    const csv = convertToCSV(response.data.data);
                    downloadFile(csv, `attendance_report_${filters.startDate}_to_${filters.endDate}.csv`);
                }
                toast.success(`Report exported as ${format.toUpperCase()}`);
            }
        } catch (error) {
            toast.error('Export failed');
        }
    };

    const convertToCSV = (data) => {
        if (!data || data.length === 0) return '';
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        for (const row of data) {
            const values = headers.map(header => JSON.stringify(row[header] || ''));
            csvRows.push(values.join(','));
        }
        return csvRows.join('\n');
    };

    const downloadFile = (content, fileName) => {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Present': return <span className={`${styles.statusBadge} ${styles.present}`}>✓ Present</span>;
            case 'Absent': return <span className={`${styles.statusBadge} ${styles.absent}`}>✗ Absent</span>;
            case 'Leave': return <span className={`${styles.statusBadge} ${styles.leave}`}>○ Leave</span>;
            case 'Late': return <span className={`${styles.statusBadge} ${styles.late}`}>⏰ Late</span>;
            default: return <span className={styles.statusBadge}>{status}</span>;
        }
    };

    // Stats Cards Component
    const StatsCards = () => (
        <div className={styles.statsGrid}>
            <div className={styles.statCard}>
                <div className={styles.statIcon}><FaCheckCircle /></div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.totalPresent}</span>
                    <span className={styles.statLabel}>Total Present</span>
                </div>
            </div>
            <div className={`${styles.statCard} ${styles.absentCard}`}>
                <div className={styles.statIcon}><FaExclamationCircle /></div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.totalAbsent}</span>
                    <span className={styles.statLabel}>Total Absent</span>
                </div>
            </div>
            <div className={`${styles.statCard} ${styles.leaveCard}`}>
                <div className={styles.statIcon}>○</div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.leaveRequests}</span>
                    <span className={styles.statLabel}>Leave Requests</span>
                </div>
            </div>
            <div className={`${styles.statCard} ${styles.lateCard}`}>
                <div className={styles.statIcon}><FaClockIcon /></div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.lateEntries}</span>
                    <span className={styles.statLabel}>Late Entries</span>
                </div>
            </div>
            <div className={styles.statCard}>
                <div className={styles.statIcon}><FaChartLine /></div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.attendancePercentage}%</span>
                    <span className={styles.statLabel}>Attendance %</span>
                </div>
            </div>
            <div className={styles.statCard}>
                <div className={styles.statIcon}><FaUserGraduate /></div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.totalStudents}</span>
                    <span className={styles.statLabel}>Total Students</span>
                </div>
            </div>
        </div>
    );

    // Filters Section
    const FiltersSection = () => (
        <div className={styles.filtersSection}>
            <div className={styles.filterGroup}>
                <label>Batch</label>
                <select 
                    className={styles.filterSelect}
                    value={filters.batchId}
                    onChange={(e) => setFilters({...filters, batchId: e.target.value})}
                >
                    <option value="all">All Batches</option>
                    {batches.map((batch) => (
                        <option key={batch._id} value={batch._id}>{batch.name}</option>
                    ))}
                </select>
            </div>
            <div className={styles.filterGroup}>
                <label>From Date</label>
                <input 
                    type="date" 
                    className={styles.dateInput}
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                />
            </div>
            <div className={styles.filterGroup}>
                <label>To Date</label>
                <input 
                    type="date" 
                    className={styles.dateInput}
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                />
            </div>
            <div className={styles.filterGroup}>
                <label>Status</label>
                <select 
                    className={styles.filterSelect}
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                    <option value="all">All Status</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                    <option value="Late">Late</option>
                </select>
            </div>
            <div className={styles.filterActions}>
                <button className={styles.filterBtn} onClick={fetchAttendanceOverview}>
                    <FaFilter /> Apply
                </button>
                <button className={styles.createBtn} onClick={() => { setEditingRecord(null); setShowModal(true); }}>
                    <FaPlus /> Add Attendance
                </button>
                <button className={styles.exportBtn} onClick={() => setShowReportModal(true)}>
                    <FaDownload /> Export
                </button>
            </div>
        </div>
    );

    // Attendance Table
    const AttendanceTable = () => (
        <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
                <h3>Attendance Records</h3>
                <span className={styles.recordCount}>{attendanceData.length} records found</span>
            </div>
            <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Batch</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Clock In</th>
                            <th>Clock Out</th>
                            <th>Remarks</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" className={styles.loadingCell}>
                                    <FaSpinner className={styles.spinner} /> Loading...
                                </td>
                            </tr>
                        ) : attendanceData.length === 0 ? (
                            <tr>
                                <td colSpan="8" className={styles.emptyCell}>No attendance records found</td>
                            </tr>
                        ) : (
                            attendanceData.map((record) => (
                                <tr key={record._id}>
                                    <td><strong>{record.studentId?.name || 'N/A'}</strong></td>
                                    <td>{record.batchId?.name || '-'}</td>
                                    <td>{new Date(record.date).toLocaleDateString()}</td>
                                    <td>{getStatusBadge(record.status)}</td>
                                    <td>{record.clockIn || '-'}</td>
                                    <td>{record.clockOut || '-'}</td>
                                    <td>{record.remarks || '-'}</td>
                                    <td className={styles.actionBtns}>
                                        <button onClick={() => openEditModal(record)} className={styles.editBtn}><FaEdit /></button>
                                        <button onClick={() => handleDeleteAttendance(record._id, record.studentId?.name)} className={styles.deleteBtn}><FaTrash /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Batch Summary Section
    const BatchSummary = () => (
        <div className={styles.summaryCard}>
            <h3>Batch-wise Attendance Summary</h3>
            <div className={styles.batchSummaryGrid}>
                {batchSummary.map((batch) => (
                    <div key={batch._id} className={styles.batchSummaryItem}>
                        <div className={styles.batchSummaryHeader}>
                            <strong>{batch.batchInfo?.[0]?.name || 'Batch'}</strong>
                            <span>Total: {batch.total}</span>
                        </div>
                        <div className={styles.batchStats}>
                            <span className={styles.presentStat}>✓ {batch.present}</span>
                            <span className={styles.absentStat}>✗ {batch.absent}</span>
                            <span className={styles.leaveStat}>○ {batch.leave}</span>
                            <span className={styles.lateStat}>⏰ {batch.late}</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${(batch.present / batch.total) * 100}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Top Students Section
    const TopStudents = () => (
        <div className={styles.summaryCard}>
            <h3>Top Performing Students (Attendance)</h3>
            <div className={styles.topStudentsList}>
                {studentSummary.map((student) => (
                    <div key={student._id} className={styles.topStudentItem}>
                        <div className={styles.topStudentInfo}>
                            <span className={styles.topStudentName}>{student.studentInfo?.[0]?.name || 'Student'}</span>
                            <span className={styles.topStudentPercentage}>{student.percentage?.toFixed(1)}%</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${student.percentage || 0}%`, background: '#10b981' }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Create/Edit Modal
    const AttendanceModal = () => (
        <div className={styles.modalOverlay} onClick={() => { setShowModal(false); setEditingRecord(null); }}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{editingRecord ? 'Edit Attendance' : 'Mark Attendance'}</h3>
                    <button onClick={() => { setShowModal(false); setEditingRecord(null); }}><FaTimes /></button>
                </div>
                <form onSubmit={editingRecord ? handleUpdateAttendance : handleCreateAttendance}>
                    <div className={styles.modalBody}>
                        {!editingRecord && (
                            <>
                                <div className={styles.formGroup}>
                                    <label>Select Student *</label>
                                    <select 
                                        className={styles.input}
                                        value={formData.studentId}
                                        onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Student</option>
                                        {students.map((student) => (
                                            <option key={student._id} value={student._id}>{student.name} ({student.batchId?.name})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Batch *</label>
                                    <select 
                                        className={styles.input}
                                        value={formData.batchId}
                                        onChange={(e) => setFormData({...formData, batchId: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Batch</option>
                                        {batches.map((batch) => (
                                            <option key={batch._id} value={batch._id}>{batch.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}
                        <div className={styles.formGroup}>
                            <label>Date *</label>
                            <input 
                                type="date" 
                                className={styles.input}
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Status *</label>
                            <select 
                                className={styles.input}
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                                <option value="Leave">Leave</option>
                                <option value="Late">Late</option>
                            </select>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Clock In</label>
                                <input 
                                    type="time" 
                                    className={styles.input}
                                    value={formData.clockIn}
                                    onChange={(e) => setFormData({...formData, clockIn: e.target.value})}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Clock Out</label>
                                <input 
                                    type="time" 
                                    className={styles.input}
                                    value={formData.clockOut}
                                    onChange={(e) => setFormData({...formData, clockOut: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Remarks</label>
                            <textarea 
                                className={styles.textarea}
                                rows="3"
                                value={formData.remarks}
                                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelBtn} onClick={() => { setShowModal(false); setEditingRecord(null); }}>Cancel</button>
                        <button type="submit" className={styles.saveBtn} disabled={loading}>
                            {loading ? 'Saving...' : (editingRecord ? 'Update' : 'Save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // Export Modal
    const ExportModal = () => (
        <div className={styles.modalOverlay} onClick={() => setShowReportModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Export Attendance Report</h3>
                    <button onClick={() => setShowReportModal(false)}><FaTimes /></button>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.exportOptions}>
                        <button className={styles.exportOptionBtn} onClick={() => exportReport('excel')}>
                            <FaDownload /> Export as Excel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            <StatsCards/>
            <FiltersSection/>
            
            <div className={styles.tabs}>
                <button 
                    className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <FaCalendarCheck /> Attendance Records
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'batch' ? styles.active : ''}`}
                    onClick={() => setActiveTab('batch')}
                >
                    <FaUsers /> Batch Summary
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'top' ? styles.active : ''}`}
                    onClick={() => setActiveTab('top')}
                >
                    <FaChartBar /> Top Performers
                </button>
            </div>

            {activeTab === 'overview' && <AttendanceTable />}
            {activeTab === 'batch' && <BatchSummary />}
            {activeTab === 'top' && <TopStudents />}

            {showModal && <AttendanceModal />}
            {showReportModal && <ExportModal />}
        </div>
    );
};

export default AdminAttendanceTable;
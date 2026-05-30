import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FaSearch, FaFilter, FaDownload, FaPrint, FaEdit, FaTrash, 
  FaUserGraduate, FaChartLine, FaTimes, FaSpinner 
} from 'react-icons/fa';
import api from '../../../../services/api';
import styles from './TrainerAttendanceMarker.module.css';

const AttendanceTable = () => {
    const [loading, setLoading] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        batch: 'all',
        status: 'all',
        date: new Date().toISOString().split('T')[0],
    });

    // Fetch students from API
    const fetchStudents = async () => {
        try {
            const response = await api.get('/students');
            if (response.data.success) {
                setStudents(response.data.data);
                // Extract unique batches
                const uniqueBatches = [...new Set(response.data.data.map(s => s.batch))];
                setBatches(uniqueBatches);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to fetch students');
        }
    };

    // Fetch attendance from API
    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.batch !== 'all') params.batchId = filters.batch;
            if (filters.date) params.date = filters.date;
            if (filters.status !== 'all') params.status = filters.status;
            
            const response = await api.get('/attendance', { params });
            if (response.data.success) {
                setAttendanceData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
            toast.error('Failed to fetch attendance');
        } finally {
            setLoading(false);
        }
    };

    // Fetch or generate attendance for today
    const fetchOrGenerateAttendance = async () => {
        setLoading(true);
        try {
            // First try to get existing attendance
            const params = { date: filters.date };
            if (filters.batch !== 'all') params.batchId = filters.batch;
            
            let response = await api.get('/attendance', { params });
            
            if (response.data.success && response.data.data.length === 0) {
                // No attendance marked for today, generate from students
                let studentsList = students;
                if (filters.batch !== 'all') {
                    studentsList = students.filter(s => s.batch === filters.batch);
                }
                
                // Create attendance records for each student
                const attendanceRecords = studentsList.map(student => ({
                    studentId: student._id,
                    batchId: student.batchId,
                    date: filters.date,
                    status: 'Present',
                    clockIn: null,
                    clockOut: null,
                    remarks: ''
                }));
                
                // Bulk create attendance
                const createResponse = await api.post('/attendance/bulk', { records: attendanceRecords });
                if (createResponse.data.success) {
                    await fetchAttendance();
                }
            } else {
                setAttendanceData(response.data.data);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load attendance');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (students.length > 0) {
            fetchOrGenerateAttendance();
        }
    }, [filters.batch, filters.date, students]);

    // Calculate stats from real data
    const stats = {
        totalStudents: attendanceData.length,
        present: attendanceData.filter(a => a.status === 'Present').length,
        absent: attendanceData.filter(a => a.status === 'Absent').length,
        leave: attendanceData.filter(a => a.status === 'Leave').length,
        late: attendanceData.filter(a => a.status === 'Late').length,
        percentage: attendanceData.length > 0 
            ? ((attendanceData.filter(a => a.status === 'Present').length / attendanceData.length) * 100).toFixed(1) 
            : 0
    };

    // Mark single attendance
    const markAttendance = async (studentId, status) => {
        try {
            const existingRecord = attendanceData.find(a => a.studentId?._id === studentId);
            
            if (existingRecord) {
                // Update existing
                await api.put(`/attendance/${existingRecord._id}`, { status });
            } else {
                // Create new
                await api.post('/attendance', {
                    studentId,
                    batchId: students.find(s => s._id === studentId)?.batchId,
                    date: filters.date,
                    status
                });
            }
            
            toast.success(`Attendance marked as ${status}`);
            fetchAttendance();
        } catch (error) {
            console.error('Error marking attendance:', error);
            toast.error('Failed to mark attendance');
        }
    };

    // Bulk attendance
    const handleBulkAttendance = async (status) => {
        if (selectedStudents.length === 0) {
            toast.error('No students selected');
            return;
        }
        
        setLoading(true);
        try {
            const records = selectedStudents.map(studentId => ({
                studentId,
                batchId: students.find(s => s._id === studentId)?.batchId,
                date: filters.date,
                status
            }));
            
            await api.post('/attendance/bulk', { records });
            toast.success(`${selectedStudents.length} students marked as ${status}`);
            setSelectedStudents([]);
            fetchAttendance();
        } catch (error) {
            console.error('Error bulk marking:', error);
            toast.error('Failed to mark attendance');
        } finally {
            setLoading(false);
        }
    };

    // Update attendance
    const handleUpdateAttendance = async () => {
        if (!editingRecord) return;
        
        setLoading(true);
        try {
            await api.put(`/attendance/${editingRecord._id}`, {
                status: editingRecord.status,
                clockIn: editingRecord.clockIn,
                clockOut: editingRecord.clockOut,
                remarks: editingRecord.remarks
            });
            
            toast.success('Attendance updated successfully');
            setShowModal(false);
            setEditingRecord(null);
            fetchAttendance();
        } catch (error) {
            console.error('Error updating attendance:', error);
            toast.error('Failed to update attendance');
        } finally {
            setLoading(false);
        }
    };

    // Delete attendance
    const handleDeleteAttendance = async (id, studentName) => {
        if (window.confirm(`Delete attendance for ${studentName}?`)) {
            setLoading(true);
            try {
                await api.delete(`/attendance/${id}`);
                toast.success('Attendance deleted successfully');
                fetchAttendance();
            } catch (error) {
                console.error('Error deleting attendance:', error);
                toast.error('Failed to delete attendance');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudents(attendanceData.map(a => a.studentId?._id).filter(Boolean));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (studentId) => {
        if (selectedStudents.includes(studentId)) {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        } else {
            setSelectedStudents([...selectedStudents, studentId]);
        }
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

    const exportToExcel = async () => {
        try {
            const response = await api.get('/attendance/export', { 
                params: filters,
                responseType: 'blob' 
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_${filters.date}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Exporting to Excel...');
        } catch (error) {
            toast.error('Export failed');
        }
    };

    const exportToPDF = async () => {
        try {
            const response = await api.get('/attendance/export-pdf', { 
                params: filters,
                responseType: 'blob' 
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_${filters.date}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Exporting to PDF...');
        } catch (error) {
            toast.error('Export failed');
        }
    };

    // Filtered data based on search and status
    const filteredData = attendanceData.filter(record => {
        const studentName = record.studentId?.name || '';
        const matchesSearch = studentName.toLowerCase().includes(filters.search.toLowerCase());
        const matchesStatus = filters.status === 'all' || record.status === filters.status;
        return matchesSearch && matchesStatus;
    });

    if (loading && attendanceData.length === 0) {
        return (
            <div className={styles.loadingContainer}>
                <FaSpinner className={styles.spinner} />
                <p>Loading attendance data...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><FaUserGraduate /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.totalStudents}</span>
                        <span className={styles.statLabel}>Total Students</span>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.presentCard}`}>
                    <div className={styles.statIcon}>✓</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.present}</span>
                        <span className={styles.statLabel}>Present Today</span>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.absentCard}`}>
                    <div className={styles.statIcon}>✗</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.absent}</span>
                        <span className={styles.statLabel}>Absent Today</span>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.leaveCard}`}>
                    <div className={styles.statIcon}>○</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.leave}</span>
                        <span className={styles.statLabel}>On Leave</span>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.lateCard}`}>
                    <div className={styles.statIcon}>⏰</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.late}</span>
                        <span className={styles.statLabel}>Late Today</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><FaChartLine /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.percentage}%</span>
                        <span className={styles.statLabel}>Attendance %</span>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className={styles.filtersSection}>
                <div className={styles.searchBox}>
                    <FaSearch />
                    <input 
                        type="text" 
                        placeholder="Search student..." 
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                    />
                </div>
                <select 
                    className={styles.filterSelect}
                    value={filters.batch}
                    onChange={(e) => setFilters({...filters, batch: e.target.value})}
                >
                    <option value="all">All Batches</option>
                    {batches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
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
                <input 
                    type="date" 
                    className={styles.dateInput}
                    value={filters.date}
                    onChange={(e) => setFilters({...filters, date: e.target.value})}
                />
                <button className={styles.filterBtn} onClick={fetchAttendance}><FaFilter /> Apply</button>
            </div>

            {/* Bulk Actions */}
            {selectedStudents.length > 0 && (
                <div className={styles.bulkActions}>
                    <span>{selectedStudents.length} students selected</span>
                    <button onClick={() => handleBulkAttendance('Present')} className={styles.bulkPresent}>✓ Mark Present</button>
                    <button onClick={() => handleBulkAttendance('Absent')} className={styles.bulkAbsent}>✗ Mark Absent</button>
                    <button onClick={() => handleBulkAttendance('Leave')} className={styles.bulkLeave}>○ Mark Leave</button>
                    <button onClick={() => handleBulkAttendance('Late')} className={styles.bulkLate}>⏰ Mark Late</button>
                </div>
            )}

            {/* Export Buttons */}
            <div className={styles.exportSection}>
                <button onClick={exportToExcel} className={styles.exportBtn}><FaDownload /> Excel</button>
                <button onClick={exportToPDF} className={styles.exportBtn}><FaPrint /> PDF</button>
            </div>

            {/* Attendance Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.attendanceTable}>
                    <thead>
                        <tr>
                            <th><input type="checkbox" onChange={handleSelectAll} checked={selectedStudents.length === filteredData.length && filteredData.length > 0} /></th>
                            <th>Student Name</th>
                            <th>Batch</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Clock In</th>
                            <th>Clock Out</th>
                            <th>Working Hours</th>
                            <th>Remarks</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(record => (
                            <tr key={record._id}>
                                <td>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedStudents.includes(record.studentId?._id)}
                                        onChange={() => handleSelectStudent(record.studentId?._id)}
                                    />
                                </td>
                                <td><strong>{record.studentId?.name || 'N/A'}</strong></td>
                                <td>{record.batchId?.name || '-'}</td>
                                <td>{new Date(record.date).toLocaleDateString()}</td>
                                <td>
                                    <select 
                                        value={record.status}
                                        onChange={(e) => markAttendance(record.studentId?._id, e.target.value)}
                                        className={styles.statusSelect}
                                    >
                                        <option value="Present">✓ Present</option>
                                        <option value="Absent">✗ Absent</option>
                                        <option value="Leave">○ Leave</option>
                                        <option value="Late">⏰ Late</option>
                                    </select>
                                </td>
                                <td>{record.clockIn || '-'}</td>
                                <td>{record.clockOut || '-'}</td>
                                <td>{record.workingHours || '-'}</td>
                                <td>{record.remarks || '-'}</td>
                                <td>
                                    <div className={styles.actionButtons}>
                                        <button 
                                            onClick={() => {
                                                setEditingRecord(record);
                                                setShowModal(true);
                                            }} 
                                            className={styles.editBtn}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteAttendance(record._id, record.studentId?.name)} 
                                            className={styles.deleteBtn}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {showModal && editingRecord && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Edit Attendance</h3>
                            <button onClick={() => setShowModal(false)}><FaTimes /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Student</label>
                                <input type="text" value={editingRecord.studentId?.name || ''} disabled />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Status</label>
                                <select 
                                    value={editingRecord.status} 
                                    onChange={(e) => setEditingRecord({...editingRecord, status: e.target.value})}
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
                                        value={editingRecord.clockIn || ''} 
                                        onChange={(e) => setEditingRecord({...editingRecord, clockIn: e.target.value})}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Clock Out</label>
                                    <input 
                                        type="time" 
                                        value={editingRecord.clockOut || ''} 
                                        onChange={(e) => setEditingRecord({...editingRecord, clockOut: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Remarks</label>
                                <textarea 
                                    rows="3" 
                                    value={editingRecord.remarks || ''} 
                                    onChange={(e) => setEditingRecord({...editingRecord, remarks: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                            <button className={styles.saveBtn} onClick={handleUpdateAttendance}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceTable;
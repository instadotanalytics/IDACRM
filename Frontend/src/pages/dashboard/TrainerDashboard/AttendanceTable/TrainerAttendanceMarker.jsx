import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    FaSearch, FaCalendarAlt, FaSpinner, FaCheck, FaTimes,
    FaArrowLeft, FaEye, FaSave, FaChartLine, FaUsers,
    FaClock, FaDownload, FaUserCheck, FaCalendarWeek,
    FaGraduationCap, FaPercentage, FaCheckCircle, FaTimesCircle,
    FaUserTie, FaInfoCircle
} from 'react-icons/fa';
import api from '../../../../services/api';
import styles from './TrainerAttendanceMarker.module.css';

const TrainerAttendanceMarker = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [students, setStudents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [monthlyReports, setMonthlyReports] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState('');

    // ✅ Get current user for tracking
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setCurrentUser(user);
                setUserRole(user.role);
                console.log('=== ATTENDANCE MANAGER ===');
                console.log('Current User:', user.name);
                console.log('User ID:', user._id || user.id);
                console.log('User Role:', user.role);
            } catch (error) {
                console.error('Error parsing user:', error);
            }
        }
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const userId = currentUser?._id || currentUser?.id;
            console.log('Fetching batches for user ID:', userId);
            console.log('User Role:', userRole);
            
            let allBatches = [];
            
            // ✅ If user is trainer, get assigned batches
            if (userRole === 'trainer') {
                try {
                    const response = await api.get('/batches/trainer/assigned');
                    if (response.data.success) {
                        allBatches = response.data.data;
                        console.log('Trainer assigned batches:', allBatches.length);
                    }
                } catch (err) {
                    console.log('Trainer endpoint failed');
                }
            }
            
            // ✅ If no batches found or user is counselor, get all batches
            if (allBatches.length === 0) {
                const response = await api.get('/batches');
                if (response.data.success) {
                    allBatches = response.data.data;
                    console.log('All batches:', allBatches.length);
                }
            }
            
            // ✅ If user is counselor, filter batches they have access to
            let finalBatches = allBatches;
            if (userRole === 'counselor') {
                // Counselors can see all batches or only their assigned ones
                // For now, show all batches
                finalBatches = allBatches;
            }
            
            console.log('Final batches to display:', finalBatches.length);
            setBatches(finalBatches);
            
            if (finalBatches.length === 0) {
                toast.error('No batches available. Contact admin.');
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
            toast.error('Failed to fetch batches');
            setBatches([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentsByBatch = async () => {
        if (!selectedBatch) return;
        setLoading(true);
        try {
            console.log('Fetching students for batch:', selectedBatch.name);
            console.log('Batch ID:', selectedBatch._id);
            
            const response = await api.get('/admissions');
            if (response.data.success) {
                const allStudents = response.data.data;
                console.log('Total students:', allStudents.length);
                
                const batchStudents = allStudents.filter(student => {
                    const studentBatchId = student.batchId?._id || student.batchId;
                    return studentBatchId === selectedBatch._id;
                });
                
                console.log('Students in this batch:', batchStudents.length);
                setStudents(batchStudents);
                
                const initialAttendance = batchStudents.map(student => ({
                    studentId: student._id,
                    studentName: student.name,
                    email: student.email,
                    photo: student.photo,
                    enrollmentId: student.enrollmentId,
                    status: 'Present',
                    remarks: '',
                    attendanceId: null
                }));
                setAttendanceData(initialAttendance);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceForDate = async () => {
        if (!selectedBatch || !selectedDate || students.length === 0) return;
        try {
            const response = await api.get('/attendance', {
                params: { batchId: selectedBatch._id, date: selectedDate }
            });
            if (response.data.success && response.data.data.length > 0) {
                const existingAttendance = response.data.data;
                const updatedAttendance = attendanceData.map(student => {
                    const existing = existingAttendance.find(a => {
                        const studentIdFromAtt = a.studentId?._id || a.studentId;
                        return studentIdFromAtt === student.studentId;
                    });
                    if (existing) {
                        return { 
                            ...student, 
                            status: existing.status, 
                            remarks: existing.remarks || '', 
                            attendanceId: existing._id,
                            markedBy: existing.markedBy?.name,
                            markedAt: existing.createdAt
                        };
                    }
                    return student;
                });
                setAttendanceData(updatedAttendance);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    const fetchMonthlyReports = async () => {
        if (!selectedBatch) return;
        try {
            const response = await api.get('/attendance/batch/monthly', {
                params: { batchId: selectedBatch._id }
            });
            if (response.data.success) {
                setMonthlyReports(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching monthly reports:', error);
        }
    };

    useEffect(() => {
        if (selectedBatch) {
            fetchStudentsByBatch();
            fetchMonthlyReports();
        }
    }, [selectedBatch]);
    
    useEffect(() => {
        if (selectedBatch && selectedDate && students.length > 0) {
            fetchAttendanceForDate();
        }
    }, [selectedDate, students]);

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => prev.map(s => s.studentId === studentId ? { ...s, status } : s));
    };
    
    const handleRemarksChange = (studentId, remarks) => {
        setAttendanceData(prev => prev.map(s => s.studentId === studentId ? { ...s, remarks } : s));
    };
    
    const markAll = (status) => {
        setAttendanceData(prev => prev.map(s => ({ ...s, status })));
    };

    const saveAttendance = async () => {
        if (!selectedBatch) { toast.error('No batch selected'); return; }
        if (attendanceData.length === 0) { toast.error('No students in this batch'); return; }
        setSaving(true);
        try {
            const userId = currentUser?._id || currentUser?.id;
            const records = attendanceData.map(student => ({
                studentId: student.studentId,
                batchId: selectedBatch._id,
                date: selectedDate,
                status: student.status,
                remarks: student.remarks,
                attendanceId: student.attendanceId,
                trainerId: userId,
                trainerName: currentUser?.name
            }));
            const response = await api.post('/attendance/bulk', { records });
            if (response.data.success) {
                toast.success(`Attendance saved for ${selectedDate} by ${currentUser?.name}`);
                fetchMonthlyReports();
                await fetchAttendanceForDate();
            }
        } catch (error) {
            console.error('Save attendance error:', error);
            toast.error(error.response?.data?.message || 'Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    const downloadReport = (report) => {
        const reportToDownload = report || selectedReport;
        if (!reportToDownload) return;

        const printWindow = window.open('', '_blank');
        const batchName = selectedBatch?.name || 'Batch';
        const batchCode = selectedBatch?.code || '';
        const batchCourse = selectedBatch?.course || '';

        const tableRows = reportToDownload.students?.map((student, idx) => `
            <tr style="background:${idx % 2 === 0 ? '#f8fafc' : '#ffffff'}">
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;color:#64748b;font-size:13px">${idx + 1}</td>
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">
                    <div style="font-weight:600;color:#1e293b;font-size:14px">${student.name}</div>
                    <div style="color:#94a3b8;font-size:12px">${student.enrollmentId || ''}</div>
                </td>
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:600;font-size:14px">${student.present}</td>
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;color:#dc2626;font-weight:600;font-size:14px">${student.absent}</td>
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;color:#d97706;font-weight:600;font-size:14px">${student.leave || 0}</td>
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;color:#6366f1;font-weight:600;font-size:14px">${student.late || 0}</td>
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:600;font-size:14px">${student.total}</td>
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;">
                    <span style="background:${student.percentage >= 75 ? '#dcfce7' : '#fee2e2'};color:${student.percentage >= 75 ? '#16a34a' : '#dc2626'};padding:4px 10px;border-radius:20px;font-size:13px;font-weight:700">${student.percentage}%</span>
                </td>
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;">
                    <span style="background:${student.percentage >= 75 ? '#dcfce7' : '#fee2e2'};color:${student.percentage >= 75 ? '#16a34a' : '#dc2626'};padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600">${student.percentage >= 75 ? '✓ Good' : '⚠ At Risk'}</span>
                </td>
            </table>
        `).join('') || '';

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Attendance Report - ${reportToDownload.month}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Outfit', sans-serif; background: #fff; color: #1e293b; }
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body style="padding:40px;max-width:1000px;margin:0 auto">
            <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);border-radius:16px;padding:32px;margin-bottom:28px;color:white">
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                    <div>
                        <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#94a3b8;margin-bottom:6px">Monthly Attendance Report</div>
                        <div style="font-size:28px;font-weight:800;margin-bottom:4px">${reportToDownload.month}</div>
                        <div style="font-size:15px;color:#94a3b8">${batchName} &nbsp;·&nbsp; ${batchCode} &nbsp;·&nbsp; ${batchCourse}</div>
                    </div>
                    <div style="text-align:right">
                        <div style="font-size:11px;color:#94a3b8;margin-bottom:4px">Overall Attendance</div>
                        <div style="font-size:40px;font-weight:800;color:${reportToDownload.percentage >= 75 ? '#4ade80' : '#f87171'}">${reportToDownload.percentage}%</div>
                    </div>
                </div>
                <div style="margin-top:16px;padding-top:12px;border-top:1px solid #334155;font-size:12px;color:#94a3b8;display:flex;justify-content:space-between">
                    <span><FaUserTie /> Generated by: ${currentUser?.name || 'Trainer'}</span>
                    <span><FaCalendarWeek /> Date: ${new Date().toLocaleDateString()}</span>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:28px">
                ${[
                    { label: 'Total Students', value: reportToDownload.students?.length || 0, color: '#6366f1', bg: '#eef2ff' },
                    { label: 'Working Days', value: reportToDownload.totalDays, color: '#0ea5e9', bg: '#f0f9ff' },
                    { label: 'Present', value: reportToDownload.present, color: '#16a34a', bg: '#f0fdf4' },
                    { label: 'Absent', value: reportToDownload.absent, color: '#dc2626', bg: '#fef2f2' },
                    { label: 'Leave', value: reportToDownload.leave, color: '#d97706', bg: '#fffbeb' },
                ].map(card => `
                    <div style="background:${card.bg};border-radius:12px;padding:16px;text-align:center">
                        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">${card.label}</div>
                        <div style="font-size:26px;font-weight:800;color:${card.color}">${card.value}</div>
                    </div>
                `).join('')}
            </div>

            <div style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden">
                <div style="padding:18px 20px;border-bottom:1px solid #e2e8f0;background:#f8fafc">
                    <span style="font-size:15px;font-weight:700;color:#1e293b">Student-wise Attendance Details</span>
                </div>
                <table style="width:100%;border-collapse:collapse">
                    <thead>
                        <tr style="background:#f1f5f9">
                            <th style="padding:12px 14px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#64748b;font-weight:600">#</th>
                            <th style="padding:12px 14px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#64748b;font-weight:600">Student</th>
                            <th style="padding:12px 14px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#16a34a;font-weight:600">Present</th>
                            <th style="padding:12px 14px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#dc2626;font-weight:600">Absent</th>
                            <th style="padding:12px 14px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#d97706;font-weight:600">Leave</th>
                            <th style="padding:12px 14px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6366f1;font-weight:600">Late</th>
                            <th style="padding:12px 14px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#64748b;font-weight:600">Total</th>
                            <th style="padding:12px 14px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#64748b;font-weight:600">%</th>
                            <th style="padding:12px 14px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#64748b;font-weight:600">Status</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>

            <div style="margin-top:24px;text-align:center;color:#94a3b8;font-size:12px">
                Generated on ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })} &nbsp;·&nbsp; ${batchName} Attendance System
            </div>

            <div class="no-print" style="text-align:center;margin-top:30px">
                <button onclick="window.print()" style="background:#0f172a;color:white;border:none;padding:12px 32px;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit">
                    🖨️ Print / Save as PDF
                </button>
            </div>
        </body>
        </html>`;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
    };

    const getAttendanceSummary = () => {
        const present = attendanceData.filter(s => s.status === 'Present').length;
        const absent = attendanceData.filter(s => s.status === 'Absent').length;
        const leave = attendanceData.filter(s => s.status === 'Leave').length;
        const late = attendanceData.filter(s => s.status === 'Late').length;
        return { present, absent, leave, late, total: attendanceData.length };
    };

    const summary = getAttendanceSummary();
    const summaryPercentage = summary.total > 0 ? ((summary.present / summary.total) * 100).toFixed(1) : 0;

    const filteredStudents = attendanceData.filter(student =>
        student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.enrollmentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ── BATCH SELECTION VIEW ──
    if (!selectedBatch) {
        return (
            <div className={styles.container}>
                <div className={styles.pageHeader}>
                    <div className={styles.pageHeaderIcon}><FaUserCheck /></div>
                    <div>
                        <h1>Attendance Manager</h1>
                        <p>Select a batch to begin marking attendance</p>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loaderWrap}>
                        <div className={styles.loaderSpinner}></div>
                        <span>Loading batches...</span>
                    </div>
                ) : batches.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📚</div>
                        <h3>No Batches Available</h3>
                        <p>No batches are available in the system.</p>
                        <p className={styles.hintText}>Contact admin to create batches.</p>
                    </div>
                ) : (
                    <div className={styles.batchesGrid}>
                        {batches.map((batch, i) => (
                            <div
                                key={batch._id}
                                className={styles.batchCard}
                                onClick={() => setSelectedBatch(batch)}
                                style={{ animationDelay: `${i * 60}ms` }}
                            >
                                <div className={styles.batchCardAccent}></div>
                                <div className={styles.batchCardTop}>
                                    <div className={styles.batchCardEmoji}>📚</div>
                                    <span className={styles.batchCardStatus}>{batch.status || 'active'}</span>
                                </div>
                                <h3 className={styles.batchCardName}>{batch.name}</h3>
                                <p className={styles.batchCardCode}>{batch.code}</p>
                                <div className={styles.batchCardMeta}>
                                    <span><FaUsers /> {batch.studentsCount || batch.currentStudents || 0} Students</span>
                                    <span><FaClock /> {batch.timings}</span>
                                </div>
                                <div className={styles.batchCardCourse}>{batch.course}</div>
                                <div className={styles.batchCardArrow}>Mark Attendance →</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ── MAIN ATTENDANCE VIEW ──
    return (
        <div className={styles.container}>
            {/* Top Bar with User Info */}
            <div className={styles.topBar}>
                <button className={styles.backBtn} onClick={() => setSelectedBatch(null)}>
                    <FaArrowLeft /> Batches
                </button>
                <div className={styles.batchTitle}>
                    <span className={styles.batchTitleName}>{selectedBatch.name}</span>
                    <span className={styles.batchTitleMeta}>{selectedBatch.code} · {selectedBatch.course}</span>
                </div>
                <div className={styles.topBarRight}>
                    <span className={styles.trainerBadge}>
                        <FaUserTie /> {currentUser?.name || 'User'}
                    </span>
                    <span className={styles.studentCountBadge}><FaUsers /> {students.length} Students</span>
                </div>
            </div>

            {/* Date + Stats Row */}
            <div className={styles.controlsRow}>
                <div className={styles.datePickerBox}>
                    <FaCalendarAlt className={styles.dateIcon} />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className={styles.datePicker}
                    />
                </div>
                <div className={styles.statsRow}>
                    {[
                        { label: 'Total', value: summary.total, cls: '' },
                        { label: 'Present', value: summary.present, cls: styles.presentStat },
                        { label: 'Absent', value: summary.absent, cls: styles.absentStat },
                        { label: 'Leave', value: summary.leave, cls: styles.leaveStat },
                        { label: 'Late', value: summary.late, cls: styles.lateStat },
                        { label: 'Rate', value: `${summaryPercentage}%`, cls: styles.rateStat },
                    ].map(s => (
                        <div key={s.label} className={`${styles.statChip} ${s.cls}`}>
                            <span className={styles.statChipValue}>{s.value}</span>
                            <span className={styles.statChipLabel}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Search + Quick Actions */}
            <div className={styles.actionsBar}>
                <div className={styles.searchBox}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name, email or enrollment ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    {searchTerm && <button className={styles.clearSearch} onClick={() => setSearchTerm('')}><FaTimes /></button>}
                </div>
                <div className={styles.quickBtns}>
                    <button onClick={() => markAll('Present')} className={`${styles.quickBtn} ${styles.qPresent}`}>✓ All Present</button>
                    <button onClick={() => markAll('Absent')} className={`${styles.quickBtn} ${styles.qAbsent}`}>✗ All Absent</button>
                    <button onClick={() => markAll('Leave')} className={`${styles.quickBtn} ${styles.qLeave}`}>○ All Leave</button>
                    <button onClick={() => markAll('Late')} className={`${styles.quickBtn} ${styles.qLate}`}>⏰ All Late</button>
                    <button onClick={saveAttendance} className={styles.saveBtn} disabled={saving}>
                        {saving ? <FaSpinner className={styles.spinIcon} /> : <FaSave />}
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Students Table */}
            <div className={styles.tableCard}>
                {loading ? (
                    <div className={styles.loaderWrap}>
                        <div className={styles.loaderSpinner}></div>
                        <span>Loading students...</span>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>👨‍🎓</div>
                        <h3>No Students Found</h3>
                        <p>No students enrolled in this batch yet.</p>
                    </div>
                ) : (
                    <div className={styles.tableScroll}>
                        <table className={styles.attendanceTable}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student</th>
                                    <th>Enrollment ID</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                    {(userRole === 'admin_manager' || userRole === 'super_admin') && <th>Marked By</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student, index) => (
                                    <tr key={student.studentId} className={styles.tableRow}>
                                        <td className={styles.indexCell}>{index + 1}</td>
                                        <td>
                                            <div className={styles.studentCell}>
                                                {student.photo
                                                    ? <img src={student.photo} alt={student.studentName} className={styles.avatar} />
                                                    : <div className={styles.avatarFallback}>{student.studentName?.charAt(0)?.toUpperCase()}</div>
                                                }
                                                <div>
                                                    <div className={styles.studentName}>{student.studentName}</div>
                                                    <div className={styles.studentEmail}>{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className={styles.enrollTag}>{student.enrollmentId || '—'}</span></td>
                                        <td>
                                            <div className={styles.statusToggleGroup}>
                                                {['Present', 'Absent', 'Leave', 'Late'].map(s => (
                                                    <label
                                                        key={s}
                                                        className={`${styles.statusToggle} ${styles[`toggle${s}`]} ${student.status === s ? styles.toggleActive : ''}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`status_${student.studentId}`}
                                                            value={s}
                                                            checked={student.status === s}
                                                            onChange={() => handleStatusChange(student.studentId, s)}
                                                            style={{ display: 'none' }}
                                                        />
                                                        {s}
                                                    </label>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                placeholder="Add remarks..."
                                                value={student.remarks}
                                                onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                                                className={styles.remarksInput}
                                            />
                                        </td>
                                        {(userRole === 'admin_manager' || userRole === 'super_admin') && (
                                            <td className={styles.markedByCell}>
                                                {student.markedBy || currentUser?.name || '-'}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Monthly Reports */}
            <div className={styles.reportsSection}>
                <div className={styles.reportsSectionHeader}>
                    <div>
                        <h3><FaCalendarWeek /> Monthly Reports</h3>
                        <p>Click any card to view detailed breakdown</p>
                    </div>
                </div>

                {monthlyReports.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📊</div>
                        <h3>No Reports Yet</h3>
                        <p>Mark attendance to generate monthly reports.</p>
                    </div>
                ) : (
                    <div className={styles.reportsGrid}>
                        {monthlyReports.map((report, idx) => {
                            const monthWord = report.month.split(' ')[0];
                            const yearWord = report.month.split(' ')[1];
                            const isGood = report.percentage >= 75;
                            return (
                                <div
                                    key={idx}
                                    className={`${styles.reportCard} ${isGood ? styles.reportCardGood : styles.reportCardBad}`}
                                    onClick={() => { setSelectedReport(report); setShowReportModal(true); }}
                                >
                                    <div className={styles.reportCardMonth}>
                                        <span className={styles.reportMonthName}>{monthWord}</span>
                                        <span className={styles.reportYear}>{yearWord}</span>
                                    </div>
                                    <div className={styles.reportPercentBig}>{report.percentage}%</div>
                                    <div className={styles.reportCardStats}>
                                        <span className={styles.rPresent}>↑ {report.present}</span>
                                        <span className={styles.rAbsent}>↓ {report.absent}</span>
                                        <span className={styles.rLeave}>○ {report.leave}</span>
                                    </div>
                                    <div className={styles.reportCardFooter}>
                                        <span>{report.students?.length || 0} students · {report.totalDays} days</span>
                                        <FaEye />
                                    </div>
                                    <div className={styles.reportCardDownload}
                                        onClick={(e) => { e.stopPropagation(); downloadReport(report); }}
                                        title="Download Report"
                                    >
                                        <FaDownload />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Report Modal */}
            {showReportModal && selectedReport && (
                <div className={styles.modalOverlay} onClick={() => setShowReportModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <div className={styles.modalHeaderSub}>Attendance Report</div>
                                <h3 className={styles.modalHeaderTitle}>{selectedReport.month}</h3>
                                <p className={styles.modalHeaderBatch}>{selectedBatch?.name} · {selectedBatch?.code}</p>
                                <p className={styles.modalHeaderTrainer}>
                                    <FaUserTie /> Generated by: {currentUser?.name || 'User'}
                                </p>
                            </div>
                            <button className={styles.modalClose} onClick={() => setShowReportModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.modalSummaryGrid}>
                                {[
                                    { label: 'Students', value: selectedReport.students?.length || 0, color: 'indigo' },
                                    { label: 'Working Days', value: selectedReport.totalDays, color: 'blue' },
                                    { label: 'Present', value: selectedReport.present, color: 'green' },
                                    { label: 'Absent', value: selectedReport.absent, color: 'red' },
                                    { label: 'Leave', value: selectedReport.leave, color: 'amber' },
                                    { label: 'Overall %', value: `${selectedReport.percentage}%`, color: selectedReport.percentage >= 75 ? 'green' : 'red' },
                                ].map(c => (
                                    <div key={c.label} className={`${styles.summaryCard} ${styles[`card_${c.color}`]}`}>
                                        <div className={styles.summaryCardValue}>{c.value}</div>
                                        <div className={styles.summaryCardLabel}>{c.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.modalTableSection}>
                                <h4 className={styles.modalTableTitle}>Student-wise Details</h4>
                                {selectedReport.students && selectedReport.students.length > 0 ? (
                                    <div className={styles.modalTableScroll}>
                                        <table className={styles.detailsTable}>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Student</th>
                                                    <th>Present</th>
                                                    <th>Absent</th>
                                                    <th>Leave</th>
                                                    <th>Late</th>
                                                    <th>Total</th>
                                                    <th>%</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedReport.students.map((student, idx) => (
                                                    <tr key={student.id || idx} className={styles.detailsRow}>
                                                        <td className={styles.idxCell}>{idx + 1}</td>
                                                        <td>
                                                            <div className={styles.detailsName}>{student.name}</div>
                                                            <div className={styles.detailsEnroll}>{student.enrollmentId}</div>
                                                        </td>
                                                        <td className={styles.presentVal}>{student.present}</td>
                                                        <td className={styles.absentVal}>{student.absent}</td>
                                                        <td className={styles.leaveVal}>{student.leave || 0}</td>
                                                        <td className={styles.lateVal}>{student.late || 0}</td>
                                                        <td className={styles.totalVal}>{student.total}</td>
                                                        <td>
                                                            <span className={`${styles.percentBadge} ${student.percentage >= 75 ? styles.percentGood : styles.percentBad}`}>
                                                                {student.percentage}%
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`${styles.statusBadge} ${student.percentage >= 75 ? styles.badgeGood : styles.badgeBad}`}>
                                                                {student.percentage >= 75 ? <><FaCheckCircle /> Good</> : <><FaTimesCircle /> At Risk</>}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className={styles.noData}>No student data available for this month.</div>
                                )}
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.downloadBtn} onClick={() => downloadReport(selectedReport)}>
                                <FaDownload /> Download PDF Report
                            </button>
                            <button className={styles.closeBtn} onClick={() => setShowReportModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerAttendanceMarker;
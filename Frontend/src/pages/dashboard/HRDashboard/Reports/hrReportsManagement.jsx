import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    FaFileAlt, FaPlus, FaSearch, FaEdit, FaTrash, FaEye,
    FaTimes, FaCheck, FaSpinner, FaUser, FaCalendarAlt,
    FaClock, FaChartLine, FaTasks, FaComment, FaBuilding,
    FaFilter, FaPaperPlane, FaUserCircle
} from 'react-icons/fa';
import  hrReportService  from '../../../../services/hrReportservice.js';
import styles from './hrReportsManagement.module.css';

const HRDailyReport = () => {
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [stats, setStats] = useState({ 
        total: 0, 
        today: 0, 
        thisWeek: 0,
        totalHours: 0,
        avgProductivity: 0,
        sentToManager: 0,
        viewedByManager: 0
    });
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [employeeFilter, setEmployeeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

    // Form Data
    const [formData, setFormData] = useState({
        employeeId: '',
        employeeName: '',
        employeeEmail: '',
        employeeRole: '',
        reportDate: new Date().toISOString().split('T')[0],
        reportTitle: '',
        reportContent: '',
        tasksCompleted: [{ taskName: '', taskStatus: 'Completed', timeSpent: '' }],
        hoursWorked: 8,
        productivityScore: 80,
        challenges: '',
        tomorrowPlan: '',
        needSupport: ''
    });

    useEffect(() => {
        fetchReports();
        fetchEmployees();
        fetchStats();
    }, [pagination.page, employeeFilter, statusFilter, searchTerm]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await hrReportService.getReports({
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm,
                employeeId: employeeFilter,
                status: statusFilter
            });
            if (response.data.success) {
                setReports(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination.total,
                    pages: response.data.pagination.pages
                }));
                if (response.data.stats) {
                    setStats(prev => ({ ...prev, ...response.data.stats }));
                }
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to fetch reports');
            // Mock data for demo
            setReports(mockReports);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await hrReportService.getEmployees();
            if (response.data.success) {
                setEmployees(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            // Mock employees if API fails
            setEmployees([
                { _id: '1', name: 'Amit Sharma', email: 'amit@idacrm.com', role: 'employee', department: 'IT' },
                { _id: '2', name: 'Neha Gupta', email: 'neha@idacrm.com', role: 'employee', department: 'HR' },
                { _id: '3', name: 'Rajesh Verma', email: 'rajesh@idacrm.com', role: 'employee', department: 'Sales' },
                { _id: '4', name: 'Priya Singh', email: 'priya@idacrm.com', role: 'employee', department: 'Marketing' },
                { _id: '5', name: 'Vikram Mehta', email: 'vikram@idacrm.com', role: 'employee', department: 'Development' }
            ]);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await hrReportService.getDashboardStats();
            if (response.data.success) {
                setStats(prev => ({ ...prev, ...response.data.data }));
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Mock stats
            setStats({
                total: 24,
                today: 3,
                thisWeek: 12,
                totalHours: 156,
                avgProductivity: 78.5,
                sentToManager: 8,
                viewedByManager: 5
            });
        }
    };

    const handleEmployeeChange = (e) => {
        const employeeId = e.target.value;
        const employee = employees.find(emp => emp._id === employeeId);
        if (employee) {
            setFormData({
                ...formData,
                employeeId: employee._id,
                employeeName: employee.name,
                employeeEmail: employee.email,
                employeeRole: employee.role || 'employee'
            });
        }
    };

    const handleAddTask = () => {
        setFormData({
            ...formData,
            tasksCompleted: [...formData.tasksCompleted, { taskName: '', taskStatus: 'Completed', timeSpent: '' }]
        });
    };

    const handleRemoveTask = (index) => {
        const newTasks = formData.tasksCompleted.filter((_, i) => i !== index);
        setFormData({ ...formData, tasksCompleted: newTasks });
    };

    const handleTaskChange = (index, field, value) => {
        const newTasks = [...formData.tasksCompleted];
        newTasks[index][field] = value;
        setFormData({ ...formData, tasksCompleted: newTasks });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.employeeId) {
            toast.error('Please select an employee');
            return;
        }
        if (!formData.reportTitle) {
            toast.error('Please enter report title');
            return;
        }
        if (!formData.reportContent) {
            toast.error('Please enter report content');
            return;
        }

        setLoading(true);
        try {
            const reportData = {
                employeeId: formData.employeeId,
                employeeName: formData.employeeName,
                employeeEmail: formData.employeeEmail,
                employeeRole: formData.employeeRole,
                reportTitle: formData.reportTitle,
                reportContent: formData.reportContent,
                tasksCompleted: formData.tasksCompleted.filter(t => t.taskName),
                hoursWorked: formData.hoursWorked,
                productivityScore: formData.productivityScore,
                challenges: formData.challenges,
                tomorrowPlan: formData.tomorrowPlan,
                needSupport: formData.needSupport
            };
            
            const response = await hrReportService.generateReport(reportData);
            if (response.data.success) {
                toast.success('Daily report submitted successfully');
                setShowModal(false);
                resetForm();
                fetchReports();
                fetchStats();
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    const handleSendToManager = async (report) => {
        setLoading(true);
        try {
            const response = await hrReportService.sendToManager(report._id);
            if (response.data.success) {
                toast.success('Report sent to manager successfully');
                fetchReports();
                fetchStats();
            }
        } catch (error) {
            toast.error('Failed to send report');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (report) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            setLoading(true);
            try {
                const response = await hrReportService.deleteReport(report._id);
                if (response.data.success) {
                    toast.success('Report deleted successfully');
                    fetchReports();
                    fetchStats();
                    setShowViewModal(false);
                }
            } catch (error) {
                toast.error('Failed to delete report');
            } finally {
                setLoading(false);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            employeeId: '',
            employeeName: '',
            employeeEmail: '',
            employeeRole: '',
            reportDate: new Date().toISOString().split('T')[0],
            reportTitle: '',
            reportContent: '',
            tasksCompleted: [{ taskName: '', taskStatus: 'Completed', timeSpent: '' }],
            hoursWorked: 8,
            productivityScore: 80,
            challenges: '',
            tomorrowPlan: '',
            needSupport: ''
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            'Submitted': 'bg-blue-100 text-blue-800',
            'Sent To Manager': 'bg-purple-100 text-purple-800',
            'Viewed by Manager': 'bg-green-100 text-green-800',
            'Reviewed': 'bg-yellow-100 text-yellow-800',
            'Approved': 'bg-green-100 text-green-800',
            'Draft': 'bg-gray-100 text-gray-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
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

    // Mock reports for demo
    const mockReports = [
        {
            _id: '1',
            employeeName: 'Amit Sharma',
            employeeRole: 'Developer',
            employeeEmail: 'amit@idacrm.com',
            reportTitle: 'Daily Development Report',
            reportContent: 'Worked on frontend components and API integration',
            reportDate: new Date(),
            hoursWorked: 8,
            productivityScore: 85,
            status: 'Submitted',
            createdByName: 'Shreya Varma',
            tasksCompleted: [{ taskName: 'API Integration', taskStatus: 'Completed', timeSpent: '3h' }],
            challenges: '',
            tomorrowPlan: '',
            needSupport: '',
            createdAt: new Date()
        }
    ];

    return (
        <div className={styles.container}>
            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <StatCard title="Total Reports" value={stats.total} icon={<FaFileAlt />} color="#2563eb" />
                <StatCard title="Today's Reports" value={stats.today} icon={<FaCalendarAlt />} color="#22c55e" />
                <StatCard title="This Week" value={stats.thisWeek} icon={<FaClock />} color="#f59e0b" />
                <StatCard title="Total Hours" value={`${stats.totalHours || 0}h`} icon={<FaClock />} color="#8b5cf6" />
                <StatCard title="Avg Productivity" value={`${stats.avgProductivity || 0}%`} icon={<FaChartLine />} color="#06b6d4" />
                <StatCard title="Sent to Manager" value={stats.sentToManager || 0} icon={<FaPaperPlane />} color="#ec4899" />
            </div>

            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h2><FaFileAlt /> Daily Employee Reports</h2>
                    <p>Submit and manage daily work reports for all employees</p>
                </div>
                <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                    <FaPlus /> Submit Report
                </button>
            </div>

            {/* Search and Filters */}
            <div className={styles.filterBar}>
                <div className={styles.searchBox}>
                    <FaSearch />
                    <input 
                        type="text" 
                        placeholder="Search by employee name or report title..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
                <select 
                    className={styles.filterSelect} 
                    value={employeeFilter} 
                    onChange={(e) => setEmployeeFilter(e.target.value)}
                >
                    <option value="all">All Employees</option>
                    {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.name}</option>
                    ))}
                </select>
                <select 
                    className={styles.filterSelect} 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Sent To Manager">Sent to Manager</option>
                    <option value="Viewed by Manager">Viewed by Manager</option>
                </select>
                <button className={styles.clearFiltersBtn} onClick={() => { setSearchTerm(''); setEmployeeFilter('all'); setStatusFilter('all'); }}>
                    <FaTimes /> Clear
                </button>
            </div>

            {/* Reports Table */}
            <div className={styles.tableWrapper}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <FaSpinner className={styles.spinner} /> Loading reports...
                    </div>
                ) : reports.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FaFileAlt className={styles.emptyIcon} />
                        <h3>No reports found</h3>
                        <p>Click "Submit Report" to create your first daily report</p>
                        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                            <FaPlus /> Submit Report
                        </button>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Report Title</th>
                                <th>Date</th>
                                <th>Hours</th>
                                <th>Productivity</th>
                                <th>Status</th>
                                <th>Submitted By</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(report => (
                                <tr key={report._id}>
                                    <td>
                                        <div className={styles.employeeInfo}>
                                            <FaUserCircle className={styles.avatar} />
                                            <div>
                                                <strong>{report.employeeName}</strong>
                                                <small>{report.employeeRole}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <strong>{report.reportTitle}</strong>
                                        <small>{report.reportContent?.substring(0, 50)}...</small>
                                    </td>
                                    <td>{new Date(report.reportDate).toLocaleDateString()}</td>
                                    <td className={styles.textCenter}>{report.hoursWorked}h</td>
                                    <td className={styles.textCenter}>
                                        <span className={
                                            report.productivityScore >= 80 ? styles.highlightGreen : 
                                            report.productivityScore >= 60 ? styles.highlightYellow : 
                                            styles.highlightRed
                                        }>
                                            {report.productivityScore}%
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(report.status)}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td>{report.createdByName || '-'}</td>
                                    <td className={styles.actionBtns}>
                                        <button onClick={() => { setSelectedReport(report); setShowViewModal(true); }} title="View">
                                            <FaEye />
                                        </button>
                                        {report.status === 'Submitted' && (
                                            <button onClick={() => handleSendToManager(report)} title="Send to Manager">
                                                <FaPaperPlane />
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(report)} title="Delete">
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

            {/* ==================== SUBMIT REPORT MODAL ==================== */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3><FaPlus /> Submit Daily Report</h3>
                            <button onClick={() => setShowModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                {/* Employee Selection */}
                                <div className={styles.formSection}>
                                    <h4><FaUser /> Employee Information</h4>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Select Employee *</label>
                                            <select value={formData.employeeId} onChange={handleEmployeeChange} required>
                                                <option value="">-- Select Employee --</option>
                                                {employees.map(emp => (
                                                    <option key={emp._id} value={emp._id}>
                                                        {emp.name} ({emp.role}) - {emp.department || 'N/A'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Report Date</label>
                                            <input type="date" value={formData.reportDate} onChange={(e) => setFormData({...formData, reportDate: e.target.value})} />
                                        </div>
                                    </div>
                                    {formData.employeeName && (
                                        <div className={styles.autoFillInfo}>
                                            <FaCheck className={styles.checkIcon} />
                                            <span>Employee: <strong>{formData.employeeName}</strong> ({formData.employeeRole})</span>
                                            <span>Email: {formData.employeeEmail}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Report Details */}
                                <div className={styles.formSection}>
                                    <h4><FaFileAlt /> Report Details</h4>
                                    <div className={styles.formGroup}>
                                        <label>Report Title *</label>
                                        <input type="text" value={formData.reportTitle} onChange={(e) => setFormData({...formData, reportTitle: e.target.value})} placeholder="e.g., Daily Work Report" required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Report Content / Description *</label>
                                        <textarea rows="4" value={formData.reportContent} onChange={(e) => setFormData({...formData, reportContent: e.target.value})} placeholder="Describe what was done today in detail..." required />
                                    </div>
                                </div>

                                {/* Tasks Completed */}
                                <div className={styles.formSection}>
                                    <h4><FaTasks /> Tasks Completed</h4>
                                    {formData.tasksCompleted.map((task, index) => (
                                        <div key={index} className={styles.taskRow}>
                                            <div className={styles.taskInput}>
                                                <input type="text" value={task.taskName} onChange={(e) => handleTaskChange(index, 'taskName', e.target.value)} placeholder="Task name" />
                                            </div>
                                            <div className={styles.taskStatus}>
                                                <select value={task.taskStatus} onChange={(e) => handleTaskChange(index, 'taskStatus', e.target.value)}>
                                                    <option value="Completed">✅ Completed</option>
                                                    <option value="In Progress">🔄 In Progress</option>
                                                    <option value="Pending">⏳ Pending</option>
                                                </select>
                                            </div>
                                            <div className={styles.taskTime}>
                                                <input type="text" value={task.timeSpent} onChange={(e) => handleTaskChange(index, 'timeSpent', e.target.value)} placeholder="Time spent (e.g., 2h)" />
                                            </div>
                                            <button type="button" className={styles.removeTaskBtn} onClick={() => handleRemoveTask(index)}><FaTimes /></button>
                                        </div>
                                    ))}
                                    <button type="button" className={styles.addTaskBtn} onClick={handleAddTask}>
                                        <FaPlus /> Add Task
                                    </button>
                                </div>

                                {/* Performance Metrics */}
                                <div className={styles.formSection}>
                                    <h4><FaChartLine /> Performance Metrics</h4>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Hours Worked</label>
                                            <input type="number" value={formData.hoursWorked} onChange={(e) => setFormData({...formData, hoursWorked: e.target.value})} min="0" max="24" step="0.5" />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Productivity Score (0-100)</label>
                                            <input type="number" value={formData.productivityScore} onChange={(e) => setFormData({...formData, productivityScore: e.target.value})} min="0" max="100" />
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className={styles.formSection}>
                                    <h4><FaComment /> Additional Information</h4>
                                    <div className={styles.formGroup}>
                                        <label>Challenges Faced</label>
                                        <textarea rows="2" value={formData.challenges} onChange={(e) => setFormData({...formData, challenges: e.target.value})} placeholder="Any obstacles or challenges faced today..." />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Plan for Tomorrow</label>
                                        <textarea rows="2" value={formData.tomorrowPlan} onChange={(e) => setFormData({...formData, tomorrowPlan: e.target.value})} placeholder="What are the plans for tomorrow?" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Need Support / Help</label>
                                        <textarea rows="2" value={formData.needSupport} onChange={(e) => setFormData({...formData, needSupport: e.target.value})} placeholder="Any support required from management?" />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className={styles.saveBtn} disabled={loading}>
                                    {loading ? <FaSpinner className={styles.spinner} /> : <FaPaperPlane />}
                                    Submit Report
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================== VIEW REPORT MODAL ==================== */}
            {showViewModal && selectedReport && (
                <div className={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
                    <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3><FaEye /> Daily Report Details</h3>
                            <button onClick={() => setShowViewModal(false)}><FaTimes /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.viewSection}>
                                <h4><FaUser /> Employee Information</h4>
                                <div className={styles.viewRow}><span>Employee:</span><strong>{selectedReport.employeeName}</strong> ({selectedReport.employeeRole})</div>
                                <div className={styles.viewRow}><span>Email:</span>{selectedReport.employeeEmail}</div>
                                <div className={styles.viewRow}><span>Report Date:</span>{new Date(selectedReport.reportDate).toLocaleDateString()}</div>
                            </div>

                            <div className={styles.viewSection}>
                                <h4><FaFileAlt /> Report Details</h4>
                                <div className={styles.viewRow}><span>Title:</span><strong>{selectedReport.reportTitle}</strong></div>
                                <div className={styles.viewRow}><span>Content:</span>{selectedReport.reportContent}</div>
                            </div>

                            {selectedReport.tasksCompleted?.length > 0 && selectedReport.tasksCompleted[0]?.taskName && (
                                <div className={styles.viewSection}>
                                    <h4><FaTasks /> Tasks Completed</h4>
                                    <table className={styles.innerTable}>
                                        <thead><tr><th>Task</th><th>Status</th><th>Time Spent</th></tr></thead>
                                        <tbody>
                                            {selectedReport.tasksCompleted.map((task, idx) => (
                                                <tr key={idx}>
                                                    <td>{task.taskName}</td>
                                                    <td>{task.taskStatus}</td>
                                                    <td>{task.timeSpent || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className={styles.viewSection}>
                                <h4><FaChartLine /> Performance</h4>
                                <div className={styles.viewRow}><span>Hours Worked:</span>{selectedReport.hoursWorked} hours</div>
                                <div className={styles.viewRow}><span>Productivity Score:</span>{selectedReport.productivityScore}%</div>
                            </div>

                            {selectedReport.challenges && (
                                <div className={styles.viewSection}>
                                    <h4>Challenges Faced</h4>
                                    <p>{selectedReport.challenges}</p>
                                </div>
                            )}
                            {selectedReport.tomorrowPlan && (
                                <div className={styles.viewSection}>
                                    <h4>Plan for Tomorrow</h4>
                                    <p>{selectedReport.tomorrowPlan}</p>
                                </div>
                            )}
                            {selectedReport.needSupport && (
                                <div className={styles.viewSection}>
                                    <h4>Need Support</h4>
                                    <p>{selectedReport.needSupport}</p>
                                </div>
                            )}

                            <div className={styles.viewSection}>
                                <h4>Status Information</h4>
                                <div className={styles.viewRow}><span>Status:</span><span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedReport.status)}`}>{selectedReport.status}</span></div>
                                <div className={styles.viewRow}><span>Submitted By:</span>{selectedReport.createdByName}</div>
                                <div className={styles.viewRow}><span>Submitted On:</span>{new Date(selectedReport.createdAt).toLocaleString()}</div>
                                {selectedReport.viewedAt && (
                                    <div className={styles.viewRow}><span>Viewed On:</span>{new Date(selectedReport.viewedAt).toLocaleString()}</div>
                                )}
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowViewModal(false)}>Close</button>
                            {selectedReport.status === 'Submitted' && (
                                <button className={styles.sendBtn} onClick={() => handleSendToManager(selectedReport)}>
                                    <FaPaperPlane /> Send to Manager
                                </button>
                            )}
                            <button className={styles.deleteBtn} onClick={() => handleDelete(selectedReport)}>
                                <FaTrash /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRDailyReport;
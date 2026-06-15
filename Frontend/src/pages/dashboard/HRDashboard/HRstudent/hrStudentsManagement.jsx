import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    FaUsers, FaPlus, FaSearch, FaEdit, FaTrash, FaEye,
    FaTimes, FaCheck, FaSpinner, FaGraduationCap, FaBriefcase,
    FaEnvelope, FaPhone, FaUserGraduate, FaTrophy, FaChartLine,
    FaMapMarkerAlt, FaCalendarAlt, FaCode, FaUniversity
} from 'react-icons/fa';
import { hrStudentService } from '../../../../services/hrStudentservice';
import { companyService } from '../../../../services/companyService';
import styles from './hrStudentsManagement.module.css';

const HRStudentsManagement = () => {
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [stats, setStats] = useState({
        total: 0, placed: 0, notPlaced: 0, inProcess: 0, avgPackage: 0
    });
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPlaceModal, setShowPlaceModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [courseFilter, setCourseFilter] = useState('all');
    const [branchFilter, setBranchFilter] = useState('all');
    const [pagination, setPagination] = useState({
        page: 1, limit: 10, total: 0, pages: 0
    });

    const [formData, setFormData] = useState({
        studentName: '',
        studentEmail: '',
        studentPhone: '',
        studentRollNo: '',
        course: 'B.Tech',
        branch: 'CSE',
        semester: '6',
        percentage: '',
        passingYear: new Date().getFullYear().toString(),
        technicalSkills: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        parentName: '',
        parentPhone: '',
        placementStatus: 'Not Placed'
    });

    const [placeData, setPlaceData] = useState({
        companyId: '',
        placedPackage: '',
        placedDate: new Date().toISOString().split('T')[0]
    });

    const courses = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA', 'BBA', 'Other'];
    const branches = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'Chemical', 'Other'];

    useEffect(() => {
        fetchStudents();
        fetchStats();
        fetchCompanies();
    }, [pagination.page, statusFilter, courseFilter, branchFilter, searchTerm]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await hrStudentService.getStudents({
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm,
                placementStatus: statusFilter,
                course: courseFilter,
                branch: branchFilter
            });

            if (response.data.success) {
                setStudents(response.data.data);
                if (response.data.stats) {
                    setStats(response.data.stats);
                }
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination.total,
                    pages: response.data.pagination.pages
                }));
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await hrStudentService.getPlacementStats();
            if (response.data.success) {
                setStats(prev => ({ ...prev, ...response.data.data }));
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await companyService.getCompanies({ limit: 100 });
            if (response.data.success) {
                setCompanies(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    const resetForm = () => {
        setEditingStudent(null);
        setFormData({
            studentName: '',
            studentEmail: '',
            studentPhone: '',
            studentRollNo: '',
            course: 'B.Tech',
            branch: 'CSE',
            semester: '6',
            percentage: '',
            passingYear: new Date().getFullYear().toString(),
            technicalSkills: '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            parentName: '',
            parentPhone: '',
            placementStatus: 'Not Placed'
        });
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setFormData({
            studentName: student.studentName || '',
            studentEmail: student.studentEmail || '',
            studentPhone: student.studentPhone || '',
            studentRollNo: student.studentRollNo || '',
            course: student.course || 'B.Tech',
            branch: student.branch || 'CSE',
            semester: student.semester?.toString() || '6',
            percentage: student.percentage?.toString() || '',
            passingYear: student.passingYear?.toString() || new Date().getFullYear().toString(),
            technicalSkills: student.technicalSkills?.join(', ') || '',
            address: student.address || '',
            city: student.city || '',
            state: student.state || '',
            pincode: student.pincode || '',
            parentName: student.parentName || '',
            parentPhone: student.parentPhone || '',
            placementStatus: student.placementStatus || 'Not Placed'
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const skillsArray = formData.technicalSkills ? formData.technicalSkills.split(',').map(s => s.trim()) : [];
            const studentData = {
                ...formData,
                technicalSkills: skillsArray,
                percentage: parseFloat(formData.percentage),
                semester: parseInt(formData.semester),
                passingYear: parseInt(formData.passingYear)
            };

            if (editingStudent) {
                await hrStudentService.updateStudent(editingStudent._id, studentData);
                toast.success('Student updated successfully');
            } else {
                await hrStudentService.createStudent(studentData);
                toast.success('Student added successfully');
            }
            setShowModal(false);
            resetForm();
            fetchStudents();
            fetchStats();
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPlaced = async () => {
        setLoading(true);
        try {
            await hrStudentService.markAsPlaced(selectedStudent._id, placeData);
            toast.success(`${selectedStudent.studentName} marked as placed!`);
            setShowPlaceModal(false);
            fetchStudents();
            fetchStats();
        } catch (error) {
            toast.error('Failed to mark as placed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await hrStudentService.deleteStudent(selectedStudent._id);
            toast.success('Student deleted successfully');
            setShowDeleteModal(false);
            fetchStudents();
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete student');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'Placed': 'bg-green-100 text-green-800',
            'Not Placed': 'bg-red-100 text-red-800',
            'In Process': 'bg-yellow-100 text-yellow-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const StatCard = ({ title, value, icon, color }) => (
        <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: `${color}15`, color: color }}>{icon}</div>
            <div className={styles.statInfo}>
                <span className={styles.statValue}>{value}</span>
                <span className={styles.statLabel}>{title}</span>
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <StatCard title="Total Students" value={stats.total} icon={<FaUsers />} color="#2563eb" />
                <StatCard title="Placed Students" value={stats.placed} icon={<FaTrophy />} color="#22c55e" />
                <StatCard title="In Process" value={stats.inProcess} icon={<FaChartLine />} color="#f59e0b" />
                <StatCard title="Avg Package" value={`₹${stats.avgPackage || 0} LPA`} icon={<FaBriefcase />} color="#8b5cf6" />
            </div>

            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h2><FaUserGraduate /> Students Management</h2>
                    <p>Manage all students, track placements, and schedule interviews</p>
                </div>
                <button className={styles.addBtn} onClick={() => { resetForm(); setShowModal(true); }}>
                    <FaPlus /> Add Student
                </button>
            </div>

            {/* Search and Filters */}
            <div className={styles.filterBar}>
                <div className={styles.searchBox}>
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search by name, email or roll number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="Placed">Placed</option>
                    <option value="Not Placed">Not Placed</option>
                    <option value="In Process">In Process</option>
                </select>
                <select className={styles.filterSelect} value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                    <option value="all">All Courses</option>
                    {courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className={styles.filterSelect} value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
                    <option value="all">All Branches</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <button className={styles.clearFiltersBtn} onClick={() => { setSearchTerm(''); setStatusFilter('all'); setCourseFilter('all'); setBranchFilter('all'); }}>
                    <FaTimes /> Clear
                </button>
            </div>

            {/* Students Table */}
            <div className={styles.tableWrapper}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <FaSpinner className={styles.spinner} /> Loading students...
                    </div>
                ) : students.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FaUserGraduate className={styles.emptyIcon} />
                        <h3>No students found</h3>
                        <p>Click "Add Student" to add your first student</p>
                        <button className={styles.addBtn} onClick={() => { resetForm(); setShowModal(true); }}>
                            <FaPlus /> Add Student
                        </button>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Student Name</th>
                                <th>Course/Branch</th>
                                <th>Contact</th>
                                <th>Percentage</th>
                                <th>Status</th>
                                <th>Placed In</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student._id}>
                                    <td><strong>{student.studentRollNo}</strong></td>
                                    <td>
                                        <div className={styles.studentName}>
                                            <strong>{student.studentName}</strong>
                                            <small>{student.city || 'N/A'}</small>
                                        </div>
                                    </td>
                                    <td>
                                        {student.course} - {student.branch}<br />
                                        <small>Sem {student.semester}</small>
                                    </td>
                                    <td>
                                        {student.studentEmail}<br />
                                        <small>{student.studentPhone}</small>
                                    </td>
                                    <td className={styles.textCenter}>{student.percentage}%</td>
                                    <td>
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(student.placementStatus)}`}>
                                            {student.placementStatus}
                                        </span>
                                    </td>
                                    <td>
                                        {student.placedCompanyName || '-'}<br />
                                        {student.placedPackage > 0 && <small>₹{student.placedPackage} LPA</small>}
                                    </td>
                                    <td className={styles.actionBtns}>
                                        <button onClick={() => { setSelectedStudent(student); setShowViewModal(true); }} title="View"><FaEye /></button>
                                        <button onClick={() => handleEdit(student)} title="Edit"><FaEdit /></button>
                                        {student.placementStatus !== 'Placed' && (
                                            <button onClick={() => { setSelectedStudent(student); setShowPlaceModal(true); }} title="Mark Placed"><FaTrophy /></button>
                                        )}
                                        <button onClick={() => { setSelectedStudent(student); setShowDeleteModal(true); }} title="Delete"><FaTrash /></button>
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

            {/* ==================== ADD/EDIT STUDENT MODAL ==================== */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>
                                <FaUserGraduate />
                                {editingStudent ? 'Edit Student' : 'Add New Student'}
                            </h3>
                            <button onClick={() => setShowModal(false)}><FaTimes /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                {/* Personal Information Section */}
                                <div className={styles.formSection}>
                                    <h4><FaUserGraduate /> Personal Information</h4>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Full Name *</label>
                                            <input
                                                type="text"
                                                value={formData.studentName}
                                                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                                                placeholder="Enter student name"
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Roll Number *</label>
                                            <input
                                                type="text"
                                                value={formData.studentRollNo}
                                                onChange={(e) => setFormData({ ...formData, studentRollNo: e.target.value })}
                                                placeholder="Enter roll number"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label><FaEnvelope /> Email Address *</label>
                                            <input
                                                type="email"
                                                value={formData.studentEmail}
                                                onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                                                placeholder="student@example.com"
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label><FaPhone /> Phone Number *</label>
                                            <input
                                                type="tel"
                                                value={formData.studentPhone}
                                                onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })}
                                                placeholder="9876543210"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Academic Information Section */}
                                <div className={styles.formSection}>
                                    <h4><FaGraduationCap /> Academic Information</h4>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Course *</label>
                                            <select value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })}>
                                                {courses.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Branch *</label>
                                            <select value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })}>
                                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Current Semester</label>
                                            <input
                                                type="number"
                                                value={formData.semester}
                                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                                min="1"
                                                max="8"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Percentage / CGPA *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.percentage}
                                                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                                                placeholder="e.g., 75.5"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Passing Year</label>
                                            <input
                                                type="number"
                                                value={formData.passingYear}
                                                onChange={(e) => setFormData({ ...formData, passingYear: e.target.value })}
                                                min="2020"
                                                max="2030"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label><FaCode /> Technical Skills</label>
                                            <input
                                                type="text"
                                                value={formData.technicalSkills}
                                                onChange={(e) => setFormData({ ...formData, technicalSkills: e.target.value })}
                                                placeholder="Java, Python, React, SQL"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information Section */}
                                <div className={styles.formSection}>
                                    <h4><FaMapMarkerAlt /> Address Information</h4>
                                    <div className={styles.formGroup}>
                                        <label>Address</label>
                                        <textarea
                                            rows="2"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="House No., Street, Area"
                                        />
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>City</label>
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                placeholder="City"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>State</label>
                                            <input
                                                type="text"
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                placeholder="State"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Pincode</label>
                                            <input
                                                type="text"
                                                value={formData.pincode}
                                                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                                placeholder="Pincode"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Parent/Guardian Information Section */}
                                <div className={styles.formSection}>
                                    <h4><FaUniversity /> Parent / Guardian Information</h4>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Parent Name</label>
                                            <input
                                                type="text"
                                                value={formData.parentName}
                                                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                                                placeholder="Father/Mother name"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Parent Phone</label>
                                            <input
                                                type="tel"
                                                value={formData.parentPhone}
                                                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                                                placeholder="Parent contact number"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Placement Status Section */}
                                <div className={styles.formSection}>
                                    <h4><FaBriefcase /> Placement Status</h4>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Current Status</label>
                                            <select value={formData.placementStatus} onChange={(e) => setFormData({ ...formData, placementStatus: e.target.value })}>
                                                <option value="Not Placed">Not Placed</option>
                                                <option value="In Process">In Process</option>
                                                <option value="Placed">Placed</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.saveBtn} disabled={loading}>
                                    {loading ? <FaSpinner className={styles.spinner} /> : <FaCheck />}
                                    {editingStudent ? 'Update Student' : 'Save Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Mark as Placed Modal */}
            {showPlaceModal && selectedStudent && (
                <div className={styles.modalOverlay} onClick={() => setShowPlaceModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3><FaTrophy /> Mark Student as Placed</h3>
                            <button onClick={() => setShowPlaceModal(false)}><FaTimes /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Marking <strong>{selectedStudent.studentName}</strong> as placed in:</p>
                            <div className={styles.formGroup}>
                                <label>Select Company *</label>
                                <select value={placeData.companyId} onChange={(e) => setPlaceData({ ...placeData, companyId: e.target.value })} required>
                                    <option value="">Select Company</option>
                                    {companies.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Package (LPA) *</label>
                                <input type="number" step="0.5" value={placeData.placedPackage} onChange={(e) => setPlaceData({ ...placeData, placedPackage: e.target.value })} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Placement Date</label>
                                <input type="date" value={placeData.placedDate} onChange={(e) => setPlaceData({ ...placeData, placedDate: e.target.value })} />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowPlaceModal(false)}>Cancel</button>
                            <button className={styles.saveBtn} onClick={handleMarkPlaced} disabled={loading}>
                                {loading ? <FaSpinner className={styles.spinner} /> : <FaTrophy />} Mark as Placed
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Student Modal */}
            {showViewModal && selectedStudent && (
                <div className={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
                    <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3><FaEye /> Student Details</h3>
                            <button onClick={() => setShowViewModal(false)}><FaTimes /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.viewSection}>
                                <h4>Personal Information</h4>
                                <div className={styles.viewRow}><span>Name:</span><strong>{selectedStudent.studentName}</strong></div>
                                <div className={styles.viewRow}><span>Roll Number:</span>{selectedStudent.studentRollNo}</div>
                                <div className={styles.viewRow}><span>Email:</span>{selectedStudent.studentEmail}</div>
                                <div className={styles.viewRow}><span>Phone:</span>{selectedStudent.studentPhone}</div>
                            </div>
                            <div className={styles.viewSection}>
                                <h4>Academic Information</h4>
                                <div className={styles.viewRow}><span>Course:</span>{selectedStudent.course}</div>
                                <div className={styles.viewRow}><span>Branch:</span>{selectedStudent.branch}</div>
                                <div className={styles.viewRow}><span>Semester:</span>{selectedStudent.semester}</div>
                                <div className={styles.viewRow}><span>Percentage:</span>{selectedStudent.percentage}%</div>
                                <div className={styles.viewRow}><span>Passing Year:</span>{selectedStudent.passingYear}</div>
                                <div className={styles.viewRow}><span>Skills:</span>{selectedStudent.technicalSkills?.join(', ') || 'N/A'}</div>
                            </div>
                            <div className={styles.viewSection}>
                                <h4>Placement Status</h4>
                                <div className={styles.viewRow}><span>Status:</span><span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedStudent.placementStatus)}`}>{selectedStudent.placementStatus}</span></div>
                                {selectedStudent.placementStatus === 'Placed' && (
                                    <>
                                        <div className={styles.viewRow}><span>Company:</span>{selectedStudent.placedCompanyName}</div>
                                        <div className={styles.viewRow}><span>Package:</span>₹{selectedStudent.placedPackage} LPA</div>
                                        <div className={styles.viewRow}><span>Placed Date:</span>{new Date(selectedStudent.placedDate).toLocaleDateString()}</div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowViewModal(false)}>Close</button>
                            <button className={styles.editBtn} onClick={() => { setShowViewModal(false); handleEdit(selectedStudent); }}>Edit Student</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedStudent && (
                <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3><FaTrash /> Delete Student</h3>
                            <button onClick={() => setShowDeleteModal(false)}><FaTimes /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Are you sure you want to delete <strong>{selectedStudent.studentName}</strong>?</p>
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

export default HRStudentsManagement;
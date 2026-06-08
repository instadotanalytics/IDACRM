import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    FaUser, FaEnvelope, FaPhone, FaBook, FaCalendarAlt,
    FaMapMarkerAlt, FaUserFriends, FaGraduationCap, FaUpload,
    FaSpinner, FaCheck, FaEye, FaTrash, FaEdit, FaTimes, FaUsers,
    FaIdCard, FaCamera, FaSearch, FaFilter, FaUserTie
} from 'react-icons/fa';
import api from '../../../../services/api';
import styles from './Admission.module.css';

const Admission = () => {
    const [loading, setLoading] = useState(false);
    const [admissions, setAdmissions] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [activeTab, setActiveTab] = useState('form');
    const [batches, setBatches] = useState([]);
    const [batchesLoading, setBatchesLoading] = useState(false);

    // ✅ Get user role for tracking display
    const [userRole, setUserRole] = useState('counselor');
    const [currentUser, setCurrentUser] = useState(null);

    // Search and Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterBatch, setFilterBatch] = useState('all');

    // Modal States
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phone: '',
        course: '',
        batchId: '',
        address: '',
        parentName: '',
        parentPhone: '',
        qualifications: '',
        status: 'active'
    });
    const [editImage, setEditImage] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        course: '',
        batchId: '',
        address: '',
        parentName: '',
        parentPhone: '',
        qualifications: '',
        admissionDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        // ✅ Get current user from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setCurrentUser(user);
            setUserRole(user.role);
        }
        fetchAdmissions();
        fetchBatches();
    }, []);

    const fetchAdmissions = async () => {
        try {
            const currentUserData = JSON.parse(localStorage.getItem('user'));
            let url = '/admissions';
            
            // ✅ Counselor sirf apne admissions dekhega
            if (currentUserData?.role === 'counselor') {
                url = `/admissions/counselor/${currentUserData._id}`;
            }
            
            const response = await api.get(url);
            if (response.data.success) setAdmissions(response.data.data);
        } catch (error) {
            console.error('Error fetching admissions:', error);
            toast.error('Failed to fetch admissions');
        }
    };

    const fetchBatches = async () => {
        setBatchesLoading(true);
        try {
            const response = await api.get('/batches');
            if (response.data.success) setBatches(response.data.data);
        } catch (error) {
            console.error('Error fetching batches:', error);
            toast.error('Failed to fetch batches');
        } finally {
            setBatchesLoading(false);
        }
    };

    // Filtered Admissions
    const filteredAdmissions = admissions.filter(admission => {
        const matchesSearch =
            admission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admission.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admission.enrollmentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admission.phone?.includes(searchTerm);

        const matchesStatus = filterStatus === 'all' || admission.status === filterStatus;

        const matchesBatch = filterBatch === 'all' ||
            admission.batchId?._id === filterBatch ||
            admission.batchId === filterBatch;

        return matchesSearch && matchesStatus && matchesBatch;
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { toast.error('File size should be less than 5MB'); return; }
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) { toast.error('Only JPG, PNG, WEBP images are allowed'); return; }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { toast.error('File size should be less than 5MB'); return; }
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) { toast.error('Only JPG, PNG, WEBP images are allowed'); return; }
            setEditImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setEditImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleEditChange = (e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) { toast.error('Student name is required'); return; }
        if (!formData.email) { toast.error('Email is required'); return; }
        if (!formData.phone) { toast.error('Phone number is required'); return; }
        if (!formData.course) { toast.error('Course is required'); return; }

        setLoading(true);
        try {
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, val]) => formDataToSend.append(key, val || ''));
            if (selectedImage) formDataToSend.append('photo', selectedImage);

            const response = await api.post('/admissions', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                toast.success(response.data.message);
                setFormData({
                    name: '', email: '', phone: '', course: '', batchId: '',
                    address: '', parentName: '', parentPhone: '', qualifications: '',
                    admissionDate: new Date().toISOString().split('T')[0]
                });
                setSelectedImage(null);
                setImagePreview(null);
                fetchAdmissions();
                if (response.data.data?.credentials) {
                    toast.success(`Credentials: ${response.data.data.credentials.email} / ${response.data.data.credentials.password}`);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Admission failed');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (student) => {
        setSelectedStudent(student);
        setShowViewModal(true);
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
        setEditFormData({
            name: student.name || '',
            email: student.email || '',
            phone: student.phone || '',
            course: student.course || '',
            batchId: student.batchId?._id || student.batchId || '',
            address: student.address || '',
            parentName: student.parentName || '',
            parentPhone: student.parentPhone || '',
            qualifications: student.qualifications || '',
            status: student.status || 'active'
        });
        setEditImagePreview(student.photo || null);
        setEditImage(null);
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formDataToSend = new FormData();
            Object.entries(editFormData).forEach(([key, val]) => formDataToSend.append(key, val || ''));
            if (editImage) formDataToSend.append('photo', editImage);

            const response = await api.put(`/admissions/${selectedStudent._id}`, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                toast.success('Student updated successfully');
                setShowEditModal(false);
                setSelectedStudent(null);
                fetchAdmissions();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Delete admission for ${name}? This will also delete their user account.`)) {
            setLoading(true);
            try {
                const response = await api.delete(`/admissions/${id}`);
                if (response.data.success) {
                    toast.success('Deleted successfully');
                    fetchAdmissions();
                }
            } catch (error) {
                toast.error('Delete failed');
            } finally {
                setLoading(false);
            }
        }
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
        setFilterBatch('all');
    };

    const getStatusBadge = (status) => {
        const map = {
            active: styles.badgeActive,
            inactive: styles.badgeInactive,
            completed: styles.badgeCompleted
        };
        return <span className={`${styles.badge} ${map[status] || ''}`}>{status}</span>;
    };

    // View Modal Component
    const ViewModal = ({ student, onClose }) => (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3><FaEye /> Student Details</h3>
                    <button className={styles.modalClose} onClick={onClose}><FaTimes /></button>
                </div>
                <div className={styles.modalBody}>
                    {student?.photo && (
                        <div className={styles.viewPhoto}>
                            <img src={student.photo} alt={student.name} />
                        </div>
                    )}
                    <div className={styles.viewRow}>
                        <div className={styles.viewLabel}>Full Name</div>
                        <div className={styles.viewValue}>{student?.name}</div>
                    </div>
                    <div className={styles.viewRow}>
                        <div className={styles.viewLabel}>Email</div>
                        <div className={styles.viewValue}>{student?.email}</div>
                    </div>
                    <div className={styles.viewRow}>
                        <div className={styles.viewLabel}>Phone</div>
                        <div className={styles.viewValue}>{student?.phone}</div>
                    </div>
                    <div className={styles.viewRow}>
                        <div className={styles.viewLabel}>Course</div>
                        <div className={styles.viewValue}>{student?.course}</div>
                    </div>
                    <div className={styles.viewRow}>
                        <div className={styles.viewLabel}>Batch</div>
                        <div className={styles.viewValue}>{student?.batchId?.name || 'Not Assigned'}</div>
                    </div>
                    <div className={styles.viewRow}>
                        <div className={styles.viewLabel}>Enrollment ID</div>
                        <div className={styles.viewValue}>{student?.enrollmentId}</div>
                    </div>
                    <div className={styles.viewRow}>
                        <div className={styles.viewLabel}>Status</div>
                        <div className={styles.viewValue}>{getStatusBadge(student?.status)}</div>
                    </div>
                    {/* ✅ Show counselor info (Admin only) */}
                    {(userRole === 'admin_manager' || userRole === 'super_admin') && (
                        <div className={styles.viewRow}>
                            <div className={styles.viewLabel}>Admitted By</div>
                            <div className={styles.viewValue}>
                                <FaUserTie /> {student?.counselorName || student?.counselorId?.name || 'System'}
                            </div>
                        </div>
                    )}
                    {student?.address && (
                        <div className={styles.viewRow}>
                            <div className={styles.viewLabel}>Address</div>
                            <div className={styles.viewValue}>{student?.address}</div>
                        </div>
                    )}
                </div>
                <div className={styles.modalFooter}>
                    <button className={styles.btnCancel} onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );

    // Edit Modal Component
    const EditModal = () => (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3><FaEdit /> Edit Student</h3>
                    <button className={styles.modalClose} onClick={() => setShowEditModal(false)}><FaTimes /></button>
                </div>
                <form onSubmit={handleUpdate}>
                    <div className={styles.modalBody}>
                        <div className={styles.field}>
                            <label>Full Name *</label>
                            <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} required />
                        </div>
                        <div className={styles.field}>
                            <label>Email *</label>
                            <input type="email" name="email" value={editFormData.email} onChange={handleEditChange} required />
                        </div>
                        <div className={styles.field}>
                            <label>Phone *</label>
                            <input type="tel" name="phone" value={editFormData.phone} onChange={handleEditChange} required />
                        </div>
                        <div className={styles.field}>
                            <label>Course *</label>
                            <input type="text" name="course" value={editFormData.course} onChange={handleEditChange} required />
                        </div>
                        <div className={styles.field}>
                            <label>Batch</label>
                            <select name="batchId" value={editFormData.batchId} onChange={handleEditChange}>
                                <option value="">-- Select Batch --</option>
                                {batches.map(batch => (
                                    <option key={batch._id} value={batch._id}>{batch.name} ({batch.code})</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label>Status</label>
                            <select name="status" value={editFormData.status} onChange={handleEditChange} className={styles.statusSelect}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label>Address</label>
                            <textarea name="address" rows="2" value={editFormData.address} onChange={handleEditChange} />
                        </div>
                        <div className={styles.field}>
                            <label>Parent Name</label>
                            <input type="text" name="parentName" value={editFormData.parentName} onChange={handleEditChange} />
                        </div>
                        <div className={styles.field}>
                            <label>Parent Phone</label>
                            <input type="tel" name="parentPhone" value={editFormData.parentPhone} onChange={handleEditChange} />
                        </div>
                        <div className={styles.field}>
                            <label>Qualifications</label>
                            <input type="text" name="qualifications" value={editFormData.qualifications} onChange={handleEditChange} />
                        </div>
                        <div className={styles.field}>
                            <label>Student Photo</label>
                            {editImagePreview ? (
                                <div className={styles.previewBox}>
                                    <img src={editImagePreview} alt="Preview" className={styles.previewImg} />
                                    <button type="button" className={styles.removePhoto} onClick={() => { setEditImage(null); setEditImagePreview(null); }}><FaTimes /> Remove</button>
                                </div>
                            ) : (
                                <label htmlFor="editPhoto" className={styles.uploadBox}>
                                    <FaCamera className={styles.uploadIcon} />
                                    <span>Upload new photo</span>
                                    <small>JPG, PNG, WEBP • Max 5MB</small>
                                    <input type="file" id="editPhoto" accept="image/*" onChange={handleEditImageChange} style={{ display: 'none' }} />
                                </label>
                            )}
                        </div>
                    </div>
                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.btnCancel} onClick={() => setShowEditModal(false)}>Cancel</button>
                        <button type="submit" className={styles.btnSave} disabled={loading}>
                            {loading ? <FaSpinner className={styles.spin} /> : <FaCheck />}
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIcon}><FaGraduationCap /></div>
                    <div>
                        <h1 className={styles.headerTitle}>Student Admission</h1>
                        <p className={styles.headerSub}>Register new students & auto-generate login credentials</p>
                    </div>
                </div>
                <div className={styles.headerStats}>
                    <div className={styles.statChip}>
                        <FaUsers />
                        <span>{admissions.length} Students</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'form' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('form')}
                >
                    <FaUser /> New Admission
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'list' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    <FaUsers /> All Students
                    <span className={styles.tabBadge}>{admissions.length}</span>
                </button>
            </div>

            {/* Form Tab */}
            {activeTab === 'form' && (
                <div className={styles.formWrapper}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGrid}>
                            {/* Personal Info */}
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <FaUser className={styles.cardIcon} />
                                    <h3>Personal Information</h3>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.field}>
                                        <label>Full Name <span className={styles.req}>*</span></label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" required />
                                    </div>
                                    <div className={styles.field}>
                                        <label>Email Address <span className={styles.req}>*</span></label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="student@email.com" required />
                                    </div>
                                    <div className={styles.field}>
                                        <label>Phone Number <span className={styles.req}>*</span></label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" required />
                                    </div>
                                    <div className={styles.field}>
                                        <label>Address</label>
                                        <textarea name="address" rows="3" value={formData.address} onChange={handleChange} placeholder="Full address..." />
                                    </div>
                                </div>
                            </div>

                            {/* Academic Info */}
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <FaBook className={styles.cardIcon} />
                                    <h3>Academic Information</h3>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.field}>
                                        <label>Course <span className={styles.req}>*</span></label>
                                        <input type="text" name="course" value={formData.course} onChange={handleChange} placeholder="e.g. Full Stack Development" required />
                                    </div>
                                    <div className={styles.field}>
                                        <label>Select Batch</label>
                                        <select name="batchId" value={formData.batchId} onChange={handleChange}>
                                            <option value="">-- Select Batch --</option>
                                            {batchesLoading ? (
                                                <option disabled>Loading batches...</option>
                                            ) : batches.length === 0 ? (
                                                <option disabled>No batches available</option>
                                            ) : (
                                                batches.map(batch => (
                                                    <option key={batch._id} value={batch._id}>
                                                        {batch.name} ({batch.code})
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>
                                    <div className={styles.field}>
                                        <label>Admission Date</label>
                                        <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} />
                                    </div>
                                    <div className={styles.field}>
                                        <label>Qualifications</label>
                                        <input type="text" name="qualifications" value={formData.qualifications} onChange={handleChange} placeholder="B.Sc, MCA, 12th Pass..." />
                                    </div>
                                </div>
                            </div>

                            {/* Parent & Photo */}
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <FaUserFriends className={styles.cardIcon} />
                                    <h3>Parent & Photo</h3>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.field}>
                                        <label>Parent / Guardian Name</label>
                                        <input type="text" name="parentName" value={formData.parentName} onChange={handleChange} placeholder="Parent full name" />
                                    </div>
                                    <div className={styles.field}>
                                        <label>Parent Phone</label>
                                        <input type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
                                    </div>
                                    <div className={styles.field}>
                                        <label>Student Photo</label>
                                        {imagePreview ? (
                                            <div className={styles.previewBox}>
                                                <img src={imagePreview} alt="Preview" className={styles.previewImg} />
                                                <button type="button" className={styles.removePhoto} onClick={() => { setSelectedImage(null); setImagePreview(null); }}><FaTimes /> Remove</button>
                                            </div>
                                        ) : (
                                            <label htmlFor="photo" className={styles.uploadBox}>
                                                <FaCamera className={styles.uploadIcon} />
                                                <span>Click to upload photo</span>
                                                <small>JPG, PNG, WEBP • Max 5MB</small>
                                                <input type="file" id="photo" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.submitRow}>
                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? <><FaSpinner className={styles.spin} /> Processing...</> : <><FaCheck /> Complete Admission</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Tab with Search and Filter */}
            {activeTab === 'list' && (
                <div className={styles.listWrapper}>

                    {/* Search and Filter Bar */}
                    <div className={styles.filterBar}>
                        <div className={styles.searchBox}>
                            <FaSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search by name, email, enrollment ID or phone..."
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
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="completed">Completed</option>
                            </select>

                            <select
                                className={styles.filterSelect}
                                value={filterBatch}
                                onChange={(e) => setFilterBatch(e.target.value)}
                            >
                                <option value="all">All Batches</option>
                                {batches.map(batch => (
                                    <option key={batch._id} value={batch._id}>
                                        {batch.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterStats}>
                            <span className={styles.resultCount}>
                                {filteredAdmissions.length} student{filteredAdmissions.length !== 1 ? 's' : ''} found
                            </span>
                            {(filterStatus !== 'all' || filterBatch !== 'all' || searchTerm) && (
                                <button
                                    className={styles.clearFilters}
                                    onClick={clearAllFilters}
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Admissions Table */}
                    {filteredAdmissions.length === 0 ? (
                        <div className={styles.emptyState}>
                            <FaGraduationCap className={styles.emptyIcon} />
                            <h3>No students found</h3>
                            <p>Try adjusting your search or filters</p>
                            {(searchTerm || filterStatus !== 'all' || filterBatch !== 'all') && (
                                <button
                                    className={styles.resetFiltersBtn}
                                    onClick={clearAllFilters}
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Contact</th>
                                        <th>Course</th>
                                        <th>Batch</th>
                                        <th>Enrollment ID</th>
                                        <th>Status</th>
                                        {(userRole === 'admin_manager' || userRole === 'super_admin') && <th>Admitted By</th>}
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAdmissions.map((admission) => (
                                        <tr key={admission._id}>
                                            <td>
                                                <div className={styles.studentCell}>
                                                    {admission.photo
                                                        ? <img src={admission.photo} alt={admission.name} className={styles.avatar} />
                                                        : <div className={styles.avatarFallback}>{admission.name?.charAt(0)?.toUpperCase()}</div>
                                                    }
                                                    <div>
                                                        <div className={styles.studentName}>{admission.name}</div>
                                                        <div className={styles.studentEmail}>{admission.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={styles.phoneCell}>{admission.phone}</td>
                                            <td>{admission.course}</td>
                                            <td>{admission.batchId?.name || <span className={styles.na}>—</span>}</td>
                                            <td>
                                                <span className={styles.enrollId}>
                                                    <FaIdCard /> {admission.enrollmentId}
                                                </span>
                                            </td>
                                            <td>{getStatusBadge(admission.status)}</td>
                                            {(userRole === 'admin_manager' || userRole === 'super_admin') && (
                                                <td className={styles.counselorCell}>
                                                    <FaUserTie /> {admission.counselorName || admission.counselorId?.name || 'System'}
                                                </td>
                                            )}
                                            <td>
                                                <div className={styles.actions}>
                                                    <button className={styles.btnView} onClick={() => handleView(admission)} title="View"><FaEye /></button>
                                                    <button className={styles.btnEdit} onClick={() => handleEdit(admission)} title="Edit"><FaEdit /></button>
                                                    <button className={styles.btnDelete} onClick={() => handleDelete(admission._id, admission.name)} title="Delete"><FaTrash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* View Modal */}
            {showViewModal && selectedStudent && (
                <ViewModal student={selectedStudent} onClose={() => setShowViewModal(false)} />
            )}

            {/* Edit Modal */}
            {showEditModal && selectedStudent && <EditModal />}
        </div>
    );
};

export default Admission;
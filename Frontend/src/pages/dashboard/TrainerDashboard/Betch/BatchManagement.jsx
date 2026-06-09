import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch, 
  FaSpinner, FaTimes, FaCheck, FaUserTie, 
  FaCalendarAlt, FaClock, FaUsers, FaBookOpen,
  FaChalkboardTeacher, FaBuilding, FaArrowLeft,
  FaInfoCircle
} from 'react-icons/fa';
import api from '../../../../services/api';
import styles from './BatchManagement.module.css';

const BatchManagement = ({ onBack }) => {
    const [loading, setLoading] = useState(false);
    const [batches, setBatches] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [editingBatch, setEditingBatch] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [userRole, setUserRole] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        course: '',
        trainerId: '',
        startDate: '',
        endDate: '',
        timings: '',
        days: [],
        capacity: 30,
        room: '',
        description: ''
    });

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        // Get current user
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setCurrentUser(user);
            setUserRole(user.role);
            console.log('Current User:', user.name);
            console.log('User Role:', user.role);
        }
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const response = await api.get('/batches');
            if (response.data.success) {
                setBatches(response.data.data);
                console.log('Batches fetched:', response.data.data.length);
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
            toast.error('Failed to fetch batches');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleDayToggle = (day) => {
        if (formData.days.includes(day)) {
            setFormData({
                ...formData,
                days: formData.days.filter(d => d !== day)
            });
        } else {
            setFormData({
                ...formData,
                days: [...formData.days, day]
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            if (!formData.name || !formData.course || !formData.startDate || !formData.endDate || !formData.timings) {
                toast.error('Please fill all required fields');
                setLoading(false);
                return;
            }
            
            const submitData = {
                name: formData.name,
                code: formData.code || undefined,
                course: formData.course,
                trainerId: formData.trainerId || null,
                startDate: formData.startDate,
                endDate: formData.endDate,
                timings: formData.timings,
                days: formData.days || [],
                capacity: Number(formData.capacity) || 30,
                room: formData.room || '',
                description: formData.description || ''
            };
            
            let response;
            if (editingBatch) {
                response = await api.put(`/batches/${editingBatch._id}`, submitData);
                toast.success('Batch updated successfully');
            } else {
                response = await api.post('/batches', submitData);
                toast.success('Batch created successfully');
            }
            
            if (response.data.success) {
                setShowModal(false);
                setEditingBatch(null);
                setFormData({
                    name: '',
                    code: '',
                    course: '',
                    trainerId: '',
                    startDate: '',
                    endDate: '',
                    timings: '',
                    days: [],
                    capacity: 30,
                    room: '',
                    description: ''
                });
                fetchBatches();
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Delete batch "${name}"? This action cannot be undone.`)) {
            setLoading(true);
            try {
                const response = await api.delete(`/batches/${id}`);
                if (response.data.success) {
                    toast.success('Batch deleted successfully');
                    fetchBatches();
                }
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Delete failed');
            } finally {
                setLoading(false);
            }
        }
    };

    const openEditModal = (batch) => {
        setEditingBatch(batch);
        setFormData({
            name: batch.name,
            code: batch.code || '',
            course: batch.course,
            trainerId: batch.trainerId?._id || batch.trainerId || '',
            startDate: batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : '',
            endDate: batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : '',
            timings: batch.timings || '',
            days: batch.days || [],
            capacity: batch.capacity || 30,
            room: batch.room || '',
            description: batch.description || ''
        });
        setShowModal(true);
    };

    const filteredBatches = batches.filter(batch =>
        batch.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.course?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status) => {
        switch(status) {
            case 'active': return <span className={`${styles.badge} ${styles.active}`}>✅ Active</span>;
            case 'upcoming': return <span className={`${styles.badge} ${styles.upcoming}`}>⏳ Upcoming</span>;
            case 'completed': return <span className={`${styles.badge} ${styles.completed}`}>🎓 Completed</span>;
            default: return <span className={styles.badge}>{status}</span>;
        }
    };

    const isAdmin = userRole === 'admin_manager' || userRole === 'super_admin';

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2><FaChalkboardTeacher /> Batch Management</h2>
                    <p>Create and manage training batches</p>
                </div>
                <div className={styles.headerButtons}>
                    {onBack && (
                        <button className={styles.backBtn} onClick={onBack}>
                            <FaArrowLeft /> Back to Dashboard
                        </button>
                    )}
                    <button className={styles.createBtn} onClick={() => { setEditingBatch(null); setShowModal(true); }}>
                        <FaPlus /> Create Batch
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className={styles.searchBar}>
                <FaSearch />
                <input 
                    type="text" 
                    placeholder="Search by name, code or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Batches Grid */}
            <div className={styles.batchesGrid}>
                {loading && batches.length === 0 ? (
                    <div className={styles.loadingContainer}>
                        <FaSpinner className={styles.spinner} /> Loading batches...
                    </div>
                ) : filteredBatches.length === 0 ? (
                    <div className={styles.emptyContainer}>
                        <FaChalkboardTeacher className={styles.emptyIcon} />
                        <p>No batches found</p>
                        <button onClick={() => { setEditingBatch(null); setShowModal(true); }}>
                            Create your first batch
                        </button>
                    </div>
                ) : (
                    filteredBatches.map(batch => (
                        <div key={batch._id} className={styles.batchCard}>
                            <div className={styles.batchHeader}>
                                <div>
                                    <h3>{batch.name}</h3>
                                    <span className={styles.batchCode}>{batch.code}</span>
                                </div>
                                {getStatusBadge(batch.status)}
                            </div>
                            <div className={styles.batchInfo}>
                                <p><FaBookOpen /> <strong>Course:</strong> {batch.course}</p>
                                <p><FaUserTie /> <strong>Trainer:</strong> {batch.trainerId?.name || 'Not Assigned'}</p>
                                <p><FaCalendarAlt /> <strong>Duration:</strong> {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}</p>
                                <p><FaClock /> <strong>Timings:</strong> {batch.timings}</p>
                                <p><FaUsers /> <strong>Capacity:</strong> {batch.currentStudents || batch.studentsCount || 0}/{batch.capacity}</p>
                                {batch.room && <p><FaBuilding /> <strong>Room:</strong> {batch.room}</p>}
                                <p className={styles.trackingInfo}>
                                    <FaInfoCircle /> <strong>Created By:</strong> {batch.createdBy?.name || batch.createdByName || 'System'}
                                </p>
                            </div>
                            <div className={styles.batchActions}>
                                <button onClick={() => { setSelectedBatch(batch); setShowViewModal(true); }} className={styles.viewBtn}>
                                    <FaEye /> View
                                </button>
                                <button onClick={() => openEditModal(batch)} className={styles.editBtn}>
                                    <FaEdit /> Edit
                                </button>
                                <button onClick={() => handleDelete(batch._id, batch.name)} className={styles.deleteBtn}>
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* View Batch Modal */}
            {showViewModal && selectedBatch && (
                <div className={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3><FaEye /> Batch Details</h3>
                            <button onClick={() => setShowViewModal(false)}><FaTimes /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Batch Name:</span>
                                <span className={styles.detailValue}>{selectedBatch.name}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Batch Code:</span>
                                <span className={styles.detailValue}>{selectedBatch.code}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Course:</span>
                                <span className={styles.detailValue}>{selectedBatch.course}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Trainer:</span>
                                <span className={styles.detailValue}>{selectedBatch.trainerId?.name || 'Not Assigned'}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Start Date:</span>
                                <span className={styles.detailValue}>{new Date(selectedBatch.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>End Date:</span>
                                <span className={styles.detailValue}>{new Date(selectedBatch.endDate).toLocaleDateString()}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Timings:</span>
                                <span className={styles.detailValue}>{selectedBatch.timings}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Days:</span>
                                <span className={styles.detailValue}>{selectedBatch.days?.join(', ') || 'Not specified'}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Capacity:</span>
                                <span className={styles.detailValue}>{selectedBatch.currentStudents || 0}/{selectedBatch.capacity}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Status:</span>
                                <span className={styles.detailValue}>{getStatusBadge(selectedBatch.status)}</span>
                            </div>
                            {selectedBatch.room && (
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Room:</span>
                                    <span className={styles.detailValue}>{selectedBatch.room}</span>
                                </div>
                            )}
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Created By:</span>
                                <span className={styles.detailValue}>{selectedBatch.createdBy?.name || selectedBatch.createdByName || 'System'}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Created At:</span>
                                <span className={styles.detailValue}>{new Date(selectedBatch.createdAt).toLocaleString()}</span>
                            </div>
                            {selectedBatch.description && (
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Description:</span>
                                    <span className={styles.detailValue}>{selectedBatch.description}</span>
                                </div>
                            )}
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowViewModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingBatch ? 'Edit Batch' : 'Create New Batch'}</h3>
                            <button onClick={() => setShowModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Batch Name *</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Batch Code</label>
                                        <input type="text" name="code" value={formData.code} onChange={handleChange} placeholder="Auto-generated" />
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Course *</label>
                                        <input type="text" name="course" value={formData.course} onChange={handleChange} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Assign Trainer (Trainer ID)</label>
                                        <input type="text" name="trainerId" value={formData.trainerId} onChange={handleChange} placeholder="Trainer ID (optional)" />
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Start Date *</label>
                                        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>End Date *</label>
                                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Timings *</label>
                                        <input type="text" name="timings" value={formData.timings} onChange={handleChange} placeholder="e.g., 10:00 AM - 1:00 PM" required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Room/Venue</label>
                                        <input type="text" name="room" value={formData.room} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Days</label>
                                    <div className={styles.daysGrid}>
                                        {weekDays.map(day => (
                                            <label key={day} className={styles.dayCheckbox}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.days.includes(day)}
                                                    onChange={() => handleDayToggle(day)}
                                                />
                                                {day.slice(0, 3)}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Capacity</label>
                                        <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="1" max="100" />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Description</label>
                                    <textarea name="description" rows="3" value={formData.description} onChange={handleChange} placeholder="Optional batch description" />
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className={styles.saveBtn} disabled={loading}>
                                    {loading ? <FaSpinner className={styles.spinner} /> : <FaCheck />}
                                    {editingBatch ? 'Update Batch' : 'Create Batch'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchManagement;
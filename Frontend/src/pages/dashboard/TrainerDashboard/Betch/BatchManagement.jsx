import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch, 
  FaSpinner, FaTimes, FaCheck, FaUserTie, 
  FaCalendarAlt, FaClock, FaUsers, FaBookOpen,
  FaChalkboardTeacher, FaBuilding, FaArrowLeft,
  FaUserCircle
} from 'react-icons/fa';
import api from '../../../../services/api';
import styles from './BatchManagement.module.css';

const BatchManagement = ({ onBack }) => {
    const [loading, setLoading] = useState(false);
    const [batches, setBatches] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [filteredTrainers, setFilteredTrainers] = useState([]);
    const [showTrainerDropdown, setShowTrainerDropdown] = useState(false);
    const [trainerSearchTerm, setTrainerSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingBatch, setEditingBatch] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const trainerInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        course: '',
        trainerId: '',
        trainerName: '',
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
        fetchBatches();
        fetchTrainers();
    }, []);

    // Filter trainers based on search term
    useEffect(() => {
        if (trainerSearchTerm.trim() === '') {
            setFilteredTrainers([]);
            return;
        }
        const filtered = trainers.filter(trainer =>
            trainer.name.toLowerCase().includes(trainerSearchTerm.toLowerCase()) ||
            trainer.email.toLowerCase().includes(trainerSearchTerm.toLowerCase())
        );
        setFilteredTrainers(filtered);
    }, [trainerSearchTerm, trainers]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (trainerInputRef.current && !trainerInputRef.current.contains(event.target)) {
                setShowTrainerDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const response = await api.get('/batches');
            if (response.data.success) {
                setBatches(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
            toast.error('Failed to fetch batches');
        } finally {
            setLoading(false);
        }
    };

    const fetchTrainers = async () => {
        try {
            const response = await api.get('/users?role=trainer');
            if (response.data.success) {
                setTrainers(response.data.data.users);
            }
        } catch (error) {
            console.error('Error fetching trainers:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleTrainerSearch = (e) => {
        const value = e.target.value;
        setTrainerSearchTerm(value);
        setShowTrainerDropdown(true);
        
        setFormData({
            ...formData,
            trainerName: value,
            trainerId: ''
        });
    };

    const selectTrainer = (trainer) => {
        setFormData({
            ...formData,
            trainerId: trainer._id,
            trainerName: trainer.name
        });
        setTrainerSearchTerm(trainer.name);
        setShowTrainerDropdown(false);
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
            // Validate required fields
            if (!formData.name) {
                toast.error('Batch name is required');
                setLoading(false);
                return;
            }
            if (!formData.course) {
                toast.error('Course name is required');
                setLoading(false);
                return;
            }
            if (!formData.startDate) {
                toast.error('Start date is required');
                setLoading(false);
                return;
            }
            if (!formData.endDate) {
                toast.error('End date is required');
                setLoading(false);
                return;
            }
            if (!formData.timings) {
                toast.error('Timings are required');
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
            
            console.log('Submitting batch data:', submitData);
            
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
                    trainerName: '',
                    startDate: '',
                    endDate: '',
                    timings: '',
                    days: [],
                    capacity: 30,
                    room: '',
                    description: ''
                });
                setTrainerSearchTerm('');
                fetchBatches();
            }
        } catch (error) {
            console.error('Submit error:', error);
            console.error('Error response:', error.response?.data);
            const errorMsg = error.response?.data?.message || 'Operation failed';
            toast.error(errorMsg);
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
        const trainerName = batch.trainerId?.name || '';
        setEditingBatch(batch);
        setFormData({
            name: batch.name,
            code: batch.code || '',
            course: batch.course,
            trainerId: batch.trainerId?._id || batch.trainerId || '',
            trainerName: trainerName,
            startDate: batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : '',
            endDate: batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : '',
            timings: batch.timings || '',
            days: batch.days || [],
            capacity: batch.capacity || 30,
            room: batch.room || '',
            description: batch.description || ''
        });
        setTrainerSearchTerm(trainerName);
        setShowModal(true);
    };

    const filteredBatches = batches.filter(batch =>
        batch.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.course?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status) => {
        switch(status) {
            case 'active': return <span className={`${styles.badge} ${styles.active}`}>Active</span>;
            case 'upcoming': return <span className={`${styles.badge} ${styles.upcoming}`}>Upcoming</span>;
            case 'completed': return <span className={`${styles.badge} ${styles.completed}`}>Completed</span>;
            default: return <span className={styles.badge}>{status}</span>;
        }
    };

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
            {loading && batches.length === 0 ? (
                <div className={styles.loadingContainer}>
                    <FaSpinner className={styles.spinner} /> Loading batches...
                </div>
            ) : filteredBatches.length === 0 ? (
                <div className={styles.emptyContainer}>
                    <p>No batches found</p>
                    <button onClick={() => { setEditingBatch(null); setShowModal(true); }}>Create your first batch</button>
                </div>
            ) : (
                <div className={styles.batchesGrid}>
                    {filteredBatches.map(batch => (
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
                                <p><FaUsers /> <strong>Capacity:</strong> {batch.currentStudents || 0}/{batch.capacity}</p>
                                {batch.room && <p><FaBuilding /> <strong>Room:</strong> {batch.room}</p>}
                            </div>
                            <div className={styles.batchActions}>
                                <button onClick={() => openEditModal(batch)} className={styles.editBtn}><FaEdit /> Edit</button>
                                <button onClick={() => handleDelete(batch._id, batch.name)} className={styles.deleteBtn}><FaTrash /> Delete</button>
                            </div>
                        </div>
                    ))}
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
                                        <input 
                                            type="text" 
                                            name="name" 
                                            value={formData.name} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Batch Code</label>
                                        <input 
                                            type="text" 
                                            name="code" 
                                            value={formData.code} 
                                            onChange={handleChange} 
                                            placeholder="Auto-generated" 
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Course *</label>
                                        <input 
                                            type="text" 
                                            name="course" 
                                            value={formData.course} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>
                                    <div className={styles.formGroup} ref={trainerInputRef}>
                                        <label>Assign Trainer</label>
                                        <div className={styles.trainerSearchContainer}>
                                            <FaUserCircle className={styles.trainerIcon} />
                                            <input 
                                                type="text"
                                                placeholder="Type trainer name to search..."
                                                value={trainerSearchTerm}
                                                onChange={handleTrainerSearch}
                                                onFocus={() => setShowTrainerDropdown(true)}
                                                className={styles.trainerSearchInput}
                                                autoComplete="off"
                                            />
                                            {showTrainerDropdown && filteredTrainers.length > 0 && (
                                                <div className={styles.trainerDropdown}>
                                                    {filteredTrainers.map(trainer => (
                                                        <div 
                                                            key={trainer._id}
                                                            className={styles.trainerItem}
                                                            onClick={() => selectTrainer(trainer)}
                                                        >
                                                            <FaUserCircle className={styles.trainerItemIcon} />
                                                            <div className={styles.trainerItemInfo}>
                                                                <div className={styles.trainerItemName}>{trainer.name}</div>
                                                                <div className={styles.trainerItemEmail}>{trainer.email}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {showTrainerDropdown && trainerSearchTerm && filteredTrainers.length === 0 && (
                                                <div className={styles.trainerDropdown}>
                                                    <div className={styles.noTrainerFound}>
                                                        No trainer found with name "{trainerSearchTerm}"
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {formData.trainerId && (
                                            <div className={styles.selectedTrainer}>
                                                Selected: <strong>{formData.trainerName}</strong>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Start Date *</label>
                                        <input 
                                            type="date" 
                                            name="startDate" 
                                            value={formData.startDate} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>End Date *</label>
                                        <input 
                                            type="date" 
                                            name="endDate" 
                                            value={formData.endDate} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Timings *</label>
                                        <input 
                                            type="text" 
                                            name="timings" 
                                            value={formData.timings} 
                                            onChange={handleChange} 
                                            placeholder="e.g., 10:00 AM - 1:00 PM" 
                                            required 
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Room/Venue</label>
                                        <input 
                                            type="text" 
                                            name="room" 
                                            value={formData.room} 
                                            onChange={handleChange} 
                                        />
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
                                        <input 
                                            type="number" 
                                            name="capacity" 
                                            value={formData.capacity} 
                                            onChange={handleChange} 
                                            min="1" 
                                            max="100" 
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Description</label>
                                    <textarea 
                                        name="description" 
                                        rows="3" 
                                        value={formData.description} 
                                        onChange={handleChange} 
                                        placeholder="Optional batch description"
                                    />
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
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
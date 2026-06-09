import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch,
  FaSpinner, FaTimes, FaCheck, FaDownload,
  FaUpload, FaFileAlt, FaCalendarAlt, FaClock,
  FaUserGraduate, FaBookOpen, FaPaperclip,
  FaCloudUploadAlt, FaStar, FaChartLine,
  FaUserTie, FaInfoCircle
} from 'react-icons/fa';
import api from '../../../../services/api';
import styles from './Assignments.module.css';

const Assignments = () => {
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [file, setFile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    batchId: '',
    dueDate: '',
    totalMarks: 100,
    attachments: []
  });

  // ✅ Get current user for tracking
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      setUserRole(user.role);
      console.log('=== ASSIGNMENTS ===');
      console.log('Current User:', user.name);
      console.log('User Role:', user.role);
    }
    fetchBatches();
  }, []);

  // Fetch batches based on role
  const fetchBatches = async () => {
    setLoading(true);
    try {
      let batchesData = [];
      
      if (userRole === 'trainer') {
        // Trainer sees their assigned batches
        try {
          const response = await api.get('/batches/trainer/assigned');
          if (response.data.success) {
            batchesData = response.data.data;
          }
        } catch (err) {
          console.log('Trainer endpoint failed, fetching all batches');
          const response = await api.get('/batches');
          if (response.data.success) {
            batchesData = response.data.data;
          }
        }
      } else {
        // Counselor or other roles see all batches
        const response = await api.get('/batches');
        if (response.data.success) {
          batchesData = response.data.data;
        }
      }
      
      setBatches(batchesData);
      console.log('Batches loaded:', batchesData.length);
      
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  };

  // Fetch assignments for selected batch
  const fetchAssignments = async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const response = await api.get('/assignments', {
        params: { batchId: selectedBatch._id }
      });
      if (response.data.success) {
        setAssignments(response.data.data);
        console.log('Assignments loaded:', response.data.data.length);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for selected batch
  const fetchStudents = async () => {
    if (!selectedBatch) return;
    try {
      const response = await api.get('/admissions');
      if (response.data.success) {
        const allStudents = response.data.data;
        const batchStudents = allStudents.filter(student => {
          const studentBatchId = student.batchId?._id || student.batchId;
          return studentBatchId === selectedBatch._id;
        });
        setStudents(batchStudents);
        console.log('Students in batch:', batchStudents.length);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    if (selectedBatch) {
      fetchAssignments();
      fetchStudents();
    }
  }, [selectedBatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.course || !formData.dueDate) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description || '');
      submitData.append('course', formData.course);
      submitData.append('batchId', selectedBatch._id);
      submitData.append('dueDate', formData.dueDate);
      submitData.append('totalMarks', formData.totalMarks);
      if (file) {
        submitData.append('attachment', file);
      }

      let response;
      if (editingAssignment) {
        response = await api.put(`/assignments/${editingAssignment._id}`, submitData);
        toast.success(`Assignment updated by ${currentUser?.name}`);
      } else {
        response = await api.post('/assignments', submitData);
        toast.success(`Assignment created by ${currentUser?.name}`);
      }

      if (response.data.success) {
        setShowModal(false);
        setEditingAssignment(null);
        setFormData({
          title: '',
          description: '',
          course: '',
          batchId: '',
          dueDate: '',
          totalMarks: 100,
          attachments: []
        });
        setFile(null);
        fetchAssignments();
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete assignment "${title}"? This action cannot be undone.`)) {
      setLoading(true);
      try {
        const response = await api.delete(`/assignments/${id}`);
        if (response.data.success) {
          toast.success(`Assignment "${title}" deleted by ${currentUser?.name}`);
          fetchAssignments();
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Delete failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGradeSubmit = async (studentId, marks, feedback, studentName) => {
    try {
      const response = await api.post(`/assignments/${selectedAssignment._id}/grade`, {
        studentId,
        marks,
        feedback
      });
      if (response.data.success) {
        toast.success(`Grade submitted for ${studentName} by ${currentUser?.name}`);
        fetchAssignments();
      }
    } catch (error) {
      console.error('Grade submit error:', error);
      toast.error('Failed to submit grade');
    }
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.course?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (dueDate) => {
    if (!dueDate) return <span className={`${styles.badge} ${styles.active}`}>Active</span>;
    const today = new Date();
    const due = new Date(dueDate);
    if (due < today) {
      return <span className={`${styles.badge} ${styles.expired}`}>Expired</span>;
    }
    const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 2) {
      return <span className={`${styles.badge} ${styles.urgent}`}>Urgent ({daysLeft} days)</span>;
    }
    return <span className={`${styles.badge} ${styles.active}`}>Active</span>;
  };

  // Batch Selection View
  if (!selectedBatch) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2><FaBookOpen /> Assignments</h2>
          <p>Select a batch to manage assignments</p>
        </div>
        <div className={styles.batchesGrid}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <FaSpinner className={styles.spinner} /> Loading batches...
            </div>
          ) : batches.length === 0 ? (
            <div className={styles.emptyContainer}>
              <div className={styles.emptyIcon}>📋</div>
              <h3>No batches available</h3>
              <p>No batches are available in the system.</p>
            </div>
          ) : (
            batches.map(batch => (
              <div
                key={batch._id}
                className={styles.batchCard}
                onClick={() => setSelectedBatch(batch)}
              >
                <div className={styles.batchCardIcon}>📚</div>
                <div className={styles.batchCardInfo}>
                  <h3>{batch.name}</h3>
                  <p>{batch.code}</p>
                  <div className={styles.batchCardStats}>
                    <span><FaUserGraduate /> {batch.studentsCount || batch.currentStudents || 0} Students</span>
                    <span><FaCalendarAlt /> {batch.timings}</span>
                  </div>
                </div>
                <div className={styles.batchCardArrow}>→</div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button className={styles.backBtn} onClick={() => setSelectedBatch(null)}>
        ← Back to Batches
      </button>

      {/* Batch Header */}
      <div className={styles.batchHeader}>
        <div>
          <h2>{selectedBatch.name}</h2>
          <p>{selectedBatch.code} | {selectedBatch.course} | {selectedBatch.timings}</p>
          <div className={styles.trainerInfo}>
            <FaUserTie /> {userRole === 'trainer' ? 'Trainer' : 'Instructor'}: {currentUser?.name || 'Not assigned'}
          </div>
        </div>
        <div className={styles.batchStats}>
          <span><FaUserGraduate /> {students.length} Students</span>
          {userRole === 'trainer' && (
            <button className={styles.createBtn} onClick={() => setShowModal(true)}>
              <FaPlus /> Create Assignment
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <FaSearch />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Assignments</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Assignments Grid */}
      <div className={styles.assignmentsGrid}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <FaSpinner className={styles.spinner} /> Loading assignments...
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>No assignments</h3>
            <p>No assignments found for this batch.</p>
            {userRole === 'trainer' && (
              <button className={styles.createFirstBtn} onClick={() => setShowModal(true)}>
                Create Assignment
              </button>
            )}
          </div>
        ) : (
          filteredAssignments.map(assignment => (
            <div key={assignment._id} className={styles.assignmentCard}>
              <div className={styles.assignmentHeader}>
                <div className={styles.assignmentTitle}>
                  <FaFileAlt />
                  <h3>{assignment.title}</h3>
                </div>
                {getStatusBadge(assignment.dueDate)}
              </div>
              <div className={styles.assignmentInfo}>
                <p><FaBookOpen /> Course: {assignment.course}</p>
                <p><FaCalendarAlt /> Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'Not set'}</p>
                <p><FaStar /> Total Marks: {assignment.totalMarks}</p>
                <p className={styles.trackingInfo}>
                  <FaUserTie /> Created by: {assignment.createdByName || assignment.trainerName || 'System'}
                </p>
                {assignment.description && <p className={styles.description}>{assignment.description}</p>}
              </div>
              <div className={styles.assignmentStats}>
                <div className={styles.stat}>
                  <span>Submitted</span>
                  <strong>{assignment.submissions?.length || 0}/{students.length}</strong>
                </div>
                <div className={styles.stat}>
                  <span>Avg. Score</span>
                  <strong>{assignment.averageScore || 0}%</strong>
                </div>
              </div>
              <div className={styles.assignmentActions}>
                <button className={styles.viewBtn} onClick={() => {
                  setSelectedAssignment(assignment);
                  setShowViewModal(true);
                }}>
                  <FaEye /> View Details
                </button>
                {userRole === 'trainer' && (
                  <>
                    <button className={styles.editBtn} onClick={() => {
                      setEditingAssignment(assignment);
                      setFormData({
                        title: assignment.title,
                        description: assignment.description || '',
                        course: assignment.course,
                        batchId: assignment.batchId,
                        dueDate: assignment.dueDate ? assignment.dueDate.split('T')[0] : '',
                        totalMarks: assignment.totalMarks,
                        attachments: []
                      });
                      setShowModal(true);
                    }}>
                      <FaEdit /> Edit
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(assignment._id, assignment.title)}>
                      <FaTrash /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Assignment Modal - Only for Trainers */}
      {showModal && userRole === 'trainer' && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</h3>
              <button onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Course *</label>
                  <input type="text" name="course" value={formData.course} onChange={handleChange} required />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Due Date *</label>
                    <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Total Marks</label>
                    <input type="number" name="totalMarks" value={formData.totalMarks} onChange={handleChange} min="0" max="1000" />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea name="description" rows="4" value={formData.description} onChange={handleChange} placeholder="Describe the assignment, instructions, etc." />
                </div>
                <div className={styles.formGroup}>
                  <label>Attachments</label>
                  <div className={styles.fileUpload}>
                    <input type="file" id="attachment" onChange={handleFileChange} style={{ display: 'none' }} />
                    <label htmlFor="attachment" className={styles.fileLabel}>
                      <FaCloudUploadAlt /> {file ? file.name : 'Upload File (PDF, DOC, ZIP)'}
                    </label>
                    {file && (
                      <button type="button" onClick={() => setFile(null)} className={styles.removeFile}>
                        <FaTimes /> Remove
                      </button>
                    )}
                  </div>
                </div>
                <div className={styles.trackingNote}>
                  <FaInfoCircle /> Assignment will be created as: {currentUser?.name}
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={loading}>
                  {loading ? <FaSpinner className={styles.spinner} /> : <FaCheck />}
                  {editingAssignment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Assignment Modal with Submissions */}
      {showViewModal && selectedAssignment && (
        <div className={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
          <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FaFileAlt /> {selectedAssignment.title}</h3>
              <button onClick={() => setShowViewModal(false)}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.assignmentDetail}>
                <p><strong>Course:</strong> {selectedAssignment.course}</p>
                <p><strong>Due Date:</strong> {selectedAssignment.dueDate ? new Date(selectedAssignment.dueDate).toLocaleString() : 'Not set'}</p>
                <p><strong>Total Marks:</strong> {selectedAssignment.totalMarks}</p>
                <p><strong>Created By:</strong> {selectedAssignment.createdByName || selectedAssignment.trainerName || 'System'}</p>
                <p><strong>Created At:</strong> {new Date(selectedAssignment.createdAt).toLocaleString()}</p>
                <p><strong>Description:</strong></p>
                <p className={styles.descriptionText}>{selectedAssignment.description || 'No description'}</p>
                {selectedAssignment.attachments?.length > 0 && (
                  <div className={styles.attachments}>
                    <strong>Attachments:</strong>
                    {selectedAssignment.attachments.map((att, i) => (
                      <a key={i} href={att.url} target="_blank" rel="noopener noreferrer">
                        <FaPaperclip /> {att.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.submissionsSection}>
                <h4>Student Submissions</h4>
                <div className={styles.submissionsTable}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Submitted</th>
                        <th>Submitted On</th>
                        <th>Marks</th>
                        <th>Status</th>
                        <th>Graded By</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => {
                        const submission = selectedAssignment.submissions?.find(
                          s => s.studentId === student._id
                        );
                        return (
                          <tr key={student._id}>
                            <td>{student.name}</td>
                            <td>
                              {submission ? (
                                <FaCheck className={styles.submittedIcon} />
                              ) : (
                                <FaTimes className={styles.pendingIcon} />
                              )}
                            </td>
                            <td>{submission ? new Date(submission.submittedAt).toLocaleString() : '-'}</td>
                            <td>
                              {submission?.marks !== undefined ? (
                                <span className={styles.marksBadge}>{submission.marks}/{selectedAssignment.totalMarks}</span>
                              ) : (
                                userRole === 'trainer' && (
                                  <input
                                    type="number"
                                    className={styles.marksInput}
                                    placeholder="Enter marks"
                                    onBlur={(e) => {
                                      const marks = parseInt(e.target.value);
                                      if (!isNaN(marks)) {
                                        handleGradeSubmit(student._id, marks, '', student.name);
                                      }
                                    }}
                                  />
                                )
                              )}
                            </td>
                            <td>
                              {submission?.graded ? (
                                <span className={styles.gradedBadge}>Graded</span>
                              ) : submission ? (
                                <span className={styles.submittedBadge}>Submitted</span>
                              ) : (
                                <span className={styles.pendingBadge}>Pending</span>
                              )}
                            </td>
                            <td>
                              {submission?.gradedByName ? (
                                <span className={styles.graderName}>
                                  <FaUserTie /> {submission.gradedByName}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td>
                              {submission?.fileUrl && (
                                <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className={styles.downloadLink}>
                                  <FaDownload /> Download
                                </a>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.closeBtn} onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
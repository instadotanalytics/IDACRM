import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch,
  FaSpinner, FaTimes, FaCheck, FaCalendarAlt,
  FaClock, FaUserGraduate, FaBookOpen, FaChartLine,
  FaTrophy, FaDownload, FaFilePdf, FaCloudUploadAlt,
  FaQuestionCircle, FaListOl, FaUserTie, FaInfoCircle
} from 'react-icons/fa';
import api from '../../../../services/api';
import styles from './Tests.module.css';

const Tests = () => {
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [uploadMethod, setUploadMethod] = useState('manual');
  const [pdfFile, setPdfFile] = useState(null);
  const [questionsList, setQuestionsList] = useState([]);
  
  // ✅ Get current user for tracking
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    batchId: '',
    duration: 60,
    startDate: '',
    endDate: ''
  });

  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    marks: 1
  });
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);

  // Fetch batches based on role
  const fetchBatches = async () => {
    setLoading(true);
    try {
      let batchesData = [];
      
      if (userRole === 'trainer') {
        try {
          const response = await api.get('/batches/trainer/assigned');
          if (response.data.success) {
            batchesData = response.data.data;
          }
        } catch (err) {
          const response = await api.get('/batches');
          if (response.data.success) {
            batchesData = response.data.data;
          }
        }
      } else {
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

  // Fetch tests for selected batch
  const fetchTests = async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const response = await api.get('/tests', {
        params: { batchId: selectedBatch._id }
      });
      if (response.data.success) {
        setTests(response.data.data);
        console.log('Tests loaded:', response.data.data.length);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  };

  // Fetch students
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
      fetchTests();
      fetchStudents();
    }
  }, [selectedBatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePdfFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File size must be less than 20MB');
        return;
      }
      setPdfFile(file);
      toast.success('PDF file selected');
    } else {
      toast.error('Please select a valid PDF file');
    }
  };

  const handleQuestionChange = (e) => {
    setQuestionForm({
      ...questionForm,
      [e.target.name]: e.target.value
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const addQuestion = () => {
    if (!questionForm.question.trim()) {
      toast.error('Please enter a question');
      return;
    }
    if (questionForm.options.some(opt => !opt.trim())) {
      toast.error('Please fill all options');
      return;
    }

    if (editingQuestionIndex !== null) {
      const newQuestions = [...questionsList];
      newQuestions[editingQuestionIndex] = {
        question: questionForm.question,
        options: [...questionForm.options],
        correctAnswer: parseInt(questionForm.correctAnswer),
        marks: parseInt(questionForm.marks) || 1
      };
      setQuestionsList(newQuestions);
      toast.success('Question updated');
    } else {
      setQuestionsList([...questionsList, {
        question: questionForm.question,
        options: [...questionForm.options],
        correctAnswer: parseInt(questionForm.correctAnswer),
        marks: parseInt(questionForm.marks) || 1
      }]);
      toast.success('Question added');
    }
    setQuestionForm({ question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 });
    setEditingQuestionIndex(null);
    setShowQuestionModal(false);
  };

  const editQuestion = (index) => {
    const q = questionsList[index];
    setQuestionForm({
      question: q.question,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
      marks: q.marks
    });
    setEditingQuestionIndex(index);
    setShowQuestionModal(true);
  };

  const removeQuestion = (index) => {
    const newQuestions = questionsList.filter((_, i) => i !== index);
    setQuestionsList(newQuestions);
    toast.success('Question removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (uploadMethod === 'manual' && questionsList.length === 0) {
      toast.error('Please add at least one question');
      return;
    }
    
    if (uploadMethod === 'pdf' && !pdfFile) {
      toast.error('Please upload a PDF file');
      return;
    }

    const startDateTime = formData.startDate ? `${formData.startDate}T00:00` : '';
    const endDateTime = formData.endDate ? `${formData.endDate}T23:59` : '';

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description || '');
      submitData.append('course', formData.course);
      submitData.append('batchId', selectedBatch._id);
      submitData.append('duration', formData.duration);
      submitData.append('startDate', startDateTime);
      submitData.append('endDate', endDateTime);
      
      if (uploadMethod === 'pdf' && pdfFile) {
        submitData.append('pdfFile', pdfFile);
      } else if (uploadMethod === 'manual') {
        submitData.append('questions', JSON.stringify(questionsList));
      }

      let response;
      if (editingTest) {
        response = await api.put(`/tests/${editingTest._id}`, submitData);
        toast.success(`Test updated by ${currentUser?.name}`);
      } else {
        response = await api.post('/tests', submitData);
        toast.success(`Test created by ${currentUser?.name}`);
      }

      if (response.data.success) {
        setShowModal(false);
        setEditingTest(null);
        setPdfFile(null);
        setQuestionsList([]);
        setFormData({
          title: '',
          description: '',
          course: '',
          batchId: '',
          duration: 60,
          startDate: '',
          endDate: ''
        });
        fetchTests();
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete test "${title}"? This action cannot be undone.`)) {
      setLoading(true);
      try {
        const response = await api.delete(`/tests/${id}`);
        if (response.data.success) {
          toast.success(`Test "${title}" deleted by ${currentUser?.name}`);
          fetchTests();
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Delete failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusBadge = (test) => {
    const now = new Date();
    const start = new Date(test.startDate);
    const end = new Date(test.endDate);

    if (start > now) {
      return <span className={`${styles.badge} ${styles.upcoming}`}>Upcoming</span>;
    } else if (end < now) {
      return <span className={`${styles.badge} ${styles.expired}`}>Expired</span>;
    } else {
      return <span className={`${styles.badge} ${styles.active}`}>Active</span>;
    }
  };

  const filteredTests = tests.filter(test =>
    test.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.course?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Batch Selection View
  if (!selectedBatch) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2><FaBookOpen /> Tests</h2>
          <p>Select a batch to manage tests</p>
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
                    <span><FaClock /> {batch.timings}</span>
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
              <FaPlus /> Create Test
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
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Tests</option>
          <option value="upcoming">Upcoming</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Tests Grid */}
      <div className={styles.testsGrid}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <FaSpinner className={styles.spinner} /> Loading tests...
          </div>
        ) : filteredTests.length === 0 ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>No tests</h3>
            <p>No tests found for this batch.</p>
            {userRole === 'trainer' && (
              <button className={styles.createFirstBtn} onClick={() => setShowModal(true)}>
                Create Test
              </button>
            )}
          </div>
        ) : (
          filteredTests.map(test => (
            <div key={test._id} className={styles.testCard}>
              <div className={styles.testHeader}>
                <div className={styles.testTitle}>
                  <FaTrophy />
                  <h3>{test.title}</h3>
                </div>
                {getStatusBadge(test)}
              </div>
              <div className={styles.testInfo}>
                <p><FaBookOpen /> Course: {test.course}</p>
                <p><FaCalendarAlt /> Start: {new Date(test.startDate).toLocaleString()}</p>
                <p><FaCalendarAlt /> End: {new Date(test.endDate).toLocaleString()}</p>
                <p><FaClock /> Duration: {test.duration} minutes</p>
                <p><FaQuestionCircle /> Questions: {test.questions?.length || 0}</p>
                <p><FaTrophy /> Total Marks: {test.totalMarks}</p>
                <p className={styles.trackingInfo}>
                  <FaUserTie /> Created by: {test.createdByName || test.trainerName || 'System'}
                </p>
              </div>
              <div className={styles.testStats}>
                <div className={styles.stat}>
                  <span>Attempted</span>
                  <strong>{test.results?.length || 0}/{students.length}</strong>
                </div>
                <div className={styles.stat}>
                  <span>Average Score</span>
                  <strong>{test.averageScore || 0}%</strong>
                </div>
              </div>
              <div className={styles.testActions}>
                <button className={styles.viewBtn} onClick={() => {
                  setSelectedTest(test);
                  setShowViewModal(true);
                }}>
                  <FaEye /> View
                </button>
                <button className={styles.resultsBtn} onClick={() => {
                  setSelectedTest(test);
                  setShowResultsModal(true);
                }}>
                  <FaChartLine /> Results
                </button>
                {userRole === 'trainer' && (
                  <>
                    <button className={styles.editBtn} onClick={() => {
                      setEditingTest(test);
                      setFormData({
                        title: test.title,
                        description: test.description || '',
                        course: test.course,
                        batchId: test.batchId,
                        duration: test.duration,
                        startDate: test.startDate?.split('T')[0] || '',
                        endDate: test.endDate?.split('T')[0] || ''
                      });
                      setQuestionsList(test.questions || []);
                      setUploadMethod(test.pdfUrl ? 'pdf' : 'manual');
                      setShowModal(true);
                    }}>
                      <FaEdit /> Edit
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(test._id, test.title)}>
                      <FaTrash /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Test Modal - Only for Trainers */}
      {showModal && userRole === 'trainer' && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingTest ? 'Edit Test' : 'Create New Test'}</h3>
              <button onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Test Title *</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Course *</label>
                    <input type="text" name="course" value={formData.course} onChange={handleChange} required />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea name="description" rows="2" value={formData.description} onChange={handleChange} />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Duration (minutes) *</label>
                    <input type="number" name="duration" value={formData.duration} onChange={handleChange} min="1" required />
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

                <div className={styles.uploadMethodSection}>
                  <label>Question Upload Method *</label>
                  <div className={styles.methodButtons}>
                    <button 
                      type="button" 
                      className={`${styles.methodBtn} ${uploadMethod === 'pdf' ? styles.activeMethod : ''}`}
                      onClick={() => setUploadMethod('pdf')}
                    >
                      <FaFilePdf /> Upload PDF
                    </button>
                    <button 
                      type="button" 
                      className={`${styles.methodBtn} ${uploadMethod === 'manual' ? styles.activeMethod : ''}`}
                      onClick={() => setUploadMethod('manual')}
                    >
                      <FaListOl /> Add Manually
                    </button>
                  </div>
                </div>

                {uploadMethod === 'pdf' && (
                  <div className={styles.pdfUploadSection}>
                    <div className={styles.pdfUploadArea}>
                      <input type="file" id="pdfFile" accept=".pdf" onChange={handlePdfFileChange} style={{ display: 'none' }} />
                      <label htmlFor="pdfFile" className={styles.pdfLabel}>
                        <FaCloudUploadAlt /> {pdfFile ? pdfFile.name : 'Click to upload PDF file'}
                        <small>PDF file with questions (Max 20MB)</small>
                      </label>
                      {pdfFile && (
                        <button type="button" onClick={() => setPdfFile(null)} className={styles.removePdf}>
                          <FaTimes /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {uploadMethod === 'manual' && (
                  <div className={styles.questionsSection}>
                    <div className={styles.sectionHeader}>
                      <h4>Questions ({questionsList.length})</h4>
                      <button type="button" className={styles.addQuestionBtn} onClick={() => setShowQuestionModal(true)}>
                        <FaPlus /> Add Question
                      </button>
                    </div>
                    
                    {questionsList.length === 0 ? (
                      <div className={styles.noQuestions}>No questions added yet.</div>
                    ) : (
                      <div className={styles.questionsList}>
                        {questionsList.map((q, idx) => (
                          <div key={idx} className={styles.questionItem}>
                            <div className={styles.questionHeader}>
                              <span className={styles.questionNumber}>Q{idx + 1}.</span>
                              <span className={styles.questionText}>{q.question}</span>
                              <div className={styles.questionActions}>
                                <button type="button" onClick={() => editQuestion(idx)}><FaEdit /></button>
                                <button type="button" onClick={() => removeQuestion(idx)}><FaTrash /></button>
                              </div>
                            </div>
                            <div className={styles.questionOptions}>
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className={`${styles.option} ${q.correctAnswer === optIdx ? styles.correctOption : ''}`}>
                                  {String.fromCharCode(65 + optIdx)}. {opt} {q.correctAnswer === optIdx && <span className={styles.correctBadge}>✓ Correct</span>}
                                </div>
                              ))}
                            </div>
                            <div className={styles.questionMarks}>Marks: {q.marks}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.trackingNote}>
                  <FaInfoCircle /> Test will be created as: {currentUser?.name}
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={loading}>
                  {loading ? <FaSpinner className={styles.spinner} /> : <FaCheck />}
                  {editingTest ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && userRole === 'trainer' && (
        <div className={styles.modalOverlay} onClick={() => setShowQuestionModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingQuestionIndex !== null ? 'Edit Question' : 'Add Question'}</h3>
              <button onClick={() => setShowQuestionModal(false)}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Question *</label>
                <input type="text" name="question" value={questionForm.question} onChange={handleQuestionChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Options *</label>
                {questionForm.options.map((opt, idx) => (
                  <div key={idx} className={styles.optionInput}>
                    <span>{String.fromCharCode(65 + idx)}.</span>
                    <input type="text" value={opt} onChange={(e) => handleOptionChange(idx, e.target.value)} required />
                  </div>
                ))}
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Correct Answer *</label>
                  <select name="correctAnswer" value={questionForm.correctAnswer} onChange={handleQuestionChange}>
                    <option value="0">A</option>
                    <option value="1">B</option>
                    <option value="2">C</option>
                    <option value="3">D</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Marks</label>
                  <input type="number" name="marks" value={questionForm.marks} onChange={handleQuestionChange} min="1" />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowQuestionModal(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={addQuestion}>Add Question</button>
            </div>
          </div>
        </div>
      )}

      {/* View Test Modal */}
      {showViewModal && selectedTest && (
        <div className={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
          <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FaTrophy /> {selectedTest.title}</h3>
              <button onClick={() => setShowViewModal(false)}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.testDetail}>
                <p><strong>Course:</strong> {selectedTest.course}</p>
                <p><strong>Duration:</strong> {selectedTest.duration} minutes</p>
                <p><strong>Start Date:</strong> {new Date(selectedTest.startDate).toLocaleString()}</p>
                <p><strong>End Date:</strong> {new Date(selectedTest.endDate).toLocaleString()}</p>
                <p><strong>Total Marks:</strong> {selectedTest.totalMarks}</p>
                <p><strong>Created By:</strong> {selectedTest.createdByName || selectedTest.trainerName || 'System'}</p>
                <p><strong>Created At:</strong> {new Date(selectedTest.createdAt).toLocaleString()}</p>
                {selectedTest.pdfUrl && (
                  <p><strong>PDF:</strong> <a href={selectedTest.pdfUrl} target="_blank" rel="noopener noreferrer" className={styles.pdfLink}><FaFilePdf /> Download</a></p>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.closeBtn} onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && selectedTest && (
        <div className={styles.modalOverlay} onClick={() => setShowResultsModal(false)}>
          <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FaChartLine /> {selectedTest.title} - Results</h3>
              <button onClick={() => setShowResultsModal(false)}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.resultsSummary}>
                <div className={styles.summaryCard}><span>Total Students</span><strong>{students.length}</strong></div>
                <div className={styles.summaryCard}><span>Attempted</span><strong>{selectedTest.results?.length || 0}</strong></div>
                <div className={styles.summaryCard}><span>Average Score</span><strong>{selectedTest.averageScore || 0}%</strong></div>
              </div>
              <div className={styles.resultsTable}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>#</th><th>Student Name</th><th>Enrollment ID</th><th>Score</th><th>Percentage</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {students.map((student, idx) => {
                      const result = selectedTest.results?.find(r => r.studentId?._id === student._id);
                      return (
                        <tr key={student._id}>
                          <td>{idx + 1}</td>
                          <td>{student.name}</td>
                          <td>{student.enrollmentId}</td>
                          <td>{result ? `${result.totalScore}/${selectedTest.totalMarks}` : '-'}</td>
                          <td className={result?.percentage >= 60 ? styles.highScore : styles.lowScore}>{result ? `${result.percentage}%` : '-'}</td>
                          <td>{result ? <span className={styles.submittedBadge}>Submitted</span> : <span className={styles.pendingBadge}>Not Started</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.downloadBtn}><FaDownload /> Export Results</button>
              <button className={styles.closeBtn} onClick={() => setShowResultsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tests;
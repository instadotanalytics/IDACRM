import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  FaSearch, FaSpinner, FaUserGraduate, FaChartLine,
  FaCalendarAlt, FaDownload, FaEye, FaStar,
  FaCheckCircle, FaTimesCircle, FaClock, FaTrophy,
  FaMedal, FaChartBar, FaAward, FaBookOpen, FaUserTie
} from 'react-icons/fa';
import {
  Line, Bar, Doughnut
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import api, { getCurrentUser, getCurrentUserRole } from '../../../../services/api';
import styles from './StudentPerformance.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const StudentPerformance = () => {
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [batchStats, setBatchStats] = useState(null);
  const [filterGrade, setFilterGrade] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('');

  // Get current user
  useEffect(() => {
    const user = getCurrentUser();
    const role = getCurrentUserRole();
    if (user) {
      setCurrentUser(user);
      setUserRole(role);
      console.log('=== STUDENT PERFORMANCE ===');
      console.log('Current User:', user.name);
      console.log('User Role:', role);
    }
    fetchBatches();
  }, []);

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

  // Fetch students and their performance for selected batch
  const fetchBatchPerformance = async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      // Get students in batch
      const studentsRes = await api.get('/admissions');
      const allStudents = studentsRes.data.success ? studentsRes.data.data : [];
      const batchStudents = allStudents.filter(student => {
        const studentBatchId = student.batchId?._id || student.batchId;
        return studentBatchId === selectedBatch._id;
      });
      setStudents(batchStudents);
      console.log('Students in batch:', batchStudents.length);

      // Get performance data
      const perfRes = await api.get(`/student-performance/batch/${selectedBatch._id}`);
      if (perfRes.data.success) {
        setPerformances(perfRes.data.data.students || []);
        setBatchStats(perfRes.data.data.statistics);
      }

    } catch (error) {
      console.error('Error fetching batch performance:', error);
      toast.error('Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBatch) {
      fetchBatchPerformance();
    }
  }, [selectedBatch]);

  const getGradeColor = (grade) => {
    const colors = {
      'A+': '#10b981',
      'A': '#22c55e',
      'B+': '#84cc16',
      'B': '#eab308',
      'C+': '#f59e0b',
      'C': '#f97316',
      'D': '#ef4444',
      'F': '#dc2626'
    };
    return colors[grade] || '#a0a0a0';
  };

  const getGradeBadge = (grade) => {
    const color = getGradeColor(grade);
    return (
      <span className={styles.gradeBadge} style={{ background: `${color}20`, color: color, border: `1px solid ${color}` }}>
        {grade}
      </span>
    );
  };

  const getStatusBadge = (percentage) => {
    if (percentage >= 75) return <span className={styles.statusGood}>🌟 Excellent</span>;
    if (percentage >= 60) return <span className={styles.statusAverage}>👍 Good</span>;
    if (percentage >= 45) return <span className={styles.statusPoor}>⚠️ Needs Improvement</span>;
    return <span className={styles.statusBad}>❌ At Risk</span>;
  };

  const filteredPerformances = performances.filter(perf => {
    const matchesSearch = perf.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         perf.studentId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'all' || perf.overallGrade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const gradeDistributionData = {
    labels: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    datasets: [{
      label: 'Number of Students',
      data: batchStats ? [
        batchStats.gradeDistribution?.['A+'] || 0,
        batchStats.gradeDistribution?.['A'] || 0,
        batchStats.gradeDistribution?.['B+'] || 0,
        batchStats.gradeDistribution?.['B'] || 0,
        batchStats.gradeDistribution?.['C+'] || 0,
        batchStats.gradeDistribution?.['C'] || 0,
        batchStats.gradeDistribution?.['D'] || 0,
        batchStats.gradeDistribution?.['F'] || 0
      ] : [0, 0, 0, 0, 0, 0, 0, 0],
      backgroundColor: ['#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#dc2626'],
      borderWidth: 0
    }]
  };

  // Batch Selection View
  if (!selectedBatch) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2><FaChartLine /> Student Performance</h2>
          <p>Select a batch to view student performance</p>
        </div>
        <div className={styles.batchesGrid}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <FaSpinner className={styles.spinner} /> Loading batches...
            </div>
          ) : batches.length === 0 ? (
            <div className={styles.emptyContainer}>
              <div className={styles.emptyIcon}>📊</div>
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
        </div>
      </div>

      {/* Statistics Cards */}
      {batchStats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaTrophy /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{batchStats.averagePercentage?.toFixed(1) || 0}%</span>
              <span className={styles.statLabel}>Average Score</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaMedal /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{batchStats.totalPassed || 0}</span>
              <span className={styles.statLabel}>Passed</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaTimesCircle /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{batchStats.totalFailed || 0}</span>
              <span className={styles.statLabel}>Failed</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaChartLine /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{batchStats.passPercentage?.toFixed(1) || 0}%</span>
              <span className={styles.statLabel}>Pass Rate</span>
            </div>
          </div>
        </div>
      )}

      {/* Grade Distribution Chart */}
      {batchStats && (
        <div className={styles.chartCard}>
          <h3>Grade Distribution</h3>
          <div className={styles.chartContainer}>
            <Bar 
              data={gradeDistributionData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: { backgroundColor: '#1e1e2a' }
                }
              }} 
            />
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <FaSearch />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
        >
          <option value="all">All Grades</option>
          <option value="A+">A+</option>
          <option value="A">A</option>
          <option value="B+">B+</option>
          <option value="B">B</option>
          <option value="C+">C+</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="F">F</option>
        </select>
      </div>

      {/* Students Performance Table */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <FaSpinner className={styles.spinner} /> Loading performance data...
          </div>
        ) : filteredPerformances.length === 0 ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIcon}>👨‍🎓</div>
            <h3>No students found</h3>
            <p>No students are enrolled in this batch yet.</p>
          </div>
        ) : (
          <table className={styles.performanceTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Attendance</th>
                <th>Assignments</th>
                <th>Tests</th>
                <th>Overall</th>
                <th>Grade</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPerformances.map((perf, idx) => (
                <tr key={perf.studentId?._id || idx}>
                  <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                  <td className={styles.studentCell}>
                    {perf.studentId?.photo ? (
                      <img src={perf.studentId.photo} alt={perf.studentId.name} className={styles.studentAvatar} />
                    ) : (
                      <div className={styles.avatarFallback}>
                        {perf.studentId?.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className={styles.studentName}>{perf.studentId?.name}</div>
                      <div className={styles.studentEmail}>{perf.studentId?.email}</div>
                    </div>
                  </td>
                  <td className={styles.attendanceCell}>
                    <div className={styles.progressCircle}>
                      <span>{perf.overallAttendance?.toFixed(1) || 0}%</span>
                    </div>
                  </td>
                  <td>{perf.averageAssignmentScore?.toFixed(1) || 0}%</td>
                  <td>{perf.averageTestScore?.toFixed(1) || 0}%</td>
                  <td className={styles.overallCell}>
                    <strong>{perf.overallPercentage?.toFixed(1) || 0}%</strong>
                  </td>
                  <td>{getGradeBadge(perf.overallGrade)}</td>
                  <td>{getStatusBadge(perf.overallPercentage)}</td>
                  <td>
                    <button 
                      className={styles.viewBtn}
                      onClick={() => {
                        setSelectedStudent(perf);
                        setShowDetailModal(true);
                      }}
                    >
                      <FaEye /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Student Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderInfo}>
                <div className={styles.studentAvatarLarge}>
                  {selectedStudent.studentId?.photo ? (
                    <img src={selectedStudent.studentId.photo} alt={selectedStudent.studentId.name} />
                  ) : (
                    <div className={styles.avatarFallbackLarge}>
                      {selectedStudent.studentId?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3>{selectedStudent.studentId?.name}</h3>
                  <p>{selectedStudent.studentId?.email} | {selectedStudent.studentId?.enrollmentId}</p>
                  <p className={styles.batchInfo}>{selectedBatch?.name} | {selectedBatch?.course}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              {/* Grade Card */}
              <div className={styles.gradeCard} style={{ background: `linear-gradient(135deg, ${getGradeColor(selectedStudent.overallGrade)}, ${getGradeColor(selectedStudent.overallGrade)}dd)` }}>
                <div className={styles.gradeInfo}>
                  <span className={styles.gradeLabel}>Overall Grade</span>
                  <span className={styles.gradeValue}>{selectedStudent.overallGrade}</span>
                </div>
                <div className={styles.scoreInfo}>
                  <span>Overall Score: {selectedStudent.overallPercentage?.toFixed(1) || 0}%</span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className={styles.statsGridModal}>
                <div className={styles.statCardModal}>
                  <div className={styles.statIcon}><FaCalendarAlt /></div>
                  <div className={styles.statContent}>
                    <span className={styles.statValue}>{selectedStudent.overallAttendance?.toFixed(1) || 0}%</span>
                    <span className={styles.statLabel}>Attendance</span>
                  </div>
                </div>
                <div className={styles.statCardModal}>
                  <div className={styles.statIcon}><FaBookOpen /></div>
                  <div className={styles.statContent}>
                    <span className={styles.statValue}>{selectedStudent.averageAssignmentScore?.toFixed(1) || 0}%</span>
                    <span className={styles.statLabel}>Assignments</span>
                  </div>
                </div>
                <div className={styles.statCardModal}>
                  <div className={styles.statIcon}><FaTrophy /></div>
                  <div className={styles.statContent}>
                    <span className={styles.statValue}>{selectedStudent.averageTestScore?.toFixed(1) || 0}%</span>
                    <span className={styles.statLabel}>Tests</span>
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className={styles.detailStats}>
                <div className={styles.detailCard}>
                  <h4>Attendance Details</h4>
                  <div className={styles.detailRow}>
                    <span>Present Days:</span>
                    <strong>{selectedStudent.totalPresent || 0}</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Absent Days:</span>
                    <strong>{selectedStudent.totalAbsent || 0}</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Leave Days:</span>
                    <strong>{selectedStudent.totalLeave || 0}</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Late Days:</span>
                    <strong>{selectedStudent.totalLate || 0}</strong>
                  </div>
                </div>

                <div className={styles.detailCard}>
                  <h4>Assignment Details</h4>
                  <div className={styles.detailRow}>
                    <span>Total Assignments:</span>
                    <strong>{selectedStudent.totalAssignments || 0}</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Submitted:</span>
                    <strong>{selectedStudent.submittedAssignments || 0}</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Average Score:</span>
                    <strong>{selectedStudent.averageAssignmentScore?.toFixed(1) || 0}%</strong>
                  </div>
                </div>

                <div className={styles.detailCard}>
                  <h4>Test Details</h4>
                  <div className={styles.detailRow}>
                    <span>Total Tests:</span>
                    <strong>{selectedStudent.totalTests || 0}</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Average Score:</span>
                    <strong>{selectedStudent.averageTestScore?.toFixed(1) || 0}%</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Highest Score:</span>
                    <strong>{selectedStudent.highestTestScore?.toFixed(1) || 0}%</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Lowest Score:</span>
                    <strong>{selectedStudent.lowestTestScore?.toFixed(1) || 0}%</strong>
                  </div>
                </div>
              </div>

              {selectedStudent.remarks && (
                <div className={styles.remarksCard}>
                  <h4>Remarks</h4>
                  <p>{selectedStudent.remarks}</p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.downloadBtn}
                onClick={() => {
                  toast.success('Report downloaded');
                }}
              >
                <FaDownload /> Download Report
              </button>
              <button className={styles.closeBtn} onClick={() => setShowDetailModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPerformance;
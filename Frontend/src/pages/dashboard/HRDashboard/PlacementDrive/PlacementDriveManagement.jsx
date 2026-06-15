import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  FaCalendarAlt, FaPlus, FaSearch, FaEdit, FaTrash, FaEye,
  FaTimes, FaCheck, FaSpinner, FaBuilding, FaMapMarkerAlt,
  FaClock, FaUsers, FaRupeeSign, FaLaptop, FaLocationArrow,
  FaFilter, FaDownload, FaUserPlus, FaChartLine, FaInfoCircle,
  FaLink, FaEnvelope, FaPhone
} from 'react-icons/fa';
import { placementDriveService } from '../../../../services/placementDriveService';
import { companyService } from '../../../../services/companyService';
import styles from './PlacementDriveManagement.module.css';

const PlacementDriveManagement = () => {
  const [loading, setLoading] = useState(false);
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState({
    total: 0, upcoming: 0, ongoing: 0, completed: 0, cancelled: 0,
    totalStudentsApplied: 0, totalStudentsSelected: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const [formData, setFormData] = useState({
    companyId: '',
    driveTitle: '',
    driveDate: '',
    driveTime: '10:00 AM',
    location: '',
    mode: 'Online',
    meetingLink: '',
    ctc: '',
    openPositions: '',
    eligibility: '',
    requiredSkills: '',
    description: '',
    status: 'Upcoming'
  });

  useEffect(() => {
    fetchDrives();
    fetchStats();
    fetchCompanies();
  }, [pagination.page, statusFilter, searchTerm]);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const response = await placementDriveService.getDrives({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter
      });

      if (response.data.success) {
        setDrives(response.data.data);
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
      console.error('Error fetching drives:', error);
      toast.error('Failed to fetch placement drives');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await placementDriveService.getDriveStats();
      if (response.data.success) {
        const data = response.data.data;
        const statusWise = data.statusWise || [];
        setStats({
          total: statusWise.reduce((sum, s) => sum + s.count, 0),
          upcoming: statusWise.find(s => s._id === 'Upcoming')?.count || 0,
          ongoing: statusWise.find(s => s._id === 'Ongoing')?.count || 0,
          completed: statusWise.find(s => s._id === 'Completed')?.count || 0,
          cancelled: statusWise.find(s => s._id === 'Cancelled')?.count || 0,
          totalStudentsApplied: 0,
          totalStudentsSelected: 0
        });
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
    setEditingDrive(null);
    setFormData({
      companyId: '',
      driveTitle: '',
      driveDate: '',
      driveTime: '10:00 AM',
      location: '',
      mode: 'Online',
      meetingLink: '',
      ctc: '',
      openPositions: '',
      eligibility: '',
      requiredSkills: '',
      description: '',
      status: 'Upcoming'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.companyId) {
      toast.error('Please select a company');
      return;
    }
    if (!formData.driveTitle) {
      toast.error('Please enter drive title');
      return;
    }
    if (!formData.driveDate) {
      toast.error('Please select drive date');
      return;
    }
    if (!formData.location) {
      toast.error('Please enter location');
      return;
    }
    if (!formData.ctc) {
      toast.error('Please enter CTC');
      return;
    }
    if (!formData.openPositions) {
      toast.error('Please enter open positions');
      return;
    }
    if (!formData.eligibility) {
      toast.error('Please enter eligibility criteria');
      return;
    }

    setLoading(true);
    try {
      const skillsArray = formData.requiredSkills ? formData.requiredSkills.split(',').map(s => s.trim()) : [];
      const driveData = {
        ...formData,
        requiredSkills: skillsArray,
        ctc: parseFloat(formData.ctc),
        openPositions: parseInt(formData.openPositions)
      };

      if (editingDrive) {
        await placementDriveService.updateDrive(editingDrive._id, driveData);
        toast.success('Drive updated successfully');
      } else {
        await placementDriveService.createDrive(driveData);
        toast.success('Drive created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchDrives();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await placementDriveService.deleteDrive(selectedDrive._id);
      toast.success('Drive deleted successfully');
      setShowDeleteModal(false);
      fetchDrives();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete drive');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (drive) => {
    setEditingDrive(drive);
    setFormData({
      companyId: drive.company?._id || drive.company,
      driveTitle: drive.driveTitle,
      driveDate: drive.driveDate?.split('T')[0] || '',
      driveTime: drive.driveTime || '10:00 AM',
      location: drive.location || '',
      mode: drive.mode || 'Online',
      meetingLink: drive.meetingLink || '',
      ctc: drive.ctc || '',
      openPositions: drive.openPositions || '',
      eligibility: drive.eligibility || '',
      requiredSkills: drive.requiredSkills?.join(', ') || '',
      description: drive.description || '',
      status: drive.status || 'Upcoming'
    });
    setShowModal(true);
  };

  const handleView = (drive) => {
    setSelectedDrive(drive);
    setShowViewModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      Upcoming: 'bg-yellow-100 text-yellow-800',
      Ongoing: 'bg-green-100 text-green-800',
      Completed: 'bg-blue-100 text-blue-800',
      Cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      Upcoming: <FaClock />,
      Ongoing: <FaUsers />,
      Completed: <FaCheck />,
      Cancelled: <FaTimes />
    };
    return icons[status] || <FaClock />;
  };

  const getModeIcon = (mode) => {
    return mode === 'Online' ? <FaLaptop /> : <FaLocationArrow />;
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ backgroundColor: `${color}15`, color: color }}>
        {icon}
      </div>
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
        <StatCard title="Total Drives" value={stats.total} icon={<FaCalendarAlt />} color="#2563eb" />
        <StatCard title="Upcoming Drives" value={stats.upcoming} icon={<FaClock />} color="#f59e0b" />
        <StatCard title="Ongoing Drives" value={stats.ongoing} icon={<FaUsers />} color="#22c55e" />
        <StatCard title="Completed Drives" value={stats.completed} icon={<FaCheck />} color="#8b5cf6" />
        <StatCard title="Cancelled" value={stats.cancelled} icon={<FaTimes />} color="#ef4444" />
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2><FaCalendarAlt /> Placement Drive Management</h2>
          <p>Manage all placement drives, registrations, and tracking</p>
        </div>
        <button className={styles.addBtn} onClick={() => { resetForm(); setShowModal(true); }}>
          <FaPlus /> Create Drive
        </button>
      </div>

      {/* Search and Filters */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <FaSearch />
          <input
            type="text"
            placeholder="Search by company or drive title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <button className={styles.clearFiltersBtn} onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
          <FaTimes /> Clear
        </button>
      </div>

      {/* Drives Table */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <FaSpinner className={styles.spinner} /> Loading drives...
          </div>
        ) : drives.length === 0 ? (
          <div className={styles.emptyState}>
            <FaCalendarAlt className={styles.emptyIcon} />
            <h3>No placement drives found</h3>
            <p>Create your first placement drive to get started</p>
            <button className={styles.addBtn} onClick={() => { resetForm(); setShowModal(true); }}>
              <FaPlus /> Create Drive
            </button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Drive Title</th>
                <th>Company</th>
                <th>Date & Time</th>
                <th>Location/Mode</th>
                <th>CTC</th>
                <th>Positions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drives.map(drive => (
                <tr key={drive._id}>
                  <td className={styles.driveTitle}>
                    <strong>{drive.driveTitle}</strong>
                    <small>{drive.eligibility?.substring(0, 50)}...</small>
                  </td>
                  <td>
                    <div className={styles.companyInfo}>
                      <FaBuilding className={styles.companyIcon} />
                      {drive.companyName}
                    </div>
                  </td>
                  <td>
                    <div>{new Date(drive.driveDate).toLocaleDateString()}</div>
                    <small>{drive.driveTime}</small>
                  </td>
                  <td>
                    <div className={styles.modeInfo}>
                      {getModeIcon(drive.mode)}
                      <span>{drive.mode}</span>
                    </div>
                    <small>{drive.location}</small>
                  </td>
                  <td><span className={styles.packageValue}>₹{drive.ctc} LPA</span></td>
                  <td className={styles.textCenter}>{drive.openPositions}</td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(drive.status)}`}>
                      {getStatusIcon(drive.status)} {drive.status}
                    </span>
                  </td>
                  <td className={styles.actionBtns}>
                    <button onClick={() => handleView(drive)} title="View Details">
                      <FaEye />
                    </button>
                    <button onClick={() => handleEdit(drive)} title="Edit Drive">
                      <FaEdit />
                    </button>
                    <button onClick={() => { setSelectedDrive(drive); setShowDeleteModal(true); }} title="Delete">
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

      {/* ==================== CREATE/EDIT DRIVE MODAL ==================== */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                {editingDrive ? <FaEdit /> : <FaPlus />}
                {editingDrive ? 'Edit Placement Drive' : 'Create New Placement Drive'}
              </h3>
              <button onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                {/* Company & Drive Title */}
                <div className={styles.formSection}>
                  <h4><FaBuilding /> Drive Information</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Select Company *</label>
                      <select
                        value={formData.companyId}
                        onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                        required
                      >
                        <option value="">-- Select Company --</option>
                        {companies.map(company => (
                          <option key={company._id} value={company._id}>
                            {company.companyName} - {company.industry}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Drive Title *</label>
                      <input
                        type="text"
                        value={formData.driveTitle}
                        onChange={(e) => setFormData({ ...formData, driveTitle: e.target.value })}
                        placeholder="e.g., Campus Recruitment Drive 2024"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className={styles.formSection}>
                  <h4><FaClock /> Schedule Details</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Drive Date *</label>
                      <input
                        type="date"
                        value={formData.driveDate}
                        onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Drive Time *</label>
                      <input
                        type="time"
                        value={formData.driveTime}
                        onChange={(e) => setFormData({ ...formData, driveTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Mode & Location */}
                <div className={styles.formSection}>
                  <h4><FaMapMarkerAlt /> Venue Details</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Mode *</label>
                      <select
                        value={formData.mode}
                        onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                      >
                        <option value="Online">Online (Virtual)</option>
                        <option value="Offline">Offline (Physical)</option>
                        <option value="Hybrid">Hybrid (Both)</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Location / Venue *</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder={formData.mode === 'Online' ? 'Virtual Platform Name' : 'Company Address / Venue'}
                        required
                      />
                    </div>
                  </div>
                  {formData.mode === 'Online' && (
                    <div className={styles.formGroup}>
                      <label><FaLink /> Meeting Link</label>
                      <input
                        type="url"
                        value={formData.meetingLink}
                        onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                        placeholder="https://meet.google.com/..."
                      />
                    </div>
                  )}
                </div>

                {/* Compensation */}
                <div className={styles.formSection}>
                  <h4><FaRupeeSign /> Compensation & Requirements</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>CTC (LPA) *</label>
                      <input
                        type="number"
                        value={formData.ctc}
                        onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
                        step="0.5"
                        placeholder="e.g., 12.5"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Open Positions *</label>
                      <input
                        type="number"
                        value={formData.openPositions}
                        onChange={(e) => setFormData({ ...formData, openPositions: e.target.value })}
                        min="1"
                        placeholder="Number of vacancies"
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Eligibility Criteria *</label>
                    <textarea
                      rows="2"
                      value={formData.eligibility}
                      onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                      placeholder="e.g., 60% throughout, No backlogs, B.Tech CSE/IT only"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Required Skills (comma separated)</label>
                    <input
                      type="text"
                      value={formData.requiredSkills}
                      onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                      placeholder="Java, Python, React, SQL, AWS"
                    />
                  </div>
                </div>

                {/* Description & Status */}
                <div className={styles.formSection}>
                  <h4><FaInfoCircle /> Additional Information</h4>
                  <div className={styles.formGroup}>
                    <label>Description / Additional Info</label>
                    <textarea
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Any additional information about the drive, selection process, etc."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Drive Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={loading}>
                  {loading ? <FaSpinner className={styles.spinner} /> : <FaCheck />}
                  {editingDrive ? 'Update Drive' : 'Create Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== VIEW DRIVE MODAL ==================== */}
      {showViewModal && selectedDrive && (
        <div className={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
          <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FaEye /> Placement Drive Details</h3>
              <button onClick={() => setShowViewModal(false)}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
              {/* Drive Basic Information */}
              <div className={styles.viewSection}>
                <h4><FaCalendarAlt /> Drive Information</h4>
                <div className={styles.viewRow}>
                  <span>Drive Title:</span>
                  <strong>{selectedDrive.driveTitle}</strong>
                </div>
                <div className={styles.viewRow}>
                  <span>Company:</span>
                  <div className={styles.companyInfo}>
                    <FaBuilding className={styles.companyIcon} />
                    <span>{selectedDrive.companyName}</span>
                  </div>
                </div>
                <div className={styles.viewRow}>
                  <span>Date & Time:</span>
                  <span>
                    <FaClock className={styles.rowIcon} />
                    {new Date(selectedDrive.driveDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })} at {selectedDrive.driveTime}
                  </span>
                </div>
                <div className={styles.viewRow}>
                  <span>Mode:</span>
                  <span>
                    {getModeIcon(selectedDrive.mode)} {selectedDrive.mode}
                  </span>
                </div>
                <div className={styles.viewRow}>
                  <span>Location/Venue:</span>
                  <span>
                    <FaMapMarkerAlt className={styles.rowIcon} /> {selectedDrive.location}
                  </span>
                </div>
                {selectedDrive.mode === 'Online' && selectedDrive.meetingLink && (
                  <div className={styles.viewRow}>
                    <span>Meeting Link:</span>
                    <a href={selectedDrive.meetingLink} target="_blank" rel="noopener noreferrer">
                      <FaLink className={styles.rowIcon} /> {selectedDrive.meetingLink}
                    </a>
                  </div>
                )}
              </div>

              {/* Compensation & Requirements */}
              <div className={styles.viewSection}>
                <h4><FaRupeeSign /> Compensation & Requirements</h4>
                <div className={styles.viewRow}>
                  <span>CTC Package:</span>
                  <span className={styles.highlight}>₹{selectedDrive.ctc} LPA</span>
                </div>
                <div className={styles.viewRow}>
                  <span>Open Positions:</span>
                  <span>{selectedDrive.openPositions}</span>
                </div>
                <div className={styles.viewRow}>
                  <span>Eligibility Criteria:</span>
                  <span>{selectedDrive.eligibility}</span>
                </div>
                <div className={styles.viewRow}>
                  <span>Required Skills:</span>
                  <div className={styles.skillsContainer}>
                    {selectedDrive.requiredSkills?.length > 0 ? (
                      selectedDrive.requiredSkills.map((skill, idx) => (
                        <span key={idx} className={styles.skillBadge}>{skill}</span>
                      ))
                    ) : (
                      <span>Not specified</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Statistics */}
              <div className={styles.viewSection}>
                <h4><FaChartLine /> Status & Statistics</h4>
                <div className={styles.viewRow}>
                  <span>Drive Status:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedDrive.status)}`}>
                    {getStatusIcon(selectedDrive.status)} {selectedDrive.status}
                  </span>
                </div>
                <div className={styles.viewRow}>
                  <span>Students Applied:</span>
                  <span>{selectedDrive.studentsApplied || 0}</span>
                </div>
                <div className={styles.viewRow}>
                  <span>Students Selected:</span>
                  <span className={styles.highlight}>{selectedDrive.studentsSelected || 0}</span>
                </div>
                <div className={styles.viewRow}>
                  <span>Students Attended:</span>
                  <span>{selectedDrive.studentsAttended || 0}</span>
                </div>
                <div className={styles.viewRow}>
                  <span>Selection Ratio:</span>
                  <span>
                    {selectedDrive.studentsApplied > 0
                      ? `${((selectedDrive.studentsSelected || 0) / selectedDrive.studentsApplied * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>
              </div>

              {/* Description */}
              {selectedDrive.description && (
                <div className={styles.viewSection}>
                  <h4><FaInfoCircle /> Description / Additional Info</h4>
                  <div className={styles.viewRow}>
                    <span>{selectedDrive.description}</span>
                  </div>
                </div>
              )}

              {/* Created Information */}
              <div className={styles.viewSection}>
                <h4>Creation Information</h4>
                <div className={styles.viewRow}>
                  <span>Created By:</span>
                  <span>{selectedDrive.createdByName || 'N/A'}</span>
                </div>
                <div className={styles.viewRow}>
                  <span>Created Date:</span>
                  <span>{new Date(selectedDrive.createdAt).toLocaleString()}</span>
                </div>
                {selectedDrive.updatedAt && selectedDrive.updatedAt !== selectedDrive.createdAt && (
                  <div className={styles.viewRow}>
                    <span>Last Updated:</span>
                    <span>{new Date(selectedDrive.updatedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowViewModal(false)}>
                Close
              </button>
              <button className={styles.editBtn} onClick={() => { setShowViewModal(false); handleEdit(selectedDrive); }}>
                <FaEdit /> Edit Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {showDeleteModal && selectedDrive && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FaTrash /> Delete Placement Drive</h3>
              <button onClick={() => setShowDeleteModal(false)}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.deleteWarning}>
                <FaTrash className={styles.warningIcon} />
                <p>Are you sure you want to delete <strong>"{selectedDrive.driveTitle}"</strong>?</p>
                <p className={styles.warningText}>This action cannot be undone. All associated data will be permanently removed.</p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className={styles.deleteBtn} onClick={handleDelete} disabled={loading}>
                {loading ? <FaSpinner className={styles.spinner} /> : <FaTrash />} Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementDriveManagement;
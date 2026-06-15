import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  FaBuilding, FaPlus, FaSearch, FaEdit, FaTrash, FaEye,
  FaTimes, FaCheck, FaSpinner, FaDownload, FaUserCircle,
  FaHistory, FaCalendarAlt, FaBriefcase, FaChartLine
} from 'react-icons/fa';
import { companyService } from '../../../../services/companyService';
import styles from './CompaniesManagement.module.css';

const CompaniesManagement = () => {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState({
    total: 0, active: 0, hiring: 0, inactive: 0, closed: 0, totalOpenRoles: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    industry: 'all',
    location: 'all',
    status: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    order: 'desc'
  });

  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    website: '',
    location: '',
    hrName: '',
    phone: '',
    email: '',
    openRoles: 0,
    eligibility: '',
    salaryPackage: 0,
    status: 'Active'
  });

  const industries = ['IT Services', 'Banking', 'Consulting', 'Manufacturing', 'Healthcare', 'E-commerce', 'Education', 'Other'];
  const statuses = ['Active', 'Inactive', 'Hiring', 'Closed'];

  useEffect(() => {
    fetchCompanies();
    fetchStats();
  }, [pagination.page, sortConfig, filters, searchTerm]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await companyService.getCompanies({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        industry: filters.industry,
        location: filters.location,
        status: filters.status,
        sortBy: sortConfig.field,
        sortOrder: sortConfig.order
      });
      
      if (response.data.success) {
        setCompanies(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await companyService.getCompanyStats();
      if (response.data.success) {
        const data = response.data.data;
        setStats({
          total: data.total || 0,
          active: data.stats?.find(s => s._id === 'Active')?.count || 0,
          hiring: data.stats?.find(s => s._id === 'Hiring')?.count || 0,
          inactive: data.stats?.find(s => s._id === 'Inactive')?.count || 0,
          closed: data.stats?.find(s => s._id === 'Closed')?.count || 0,
          totalOpenRoles: data.totalOpenRoles || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCompany) {
        await companyService.updateCompany(editingCompany._id, formData);
        toast.success('Company updated successfully');
      } else {
        await companyService.createCompany(formData);
        toast.success('Company created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchCompanies();
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
      await companyService.deleteCompany(selectedCompany._id);
      toast.success('Company deleted successfully');
      setShowDeleteModal(false);
      fetchCompanies();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete company');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      companyName: company.companyName,
      industry: company.industry,
      website: company.website || '',
      location: company.location,
      hrName: company.hrName,
      phone: company.phone,
      email: company.email,
      openRoles: company.openRoles,
      eligibility: company.eligibility || '',
      salaryPackage: company.salaryPackage,
      status: company.status
    });
    setShowModal(true);
  };

  const handleView = (company) => {
    setSelectedCompany(company);
    setShowViewModal(true);
  };

  const handleViewActivities = async (company) => {
    setSelectedCompany(company);
    setLoading(true);
    try {
      const response = await companyService.getCompanyActivities(company._id);
      setActivities(response.data.data || []);
      setShowActivityModal(true);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activity history');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await companyService.exportCompanies('csv', {
        search: searchTerm,
        industry: filters.industry,
        status: filters.status
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `companies_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export successful');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const resetForm = () => {
    setEditingCompany(null);
    setFormData({
      companyName: '',
      industry: '',
      website: '',
      location: '',
      hrName: '',
      phone: '',
      email: '',
      openRoles: 0,
      eligibility: '',
      salaryPackage: 0,
      status: 'Active'
    });
  };

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      industry: 'all',
      location: 'all',
      status: 'all'
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return styles.statusActive;
      case 'Hiring': return styles.statusHiring;
      case 'Inactive': return styles.statusInactive;
      case 'Closed': return styles.statusClosed;
      default: return '';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Hiring': return 'bg-blue-100 text-blue-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <StatCard title="Total Companies" value={stats.total} icon={<FaBuilding />} color="#2563eb" />
        <StatCard title="Active Companies" value={stats.active} icon={<FaCheck />} color="#22c55e" />
        <StatCard title="Hiring Companies" value={stats.hiring} icon={<FaBriefcase />} color="#3b82f6" />
        <StatCard title="Open Roles" value={stats.totalOpenRoles} icon={<FaChartLine />} color="#8b5cf6" />
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2><FaBuilding /> Companies Management</h2>
          <p>Manage all company partnerships and hiring companies</p>
        </div>
        <div className={styles.headerButtons}>
          <button className={styles.exportBtn} onClick={handleExport}>
            <FaDownload /> Export
          </button>
          <button className={styles.addBtn} onClick={() => { resetForm(); setShowModal(true); }}>
            <FaPlus /> Add Company
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <FaSearch />
          <input
            type="text"
            placeholder="Search by company name, HR name, email or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={filters.industry}
          onChange={(e) => handleFilterChange('industry', e.target.value)}
        >
          <option value="all">All Industries</option>
          {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
        </select>
        <select
          className={styles.filterSelect}
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="all">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className={styles.clearFiltersBtn} onClick={clearFilters}>
          <FaTimes /> Clear Filters
        </button>
      </div>

      {/* Companies Table */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <FaSpinner className={styles.spinner} /> Loading companies...
          </div>
        ) : companies.length === 0 ? (
          <div className={styles.emptyState}>
            <FaBuilding className={styles.emptyIcon} />
            <h3>No companies found</h3>
            <p>Add your first company to get started</p>
            <button className={styles.addBtn} onClick={() => { resetForm(); setShowModal(true); }}>
              <FaPlus /> Add Company
            </button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort('companyName')}>Company Name</th>
                <th onClick={() => handleSort('industry')}>Industry</th>
                <th>HR Contact</th>
                <th>Location</th>
                <th onClick={() => handleSort('openRoles')}>Open Roles</th>
                <th onClick={() => handleSort('salaryPackage')}>Package</th>
                <th onClick={() => handleSort('status')}>Status</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(company => (
                <tr key={company._id}>
                  <td className={styles.companyCell}>
                    <strong>{company.companyName}</strong>
                    <small>{company.email}</small>
                  </td>
                  <td>{company.industry}</td>
                  <td>
                    <div className="text-sm">
                      <div className="font-medium">{company.hrName}</div>
                      <div className="text-gray-500 text-xs">{company.phone}</div>
                    </div>
                  </td>
                  <td>{company.location}</td>
                  <td className={styles.openRoles}>{company.openRoles}</td>
                  <td>₹{company.salaryPackage} LPA</td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(company.status)}`}>
                      {company.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-xs">
                      <FaUserCircle className="text-gray-400" />
                      <div>
                        <div className="font-medium">{company.createdByName || 'N/A'}</div>
                        <div className="text-gray-400 text-xs">{new Date(company.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.actionBtns}>
                    <button className={styles.viewBtn} onClick={() => handleView(company)} title="View Details">
                      <FaEye />
                    </button>
                    <button className={styles.historyBtn} onClick={() => handleViewActivities(company)} title="View History">
                      <FaHistory />
                    </button>
                    <button className={styles.editBtn} onClick={() => handleEdit(company)} title="Edit Company">
                      <FaEdit />
                    </button>
                    <button className={styles.deleteBtn} onClick={() => { setSelectedCompany(company); setShowDeleteModal(true); }} title="Delete Company">
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
          <button
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.pages}</span>
          <button
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingCompany ? 'Edit Company' : 'Add New Company'}</h3>
              <button onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formSection}>
                  <h4>Company Information</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Company Name *</label>
                      <input type="text" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Industry *</label>
                      <select value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})} required>
                        <option value="">Select Industry</option>
                        {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Website</label>
                      <input type="url" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} placeholder="https://" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Location *</label>
                      <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4>HR Information</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>HR Name *</label>
                      <input type="text" value={formData.hrName} onChange={(e) => setFormData({...formData, hrName: e.target.value})} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Phone Number *</label>
                      <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Email Address *</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4>Hiring Information</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Open Roles</label>
                      <input type="number" value={formData.openRoles} onChange={(e) => setFormData({...formData, openRoles: parseInt(e.target.value)})} min="0" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Salary Package (LPA)</label>
                      <input type="number" value={formData.salaryPackage} onChange={(e) => setFormData({...formData, salaryPackage: parseInt(e.target.value)})} min="0" />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Eligibility Criteria</label>
                    <textarea rows="3" value={formData.eligibility} onChange={(e) => setFormData({...formData, eligibility: e.target.value})} placeholder="e.g., 60% throughout, No backlogs" />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={loading}>
                  {loading ? <FaSpinner className={styles.spinner} /> : <FaCheck />}
                  {editingCompany ? 'Update Company' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Company Modal */}
      {showViewModal && selectedCompany && (
        <div className={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FaEye /> Company Details</h3>
              <button onClick={() => setShowViewModal(false)}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.viewSection}>
                <h4>Company Information</h4>
                <div className={styles.viewRow}><span>Company Name:</span><strong>{selectedCompany.companyName}</strong></div>
                <div className={styles.viewRow}><span>Industry:</span>{selectedCompany.industry}</div>
                <div className={styles.viewRow}><span>Website:</span><a href={selectedCompany.website} target="_blank" rel="noopener noreferrer">{selectedCompany.website || 'N/A'}</a></div>
                <div className={styles.viewRow}><span>Location:</span>{selectedCompany.location}</div>
              </div>
              <div className={styles.viewSection}>
                <h4>HR Contact</h4>
                <div className={styles.viewRow}><span>HR Name:</span>{selectedCompany.hrName}</div>
                <div className={styles.viewRow}><span>Phone:</span>{selectedCompany.phone}</div>
                <div className={styles.viewRow}><span>Email:</span>{selectedCompany.email}</div>
              </div>
              <div className={styles.viewSection}>
                <h4>Hiring Details</h4>
                <div className={styles.viewRow}><span>Open Roles:</span>{selectedCompany.openRoles}</div>
                <div className={styles.viewRow}><span>Salary Package:</span>₹{selectedCompany.salaryPackage} LPA</div>
                <div className={styles.viewRow}><span>Eligibility:</span>{selectedCompany.eligibility || 'Not specified'}</div>
                <div className={styles.viewRow}><span>Status:</span><span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(selectedCompany.status)}`}>{selectedCompany.status}</span></div>
                <div className={styles.viewRow}><span>Created By:</span>{selectedCompany.createdByName} ({selectedCompany.createdByEmail})</div>
                <div className={styles.viewRow}><span>Created:</span>{new Date(selectedCompany.createdAt).toLocaleString()}</div>
                {selectedCompany.updatedByName && (
                  <div className={styles.viewRow}><span>Last Updated By:</span>{selectedCompany.updatedByName} ({selectedCompany.updatedByEmail})</div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.closeBtn} onClick={() => setShowViewModal(false)}>Close</button>
              <button className={styles.editBtn} onClick={() => { setShowViewModal(false); handleEdit(selectedCompany); }}>Edit Company</button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      {showActivityModal && selectedCompany && (
        <div className={styles.modalOverlay} onClick={() => setShowActivityModal(false)}>
          <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FaHistory /> Activity Log - {selectedCompany.companyName}</h3>
              <button onClick={() => setShowActivityModal(false)}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaHistory className="text-4xl mx-auto mb-3 text-gray-300" />
                  <p>No activities found for this company</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {activities.map((activity, idx) => (
                    <div key={idx} className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                            activity.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                            activity.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                            activity.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {activity.action}
                          </span>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <strong>By:</strong> {activity.performedBy?.userName} 
                              <span className="text-gray-400 ml-2">({activity.performedBy?.userEmail})</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              <strong>Role:</strong> {activity.performedBy?.userRole || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <FaCalendarAlt />
                            <span>{new Date(activity.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      {activity.changes && Object.keys(activity.changes).length > 0 && (
                        <div className="mt-3 bg-white p-3 rounded border border-gray-200">
                          <p className="font-semibold text-sm mb-2">Changes Made:</p>
                          <div className="space-y-1">
                            {Object.entries(activity.changes).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="font-medium text-gray-700">{key}:</span>{' '}
                                <span className="text-red-600 line-through">{value.old}</span>
                                {' → '}
                                <span className="text-green-600 font-medium">{value.new}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {activity.action === 'DELETE' && activity.changes?.deletedReason && (
                        <div className="mt-2 text-xs text-gray-500">
                          <strong>Reason:</strong> {activity.changes.deletedReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.closeBtn} onClick={() => setShowActivityModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCompany && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FaTrash /> Delete Company</h3>
              <button onClick={() => setShowDeleteModal(false)}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to delete <strong>{selectedCompany.companyName}</strong>?</p>
              <p className={styles.warningText}>This action cannot be undone.</p>
              <div className="mt-3">
                <label className="text-sm text-gray-600">Reason for deletion (optional):</label>
                <input 
                  type="text" 
                  className="w-full mt-1 p-2 border rounded text-sm"
                  placeholder="Enter reason..."
                  id="deleteReason"
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button 
                className={styles.deleteBtn} 
                onClick={() => {
                  const reason = document.getElementById('deleteReason')?.value;
                  handleDelete(reason);
                }} 
                disabled={loading}
              >
                {loading ? <FaSpinner className={styles.spinner} /> : <FaTrash />} Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesManagement;
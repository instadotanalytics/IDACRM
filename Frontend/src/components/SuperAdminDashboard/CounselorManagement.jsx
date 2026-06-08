import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  FaHeadset, FaSearch, FaSpinner, FaEnvelope, FaPhone,
  FaCheckCircle, FaTimesCircle, FaChartLine, FaUserCheck,
  FaEye, FaStar, FaTrophy, FaEdit, FaTrash, FaUserPlus
} from 'react-icons/fa';
import { superAdminAPI } from '../../services/api';
import CounselorDetailsModal from './CounselorDetailsModal';
import styles from './CounselorManagement.module.css';

const CounselorManagement = () => {
  const [loading, setLoading] = useState(true);
  const [counselors, setCounselors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingCounselor, setEditingCounselor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'counseling',
    isActive: true
  });

  const [stats, setStats] = useState({
    totalCounselors: 0,
    activeCounselors: 0,
    totalLeads: 0,
    totalAdmissions: 0,
    avgConversion: 0
  });

  useEffect(() => {
    fetchCounselors();
  }, []);

  const fetchCounselors = async () => {
    setLoading(true);
    try {
      const usersRes = await superAdminAPI.getUsers();
      let allUsers = [];
      
      if (usersRes.data.success) {
        allUsers = usersRes.data.data?.users || usersRes.data.data || [];
      }
      
      const counselorsList = allUsers.filter(user => user.role === 'counselor');
      
      // Fetch performance data
      const [leadsRes, admissionsRes] = await Promise.all([
        superAdminAPI.getLeads ? superAdminAPI.getLeads() : Promise.resolve({ data: { data: [] } }),
        superAdminAPI.getAdmissions ? superAdminAPI.getAdmissions() : Promise.resolve({ data: { data: [] } })
      ]).catch(() => [{ data: { data: [] } }, { data: { data: [] } }]);
      
      const leads = leadsRes?.data?.data || [];
      const admissions = admissionsRes?.data?.data || [];

      const counselorData = counselorsList.map(counselor => {
        const counselorLeads = leads.filter(lead => lead.counselorId === counselor._id);
        const counselorAdmissions = admissions.filter(admission => admission.counselorId === counselor._id);
        
        const totalLeads = counselorLeads.length;
        const totalAdmissions = counselorAdmissions.length;
        const conversionRate = totalLeads > 0 ? ((totalAdmissions / totalLeads) * 100).toFixed(1) : 0;
        
        return {
          ...counselor,
          leads: totalLeads,
          admissions: totalAdmissions,
          conversionRate: conversionRate,
          allLeads: counselorLeads,
          allAdmissions: counselorAdmissions
        };
      });

      counselorData.sort((a, b) => b.admissions - a.admissions);
      setCounselors(counselorData);

      const totalLeads = counselorData.reduce((sum, c) => sum + c.leads, 0);
      const totalAdmissions = counselorData.reduce((sum, c) => sum + c.admissions, 0);
      const avgConversion = totalLeads > 0 ? ((totalAdmissions / totalLeads) * 100).toFixed(1) : 0;

      setStats({
        totalCounselors: counselorData.length,
        activeCounselors: counselorData.filter(c => c.isActive).length,
        totalLeads: totalLeads,
        totalAdmissions: totalAdmissions,
        avgConversion: avgConversion
      });

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch counselors');
    } finally {
      setLoading(false);
    }
  };

  const fetchCounselorPerformance = async (counselor) => {
    setModalLoading(true);
    try {
      const [leadsRes, callsRes, admissionsRes] = await Promise.all([
        superAdminAPI.getLeads ? superAdminAPI.getLeads() : Promise.resolve({ data: { data: [] } }),
        superAdminAPI.getCalls ? superAdminAPI.getCalls() : Promise.resolve({ data: { data: [] } }),
        superAdminAPI.getAdmissions ? superAdminAPI.getAdmissions() : Promise.resolve({ data: { data: [] } })
      ]).catch(() => [{ data: { data: [] } }, { data: { data: [] } }, { data: { data: [] } }]);
      
      const leads = leadsRes?.data?.data || [];
      const calls = callsRes?.data?.data || [];
      const admissions = admissionsRes?.data?.data || [];
      
      const counselorLeads = leads.filter(lead => lead.counselorId === counselor._id);
      const counselorCalls = calls.filter(call => call.counselorId === counselor._id);
      const counselorAdmissions = admissions.filter(admission => admission.counselorId === counselor._id);
      
      setPerformanceData({
        totalLeads: counselorLeads.length,
        totalCalls: counselorCalls.length,
        connectedCalls: counselorCalls.filter(c => c.status === 'Connected').length,
        totalAdmissions: counselorAdmissions.length,
        conversionRate: counselorLeads.length > 0 ? ((counselorAdmissions.length / counselorLeads.length) * 100).toFixed(1) : 0,
        recentLeads: counselorLeads.slice(0, 5),
        recentAdmissions: counselorAdmissions.slice(0, 5)
      });
      
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCounselorClick = async (counselor) => {
    setSelectedCounselor(counselor);
    setShowDetailsModal(true);
    await fetchCounselorPerformance(counselor);
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'C';
  };

  const getStatusBadge = (isActive) => {
    return isActive ? 
      <span className={styles.statusActive}><FaCheckCircle /> Active</span> : 
      <span className={styles.statusInactive}><FaTimesCircle /> Inactive</span>;
  };

  const getPerformanceBadge = (admissions) => {
    if (admissions >= 10) return <span className={styles.badgeGold}><FaTrophy /> Top</span>;
    if (admissions >= 5) return <span className={styles.badgeSilver}><FaStar /> Good</span>;
    return <span className={styles.badgeBronze}>Active</span>;
  };

  const filteredCounselors = counselors.filter(counselor => {
    const matchesSearch = counselor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          counselor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && counselor.isActive) ||
                          (statusFilter === 'inactive' && !counselor.isActive);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} /> Loading counselors...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2><FaHeadset /> Counselor Management</h2>
          <p>View all counselors and their performance</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <FaSearch />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Counselors</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Stats */}
      {counselors.length > 0 && (
        <div className={styles.overviewStats}>
          <div className={styles.overviewCard}>
            <FaHeadset /><div><h3>{stats.totalCounselors}</h3><p>Total</p></div>
          </div>
          <div className={styles.overviewCard}>
            <FaUserCheck /><div><h3>{stats.activeCounselors}</h3><p>Active</p></div>
          </div>
          <div className={styles.overviewCard}>
            <FaChartLine /><div><h3>{stats.totalAdmissions}</h3><p>Admissions</p></div>
          </div>
          <div className={styles.overviewCard}>
            <FaChartLine /><div><h3>{stats.avgConversion}%</h3><p>Conversion</p></div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      {filteredCounselors.length === 0 ? (
        <div className={styles.emptyState}>
          <FaHeadset size={50} />
          <h3>No counselors found</h3>
        </div>
      ) : (
        <div className={styles.counselorsGrid}>
          {filteredCounselors.map(counselor => (
            <div key={counselor._id} className={styles.counselorCard} onClick={() => handleCounselorClick(counselor)}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>{getInitials(counselor.name)}</div>
                <div className={styles.cardStatus}>{getPerformanceBadge(counselor.admissions)}</div>
              </div>
              
              <div className={styles.cardBody}>
                <h3>{counselor.name}</h3>
                <p><FaEnvelope /> {counselor.email}</p>
                <p><FaPhone /> {counselor.phone || 'Not provided'}</p>
              </div>
              
              <div className={styles.cardStats}>
                <div className={styles.stat}><span>{counselor.leads}</span><label>Leads</label></div>
                <div className={styles.stat}><span>{counselor.admissions}</span><label>Admissions</label></div>
                <div className={styles.stat}><span>{counselor.conversionRate}%</span><label>Conversion</label></div>
              </div>
              
              <div className={styles.cardFooter}>
                {getStatusBadge(counselor.isActive)}
                <button className={styles.viewBtn}><FaEye /> Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedCounselor && (
        <CounselorDetailsModal
          counselor={selectedCounselor}
          performance={performanceData}
          loading={modalLoading}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};

export default CounselorManagement;
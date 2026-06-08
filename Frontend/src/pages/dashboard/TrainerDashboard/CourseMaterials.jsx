import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch,
  FaSpinner, FaTimes, FaCheck, FaCalendarAlt,
  FaClock, FaUserGraduate, FaBookOpen, FaFileAlt,
  FaVideo, FaFilePdf, FaLink, FaDownload,
  FaUpload, FaCloudUploadAlt, FaChalkboardTeacher
} from 'react-icons/fa';
import api from '../../../services/api';
import styles from './CourseMaterials.module.css';

const CourseMaterials = () => {
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [groupedMaterials, setGroupedMaterials] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [file, setFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf',
    course: '',
    batchId: '',
    topic: '',
    externalLink: '',
    duration: ''
  });

  const materialTypes = [
    { value: 'video', label: '🎬 Video', icon: FaVideo, color: '#6366f1' },
    { value: 'pdf', label: '📄 PDF', icon: FaFilePdf, color: '#ef4444' },
    { value: 'document', label: '📝 Document', icon: FaFileAlt, color: '#10b981' },
    { value: 'presentation', label: '📊 Presentation', icon: FaFileAlt, color: '#f59e0b' },
    { value: 'link', label: '🔗 External Link', icon: FaLink, color: '#8b5cf6' },
    { value: 'assignment', label: '✏️ Assignment', icon: FaBookOpen, color: '#ec489a' }
  ];

  // Fetch trainer's batches
  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await api.get('/batches/trainer/assigned');
      if (response.data.success) {
        setBatches(response.data.data);
      } else {
        const allBatchesRes = await api.get('/batches');
        if (allBatchesRes.data.success) {
          const user = JSON.parse(localStorage.getItem('user'));
          const trainerBatches = allBatchesRes.data.data.filter(
            batch => batch.trainerId?._id === user?._id || batch.trainerId === user?._id
          );
          setBatches(trainerBatches);
        }
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  };

  // Fetch materials for selected batch
  const fetchMaterials = async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const response = await api.get('/course-materials', {
        params: { batchId: selectedBatch._id }
      });
      if (response.data.success) {
        setMaterials(response.data.data);
        
        // Group by type
        const grouped = {
          videos: response.data.data.filter(m => m.type === 'video'),
          pdfs: response.data.data.filter(m => m.type === 'pdf'),
          documents: response.data.data.filter(m => m.type === 'document'),
          presentations: response.data.data.filter(m => m.type === 'presentation'),
          links: response.data.data.filter(m => m.type === 'link'),
          assignments: response.data.data.filter(m => m.type === 'assignment')
        };
        setGroupedMaterials(grouped);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchMaterials();
      setFormData({ ...formData, course: selectedBatch.course, batchId: selectedBatch._id });
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
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setFile(selectedFile);
      toast.success(`File selected: ${selectedFile.name}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.type || !formData.course) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.type !== 'link' && !file) {
      toast.error('Please upload a file');
      return;
    }

    if (formData.type === 'link' && !formData.externalLink) {
      toast.error('Please enter external link URL');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description || '');
      submitData.append('type', formData.type);
      submitData.append('course', formData.course);
      submitData.append('batchId', selectedBatch._id);
      submitData.append('topic', formData.topic || '');
      submitData.append('duration', formData.duration || '');
      
      if (formData.type === 'link') {
        submitData.append('externalLink', formData.externalLink);
      } else if (file) {
        submitData.append('file', file);
      }

      let response;
      if (editingMaterial) {
        response = await api.put(`/course-materials/${editingMaterial._id}`, submitData);
        toast.success('Material updated successfully');
      } else {
        response = await api.post('/course-materials', submitData);
        toast.success('Material added successfully');
      }

      if (response.data.success) {
        setShowModal(false);
        setEditingMaterial(null);
        setFile(null);
        setFormData({
          title: '',
          description: '',
          type: 'pdf',
          course: selectedBatch.course,
          batchId: selectedBatch._id,
          topic: '',
          externalLink: '',
          duration: ''
        });
        fetchMaterials();
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete "${title}"? This action cannot be undone.`)) {
      setLoading(true);
      try {
        const response = await api.delete(`/course-materials/${id}`);
        if (response.data.success) {
          toast.success('Material deleted successfully');
          fetchMaterials();
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Delete failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      description: material.description || '',
      type: material.type,
      course: material.course,
      batchId: material.batchId,
      topic: material.topic || '',
      externalLink: material.externalLink || '',
      duration: material.duration || ''
    });
    setFile(null);
    setShowModal(true);
  };

  const getTypeIcon = (type) => {
    const found = materialTypes.find(t => t.value === type);
    if (found) {
      const Icon = found.icon;
      return <Icon style={{ color: found.color }} />;
    }
    return <FaFileAlt />;
  };

  const getTypeLabel = (type) => {
    const found = materialTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  const filteredMaterials = materials.filter(material =>
    material.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.topic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const typeFilteredMaterials = filterType === 'all' 
    ? filteredMaterials 
    : filteredMaterials.filter(m => m.type === filterType);

  // Batch Selection View
  if (!selectedBatch) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2><FaBookOpen /> Course Materials</h2>
          <p>Select a batch to manage course materials</p>
        </div>
        <div className={styles.batchesGrid}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <FaSpinner className={styles.spinner} /> Loading batches...
            </div>
          ) : batches.length === 0 ? (
            <div className={styles.emptyContainer}>
              <div className={styles.emptyIcon}>📚</div>
              <h3>No batches assigned</h3>
              <p>You don't have any batches assigned yet.</p>
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
                    <span><FaUserGraduate /> {batch.studentsCount || 0} Students</span>
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
        </div>
        <div className={styles.batchStats}>
          <span><FaBookOpen /> {materials.length} Materials</span>
          <button className={styles.createBtn} onClick={() => setShowModal(true)}>
            <FaPlus /> Add Material
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <FaSearch />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="video">🎬 Videos</option>
          <option value="pdf">📄 PDFs</option>
          <option value="document">📝 Documents</option>
          <option value="presentation">📊 Presentations</option>
          <option value="link">🔗 Links</option>
          <option value="assignment">✏️ Assignments</option>
        </select>
      </div>

      {/* Materials Grid */}
      <div className={styles.materialsGrid}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <FaSpinner className={styles.spinner} /> Loading materials...
          </div>
        ) : typeFilteredMaterials.length === 0 ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIcon}>📚</div>
            <h3>No materials found</h3>
            <p>Add your first course material for this batch</p>
            <button className={styles.createFirstBtn} onClick={() => setShowModal(true)}>
              Add Material
            </button>
          </div>
        ) : (
          typeFilteredMaterials.map(material => (
            <div key={material._id} className={styles.materialCard}>
              <div className={styles.materialHeader}>
                <div className={styles.materialType}>
                  {getTypeIcon(material.type)}
                  <span>{getTypeLabel(material.type)}</span>
                </div>
                <div className={styles.materialActions}>
                  <button onClick={() => handleEdit(material)}><FaEdit /></button>
                  <button onClick={() => handleDelete(material._id, material.title)}><FaTrash /></button>
                </div>
              </div>
              <div className={styles.materialContent}>
                <h3>{material.title}</h3>
                {material.topic && <p className={styles.topic}>📌 {material.topic}</p>}
                {material.description && <p className={styles.description}>{material.description}</p>}
                {material.duration && <p className={styles.duration}>⏱️ Duration: {material.duration}</p>}
                {material.size && <p className={styles.size}>📦 Size: {material.size}</p>}
              </div>
              <div className={styles.materialFooter}>
                {material.fileUrl && (
                  <a href={material.fileUrl} target="_blank" rel="noopener noreferrer" className={styles.downloadBtn}>
                    <FaDownload /> Download
                  </a>
                )}
                {material.externalLink && (
                  <a href={material.externalLink} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                    <FaLink /> Open Link
                  </a>
                )}
                <span className={styles.date}>
                  Added: {new Date(material.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingMaterial ? 'Edit Material' : 'Add New Material'}</h3>
              <button onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Type *</label>
                    <select name="type" value={formData.type} onChange={handleChange} required>
                      {materialTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Topic</label>
                    <input type="text" name="topic" value={formData.topic} onChange={handleChange} placeholder="e.g., Chapter 1, Introduction" />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea name="description" rows="3" value={formData.description} onChange={handleChange} />
                </div>

                {formData.type === 'link' ? (
                  <div className={styles.formGroup}>
                    <label>External Link URL *</label>
                    <input type="url" name="externalLink" value={formData.externalLink} onChange={handleChange} placeholder="https://..." required />
                  </div>
                ) : (
                  <div className={styles.formGroup}>
                    <label>Upload File</label>
                    <div className={styles.fileUpload}>
                      <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="file" className={styles.fileLabel}>
                        <FaCloudUploadAlt />
                        {file ? file.name : 'Click to upload file (Max 50MB)'}
                      </label>
                      {file && (
                        <button type="button" onClick={() => setFile(null)} className={styles.removeFile}>
                          <FaTimes /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Duration (optional)</label>
                    <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 45 mins, 2 hours" />
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={loading}>
                  {loading ? <FaSpinner className={styles.spinner} /> : <FaCheck />}
                  {editingMaterial ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseMaterials;
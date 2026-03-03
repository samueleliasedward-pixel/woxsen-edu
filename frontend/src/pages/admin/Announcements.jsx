import React, { useState, useEffect } from 'react';
import { 
  Megaphone, Plus, Edit, Trash2, Eye, 
  Calendar, Clock, Users, Filter, Download,
  Bell, Pin, Star, CheckCircle, XCircle,
  AlertCircle, RefreshCw, MoreVertical
} from 'lucide-react';
import { announcementApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import './Announcements.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [selectedTarget, setSelectedTarget] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target: 'all',
    priority: 'medium',
    pinned: false,
    expiresAt: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedTarget, selectedStatus]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        target: selectedTarget !== 'all' ? selectedTarget : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined
      };
      
      const response = await announcementApi.getAnnouncements(params);
      
      let announcementsData = [];
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        announcementsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        announcementsData = response.data;
      } else if (response.data?.announcements && Array.isArray(response.data.announcements)) {
        announcementsData = response.data.announcements;
      }
      
      setAnnouncements(announcementsData);
      
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
      setError(err.response?.data?.message || 'Failed to load announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await announcementApi.createAnnouncement(formData);
      setShowAddModal(false);
      resetForm();
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to add announcement:', err);
      alert('Failed to add announcement: ' + err.message);
    }
  };

  const handleEditAnnouncement = async (e) => {
    e.preventDefault();
    if (!selectedAnnouncement) return;
    
    try {
      await announcementApi.updateAnnouncement(selectedAnnouncement.id, formData);
      setShowEditModal(false);
      resetForm();
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to update announcement:', err);
      alert('Failed to update announcement: ' + err.message);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      await announcementApi.deleteAnnouncement(id);
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to delete announcement:', err);
      alert('Failed to delete announcement');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      target: 'all',
      priority: 'medium',
      pinned: false,
      expiresAt: ''
    });
    setSelectedAnnouncement(null);
  };

  const openEditModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      target: announcement.target || 'all',
      priority: announcement.priority || 'medium',
      pinned: announcement.pinned || false,
      expiresAt: announcement.expiresAt ? announcement.expiresAt.split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowViewModal(true);
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'high': return <AlertCircle size={16} className="priority-high" />;
      case 'medium': return <Bell size={16} className="priority-medium" />;
      case 'low': return <CheckCircle size={16} className="priority-low" />;
      default: return <Bell size={16} />;
    }
  };

  const getTargetLabel = (target) => {
    switch(target) {
      case 'all': return 'Everyone';
      case 'students': return 'Students';
      case 'faculty': return 'Faculty';
      case 'admin': return 'Admin';
      default: return target;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="announcements-page">
      <div className="page-header">
        <div>
          <h1>Announcements</h1>
          <p>Create and manage announcements for students, faculty, and staff</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" size="sm" icon={Download}>
            Export
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddModal(true)}>
            New Announcement
          </Button>
        </div>
      </div>

      <div className="announcements-controls">
        <div className="filter-controls">
          <select 
            className="target-filter"
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
          >
            <option value="all">All Audiences</option>
            <option value="students">Students Only</option>
            <option value="faculty">Faculty Only</option>
            <option value="admin">Admin Only</option>
          </select>

          <select 
            className="status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>

          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchAnnouncements}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="announcements-grid">
        {announcements.length === 0 ? (
          <div className="empty-state">
            <Megaphone size={64} />
            <h3>No announcements found</h3>
            <p>Get started by creating your first announcement</p>
            <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
              Create Announcement
            </Button>
          </div>
        ) : (
          announcements.map(announcement => (
            <Card key={announcement.id} className={`announcement-card ${announcement.pinned ? 'pinned' : ''}`}>
              {announcement.pinned && (
                <div className="pinned-badge">
                  <Pin size={14} />
                  Pinned
                </div>
              )}
              
              <div className="announcement-header">
                <div className="announcement-meta">
                  {getPriorityIcon(announcement.priority)}
                  <span className="announcement-target">
                    <Users size={14} />
                    {getTargetLabel(announcement.target)}
                  </span>
                </div>
                <div className="announcement-actions">
                  <button className="action-btn" onClick={() => openViewModal(announcement)}>
                    <Eye size={16} />
                  </button>
                  <button className="action-btn" onClick={() => openEditModal(announcement)}>
                    <Edit size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="announcement-title">{announcement.title}</h3>
              <p className="announcement-content">{announcement.content}</p>

              <div className="announcement-footer">
                <div className="announcement-time">
                  <Clock size={14} />
                  <span>{getTimeAgo(announcement.createdAt)}</span>
                </div>
                {announcement.expiresAt && (
                  <div className="announcement-expiry">
                    <Calendar size={14} />
                    <span>Expires {formatDate(announcement.expiresAt)}</span>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Announcement Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Create Announcement"
        size="lg"
      >
        <form onSubmit={handleAddAnnouncement} className="announcement-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Holiday on Friday"
              required
            />
          </div>

          <div className="form-group">
            <label>Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Write your announcement here..."
              rows="5"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Target Audience</label>
              <select
                value={formData.target}
                onChange={(e) => setFormData({...formData, target: e.target.value})}
              >
                <option value="all">Everyone</option>
                <option value="students">Students Only</option>
                <option value="faculty">Faculty Only</option>
                <option value="admin">Admin Only</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date (Optional)</label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({...formData, pinned: e.target.checked})}
                />
                Pin this announcement
              </label>
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Announcement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Announcement Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Announcement"
        size="lg"
      >
        <form onSubmit={handleEditAnnouncement} className="announcement-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows="5"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Target Audience</label>
              <select
                value={formData.target}
                onChange={(e) => setFormData({...formData, target: e.target.value})}
              >
                <option value="all">Everyone</option>
                <option value="students">Students Only</option>
                <option value="faculty">Faculty Only</option>
                <option value="admin">Admin Only</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date (Optional)</label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
              />
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({...formData, pinned: e.target.checked})}
                />
                Pin this announcement
              </label>
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => {
              setShowEditModal(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Announcement
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Announcement Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAnnouncement(null);
        }}
        title="Announcement Details"
        size="md"
      >
        {selectedAnnouncement && (
          <div className="view-announcement">
            <div className="view-header">
              <h2>{selectedAnnouncement.title}</h2>
              <div className="view-meta">
                <span className={`priority-badge ${selectedAnnouncement.priority}`}>
                  {selectedAnnouncement.priority} priority
                </span>
                <span className="target-badge">
                  <Users size={14} />
                  {getTargetLabel(selectedAnnouncement.target)}
                </span>
              </div>
            </div>

            <div className="view-content">
              <p>{selectedAnnouncement.content}</p>
            </div>

            <div className="view-footer">
              <div className="view-times">
                <div className="time-item">
                  <Clock size={14} />
                  <span>Posted: {formatDate(selectedAnnouncement.createdAt)}</span>
                </div>
                {selectedAnnouncement.expiresAt && (
                  <div className="time-item">
                    <Calendar size={14} />
                    <span>Expires: {formatDate(selectedAnnouncement.expiresAt)}</span>
                  </div>
                )}
              </div>
              {selectedAnnouncement.pinned && (
                <div className="pinned-indicator">
                  <Pin size={14} />
                  <span>Pinned</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Announcements;
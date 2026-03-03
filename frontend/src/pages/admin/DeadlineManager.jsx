import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Filter, Plus, Edit, Trash2, 
  CheckCircle, XCircle, AlertCircle, Download,
  Upload, RefreshCw, ChevronLeft, ChevronRight,
  Bell, FileText, BookOpen, Users
} from 'lucide-react';
import { adminApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import './DeadlineManager.css';

const DeadlineManager = () => {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('march');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'assignment',
    course: '',
    description: '',
    dueDate: '',
    dueTime: '23:59',
    submissions: 0,
    totalStudents: 0,
    status: 'active',
    priority: 'medium'
  });

  useEffect(() => {
    fetchDeadlines();
  }, [selectedType, selectedStatus, selectedMonth]);

  const fetchDeadlines = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        type: selectedType !== 'all' ? selectedType : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        month: selectedMonth !== 'all' ? selectedMonth : undefined
      };
      
      const response = await adminApi.getDeadlines(params);
      
      if (response.data?.success && response.data?.data) {
        setDeadlines(response.data.data);
      } else {
        setDeadlines([]);
      }
      
    } catch (err) {
      console.error('Failed to fetch deadlines:', err);
      setError(err.response?.data?.message || 'Failed to load deadlines');
      setDeadlines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeadline = async (e) => {
    e.preventDefault();
    try {
      const deadlineData = {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
        submissions: parseInt(formData.submissions),
        totalStudents: parseInt(formData.totalStudents)
      };
      
      await adminApi.createDeadline(deadlineData);
      
      setShowAddModal(false);
      resetForm();
      fetchDeadlines();
    } catch (err) {
      console.error('Failed to add deadline:', err);
      alert('Failed to add deadline: ' + err.message);
    }
  };

  const handleEditDeadline = async (e) => {
    e.preventDefault();
    if (!selectedDeadline) return;
    
    try {
      const deadlineData = {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
        submissions: parseInt(formData.submissions),
        totalStudents: parseInt(formData.totalStudents)
      };
      
      await adminApi.updateDeadline(selectedDeadline.id, deadlineData);
      
      setShowEditModal(false);
      resetForm();
      fetchDeadlines();
    } catch (err) {
      console.error('Failed to update deadline:', err);
      alert('Failed to update deadline: ' + err.message);
    }
  };

  const handleDeleteDeadline = async (id) => {
    if (!window.confirm('Are you sure you want to delete this deadline?')) return;
    
    try {
      await adminApi.deleteDeadline(id);
      fetchDeadlines();
    } catch (err) {
      console.error('Failed to delete deadline:', err);
      alert('Failed to delete deadline');
    }
  };

  const calculateDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'assignment',
      course: '',
      description: '',
      dueDate: '',
      dueTime: '23:59',
      submissions: 0,
      totalStudents: 0,
      status: 'active',
      priority: 'medium'
    });
    setSelectedDeadline(null);
  };

  const openEditModal = (deadline) => {
    setSelectedDeadline(deadline);
    setFormData({
      title: deadline.title,
      type: deadline.type,
      course: deadline.course,
      description: deadline.description || '',
      dueDate: deadline.dueDate.split('T')[0],
      dueTime: deadline.dueTime || '23:59',
      submissions: deadline.submissions || 0,
      totalStudents: deadline.totalStudents || 0,
      status: deadline.status,
      priority: deadline.priority || 'medium'
    });
    setShowEditModal(true);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <Clock size={16} className="status-icon active" />;
      case 'upcoming': return <Calendar size={16} className="status-icon upcoming" />;
      case 'completed': return <CheckCircle size={16} className="status-icon completed" />;
      case 'overdue': return <AlertCircle size={16} className="status-icon overdue" />;
      default: return <Clock size={16} />;
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'assignment': return <FileText size={16} />;
      case 'exam': return <BookOpen size={16} />;
      case 'project': return <Users size={16} />;
      case 'quiz': return <Clock size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const getDaysLeftText = (daysLeft) => {
    if (daysLeft < 0) return `${Math.abs(daysLeft)} days overdue`;
    if (daysLeft === 0) return 'Due today';
    if (daysLeft === 1) return '1 day left';
    return `${daysLeft} days left`;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>Loading deadlines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="deadline-manager">
      <div className="page-header">
        <div>
          <h1>Deadline Manager</h1>
          <p>Manage assignments, exams, and important dates</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" size="sm" icon={Download}>
            Export
          </Button>
          <Button variant="outline" size="sm" icon={Upload}>
            Import
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddModal(true)}>
            Add Deadline
          </Button>
        </div>
      </div>

      <div className="deadline-controls">
        <div className="month-navigation">
          <button className="nav-btn" onClick={() => setSelectedMonth('previous')}>
            <ChevronLeft size={18} />
          </button>
          <span className="current-month">March 2026</span>
          <button className="nav-btn" onClick={() => setSelectedMonth('next')}>
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="filter-controls">
          <select 
            className="type-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Deadlines</option>
            <option value="assignment">Assignments</option>
            <option value="exam">Exams</option>
            <option value="project">Projects</option>
            <option value="quiz">Quizzes</option>
          </select>

          <select 
            className="status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>

          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchDeadlines}>
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

      <div className="deadlines-grid">
        {deadlines.length === 0 ? (
          <div className="empty-state">
            <Calendar size={64} />
            <h3>No deadlines found</h3>
            <p>Get started by adding your first deadline</p>
            <div className="empty-actions">
              <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
                Add Deadline
              </Button>
              <Button variant="outline" icon={RefreshCw} onClick={fetchDeadlines}>
                Refresh
              </Button>
            </div>
          </div>
        ) : (
          deadlines.map(deadline => (
            <Card key={deadline.id} className={`deadline-card ${deadline.status} ${getPriorityClass(deadline.priority)}`}>
              <div className="deadline-header">
                <div className="deadline-type">
                  {getTypeIcon(deadline.type)}
                  <span className="type-label">{deadline.type}</span>
                </div>
                <div className="deadline-status">
                  {getStatusIcon(deadline.status)}
                  <span className="status-label">{deadline.status}</span>
                </div>
              </div>

              <h3 className="deadline-title">{deadline.title}</h3>
              <p className="deadline-course">{deadline.course}</p>

              <div className="deadline-datetime">
                <Calendar size={14} />
                <span>{new Date(deadline.dueDate).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}</span>
                <Clock size={14} style={{ marginLeft: '12px' }} />
                <span>{deadline.dueTime}</span>
              </div>

              <div className="deadline-progress">
                <div className="progress-info">
                  <span>Submissions</span>
                  <span>{deadline.submissions}/{deadline.totalStudents}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${(deadline.submissions / deadline.totalStudents) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="deadline-footer">
                <span className={`days-left ${deadline.daysLeft < 0 ? 'overdue' : ''}`}>
                  <AlertCircle size={14} />
                  {getDaysLeftText(deadline.daysLeft)}
                </span>
                <div className="deadline-actions">
                  <button 
                    className="action-btn edit" 
                    title="Edit"
                    onClick={() => openEditModal(deadline)}
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    className="action-btn delete" 
                    title="Delete"
                    onClick={() => handleDeleteDeadline(deadline.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Deadline Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add Deadline"
        size="lg"
      >
        <form onSubmit={handleAddDeadline} className="deadline-form">
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., ML Assignment 3"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                required
              >
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
                <option value="project">Project</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>
            <div className="form-group">
              <label>Course *</label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
                placeholder="e.g., Machine Learning"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Due Date *</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Due Time</label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData({...formData, dueTime: e.target.value})}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                placeholder="Additional details..."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Total Students</label>
              <input
                type="number"
                value={formData.totalStudents}
                onChange={(e) => setFormData({...formData, totalStudents: parseInt(e.target.value)})}
                min="0"
              />
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
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Deadline
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Deadline Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Deadline"
        size="lg"
      >
        <form onSubmit={handleEditDeadline} className="deadline-form">
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                required
              >
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
                <option value="project">Project</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>
            <div className="form-group">
              <label>Course *</label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Due Date *</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Due Time</label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData({...formData, dueTime: e.target.value})}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Total Students</label>
              <input
                type="number"
                value={formData.totalStudents}
                onChange={(e) => setFormData({...formData, totalStudents: parseInt(e.target.value)})}
                min="0"
              />
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
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
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
              Update Deadline
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DeadlineManager;
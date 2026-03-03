import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Filter, Calendar,
  Clock, Users, Edit, Trash2, Eye, Download,
  CheckCircle, XCircle, AlertCircle, MoreVertical,
  BookOpen, Award
} from 'lucide-react';
import { facultyApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import './FacultyAssignments.css';

const FacultyAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [courses, setCourses] = useState([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    dueTime: '23:59',
    totalPoints: 100
  });

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await facultyApi.getAssignments();
      
      let assignmentsData = [];
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        assignmentsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        assignmentsData = response.data;
      } else if (response.data?.assignments && Array.isArray(response.data.assignments)) {
        assignmentsData = response.data.assignments;
      }
      
      setAssignments(assignmentsData);
      
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await facultyApi.getCourses();
      let coursesData = [];
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        coursesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        coursesData = response.data;
      }
      
      setCourses(coursesData);
      
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      const dueDateTime = `${formData.dueDate}T${formData.dueTime}:00`;
      
      const assignmentData = {
        ...formData,
        dueDate: dueDateTime
      };
      
      await facultyApi.createAssignment(assignmentData);
      
      setShowAddModal(false);
      resetForm();
      fetchAssignments();
      
    } catch (err) {
      console.error('Failed to create assignment:', err);
      alert('Failed to create assignment');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      courseId: '',
      dueDate: '',
      dueTime: '23:59',
      totalPoints: 100
    });
    setSelectedAssignment(null);
  };

  const getStatusBadge = (dueDate) => {
    if (!dueDate) return { text: 'Draft', class: 'draft', icon: FileText };
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', class: 'overdue', icon: XCircle };
    if (diffDays <= 2) return { text: 'Urgent', class: 'urgent', icon: AlertCircle };
    if (diffDays <= 7) return { text: 'Soon', class: 'soon', icon: Clock };
    return { text: 'Active', class: 'active', icon: CheckCircle };
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || a.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-assignments">
      <div className="page-header">
        <div>
          <h1>Assignments</h1>
          <p>Create and manage assignments for your courses</p>
        </div>
        <div className="header-actions">
          <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
            New Assignment
          </Button>
        </div>
      </div>

      <Card className="assignments-card">
        <div className="assignments-controls">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className="course-filter"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>

          <Button variant="outline" icon={Filter}>Filter</Button>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {filteredAssignments.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} />
            <h3>No assignments found</h3>
            <p>
              {assignments.length === 0 
                ? "You haven't created any assignments yet" 
                : "No assignments match your filters"}
            </p>
            {assignments.length === 0 && (
              <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
                Create Your First Assignment
              </Button>
            )}
          </div>
        ) : (
          <div className="assignments-list">
            {filteredAssignments.map(assignment => {
              const status = getStatusBadge(assignment.dueDate);
              const StatusIcon = status.icon;
              
              return (
                <Card key={assignment.id} className="assignment-card">
                  <div className="assignment-header">
                    <div className="assignment-course">
                      <BookOpen size={16} />
                      <span>{assignment.courseName || assignment.course?.name || 'Course'}</span>
                    </div>
                    <div className={`status-badge ${status.class}`}>
                      <StatusIcon size={14} />
                      <span>{status.text}</span>
                    </div>
                  </div>

                  <h3 className="assignment-title">{assignment.title}</h3>
                  <p className="assignment-description">{assignment.description || 'No description'}</p>

                  <div className="assignment-meta">
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'TBD'}</span>
                    </div>
                    <div className="meta-item">
                      <Clock size={14} />
                      <span>{assignment.dueDate ? new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</span>
                    </div>
                    <div className="meta-item">
                      <Award size={14} />
                      <span>{assignment.totalPoints || 100} points</span>
                    </div>
                  </div>

                  <div className="assignment-stats">
                    <div className="stat">
                      <Users size={14} />
                      <span>0 submissions</span>
                    </div>
                    <div className="stat">
                      <CheckCircle size={14} />
                      <span>0 graded</span>
                    </div>
                  </div>

                  <div className="assignment-actions">
                    <button className="action-btn" title="View Submissions">
                      <Eye size={16} />
                      View
                    </button>
                    <button className="action-btn" title="Edit Assignment">
                      <Edit size={16} />
                      Edit
                    </button>
                    <button className="action-btn delete" title="Delete Assignment">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Assignment Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Create New Assignment"
        size="lg"
      >
        <form onSubmit={handleAddAssignment} className="assignment-form">
          <div className="form-group">
            <label>Assignment Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Machine Learning Assignment 3"
              required
            />
          </div>

          <div className="form-group">
            <label>Course *</label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({...formData, courseId: e.target.value})}
              required
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="4"
              placeholder="Assignment instructions, requirements, etc."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Due Date *</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
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

          <div className="form-group">
            <label>Total Points</label>
            <input
              type="number"
              value={formData.totalPoints}
              onChange={(e) => setFormData({...formData, totalPoints: parseInt(e.target.value)})}
              min="1"
              max="1000"
            />
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyAssignments;
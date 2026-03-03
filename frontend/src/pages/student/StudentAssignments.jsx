import React, { useState, useEffect } from 'react';
import { 
  FileText, Clock, CheckCircle, AlertCircle, 
  Download, Eye, Filter, Search, Calendar,
  Upload, MoreVertical, Award
} from 'lucide-react';
import { studentApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './StudentAssignments.css';

const StudentAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await studentApi.getAssignments();
      
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
      console.error('Error fetching assignments:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffHours = (due - now) / (1000 * 60 * 60);
    
    if (diffHours < 0) return { text: 'Overdue', class: 'overdue', icon: AlertCircle };
    if (diffHours < 24) return { text: 'Due Soon', class: 'urgent', icon: Clock };
    if (diffHours < 72) return { text: 'Upcoming', class: 'warning', icon: Clock };
    return { text: 'Active', class: 'active', icon: CheckCircle };
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.course?.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getStatusInfo(a.dueDate);
    const matchesStatus = selectedStatus === 'all' || status.text.toLowerCase() === selectedStatus;
    return matchesSearch && matchesStatus;
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
    <div className="student-assignments">
      <div className="page-header">
        <div>
          <h1>My Assignments</h1>
          <p>View and submit your course assignments</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <FileText size={18} />
            <span>{assignments.length} Total</span>
          </div>
          <div className="stat-badge">
            <Clock size={18} />
            <span>{assignments.filter(a => {
              const status = getStatusInfo(a.dueDate);
              return status.text === 'Due Soon' || status.text === 'Overdue';
            }).length} Urgent</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchAssignments} className="retry-btn">Retry</button>
        </div>
      )}

      <Card className="assignments-card">
        <div className="assignments-header">
          <h2>All Assignments</h2>
          <span className="section-badge">{filteredAssignments.length} assignments</span>
        </div>

        <div className="assignments-controls">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by title or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select 
              className="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="due soon">Due Soon</option>
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
            </select>

            <Button variant="outline" icon={Filter}>Filter</Button>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} />
            <h3>No assignments found</h3>
            <p>You don't have any assignments yet. They will appear here when your instructors post them.</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <h3>No matching assignments</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="assignments-grid">
            {filteredAssignments.map(assignment => {
              const status = getStatusInfo(assignment.dueDate);
              const StatusIcon = status.icon;
              
              return (
                <Card key={assignment.id} className={`assignment-card ${status.class}`}>
                  <div className="assignment-header">
                    <div className="assignment-course">
                      <FileText size={16} />
                      <span>{assignment.courseName || assignment.course}</span>
                    </div>
                    <div className={`status-badge ${status.class}`}>
                      <StatusIcon size={14} />
                      <span>{status.text}</span>
                    </div>
                  </div>

                  <h3 className="assignment-title">{assignment.title}</h3>
                  <p className="assignment-description">{assignment.description}</p>

                  <div className="assignment-meta">
                    <div className="meta-item">
                      <Calendar size={16} />
                      <div>
                        <span className="meta-label">Due Date</span>
                        <span className="meta-value">
                          {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="meta-item">
                      <Clock size={16} />
                      <div>
                        <span className="meta-label">Due Time</span>
                        <span className="meta-value">
                          {new Date(assignment.dueDate).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="meta-item">
                      <Award size={16} />
                      <div>
                        <span className="meta-label">Points</span>
                        <span className="meta-value">{assignment.totalPoints} pts</span>
                      </div>
                    </div>
                  </div>

                  {assignment.submitted ? (
                    <div className="submission-info">
                      <CheckCircle size={16} />
                      <span>Submitted on {new Date(assignment.submittedDate).toLocaleDateString()}</span>
                      {assignment.grade && (
                        <span className="grade-badge">Grade: {assignment.grade}/{assignment.totalPoints}</span>
                      )}
                    </div>
                  ) : (
                    <div className="assignment-actions">
                      <Button variant="outline" size="sm" icon={Eye}>
                        View Details
                      </Button>
                      <Button variant="primary" size="sm" icon={Upload}>
                        Submit
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentAssignments;
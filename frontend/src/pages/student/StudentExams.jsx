import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, BookOpen, AlertCircle, 
  CheckCircle, Eye, Download, Filter, Search,
  Award, Users, MapPin
} from 'lucide-react';
import { studentApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './StudentExams.css';

const StudentExams = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('upcoming');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await studentApi.getExams();
      
      let examsData = [];
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        examsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        examsData = response.data;
      } else if (response.data?.exams && Array.isArray(response.data.exams)) {
        examsData = response.data.exams;
      }
      
      setExams(examsData);
      
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const getExamStatus = (examDate) => {
    const now = new Date();
    const exam = new Date(examDate);
    const diffDays = Math.ceil((exam - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Completed', class: 'completed', icon: CheckCircle };
    if (diffDays === 0) return { text: 'Today', class: 'today', icon: AlertCircle };
    if (diffDays <= 7) return { text: 'This Week', class: 'urgent', icon: Clock };
    if (diffDays <= 30) return { text: 'This Month', class: 'upcoming', icon: Calendar };
    return { text: 'Upcoming', class: 'upcoming', icon: Calendar };
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.course?.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getExamStatus(exam.date);
    const matchesStatus = selectedStatus === 'all' || status.text.toLowerCase() === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-exams">
      <div className="page-header">
        <div>
          <h1>My Exams</h1>
          <p>View your upcoming and past examinations</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <Calendar size={18} />
            <span>{exams.filter(e => getExamStatus(e.date).text !== 'Completed').length} Upcoming</span>
          </div>
          <div className="stat-badge">
            <CheckCircle size={18} />
            <span>{exams.filter(e => getExamStatus(e.date).text === 'Completed').length} Completed</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchExams} className="retry-btn">Retry</button>
        </div>
      )}

      <Card className="exams-card">
        <div className="exams-header">
          <h2>Examination Schedule</h2>
          <span className="section-badge">{filteredExams.length} exams</span>
        </div>

        <div className="exams-controls">
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
              <option value="all">All Exams</option>
              <option value="today">Today</option>
              <option value="this week">This Week</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>

            <Button variant="outline" icon={Filter}>Filter</Button>
          </div>
        </div>

        {exams.length === 0 ? (
          <div className="empty-state">
            <Calendar size={64} />
            <h3>No exams found</h3>
            <p>You don't have any exams scheduled yet. They will appear here when your instructors schedule them.</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <h3>No matching exams</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="exams-grid">
            {filteredExams.map(exam => {
              const status = getExamStatus(exam.date);
              const StatusIcon = status.icon;
              
              return (
                <Card key={exam.id} className={`exam-card ${status.class}`}>
                  <div className="exam-header">
                    <div className="exam-course">
                      <BookOpen size={16} />
                      <span>{exam.courseName || exam.course}</span>
                    </div>
                    <div className={`status-badge ${status.class}`}>
                      <StatusIcon size={14} />
                      <span>{status.text}</span>
                    </div>
                  </div>

                  <h3 className="exam-title">{exam.title}</h3>

                  <div className="exam-details">
                    <div className="detail-item">
                      <Calendar size={18} />
                      <div>
                        <span className="detail-label">Date</span>
                        <span className="detail-value">
                          {new Date(exam.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <Clock size={18} />
                      <div>
                        <span className="detail-label">Time</span>
                        <span className="detail-value">
                          {new Date(exam.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <Award size={18} />
                      <div>
                        <span className="detail-label">Total Marks</span>
                        <span className="detail-value">{exam.totalMarks}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <MapPin size={18} />
                      <div>
                        <span className="detail-label">Venue</span>
                        <span className="detail-value">{exam.venue || 'TBD'}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <Users size={18} />
                      <div>
                        <span className="detail-label">Duration</span>
                        <span className="detail-value">{exam.duration || '3 hours'}</span>
                      </div>
                    </div>
                  </div>

                  {status.text === 'Completed' && exam.result && (
                    <div className="result-card">
                      <div className="score-circle">
                        <span className="percentage">{exam.result.percentage}%</span>
                      </div>
                      <div className="score-details">
                        <span className="score-label">Score</span>
                        <span className="score-value">{exam.result.obtained}/{exam.totalMarks}</span>
                        <span className="grade">Grade: {exam.result.grade}</span>
                      </div>
                    </div>
                  )}

                  <div className="exam-actions">
                    <Button variant="outline" size="sm" icon={Eye}>
                      Details
                    </Button>
                    <Button variant="outline" size="sm" icon={Download}>
                      Syllabus
                    </Button>
                    {status.text !== 'Completed' && (
                      <Button variant="primary" size="sm" icon={Download}>
                        Hall Ticket
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentExams;
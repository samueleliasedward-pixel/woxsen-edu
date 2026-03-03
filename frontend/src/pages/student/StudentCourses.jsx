import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, Filter, Calendar, Clock,
  Users, Award, Eye, Download, Star
} from 'lucide-react';
import { studentApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './StudentCourses.css';

const StudentCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch enrolled courses
      const enrolledResponse = await studentApi.getCourses();
      
      // Fetch available courses
      let availableResponse = { data: { data: [] } };
      try {
        availableResponse = await studentApi.getAvailableCourses();
      } catch (err) {
        console.log('Available courses endpoint error:', err.message);
      }
      
      // Extract enrolled courses data
      let enrolledData = [];
      if (enrolledResponse.data?.data && Array.isArray(enrolledResponse.data.data)) {
        enrolledData = enrolledResponse.data.data;
      } else if (Array.isArray(enrolledResponse.data)) {
        enrolledData = enrolledResponse.data;
      } else if (enrolledResponse.data?.courses && Array.isArray(enrolledResponse.data.courses)) {
        enrolledData = enrolledResponse.data.courses;
      }
      
      // Extract available courses data
      let availableData = [];
      if (availableResponse.data?.data && Array.isArray(availableResponse.data.data)) {
        availableData = availableResponse.data.data;
      } else if (Array.isArray(availableResponse.data)) {
        availableData = availableResponse.data;
      } else if (availableResponse.data?.courses && Array.isArray(availableResponse.data.courses)) {
        availableData = availableResponse.data.courses;
      }
      
      setEnrolledCourses(enrolledData);
      setCourses(availableData);
      
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      console.log('Enrolling in course:', courseId);
      // Add enroll API call here
      alert('Enrollment feature coming soon!');
    } catch (err) {
      console.error('Failed to enroll:', err);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.department?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredEnrolled = enrolledCourses.filter(course => {
    const matchesSearch = course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-courses">
      <div className="page-header">
        <div>
          <h1>My Courses</h1>
          <p>View and manage your enrolled courses</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <BookOpen size={18} />
            <span>{enrolledCourses.length} Enrolled</span>
          </div>
          <div className="stat-badge">
            <Award size={18} />
            <span>{courses.length} Available</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={fetchCourses} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Enrolled Courses Section */}
      <Card className="courses-card">
        <div className="section-header">
          <h2>Enrolled Courses</h2>
          <span className="section-badge">{filteredEnrolled.length} Courses</span>
        </div>
        {enrolledCourses.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} />
            <h3>No enrolled courses</h3>
            <p>You are not enrolled in any courses yet. Browse available courses below to enroll.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {filteredEnrolled.map(course => (
              <Card key={course.id} className="course-card enrolled">
                <div className="course-header">
                  <span className="course-code">{course.code}</span>
                  <span className="enrolled-badge">Enrolled</span>
                </div>
                <h3>{course.name}</h3>
                <p className="course-dept">{course.department}</p>
                <div className="course-details">
                  <div className="detail-item">
                    <Clock size={14} />
                    <span>{course.schedule || 'TBD'}</span>
                  </div>
                  <div className="detail-item">
                    <Users size={14} />
                    <span>{course.faculty || 'TBD'}</span>
                  </div>
                </div>
                <div className="course-progress">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span>{course.progress || 0}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
                <Button variant="outline" size="sm" block>
                  <Eye size={16} />
                  View Course
                </Button>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Available Courses Section */}
      <Card className="courses-card">
        <div className="section-header">
          <h2>Available Courses</h2>
          <span className="section-badge">{filteredCourses.length} Courses</span>
        </div>
        
        <div className="search-section">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search courses by name, code, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${selectedFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-tab ${selectedFilter === 'department' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('department')}
            >
              By Department
            </button>
            <button 
              className={`filter-tab ${selectedFilter === 'credits' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('credits')}
            >
              By Credits
            </button>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} />
            <h3>No available courses</h3>
            <p>There are no courses available for enrollment at this time.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map(course => (
              <Card key={course.id} className="course-card">
                <div className="course-header">
                  <span className="course-code">{course.code}</span>
                </div>
                <h3>{course.name}</h3>
                <p className="course-dept">{course.department}</p>
                <div className="course-details">
                  <div className="detail-item">
                    <Award size={14} />
                    <span>{course.credits} Credits</span>
                  </div>
                  <div className="detail-item">
                    <Users size={14} />
                    <span>{course.faculty || 'TBD'}</span>
                  </div>
                </div>
                <div className="course-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{course.semester || 'Spring 2024'}</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={14} />
                    <span>{course.schedule || 'TBD'}</span>
                  </div>
                </div>
                <Button 
                  variant="primary" 
                  size="sm" 
                  block
                  onClick={() => handleEnroll(course.id)}
                >
                  Enroll Now
                </Button>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentCourses;
import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Mail, Phone, Calendar,
  BookOpen, Award, Clock, MoreVertical, Eye,
  Download, RefreshCw, AlertCircle, CheckCircle,
  XCircle, GraduationCap
} from 'lucide-react';
import { facultyApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './FacultyStudents.css';

const FacultyStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await facultyApi.getStudents();
      
      let studentsData = [];
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        studentsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        studentsData = response.data;
      } else if (response.data?.students && Array.isArray(response.data.students)) {
        studentsData = response.data.students;
      }
      
      setStudents(studentsData);
      
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError('Failed to load students');
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

  const getAttendanceColor = (attendance) => {
    if (attendance >= 85) return 'excellent';
    if (attendance >= 75) return 'good';
    if (attendance >= 60) return 'average';
    return 'poor';
  };

  const getCGPAColor = (cgpa) => {
    if (cgpa >= 8.5) return 'excellent';
    if (cgpa >= 7.5) return 'good';
    if (cgpa >= 6.0) return 'average';
    return 'poor';
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || s.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-students">
      <div className="page-header">
        <div>
          <h1>My Students</h1>
          <p>View and manage students enrolled in your courses</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" icon={Download}>
            Export List
          </Button>
          <Button variant="outline" icon={RefreshCw} onClick={fetchStudents}>
            Refresh
          </Button>
        </div>
      </div>

      <Card className="students-card">
        <div className="students-controls">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or student ID..."
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

        {students.length === 0 ? (
          <div className="empty-state">
            <Users size={64} />
            <h3>No students found</h3>
            <p>Students enrolled in your courses will appear here</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <h3>No matching students</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="students-grid">
            {filteredStudents.map(student => (
              <Card key={student.id} className="student-card">
                <div className="student-avatar">
                  {student.name?.charAt(0).toUpperCase()}
                </div>
                
                <div className="student-info">
                  <h3 className="student-name">{student.name}</h3>
                  <p className="student-email">{student.email}</p>
                  <p className="student-id">{student.studentId}</p>
                </div>

                <div className="student-course">
                  <BookOpen size={14} />
                  <span>{student.course || student.courseName}</span>
                </div>

                <div className="student-stats">
                  <div className="stat">
                    <Award size={14} />
                    <span className={`cgpa ${getCGPAColor(student.cgpa)}`}>
                      CGPA: {student.cgpa?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="stat">
                    <Clock size={14} />
                    <span className={`attendance ${getAttendanceColor(student.attendance)}`}>
                      Attendance: {student.attendance || 0}%
                    </span>
                  </div>
                </div>

                <div className="student-actions">
                  <button className="action-btn" title="View Details">
                    <Eye size={16} />
                  </button>
                  <button className="action-btn" title="Send Message">
                    <Mail size={16} />
                  </button>
                  <button className="action-btn" title="Call">
                    <Phone size={16} />
                  </button>
                  <button className="action-btn" title="More">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default FacultyStudents;
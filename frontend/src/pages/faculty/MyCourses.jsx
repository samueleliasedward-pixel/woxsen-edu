import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Search, Filter, X,
  Calendar, Users, Clock, Edit, Trash,
  MoreVertical, ChevronRight
} from 'lucide-react';
import { facultyApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './MyCourses.css';

const MyCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: 3,
    department: 'Computer Science'
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await facultyApi.getCourses();
      
      let coursesData = [];
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        coursesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        coursesData = response.data;
      } else if (response.data?.courses && Array.isArray(response.data.courses)) {
        coursesData = response.data.courses;
      } else if (response.data?.data?.courses && Array.isArray(response.data.data.courses)) {
        coursesData = response.data.data.courses;
      } else if (response.data?.result && Array.isArray(response.data.result)) {
        coursesData = response.data.result;
      }
      
      setCourses(coursesData);
      
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await facultyApi.createCourse(formData);
      if (response.data?.success) {
        setShowModal(false);
        setFormData({
          name: '',
          code: '',
          description: '',
          credits: 3,
          department: 'Computer Science'
        });
        fetchCourses();
      }
    } catch (error) {
      console.error('Failed to create course:', error);
      alert(error.response?.data?.message || 'Failed to create course');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="my-courses">
      <div className="page-header">
        <div>
          <h1>My Courses</h1>
          <p className="text-muted">Manage your courses and teaching materials</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <BookOpen size={18} />
            <span>{courses.length} Total Courses</span>
          </div>
          <div className="stat-badge">
            <Users size={18} />
            <span>{courses.reduce((acc, course) => acc + (course.studentCount || 0), 0)} Students</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={fetchCourses} className="retry-btn">Try Again</button>
        </div>
      )}

      <Card className="courses-card">
        <div className="courses-header">
          <h2>Course Management</h2>
          <Button 
            variant="primary" 
            size="sm" 
            icon={Plus}
            onClick={() => setShowModal(true)}
          >
            Add Course
          </Button>
        </div>

        <div className="search-section">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search courses by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select className="filter-select">
              <option value="all">All Departments</option>
              <option value="cs">Computer Science</option>
              <option value="eng">Engineering</option>
              <option value="math">Mathematics</option>
              <option value="phy">Physics</option>
            </select>
            <Button variant="outline" size="sm" icon={Filter}>Filter</Button>
          </div>
        </div>

        <div className="courses-count">
          <p>Showing {filteredCourses.length} of {courses.length} courses</p>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={64} />
            <h3>No courses found</h3>
            <p className="text-muted">
              {searchTerm ? 'No courses match your search criteria' : 'You haven\'t created any courses yet'}
            </p>
            {!searchTerm && (
              <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
                Create Your First Course
              </Button>
            )}
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map(course => (
              <Card key={course.id} className="course-card">
                <div className="course-header">
                  <div className="course-code">{course.code}</div>
                  <div className="course-actions">
                    <button className="icon-btn" title="Edit"><Edit size={16} /></button>
                    <button className="icon-btn" title="Delete"><Trash size={16} /></button>
                    <button className="icon-btn" title="More"><MoreVertical size={16} /></button>
                  </div>
                </div>
                
                <h3 className="course-name">{course.name}</h3>
                <p className="course-description">{course.description || 'No description provided'}</p>
                
                <div className="course-stats">
                  <div className="stat-item">
                    <Users size={16} />
                    <div>
                      <span className="stat-label">Students</span>
                      <span className="stat-value">{course.studentCount || 0}</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <BookOpen size={16} />
                    <div>
                      <span className="stat-label">Credits</span>
                      <span className="stat-value">{course.credits || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="course-details">
                  <div className="detail-item">
                    <Calendar size={14} />
                    <span>{course.schedule || 'Schedule TBD'}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={14} />
                    <span>{course.room || 'Room TBD'}</span>
                  </div>
                </div>

                <div className="course-materials">
                  <div className="material-item">
                    <BookOpen size={14} />
                    <span>{course.assignmentCount || 0} Assignments</span>
                  </div>
                  <div className="material-item">
                    <Users size={14} />
                    <span>{course.enrollmentCount || 0} Enrolled</span>
                  </div>
                </div>

                <div className="course-footer">
                  <div className="course-status">
                    <span className={`status-badge ${course.status?.toLowerCase() || 'active'}`}>
                      {course.status || 'Active'}
                    </span>
                  </div>
                  <button className="view-btn">
                    View Course <ChevronRight size={14} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Add Course Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Course</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Course Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Introduction to Computer Science"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Course Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., CS101"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Credits *</label>
                  <input
                    type="number"
                    name="credits"
                    value={formData.credits}
                    onChange={handleInputChange}
                    min="1"
                    max="6"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter course description, objectives, and prerequisites..."
                />
              </div>

              <div className="modal-footer">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Create Course
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
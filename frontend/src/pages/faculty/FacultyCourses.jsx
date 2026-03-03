// K:\woxsen-edu\frontend\src\pages\faculty\FacultyCourses.jsx
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Users, Calendar, Clock, ChevronRight,
  Search, Filter, Plus, MoreVertical, Edit, Eye, Trash2
} from 'lucide-react';
import { facultyApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import './FacultyCourses.css';

const FacultyCourses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('Spring 2026');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: 3,
    department: 'Computer Science',
    schedule: '',
    room: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log('📚 Fetching faculty courses...');
      const response = await facultyApi.getCourses();
      console.log('✅ Courses response:', response);
      
      // Extract data properly
      let coursesData = [];
      if (response?.data?.data) {
        coursesData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        coursesData = response.data;
      } else if (Array.isArray(response)) {
        coursesData = response;
      }
      
      setCourses(coursesData);
    } catch (err) {
      console.error('❌ Failed to fetch courses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await facultyApi.createCourse(formData);
      console.log('✅ Course created:', response);
      setShowAddModal(false);
      setFormData({ name: '', code: '', description: '', credits: 3, department: 'Computer Science', schedule: '', room: '' });
      fetchCourses();
    } catch (err) {
      console.error('❌ Failed to create course:', err);
      alert('Failed to create course: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => 
    course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !courses.length) {
    return <div className="loading-screen"><div className="loader"></div><p>Loading courses...</p></div>;
  }

  return (
    <div className="faculty-courses">
      <div className="page-header">
        <div>
          <h1>My Courses</h1>
          <p>Manage your courses and teaching materials</p>
        </div>
        <div className="header-actions">
          <select 
            className="semester-select"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option>Spring 2026</option>
            <option>Fall 2025</option>
            <option>Spring 2025</option>
          </select>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddModal(true)}>
            Add Course
          </Button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" icon={Filter}>
          Filter
        </Button>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={64} />
          <h3>No courses found</h3>
          <p className="text-muted">
            {courses.length === 0 ? 'Get started by adding your first course' : 'No courses match your search'}
          </p>
          {courses.length === 0 && (
            <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
              Add Your First Course
            </Button>
          )}
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map(course => (
            <Card key={course.id} className="course-card">
              <div className="course-header">
                <div className="course-code">{course.code}</div>
                <button className="course-menu">
                  <MoreVertical size={16} />
                </button>
              </div>
              <h3>{course.name}</h3>
              <p className="course-semester">{selectedSemester}</p>

              <div className="course-stats">
                <div className="stat">
                  <Users size={14} />
                  <span>{course.studentCount || 0} Students</span>
                </div>
                <div className="stat">
                  <BookOpen size={14} />
                  <span>{course.credits || 3} Credits</span>
                </div>
              </div>

              <div className="course-details">
                <div className="detail-item">
                  <Calendar size={14} />
                  <span>{course.schedule || 'TBD'}</span>
                </div>
                <div className="detail-item">
                  <Clock size={14} />
                  <span>{course.room || 'TBD'}</span>
                </div>
              </div>

              <div className="course-footer">
                <button className="view-btn">
                  View Course <ChevronRight size={14} />
                </button>
                <div className="course-actions">
                  <button className="icon-btn"><Edit size={14} /></button>
                  <button className="icon-btn"><Eye size={14} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Course Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create New Course">
        <form onSubmit={handleAddCourse}>
          <div className="form-group">
            <label>Course Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Course Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Credits</label>
              <input
                type="number"
                value={formData.credits}
                onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
                min="1"
                max="6"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Schedule</label>
              <input
                type="text"
                value={formData.schedule}
                onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                placeholder="e.g., Mon/Wed 10:00-11:30"
              />
            </div>
            <div className="form-group">
              <label>Room</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({...formData, room: e.target.value})}
                placeholder="e.g., Room 201"
              />
            </div>
          </div>
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Course</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyCourses;
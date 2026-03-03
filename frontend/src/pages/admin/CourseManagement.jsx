import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Edit, Trash2, Eye, 
  BookOpen, Users, Calendar, Clock, Download,
  Upload, MoreVertical, CheckCircle, XCircle
} from 'lucide-react';
import { adminApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './CourseManagement.css';

const CourseManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, selectedFilter, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('%c🔥🔥🔥 FETCHING COURSES 🔥🔥🔥', 'background: #ff0000; color: #fff; font-size: 16px; padding: 10px;');
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        department: selectedFilter !== 'all' ? selectedFilter : undefined
      };
      
      console.log('📦 Request params:', params);
      console.log('🔑 Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const response = await adminApi.getCourses(params);
      
      console.log('%c📦 FULL API RESPONSE:', 'background: #0000ff; color: #fff; padding: 5px;', response);
      console.log('📦 Response.data:', response.data);
      console.log('📦 Response.data.data:', response.data?.data);
      console.log('📦 Courses array:', response.data?.data?.courses);
      console.log('📦 Type of courses:', typeof response.data?.data?.courses);
      console.log('📦 Is courses an array?', Array.isArray(response.data?.data?.courses));
      
      setApiResponse(response.data);
      
      let coursesData = [];
      let paginationData = { page: 1, limit: 9, total: 0, pages: 1 };
      
      if (response.data?.data?.courses && Array.isArray(response.data.data.courses)) {
        console.log('✅ Found courses in response.data.data.courses');
        coursesData = response.data.data.courses;
        paginationData = response.data.data.pagination || paginationData;
      } else if (response.data?.courses && Array.isArray(response.data.courses)) {
        console.log('✅ Found courses in response.data.courses');
        coursesData = response.data.courses;
        paginationData = response.data.pagination || paginationData;
      } else if (Array.isArray(response.data)) {
        console.log('✅ Found courses as direct array');
        coursesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        console.log('✅ Found courses in response.data.data');
        coursesData = response.data.data;
      } else if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        console.log('✅ Found courses in nested data.data.data');
        coursesData = response.data.data.data;
        paginationData = response.data.data.pagination || paginationData;
      }
      
      console.log('📊 Raw courses data:', coursesData);
      console.log('📊 Courses count:', coursesData?.length || 0);
      console.log('📊 First course (if any):', coursesData?.[0] || null);
      
      const normalizedCourses = coursesData.map(course => ({
        id: course.id || course._id || `temp-${Math.random()}`,
        code: course.code || course.courseCode || 'N/A',
        name: course.name || course.courseName || 'Unnamed Course',
        description: course.description || '',
        department: course.department || 'Not specified',
        credits: course.credits || 3,
        faculty: course.faculty || 'Not Assigned',
        facultyId: course.facultyId || null,
        status: course.status || 'ACTIVE',
        enrolled: course.enrolled || course.enrolledStudents || course.students || 0,
        capacity: course.capacity || 50,
        schedule: course.schedule || 'TBD',
        semester: course.semester || 'Current',
        assignments: course.assignments || course._count?.assignments || 0,
        createdAt: course.createdAt || new Date().toISOString(),
        updatedAt: course.updatedAt || null
      }));

      console.log('📊 Normalized courses:', normalizedCourses);
      console.log('📊 Normalized count:', normalizedCourses.length);
      
      setCourses(normalizedCourses);
      setFilteredCourses(normalizedCourses);
      setPagination(paginationData);
      
      console.log('✅ Courses loaded successfully:', normalizedCourses.length);
      
    } catch (err) {
      console.error('%c❌ ERROR FETCHING COURSES:', 'background: #ff0000; color: #fff; font-size: 14px;', err);
      console.error('Error message:', err.message);
      console.error('Error response data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error headers:', err.response?.headers);
      console.error('Error config:', err.config);
      
      setApiResponse({
        error: true,
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        stack: err.stack
      });
      
      setError(err.response?.data?.message || err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name?.toLowerCase().includes(term) ||
        c.code?.toLowerCase().includes(term) ||
        c.department?.toLowerCase().includes(term) ||
        c.faculty?.toLowerCase().includes(term)
      );
    }
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(c => c.status === selectedFilter);
    }
    
    setFilteredCourses(filtered);
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    return status === 'ACTIVE'
      ? <span className="status-badge active"><CheckCircle size={12} /> Active</span>
      : <span className="status-badge inactive"><XCircle size={12} /> Inactive</span>;
  };

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading && !courses.length) {
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
    <div className="course-management">
      <div className="page-header">
        <div>
          <h1>Course Management</h1>
          <p>Manage courses, faculty assignments, and schedules</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" size="sm" icon={Download}>
            Export
          </Button>
          <Button variant="primary" size="sm" icon={Plus}>
            Add Course
          </Button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by course code, name, department, or faculty..."
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
            className={`filter-tab ${selectedFilter === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('ACTIVE')}
          >
            Active
          </button>
          <button
            className={`filter-tab ${selectedFilter === 'INACTIVE' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('INACTIVE')}
          >
            Inactive
          </button>
        </div>
      </div>

      <div className="courses-grid">
        {filteredCourses.length > 0 ? (
          paginatedCourses.map(course => (
            <Card key={course.id} className="course-card">
              <div className="course-header">
                <div className="course-code">{course.code}</div>
                {getStatusBadge(course.status)}
              </div>
              <h3>{course.name}</h3>
              <p className="course-dept">{course.department}</p>

              <div className="course-details">
                <div className="detail-row">
                  <BookOpen size={14} />
                  <span>Faculty: {course.faculty}</span>
                </div>
                <div className="detail-row">
                  <Calendar size={14} />
                  <span>{course.schedule}</span>
                </div>
                <div className="detail-row">
                  <Clock size={14} />
                  <span>{course.credits} Credits</span>
                </div>
              </div>

              <div className="course-stats">
                <div className="stat">
                  <Users size={14} />
                  <span>{course.enrolled}/{course.capacity}</span>
                </div>
                <div className="stat">
                  <Calendar size={14} />
                  <span>{course.semester}</span>
                </div>
              </div>

              <div className="course-actions">
                <button className="action-btn">
                  <Eye size={16} />
                  View
                </button>
                <button className="action-btn">
                  <Edit size={16} />
                  Edit
                </button>
                <button className="action-btn">
                  <Upload size={16} />
                  Syllabus
                </button>
                <button className="action-btn">
                  <MoreVertical size={16} />
                </button>
              </div>
            </Card>
          ))
        ) : (
          <div className="empty-state">
            <BookOpen size={64} />
            <h3>No courses found</h3>
            <p className="text-muted">
              {courses.length === 0 
                ? "Get started by adding your first course" 
                : "No courses match your search criteria"}
            </p>
            {courses.length === 0 && (
              <Button variant="primary" icon={Plus}>
                Add Your First Course
              </Button>
            )}
            {courses.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {filteredCourses.length > 0 && totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
            ) {
              return (
                <button
                  key={pageNum}
                  className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            }
            if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
              return <span key={pageNum} className="page-ellipsis">...</span>;
            }
            return null;
          })}
          
          <button
            className="page-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {filteredCourses.length > 0 && (
        <div className="table-footer">
          <span className="showing-info">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} courses
          </span>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
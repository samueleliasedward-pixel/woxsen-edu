// frontend/src/pages/admin/StudentManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Plus, Download, Upload,
  Edit2, Trash2, ToggleLeft, ToggleRight, Eye,
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle, XCircle,
  Mail, Phone, Calendar, BookOpen, Award, Clock,
  MoreVertical, UserPlus, FileText, RefreshCw
} from 'lucide-react';
import { adminApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import './StudentManagement.css';

const StudentManagement = () => {
  // ===== STATE MANAGEMENT =====
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    program: 'B.Tech Computer Science',
    year: '1',
    semester: '1',
    phone: '',
    address: '',
    emergencyContact: '',
    cgpa: '0.00',
    attendance: '0'
  });

  // Programs list
  const programs = [
    'B.Tech Computer Science',
    'B.Tech Electronics',
    'B.Tech Mechanical',
    'B.Tech Civil',
    'B.Tech AI & ML',
    'B.Tech Data Science',
    'B.Tech Cybersecurity',
    'B.Tech IoT',
    'B.Tech Biotechnology',
    'B.Tech Aerospace'
  ];

  // ===== FETCH STUDENTS =====
  useEffect(() => {
    fetchStudents();
  }, []);

  // ===== FILTER STUDENTS =====
  useEffect(() => {
    filterStudents();
  }, [searchTerm, statusFilter, programFilter, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const response = await adminApi.getStudents(params);
      
      // Try to extract data from all possible locations
      let studentsData = [];
      let paginationData = { page: 1, limit: 10, total: 0, pages: 1 };
      
      // Check all possible response structures
      if (response.data?.data?.students && Array.isArray(response.data.data.students)) {
        studentsData = response.data.data.students;
        paginationData = response.data.data.pagination || paginationData;
      } 
      else if (response.data?.data && Array.isArray(response.data.data)) {
        studentsData = response.data.data;
      }
      else if (response.data?.students && Array.isArray(response.data.students)) {
        studentsData = response.data.students;
        paginationData = response.data.pagination || paginationData;
      }
      else if (Array.isArray(response.data)) {
        studentsData = response.data;
      }
      else if (Array.isArray(response)) {
        studentsData = response;
      }
      else if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        studentsData = response.data.data.data;
        paginationData = response.data.data.pagination || paginationData;
      }
      
      // Map and normalize student data
      const normalizedStudents = studentsData.map(student => ({
        id: student.id || student._id || `temp-${Math.random()}`,
        name: student.name || 'Unknown Student',
        email: student.email || 'No email',
        studentId: student.studentId || student.enrollmentId || student.rollNumber || 'N/A',
        program: student.program || student.course || 'B.Tech Computer Science',
        year: student.year || student.currentYear || 1,
        semester: student.semester || student.currentSemester || 1,
        cgpa: student.cgpa || student.gpa || student.averageGrade || 0,
        attendance: student.attendance || student.attendancePercentage || 0,
        isActive: student.isActive !== undefined ? student.isActive : true,
        status: student.status || (student.isActive ? 'active' : 'inactive'),
        phone: student.phone || student.mobile || 'N/A',
        address: student.address || 'Not provided',
        emergencyContact: student.emergencyContact || student.emergencyPhone || 'N/A',
        batch: student.batch || student.batchYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`,
        enrolledCourses: student.enrolledCourses || student.courses || [],
        createdAt: student.createdAt || student.joinDate || new Date().toISOString(),
        lastLogin: student.lastLogin || null
      }));

      setStudents(normalizedStudents);
      setFilteredStudents(normalizedStudents);
      setPagination(paginationData);
      
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.name?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.studentId?.toLowerCase().includes(term) ||
        s.program?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => 
        statusFilter === 'active' ? s.isActive : 
        statusFilter === 'inactive' ? !s.isActive : true
      );
    }
    
    // Apply program filter
    if (programFilter !== 'all') {
      filtered = filtered.filter(s => s.program === programFilter);
    }
    
    setFilteredStudents(filtered);
    setCurrentPage(1);
  };

  // ===== CRUD OPERATIONS =====
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const studentData = {
        ...formData,
        year: parseInt(formData.year),
        semester: parseInt(formData.semester),
        cgpa: parseFloat(formData.cgpa),
        attendance: parseInt(formData.attendance),
        role: 'student'
      };
      
      const response = await adminApi.createStudent(studentData);
      console.log('Student added:', response);
      
      setShowAddModal(false);
      resetForm();
      fetchStudents();
    } catch (err) {
      console.error('Failed to add student:', err);
      alert('Failed to add student: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    
    try {
      setLoading(true);
      
      const studentData = {
        ...formData,
        year: parseInt(formData.year),
        semester: parseInt(formData.semester),
        cgpa: parseFloat(formData.cgpa),
        attendance: parseInt(formData.attendance)
      };
      
      const response = await adminApi.updateStudent(selectedStudent.id, studentData);
      console.log('Student updated:', response);
      
      setShowEditModal(false);
      resetForm();
      fetchStudents();
    } catch (err) {
      console.error('Failed to update student:', err);
      alert('Failed to update student: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await adminApi.toggleStudentStatus(id);
      fetchStudents();
    } catch (err) {
      console.error('Failed to toggle status:', err);
      alert('Failed to toggle student status');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }
    
    try {
      await adminApi.deleteStudent(id);
      fetchStudents();
    } catch (err) {
      console.error('Failed to delete student:', err);
      alert('Failed to delete student');
    }
  };

  // ===== HELPER FUNCTIONS =====
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      studentId: '',
      program: 'B.Tech Computer Science',
      year: '1',
      semester: '1',
      phone: '',
      address: '',
      emergencyContact: '',
      cgpa: '0.00',
      attendance: '0'
    });
    setSelectedStudent(null);
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      password: '',
      studentId: student.studentId || '',
      program: student.program || 'B.Tech Computer Science',
      year: student.year?.toString() || '1',
      semester: student.semester?.toString() || '1',
      phone: student.phone || '',
      address: student.address || '',
      emergencyContact: student.emergencyContact || '',
      cgpa: student.cgpa?.toString() || '0',
      attendance: student.attendance?.toString() || '0'
    });
    setShowEditModal(true);
  };

  const openViewModal = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const getStatusBadge = (student) => {
    if (!student.isActive) {
      return { class: 'inactive', icon: XCircle, text: 'Inactive' };
    }
    if (student.attendance < 75 || student.cgpa < 6) {
      return { class: 'warning', icon: AlertCircle, text: 'At Risk' };
    }
    return { class: 'active', icon: CheckCircle, text: 'Active' };
  };

  const getCGPAClass = (cgpa) => {
    if (cgpa >= 8) return 'excellent';
    if (cgpa >= 7) return 'good';
    if (cgpa >= 6) return 'average';
    return 'poor';
  };

  const getAttendanceClass = (attendance) => {
    if (attendance >= 85) return 'excellent';
    if (attendance >= 75) return 'good';
    if (attendance >= 60) return 'average';
    return 'poor';
  };

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.isActive).length;
  const atRiskStudents = students.filter(s => s.isActive && (s.attendance < 75 || s.cgpa < 6)).length;
  const inactiveStudents = students.filter(s => !s.isActive).length;

  // ===== RENDER LOADING STATE =====
  if (loading && !students.length) {
    return (
      <div className="management-loading">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  // ===== RENDER ERROR STATE =====
  if (error) {
    return (
      <div className="management-error">
        <AlertCircle size={64} />
        <h3>Failed to load students</h3>
        <p>{error}</p>
        <Button onClick={fetchStudents} icon={RefreshCw}>
          Try Again
        </Button>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className="student-management">
      {/* Header Section */}
      <div className="management-header">
        <div className="header-left">
          <h1>Student Management</h1>
          <p className="text-muted">
            Manage student profiles, enrollments, and academic records
          </p>
        </div>
        <div className="header-actions">
          <Button 
            variant="outline" 
            size="sm" 
            icon={Download}
            onClick={() => console.log('Export students')}
          >
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            icon={Upload}
            onClick={() => console.log('Import students')}
          >
            Import
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            icon={Plus}
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{totalStudents}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active</span>
            <span className="stat-value">{activeStudents}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">At Risk</span>
            <span className="stat-value">{atRiskStudents}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon inactive">
            <XCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Inactive</span>
            <span className="stat-value">{inactiveStudents}</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="filters-card">
        <div className="filters-container">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, email, student ID, or program..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <div className="filter-tabs">
              <button
                className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-tab ${statusFilter === 'active' ? 'active' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                Active
              </button>
              <button
                className={`filter-tab ${statusFilter === 'inactive' ? 'active' : ''}`}
                onClick={() => setStatusFilter('inactive')}
              >
                Inactive
              </button>
            </div>

            <select 
              className="program-select"
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
            >
              <option value="all">All Programs</option>
              {programs.map(program => (
                <option key={program} value={program}>{program}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Students Table */}
      <Card className="table-card">
        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            <Users size={64} />
            <h3>No students found</h3>
            <p className="text-muted">
              {students.length === 0 
                ? "Get started by adding your first student" 
                : "No students match your search criteria"}
            </p>
            {students.length === 0 && (
              <Button 
                variant="primary" 
                icon={UserPlus}
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
              >
                Add Your First Student
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Student ID</th>
                    <th>Program</th>
                    <th>Year/Sem</th>
                    <th>CGPA</th>
                    <th>Attendance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((student) => {
                    const status = getStatusBadge(student);
                    const StatusIcon = status.icon;
                    
                    return (
                      <tr key={student.id}>
                        <td>
                          <div className="student-cell">
                            <div className="student-avatar">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="student-info">
                              <span className="student-name">{student.name}</span>
                              <span className="student-email">{student.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="student-id">{student.studentId}</span>
                        </td>
                        <td>
                          <span className="program-badge">{student.program}</span>
                        </td>
                        <td>
                          <div className="year-sem">
                            <Calendar size={14} />
                            Year {student.year} / Sem {student.semester}
                          </div>
                        </td>
                        <td>
                          <span className={`cgpa-badge ${getCGPAClass(student.cgpa)}`}>
                            <Award size={14} />
                            {student.cgpa.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <div className="attendance-cell">
                            <div className="attendance-bar-container">
                              <div 
                                className={`attendance-bar ${getAttendanceClass(student.attendance)}`}
                                style={{ width: `${student.attendance}%` }}
                              />
                            </div>
                            <span className={`attendance-value ${getAttendanceClass(student.attendance)}`}>
                              {student.attendance}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${status.class}`}>
                            <StatusIcon size={12} />
                            {status.text}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-btn view" 
                              title="View Details"
                              onClick={() => openViewModal(student)}
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className="action-btn edit" 
                              title="Edit Student"
                              onClick={() => openEditModal(student)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              className={`action-btn toggle ${student.isActive ? 'active' : 'inactive'}`}
                              title={student.isActive ? 'Deactivate' : 'Activate'}
                              onClick={() => handleToggleStatus(student.id, student.isActive)}
                            >
                              {student.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                            </button>
                            <button 
                              className="action-btn delete" 
                              title="Delete Student"
                              onClick={() => handleDeleteStudent(student.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                            <button className="action-btn more" title="More Options">
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show first, last, and pages around current
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
                  // Show ellipsis
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
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            <div className="table-footer">
              <span className="showing-info">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
              </span>
            </div>
          </>
        )}
      </Card>

      {/* ===== MODALS ===== */}

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Student"
        size="lg"
      >
        <form onSubmit={handleAddStudent} className="modal-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Enter password"
                  required={!selectedStudent}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Academic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Student ID *</label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  placeholder="Enter student ID"
                  required
                />
              </div>
              <div className="form-group">
                <label>Program</label>
                <select
                  value={formData.program}
                  onChange={(e) => setFormData({...formData, program: e.target.value})}
                >
                  {programs.map(program => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Year</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                >
                  {[1, 2, 3, 4].map(year => (
                    <option key={year} value={year}>{year}st Year</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>{sem}th Semester</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Contact Information</h3>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter address"
                  rows="2"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Emergency Contact</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  placeholder="Enter emergency contact"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Add Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Student"
        size="lg"
      >
        <form onSubmit={handleEditStudent} className="modal-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Academic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Student ID</label>
                <input
                  type="text"
                  value={formData.studentId}
                  disabled
                  className="disabled"
                />
              </div>
              <div className="form-group">
                <label>Program</label>
                <select
                  value={formData.program}
                  onChange={(e) => setFormData({...formData, program: e.target.value})}
                >
                  {programs.map(program => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Year</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                >
                  {[1, 2, 3, 4].map(year => (
                    <option key={year} value={year}>{year}st Year</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>{sem}th Semester</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({...formData, cgpa: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Attendance %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.attendance}
                  onChange={(e) => setFormData({...formData, attendance: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Contact Information</h3>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter address"
                  rows="2"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Emergency Contact</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  placeholder="Enter emergency contact"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => {
              setShowEditModal(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Update Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Student Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedStudent(null);
        }}
        title="Student Details"
        size="lg"
      >
        {selectedStudent && (
          <div className="view-student">
            <div className="view-header">
              <div className="view-avatar">
                {selectedStudent.name.charAt(0).toUpperCase()}
              </div>
              <div className="view-title">
                <h2>{selectedStudent.name}</h2>
                <p>{selectedStudent.email}</p>
              </div>
              <span className={`status-badge ${selectedStudent.isActive ? 'active' : 'inactive'}`}>
                {selectedStudent.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="view-grid">
              <div className="view-section">
                <h3>Personal Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <Phone size={16} />
                    <div>
                      <label>Phone</label>
                      <p>{selectedStudent.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <Mail size={16} />
                    <div>
                      <label>Email</label>
                      <p>{selectedStudent.email}</p>
                    </div>
                  </div>
                  <div className="info-item full-width">
                    <div>
                      <label>Address</label>
                      <p>{selectedStudent.address || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="info-item full-width">
                    <div>
                      <label>Emergency Contact</label>
                      <p>{selectedStudent.emergencyContact || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="view-section">
                <h3>Academic Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <BookOpen size={16} />
                    <div>
                      <label>Student ID</label>
                      <p>{selectedStudent.studentId}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <BookOpen size={16} />
                    <div>
                      <label>Program</label>
                      <p>{selectedStudent.program}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <Calendar size={16} />
                    <div>
                      <label>Year / Semester</label>
                      <p>Year {selectedStudent.year} / Sem {selectedStudent.semester}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <Award size={16} />
                    <div>
                      <label>CGPA</label>
                      <p className={`cgpa ${getCGPAClass(selectedStudent.cgpa)}`}>
                        {selectedStudent.cgpa.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="info-item">
                    <Clock size={16} />
                    <div>
                      <label>Attendance</label>
                      <p className={`attendance ${getAttendanceClass(selectedStudent.attendance)}`}>
                        {selectedStudent.attendance}%
                      </p>
                    </div>
                  </div>
                  <div className="info-item">
                    <Calendar size={16} />
                    <div>
                      <label>Batch</label>
                      <p>{selectedStudent.batch}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="view-footer">
              <Button variant="outline" onClick={() => setShowViewModal(false)}>
                Close
              </Button>
              <Button 
                variant="primary" 
                icon={Edit2}
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedStudent);
                }}
              >
                Edit Student
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentManagement;
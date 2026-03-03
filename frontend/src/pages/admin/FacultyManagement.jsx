// frontend/src/pages/admin/FacultyManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Eye,
  ChevronLeft, ChevronRight, BookOpen, Mail, Phone, Calendar,
  Award, Clock, MapPin, Briefcase, GraduationCap, User,
  AlertCircle, CheckCircle, XCircle, MoreVertical, Download,
  Upload, Filter, RefreshCw
} from 'lucide-react';
import { adminApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import './FacultyManagement.css';

const FacultyManagement = () => {
  // ===== STATE MANAGEMENT =====
  const [faculty, setFaculty] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
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
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    department: 'Computer Science',
    designation: 'Assistant Professor',
    qualification: 'PhD',
    specialization: [],
    phone: '',
    officeHours: '9 AM - 5 PM',
    cabin: '',
    joinDate: new Date().toISOString().split('T')[0],
    experience: '0',
    research: '',
    publications: '0'
  });

  // Departments list
  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Electrical',
    'Mechanical',
    'Civil',
    'Chemical',
    'Biotechnology',
    'Physics',
    'Chemistry',
    'Mathematics',
    'English',
    'Business Administration'
  ];

  // Designations list
  const designations = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Senior Lecturer',
    'Lecturer',
    'Adjunct Faculty',
    'Visiting Faculty',
    'Research Associate',
    'Department Head',
    'Dean'
  ];

  // Qualifications list
  const qualifications = [
    'PhD',
    'M.Tech',
    'M.Sc',
    'M.A',
    'M.Com',
    'MBA',
    'B.Tech',
    'B.Sc',
    'B.A',
    'B.Com',
    'Post Doctorate'
  ];

  // Specializations options
  const specializationOptions = [
    'Artificial Intelligence',
    'Machine Learning',
    'Data Science',
    'Cybersecurity',
    'Cloud Computing',
    'IoT',
    'Blockchain',
    'Web Development',
    'Mobile Development',
    'Database Systems',
    'Computer Networks',
    'Operating Systems',
    'Algorithms',
    'Software Engineering',
    'Computer Architecture',
    'Embedded Systems',
    'Robotics',
    'VLSI Design',
    'Signal Processing',
    'Communication Systems',
    'Power Systems',
    'Control Systems',
    'Thermodynamics',
    'Fluid Mechanics',
    'Structural Engineering',
    'Geotechnical Engineering',
    'Transportation Engineering',
    'Environmental Engineering',
    'Biochemistry',
    'Molecular Biology',
    'Genetics',
    'Quantum Physics',
    'Condensed Matter Physics',
    'Organic Chemistry',
    'Inorganic Chemistry',
    'Physical Chemistry',
    'Pure Mathematics',
    'Applied Mathematics',
    'Statistics',
    'Linguistics',
    'Literature',
    'Economics',
    'Finance',
    'Marketing',
    'Human Resources'
  ];

  // ===== FETCH FACULTY =====
  useEffect(() => {
    fetchFaculty();
  }, []);

  // ===== FILTER FACULTY =====
  useEffect(() => {
    filterFaculty();
  }, [searchTerm, departmentFilter, statusFilter, faculty]);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        department: departmentFilter !== 'all' ? departmentFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const response = await adminApi.getFaculty(params);
      
      // Try to extract data from all possible locations
      let facultyData = [];
      let paginationData = { page: 1, limit: 10, total: 0, pages: 1 };
      
      if (response.data?.data?.faculty && Array.isArray(response.data.data.faculty)) {
        facultyData = response.data.data.faculty;
        paginationData = response.data.data.pagination || paginationData;
      } else if (response.data?.faculty && Array.isArray(response.data.faculty)) {
        facultyData = response.data.faculty;
        paginationData = response.data.pagination || paginationData;
      } else if (Array.isArray(response.data)) {
        facultyData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        facultyData = response.data.data;
      } else if (Array.isArray(response)) {
        facultyData = response;
      }
      
      // Normalize faculty data
      const normalizedFaculty = facultyData.map(faculty => ({
        id: faculty.id || faculty._id || `temp-${Math.random()}`,
        employeeId: faculty.employeeId || faculty.employee_id || faculty.empId || 'N/A',
        name: faculty.name || faculty.user?.name || 'Unknown',
        email: faculty.email || faculty.user?.email || 'No email',
        phone: faculty.phone || faculty.user?.phone || 'N/A',
        designation: faculty.designation || 'Professor',
        department: faculty.department || 'Not specified',
        qualification: faculty.qualification || 'PhD',
        specialization: faculty.specialization || [],
        officeHours: faculty.officeHours || '9 AM - 5 PM',
        cabin: faculty.cabin || 'Not assigned',
        joinDate: faculty.joinDate || new Date().toISOString(),
        isActive: faculty.isActive !== undefined ? faculty.isActive : (faculty.user?.isActive ?? true),
        courseCount: faculty.courseCount || faculty._count?.courses || 0,
        studentCount: faculty.studentCount || 0,
        publications: faculty.publications || 0,
        research: faculty.research || '',
        createdAt: faculty.createdAt || faculty.user?.createdAt,
        lastLogin: faculty.lastLogin || faculty.user?.lastLogin || null
      }));

      setFaculty(normalizedFaculty);
      setFilteredFaculty(normalizedFaculty);
      setPagination(paginationData);
      
    } catch (err) {
      console.error('Failed to fetch faculty:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load faculty');
    } finally {
      setLoading(false);
    }
  };

  const filterFaculty = () => {
    let filtered = [...faculty];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.name?.toLowerCase().includes(term) ||
        f.email?.toLowerCase().includes(term) ||
        f.employeeId?.toLowerCase().includes(term) ||
        f.department?.toLowerCase().includes(term) ||
        f.designation?.toLowerCase().includes(term)
      );
    }
    
    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(f => f.department === departmentFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(f => 
        statusFilter === 'active' ? f.isActive : 
        statusFilter === 'inactive' ? !f.isActive : true
      );
    }
    
    setFilteredFaculty(filtered);
    setCurrentPage(1);
  };

  // ===== CRUD OPERATIONS =====
  const handleAddFaculty = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const facultyData = {
        ...formData,
        experience: parseInt(formData.experience) || 0,
        publications: parseInt(formData.publications) || 0,
        specialization: formData.specialization.filter(s => s.trim() !== ''),
        role: 'faculty'
      };
      
      const response = await adminApi.createFaculty(facultyData);
      console.log('Faculty added:', response);
      
      setShowAddModal(false);
      resetForm();
      fetchFaculty();
    } catch (err) {
      console.error('Failed to add faculty:', err);
      alert('Failed to add faculty: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditFaculty = async (e) => {
    e.preventDefault();
    if (!selectedFaculty) return;
    
    try {
      setLoading(true);
      
      const facultyData = {
        ...formData,
        experience: parseInt(formData.experience) || 0,
        publications: parseInt(formData.publications) || 0,
        specialization: formData.specialization.filter(s => s.trim() !== '')
      };
      
      const response = await adminApi.updateFaculty(selectedFaculty.id, facultyData);
      console.log('Faculty updated:', response);
      
      setShowEditModal(false);
      resetForm();
      fetchFaculty();
    } catch (err) {
      console.error('Failed to update faculty:', err);
      alert('Failed to update faculty: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await adminApi.toggleFacultyStatus(id);
      fetchFaculty();
    } catch (err) {
      console.error('Failed to toggle status:', err);
      alert('Failed to toggle faculty status');
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member? This action cannot be undone.')) {
      return;
    }
    
    try {
      await adminApi.deleteFaculty(id);
      fetchFaculty();
    } catch (err) {
      console.error('Failed to delete faculty:', err);
      alert('Failed to delete faculty');
    }
  };

  // ===== HELPER FUNCTIONS =====
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      employeeId: '',
      department: 'Computer Science',
      designation: 'Assistant Professor',
      qualification: 'PhD',
      specialization: [],
      phone: '',
      officeHours: '9 AM - 5 PM',
      cabin: '',
      joinDate: new Date().toISOString().split('T')[0],
      experience: '0',
      research: '',
      publications: '0'
    });
    setSelectedFaculty(null);
  };

  const openEditModal = (member) => {
    setSelectedFaculty(member);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      password: '',
      employeeId: member.employeeId || '',
      department: member.department || 'Computer Science',
      designation: member.designation || 'Assistant Professor',
      qualification: member.qualification || 'PhD',
      specialization: member.specialization || [],
      phone: member.phone || '',
      officeHours: member.officeHours || '9 AM - 5 PM',
      cabin: member.cabin || '',
      joinDate: member.joinDate ? new Date(member.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      experience: member.experience?.toString() || '0',
      research: member.research || '',
      publications: member.publications?.toString() || '0'
    });
    setShowEditModal(true);
  };

  const openViewModal = (member) => {
    setSelectedFaculty(member);
    setShowViewModal(true);
  };

  const handleSpecializationChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData({...formData, specialization: selected});
  };

  const getStatusBadge = (member) => {
    if (!member.isActive) {
      return { class: 'inactive', icon: XCircle, text: 'Inactive' };
    }
    return { class: 'active', icon: CheckCircle, text: 'Active' };
  };

  const getExperienceYears = (joinDate) => {
    const joined = new Date(joinDate);
    const now = new Date();
    const years = now.getFullYear() - joined.getFullYear();
    return years > 0 ? years : 0;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredFaculty.length / itemsPerPage);
  const paginatedFaculty = filteredFaculty.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const totalFaculty = faculty.length;
  const activeFaculty = faculty.filter(f => f.isActive).length;
  const inactiveFaculty = faculty.filter(f => !f.isActive).length;
  const totalCourses = faculty.reduce((sum, f) => sum + (f.courseCount || 0), 0);

  // ===== RENDER LOADING STATE =====
  if (loading && !faculty.length) {
    return (
      <div className="faculty-loading">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>Loading faculty data...</p>
        </div>
      </div>
    );
  }

  // ===== RENDER ERROR STATE =====
  if (error) {
    return (
      <div className="faculty-error">
        <AlertCircle size={64} />
        <h3>Failed to load faculty</h3>
        <p>{error}</p>
        <Button onClick={fetchFaculty} icon={RefreshCw}>
          Try Again
        </Button>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className="faculty-management">
      {/* Header Section */}
      <div className="management-header">
        <div className="header-left">
          <h1>Faculty Management</h1>
          <p className="text-muted">
            Manage faculty profiles, courses, schedules, and research activities
          </p>
        </div>
        <div className="header-actions">
          <Button 
            variant="outline" 
            size="sm" 
            icon={Download}
            onClick={() => console.log('Export faculty')}
          >
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            icon={Upload}
            onClick={() => console.log('Import faculty')}
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
            Add Faculty
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
            <span className="stat-label">Total Faculty</span>
            <span className="stat-value">{totalFaculty}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active</span>
            <span className="stat-value">{activeFaculty}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon inactive">
            <XCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Inactive</span>
            <span className="stat-value">{inactiveFaculty}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon courses">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Courses</span>
            <span className="stat-value">{totalCourses}</span>
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
              placeholder="Search by name, email, employee ID, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <select 
              className="filter-select"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

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
          </div>
        </div>
      </Card>

      {/* Faculty Grid */}
      {filteredFaculty.length === 0 ? (
        <div className="empty-state">
          <Users size={64} />
          <h3>No faculty members found</h3>
          <p className="text-muted">
            {faculty.length === 0 
              ? "Get started by adding your first faculty member" 
              : "No faculty members match your search criteria"}
          </p>
          {faculty.length === 0 && (
            <Button 
              variant="primary" 
              icon={Plus}
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
            >
              Add Your First Faculty
            </Button>
          )}
          {faculty.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="faculty-grid">
            {paginatedFaculty.map((member) => {
              const status = getStatusBadge(member);
              const StatusIcon = status.icon;
              const yearsOfExperience = getExperienceYears(member.joinDate);
              
              return (
                <Card key={member.id} className="faculty-card">
                  <div className="faculty-card-header">
                    <div className="faculty-avatar">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="faculty-header-info">
                      <h3>{member.name}</h3>
                      <p className="faculty-designation">{member.designation}</p>
                      <p className="faculty-department">{member.department}</p>
                    </div>
                    <span className={`status-badge ${status.class}`}>
                      <StatusIcon size={12} />
                      {status.text}
                    </span>
                  </div>

                  <div className="faculty-details">
                    <div className="detail-item">
                      <Mail size={14} />
                      <span>{member.email}</span>
                    </div>
                    <div className="detail-item">
                      <Phone size={14} />
                      <span>{member.phone}</span>
                    </div>
                    <div className="detail-item">
                      <Award size={14} />
                      <span>{member.qualification}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar size={14} />
                      <span>Joined {formatDate(member.joinDate)}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={14} />
                      <span>{member.officeHours}</span>
                    </div>
                    <div className="detail-item">
                      <MapPin size={14} />
                      <span>Cabin: {member.cabin}</span>
                    </div>
                  </div>

                  <div className="faculty-specialization">
                    {member.specialization && member.specialization.length > 0 ? (
                      member.specialization.slice(0, 3).map((spec, index) => (
                        <span key={index} className="spec-tag">{spec}</span>
                      ))
                    ) : (
                      <span className="spec-tag">No specializations</span>
                    )}
                    {member.specialization && member.specialization.length > 3 && (
                      <span className="spec-tag more">+{member.specialization.length - 3}</span>
                    )}
                  </div>

                  <div className="faculty-stats">
                    <div className="stat">
                      <BookOpen size={16} />
                      <div>
                        <span className="stat-label">Courses</span>
                        <span className="stat-value">{member.courseCount}</span>
                      </div>
                    </div>
                    <div className="stat">
                      <Users size={16} />
                      <div>
                        <span className="stat-label">Students</span>
                        <span className="stat-value">{member.studentCount}</span>
                      </div>
                    </div>
                    <div className="stat">
                      <GraduationCap size={16} />
                      <div>
                        <span className="stat-label">Experience</span>
                        <span className="stat-value">{yearsOfExperience}y</span>
                      </div>
                    </div>
                    <div className="stat">
                      <Award size={16} />
                      <div>
                        <span className="stat-label">Publications</span>
                        <span className="stat-value">{member.publications}</span>
                      </div>
                    </div>
                  </div>

                  <div className="faculty-actions">
                    <button 
                      className="action-btn view" 
                      title="View Details"
                      onClick={() => openViewModal(member)}
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                    <button 
                      className="action-btn edit" 
                      title="Edit Faculty"
                      onClick={() => openEditModal(member)}
                    >
                      <Edit2 size={16} />
                      <span>Edit</span>
                    </button>
                    <button 
                      className={`action-btn toggle ${member.isActive ? 'active' : 'inactive'}`}
                      title={member.isActive ? 'Deactivate' : 'Activate'}
                      onClick={() => handleToggleStatus(member.id, member.isActive)}
                    >
                      {member.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                    <button 
                      className="action-btn delete" 
                      title="Delete"
                      onClick={() => handleDeleteFaculty(member.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="action-btn more" title="More Options">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </Card>
              );
            })}
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
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          <div className="table-footer">
            <span className="showing-info">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredFaculty.length)} of {filteredFaculty.length} faculty members
            </span>
          </div>
        </>
      )}

      {/* ===== MODALS ===== */}

      {/* Add Faculty Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Faculty Member"
        size="lg"
      >
        <form onSubmit={handleAddFaculty} className="modal-form">
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
                  required={!selectedFaculty}
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
            <h3>Professional Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Employee ID *</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                  placeholder="Enter employee ID"
                  required
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Designation</label>
                <select
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                >
                  {designations.map(des => (
                    <option key={des} value={des}>{des}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Qualification</label>
                <select
                  value={formData.qualification}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                >
                  {qualifications.map(qual => (
                    <option key={qual} value={qual}>{qual}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Specializations (Hold Ctrl to select multiple)</label>
                <select
                  multiple
                  value={formData.specialization}
                  onChange={handleSpecializationChange}
                  className="multi-select"
                  size="5"
                >
                  {specializationOptions.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Work Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Office Hours</label>
                <input
                  type="text"
                  value={formData.officeHours}
                  onChange={(e) => setFormData({...formData, officeHours: e.target.value})}
                  placeholder="e.g., 9 AM - 5 PM"
                />
              </div>
              <div className="form-group">
                <label>Cabin/Office No.</label>
                <input
                  type="text"
                  value={formData.cabin}
                  onChange={(e) => setFormData({...formData, cabin: e.target.value})}
                  placeholder="Enter cabin number"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Join Date</label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  placeholder="Enter years"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Research & Publications</h3>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Research Interests</label>
                <textarea
                  value={formData.research}
                  onChange={(e) => setFormData({...formData, research: e.target.value})}
                  placeholder="Enter research interests"
                  rows="3"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Number of Publications</label>
                <input
                  type="number"
                  min="0"
                  value={formData.publications}
                  onChange={(e) => setFormData({...formData, publications: e.target.value})}
                  placeholder="Enter count"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Add Faculty
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Faculty Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Faculty Member"
        size="lg"
      >
        <form onSubmit={handleEditFaculty} className="modal-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
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
            <h3>Professional Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Employee ID</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  disabled
                  className="disabled"
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Designation</label>
                <select
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                >
                  {designations.map(des => (
                    <option key={des} value={des}>{des}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Qualification</label>
                <select
                  value={formData.qualification}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                >
                  {qualifications.map(qual => (
                    <option key={qual} value={qual}>{qual}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Specializations</label>
                <select
                  multiple
                  value={formData.specialization}
                  onChange={handleSpecializationChange}
                  className="multi-select"
                  size="5"
                >
                  {specializationOptions.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Work Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Office Hours</label>
                <input
                  type="text"
                  value={formData.officeHours}
                  onChange={(e) => setFormData({...formData, officeHours: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Cabin/Office No.</label>
                <input
                  type="text"
                  value={formData.cabin}
                  onChange={(e) => setFormData({...formData, cabin: e.target.value})}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Join Date</label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Research & Publications</h3>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Research Interests</label>
                <textarea
                  value={formData.research}
                  onChange={(e) => setFormData({...formData, research: e.target.value})}
                  rows="3"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Publications Count</label>
                <input
                  type="number"
                  min="0"
                  value={formData.publications}
                  onChange={(e) => setFormData({...formData, publications: e.target.value})}
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
              Update Faculty
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Faculty Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedFaculty(null);
        }}
        title="Faculty Details"
        size="lg"
      >
        {selectedFaculty && (
          <div className="view-faculty">
            <div className="view-header">
              <div className="view-avatar">
                {selectedFaculty.name.charAt(0).toUpperCase()}
              </div>
              <div className="view-title">
                <h2>{selectedFaculty.name}</h2>
                <p>{selectedFaculty.designation} • {selectedFaculty.department}</p>
              </div>
              <span className={`status-badge ${selectedFaculty.isActive ? 'active' : 'inactive'}`}>
                {selectedFaculty.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="view-grid">
              <div className="view-section">
                <h3>Contact Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <Mail size={16} />
                    <div>
                      <label>Email</label>
                      <p>{selectedFaculty.email}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <Phone size={16} />
                    <div>
                      <label>Phone</label>
                      <p>{selectedFaculty.phone}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <MapPin size={16} />
                    <div>
                      <label>Cabin</label>
                      <p>{selectedFaculty.cabin}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <Clock size={16} />
                    <div>
                      <label>Office Hours</label>
                      <p>{selectedFaculty.officeHours}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="view-section">
                <h3>Professional Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <Briefcase size={16} />
                    <div>
                      <label>Employee ID</label>
                      <p>{selectedFaculty.employeeId}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <Award size={16} />
                    <div>
                      <label>Qualification</label>
                      <p>{selectedFaculty.qualification}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <Calendar size={16} />
                    <div>
                      <label>Join Date</label>
                      <p>{formatDate(selectedFaculty.joinDate)}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <GraduationCap size={16} />
                    <div>
                      <label>Experience</label>
                      <p>{getExperienceYears(selectedFaculty.joinDate)} years</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="view-section full-width">
                <h3>Specializations</h3>
                <div className="specializations-list">
                  {selectedFaculty.specialization && selectedFaculty.specialization.length > 0 ? (
                    selectedFaculty.specialization.map((spec, index) => (
                      <span key={index} className="spec-tag large">{spec}</span>
                    ))
                  ) : (
                    <p className="text-muted">No specializations listed</p>
                  )}
                </div>
              </div>

              <div className="view-section full-width">
                <h3>Research Interests</h3>
                <p>{selectedFaculty.research || 'No research interests listed'}</p>
              </div>

              <div className="view-section full-width">
                <h3>Publications</h3>
                <p className="publications-count">{selectedFaculty.publications} publications</p>
              </div>

              <div className="view-section full-width">
                <h3>Teaching Statistics</h3>
                <div className="teaching-stats">
                  <div className="teaching-stat">
                    <BookOpen size={20} />
                    <div>
                      <span className="stat-label">Courses</span>
                      <span className="stat-value">{selectedFaculty.courseCount}</span>
                    </div>
                  </div>
                  <div className="teaching-stat">
                    <Users size={20} />
                    <div>
                      <span className="stat-label">Students</span>
                      <span className="stat-value">{selectedFaculty.studentCount}</span>
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
                  openEditModal(selectedFaculty);
                }}
              >
                Edit Faculty
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FacultyManagement;
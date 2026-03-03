import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, User, BookOpen,
  ChevronLeft, ChevronRight, Plus, Filter,
  Download, Upload, Edit, Save, X, Trash2, RefreshCw
} from 'lucide-react';
import { adminApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import './TimetableManager.css';

const TimetableManager = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [selectedView, setSelectedView] = useState('week');
  const [selectedDepartment, setSelectedDepartment] = useState('CSE');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    day: 'Monday',
    time: '9:00 AM',
    courseId: '',
    facultyId: '',
    room: '',
    batch: 'CSE-A',
    year: 3,
    semester: 2,
    type: 'Lecture'
  });

  // Available options
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];
  const batches = ['CSE-A', 'CSE-B', 'ECE-A', 'ECE-B', 'MECH-A', 'MECH-B', 'CIVIL-A'];
  const years = [1, 2, 3, 4];
  const semesters = [1, 2];
  const types = ['Lecture', 'Lab', 'Tutorial', 'Project'];

  // Courses and faculty for dropdowns
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);

  useEffect(() => {
    fetchTimetable();
    fetchCourses();
    fetchFaculty();
  }, [selectedBatch, selectedYear]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        batch: selectedBatch || undefined,
        year: selectedYear || undefined
      };
      
      const response = await adminApi.getTimetable(params);
      
      if (response.data?.success && response.data?.data) {
        setTimetable(response.data.data);
      } else {
        setTimetable([]);
      }
      
    } catch (err) {
      console.error('Failed to fetch timetable:', err);
      setError(err.response?.data?.message || 'Failed to load timetable');
      setTimetable([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await adminApi.getCourses({ limit: 100 });
      if (response.data?.data?.courses) {
        setCourses(response.data.data.courses);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await adminApi.getFaculty({ limit: 100 });
      if (response.data?.data?.faculty) {
        setFaculty(response.data.data.faculty);
      }
    } catch (err) {
      console.error('Failed to fetch faculty:', err);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createTimetableEntry(formData);
      setShowAddModal(false);
      resetForm();
      fetchTimetable();
    } catch (err) {
      console.error('Failed to add entry:', err);
      alert('Failed to add timetable entry');
    }
  };

  const handleEditEntry = async (e) => {
    e.preventDefault();
    if (!selectedEntry) return;
    
    try {
      await adminApi.updateTimetableEntry(selectedEntry.id, formData);
      setShowEditModal(false);
      resetForm();
      fetchTimetable();
    } catch (err) {
      console.error('Failed to update entry:', err);
      alert('Failed to update timetable entry');
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await adminApi.deleteTimetableEntry(id);
      fetchTimetable();
    } catch (err) {
      console.error('Failed to delete entry:', err);
      alert('Failed to delete timetable entry');
    }
  };

  const handleGenerateSchedule = async () => {
    try {
      alert('Auto-generate feature coming soon!');
    } catch (err) {
      console.error('Failed to generate schedule:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      day: 'Monday',
      time: '9:00 AM',
      courseId: '',
      facultyId: '',
      room: '',
      batch: 'CSE-A',
      year: 3,
      semester: 2,
      type: 'Lecture'
    });
    setSelectedEntry(null);
  };

  const openEditModal = (entry) => {
    setSelectedEntry(entry);
    setFormData({
      day: entry.day,
      time: entry.time,
      courseId: entry.courseId || '',
      facultyId: entry.facultyId || '',
      room: entry.room,
      batch: entry.batch,
      year: entry.year,
      semester: entry.semester || 2,
      type: entry.type || 'Lecture'
    });
    setShowEditModal(true);
  };

  const getTimetableEntry = (day, time) => {
    return timetable.filter(entry => 
      entry.day === day && entry.time === time
    );
  };

  const handleExport = () => {
    console.log('Export timetable');
  };

  const handleImport = () => {
    console.log('Import timetable');
  };

  const handleSaveChanges = () => {
    console.log('Save timetable changes');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>Loading timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timetable-manager">
      <div className="page-header">
        <div>
          <h1>Timetable Manager</h1>
          <p>Create and manage class schedules</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" size="sm" icon={Download} onClick={handleExport}>
            Export
          </Button>
          <Button variant="outline" size="sm" icon={Upload} onClick={handleImport}>
            Import
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddModal(true)}>
            New Schedule
          </Button>
        </div>
      </div>

      <div className="timetable-controls">
        <div className="week-navigation">
          <button className="nav-btn" onClick={() => setSelectedWeek('previous')}>
            <ChevronLeft size={18} />
          </button>
          <span className="current-week">
            {selectedWeek === 'current' ? 'Current Week' : 
             selectedWeek === 'next' ? 'Next Week' : 'Previous Week'}
          </span>
          <button className="nav-btn" onClick={() => setSelectedWeek('next')}>
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="filter-controls">
          <select 
            className="batch-select"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            <option value="">All Batches</option>
            {batches.map(batch => (
              <option key={batch} value={batch}>{batch}</option>
            ))}
          </select>

          <select 
            className="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>Year {year}</option>
            ))}
          </select>
        </div>

        <div className="view-controls">
          <button
            className={`view-btn ${selectedView === 'week' ? 'active' : ''}`}
            onClick={() => setSelectedView('week')}
          >
            Week
          </button>
          <button
            className={`view-btn ${selectedView === 'day' ? 'active' : ''}`}
            onClick={() => setSelectedView('day')}
          >
            Day
          </button>
          <select 
            className="dept-select"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="CSE">Computer Science</option>
            <option value="ECE">Electronics</option>
            <option value="ME">Mechanical</option>
            <option value="CE">Civil</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="error-state">
          <p>{error}</p>
          <Button onClick={fetchTimetable} icon={RefreshCw}>Retry</Button>
        </div>
      ) : timetable.length === 0 ? (
        <div className="empty-state">
          <Calendar size={64} />
          <h3>No timetable entries found</h3>
          <p>Get started by adding your first schedule entry</p>
          <div className="empty-actions">
            <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
              Add Entry
            </Button>
            <Button variant="outline" icon={RefreshCw} onClick={handleGenerateSchedule}>
              Generate Schedule
            </Button>
          </div>
        </div>
      ) : (
        <Card className="timetable-card">
          <div className="timetable-legend">
            {types.map(type => (
              <span key={type} className={`legend-item ${type.toLowerCase()}`}>
                {type}
              </span>
            ))}
          </div>

          <div className="timetable-grid">
            <div className="timetable-header">
              <div className="time-column">Time</div>
              {days.map(day => (
                <div key={day} className="day-column">{day}</div>
              ))}
            </div>

            <div className="timetable-body">
              {timeSlots.map(time => (
                <div key={time} className="timetable-row">
                  <div className="time-cell">{time}</div>
                  {days.map(day => {
                    const entries = getTimetableEntry(day, time);
                    return (
                      <div key={`${day}-${time}`} className="day-cell">
                        {entries.length > 0 ? (
                          entries.map(entry => (
                            <div 
                              key={entry.id} 
                              className={`timetable-entry ${entry.type?.toLowerCase() || 'lecture'}`}
                            >
                              <div className="entry-header">
                                <span className="entry-course">{entry.course}</span>
                                <div className="entry-actions">
                                  <button 
                                    className="icon-btn edit"
                                    onClick={() => openEditModal(entry)}
                                  >
                                    <Edit size={12} />
                                  </button>
                                  <button 
                                    className="icon-btn delete"
                                    onClick={() => handleDeleteEntry(entry.id)}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                              <div className="entry-faculty">{entry.faculty}</div>
                              <div className="entry-details">
                                <span><MapPin size={10} /> {entry.room}</span>
                                <span className="entry-badge">{entry.batch}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <button className="empty-cell" onClick={() => setShowAddModal(true)}>
                            +
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="timetable-actions">
        <Button variant="outline" size="sm" icon={Save} onClick={handleSaveChanges}>
          Save Changes
        </Button>
        <Button variant="outline" size="sm" icon={Filter} onClick={() => console.log('Filter')}>
          Filter
        </Button>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={handleGenerateSchedule}>
          Auto Generate
        </Button>
      </div>

      {/* Add Entry Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add Timetable Entry"
        size="lg"
      >
        <form onSubmit={handleAddEntry} className="timetable-form">
          <div className="form-row">
            <div className="form-group">
              <label>Day *</label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({...formData, day: e.target.value})}
                required
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Time *</label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
              >
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Course *</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                required
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Faculty *</label>
              <select
                value={formData.facultyId}
                onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                required
              >
                <option value="">Select Faculty</option>
                {faculty.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Room *</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({...formData, room: e.target.value})}
                placeholder="e.g., Room 201, Lab 101"
                required
              />
            </div>
            <div className="form-group">
              <label>Batch *</label>
              <select
                value={formData.batch}
                onChange={(e) => setFormData({...formData, batch: e.target.value})}
                required
              >
                {batches.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Year *</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                required
              >
                {years.map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Semester *</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})}
                required
              >
                {semesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Entry
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Entry Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Timetable Entry"
        size="lg"
      >
        <form onSubmit={handleEditEntry} className="timetable-form">
          <div className="form-row">
            <div className="form-group">
              <label>Day *</label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({...formData, day: e.target.value})}
                required
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Time *</label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
              >
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Course *</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                required
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Faculty *</label>
              <select
                value={formData.facultyId}
                onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                required
              >
                <option value="">Select Faculty</option>
                {faculty.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Room *</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({...formData, room: e.target.value})}
                placeholder="e.g., Room 201, Lab 101"
                required
              />
            </div>
            <div className="form-group">
              <label>Batch *</label>
              <select
                value={formData.batch}
                onChange={(e) => setFormData({...formData, batch: e.target.value})}
                required
              >
                {batches.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Year *</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                required
              >
                {years.map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Semester *</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})}
                required
              >
                {semesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => {
              setShowEditModal(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TimetableManager;
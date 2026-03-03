import React, { useState, useEffect } from 'react';
import { 
  Download, Upload, Search, Filter, Eye,
  ChevronDown, ChevronUp, Save, Edit2
} from 'lucide-react';
import { facultyApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './FacultyGradebook.css';

const FacultyGradebook = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);
  const [courses, setCourses] = useState([]);
  const [gradebook, setGradebook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchGradebook(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await facultyApi.getCourses();
      setCourses(response.data || []);
      if (response.data?.length > 0) {
        setSelectedCourse(response.data[0].code);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchGradebook = async (courseId) => {
    setLoading(true);
    try {
      const response = await facultyApi.getGradebook(courseId);
      setGradebook(response.data);
    } catch (error) {
      console.error('Failed to fetch gradebook:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (avg) => {
    if (avg >= 90) return { grade: 'A', color: '#10b981' };
    if (avg >= 80) return { grade: 'B', color: '#3b82f6' };
    if (avg >= 70) return { grade: 'C', color: '#f59e0b' };
    if (avg >= 60) return { grade: 'D', color: '#f97316' };
    return { grade: 'F', color: '#ef4444' };
  };

  const calculateAverage = (scores) => {
    if (!scores) return 0;
    const values = Object.values(scores).filter(s => s !== null && s !== undefined);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  if (loading && selectedCourse) return <div className="loading-screen"><div className="loader"></div></div>;

  return (
    <div className="faculty-gradebook">
      <div className="page-header">
        <div>
          <h1>Gradebook</h1>
          <p>Manage student grades and performance</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" size="sm" icon={Download}>
            Export
          </Button>
          <Button variant="outline" size="sm" icon={Upload}>
            Import
          </Button>
          <Button variant="primary" size="sm" icon={Save}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="gradebook-controls">
        <div className="course-selector">
          <label>Course</label>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
            {courses.map(course => (
              <option key={course.id} value={course.code}>{course.code} - {course.name}</option>
            ))}
          </select>
        </div>

        <div className="assignment-selector">
          <label>Assignment</label>
          <select value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)}>
            <option value="all">All Assignments</option>
            {gradebook?.assignments?.map(assignment => (
              <option key={assignment.id} value={assignment.id}>{assignment.name}</option>
            ))}
          </select>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Search students..." />
        </div>
      </div>

      <Card className="gradebook-table-container">
        <table className="gradebook-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>ID</th>
              {gradebook?.assignments?.map(assignment => (
                <th key={assignment.id}>
                  <div className="assignment-header">
                    <span>{assignment.name}</span>
                    <span className="assignment-weight">{assignment.weight || 0}%</span>
                  </div>
                </th>
              ))}
              <th>Attendance</th>
              <th>Average</th>
              <th>Grade</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {gradebook?.students?.length > 0 ? (
              gradebook.students.map(student => {
                const avg = calculateAverage(student.grades);
                const grade = calculateGrade(avg);
                
                return (
                  <React.Fragment key={student.id}>
                    <tr 
                      className={expandedRow === student.id ? 'expanded' : ''}
                      onClick={() => setExpandedRow(expandedRow === student.id ? null : student.id)}
                    >
                      <td>
                        <div className="student-cell">
                          <div className="student-avatar">
                            {student.name?.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span>{student.name}</span>
                        </div>
                      </td>
                      <td>{student.studentId}</td>
                      {gradebook.assignments?.map(assignment => (
                        <td key={assignment.id} className="score-cell">
                          {student.grades?.[assignment.id] !== undefined ? (
                            <span className="score">{student.grades[assignment.id]}</span>
                          ) : (
                            <span className="no-score">-</span>
                          )}
                        </td>
                      ))}
                      <td>
                        <span className={`attendance ${student.attendance >= 75 ? 'good' : 'poor'}`}>
                          {student.attendance || 0}%
                        </span>
                      </td>
                      <td>
                        <span className="average">{avg.toFixed(1)}</span>
                      </td>
                      <td>
                        <span className="grade" style={{ color: grade.color }}>
                          {grade.grade}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn" onClick={(e) => e.stopPropagation()}>
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                    {expandedRow === student.id && (
                      <tr className="expanded-details">
                        <td colSpan={gradebook.assignments?.length + 6}>
                          <div className="student-details">
                            <h4>Submission Details</h4>
                            <div className="submissions-grid">
                              {gradebook.assignments?.map(assignment => (
                                <div key={assignment.id} className="submission-detail">
                                  <span className="detail-label">{assignment.name}:</span>
                                  <input 
                                    type="number" 
                                    defaultValue={student.grades?.[assignment.id] || ''}
                                    placeholder="Enter score"
                                    className="score-input"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <span className="max-score">/ {assignment.maxScore || 100}</span>
                                </div>
                              ))}
                            </div>
                            <div className="detail-actions">
                              <Button size="sm">Save Scores</Button>
                              <Button size="sm" variant="outline">Add Comment</Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr><td colSpan={gradebook?.assignments?.length + 6} className="no-data">No students enrolled</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default FacultyGradebook;
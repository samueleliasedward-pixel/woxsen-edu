import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import { Send, X, ArrowLeft, HelpCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './NewQuery.css';

const NewQuery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendQuery } = useSocket();
  
  const [newQuery, setNewQuery] = useState('');
  const [facultyList, setFacultyList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      fetchFaculty();
      fetchCourses();
    }
  }, [user]);

  const fetchFaculty = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/faculty', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setFacultyList(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch faculty:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/student/courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newQuery.trim() || !selectedFaculty || isSubmitting) return;

    setIsSubmitting(true);

    sendQuery({
      content: newQuery,
      facultyId: selectedFaculty,
      courseId: selectedCourse || null
    });

    // Show success message and redirect
    setTimeout(() => {
      navigate('/queries');
    }, 1000);
  };

  if (user?.role !== 'STUDENT') {
    return (
      <div className="new-query-page">
        <Card className="error-card">
          <h2>Access Denied</h2>
          <p>Only students can create new queries.</p>
          <Button onClick={() => navigate('/queries')}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="new-query-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/queries')}>
          <ArrowLeft size={18} />
          Back to Queries
        </button>
        <h1>Ask a Question</h1>
        <p>Get help from your faculty</p>
      </div>

      <Card className="new-query-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="faculty">Select Faculty *</label>
            <select
              id="faculty"
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              required
            >
              <option value="">Choose faculty...</option>
              {facultyList.map(faculty => (
                <option key={faculty.id} value={faculty.userId}>
                  {faculty.name} - {faculty.department}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="course">Related Course (Optional)</label>
            <select
              id="course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">General question (no specific course)</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="question">Your Question *</label>
            <textarea
              id="question"
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              placeholder="Type your question here... Be specific to get better help"
              rows="6"
              required
            />
          </div>

          <div className="tips-box">
            <HelpCircle size={18} />
            <div>
              <strong>Tips for good questions:</strong>
              <ul>
                <li>Be specific about what you need help with</li>
                <li>Mention any relevant course material or concepts</li>
                <li>Include what you've already tried</li>
              </ul>
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => navigate('/queries')}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="gold" 
              disabled={!newQuery.trim() || !selectedFaculty || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Question'}
              {!isSubmitting && <Send size={16} />}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewQuery;
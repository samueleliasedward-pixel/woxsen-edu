import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Clock, Calendar, TrendingUp, 
  Bell, CheckCircle, AlertCircle, Download,
  FileText, MessageSquare, Plus, Eye
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { facultyApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './FacultyDashboard.css';

const FacultyDashboard = () => {
  const { user } = useAuth();
  
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalStudents: 0,
      activeCourses: 0,
      pendingGrading: 0,
      attendance: '0%'
    },
    todaysClasses: [],
    recentSubmissions: [],
    pendingTasks: [],
    upcomingDeadlines: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await facultyApi.getDashboard();
      
      // Extract dashboard data
      let data = {};
      
      if (response.data?.data) {
        data = response.data.data;
      } else if (response.data) {
        data = response.data;
      }
      
      setDashboardData({
        stats: {
          totalStudents: data.stats?.totalStudents || 0,
          activeCourses: data.stats?.totalCourses || 0,
          pendingGrading: data.stats?.pendingAssignments || 0,
          attendance: data.stats?.avgAttendance || '0%'
        },
        todaysClasses: data.todaysClasses || [],
        recentSubmissions: data.recentSubmissions || [],
        pendingTasks: data.pendingTasks || [],
        upcomingDeadlines: data.upcomingDeadlines || []
      });
      
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>{getGreeting()}, {user?.name || 'Faculty'}!</h1>
          <p className="date">{getCurrentDate()}</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" size="sm" icon={Bell}>
            Notifications
          </Button>
          <Button variant="outline" size="sm" icon={Download}>
            Reports
          </Button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchDashboardData} className="retry-btn">Retry</button>
        </div>
      )}

      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-icon students">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{dashboardData.stats.totalStudents}</span>
            <span className="stat-trend positive">
              <TrendingUp size={14} /> ↑ 12 this sem
            </span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon courses">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Courses</span>
            <span className="stat-value">{dashboardData.stats.activeCourses}</span>
            <span className="stat-trend">4 this semester</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending Grading</span>
            <span className="stat-value">{dashboardData.stats.pendingGrading}</span>
            <span className="stat-trend warning">8 urgent</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon attendance">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Attendance</span>
            <span className="stat-value">{dashboardData.stats.attendance}</span>
            <span className="stat-trend positive">↑ 2%</span>
          </div>
        </Card>
      </div>

      <div className="dashboard-grid">
        <div className="grid-left">
          <Card className="classes-card">
            <div className="card-header">
              <h2>Today's Classes</h2>
              <Button variant="outline" size="sm">View Schedule</Button>
            </div>
            {dashboardData.todaysClasses.length === 0 ? (
              <div className="empty-state small">
                <Calendar size={32} />
                <p>No classes today</p>
              </div>
            ) : (
              <div className="classes-list">
                {dashboardData.todaysClasses.map((classItem, index) => (
                  <div key={index} className="class-item">
                    <div className="class-time">
                      <Clock size={14} />
                      <span>{classItem.time || '9:00 AM'}</span>
                    </div>
                    <div className="class-info">
                      <h3>{classItem.course || 'Course Name'}</h3>
                      <p className="class-topic">{classItem.topic || 'Introduction'}</p>
                      <div className="class-meta">
                        <span><Users size={12} /> {classItem.students || 0} students</span>
                        <span><Calendar size={12} /> {classItem.room || 'Room 101'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="submissions-card">
            <div className="card-header">
              <h2>Recent Submissions</h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            {dashboardData.recentSubmissions.length === 0 ? (
              <div className="empty-state small">
                <FileText size={32} />
                <p>No recent submissions</p>
              </div>
            ) : (
              <div className="submissions-list">
                {dashboardData.recentSubmissions.map((submission, index) => (
                  <div key={index} className="submission-item">
                    <div className="student-avatar">
                      {submission.student?.split(' ').map(n => n[0]).join('') || 'S'}
                    </div>
                    <div className="submission-info">
                      <h4>{submission.student || 'Student Name'}</h4>
                      <p>{submission.assignment || 'Assignment Title'}</p>
                    </div>
                    <div className="submission-meta">
                      <span className={`submission-status ${submission.status || 'pending'}`}>
                        {submission.status || 'Pending'}
                      </span>
                      <span className="submission-time">{submission.time || '2 hours ago'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="grid-right">
          <Card className="tasks-card">
            <div className="card-header">
              <h2>Pending Tasks</h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            {dashboardData.pendingTasks.length === 0 ? (
              <div className="empty-state small">
                <CheckCircle size={32} />
                <p>No pending tasks</p>
              </div>
            ) : (
              <div className="tasks-list">
                {dashboardData.pendingTasks.map((task, index) => (
                  <div key={index} className={`task-item priority-${task.priority || 'medium'}`}>
                    <div className="task-info">
                      <h3>{task.title || 'Task Title'}</h3>
                      <p>{task.course || 'Course Name'}</p>
                    </div>
                    <div className="task-meta">
                      <span className="task-count">{task.count || 0} items</span>
                      <span className="task-due">{task.due || 'Due today'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="deadlines-card">
            <div className="card-header">
              <h2>Upcoming Deadlines</h2>
            </div>
            {dashboardData.upcomingDeadlines.length === 0 ? (
              <div className="empty-state small">
                <Clock size={32} />
                <p>No upcoming deadlines</p>
              </div>
            ) : (
              <div className="deadlines-list">
                {dashboardData.upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="deadline-item">
                    <div className="deadline-header">
                      <h3>{deadline.title || 'Deadline Title'}</h3>
                      <span className="deadline-date">{deadline.due || 'Mar 15'}</span>
                    </div>
                    <p className="deadline-course">{deadline.course || 'Course Name'}</p>
                    <div className="deadline-progress">
                      <div className="progress-info">
                        <span>Submissions</span>
                        <span>{deadline.submissions || 0}/{deadline.total || 50}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${((deadline.submissions || 0) / (deadline.total || 50)) * 100}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-btn">
                <FileText size={20} />
                <span>Post Assignment</span>
              </button>
              <button className="action-btn">
                <MessageSquare size={20} />
                <span>Announcement</span>
              </button>
              <button className="action-btn">
                <Download size={20} />
                <span>Download Grades</span>
              </button>
              <button className="action-btn">
                <Clock size={20} />
                <span>Office Hours</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
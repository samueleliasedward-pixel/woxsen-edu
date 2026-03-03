import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, Users, BookOpen,
  ChevronLeft, ChevronRight, Filter, Download,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { facultyApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './FacultySchedule.css';

const FacultySchedule = () => {
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekRange());
  const [selectedView, setSelectedView] = useState('week');
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchSchedule();
  }, []);

  function getCurrentWeekRange() {
    const now = new Date();
    const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 7));
    return `${firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  const fetchSchedule = async () => {
    try {
      const response = await facultyApi.getSchedule();
      setSchedule(response.data || {});
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type) => {
    switch(type) {
      case 'Lecture': return { bg: 'rgba(198, 167, 94, 0.1)', color: '#C6A75E', border: '#C6A75E' };
      case 'Lab': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '#3b82f6' };
      case 'Office Hours': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '#10b981' };
      case 'Meeting': return { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '#8b5cf6' };
      default: return { bg: '#f8fafc', color: '#666', border: '#666' };
    }
  };

  if (loading) return <div className="loading-screen"><div className="loader"></div></div>;

  return (
    <div className="faculty-schedule">
      <div className="page-header">
        <div>
          <h1>My Schedule</h1>
          <p>Manage your classes and office hours</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" size="sm" icon={Download}>
            Export
          </Button>
          <Button variant="outline" size="sm" icon={Filter}>
            Filter
          </Button>
        </div>
      </div>

      <div className="schedule-controls">
        <div className="week-navigation">
          <button className="nav-btn">
            <ChevronLeft size={18} />
          </button>
          <span className="current-week">{selectedWeek}</span>
          <button className="nav-btn">
            <ChevronRight size={18} />
          </button>
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
          <button
            className={`view-btn ${selectedView === 'month' ? 'active' : ''}`}
            onClick={() => setSelectedView('month')}
          >
            Month
          </button>
        </div>
      </div>

      <Card className="schedule-grid-container">
        <div className="schedule-grid">
          <div className="time-column">
            <div className="corner-cell"></div>
            {Array.from({ length: 11 }, (_, i) => i + 8).map(hour => (
              <div key={hour} className="time-cell">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {days.map(day => (
            <div key={day} className="day-column">
              <div className="day-header">
                <span className="day-name">{day}</span>
                <span className="day-date">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="day-schedule">
                {schedule[day]?.length > 0 ? (
                  schedule[day].map((event, index) => {
                    const startHour = parseInt(event.time?.split(':')[0] || '9');
                    const endHour = startHour + 1;
                    const topPosition = (startHour - 8) * 60;
                    const height = 60;
                    const colors = getEventTypeColor(event.type);

                    return (
                      <div
                        key={index}
                        className="schedule-event"
                        style={{
                          top: `${topPosition}px`,
                          height: `${height}px`,
                          background: colors.bg,
                          borderLeftColor: colors.border
                        }}
                      >
                        <div className="event-content">
                          <div className="event-time">{event.time}</div>
                          <h4>{event.course}</h4>
                          {event.code && <span className="event-code">{event.code}</span>}
                          <div className="event-details">
                            <span><MapPin size={12} /> {event.room}</span>
                            {event.students && (
                              <span><Users size={12} /> {event.students} students</span>
                            )}
                          </div>
                          <span className="event-type" style={{ color: colors.color }}>
                            {event.type}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-event">No classes scheduled</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="schedule-legend">
        <div className="legend-item">
          <span className="legend-color lecture"></span>
          <span>Lecture</span>
        </div>
        <div className="legend-item">
          <span className="legend-color lab"></span>
          <span>Lab</span>
        </div>
        <div className="legend-item">
          <span className="legend-color office"></span>
          <span>Office Hours</span>
        </div>
        <div className="legend-item">
          <span className="legend-color meeting"></span>
          <span>Meeting</span>
        </div>
      </div>
    </div>
  );
};

export default FacultySchedule;
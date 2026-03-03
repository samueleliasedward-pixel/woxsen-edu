import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, BookOpen, MapPin, Users,
  ChevronLeft, ChevronRight, Filter, RefreshCw
} from 'lucide-react';
import { studentApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './StudentTimetable.css';

const StudentTimetable = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [selectedDay, setSelectedDay] = useState('all');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

  useEffect(() => {
    fetchTimetable();
  }, [selectedWeek]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await studentApi.getTimetable();
      
      let timetableData = [];
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        timetableData = response.data.data;
      } else if (Array.isArray(response.data)) {
        timetableData = response.data;
      } else if (response.data?.timetable && Array.isArray(response.data.timetable)) {
        timetableData = response.data.timetable;
      }
      
      setTimetable(timetableData);
      
    } catch (err) {
      console.error('Error fetching timetable:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const getEntryForTimeSlot = (day, time) => {
    return timetable.filter(entry => entry.day === day && entry.time === time);
  };

  const filteredDays = selectedDay === 'all' ? days : [selectedDay];

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
    <div className="student-timetable">
      <div className="page-header">
        <div>
          <h1>My Timetable</h1>
          <p>View your class schedule</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <BookOpen size={18} />
            <span>{timetable.length} Classes</span>
          </div>
          <div className="stat-badge">
            <Calendar size={18} />
            <span>{filteredDays.length} Days</span>
          </div>
        </div>
      </div>

      <div className="week-navigation">
        <button 
          className="nav-btn"
          onClick={() => setSelectedWeek('previous')}
        >
          <ChevronLeft size={20} />
        </button>
        <span className="current-week">
          {selectedWeek === 'current' && 'Current Week'}
          {selectedWeek === 'next' && 'Next Week'}
          {selectedWeek === 'previous' && 'Previous Week'}
        </span>
        <button 
          className="nav-btn"
          onClick={() => setSelectedWeek('next')}
        >
          <ChevronRight size={20} />
        </button>
        <Button 
          variant="outline" 
          size="sm" 
          icon={RefreshCw} 
          onClick={fetchTimetable}
          className="refresh-btn"
        >
          Refresh
        </Button>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={fetchTimetable} className="retry-btn">Retry</button>
        </div>
      )}

      <Card className="timetable-card">
        <div className="timetable-header">
          <h2>Class Schedule</h2>
          <div className="timetable-controls">
            <div className="day-filter">
              <button 
                className={`day-btn ${selectedDay === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedDay('all')}
              >
                All Days
              </button>
              {days.map(day => (
                <button
                  key={day}
                  className={`day-btn ${selectedDay === day ? 'active' : ''}`}
                  onClick={() => setSelectedDay(day)}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" icon={Filter}>Filter</Button>
          </div>
        </div>

        {timetable.length === 0 ? (
          <div className="empty-state">
            <Calendar size={64} />
            <h3>No timetable entries</h3>
            <p>Your class schedule will appear here once it's published.</p>
          </div>
        ) : (
          <div className="timetable-container">
            <div className="timetable-grid">
              <div className="timetable-header-row">
                <div className="time-column-header">Time</div>
                {filteredDays.map(day => (
                  <div key={day} className="day-column-header">{day}</div>
                ))}
              </div>

              <div className="timetable-body">
                {timeSlots.map(time => (
                  <div key={time} className="timetable-row">
                    <div className="time-cell">{time}</div>
                    {filteredDays.map(day => {
                      const entries = getEntryForTimeSlot(day, time);
                      return (
                        <div key={`${day}-${time}`} className="day-cell">
                          {entries.length > 0 ? (
                            entries.map(entry => (
                              <div key={entry.id} className="timetable-entry">
                                <div className="entry-header">
                                  <span className="entry-course">{entry.course}</span>
                                  <span className="entry-code">{entry.code}</span>
                                </div>
                                <div className="entry-details">
                                  <div className="entry-faculty">
                                    <Users size={12} />
                                    <span>{entry.faculty}</span>
                                  </div>
                                  <div className="entry-room">
                                    <MapPin size={12} />
                                    <span>{entry.room}</span>
                                  </div>
                                </div>
                                {entry.batch && (
                                  <div className="entry-batch">
                                    Batch: {entry.batch}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="empty-cell">
                              <span>—</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="timetable-legend">
              <div className="legend-item">
                <span className="legend-color lecture"></span>
                <span>Lecture</span>
              </div>
              <div className="legend-item">
                <span className="legend-color lab"></span>
                <span>Lab</span>
              </div>
              <div className="legend-item">
                <span className="legend-color tutorial"></span>
                <span>Tutorial</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentTimetable;
import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, Eye, Pin, Users } from 'lucide-react';
import { announcementApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import './FacultyAnnouncements.css';

const FacultyAnnouncements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementApi.getAnnouncements();
      let data = [];
      if (response.data?.data) {
        data = response.data.data;
      }
      // Filter for faculty-relevant announcements
      const facultyAnnouncements = data.filter(a => 
        a.target === 'all' || a.target === 'faculty' || a.target === user?.role?.toLowerCase()
      );
      setAnnouncements(facultyAnnouncements);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="faculty-announcements">
      <h1>Announcements</h1>
      {announcements.length === 0 ? (
        <Card className="empty-state">
          <Bell size={48} />
          <h3>No announcements</h3>
          <p>There are no announcements for you at this time.</p>
        </Card>
      ) : (
        <div className="announcements-list">
          {announcements.map(a => (
            <Card key={a.id} className={`announcement-card ${a.pinned ? 'pinned' : ''}`}>
              {a.pinned && <Pin size={16} className="pinned-icon" />}
              <h3>{a.title}</h3>
              <p>{a.content}</p>
              <div className="meta">
                <span><Calendar size={14} /> {new Date(a.createdAt).toLocaleDateString()}</span>
                <span><Users size={14} /> {a.target}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyAnnouncements;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Smartphone, 
  Laptop, 
  Tablet,
  ChevronRight,
  Sparkles,
  MessageSquare,
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  X
} from 'lucide-react';
import './Demo.css';

const Demo = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('student');
  const [showVideo, setShowVideo] = useState(false);

  const demoSections = [
    {
      id: 'student',
      title: 'Student Portal',
      description: 'Experience learning from a student\'s perspective',
      features: [
        'AI Assistant for instant help',
        'Dashboard with GPA tracking',
        'Assignment submissions',
        'Query portal to ask faculty',
        'Timetable & exam schedules'
      ],
      image: '🎓'
    },
    {
      id: 'faculty',
      title: 'Faculty Portal',
      description: 'See how faculty manage courses and students',
      features: [
        'Course management',
        'Assignment creation & grading',
        'Student query responses',
        'Announcement system',
        'Gradebook analytics'
      ],
      image: '👨‍🏫'
    },
    {
      id: 'admin',
      title: 'Admin Portal',
      description: 'Oversee the entire platform from admin view',
      features: [
        'Student & faculty management',
        'System analytics',
        'Course administration',
        'Timetable scheduling',
        'Security settings'
      ],
      image: '👑'
    }
  ];

  const devices = [
    { icon: <Laptop size={20} />, name: 'Desktop' },
    { icon: <Tablet size={20} />, name: 'Tablet' },
    { icon: <Smartphone size={20} />, name: 'Mobile' }
  ];

  return (
    <div className="demo-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Live Demo</h1>
        <p>See Woxsen EDU AI in action</p>
      </div>

      {showVideo && (
        <div className="video-modal" onClick={() => setShowVideo(false)}>
          <div className="video-content" onClick={e => e.stopPropagation()}>
            <button className="close-video" onClick={() => setShowVideo(false)}>
              <X size={24} />
            </button>
            <div className="video-placeholder">
              <Play size={64} />
              <p>Demo Video Would Play Here</p>
              <small>In production, embed your platform walkthrough video</small>
            </div>
          </div>
        </div>
      )}

      <div className="demo-showcase">
        <div className="demo-header">
          <button className="play-demo-btn" onClick={() => setShowVideo(true)}>
            <Play size={20} />
            Watch Full Demo
          </button>
          <div className="device-selector">
            {devices.map((device, index) => (
              <div key={index} className="device-icon" title={device.name}>
                {device.icon}
              </div>
            ))}
          </div>
        </div>

        <div className="demo-tabs">
          {demoSections.map(section => (
            <button
              key={section.id}
              className={`demo-tab ${activeTab === section.id ? 'active' : ''}`}
              onClick={() => setActiveTab(section.id)}
            >
              <span className="tab-emoji">{section.image}</span>
              {section.title}
            </button>
          ))}
        </div>

        <div className="demo-content">
          {demoSections.map(section => (
            <div
              key={section.id}
              className={`demo-panel ${activeTab === section.id ? 'active' : ''}`}
            >
              <div className="demo-panel-header">
                <h2>{section.title}</h2>
                <p>{section.description}</p>
              </div>

              <div className="demo-grid">
                <div className="demo-features">
                  <h3>Key Features</h3>
                  <ul>
                    {section.features.map((feature, idx) => (
                      <li key={idx}>
                        <Sparkles size={16} color="#C6A75E" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="try-demo-btn" onClick={() => navigate('/register')}>
                    Try it Yourself
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="demo-preview">
                  <div className="preview-card">
                    <div className="preview-header">
                      <div className="preview-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className="preview-title">Live Preview</span>
                    </div>
                    <div className="preview-content">
                      {activeTab === 'student' && (
                        <>
                          <div className="preview-stat">GPA: 8.7 ↑</div>
                          <div className="preview-message">
                            <MessageSquare size={14} />
                            <span>AI: How can I help?</span>
                          </div>
                          <div className="preview-calendar">📅 Today: ML Class 9:00 AM</div>
                        </>
                      )}
                      {activeTab === 'faculty' && (
                        <>
                          <div className="preview-stat">Pending: 23 assignments</div>
                          <div className="preview-message">
                            <Users size={14} />
                            <span>3 student queries</span>
                          </div>
                          <div className="preview-calendar">📊 Gradebook ready</div>
                        </>
                      )}
                      {activeTab === 'admin' && (
                        <>
                          <div className="preview-stat">Active Users: 1,247</div>
                          <div className="preview-message">
                            <TrendingUp size={14} />
                            <span>System: 98% uptime</span>
                          </div>
                          <div className="preview-calendar">⚙️ 3 pending actions</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="demo-cta">
        <h2>Ready to experience it yourself?</h2>
        <button className="btn-primary" onClick={() => navigate('/register')}>
          Create Free Account
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Demo;
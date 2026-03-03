import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  MessageSquare, 
  BookOpen, 
  Users, 
  Calendar, 
  TrendingUp,
  Shield,
  Zap,
  Clock,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import './Features.css';

const Features = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain size={40} />,
      title: 'AI-Powered Learning Assistant',
      description: 'Powered by Ollama Llama 2, our AI assistant helps you understand complex topics, solve doubts instantly, and provides personalized study recommendations.',
      details: [
        '24/7 available for queries',
        'Context-aware responses',
        'Code explanation & generation',
        'Study material recommendations',
        'Multi-language support'
      ],
      color: '#C6A75E'
    },
    {
      icon: <MessageSquare size={40} />,
      title: 'Real-time Query Portal',
      description: 'Students can ask doubts directly to faculty and get instant responses. Live chat with typing indicators and online status for seamless communication.',
      details: [
        'Instant notifications',
        'Typing indicators',
        'Online/offline status',
        'Message history',
        'File attachments'
      ],
      color: '#3b82f6'
    },
    {
      icon: <BookOpen size={40} />,
      title: 'Smart Assignment Management',
      description: 'Submit assignments, track deadlines, and receive intelligent feedback. Faculty can create, grade, and manage assignments efficiently.',
      details: [
        'Deadline reminders',
        'Plagiarism detection',
        'Rubric-based grading',
        'Bulk download submissions',
        'Automated feedback'
      ],
      color: '#10b981'
    },
    {
      icon: <Users size={40} />,
      title: 'Role-Based Dashboards',
      description: 'Customized experiences for Students, Faculty, and Admin. Each role gets relevant features, data, and permissions.',
      details: [
        'Student: GPA tracking, courses',
        'Faculty: Class management',
        'Admin: System oversight',
        'Analytics & reports',
        'Permission controls'
      ],
      color: '#8b5cf6'
    },
    {
      icon: <Calendar size={40} />,
      title: 'Academic Calendar & Timetable',
      description: 'View class schedules, exam dates, and important deadlines. Real-time updates when schedules change.',
      details: [
        'Interactive timetable',
        'Exam countdown',
        'Schedule notifications',
        'Room allocations',
        'Holiday calendar'
      ],
      color: '#f59e0b'
    },
    {
      icon: <TrendingUp size={40} />,
      title: 'Progress Analytics',
      description: 'Track GPA, attendance, assignment completion with beautiful charts. Identify areas for improvement.',
      details: [
        'GPA trends',
        'Attendance tracking',
        'Performance insights',
        'Comparative analytics',
        'Progress reports'
      ],
      color: '#ec4899'
    },
    {
      icon: <Shield size={40} />,
      title: 'Secure Authentication',
      description: 'Role-based access control with JWT authentication. Your data is safe and secure.',
      details: [
        'JWT tokens',
        'Password encryption',
        'Role permissions',
        'Session management',
        '2FA support'
      ],
      color: '#6b7280'
    },
    {
      icon: <Zap size={40} />,
      title: 'Real-time Updates',
      description: 'Instant notifications for announcements, deadline changes, and query responses using WebSocket.',
      details: [
        'Live notifications',
        'Instant messaging',
        'Schedule updates',
        'System alerts',
        'Email integration'
      ],
      color: '#ef4444'
    }
  ];

  return (
    <div className="features-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Platform Features</h1>
        <p>Discover what makes Woxsen EDU AI the future of education</p>
      </div>

      <div className="features-grid-detailed">
        {features.map((feature, index) => (
          <div key={index} className="feature-detailed-card">
            <div className="feature-detailed-icon" style={{ background: `${feature.color}15`, color: feature.color }}>
              {feature.icon}
            </div>
            <h2>{feature.title}</h2>
            <p className="feature-detailed-description">{feature.description}</p>
            <div className="feature-details-list">
              {feature.details.map((detail, idx) => (
                <div key={idx} className="feature-detail-item">
                  <Sparkles size={16} style={{ color: feature.color }} />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="features-cta">
        <h2>Ready to experience these features?</h2>
        <button className="btn-primary" onClick={() => navigate('/register')}>
          Get Started Now
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Features;
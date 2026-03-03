import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  LayoutDashboard, 
  Bot, 
  MessageSquare,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Clock,
  Bell,
  Star
} from 'lucide-react';
import './HowItWorks.css';

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: <UserPlus size={48} />,
      title: '1. Sign Up',
      description: 'Create your account as Student, Faculty, or Admin',
      details: [
        'Use your @woxsen.edu email',
        'Faculty: Employee ID required',
        'Students: Enrollment number needed',
        'Email verification',
        'Set up your profile'
      ],
      time: '2 minutes'
    },
    {
      icon: <LayoutDashboard size={48} />,
      title: '2. Access Dashboard',
      description: 'Get your personalized dashboard based on your role',
      details: [
        'Students: View GPA, courses, deadlines',
        'Faculty: See classes, pending grading',
        'Admin: System overview & analytics',
        'Customize your view',
        'Quick access to features'
      ],
      time: '1 minute'
    },
    {
      icon: <Bot size={48} />,
      title: '3. Use AI Assistant',
      description: 'Ask questions, get help with assignments, understand concepts',
      details: [
        'Type naturally - AI understands context',
        'Get code examples & explanations',
        'Study tips & recommendations',
        '24/7 availability',
        'Multi-subject support'
      ],
      time: 'Instant'
    },
    {
      icon: <MessageSquare size={48} />,
      title: '4. Collaborate in Real-time',
      description: 'Ask doubts to faculty, get instant replies, receive announcements',
      details: [
        'Query Portal for doubts',
        'Faculty respond instantly',
        'Get notifications for replies',
        'Group discussions',
        'Announcements from admin'
      ],
      time: 'Real-time'
    }
  ];

  const tips = [
    {
      icon: <Clock size={20} />,
      text: 'Check your dashboard daily for updates'
    },
    {
      icon: <Bell size={20} />,
      text: 'Enable notifications to never miss deadlines'
    },
    {
      icon: <Star size={20} />,
      text: 'Use AI Assistant for quick help 24/7'
    }
  ];

  return (
    <div className="how-it-works-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>How It Works</h1>
        <p>Get started with Woxsen EDU AI in four simple steps</p>
      </div>

      <div className="steps-timeline">
        {steps.map((step, index) => (
          <div key={index} className="timeline-step">
            <div className="step-marker">
              <div className="step-icon">{step.icon}</div>
              <div className="step-time">
                <Clock size={14} />
                <span>{step.time}</span>
              </div>
            </div>
            <div className="step-content">
              <h2>{step.title}</h2>
              <p className="step-description">{step.description}</p>
              <div className="step-details">
                {step.details.map((detail, idx) => (
                  <div key={idx} className="detail-item">
                    <CheckCircle size={16} color="#C6A75E" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="tips-section">
        <h3>Pro Tips</h3>
        <div className="tips-grid">
          {tips.map((tip, index) => (
            <div key={index} className="tip-card">
              <div className="tip-icon">{tip.icon}</div>
              <p>{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to get started?</h2>
        <button className="btn-primary" onClick={() => navigate('/register')}>
          Create Your Account
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default HowItWorks;
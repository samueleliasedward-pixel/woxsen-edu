import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  Database,
  Bell,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import './Security.css';

const Security = () => {
  const navigate = useNavigate();

  const securityFeatures = [
    {
      icon: <Lock size={32} />,
      title: 'Encryption',
      description: 'All data is encrypted using AES-256 both in transit and at rest.',
      details: 'TLS 1.3 for all communications'
    },
    {
      icon: <Key size={32} />,
      title: 'Authentication',
      description: 'JWT tokens with automatic expiration and bcrypt password hashing.',
      details: 'Tokens expire after 7 days'
    },
    {
      icon: <Eye size={32} />,
      title: 'Privacy Controls',
      description: 'Role-based access control ensures users see only authorized data.',
      details: 'Granular permissions per role'
    },
    {
      icon: <Database size={32} />,
      title: 'Data Protection',
      description: 'Regular automated backups and secure database configuration.',
      details: 'Daily backups, 30-day retention'
    },
    {
      icon: <Bell size={32} />,
      title: 'Security Monitoring',
      description: 'Real-time monitoring for suspicious activities and unauthorized access.',
      details: 'Immediate alerts for security events'
    },
    {
      icon: <Shield size={32} />,
      title: 'Compliance',
      description: 'We follow industry best practices and academic data protection standards.',
      details: 'GDPR and FERPA compliant'
    }
  ];

  const bestPractices = [
    'Use strong, unique passwords',
    'Enable two-factor authentication when available',
    'Never share your login credentials',
    'Log out after each session',
    'Report suspicious activity immediately'
  ];

  return (
    <div className="security-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Security</h1>
        <p>How we protect your data and privacy</p>
      </div>

      <div className="security-content">
        <div className="security-intro">
          <Shield size={48} className="security-icon-large" />
          <h2>Your Security is Our Priority</h2>
          <p>
            We implement industry-leading security measures to ensure your academic data 
            remains private, secure, and protected from unauthorized access.
          </p>
        </div>

        <div className="security-grid">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="security-card">
              <div className="security-card-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p className="security-description">{feature.description}</p>
              <p className="security-details">{feature.details}</p>
            </div>
          ))}
        </div>

        <div className="security-badges">
          <div className="badge">
            <Lock size={20} />
            <span>AES-256 Encryption</span>
          </div>
          <div className="badge">
            <Shield size={20} />
            <span>GDPR Compliant</span>
          </div>
          <div className="badge">
            <Database size={20} />
            <span>Daily Backups</span>
          </div>
        </div>

        <div className="security-practices">
          <h3>Security Best Practices</h3>
          <div className="practices-grid">
            {bestPractices.map((practice, index) => (
              <div key={index} className="practice-item">
                <CheckCircle size={20} color="#C6A75E" />
                <span>{practice}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="security-report">
          <h3>Report a Security Issue</h3>
          <p>
            If you discover a security vulnerability or have concerns about your account security,
            please contact our security team immediately.
          </p>
          <div className="report-actions">
            <a href="mailto:security@woxsen.edu" className="report-link">
              security@woxsen.edu
            </a>
            <button className="btn-primary" onClick={() => navigate('/contact')}>
              Contact Security Team
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
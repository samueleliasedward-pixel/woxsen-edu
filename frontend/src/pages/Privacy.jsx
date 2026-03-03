import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, Database, Bell, CheckCircle } from 'lucide-react';
import './Privacy.css';

const Privacy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <Shield size={24} />,
      title: 'Data Protection',
      content: 'We use industry-standard encryption to protect your personal information. All data is encrypted both in transit and at rest using AES-256 encryption.'
    },
    {
      icon: <Lock size={24} />,
      title: 'Authentication Security',
      content: 'Your account is protected by JWT tokens with automatic expiration. Passwords are hashed using bcrypt before storage.'
    },
    {
      icon: <Eye size={24} />,
      title: 'Data Visibility',
      content: 'Only authorized personnel have access to your data. Role-based access control ensures that students, faculty, and admin see only relevant information.'
    },
    {
      icon: <Database size={24} />,
      title: 'Data Storage',
      content: 'Your information is stored securely on protected servers with regular backups. We never share your data with third parties without consent.'
    },
    {
      icon: <Bell size={24} />,
      title: 'Communication Privacy',
      content: 'All messages and queries are private between participants. Faculty cannot see other students\' conversations unless part of group discussions.'
    }
  ];

  const policies = [
    'We collect only necessary information for academic purposes',
    'Your data is never sold to third parties',
    'You can request data deletion at any time',
    'We use cookies for session management only',
    'All communications are encrypted end-to-end'
  ];

  return (
    <div className="privacy-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Privacy Policy</h1>
        <p>How we protect and handle your data</p>
      </div>

      <div className="privacy-content">
        <div className="last-updated">
          <p>Last Updated: February 27, 2026</p>
        </div>

        <div className="privacy-intro">
          <h2>Our Commitment to Privacy</h2>
          <p>
            At Woxsen EDU AI, we take your privacy seriously. This policy describes how we collect, 
            use, and protect your personal information when you use our platform.
          </p>
        </div>

        <div className="privacy-grid">
          {sections.map((section, index) => (
            <div key={index} className="privacy-card">
              <div className="privacy-card-icon">{section.icon}</div>
              <h3>{section.title}</h3>
              <p>{section.content}</p>
            </div>
          ))}
        </div>

        <div className="policy-list">
          <h3>Key Privacy Points</h3>
          <div className="policy-items">
            {policies.map((policy, index) => (
              <div key={index} className="policy-item">
                <CheckCircle size={18} color="#C6A75E" />
                <span>{policy}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="contact-privacy">
          <h3>Questions About Privacy?</h3>
          <p>
            If you have any questions about our privacy practices, please contact us at{' '}
            <a href="mailto:privacy@woxsen.edu">privacy@woxsen.edu</a>
          </p>
          <button className="btn-primary" onClick={() => navigate('/contact')}>
            Contact Privacy Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
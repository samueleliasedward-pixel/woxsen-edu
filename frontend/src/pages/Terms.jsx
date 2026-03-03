import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import './Terms.css';

const Terms = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using Woxsen EDU AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.'
    },
    {
      title: '2. User Accounts',
      content: 'You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorized use of your account.'
    },
    {
      title: '3. User Conduct',
      content: 'You agree to use the platform only for lawful purposes and in accordance with these terms. You shall not:',
      list: [
        'Harass, abuse, or harm other users',
        'Impersonate any person or entity',
        'Upload malicious content or viruses',
        'Attempt to gain unauthorized access',
        'Use the platform for commercial purposes without consent'
      ]
    },
    {
      title: '4. Academic Integrity',
      content: 'Users must maintain academic integrity when using AI assistance. The platform is a learning aid, not a replacement for personal effort.'
    },
    {
      title: '5. Intellectual Property',
      content: 'All content, features, and functionality of the platform are owned by Woxsen University and protected by intellectual property laws.'
    },
    {
      title: '6. Privacy',
      content: 'Your use of the platform is also governed by our Privacy Policy, which explains how we collect and protect your personal information.'
    },
    {
      title: '7. Termination',
      content: 'We reserve the right to suspend or terminate accounts that violate these terms or for any other reason at our discretion.'
    },
    {
      title: '8. Limitation of Liability',
      content: 'Woxsen University shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.'
    },
    {
      title: '9. Changes to Terms',
      content: 'We may modify these terms at any time. Continued use of the platform constitutes acceptance of the modified terms.'
    },
    {
      title: '10. Contact Information',
      content: 'For questions about these terms, please contact us at:',
      contact: true
    }
  ];

  const effectiveDate = 'February 27, 2026';

  return (
    <div className="terms-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Terms of Service</h1>
        <p>Please read these terms carefully before using our platform</p>
      </div>

      <div className="terms-content">
        <div className="terms-header">
          <FileText size={32} className="terms-icon" />
          <div>
            <h2>Terms of Service</h2>
            <p className="effective-date">Effective Date: {effectiveDate}</p>
          </div>
        </div>

        <div className="terms-intro">
          <AlertCircle size={20} />
          <p>
            These Terms of Service constitute a legally binding agreement between you and Woxsen University 
            governing your use of the Woxsen EDU AI platform.
          </p>
        </div>

        <div className="terms-sections">
          {sections.map((section, index) => (
            <div key={index} className="terms-section">
              <h3>{section.title}</h3>
              <p>{section.content}</p>
              {section.list && (
                <ul className="terms-list">
                  {section.list.map((item, idx) => (
                    <li key={idx}>
                      <CheckCircle size={16} color="#C6A75E" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {section.contact && (
                <div className="terms-contact">
                  <p>📧 legal@woxsen.edu</p>
                  <p>📞 +91 84552 55555</p>
                  <p>📍 Kamkole, Hyderabad</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="terms-agreement">
          <h3>By using Woxsen EDU AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</h3>
          <button className="btn-primary" onClick={() => navigate('/register')}>
            I Agree & Continue
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Terms;
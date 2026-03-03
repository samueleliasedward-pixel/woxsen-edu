import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Award, Target, Heart, ChevronRight } from 'lucide-react';
import './Team.css';

const Team = () => {
  const navigate = useNavigate();

  const team = [
    {
      name: 'Samuel Edward',
      role: 'Lead Developer',
      description: 'Full-stack architect who built 70% of the platform. Responsible for frontend, backend, AI integration, and real-time communication.',
      icon: '👨‍💻',
      contribution: '70%',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Socket.io', 'Ollama']
    },
    {
      name: 'Abhishek',
      role: 'Technology Associate',
      description: 'Contributed to technical planning and feature ideation. Assisted with AI concept development and platform strategy.',
      icon: '💡',
      contribution: '10%',
      skills: ['AI Concepts', 'Technical Planning', 'Feature Design']
    },
    {
      name: 'Suvan',
      role: 'System Architect',
      description: 'Designed the system architecture and provided technical guidance on scalability and database design.',
      icon: '🏗️',
      contribution: '10%',
      skills: ['System Design', 'Database Architecture', 'Scalability']
    },
    {
      name: 'Vinod',
      role: 'Performance Expert',
      description: 'Optimized performance, debugged issues, and ensured smooth user experience across all devices.',
      icon: '⚡',
      contribution: '10%',
      skills: ['Performance Tuning', 'Debugging', 'Testing']
    }
  ];

  return (
    <div className="team-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Our Team</h1>
        <p>The people behind Woxsen EDU AI</p>
      </div>

      <div className="team-stats">
        <div className="stat-card">
          <Users size={32} />
          <div>
            <span className="stat-value">4</span>
            <span className="stat-label">Team Members</span>
          </div>
        </div>
        <div className="stat-card">
          <Award size={32} />
          <div>
            <span className="stat-value">100%</span>
            <span className="stat-label">Commitment</span>
          </div>
        </div>
        <div className="stat-card">
          <Target size={32} />
          <div>
            <span className="stat-value">1</span>
            <span className="stat-label">Shared Vision</span>
          </div>
        </div>
      </div>

      <div className="team-grid">
        {team.map((member, index) => (
          <div key={index} className="team-member-card">
            <div className="member-header">
              <span className="member-icon">{member.icon}</span>
              <div>
                <h3>{member.name}</h3>
                <p className="member-role">{member.role}</p>
              </div>
            </div>
            <p className="member-description">{member.description}</p>
            <div className="member-skills">
              {member.skills.map((skill, idx) => (
                <span key={idx} className="skill-tag">{skill}</span>
              ))}
            </div>
            <div className="member-contribution">
              <div className="contribution-label">
                <span>Contribution</span>
                <span>{member.contribution}</span>
              </div>
              <div className="contribution-bar">
                <div 
                  className="contribution-fill" 
                  style={{ width: member.contribution }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="supervisor-section">
        <Heart size={24} color="#C6A75E" />
        <h3>Supervised by Dr. Tanusree Dutta</h3>
        <p>With academic guidance and project oversight</p>
      </div>

      <div className="team-cta">
        <h2>Join our team?</h2>
        <p>We're always looking for passionate developers</p>
        <button className="btn-primary" onClick={() => navigate('/contact')}>
          Contact Us
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Team;
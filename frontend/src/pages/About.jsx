import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Target, 
  Heart, 
  Award,
  ChevronRight,
  Mail,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';
import './About.css';

const About = () => {
  const navigate = useNavigate();

  const team = [
    {
      name: 'Samuel Edward',
      role: 'Lead Developer',
      description: 'Full-stack architect who built the platform. Responsible for frontend, backend, AI integration, and real-time communication.',
      icon: '👨‍💻',
      width: '70%'
    },
    {
      name: 'Abhishek',
      role: 'Technology Associate',
      description: 'Contributed to technical planning and feature ideation. Assisted with AI concept development.',
      icon: '💡',
      width: '10%'
    },
    {
      name: 'Suvan',
      role: 'System Architect',
      description: 'Designed the system architecture and provided technical guidance on scalability.',
      icon: '🏗️',
      width: '10%'
    },
    {
      name: 'Vinod',
      role: 'Performance Expert',
      description: 'Optimized performance, debugged issues, and ensured smooth user experience.',
      icon: '⚡',
      width: '10%'
    }
  ];

  const values = [
    {
      icon: <Target size={32} />,
      title: 'Our Mission',
      description: 'To revolutionize education through AI-powered tools that make learning personalized, accessible, and effective for every student.'
    },
    {
      icon: <Heart size={32} />,
      title: 'Our Vision',
      description: 'Create a world where every student has a personal AI assistant and real-time access to faculty, breaking down barriers in education.'
    },
    {
      icon: <Award size={32} />,
      title: 'Our Commitment',
      description: 'We are committed to continuous improvement, data security, and providing the best possible learning experience.'
    }
  ];

  return (
    <div className="about-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>About Us</h1>
        <p>The team behind Woxsen EDU AI</p>
      </div>

      <div className="mission-section">
        <div className="mission-grid">
          {values.map((value, index) => (
            <div key={index} className="mission-card">
              <div className="mission-icon">{value.icon}</div>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="story-section">
        <h2>Our Story</h2>
        <p>
          Woxsen EDU AI was born from a simple idea: <strong>make education smarter with AI</strong>. 
          Led by <strong>Samuel Edward</strong> as Lead Developer, the team worked tirelessly to build 
          a platform that combines the power of Ollama AI with real-time communication.
        </p>
        <p>
          Under the supervision of <strong>Dr. Tanusree Dutta</strong>, we've created a solution that 
          serves thousands of students and faculty, making learning more interactive and accessible.
        </p>
      </div>

      <div className="team-section">
        <h2>Meet the Team</h2>
        <div className="team-grid">
          {team.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-icon">{member.icon}</div>
              <h3>{member.name}</h3>
              <p className="team-role">{member.role}</p>
              <p className="team-description">{member.description}</p>
              <div className="team-contribution">
                <div className="contribution-bar">
                  <div 
                    className="contribution-fill" 
                    style={{ width: member.width }}
                  ></div>
                </div>
                {/* Contribution text completely removed */}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="supervisor-section">
        <h3>Project Supervisor</h3>
        <div className="supervisor-card">
          <div className="supervisor-icon">👩‍🏫</div>
          <div className="supervisor-info">
            <h4>Dr. Tanusree Dutta</h4>
            <p>Provided academic guidance and project oversight throughout development.</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Want to know more?</h2>
        <button className="btn-primary" onClick={() => navigate('/contact')}>
          Contact Us
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default About;
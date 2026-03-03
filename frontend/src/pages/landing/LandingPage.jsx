import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  Users, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Calendar,
  Clock,
  Shield,
  Zap,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin,
  Award,
  Brain,
  Globe,
  PenTool
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    satisfaction: '98%',
    activeUsers: '5k+',
    aiSupport: '24/7',
    courses: '50+'
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/stats/public');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
        console.log('✅ Live stats loaded:', data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Keep fallback stats
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  // Detailed Features with explanations
  const features = [
    {
      icon: <Brain size={32} />,
      title: 'AI-Powered Learning Assistant',
      description: 'Powered by Ollama Llama 2, our AI assistant helps you understand complex topics, solve doubts instantly, and provides personalized study recommendations.',
      howToUse: 'Click on "AI Assistant" in your dashboard. Type your question naturally, and get instant responses with code snippets, explanations, and examples.'
    },
    {
      icon: <MessageSquare size={32} />,
      title: 'Real-time Query Portal',
      description: 'Students can ask doubts directly to faculty and get instant responses. Live chat with typing indicators and online status for seamless communication.',
      howToUse: 'Go to "Ask Doubts" in sidebar. Select faculty, type your question, and get real-time answers with notifications.'
    },
    {
      icon: <BookOpen size={32} />,
      title: 'Smart Assignment Management',
      description: 'Submit assignments, track deadlines, and receive intelligent feedback. Faculty can create, grade, and manage assignments efficiently.',
      howToUse: 'Students: View assignments in dashboard, upload submissions. Faculty: Create assignments in course page, grade with rubric.'
    },
    {
      icon: <Users size={32} />,
      title: 'Role-Based Dashboards',
      description: 'Customized experiences for Students, Faculty, and Admin. Each role gets relevant features, data, and permissions.',
      howToUse: 'Login with your role credentials. Student: Track GPA, courses. Faculty: Manage classes, gradebook. Admin: Oversee entire system.'
    },
    {
      icon: <Calendar size={32} />,
      title: 'Academic Calendar & Timetable',
      description: 'View class schedules, exam dates, and important deadlines. Real-time updates when schedules change.',
      howToUse: 'Check "Timetable" for daily classes. "Exams" section shows upcoming exams with countdown. Get notifications for changes.'
    },
    {
      icon: <TrendingUp size={32} />,
      title: 'Progress Analytics',
      description: 'Track GPA, attendance, assignment completion with beautiful charts. Identify areas for improvement.',
      howToUse: 'Dashboard shows GPA trends. Gradebook shows subject-wise performance. Analytics help track progress over time.'
    }
  ];

  // How to use steps
  const howToUse = [
    {
      step: 1,
      title: 'Sign Up',
      description: 'Create account as Student, Faculty, or Admin with your university email.',
      details: 'Use your @woxsen.edu email. Faculty require employee ID, students need enrollment number.'
    },
    {
      step: 2,
      title: 'Access Dashboard',
      description: 'Get personalized dashboard based on your role with relevant features.',
      details: 'Students see GPA, courses, deadlines. Faculty see classes, pending grading. Admin see system overview.'
    },
    {
      step: 3,
      title: 'Use AI Assistant',
      description: 'Ask questions, get help with assignments, understand concepts.',
      details: 'Type naturally. AI remembers context. Get code examples, explanations, study tips.'
    },
    {
      step: 4,
      title: 'Collaborate in Real-time',
      description: 'Ask doubts to faculty, get instant replies, receive announcements.',
      details: 'Use Query Portal for doubts. Faculty respond instantly. Get notifications for replies.'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Sanjay Reddy',
      role: 'Professor, Computer Science',
      content: 'The AI Assistant has revolutionized how students interact with course material. It\'s like having a 24/7 teaching assistant. Students ask doubts anytime and get instant help.',
      avatar: 'SR'
    },
    {
      name: 'Rajesh Kumar',
      role: 'Student, B.Tech CSE',
      content: 'The query portal is amazing! I get answers from faculty within minutes. The AI helps me understand complex topics easily. My GPA improved from 7.2 to 8.7 using this platform.',
      avatar: 'RK'
    },
    {
      name: 'Prof. Anita Verma',
      role: 'Faculty, Cloud Computing',
      content: 'Managing assignments and grading has never been easier. The platform saves me hours of work every week. Real-time communication with students is seamless.',
      avatar: 'AV'
    }
  ];

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'Features', path: '/features' },
        { name: 'How It Works', path: '/how-it-works' },
        { name: 'Demo', path: '/demo' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
        { name: 'Careers', path: '/careers' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy', path: '/privacy' },
        { name: 'Terms', path: '/terms' },
        { name: 'Security', path: '/security' }
      ]
    }
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo" onClick={() => handleNavigation('/')}>
            <GraduationCap size={32} className="logo-icon" />
            <div className="logo-text">
              <h2>Woxsen</h2>
              <p>EDU AI</p>
            </div>
          </div>
          <div className="nav-links">
            <button onClick={() => handleNavigation('/login')} className="nav-link">Login</button>
            <button onClick={() => handleNavigation('/register')} className="nav-button">
              Get Started
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">
            <Zap size={16} />
            <span>Powered by Ollama AI</span>
          </div>
          <h1 className="hero-title">
            <span className="gradient-text">Agentic AI</span>
            <br />
            Academic Assistant
          </h1>
          <p className="hero-subtitle">
            Experience the future of education with our AI-powered platform. 
            Personalized learning, smart assignments, and real-time assistance.
          </p>
          <div className="hero-buttons">
            <button onClick={() => handleNavigation('/register')} className="btn-primary">
              Start Learning
              <ArrowRight size={18} />
            </button>
            <button onClick={() => handleNavigation('/demo')} className="btn-secondary">
              Watch Demo
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-value">{stats.satisfaction}</span>
              <span className="stat-label">Student Satisfaction</span>
            </div>
            <div className="hero-stat">
              <span className="stat-value">{stats.activeUsers}</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="hero-stat">
              <span className="stat-value">{stats.aiSupport}</span>
              <span className="stat-label">AI Support</span>
            </div>
            <div className="hero-stat">
              <span className="stat-value">{stats.courses}</span>
              <span className="stat-label">Courses</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="image-card">
            <div className="card-content">
              <div className="card-header">
                <div className="card-avatar">
                  <GraduationCap size={20} />
                </div>
                <div className="card-info">
                  <h4>AI Assistant</h4>
                  <p>Online • Ready to help</p>
                </div>
              </div>
              <div className="card-message">
                <div className="message-bubble">
                  <p>What is machine learning?</p>
                </div>
                <div className="message-bubble ai">
                  <p>Machine learning is a subset of artificial intelligence...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Detailed Explanations */}
      <section className="features-section">
        <div className="section-header">
          <h2>Everything you need in one platform</h2>
          <p>Powerful features designed for modern education</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-howto">
                <strong>How to use:</strong>
                <p>{feature.howToUse}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works - Detailed */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How to Use Woxsen EDU AI</h2>
          <p>Simple steps to get started with our platform</p>
        </div>
        <div className="steps-container">
          {howToUse.map((step, index) => (
            <div key={index} className="step-wrapper">
              <div className="step-number-large">{step.step}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p className="step-description">{step.description}</p>
                <p className="step-details">{step.details}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>What our users say</h2>
          <p>Trusted by students and faculty</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  {testimonial.avatar}
                </div>
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
              <p className="testimonial-content">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to transform your learning experience?</h2>
          <p>Join thousands of students and faculty already using Woxsen EDU AI</p>
          <button onClick={() => handleNavigation('/register')} className="btn-primary btn-large">
            Get Started Now
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-logo-section">
            <div className="footer-logo" onClick={() => handleNavigation('/')}>
              <GraduationCap size={32} />
              <span>Woxsen EDU AI</span>
            </div>
            <p className="footer-tagline">
              Transforming education with AI-powered learning and real-time collaboration.
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <Phone size={16} />
                <span>+91 84552 55555</span>
              </div>
              <div className="contact-item">
                <Mail size={16} />
                <span>techsupport@woxsen.edu</span>
              </div>
              <div className="contact-item">
                <MapPin size={16} />
                <span>Kamkole, Hyderabad</span>
              </div>
            </div>
          </div>

          <div className="footer-links">
            {footerSections.map((section, index) => (
              <div key={index} className="footer-column">
                <h4>{section.title}</h4>
                {section.links.map((link, linkIndex) => (
                  <button
                    key={linkIndex}
                    onClick={() => handleNavigation(link.path)}
                    className="footer-link"
                  >
                    {link.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* About Us Section with Perfect Team Titles */}
        <div className="about-section">
          <h4>About Us</h4>
          <p className="about-description">
            Woxsen EDU AI was built by a dedicated team of developers under the supervision of 
            <strong> Dr. Tanusree Dutta</strong>. Our mission is to revolutionize education through AI-powered tools 
            and real-time collaboration.
          </p>
          <div className="team-credits">
            <div className="credit-item">
              <span className="credit-role">Lead Developer</span>
              <span className="credit-name">Samuel Edward</span>
            </div>
            <div className="credit-item">
              <span className="credit-role">Technology Associate</span>
              <span className="credit-name">Abhishek</span>
            </div>
            <div className="credit-item">
              <span className="credit-role">System Architect</span>
              <span className="credit-name">Suvan</span>
            </div>
            <div className="credit-item">
              <span className="credit-role">Performance Expert</span>
              <span className="credit-name">Vinod</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>© 2026 Woxsen University. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
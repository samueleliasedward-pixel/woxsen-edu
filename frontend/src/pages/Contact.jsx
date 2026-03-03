import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulate form submission
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setError('');
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 3000);
    } else {
      setError('Please fill in all required fields');
    }
  };

  const contactInfo = [
    {
      icon: <Phone size={24} />,
      title: 'Phone',
      details: ['+91 84552 55555'],
      action: 'tel:+918455255555'
    },
    {
      icon: <Mail size={24} />,
      title: 'Email',
      details: ['techsupport@woxsen.edu'],
      action: 'mailto:techsupport@woxsen.edu'
    },
    {
      icon: <MapPin size={24} />,
      title: 'Address',
      details: ['Kamkole, Hyderabad', 'Telangana, India'],
      action: 'https://maps.google.com/?q=Kamkole,Hyderabad'
    },
    {
      icon: <Clock size={24} />,
      title: 'Support Hours',
      details: ['Monday - Friday: 9AM - 6PM', 'Saturday: 10AM - 4PM'],
      action: null
    }
  ];

  return (
    <div className="contact-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Contact Us</h1>
        <p>Get in touch with our support team</p>
      </div>

      <div className="contact-grid">
        <div className="contact-info-section">
          <h2>Get in Touch</h2>
          <p className="contact-description">
            Have questions about Woxsen EDU AI? We're here to help! Reach out to us through any of these channels.
          </p>

          <div className="info-cards">
            {contactInfo.map((info, index) => (
              <div key={index} className="info-card">
                <div className="info-icon">{info.icon}</div>
                <div className="info-content">
                  <h3>{info.title}</h3>
                  {info.details.map((detail, idx) => (
                    <p key={idx}>{detail}</p>
                  ))}
                  {info.action && (
                    <a href={info.action} className="info-action" target="_blank" rel="noopener noreferrer">
                      Contact via {info.title.toLowerCase()}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="support-hours">
            <h3>Quick Support</h3>
            <p>For immediate assistance, email us at <strong>techsupport@woxsen.edu</strong></p>
            <p>We typically respond within 2-4 hours during business hours.</p>
          </div>
        </div>

        <div className="contact-form-section">
          <h2>Send us a Message</h2>
          
          {submitted && (
            <div className="success-message">
              <CheckCircle size={24} />
              <div>
                <h4>Message Sent!</h4>
                <p>We'll get back to you within 24 hours.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertCircle size={24} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What is this about?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Type your message here..."
                rows="5"
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              <Send size={18} />
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
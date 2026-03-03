// frontend/src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, User, Phone, ArrowRight, GraduationCap, UserCog, Calendar, BookOpen, MapPin } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    studentId: '',
    employeeId: '',
    program: 'B.Tech CSE',
    year: '1',
    semester: '1',
    department: 'Computer Science',
    designation: 'Assistant Professor'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    setError('');
  };

  const validateForm = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation (optional but if provided, must be valid)
    if (formData.phone && !/^[0-9+\-\s()]{10,15}$/.test(formData.phone)) {
      setError('Please enter a valid phone number');
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    // Password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Role-specific validation
    if (formData.role === 'student' && !formData.studentId) {
      setError('Student ID is required');
      return false;
    }

    if ((formData.role === 'faculty' || formData.role === 'admin') && !formData.employeeId) {
      setError('Employee ID is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare user data based on role
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        role: formData.role
      };

      if (formData.role === 'student') {
        userData.studentId = formData.studentId;
        userData.program = formData.program;
        userData.year = parseInt(formData.year);
        userData.semester = parseInt(formData.semester);
        userData.department = formData.department;
      } else if (formData.role === 'faculty') {
        userData.employeeId = formData.employeeId;
        userData.department = formData.department;
        userData.designation = formData.designation;
      } else if (formData.role === 'admin') {
        userData.employeeId = formData.employeeId;
        userData.department = formData.department;
      }

      console.log('📤 Sending registration data:', userData);
      
      const result = await register(userData);
      console.log('📥 Registration result:', result);
      
      if (result.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="brand-content">
            <div className="brand-icon">
              <GraduationCap size={48} />
            </div>
            <h1>Woxsen University</h1>
            <h2>EDU AI Platform</h2>
            <div className="brand-divider"></div>
            <p className="brand-tagline">
              Join the future of education with AI-powered learning
            </p>
            <div className="feature-list">
              <div className="feature-item">
                <GraduationCap size={18} />
                <span>AI-powered academic assistant</span>
              </div>
              <div className="feature-item">
                <User size={18} />
                <span>Personalized learning paths</span>
              </div>
              <div className="feature-item">
                <Calendar size={18} />
                <span>Real-time collaboration</span>
              </div>
            </div>
          </div>
          <div className="brand-footer">
            <p>© 2026 Woxsen University. All rights reserved.</p>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="login-form-container">
          <div className="login-card">
            <div className="form-header">
              <h2>Create Account</h2>
              <p>Join the Woxsen EDU AI platform</p>
            </div>

            {/* Role Selector */}
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${formData.role === 'student' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, role: 'student'})}
              >
                <User size={18} />
                <span>Student</span>
              </button>
              <button
                type="button"
                className={`role-btn ${formData.role === 'faculty' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, role: 'faculty'})}
              >
                <GraduationCap size={18} />
                <span>Faculty</span>
              </button>
              <button
                type="button"
                className={`role-btn ${formData.role === 'admin' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, role: 'admin'})}
              >
                <UserCog size={18} />
                <span>Admin</span>
              </button>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              {/* Common Fields */}
              <div className="input-group">
                <label htmlFor="name">Full Name *</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="email">Email *</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@woxsen.edu"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-wrapper">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Student Specific Fields */}
              {formData.role === 'student' && (
                <>
                  <div className="input-group">
                    <label htmlFor="studentId">Student ID *</label>
                    <div className="input-wrapper">
                      <BookOpen size={18} className="input-icon" />
                      <input
                        type="text"
                        id="studentId"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        placeholder="23WU0101082"
                        autoComplete="off"
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="program">Program *</label>
                    <select
                      id="program"
                      name="program"
                      value={formData.program}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="B.Tech CSE">B.Tech Computer Science</option>
                      <option value="B.Tech ECE">B.Tech Electronics</option>
                      <option value="B.Tech ME">B.Tech Mechanical</option>
                      <option value="B.Tech CE">B.Tech Civil</option>
                      <option value="M.Tech CSE">M.Tech Computer Science</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label htmlFor="year">Year *</label>
                      <select
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="input-field"
                        required
                      >
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label htmlFor="semester">Semester *</label>
                      <select
                        id="semester"
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        className="input-field"
                        required
                      >
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                        <option value="3">Semester 3</option>
                        <option value="4">Semester 4</option>
                        <option value="5">Semester 5</option>
                        <option value="6">Semester 6</option>
                        <option value="7">Semester 7</option>
                        <option value="8">Semester 8</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="department">Department *</label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                    </select>
                  </div>
                </>
              )}

              {/* Faculty Specific Fields */}
              {formData.role === 'faculty' && (
                <>
                  <div className="input-group">
                    <label htmlFor="employeeId">Employee ID *</label>
                    <div className="input-wrapper">
                      <MapPin size={18} className="input-icon" />
                      <input
                        type="text"
                        id="employeeId"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        placeholder="FAC001"
                        autoComplete="off"
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="department">Department *</label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label htmlFor="designation">Designation *</label>
                    <select
                      id="designation"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Lecturer">Lecturer</option>
                    </select>
                  </div>
                </>
              )}

              {/* Admin Specific Fields */}
              {formData.role === 'admin' && (
                <>
                  <div className="input-group">
                    <label htmlFor="employeeId">Employee ID *</label>
                    <div className="input-wrapper">
                      <MapPin size={18} className="input-icon" />
                      <input
                        type="text"
                        id="employeeId"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        placeholder="ADM001"
                        autoComplete="off"
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="department">Department *</label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="Administration">Administration</option>
                      <option value="Academic Affairs">Academic Affairs</option>
                      <option value="Student Affairs">Student Affairs</option>
                      <option value="IT Services">IT Services</option>
                    </select>
                  </div>
                </>
              )}

              {/* Password Fields */}
              <div className="input-group">
                <label htmlFor="password">Password *</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="•••••••• (min. 6 characters)"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="terms-checkbox">
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms">
                  I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`submit-btn ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="form-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="signup-link">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
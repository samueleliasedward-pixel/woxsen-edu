// frontend/src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, User, GraduationCap, UserCog, ArrowRight, Sparkles } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Submitting login form...');
      const result = await login(email, password, role);
      console.log('📥 Login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful, redirecting...');
        
        // Get the user role from the result (it comes from backend)
        const userRole = result.role || result.user?.role || role;
        console.log('👤 User role:', userRole);
        
        // Convert to uppercase for consistency
        const roleUpper = typeof userRole === 'string' ? userRole.toUpperCase() : 'STUDENT';
        
        // Redirect based on role
        if (roleUpper === 'ADMIN') {
          console.log('👨‍💼 Redirecting to admin dashboard');
          navigate('/admin/dashboard');
        } else if (roleUpper === 'FACULTY') {
          console.log('👨‍🏫 Redirecting to faculty dashboard');
          navigate('/faculty/dashboard');
        } else {
          console.log('🎓 Redirecting to student dashboard');
          navigate('/student/dashboard');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const getEmailPlaceholder = () => {
    switch(role) {
      case 'student': return 'student@woxsen.edu';
      case 'faculty': return 'faculty@woxsen.edu';
      case 'admin': return 'admin@woxsen.edu';
      default: return 'email@woxsen.edu';
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
              Experience the future of education with AI-powered learning
            </p>
            <div className="feature-list">
              <div className="feature-item">
                <Sparkles size={18} />
                <span>Personalized learning paths</span>
              </div>
              <div className="feature-item">
                <Sparkles size={18} />
                <span>AI-powered academic assistant</span>
              </div>
              <div className="feature-item">
                <Sparkles size={18} />
                <span>Real-time progress tracking</span>
              </div>
            </div>
          </div>
          <div className="brand-footer">
            <p>© 2026 Woxsen University. All rights reserved.</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-container">
          <div className="login-card">
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to continue your academic journey</p>
            </div>

            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${role === 'student' ? 'active' : ''}`}
                onClick={() => setRole('student')}
              >
                <User size={18} />
                <span>Student</span>
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'faculty' ? 'active' : ''}`}
                onClick={() => setRole('faculty')}
              >
                <GraduationCap size={18} />
                <span>Faculty</span>
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
              >
                <UserCog size={18} />
                <span>Admin</span>
              </button>
            </div>

            {error && (
              <div className="error-message">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={getEmailPlaceholder()}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className={`submit-btn ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    Sign in as {role}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="demo-section">
              <p className="demo-title">Demo Credentials</p>
              <div className="demo-grid">
                <div className="demo-card">
                  <span className="demo-role">Student</span>
                  <span className="demo-email">student@woxsen.edu</span>
                  <span className="demo-pass">••••••••</span>
                </div>
                <div className="demo-card">
                  <span className="demo-role">Faculty</span>
                  <span className="demo-email">faculty@woxsen.edu</span>
                  <span className="demo-pass">••••••••</span>
                </div>
                <div className="demo-card">
                  <span className="demo-role">Admin</span>
                  <span className="demo-email">admin@woxsen.edu</span>
                  <span className="demo-pass">••••••••</span>
                </div>
              </div>
            </div>

            <div className="form-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="signup-link">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
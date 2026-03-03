import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-blob blob-1"></div>
        <div className="auth-blob blob-2"></div>
        <div className="auth-blob blob-3"></div>
      </div>

      <div className="auth-container">
        <Card className="auth-card">
          <Link to="/login" className="back-link">
            <ArrowLeft size={20} />
            <span>Back to Login</span>
          </Link>

          <div className="auth-header">
            <Mail size={48} className="auth-icon" />
            <h1>Forgot Password?</h1>
            <p>Enter your email to reset your password</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {submitted ? (
            <div className="auth-success">
              <h3>Check Your Email</h3>
              <p>
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-muted">
                Didn't receive the email? Check your spam folder or{' '}
                <button onClick={() => setSubmitted(false)} className="link-button">
                  try again
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@woxsen.edu"
                icon={Mail}
                required
              />

              <Button
                type="submit"
                variant="gold"
                fullWidth
                loading={loading}
              >
                Send Reset Link
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
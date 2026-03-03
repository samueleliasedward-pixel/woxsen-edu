import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const ServerError = () => {
  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-blob blob-1"></div>
        <div className="auth-blob blob-2"></div>
        <div className="auth-blob blob-3"></div>
      </div>

      <div className="auth-container">
        <Card className="auth-card" style={{ textAlign: 'center' }}>
          <AlertTriangle size={64} className="auth-icon" style={{ color: 'var(--warning)' }} />
          <h1>500</h1>
          <h2>Server Error</h2>
          <p style={{ margin: 'var(--spacing-lg) 0', opacity: 0.7 }}>
            Something went wrong on our end. Please try again later.
          </p>
          <Link to="/">
            <Button variant="gold">Go to Homepage</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default ServerError;
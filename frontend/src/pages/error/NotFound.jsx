import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const NotFound = () => {
  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-blob blob-1"></div>
        <div className="auth-blob blob-2"></div>
        <div className="auth-blob blob-3"></div>
      </div>

      <div className="auth-container">
        <Card className="auth-card" style={{ textAlign: 'center' }}>
          <AlertCircle size={64} className="auth-icon" />
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p style={{ margin: 'var(--spacing-lg) 0', opacity: 0.7 }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/">
            <Button variant="gold">Go to Homepage</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
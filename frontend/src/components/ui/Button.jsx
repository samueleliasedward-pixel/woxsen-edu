import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon,
  type = 'button',
  className = '',
  ...props 
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'danger':
        return 'btn-danger';
      case 'gold':
        return 'btn-gold';
      case 'outline':
        return 'btn-outline';
      default:
        return 'btn-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'btn-sm';
      case 'md':
        return 'btn-md';
      case 'lg':
        return 'btn-lg';
      default:
        return 'btn-md';
    }
  };

  return (
    <button
      type={type}
      className={`btn ${getVariantClass()} ${getSizeClass()} ${fullWidth ? 'btn-full' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="btn-loader">
          <span className="loader"></span>
        </div>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
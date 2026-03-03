import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  variant = 'default',
  className = '',
  onClick,
  hoverable = true,
  ...props 
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'glass':
        return 'card-glass';
      case 'gold':
        return 'card-gold';
      case 'dashboard':
        return 'card-dashboard';
      default:
        return 'card-default';
    }
  };

  return (
    <div
      className={`card ${getVariantClass()} ${hoverable ? 'card-hoverable' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
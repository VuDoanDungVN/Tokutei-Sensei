
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const cursorStyle = onClick ? 'cursor-pointer' : '';
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm p-4 md:p-6 ${cursorStyle} transition-shadow hover:shadow-lg ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;

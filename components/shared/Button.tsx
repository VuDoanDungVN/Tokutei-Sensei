
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'w-full text-center font-bold py-3 px-4 rounded-xl shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles = {
    primary: 'bg-brand-blue text-white hover:bg-brand-blue-dark focus:ring-brand-blue',
    secondary: 'bg-brand-green text-white hover:bg-brand-green-dark focus:ring-brand-green',
    outline: 'bg-white text-brand-blue border-2 border-brand-blue hover:bg-brand-blue-light focus:ring-brand-blue',
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;

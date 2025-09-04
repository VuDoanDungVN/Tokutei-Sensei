
import React from 'react';

interface HeaderProps {
  title: string;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onBack }) => {
  return (
    <div className="flex items-center p-4 sticky top-0 bg-brand-bg/80 backdrop-blur-sm z-10">
      {onBack && (
        <button onClick={onBack} className="mr-4 text-brand-text-secondary hover:text-brand-blue">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <h1 className="text-2xl font-bold text-brand-text-primary">{title}</h1>
    </div>
  );
};

export default Header;

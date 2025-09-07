import React, { useState, useRef, useEffect } from 'react';

interface KanjiTooltipProps {
  children: React.ReactNode;
  kanji: string;
  hiragana: string;
  meaning: string;
  className?: string;
}

const KanjiTooltip: React.FC<KanjiTooltipProps> = ({
  children,
  kanji,
  hiragana,
  meaning,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      let y = triggerRect.top - tooltipRect.height - 8;

      // Adjust if tooltip goes off screen
      if (x < 8) x = 8;
      if (x + tooltipRect.width > viewportWidth - 8) {
        x = viewportWidth - tooltipRect.width - 8;
      }
      if (y < 8) {
        y = triggerRect.bottom + 8;
      }

      setPosition({ x, y });
    }
  }, [isVisible]);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <span
        ref={triggerRef}
        className={`cursor-help border-b border-dotted border-blue-400 hover:border-blue-600 transition-colors ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-gray-900 text-white text-sm rounded-lg shadow-lg p-3 max-w-xs pointer-events-none"
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          <div className="font-bold text-lg mb-1">{kanji}</div>
          <div className="text-blue-300 mb-1">{hiragana}</div>
          <div className="text-gray-200">{meaning}</div>
          
          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </>
  );
};

export default KanjiTooltip;

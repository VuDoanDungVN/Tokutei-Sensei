
import React from 'react';

const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div className="absolute w-2 h-4" style={style}></div>
);

const Confetti: React.FC = () => {
  const pieces = Array.from({ length: 150 }).map((_, i) => {
    const left = Math.random() * 100;
    const animDuration = 4 + Math.random() * 3;
    const animDelay = Math.random() * 5;
    const colors = ['#4DB6AC', '#81C784', '#FBBF24', '#F87171', '#60A5FA'];
    
    const style: React.CSSProperties = {
      left: `${left}vw`,
      animation: `fall ${animDuration}s linear ${animDelay}s infinite`,
      backgroundColor: colors[i % colors.length],
      transform: `rotate(${Math.random() * 360}deg)`,
      opacity: Math.random() * 0.7 + 0.3,
    };
    
    return <ConfettiPiece key={i} style={style} />;
  });

  const keyframes = `
    @keyframes fall {
      0% { 
        top: -10%; 
        transform: rotate(0deg) rotateX(-90deg);
        opacity: 1;
      }
      100% { 
        top: 110%; 
        transform: rotate(720deg) rotateX(90deg);
        opacity: 0;
      }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">
        {pieces}
      </div>
    </>
  );
};

export default Confetti;

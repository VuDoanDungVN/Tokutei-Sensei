
import React, { useEffect, useState } from 'react';

interface FeedbackAnimationProps {
  type: 'correct' | 'incorrect';
}

const FeedbackAnimation: React.FC<FeedbackAnimationProps> = ({ type }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const icon = type === 'correct' ? '✔️' : '❌';

  return (
    <div
      className={`fixed inset-0 bg-black/20 flex items-center justify-center z-50 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
        <style>{`
            @keyframes feedback-pop {
                0% { transform: scale(0.5); opacity: 0; }
                50% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
            .animate-pop {
                animation: feedback-pop 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
            }
        `}</style>
      <div
        className="text-9xl animate-pop"
        style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
      >
        {icon}
      </div>
    </div>
  );
};

export default FeedbackAnimation;

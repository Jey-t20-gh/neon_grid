
import React from 'react';

const AnimatedGridBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#0b0f1a] to-[#111827]">
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:3rem_3rem] animate-grid-pan"
      ></div>
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#8b5cf62a] via-[#00ffff1a] to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-black/20"></div>
      <style>{`
        @keyframes grid-pan {
          0% { background-position: 0% 0%; }
          100% { background-position: 48px 48px; }
        }
        .animate-grid-pan {
          animation: grid-pan 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AnimatedGridBackground;

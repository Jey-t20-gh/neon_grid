
import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import AnimatedGridBackground from '../AnimatedGridBackground';

const AuthScreen: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden p-4">
      <AnimatedGridBackground />
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.4), 0 0 25px rgba(0, 255, 255, 0.2);
          }
          50% {
            box-shadow: 0 0 25px rgba(0, 255, 255, 0.7), 0 0 40px rgba(0, 255, 255, 0.4);
          }
        }
        .animate-pulse-glow:hover {
          animation: pulse-glow 2s infinite ease-in-out;
        }
      `}</style>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black tracking-widest text-cyan-400 uppercase"
              style={{ textShadow: '0 0 8px #00ffff, 0 0 16px #00ffff' }}>
            NeonGrid
          </h1>
          <p className="mt-2 text-lg text-violet-300">
            Connecting Citizens with Change
          </p>
        </div>

        {/* Form Container with Transition */}
        <div className="relative h-[580px] sm:h-[520px]"> {/* Adjusted height for different content + errors */}
          <div className={`absolute w-full transition-all duration-700 ease-in-out ${isLoginView ? 'opacity-100 transform-none' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
            <Login onSwitchToSignup={() => setIsLoginView(false)} />
          </div>
          <div className={`absolute w-full transition-all duration-700 ease-in-out ${!isLoginView ? 'opacity-100 transform-none' : 'opacity-0 translate-x-full pointer-events-none'}`}>
            <Signup onSwitchToLogin={() => setIsLoginView(true)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
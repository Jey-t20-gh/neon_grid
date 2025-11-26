import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedGridBackground from './AnimatedGridBackground';

const SplashScreen: React.FC = () => {
  const [animationStep, setAnimationStep] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const navigate = useNavigate();

  const handleTransitionEnd = useCallback(() => {
    setIsFadingOut(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000); // Corresponds to fade-out duration
  }, [navigate]);

  useEffect(() => {
    const timeouts = [
      setTimeout(() => setAnimationStep(1), 500),
      setTimeout(() => setAnimationStep(2), 600),
      setTimeout(() => setAnimationStep(3), 2100),
      setTimeout(() => setAnimationStep(4), 3100),
      setTimeout(handleTransitionEnd, 6000), // Total splash screen duration
    ];

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [handleTransitionEnd]);

  return (
    <div className={`relative min-h-screen w-full flex items-center justify-center overflow-hidden transition-opacity duration-1000 ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
      <AnimatedGridBackground />
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-4 text-center">
        
        {/* Animated Line */}
        <div className={`
          relative h-1 bg-cyan-400 rounded-full transition-all ease-in-out duration-1000
          ${animationStep >= 1 ? 'opacity-100' : 'opacity-0'}
          ${animationStep === 2 ? 'w-full md:w-3/4' : 'w-0'}
          ${animationStep >= 3 ? '!opacity-0' : ''}
        `}
        style={{
          boxShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff'
        }}>
        </div>

        {/* Title and Subtitle Container */}
        <div className={`absolute transition-opacity duration-1000 ease-in-out ${animationStep >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-widest text-cyan-400 uppercase"
              style={{ textShadow: '0 0 8px #00ffff, 0 0 16px #00ffff, 0 0 32px #00ffff' }}>
            NeonGrid
          </h1>
          <p className={`
            mt-4 text-lg md:text-xl text-violet-300 transition-opacity duration-1000 ease-in-out delay-500
            ${animationStep >= 4 ? 'opacity-100' : 'opacity-0'}`
          }>
            Connecting Citizens with Change
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
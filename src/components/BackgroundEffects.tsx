import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  key: number;
  delay: number;
}

export const BackgroundEffects: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  useEffect(() => {
    const initialParticles = [...Array(30)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      key: 0,
      delay: Math.random() * 2
    }));
    setParticles(initialParticles);
  }, []);

  const handleAnimationEnd = (particleId: number) => {
    setParticles(prev => prev.map(particle =>
      particle.id === particleId
        ? {
            ...particle,
            x: Math.random() * 100,
            y: Math.random() * 100,
            key: particle.key + 1,
            delay: Math.random() * 2
          }
        : particle
    ));
  };

  const gridScale = Math.max(screenSize.width, screenSize.height) / 500;

  return (
    <div className="absolute inset-0 opacity-60 pointer-events-none hidden md:block overflow-hidden">
      {/* 3D Container */}
      <div
        className="absolute inset-0"
        style={{
          perspective: '1000px',
          perspectiveOrigin: '50% 50%'
        }}
      >
        {/* Main Grid Pattern with 3D transform */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 0, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 0, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `rotateX(45deg) translateY(-50px) scale(${gridScale * 4})`,
            transformOrigin: 'center bottom',
            height: '800%',
            width: '400%',
            left: '-150%'
          }}
        ></div>

        {/* Secondary grid layer for depth */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 0, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 0, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            transform: `rotateX(45deg) translateY(-70px) translateZ(-50px) scale(${gridScale * 4})`,
            transformOrigin: 'center bottom',
            height: '800%',
            width: '400%',
            left: '-150%'
          }}
        ></div>

        {/* Distant grid layer */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '150px 150px',
            transform: `rotateX(45deg) translateY(-90px) translateZ(-100px) scale(${gridScale * 4})`,
            transformOrigin: 'center bottom',
            height: '800%',
            width: '400%',
            left: '-150%'
          }}
        ></div>
      </div>

      {/* Circular Gradient Mask */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.9) 90%)`
        }}
      ></div>

      {/* Gradient fade for smooth edges */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Top Gradient Mask */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-transparent h-32"></div>

      {/* Animated Lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-green-500 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-green-500 to-transparent animate-pulse" style={{ animationDelay: '1.5s' }}></div>

      {/* Floating Particles with 3D positioning */}
      {particles.map((particle) => (
        <div
          key={`${particle.id}-${particle.key}`}
          className="absolute w-1 h-1 bg-green-500 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: 0,
            animation: 'fadeInOut 6s ease-in-out',
            animationDelay: `${particle.delay}s`,
            transform: `translateZ(${Math.sin(particle.x / 10) * 20}px)`,
            filter: `blur(${Math.abs(Math.sin(particle.x / 10)) * 0.5}px)`
          }}
          onAnimationEnd={() => handleAnimationEnd(particle.id)}
        ></div>
      ))}

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          50% { opacity: 0.6; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};
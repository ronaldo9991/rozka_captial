import { memo, useMemo, useState, useEffect } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

interface ParticleFieldProps {
  count?: number;
  className?: string;
}

// Optimized ParticleField with GPU acceleration and reduced overhead
// Performance: Max 30 particles for optimal performance
function ParticleField({ count = 30, className = "" }: ParticleFieldProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Pause animations when tab is not visible (major performance boost)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Cap particle count at 30 for performance
  const optimizedCount = useMemo(() => Math.min(count, 30), [count]);

  const particles = useMemo(() => {
    const colors = [
      "rgba(212, 175, 55, 0.6)",
      "rgba(212, 175, 55, 0.5)",
      "rgba(212, 175, 55, 0.4)",
    ];

    return Array.from({ length: optimizedCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
    })) as Particle[];
  }, [optimizedCount]);

  // Only render connection lines for first 10 particles to reduce overhead
  const connectionLines = useMemo(() => {
    return particles.slice(0, Math.min(10, particles.length));
  }, [particles]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full particle-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            animationPlayState: isVisible ? 'running' : 'paused',
            willChange: 'transform, opacity',
            transform: 'translateZ(0)', // Force GPU acceleration
          }}
        />
      ))}
      
      {/* Reduced connection lines - only 10 for performance */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
        {connectionLines.map((particle, i, arr) => {
          const nextIndex = (i + 1) % arr.length;
          const nextParticle = arr[nextIndex];
          
          if (!nextParticle) return null;
          
          return (
            <line
              key={`line-${i}`}
              x1={`${particle.x}%`}
              y1={`${particle.y}%`}
              x2={`${nextParticle.x}%`}
              y2={`${nextParticle.y}%`}
              stroke="rgba(212, 175, 55, 0.15)"
              strokeWidth="1"
              className="particle-line"
              style={{
                animationDelay: `${i * 0.3}s`,
                animationPlayState: isVisible ? 'running' : 'paused',
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}

export default memo(ParticleField);


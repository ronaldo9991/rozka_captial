import { motion } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";

export default function Hero3D() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const rafIdRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

  // Throttled mouse move handler - only update every 50ms
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    // Throttle to 20fps max (every 50ms) to reduce overhead
    if (timeSinceLastUpdate < 50) return;
    
    // Cancel previous animation frame
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    
    rafIdRef.current = requestAnimationFrame(() => {
      if (!canvasRef.current) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;
      
      // Use transform3d for better GPU acceleration
      canvasRef.current.style.transform = `translate3d(0, 0, 0) rotateY(${x}deg) rotateX(${-y}deg)`;
      lastUpdateRef.current = now;
    });
  }, []);

  useEffect(() => {
    if (!isHovered) return;

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      // Reset transform on unmount
      if (canvasRef.current) {
        canvasRef.current.style.transform = "";
      }
    };
  }, [isHovered, handleMouseMove]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (canvasRef.current) {
          canvasRef.current.style.transform = "";
        }
      }}
    >
      <div 
        ref={canvasRef} 
        className="relative transition-transform duration-300 ease-out" 
        style={{ 
          transformStyle: "preserve-3d",
          willChange: isHovered ? 'transform' : 'auto',
          transform: 'translateZ(0)', // Force GPU layer
        }}
      >
        {/* Static cube - GPU accelerated */}
        <div
          className="absolute w-32 h-32 border-2 border-primary/30 rounded-lg"
          style={{ transform: "translate3d(0, 0, 50px)" }}
        >
          <div className="absolute inset-2 bg-primary/5 rounded-lg"></div>
        </div>


        {/* Static center glow - reduced blur for performance */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 h-40 rounded-full bg-primary/10 blur-2xl opacity-40"></div>
        </div>

        {/* Static glowing lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ transform: "translate3d(0, 0, 100px)", opacity: 0.3 }}>
          {[...Array(5)].map((_, i) => {
            const angle = (i * Math.PI * 2) / 5;
            return (
              <line
                key={i}
                x1="50%"
                y1="50%"
                x2={`${50 + Math.cos(angle) * 40}%`}
                y2={`${50 + Math.sin(angle) * 40}%`}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                opacity="0.3"
              />
            );
          })}
        </svg>

        {/* CSS-animated elements on hover for better performance */}
        {isHovered && (
          <>
            <div
              className="absolute w-32 h-32 border-2 border-primary/40 rounded-lg animate-spin-3d"
              style={{ transform: "translate3d(0, 0, 50px)", willChange: 'transform' }}
            >
              <div className="absolute inset-2 bg-primary/10 rounded-lg"></div>
            </div>


            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pulse-glow-center"
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="w-40 h-40 rounded-full bg-primary/15 blur-2xl"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { memo, useState } from "react";

interface AnimatedGridProps {
  className?: string;
  variant?: "default" | "cyber" | "hexagon";
}

// Optimized with pure CSS animations for better performance
function AnimatedGrid({ className = "", variant = "default" }: AnimatedGridProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const getGridClass = () => {
    switch (variant) {
      case "cyber":
        return "cyber-grid";
      case "hexagon":
        return "hexagon-pattern";
      default:
        return "web3-grid-bg";
    }
  };

  return (
    <div 
      className={`absolute inset-0 ${getGridClass()} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Radial gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-background"></div>
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>
      
      {/* Optimized CSS-animated gradient orbs - GPU accelerated - Only animate on hover */}
      <div 
        className={`absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl transition-all duration-300 ${isHovered ? 'animate-float-orb-1' : ''}`}
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      />
      <div 
        className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl transition-all duration-300 ${isHovered ? 'animate-float-orb-2' : ''}`}
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      />
      <div 
        className={`absolute top-1/2 right-1/3 w-80 h-80 bg-primary/12 rounded-full blur-3xl transition-all duration-300 ${isHovered ? 'animate-float-orb-3' : ''}`}
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      />
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(AnimatedGrid);


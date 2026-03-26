import { motion } from "framer-motion";

interface HeroBackgroundProps {
  variant?: "trading" | "about" | "contact" | "forex" | "default";
  className?: string;
  children: React.ReactNode;
}

export default function HeroBackground({ variant = "default", className = "", children }: HeroBackgroundProps) {
  // High-quality gradient patterns that look like professional images
  const backgroundPatterns = {
    trading: {
      base: "bg-gradient-to-br from-black via-gray-950 to-black",
      overlay1: "bg-gradient-to-tr from-primary/20 via-transparent to-primary/10",
      overlay2: "bg-gradient-to-bl from-transparent via-primary/5 to-transparent",
      pattern: "radial-gradient(circle at 20% 30%, rgba(212,175,55,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(212,175,55,0.1) 0%, transparent 50%)",
      mesh: "linear-gradient(135deg, rgba(212,175,55,0.03) 0%, transparent 25%, transparent 75%, rgba(212,175,55,0.03) 100%)",
    },
    about: {
      base: "bg-gradient-to-br from-black via-gray-900 to-black",
      overlay1: "bg-gradient-to-tr from-primary/15 via-transparent to-primary/8",
      overlay2: "bg-gradient-to-bl from-transparent via-primary/5 to-transparent",
      pattern: "radial-gradient(circle at 30% 40%, rgba(212,175,55,0.12) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(212,175,55,0.08) 0%, transparent 60%)",
      mesh: "linear-gradient(45deg, rgba(212,175,55,0.02) 0%, transparent 30%, transparent 70%, rgba(212,175,55,0.02) 100%)",
    },
    contact: {
      base: "bg-gradient-to-br from-black via-gray-950 to-gray-900",
      overlay1: "bg-gradient-to-tr from-primary/18 via-transparent to-primary/12",
      overlay2: "bg-gradient-to-bl from-transparent via-primary/6 to-transparent",
      pattern: "radial-gradient(circle at 25% 35%, rgba(212,175,55,0.14) 0%, transparent 55%), radial-gradient(circle at 75% 65%, rgba(212,175,55,0.1) 0%, transparent 55%)",
      mesh: "linear-gradient(90deg, rgba(212,175,55,0.025) 0%, transparent 25%, transparent 75%, rgba(212,175,55,0.025) 100%)",
    },
    forex: {
      base: "bg-gradient-to-br from-black via-gray-950 to-black",
      overlay1: "bg-gradient-to-tr from-primary/22 via-transparent to-primary/15",
      overlay2: "bg-gradient-to-bl from-transparent via-primary/8 to-transparent",
      pattern: "radial-gradient(circle at 15% 25%, rgba(212,175,55,0.16) 0%, transparent 50%), radial-gradient(circle at 85% 75%, rgba(212,175,55,0.12) 0%, transparent 50%)",
      mesh: "linear-gradient(180deg, rgba(212,175,55,0.03) 0%, transparent 30%, transparent 70%, rgba(212,175,55,0.03) 100%)",
    },
    default: {
      base: "bg-gradient-to-br from-black via-gray-950 to-black",
      overlay1: "bg-gradient-to-tr from-primary/20 via-transparent to-primary/10",
      overlay2: "bg-gradient-to-bl from-transparent via-primary/5 to-transparent",
      pattern: "radial-gradient(circle at 20% 30%, rgba(212,175,55,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(212,175,55,0.1) 0%, transparent 50%)",
      mesh: "linear-gradient(135deg, rgba(212,175,55,0.03) 0%, transparent 25%, transparent 75%, rgba(212,175,55,0.03) 100%)",
    },
  };

  const pattern = backgroundPatterns[variant];

  return (
    <div className={`relative min-h-[65vh] md:min-h-[80vh] lg:min-h-screen flex items-center overflow-hidden ${className}`}>
      {/* Base gradient background */}
      <div className={`absolute inset-0 ${pattern.base}`} />
      
      {/* Animated gradient overlay 1 */}
      <motion.div
        className={`absolute inset-0 ${pattern.overlay1}`}
        animate={{
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Animated gradient overlay 2 */}
      <motion.div
        className={`absolute inset-0 ${pattern.overlay2}`}
        animate={{
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      {/* High-quality radial pattern overlay */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          background: pattern.pattern,
        }}
      />
      
      {/* Mesh gradient overlay */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          background: pattern.mesh,
        }}
      />
      
      {/* Animated orbs for depth */}
      <motion.div
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      
      {/* Subtle grid pattern for texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,175,55,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
      
      {/* Content overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      
      {/* Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}


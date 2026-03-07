import { motion } from "framer-motion";

interface DashboardLoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

export default function DashboardLoader({ text = "Loading", size = "md" }: DashboardLoaderProps) {
  const sizeClasses = {
    sm: { container: "gap-2", dot: "w-2 h-2", text: "text-xs" },
    md: { container: "gap-3", dot: "w-3 h-3", text: "text-sm" },
    lg: { container: "gap-4", dot: "w-4 h-4", text: "text-base" },
  };

  const s = sizeClasses[size];

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Logo pulse */}
      <motion.div
        className="relative mb-6"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center">
            <motion.div
              className="w-5 h-5 rounded-full bg-primary"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
        
        {/* Rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary/60"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Loading dots */}
      <div className={`flex items-center ${s.container}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${s.dot} rounded-full bg-primary`}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Text */}
      {text && (
        <motion.p
          className={`mt-4 text-muted-foreground ${s.text} font-medium`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

// Inline loader for buttons and small areas
export function InlineLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Card skeleton for content loading
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`bg-gradient-to-br from-primary/5 to-transparent rounded-lg border border-primary/10 overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="h-full w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}

// Stats skeleton
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <CardSkeleton className="h-24" />
        </motion.div>
      ))}
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-primary/10">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <CardSkeleton className="h-4" />
          </motion.div>
        ))}
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <motion.div
          key={rowIndex}
          className="flex gap-4 py-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: rowIndex * 0.08 }}
        >
          {[0, 1, 2, 3, 4].map((colIndex) => (
            <div key={colIndex} className="flex-1">
              <CardSkeleton className="h-5" />
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

// Full page loader
export function FullPageLoader({ text = "Loading your dashboard...", size = "lg" }: { text?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <div className={`flex items-center justify-center ${size === "sm" ? "min-h-[200px]" : "min-h-[400px]"}`}>
      <DashboardLoader text={text} size={size} />
    </div>
  );
}


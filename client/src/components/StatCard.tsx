import { memo } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  index?: number;
}

// Memoized for performance - prevents unnecessary re-renders
function StatCard({ title, value, icon: Icon, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <Card
        className="group relative p-6 border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 hover:border-primary/40 transition-all duration-300 overflow-hidden"
        data-testid={`card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Icon className="w-6 h-6 text-primary" />
            </motion.div>
          </div>
          <motion.div 
            className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent"
            data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
          >
            {value}
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}

export default memo(StatCard);

import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  buttonText: string;
  onClick?: () => void;
}

// Memoized for performance - prevents unnecessary re-renders
function ActionCard({
  title,
  description,
  icon: Icon,
  buttonText,
  onClick,
}: ActionCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative p-6 border-primary/20 bg-gradient-to-br from-background to-primary/5 hover:border-primary/40 transition-all duration-300 overflow-hidden h-full">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg blur opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
        
        <div className="relative z-10 flex flex-col h-full">
          <motion.div 
            className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20"
            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-7 h-7 text-primary" />
          </motion.div>
          <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 flex-grow leading-relaxed">{description}</p>
          <div className="flex justify-center">
            <Button
              onClick={onClick}
              className="neon-gold group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300"
              data-testid={`button-${buttonText.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default memo(ActionCard);

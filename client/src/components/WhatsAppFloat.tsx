import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion } from "framer-motion";

export default function WhatsAppFloat() {
  const [isVisible, setIsVisible] = useState(true);
  const whatsappNumber = "+971547199005"; // +971 54 719 9005
  const message = "Hi, I need help with Binofox Trading";

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <motion.button
        onClick={handleWhatsAppClick}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="group relative w-16 h-16 bg-[#25D366] hover:bg-[#20BA5A] rounded-full shadow-2xl flex items-center justify-center transition-all duration-300"
      >
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#25D366] to-[#20BA5A] blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
        
        {/* Icon */}
        <MessageCircle className="relative z-10 w-8 h-8 text-white" fill="currentColor" />
        
        {/* Notification badge */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">1</span>
        </div>
      </motion.button>

      {/* Close button (appears on hover) */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        whileHover={{ opacity: 1, scale: 1 }}
        onClick={() => setIsVisible(false)}
        className="absolute -top-2 -left-2 w-6 h-6 bg-black border border-primary/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3 text-primary" />
      </motion.button>
    </div>
  );
}

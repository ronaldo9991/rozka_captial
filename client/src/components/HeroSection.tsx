import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BRAND_TITLE } from "@/lib/brand";
import { ArrowRight, TrendingUp, ChevronDown, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center overflow-hidden pt-24">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.4 }}
        >
          <source src="/videos/herosectionvideo2.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/75"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-[4.236rem]"
          >
            {/* Trusted by Banner */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Trusted by 100,000+ Traders Worldwide</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold leading-[1.2] tracking-tight flex flex-col items-center gap-6 drop-shadow-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span>Trade Beyond Borders.</span>
              <span className="text-primary">Trade {BRAND_TITLE}.</span>
            </motion.h1>
            
            {/* Description */}
            <motion.p
              className="text-lg md:text-xl lg:text-[1.625rem] text-muted-foreground max-w-3xl mx-auto leading-relaxed drop-shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Experience next-generation forex trading with ultra-low spreads from 0.1 pips, 
              lightning-fast execution, and institutional-grade security.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-[1.618rem]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <Link href="/signin">
                <Button size="lg" className="gap-2 text-base md:text-lg px-8 py-6 h-auto shadow-lg" data-testid="button-open-live-account">
                  Open Live Account
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/signin?demo=true">
                <Button size="lg" variant="outline" className="gap-2 text-base md:text-lg px-8 py-6 h-auto backdrop-blur-sm" data-testid="button-try-demo">
                  Try Demo Free
                  <TrendingUp className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll CTA Button */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <button
          onClick={() => {
            const nextSection = document.querySelector('section, [id], .section');
            if (nextSection) {
              nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
            }
          }}
          className="group flex flex-col items-center gap-2 text-primary/70 hover:text-primary transition-colors duration-300"
          aria-label="Scroll to next section"
        >
          <span className="text-xs font-medium uppercase tracking-wider">Scroll</span>
          <motion.div
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-10 h-10 rounded-full border-2 border-primary/50 hover:border-primary bg-black/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/10 transition-all duration-300"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>
      </motion.div>
    </div>
  );
}

import PublicHeader from "@/components/PublicHeader";
import { BRAND_TITLE } from "@/lib/brand";
import FeatureCards from "@/components/FeatureCards";
import LiveTicker from "@/components/LiveTicker";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import AnimatedGrid from "@/components/AnimatedGrid";
import ParticleField from "@/components/ParticleField";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, TrendingUp, Zap, Globe, Award, Users, 
  BarChart3, Lock, Smartphone, Headphones, CheckCircle2,
  ArrowRight, Sparkles, Cpu, ChevronDown
} from "lucide-react";
import { Link } from "wouter";
import ProductsShowcase from "@/components/ProductsShowcase";
import CorporateServices from "@/components/CorporateServices";
import PromoCards from "@/components/PromoCards";
import PartnershipCards from "@/components/PartnershipCards";
import MobilePlatformsMockup from "@/components/MobilePlatformsMockup";
import AccountTypesWithSpreads from "@/components/AccountTypesWithSpreads";
import DownloadsSection from "@/components/DownloadsSection";
import { useMemo, useEffect } from "react";

export default function Home() {
  const stats = useMemo(() => [
    { value: "100K+", label: "Active Traders" },
    { value: "$5B+", label: "Monthly Volume" },
    { value: "0.1", label: "Pip Spreads" },
    { value: "24/7", label: "Support" },
  ], []);

  const platforms = useMemo(() => [
    { name: "MetaTrader 5", description: "Advanced trading platform" },
    { name: "WebTrader", description: "Trade from any browser" },
    { name: "Mobile Apps", description: "iOS & Android" },
  ], []);

  const whyChoose = useMemo(() => [
    {
      icon: Shield,
      title: "Regulated & Secure",
      description: "Licensed by FCA and CySEC with segregated client funds and negative balance protection.",
    },
    {
      icon: Zap,
      title: "Ultra-Fast Execution",
      description: "Order execution in milliseconds with no requotes. Average execution time under 0.03 seconds.",
    },
    {
      icon: Globe,
      title: "Global Markets",
      description: "Access 100+ currency pairs, commodities, indices, and cryptocurrencies from one account.",
    },
    {
      icon: Award,
      title: "Award Winning",
      description: "Best Forex Broker 2024. Recognized for excellence in trading technology and customer service.",
    },
    {
      icon: BarChart3,
      title: "Advanced Tools",
      description: "Professional charting, technical indicators, and algorithmic trading capabilities.",
    },
    {
      icon: Lock,
      title: "Bank-Level Security",
      description: "SSL encryption, 2FA authentication, and PCI DSS compliance for your peace of mind.",
    },
  ], []);

  const accountTypes = useMemo(() => [
    {
      name: "Startup",
      minDeposit: "$100",
      spread: "From 1.2 pips",
      leverage: "Up to 1:100",
      features: ["Free VPS", "24/5 Support", "Educational Resources"],
    },
    {
      name: "Standard",
      minDeposit: "$500",
      spread: "From 0.8 pips",
      leverage: "Up to 1:200",
      features: ["Priority Support", "Advanced Analytics", "Free Signals"],
      popular: true,
    },
    {
      name: "Pro",
      minDeposit: "$2,000",
      spread: "From 0.3 pips",
      leverage: "Up to 1:500",
      features: ["Dedicated Manager", "API Access", "Premium Tools"],
    },
    {
      name: "VIP",
      minDeposit: "$10,000",
      spread: "From 0.1 pips",
      leverage: "Up to 1:500",
      features: ["Personal Analyst", "Custom Solutions", "Exclusive Events"],
    },
  ], []);

  const testimonials = useMemo(() => [
    {
      name: "Sarah Mitchell",
      role: "Professional Trader",
      content: "The execution speed is incredible. I've been trading for 10 years and Rozka Capitals has the best platform I've used.",
      rating: 5,
    },
    {
      name: "David Chen",
      role: "Forex Investor",
      content: "Customer support is outstanding. They resolved my query within minutes. Highly recommended!",
      rating: 5,
    },
    {
      name: "Maria Rodriguez",
      role: "Day Trader",
      content: "Ultra-low spreads and no hidden fees. Finally found a broker I can trust with my capital.",
      rating: 5,
    },
  ], []);

  // Scroll to Downloads section when navigating to /#downloads
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#downloads") {
      // Slight delay to ensure layout is ready
      setTimeout(() => {
        const el = document.getElementById("downloads");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <PublicHeader />
      
      {/* Enhanced Hero - dYdX Inspired with Web3/Web4 Style */}
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ paddingTop: 'clamp(3.5rem, 5vh, 4.5rem)', paddingBottom: 'clamp(2.5rem, 5vh, 3.5rem)' }}>
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-background to-black"></div>
        
        {/* Hero background gradient */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/75"></div>
        </div>
        
        {/* Web3 Animation Components Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated Grid - Web3 style */}
          <AnimatedGrid variant="cyber" className="opacity-[0.04]" />
          
          {/* Particle Field - Web3 floating particles */}
          <ParticleField count={25} className="opacity-30" />
          
          {/* Floating dots - Web3 elegant effect */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`dot-${i}`}
              className="absolute rounded-full bg-primary/20"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
          
          {/* Floating geometric shapes - Web3 elegant effect */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`shape-${i}`}
              className="absolute"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 25}%`,
                width: '8px',
                height: '8px',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                transform: 'rotate(45deg)',
              }}
              animate={{
                rotate: [45, 405],
                opacity: [0.15, 0.4, 0.15],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut",
              }}
            />
          ))}
          
          {/* Subtle geometric accent lines */}
          <svg 
            className="absolute inset-0 w-full h-full opacity-[0.06]" 
            viewBox="0 0 1920 1080" 
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="elegantGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(212, 175, 55, 0.15)" />
                <stop offset="50%" stopColor="rgba(212, 175, 55, 0.08)" />
                <stop offset="100%" stopColor="rgba(212, 175, 55, 0.15)" />
              </linearGradient>
            </defs>
            {/* Subtle corner accents */}
            <motion.line
              x1="100"
              y1="100"
              x2="300"
              y2="100"
              stroke="url(#elegantGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <motion.line
              x1="100"
              y1="100"
              x2="100"
              y2="300"
              stroke="url(#elegantGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            />
            <motion.line
              x1="1820"
              y1="100"
              x2="1620"
              y2="100"
              stroke="url(#elegantGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
            />
            <motion.line
              x1="1820"
              y1="100"
              x2="1820"
              y2="300"
              stroke="url(#elegantGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
            />
          </svg>

          {/* Web3/Web4 Ornamental Elements - COMMENTED OUT */}
          {/* <svg 
            className="absolute inset-0 w-full h-full opacity-30" 
            viewBox="0 0 1920 1080" 
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="ornamentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(212, 175, 55, 0.4)" />
                <stop offset="50%" stopColor="rgba(139, 92, 246, 0.3)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.2)" />
              </linearGradient>
              <radialGradient id="ornamentGlow" cx="50%" cy="50%">
                <stop offset="0%" stopColor="rgba(212, 175, 55, 0.6)" />
                <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
              </radialGradient>
            </defs>
            
            <g transform="translate(1600, 100)">
              <motion.circle
                cx="0"
                cy="0"
                r="80"
                fill="none"
                stroke="url(#ornamentGradient)"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.6, rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.circle
                cx="0"
                cy="0"
                r="120"
                fill="none"
                stroke="url(#ornamentGradient)"
                strokeWidth="1"
                strokeDasharray="5,5"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.4, rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />
              <motion.polygon
                points="0,-60 52,30 -52,30"
                fill="none"
                stroke="rgba(212, 175, 55, 0.5)"
                strokeWidth="1.5"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.5, rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
            </g>

            <g transform="translate(200, 150)">
              <motion.polygon
                points="0,-50 43.3,-25 43.3,25 0,50 -43.3,25 -43.3,-25"
                fill="none"
                stroke="url(#ornamentGradient)"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.polygon
                points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15"
                fill="rgba(212, 175, 55, 0.1)"
                stroke="rgba(212, 175, 55, 0.3)"
                strokeWidth="1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 0.9, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
            </g>

            <g transform="translate(1700, 800)">
              <motion.path
                d="M 0,0 L 100,0 L 100,50 L 150,50 M 100,0 L 100,-50 L 50,-50"
                fill="none"
                stroke="rgba(212, 175, 55, 0.4)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.5 }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
              <motion.circle
                cx="0"
                cy="0"
                r="4"
                fill="rgba(212, 175, 55, 0.8)"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </g>

            <g transform="translate(1400, 400)">
              <motion.rect
                x="-40"
                y="-40"
                width="80"
                height="80"
                fill="none"
                stroke="rgba(139, 92, 246, 0.3)"
                strokeWidth="1.5"
                initial={{ rotate: 0, opacity: 0 }}
                animate={{ rotate: 45, opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <motion.rect
                x="-25"
                y="-25"
                width="50"
                height="50"
                fill="none"
                stroke="rgba(212, 175, 55, 0.4)"
                strokeWidth="1"
                initial={{ rotate: 45, opacity: 0 }}
                animate={{ rotate: -45, opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
            </g>
          </svg> */}

          {/* Subtle grid overlay */}
          <div className="absolute inset-0 cyber-grid opacity-[0.03]"></div>
          
          {/* Refined elegant gradient orbs - more subtle and professional */}
          <motion.div
            className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.04) 40%, transparent 70%)'
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.06) 0%, rgba(212, 175, 55, 0.03) 40%, transparent 70%)'
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.25, 0.4, 0.25],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>

        {/* Particle field - Web3 element - COMMENTED OUT */}
        {/* <ParticleField count={40} className="opacity-20" /> */}

        {/* Centered Content - dYdX style with Golden Ratio Typography */}
        <div className="container mx-auto max-w-[1280px] relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 flex-1 flex items-center justify-center" style={{ paddingTop: 'clamp(2rem, 4vh, 4rem)', paddingBottom: 'clamp(1.5rem, 3vh, 2rem)' }}>
          <div className="max-w-5xl mx-auto text-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full flex flex-col"
              style={{ 
                gap: 'clamp(1.5rem, 4vh, 3rem)',
                paddingBottom: 'clamp(1rem, 2vh, 1.5rem)'
              }}
            >
              {/* Main Title - Larger and Better Spaced */}
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] tracking-tight flex flex-col items-center px-4"
                style={{ gap: 'clamp(1.25rem, 2vh, 2rem)' }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span>Trade Beyond Borders.</span>
                <span className="text-gradient-gold text-glow-gold">Trade {BRAND_TITLE}.</span>
              </motion.h1>
              
              {/* Description - Optimized Size for Scroll Button Visibility */}
              <motion.p
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-4"
                style={{ 
                  lineHeight: '1.6',
                  marginTop: 'clamp(0.75rem, 2vh, 1.5rem)',
                  marginBottom: 'clamp(0.75rem, 2vh, 1.5rem)'
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Experience next-generation forex trading with ultra-low spreads from 0.1 pips, 
                lightning-fast execution, and institutional-grade security.
              </motion.p>

              {/* CTA Buttons - Better Spaced */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center w-full"
                style={{ 
                  paddingTop: 'clamp(1rem, 2.5vh, 2rem)',
                  marginTop: 'clamp(0.5rem, 1.5vh, 1rem)'
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link href="/signup">
                  <Button size="lg" className="gap-2 text-base md:text-lg px-8 py-6 h-auto magnetic-hover neon-gold shadow-[0_6px_20px_0_rgba(212,175,55,0.42)] hover:shadow-[0_8px_28px_0_rgba(212,175,55,0.55)]" data-testid="button-open-live-account">
                    Open Live Account
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/signup?demo=true">
                  <Button size="lg" variant="outline" className="gap-2 text-base md:text-lg px-8 py-6 h-auto magnetic-hover neon-border-animate" data-testid="button-try-demo">
                    Try Demo Free
                    <TrendingUp className="w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll CTA Button - Isolated in separate section */}
        <div className="absolute left-1/2 -translate-x-1/2 z-20 w-full flex justify-center" style={{ bottom: 'clamp(0.5rem, 2vh, 1.5rem)' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex justify-center"
          >
            <button
              onClick={() => {
                // Find the next section after hero (LiveTicker or first section)
                const heroSection = document.querySelector('.relative.min-h-screen');
                if (heroSection && heroSection.nextElementSibling) {
                  heroSection.nextElementSibling.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                }
              }}
              className="group flex items-center justify-center text-primary/70 hover:text-primary transition-colors duration-300"
              aria-label="Scroll to next section"
            >
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
      </div>

      <LiveTicker />

      <PromoCards />

      {/* Stats Section - HIDDEN */}
      {/* <div className="py-16 px-4 bg-accent/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div> */}

      {/* <FeatureCards /> */}

      {/* Trading Platforms - WebTrader Web3 Style */}
      <div className="pt-12 md:pt-16 pb-16 md:pb-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative overflow-hidden bg-muted/20">
        <AnimatedGrid variant="cyber" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto max-w-[1280px] relative z-10">
          {/* Title - Centered with enhanced styling */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Multi-Platform Trading</span>
            </motion.div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4">
                  <span className="text-gradient-gold text-glow-gold">Advanced</span> Trading Platforms
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Trade on desktop, web, or mobile with our cutting-edge platforms. 
              <span className="text-primary"> Experience lightning-fast execution anywhere, anytime.</span>
            </p>
          </motion.div>

          {/* Multi-Phone Mockup Layout */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-16 sm:mb-20"
          >
            <MobilePlatformsMockup />
          </motion.div>

          {/* Platform Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.5 + index * 0.1,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
              >
                <Card className="p-4 sm:p-6 md:p-8 text-center glass-morphism-strong card-hover-3d h-full group border-primary/20 relative overflow-hidden">
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 left-0 w-10 h-10 border-l-2 border-t-2 border-primary/30 rounded-tl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-r-2 border-b-2 border-primary/30 rounded-br-lg"></div>
                  
                  {/* Icon with enhanced glow */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 neon-gold group-hover:animate-pulse-glow transition-all duration-300 relative">
                      {index === 0 && <Cpu className="w-12 h-12 text-primary transition-colors duration-300" />}
                      {index === 1 && <Globe className="w-12 h-12 text-primary transition-colors duration-300" />}
                      {index === 2 && <Smartphone className="w-12 h-12 text-primary transition-colors duration-300" />}
                    </div>
                    {/* Glow ring */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-primary/20 rounded-2xl group-hover:scale-110 transition-transform duration-300"></div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-all duration-300">{platform.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{platform.description}</p>
                  
                  {/* Hover scan effect */}
                  <div className="absolute inset-0 scanline-effect"></div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Rozka Capitals */}
      <div className="pt-12 md:pt-16 pb-20 md:pb-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="container mx-auto max-w-[1280px]">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
              Why Choose <span className="text-gradient-gold text-glow-gold inline-block pb-2">{BRAND_TITLE}</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Join the world's most advanced forex trading platform trusted by professionals worldwide.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChoose.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-4 sm:p-6 md:p-8 border-card-border glass-morphism card-hover-3d scanline-effect h-full group">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 neon-gold group-hover:animate-pulse-glow transition-all duration-300">
                    <item.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 group-hover:text-primary transition-all duration-300">{item.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <PartnershipCards />

      <AccountTypesWithSpreads />

      <DownloadsSection />

      {/* Testimonials */}
      <div className="py-16 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 bg-accent/30">
        <div className="container mx-auto max-w-[1280px]">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
              What Our <span className="text-gradient-gold text-glow-gold inline-block pb-2">Traders Say</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Trusted by thousands of traders worldwide.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-4 sm:p-6 md:p-8 glass-morphism card-hover-3d h-full group">
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <CheckCircle2 key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed italic">{testimonial.content}</p>
                  <div className="pt-3 sm:pt-4 border-t border-primary/20">
                    <div className="font-semibold text-base sm:text-lg group-hover:text-primary transition-all duration-300">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <CTASection />
      <Footer />
    </div>
  );
}

import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import AnimatedGrid from "@/components/AnimatedGrid";
import ParticleField from "@/components/ParticleField";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Globe, TrendingUp, DollarSign, Clock, Users, Shield,
  Zap, BarChart3, ArrowRight, Check, LineChart
} from "lucide-react";
import { Link } from "wouter";
import CountingNumber from "@/components/CountingNumber";
import { useEffect, useRef } from "react";

export default function WhatIsForex() {
  const stats = [
    { value: 5.5, label: "Trillion USD", prefix: "$", suffix: "T", description: "Daily Trading Volume" },
    { value: 100, label: "Products", suffix: "+", description: "Investment Options" },
    { value: 24, label: "Hours Trading", suffix: "/7", description: "Market Accessibility" },
    { value: 100, label: "Leverage", prefix: "1:", description: "Trading Power" },
  ];

  const keyFeatures = [
    {
      icon: Globe,
      title: "World's Largest Financial Market",
      description: "Forex is the largest and most liquid financial market globally, with over $5.5 trillion traded daily. Connect with millions of traders worldwide and access unprecedented opportunities.",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=75&auto=format&fit=crop"
    },
    {
      icon: Clock,
      title: "24/7 Market Access",
      description: "Unlike stock markets, forex operates 24 hours a day, 7 days a week across different time zones. Trade whenever it suits you - morning, afternoon, or night.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=75&auto=format&fit=crop"
    },
    {
      icon: TrendingUp,
      title: "Trade Both Directions",
      description: "Profit from both rising and falling markets. Go long (buy) when you expect prices to rise, or go short (sell) when you anticipate a decline. Maximum flexibility for any market condition.",
      image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&q=75&auto=format&fit=crop"
    },
    {
      icon: Zap,
      title: "High Liquidity & Fast Execution",
      description: "Execute trades in milliseconds with tight spreads. The forex market's high liquidity ensures your orders are filled quickly at the best available prices.",
      image: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=600&q=75&auto=format&fit=crop"
    },
  ];

  const currencyPairs = [
    { name: "EUR/USD", description: "Euro vs US Dollar", type: "Major", volume: "Highest" },
    { name: "GBP/USD", description: "British Pound vs US Dollar", type: "Major", volume: "High" },
    { name: "USD/JPY", description: "US Dollar vs Japanese Yen", type: "Major", volume: "High" },
    { name: "AUD/USD", description: "Australian Dollar vs US Dollar", type: "Major", volume: "Medium" },
    { name: "EUR/GBP", description: "Euro vs British Pound", type: "Cross", volume: "Medium" },
    { name: "USD/TRY", description: "US Dollar vs Turkish Lira", type: "Exotic", volume: "Lower" },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Currency Pairs",
      description: "Forex trading involves buying one currency while simultaneously selling another. Currencies are quoted in pairs like EUR/USD (Euro/US Dollar).",
      icon: DollarSign
    },
    {
      step: "2",
      title: "Price Movement",
      description: "When you believe the first currency (base) will strengthen against the second (quote), you buy. If you expect it to weaken, you sell.",
      icon: TrendingUp
    },
    {
      step: "3",
      title: "Leverage Trading",
      description: "Use leverage up to 1:100 to control larger positions with a smaller initial investment. This amplifies both potential profits and risks.",
      icon: Zap
    },
    {
      step: "4",
      title: "Profit & Loss",
      description: "Your profit or loss is determined by the difference between your entry and exit prices, multiplied by your position size and leverage.",
      icon: BarChart3
    },
  ];

  // Refs for the Key Features section and scrollable cards
  const featuresSectionRef = useRef<HTMLDivElement | null>(null);
  const featureCardsRef = useRef<HTMLDivElement | null>(null);
  const isLockedRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unlockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll lock: Section snaps to center, then locks until all cards are scrolled
  useEffect(() => {
      const section = featuresSectionRef.current;
      const container = featureCardsRef.current;
      if (!section || !container) return;

    let isScrolling = false;

    const snapSectionToCenter = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const targetTop = (viewportHeight - rect.height) / 2;
      const currentTop = rect.top;
      const distance = currentTop - targetTop;

      if (Math.abs(distance) > 50) {
        window.scrollBy({
          top: distance,
          behavior: 'smooth'
        });
      }
    };

    const checkAndLockSection = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight / 2;
      const sectionCenter = rect.top + (rect.height / 2);
      const distanceFromCenter = Math.abs(sectionCenter - viewportCenter);
      
      const isSectionInView = rect.top < viewportHeight * 0.8 && rect.bottom > viewportHeight * 0.2;
      const isCentered = distanceFromCenter < 150;

      // Don't lock if we just unlocked (wait period)
      if (unlockTimeoutRef.current) return;

      // Don't lock if section is moving out of view (user scrolling past)
      const isScrollingPast = (rect.top < -100 && rect.bottom < viewportHeight * 0.3) || 
                              (rect.top > viewportHeight * 1.2);
      if (isScrollingPast) {
        isLockedRef.current = false;
        return;
      }

      if (isSectionInView && !isLockedRef.current) {
        // Check if cards are already scrolled - if at top, allow locking
        const { scrollTop } = container;
        if (scrollTop <= 20) {
          if (!isCentered) {
            snapSectionToCenter();
          } else {
            // Section is centered, lock it
            setTimeout(() => {
              // Double check section is still in view before locking
              const currentRect = section.getBoundingClientRect();
              if (currentRect.top < viewportHeight && currentRect.bottom > 0) {
                isLockedRef.current = true;
              }
            }, 300);
          }
        }
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (isScrolling) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const isSectionInView = rect.top < viewportHeight && rect.bottom > 0;

      // Always check card boundaries FIRST
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isScrollingDown = event.deltaY > 0;
      const atTop = scrollTop <= 20;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 20;

      // PRIORITY 1: If at bottom and scrolling down, unlock and allow page scroll
      if (atBottom && isScrollingDown) {
        isLockedRef.current = false;
        if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
        // Set a long timeout to prevent re-locking while user scrolls past section
        unlockTimeoutRef.current = setTimeout(() => {
          unlockTimeoutRef.current = null;
        }, 3000); // 3 seconds to allow scrolling past
        // CRITICAL: Don't prevent event - allow page to scroll down
        return;
      }

      // PRIORITY 2: If at top and scrolling up, unlock and allow page scroll
      if (atTop && !isScrollingDown) {
        isLockedRef.current = false;
        if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
        // Set a long timeout to prevent re-locking while user scrolls past section
        unlockTimeoutRef.current = setTimeout(() => {
          unlockTimeoutRef.current = null;
        }, 3000); // 3 seconds to allow scrolling past
        // CRITICAL: Don't prevent event - allow page to scroll up
        return;
      }

      // If section not in view, unlock and allow normal scroll
      if (!isSectionInView) {
        isLockedRef.current = false;
        return;
      }

      // PRIORITY 3: If section is locked and cards can scroll, scroll cards
      if (isLockedRef.current) {
      if ((isScrollingDown && !atBottom) || (!isScrollingDown && !atTop)) {
        event.preventDefault();
        event.stopPropagation();
          
          isScrolling = true;
        container.scrollBy({
            top: event.deltaY * 0.9,
          behavior: "smooth",
        });
          
          setTimeout(() => {
            isScrolling = false;
          }, 50);
        }
        return;
      }

      // PRIORITY 4: Section not locked - check if should lock (but not if just unlocked)
      if (unlockTimeoutRef.current) {
        // Just unlocked, don't re-lock yet
        return;
      }

      // Try to lock the section
      checkAndLockSection();
    };

    // Check on scroll to snap section to center
    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        if (!isLockedRef.current) {
          checkAndLockSection();
        }
      }, 50);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (unlockTimeoutRef.current) {
        clearTimeout(unlockTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center overflow-hidden pt-28 md:pt-40 pb-14 md:pb-20">
        <AnimatedGrid variant="cyber" />
        <ParticleField count={100} className="opacity-40" />
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/what is forex.jpg"
            alt="What is Forex"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.3 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto text-center"
          >
            <div className="inline-block mb-10">
              <div className="px-6 py-2.5 bg-primary/10 border border-primary/30 rounded-full backdrop-blur-sm neon-gold">
                <span className="text-primary font-semibold">The World's Largest Financial Market</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 md:mb-10 leading-tight">
              What is
              <span className="block mt-4 sm:mt-6 md:mt-8 lg:mt-10 text-gradient-animated text-glow-gold inline-block pb-2">Forex Trading?</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 px-4">
              Foreign Exchange (Forex/FX) is the global marketplace for trading currencies. Discover how <span className="text-primary font-bold">$5.5 trillion</span> moves through this market every single day.
            </p>
            
            {/* Golden Counter Numbers */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gradient-gold text-glow-gold mb-2 transform hover:scale-110 transition-transform duration-300 inline-block">
                    {stat.prefix}
                    <CountingNumber 
                      target={stat.value} 
                      duration={2500}
                      decimals={stat.value < 10 ? 1 : 0}
                    />
                    {stat.suffix}
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons - Golden Ratio spacing: 1.618rem */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/signup">
                <Button size="lg" className="neon-gold magnetic-hover shadow-[0_6px_20px_0_rgba(212,175,55,0.42)]">
                  Start Trading Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="neon-border-animate">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Understanding Forex Markets */}
      <div className="py-20 md:py-32 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative overflow-hidden bg-background">
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Understanding <span className="text-gradient-gold text-glow-gold">Forex Markets</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Forex, short for "foreign exchange," is the process of converting one currency into another for various purposes such as commerce, trading, or tourism.
            </p>
          </motion.div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative h-[320px] md:h-[380px] flex items-center justify-center group">
                {/* Soft gold glow behind image frame */}
                <div className="absolute inset-0 rounded-[32px] bg-primary/25 blur-3xl opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Image frame */}
                <div className="relative w-full h-full max-w-[720px] rounded-[28px] overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-black shadow-[0_24px_65px_rgba(0,0,0,0.7)]">
                  <img
                    src="/chart%20forex.png"
                    alt="Forex market chart"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="relative">
                <h3 className="text-3xl md:text-4xl font-bold mb-8 text-gradient-gold text-glow-gold inline-block pb-1">
                  The Forex Market
                </h3>
                <div className="space-y-6 text-muted-foreground leading-relaxed text-base md:text-lg">
                  <p>
                    The foreign exchange market is where currencies are traded. It's the largest and most liquid financial market in the world, with an average daily trading volume exceeding <span className="text-primary font-semibold">$5.5 trillion</span>.
                  </p>
                  <p>
                    Unlike stocks or commodities, forex doesn't have a centralized exchange. Instead, currencies trade electronically over-the-counter (OTC) through computer networks between traders worldwide.
                  </p>
                  <p>
                    The forex market operates 24 hours a day, 7 days a week across major financial centers in London, New York, Tokyo, Zurich, Frankfurt, Hong Kong, Singapore, Paris, and Sydney.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Key Features - Scroll Lock Section */}
      <div
        ref={featuresSectionRef}
        className="min-h-screen flex items-center py-20 md:py-32 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative overflow-hidden bg-background"
        style={{ scrollSnapAlign: 'center', scrollSnapStop: 'always' }}
      >
        <div className="container mx-auto max-w-7xl relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Heading & Intro - Centered Vertically */}
          <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
              className="lg:sticky lg:top-1/2 lg:-translate-y-1/2"
          >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                Key Features of <span className="text-gradient-gold text-glow-gold">Forex Trading</span>
            </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Discover the powerful features that make forex trading the world's most accessible and liquid financial market.
              </p>
          </motion.div>

            {/* Right Side - Scrollable Cards Container */}
            <div 
              ref={featureCardsRef}
              className="relative max-h-none overflow-visible lg:max-h-[70vh] lg:overflow-y-auto snap-y snap-mandatory scroll-smooth lg:[&::-webkit-scrollbar]:hidden lg:[-ms-overflow-style:none] lg:[scrollbar-width:none]"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className="space-y-8 pb-8">
              {keyFeatures.map((feature, index) => {
                // Create abstract circular illustrations for each feature
                const FeatureIllustration = () => {
                  switch (index) {
                    case 0: // World's Largest
                      return (
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                          <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="rgba(212,175,55,0.4)" />
                              <stop offset="100%" stopColor="rgba(212,175,55,0.1)" />
                            </linearGradient>
                          </defs>
                          <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="2"/>
                          <circle cx="100" cy="100" r="50" fill="rgba(212,175,55,0.05)"/>
                          <path d="M 30 100 Q 100 50 170 100" stroke="rgba(212,175,55,0.4)" strokeWidth="2.5" fill="none"/>
                          <path d="M 30 100 Q 100 150 170 100" stroke="rgba(212,175,55,0.4)" strokeWidth="2.5" fill="none"/>
                          <circle cx="100" cy="100" r="8" fill="rgba(212,175,55,0.7)"/>
                          <circle cx="70" cy="80" r="4" fill="rgba(212,175,55,0.5)"/>
                          <circle cx="130" cy="80" r="4" fill="rgba(212,175,55,0.5)"/>
                          <circle cx="70" cy="120" r="4" fill="rgba(212,175,55,0.5)"/>
                          <circle cx="130" cy="120" r="4" fill="rgba(212,175,55,0.5)"/>
                        </svg>
                      );
                    case 1: // 24/7 Market
                      return (
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                          <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="2"/>
                          <circle cx="100" cy="100" r="50" fill="rgba(212,175,55,0.05)"/>
                          <line x1="100" y1="100" x2="100" y2="50" stroke="rgba(212,175,55,0.6)" strokeWidth="3" strokeLinecap="round"/>
                          <line x1="100" y1="100" x2="130" y2="100" stroke="rgba(212,175,55,0.5)" strokeWidth="2.5" strokeLinecap="round"/>
                          <circle cx="100" cy="100" r="4" fill="rgba(212,175,55,0.8)"/>
                          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
                            const rad = (angle * Math.PI) / 180;
                            const x1 = 100 + 45 * Math.cos(rad);
                            const y1 = 100 + 45 * Math.sin(rad);
                            const x2 = 100 + 50 * Math.cos(rad);
                            const y2 = 100 + 50 * Math.sin(rad);
                            return (
                              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} 
                                    stroke="rgba(212,175,55,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
                            );
                          })}
                        </svg>
                      );
                    case 2: // Trade Both Directions
                      return (
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                          <path d="M 50 150 Q 100 50 150 150" stroke="rgba(212,175,55,0.4)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                          <path d="M 50 50 Q 100 150 150 50" stroke="rgba(212,175,55,0.4)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                          <circle cx="50" cy="150" r="6" fill="rgba(212,175,55,0.7)"/>
                          <circle cx="150" cy="50" r="6" fill="rgba(212,175,55,0.7)"/>
                          <path d="M 45 155 L 55 155 M 50 150 L 50 160" stroke="rgba(212,175,55,1)" strokeWidth="2.5" strokeLinecap="round"/>
                          <path d="M 145 45 L 155 45 M 150 50 L 150 40" stroke="rgba(212,175,55,1)" strokeWidth="2.5" strokeLinecap="round"/>
                          <circle cx="100" cy="100" r="3" fill="rgba(212,175,55,0.6)"/>
                        </svg>
                      );
                    case 3: // High Liquidity
                      return (
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                          <defs>
                            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="rgba(212,175,55,0.5)" />
                              <stop offset="100%" stopColor="rgba(212,175,55,0.1)" />
                            </linearGradient>
                          </defs>
                          <rect x="60" y="80" width="80" height="80" rx="8" fill="rgba(212,175,55,0.1)" stroke="rgba(212,175,55,0.3)" strokeWidth="2"/>
                          <rect x="70" y="100" width="20" height="40" fill="rgba(212,175,55,0.4)" rx="2"/>
                          <rect x="95" y="90" width="20" height="50" fill="rgba(212,175,55,0.5)" rx="2"/>
                          <rect x="120" y="110" width="20" height="30" fill="rgba(212,175,55,0.3)" rx="2"/>
                          <path d="M 50 180 L 150 180" stroke="rgba(212,175,55,0.2)" strokeWidth="1"/>
                          <circle cx="100" cy="60" r="15" fill="rgba(212,175,55,0.2)"/>
                          <path d="M 100 45 L 100 55 M 90 50 L 100 55 L 110 50" stroke="rgba(212,175,55,0.5)" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      );
                    default:
                      return null;
                  }
                };

                return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="group snap-start"
                  >
                    <div className="relative bg-gradient-to-br from-background via-muted/5 to-background border border-primary/10 rounded-2xl p-6 md:p-8 hover:border-primary/30 transition-all duration-300">
                      {/* Illustration Card */}
                      <div className="relative h-32 mb-6 rounded-xl bg-primary/5 overflow-hidden group-hover:bg-primary/10 transition-colors duration-300">
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                          <div className="w-full h-full max-w-[160px] mx-auto">
                            <FeatureIllustration />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <feature.icon className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-foreground">
                            {feature.title}
                          </h3>
                        </div>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>

                      {/* Decorative accent */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                </motion.div>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Pairs */}
      <div className="py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Popular Currency <span className="text-gradient-gold text-glow-gold inline-block pb-1">Pairs</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trade the world's most liquid currency pairs with tight spreads and fast execution
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currencyPairs.map((pair, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                <Card className="p-6 glass-morphism-strong border-primary/20 shadow-[0_0_30px_rgba(212,175,55,0.35),0_0_60px_rgba(212,175,55,0.2),0_0_90px_rgba(212,175,55,0.1)] hover:shadow-[0_0_40px_rgba(212,175,55,0.45),0_0_80px_rgba(212,175,55,0.25),0_0_120px_rgba(212,175,55,0.15)] transition-shadow duration-500">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-2xl font-bold text-gradient-gold text-glow-gold inline-block pb-1">{pair.name}</div>
                    <div className="px-3 py-1 bg-primary/10 rounded-full text-xs font-semibold text-primary">
                      {pair.type}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-3">{pair.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Trading Volume:</span>
                    <span className="text-foreground font-semibold">{pair.volume}</span>
                  </div>
                </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              How Forex <span className="text-gradient-gold text-glow-gold inline-block pb-1">Trading Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Understanding the fundamentals of forex trading
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <Card className="p-8 glass-morphism-strong border-primary/20 shadow-[0_0_30px_rgba(212,175,55,0.35),0_0_60px_rgba(212,175,55,0.2),0_0_90px_rgba(212,175,55,0.1)] hover:shadow-[0_0_40px_rgba(212,175,55,0.45),0_0_80px_rgba(212,175,55,0.25),0_0_120px_rgba(212,175,55,0.15)] transition-shadow duration-500 h-full">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center flex-shrink-0 animate-pulse-glow">
                      {item.step}
                    </div>
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-gradient-gold text-glow-gold inline-block pb-1">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-morphism-strong border-primary/20 p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=75&auto=format&fit=crop')] bg-cover bg-center opacity-5"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Start <span className="text-gradient-gold text-glow-gold inline-block pb-1">Trading Forex</span>?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of traders worldwide. Open your account today and access the world's largest financial market.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button size="lg" className="neon-gold magnetic-hover shadow-[0_6px_20px_0_rgba(212,175,55,0.42)]">
                      Open Live Account
                    </Button>
                  </Link>
                  <Link href="/forex">
                    <Button variant="outline" size="lg">
                      Explore More
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground/60 mt-6">
                  Risk Warning: Trading involves risk. Your capital is at risk.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}


import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import { BRAND_TITLE } from "@/lib/brand";
import AnimatedGrid from "@/components/AnimatedGrid";
import ParticleField from "@/components/ParticleField";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock, Globe, TrendingUp, Zap, DollarSign, Shield,
  BarChart3, Users, Smartphone, Check, ArrowRight, Lock
} from "lucide-react";
import { Link } from "wouter";
import { memo, useMemo } from "react";

// Component to render rising chart
function RisingChart() {
  // Generate rising trend line
  const points = Array.from({ length: 20 }, (_, i) => {
    const x = (i / 19) * 100;
    const y = 80 - (i / 19) * 50; // Rising from 80 to 30
    return `${x},${y}`;
  }).join(' ');

  // Generate realistic candlesticks with mix of red and green
  const candles = Array.from({ length: 15 }, (_, i) => {
    const x = (i / 14) * 90 + 5;
    const baseY = 80 - (i / 14) * 50;
    
    // Create realistic price movement with some volatility
    const trendOffset = -i * 3.5; // Overall upward trend
    const volatility = (Math.random() * 6 - 3); // Random volatility
    
    const open = baseY + volatility;
    // More green candles (60-70%) but some red ones for realism
    const isGreen = Math.random() > 0.3; // 70% chance of green
    const close = isGreen 
      ? open - (8 + Math.random() * 4) + trendOffset // Green: close higher than open
      : open + (6 + Math.random() * 3) - trendOffset; // Red: close lower than open
    
    const high = Math.min(open, close) - (3 + Math.random() * 3);
    const low = Math.max(open, close) + (3 + Math.random() * 3);
    
    return { x, open, close, high, low, isGreen };
  });

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      {/* Grid lines */}
      {[20, 40, 60, 80].map((y) => (
        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(212,175,55,0.1)" strokeWidth="0.5" />
      ))}
      {[10, 30, 50, 70, 90].map((x) => (
        <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="rgba(212,175,55,0.1)" strokeWidth="0.5" />
      ))}
      
      {/* Candlesticks - mix of green and red */}
      {candles.map((candle, i) => {
        const color = candle.isGreen ? '#10B981' : '#EF4444';
        return (
          <g key={i}>
            {/* Wick */}
            <line
              x1={candle.x}
              y1={candle.high}
              x2={candle.x}
              y2={candle.low}
              stroke={color}
              strokeWidth="0.8"
            />
            {/* Body */}
            <rect
              x={candle.x - 1.5}
              y={Math.min(candle.open, candle.close)}
              width="3"
              height={Math.abs(candle.open - candle.close) || 1}
              fill={color}
              opacity={candle.isGreen ? 0.9 : 1}
            />
          </g>
        );
      })}
      
      {/* Rising trend line */}
      <polyline
        points={points}
        fill="none"
        stroke="rgba(212, 175, 55, 0.8)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Glow effect for trend line */}
      <polyline
        points={points}
        fill="none"
        stroke="rgba(212, 175, 55, 0.3)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ForexAdvantages() {
  // Optimized image URLs - reduced size from 800px to 600px max for better performance
  const advantages = useMemo(() => [
    {
      icon: Clock,
      title: "24/7 Online Trading",
      description: "Trade all day long within the market. Create opportunities day and night with round-the-clock market access.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=75&auto=format&fit=crop",
      benefits: [
        "Trade during any session: Asian, European, American",
        "No waiting for market opening",
        "Flexibility for any schedule",
        "React to global news instantly"
      ]
    },
    {
      icon: Globe,
      title: "Biggest Financial Market in the World",
      description: "Daily trading volume is $5.5 Trillion with participants all over the world. Unmatched liquidity and opportunities.",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=75&auto=format&fit=crop",
      benefits: [
        "Highest liquidity of any market",
        "Tight spreads due to competition",
        "Easy entry and exit from positions",
        "Global market with millions of traders"
      ]
    },
    {
      icon: BarChart3,
      title: "100+ Investment Products",
      description: "Forex markets allow investors to trade more than a hundred currency pairs, from majors to exotics.",
      image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&q=75&auto=format&fit=crop",
      benefits: [
        "Major pairs (EUR/USD, GBP/USD, etc.)",
        "Minor pairs and crosses",
        "Exotic currency pairs",
        "Diversification opportunities"
      ]
    },
    {
      icon: TrendingUp,
      title: "1:100 Leverage",
      description: "Use leverage to invest 100 times your initial deposit. Amplify your trading power with controlled risk.",
      image: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=600&q=75&auto=format&fit=crop",
      benefits: [
        "Control large positions with small capital",
        "Flexible leverage options",
        "Margin-based trading",
        "Leverage up to 1:100"
      ]
    },
    {
      icon: TrendingUp,
      title: "Buy or Sell - Trade Both Directions",
      description: "Follow bullish or bearish markets by buying or selling contracts. Profit in any market condition.",
      image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=600&q=75&auto=format&fit=crop",
      benefits: [
        "Profit from rising markets (Long)",
        "Profit from falling markets (Short)",
        "No restrictions on short selling",
        "Hedge your positions"
      ]
    },
    {
      icon: Zap,
      title: "Online Fast and Easy Access",
      description: "Trade wherever, whenever. Just need an internet connection. Access markets from any device, anywhere in the world.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=75&auto=format&fit=crop",
      benefits: [
        "Web-based trading platforms",
        "Mobile apps for iOS & Android",
        "Desktop applications",
        "No geographic restrictions"
      ]
    },
    {
      icon: DollarSign,
      title: "Commission-Free Trading",
      description: "The only cost of a trade is the difference between bid and offer (spread). No hidden fees or commissions.",
      image: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=600&q=75&auto=format&fit=crop",
      benefits: [
        "No trading commissions",
        "Transparent spread pricing",
        "No deposit/withdrawal fees",
        "Lower costs = higher profits"
      ]
    },
    {
      icon: Smartphone,
      title: "One-Click Trading",
      description: "Easy access and instant execution with just one click. Execute trades in milliseconds.",
      image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600&q=75&auto=format&fit=crop",
      benefits: [
        "Instant order execution",
        "One-click buy/sell buttons",
        "Quick order modifications",
        "Real-time price updates"
      ]
    },
    {
      icon: Shield,
      title: "Regulated by Authorities Worldwide",
      description: "Regulations by different authorities keep investor deposits safe and secure. Trade with confidence.",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=75&auto=format&fit=crop",
      benefits: [
        "Segregated client funds",
        "Regulatory oversight",
        "Investor protection schemes",
        "Transparent operations"
      ]
    },
  ], []);

  const rozkaAdvantages = useMemo(() => [
    {
      icon: BarChart3,
      title: "Competitive Spreads",
      description: "Reduce your trading costs with industry-leading tight spreads starting from 0.1 pips."
    },
    {
      icon: Zap,
      title: "Ultra-Fast Execution",
      description: "Average execution time under 0.03 seconds. No requotes, no delays."
    },
    {
      icon: Users,
      title: "Dedicated Support",
      description: "24/7 multilingual customer support from trading experts."
    },
    {
      icon: Lock,
      title: "Advanced Security",
      description: "SSL encryption, 2FA, and segregated accounts for your protection."
    },
    {
      icon: Smartphone,
      title: "Professional Platforms",
      description: "MetaTrader 5, WebTrader, and mobile apps with advanced tools."
    },
    {
      icon: DollarSign,
      title: "No Hidden Fees",
      description: "Transparent pricing with no commissions on standard accounts."
    },
  ], []);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero */}
      <div className="relative min-h-screen flex items-center overflow-hidden pt-28 md:pt-40 pb-14 md:pb-20">
        <AnimatedGrid variant="hexagon" />
        <ParticleField count={25} className="opacity-40" />
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/advantage of forex.jpg"
            alt="Advantage of Forex"
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
            className="max-w-4xl mx-auto text-center mt-8"
          >
            {/* Badge - Golden Ratio: 16px base */}
            <div className="inline-block mb-[2.618rem]">
              <div className="px-6 py-2.5 bg-primary/10 border border-primary/30 rounded-full backdrop-blur-sm neon-gold">
                <span className="text-sm font-semibold text-primary">Turn Market Advantages in Your Favor</span>
              </div>
            </div>
            {/* Main Title - Golden Ratio: 16px * 1.618^3 = ~67px (closest: 4.25rem = 68px) */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold mb-6 sm:mb-8 md:mb-[4.236rem] leading-[1.2] tracking-tight px-4">
              Advantages of Trading <span className="block mt-4 sm:mt-6 md:mt-6 xl:mt-10 text-gradient-animated text-glow-gold inline-block pb-2">Forex</span>
            </h1>
            {/* Description - Golden Ratio: 16px * 1.618^1 = ~26px (closest: 1.625rem = 26px) */}
            <p className="text-base sm:text-lg md:text-xl lg:text-[1.625rem] text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-[2.618rem] px-4" style={{ lineHeight: '1.75rem' }}>
              Discover why forex is the world's most liquid market and how you can leverage its unique advantages for trading success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="neon-gold magnetic-hover shadow-[0_6px_20px_0_rgba(212,175,55,0.42)]">
                  Start Trading <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/what-is-forex">
                <Button variant="outline" size="lg">
                  Learn About Forex
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Advantages */}
      <div className="pt-24 md:pt-32 pb-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              The Advantages Forex Markets <span className="text-gradient-gold text-glow-gold inline-block pb-1">Give You</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Turn the advantages of the world's most liquid market in your favor
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {advantages.map((advantage, index) => (
                <motion.div
                  key={index}
                initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="h-full flex"
              >
                <Card 
                  className="group w-full h-full flex flex-col overflow-hidden glass-morphism-strong border-primary/20 hover:border-primary/40 shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_35px_rgba(212,175,55,0.4)] transition-all duration-500 cursor-pointer card-hover-3d relative"
                  onClick={() => {
                    // Scroll to top or navigate to detail page
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {/* Image/Chart on Top */}
                  <div className="relative h-[260px] flex-shrink-0 overflow-hidden">
                    {advantage.title === "Biggest Financial Market in the World" ? (
                      <div className="w-full h-full bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4">
                        <RisingChart />
                      </div>
                    ) : (
                        <img 
                          src={advantage.image}
                          alt={advantage.title}
                          loading="lazy"
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30"></div>
                    
                    {/* Icon Overlay */}
                    <div className="absolute top-4 right-4 z-10">
                      <motion.div 
                        className="w-16 h-16 rounded-xl bg-primary/25 backdrop-blur-md flex items-center justify-center border-2 border-primary/40 shadow-lg"
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <advantage.icon className="w-8 h-8 text-primary" />
                      </motion.div>
                    </div>
                    
                    {/* Hover Overlay Effect */}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/15 transition-colors duration-500"></div>
                    
                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1 min-h-0 bg-gradient-to-b from-card/50 to-card">
                    <h3 className="text-xl font-bold mb-3 text-gradient-gold text-glow-gold group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {advantage.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                          {advantage.description}
                        </p>
                    
                    {/* Benefits List */}
                    <ul className="space-y-2.5 mb-4 flex-shrink-0">
                      {advantage.benefits.slice(0, 3).map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-primary/30 transition-colors duration-300">
                                <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-xs text-muted-foreground line-clamp-1 group-hover:text-foreground transition-colors duration-300">{benefit}</span>
                            </li>
                          ))}
                      {advantage.benefits.length > 3 && (
                        <li className="text-xs text-primary/70 font-medium pl-7 group-hover:text-primary transition-colors duration-300">
                          +{advantage.benefits.length - 3} more benefits
                        </li>
                      )}
                        </ul>

                    {/* Click Indicator */}
                    <div className="flex items-center gap-2 text-primary/70 group-hover:text-primary transition-colors duration-300 mt-auto pt-3 border-t border-primary/10 group-hover:border-primary/30 flex-shrink-0">
                      <span className="text-xs font-semibold uppercase tracking-wider">Learn More</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                  
                  {/* Border Glow Effect */}
                  <div className="absolute inset-0 rounded-lg border-2 border-primary/0 group-hover:border-primary/30 transition-colors duration-500 pointer-events-none"></div>
                        </Card>
                </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Rozka Capitals Advantages */}
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
              The Advantages of Forex at <span className="text-gradient-gold text-glow-gold inline-block pb-1">{BRAND_TITLE}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We prioritize our investors' needs and support them with superior technology and advantages
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rozkaAdvantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 glass-morphism border-primary/20 card-hover-3d h-full">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:animate-pulse-glow">
                    <advantage.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{advantage.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {advantage.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-morphism-strong border-primary/20 p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Experience These <span className="text-gradient-gold text-glow-gold inline-block pb-1">Advantages</span>?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of traders who are already benefiting from forex market advantages with Rozka Capitals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button size="lg" className="neon-gold magnetic-hover shadow-[0_6px_20px_0_rgba(212,175,55,0.42)]">
                      Open Live Account
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="lg">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Export with memo for performance optimization
export default memo(ForexAdvantages);

// Also export named for potential use in tests
export { ForexAdvantages };


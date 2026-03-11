import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import { BRAND_TITLE } from "@/lib/brand";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Globe, 
  Zap, 
  Clock, 
  DollarSign, 
  LineChart,
  ShieldCheck,
  Wallet,
  Target,
  ArrowUpDown,
  Sparkles,
  Gift,
  Download,
  CreditCard,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";

export default function Forex() {
  const learnForexSteps = [
    {
      number: 1,
      icon: Globe,
      title: "What is Forex?",
      description: "The meaning of term 'Forex' is an abbreviation of Foreign and Exchange in which it leads to describe a contract that both an investor buys or sells. The contract refers a specific currency depreciation or an appreciation over another currency. It is the biggest and most attendant financial market in the world.",
    },
    {
      number: 2,
      icon: Zap,
      title: "Forex is a Leveraged Market",
      description: "In Forex markets your investment is 10 to 100 times valuable due to your margin agreement with us. With little investments you can access through bigger volumes. In Forex Markets you can use leverage to give many times bigger market orders of your initial investment.",
    },
    {
      number: 3,
      icon: Clock,
      title: "7 Days a Week 24 Hours a Day Open Market",
      description: "The sun never goes down in forex markets. You can trade without timing limitations, endless and uninterrupted orders can be executed in 24 hours a day and 5 days a week. You can grow your initial investment whenever you like.",
    },
    {
      number: 4,
      icon: ArrowUpDown,
      title: "You Can Trade Both Sides",
      description: "Forex markets allows you to execute both buy and sell orders on a specific contract. You can buy while a contract price is increasing, also sell in decreasing situations. You have the chance to trade ups and downs and turn crisis into your favor.",
    },
    {
      number: 5,
      icon: LineChart,
      title: "100+ Products to Trade",
      description: "Do not restrict your trading with exchanges only. You can choose a wide variety of products from our system to trade that suits you well.",
    },
    {
      number: 6,
      icon: Target,
      title: "Forex is Appropriate for Everyone",
      description: "Forex is suitable for every age and profession. You might had an experience in an exchange office. Consider Forex market as a huge exchange office with a lot of participant worldwide.",
    },
    {
      number: 7,
      icon: Wallet,
      title: "You Can Start with Little Investment",
      description: "You can start without a minimum investment limit. Enables you to invest many times of your deposit agreed with the help of the leverage. This enables all types of investor to invest in Forex markets.",
    },
    {
      number: 8,
      icon: Sparkles,
      title: "You Can Trade Wherever and Whenever You Like",
      description: "Forex is an OTC market and connected to the globe itself by electronic communications for 5 days 24 hours. Enables you to trade day and night without any interruption in your daily routine.",
    },
  ];

  const advantages = [
    {
      icon: Clock,
      title: "7/24 Online Trading",
      description: "You can trade all day long within the market. Create opportunities day and night.",
    },
    {
      icon: Globe,
      title: "Biggest Financial Market in the World",
      description: "Daily trading volume is 5.5 Trillion dollars with participants all over the world.",
    },
    {
      icon: LineChart,
      title: "100+ Investment Products",
      description: "Forex Markets allowed the investor to invest in more than a hundred products.",
    },
    {
      icon: Zap,
      title: "1:100 Leverage",
      description: "Use that leverage and have the ability to invest 100 times your initial deposit.",
    },
    {
      icon: ArrowUpDown,
      title: "Buy or Sell",
      description: "Follow bullish or bearish markets by buying or selling the contract.",
    },
    {
      icon: ShieldCheck,
      title: "Regulated Market",
      description: "Regulations by different authorities keep investor deposits safe and secure.",
    },
  ];

  // Scroll to specific sections based on hash (used by footer links)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash) return;

    const targetIdMap: Record<string, string> = {
      "#what-is-forex": "what-is-forex",
      "#benefits": "benefits",
      "#forexpedia": "forexpedia",
      "#deposits": "deposits",
    };

    const targetId = targetIdMap[hash];
    if (!targetId) return;

    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }, []);

  return (
    <div className="min-h-screen">
      <PublicHeader />
      
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center overflow-hidden pt-28 md:pt-40 pb-14 md:pb-20">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/hero img.jpeg"
            alt="Rozka Capitals Hero"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.65 }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/70 to-black/85"></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5"></div>
        
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto text-center"
          >
            {/* Badge - Golden Ratio: 16px base */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-block mb-[2.618rem]"
            >
              <div className="px-6 py-2 bg-primary/10 border border-primary/30 rounded-full backdrop-blur-sm neon-gold">
                <span className="text-sm font-semibold text-primary">One Step Ahead in Forex</span>
              </div>
            </motion.div>
            
            {/* Main Title - Golden Ratio: 16px * 1.618^3 = ~67px (closest: 4.25rem = 68px) */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold mb-6 sm:mb-8 md:mb-[4.236rem] leading-[1.2] tracking-tight flex flex-col items-center gap-4 sm:gap-6 px-4">
              <span>Trade in the</span>
              <span className="text-gradient-gold text-glow-gold inline-block pb-2">World's Largest</span>
              <span>Market</span>
            </h1>
            {/* Description - Golden Ratio: 16px * 1.618^1 = ~26px (closest: 1.625rem = 26px) */}
            <motion.p 
              className="text-base sm:text-lg md:text-xl lg:text-[1.625rem] text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 md:mb-[2.618rem] px-4"
              style={{ lineHeight: '1.75rem' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Forex, also known as foreign exchange, FX or currency trading, is a decentralized global market 
              where all the world's currencies are trading.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-10 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/signup">
                <Button size="lg" className="neon-gold magnetic-hover text-lg px-10">
                  OPEN LIVE ACCOUNT <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">100+</div>
                  <div className="text-sm text-muted-foreground">Products</div>
                </div>
                <div className="w-px h-12 bg-primary/30"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">5.5T</div>
                  <div className="text-sm text-muted-foreground">Daily Volume</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Understanding Forex Markets */}
      <div id="what-is-forex" className="py-20 md:py-32 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative overflow-hidden bg-background">
        <div className="container mx-auto relative z-10 max-w-7xl">
          {/* Section Header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Understanding <span className="text-gradient-gold text-glow-gold">Forex Markets</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Master the fundamentals of the world's largest financial market with our comprehensive guide
            </p>
          </motion.div>

          {/* Invisible anchor for Forexpedia footer link (shares this overview section) */}
          <div id="forexpedia" className="h-0 w-0 overflow-hidden" aria-hidden="true" />

          {/* Steps Grid - Clean Card Layout */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {learnForexSteps.map((step, index) => {
              // Create SVG illustrations for each step
              const Illustration = () => {
                switch (step.number) {
                  case 1: // What is Forex?
                    return (
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        <defs>
                          <linearGradient id="globe1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(212,175,55,0.3)" />
                            <stop offset="100%" stopColor="rgba(212,175,55,0.1)" />
                          </linearGradient>
                        </defs>
                        <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="2"/>
                        <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1.5"/>
                        <path d="M 30 100 Q 100 60 170 100" stroke="rgba(212,175,55,0.5)" strokeWidth="2" fill="none"/>
                        <path d="M 30 100 Q 100 140 170 100" stroke="rgba(212,175,55,0.5)" strokeWidth="2" fill="none"/>
                        <circle cx="100" cy="100" r="8" fill="rgba(212,175,55,0.8)"/>
                        <path d="M 60 80 L 80 70 M 140 80 L 120 70 M 60 120 L 80 130 M 140 120 L 120 130" 
                              stroke="rgba(212,175,55,0.6)" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    );
                  case 2: // Leveraged Market
                    return (
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        <defs>
                          <linearGradient id="leverage1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(212,175,55,0.4)" />
                            <stop offset="100%" stopColor="rgba(212,175,55,0.1)" />
                          </linearGradient>
                        </defs>
                        <rect x="40" y="140" width="30" height="40" fill="rgba(212,175,55,0.3)" rx="2"/>
                        <rect x="85" y="100" width="30" height="80" fill="rgba(212,175,55,0.4)" rx="2"/>
                        <rect x="130" y="60" width="30" height="120" fill="rgba(212,175,55,0.5)" rx="2"/>
                        <line x1="55" y1="140" x2="55" y2="120" stroke="rgba(212,175,55,0.6)" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="100" y1="100" x2="100" y2="80" stroke="rgba(212,175,55,0.7)" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="145" y1="60" x2="145" y2="40" stroke="rgba(212,175,55,0.8)" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M 30 180 L 170 180" stroke="rgba(212,175,55,0.3)" strokeWidth="1"/>
                        <text x="100" y="195" textAnchor="middle" fontSize="10" fill="rgba(212,175,55,0.6)" fontFamily="system-ui">1x → 10x → 100x</text>
                      </svg>
                    );
                  case 3: // 24/7 Market
                    return (
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="2"/>
                        <circle cx="100" cy="100" r="50" fill="rgba(212,175,55,0.05)"/>
                        <line x1="100" y1="100" x2="100" y2="50" stroke="rgba(212,175,55,0.6)" strokeWidth="3" strokeLinecap="round"/>
                        <line x1="100" y1="100" x2="130" y2="100" stroke="rgba(212,175,55,0.5)" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="100" cy="100" r="4" fill="rgba(212,175,55,0.8)"/>
                        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
                          const rad = (angle * Math.PI) / 180;
                          const x1 = 100 + 45 * Math.cos(rad);
                          const y1 = 100 + 45 * Math.sin(rad);
                          const x2 = 100 + 50 * Math.cos(rad);
                          const y2 = 100 + 50 * Math.sin(rad);
                          return (
                            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} 
                                  stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
                          );
                        })}
                        <circle cx="100" cy="100" r="2" fill="rgba(212,175,55,0.6)"/>
                      </svg>
                    );
                  case 4: // Trade Both Sides
                    return (
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        <path d="M 50 150 Q 100 50 150 150" stroke="rgba(212,175,55,0.4)" strokeWidth="2" fill="none"/>
                        <path d="M 50 50 Q 100 150 150 50" stroke="rgba(212,175,55,0.4)" strokeWidth="2" fill="none"/>
                        <circle cx="50" cy="150" r="6" fill="rgba(212,175,55,0.8)"/>
                        <circle cx="150" cy="50" r="6" fill="rgba(212,175,55,0.8)"/>
                        <path d="M 45 155 L 55 155 M 50 150 L 50 160" stroke="rgba(212,175,55,1)" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M 145 45 L 155 45 M 150 50 L 150 40" stroke="rgba(212,175,55,1)" strokeWidth="2" strokeLinecap="round"/>
                        <text x="100" y="110" textAnchor="middle" fontSize="12" fill="rgba(212,175,55,0.7)" fontFamily="system-ui" fontWeight="600">BUY</text>
                        <text x="100" y="90" textAnchor="middle" fontSize="12" fill="rgba(212,175,55,0.7)" fontFamily="system-ui" fontWeight="600">SELL</text>
                      </svg>
                    );
                  case 5: // 100+ Products
                    return (
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        <rect x="40" y="60" width="30" height="40" fill="rgba(212,175,55,0.3)" rx="3"/>
                        <rect x="85" y="50" width="30" height="50" fill="rgba(212,175,55,0.4)" rx="3"/>
                        <rect x="130" y="70" width="30" height="30" fill="rgba(212,175,55,0.3)" rx="3"/>
                        <circle cx="55" cy="130" r="15" fill="rgba(212,175,55,0.3)"/>
                        <circle cx="100" cy="125" r="18" fill="rgba(212,175,55,0.4)"/>
                        <circle cx="145" cy="135" r="12" fill="rgba(212,175,55,0.3)"/>
                        <path d="M 30 160 L 170 160" stroke="rgba(212,175,55,0.2)" strokeWidth="1"/>
                        <text x="100" y="185" textAnchor="middle" fontSize="14" fill="rgba(212,175,55,0.7)" fontFamily="system-ui" fontWeight="600">100+</text>
                      </svg>
                    );
                  case 6: // Appropriate for Everyone
                    return (
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        <circle cx="100" cy="100" r="50" fill="rgba(212,175,55,0.1)"/>
                        <circle cx="70" cy="90" r="20" fill="rgba(212,175,55,0.3)"/>
                        <circle cx="130" cy="90" r="20" fill="rgba(212,175,55,0.3)"/>
                        <circle cx="100" cy="120" r="25" fill="rgba(212,175,55,0.2)"/>
                        <path d="M 60 140 Q 100 160 140 140" stroke="rgba(212,175,55,0.5)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <circle cx="100" cy="100" r="2" fill="rgba(212,175,55,0.8)"/>
                      </svg>
                    );
                  case 7: // Start with Little Investment
                    return (
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        <rect x="60" y="120" width="80" height="50" fill="rgba(212,175,55,0.2)" rx="4"/>
                        <rect x="70" y="130" width="20" height="30" fill="rgba(212,175,55,0.4)" rx="2"/>
                        <rect x="95" y="125" width="20" height="35" fill="rgba(212,175,55,0.5)" rx="2"/>
                        <rect x="120" y="135" width="20" height="25" fill="rgba(212,175,55,0.3)" rx="2"/>
                        <circle cx="100" cy="80" r="25" fill="rgba(212,175,55,0.2)"/>
                        <path d="M 100 55 L 100 75 M 85 70 L 100 75 L 115 70" stroke="rgba(212,175,55,0.6)" strokeWidth="2" strokeLinecap="round"/>
                        <text x="100" y="200" textAnchor="middle" fontSize="10" fill="rgba(212,175,55,0.6)" fontFamily="system-ui">Start Small</text>
                      </svg>
                    );
                  case 8: // Trade Wherever and Whenever
                    return (
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        <rect x="50" y="80" width="100" height="60" fill="rgba(212,175,55,0.1)" rx="8"/>
                        <rect x="60" y="90" width="80" height="40" fill="rgba(212,175,55,0.2)" rx="4"/>
                        <circle cx="80" cy="110" r="3" fill="rgba(212,175,55,0.6)"/>
                        <circle cx="100" cy="110" r="3" fill="rgba(212,175,55,0.6)"/>
                        <circle cx="120" cy="110" r="3" fill="rgba(212,175,55,0.6)"/>
                        <path d="M 40 60 L 160 60 M 40 50 L 50 60 L 40 70" stroke="rgba(212,175,55,0.5)" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M 160 50 L 150 60 L 160 70" stroke="rgba(212,175,55,0.5)" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="100" cy="40" r="15" fill="rgba(212,175,55,0.3)"/>
                        <path d="M 100 25 L 100 35 M 90 30 L 100 35 L 110 30" stroke="rgba(212,175,55,0.6)" strokeWidth="2" strokeLinecap="round"/>
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
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <div className="relative h-full bg-gradient-to-br from-background via-background to-muted/20 border border-primary/10 rounded-2xl p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(212,175,55,0.12)]">
                    {/* Illustration */}
                    <div className="relative mb-6 h-32 flex items-center justify-center">
                      <div className="absolute inset-0 bg-primary/5 rounded-xl blur-xl group-hover:bg-primary/10 transition-colors duration-300"></div>
                      <div className="relative w-full h-full max-w-[160px] mx-auto">
                        <Illustration />
                      </div>
                    </div>

                    {/* Step Number */}
                    <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{step.number}</span>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-xl md:text-2xl font-bold text-gradient-gold text-glow-gold leading-tight pr-8">
                          {step.title}
                        </h3>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        {step.description}
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

      {/* Advantages Section */}
      <div className="py-16 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 web3-grid-bg opacity-5"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Section Header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The <span className="text-gradient-gold text-glow-gold inline-block pb-1">Advantages</span> That Forex Markets Give
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Turn the advantages of the world's most liquid market in your favor
            </p>
          </motion.div>

          {/* Advantages Grid - Timeline Style */}
          <div className="relative max-w-5xl mx-auto">
            {/* Horizontal connecting line */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {advantages.map((advantage, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.15 }}
                  className="relative text-center"
                >
                  {/* Connection point */}
                  <div className="hidden md:block absolute top-20 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10">
                    <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
                  </div>

                  {/* Vertical line from connection to icon */}
                  <div className="hidden md:block absolute top-24 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-primary/50 to-transparent"></div>

                  {/* Content */}
                  <div className="pt-28 md:pt-36 lg:pt-40">
                    {/* Icon */}
                    <motion.div
                      className="relative inline-flex items-center justify-center mb-6"
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150"></div>
                      <div className="relative w-24 h-24 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center border-2 border-primary/40 backdrop-blur-sm">
                        <advantage.icon className="w-12 h-12 text-primary" />
                      </div>
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 text-foreground">
                      {advantage.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed">
                      {advantage.description}
                    </p>

                    {/* Decorative line */}
                    <motion.div
                      className="w-16 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mt-4"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    ></motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Rozka Capitals for Forex */}
      <div id="benefits" className="py-16 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-5"></div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The Benefits of Forex in <span className="text-gradient-gold text-glow-gold inline-block pb-1">{BRAND_TITLE}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We prioritise our investors' needs and support them with superior technology and advantages
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {[ 
                {
                  icon: ShieldCheck,
                  title: "Benefit 01",
                  heading: "Forex Market is Regulated",
                  description: "By regulators around the world, the OTC Forex market is regulated and is protecting the investors. With the help of different regulations in different countries, Rozka Capitals leads you towards the path to invest.",
                },
                {
                  icon: DollarSign,
                  title: "Benefit 02",
                  heading: "Commission Free Trading",
                  description: "The only cost of a trade to an investor is the difference between bid and offer. You can gain profit by the difference between the prices of your opened and closed positions.",
                },
                {
                  icon: Wallet,
                  title: "Benefit 03",
                  heading: "Wallet Friendly Investment",
                  description: "To enhance your trading skills before investing more, you can start with minimum deposits. It is suitable for everyone.",
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className="glass-morphism-strong border border-primary/20 rounded-3xl p-8 shadow-[0_0_30px_rgba(212,175,55,0.35),0_0_60px_rgba(212,175,55,0.2),0_0_90px_rgba(212,175,55,0.1)] hover:shadow-[0_0_40px_rgba(212,175,55,0.45),0_0_80px_rgba(212,175,55,0.25),0_0_120px_rgba(212,175,55,0.15)] transition-all duration-500 h-full flex flex-col"
                >
                  <motion.div
                    className="relative inline-flex items-center justify-center mb-6"
                    whileHover={{ scale: 1.12 }}
                    transition={{ type: "spring", stiffness: 280 }}
                  >
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center border-2 border-primary/40 backdrop-blur-sm">
                      <benefit.icon className="w-10 h-10 text-primary" />
                    </div>
                  </motion.div>

                  <div className="text-sm uppercase tracking-[0.3em] text-primary mb-2 text-center">
                    {benefit.title}
                  </div>
                  <h3 className="text-xl font-bold text-gradient-gold text-glow-gold text-center mb-4 inline-block pb-1">
                    {benefit.heading}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-center flex-1">
                    {benefit.description}
                  </p>

                  <div className="flex items-center justify-center gap-2 mt-6 text-primary/70">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-widest">Trusted by Rozka Capitals</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deposits & Bonuses Section */}
      <div id="deposits" className="py-16 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 bg-accent/30 relative overflow-hidden">
        <div className="absolute inset-0 web3-grid-bg opacity-5"></div>
        <div className="container mx-auto relative z-10 max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Deposits, Withdrawals & <span className="text-gradient-gold text-glow-gold inline-block pb-1">Bonuses</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Easy funding options and exclusive bonus programs
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {/* Deposits & Withdrawals */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center h-full"
            >
              <motion.div
                className="relative inline-flex items-center justify-center mb-6"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-[16px] scale-150"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center border-2 border-primary/40 backdrop-blur-[8px]">
                  <CreditCard className="w-12 h-12 text-primary" />
                </div>
              </motion.div>
              <h3 className="text-xl font-bold mb-3 text-gradient-gold text-glow-gold">Deposits & Withdrawals</h3>
              <p className="text-muted-foreground leading-relaxed">
                Fast, secure, and hassle-free transactions with multiple payment methods
              </p>
            </motion.div>

            {/* Deposit Bonus */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col items-center text-center h-full"
            >
              <motion.div
                className="relative inline-flex items-center justify-center mb-6"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-[16px] scale-150"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center border-2 border-primary/40 backdrop-blur-[8px]">
                  <Gift className="w-12 h-12 text-primary" />
                </div>
              </motion.div>
              <h3 className="text-xl font-bold mb-3 text-gradient-gold text-glow-gold">Deposit Bonus</h3>
              <p className="text-muted-foreground leading-relaxed">
                Boost your trading capital with our exclusive deposit bonus programs
              </p>
            </motion.div>

            {/* Downloads */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center text-center h-full"
            >
              <motion.div
                className="relative inline-flex items-center justify-center mb-6"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-[16px] scale-150"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center border-2 border-primary/40 backdrop-blur-[8px]">
                  <Download className="w-12 h-12 text-primary" />
                </div>
              </motion.div>
              <h3 className="text-xl font-bold mb-3 text-gradient-gold text-glow-gold">Downloads</h3>
              <p className="text-muted-foreground leading-relaxed">
                Access trading platforms, tools, and educational resources
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5"></div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="glass-morphism-strong border-2 border-primary/30 rounded-3xl p-12 md:p-16 neon-gold max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Start <span className="text-gradient-gold text-glow-gold inline-block pb-1">Trading Forex?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of traders who trust Rozka Capitals for their forex trading needs. 
                Open your account today and experience the difference.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="neon-gold magnetic-hover text-lg px-10">
                    OPEN LIVE ACCOUNT <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="neon-border-animate text-lg px-10">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}


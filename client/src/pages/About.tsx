import PublicHeader from "@/components/PublicHeader";
import { BRAND_TITLE } from "@/lib/brand";
import Footer from "@/components/Footer";
import CountingNumber from "@/components/CountingNumber";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { 
  Lightbulb, 
  Rocket, 
  Target, 
  Users, 
  Globe, 
  TrendingUp, 
  Sparkles, 
  Layers, 
  Infinity,
  Brain,
  Palette,
  Music,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { Link } from "wouter";
import TradingPlatformsMockup from "@/components/TradingPlatformsMockup";
import AnimatedGrid from "@/components/AnimatedGrid";
import { BarChart3 } from "lucide-react";
import { useEffect } from "react";

export default function About() {
  const stats = [
    { value: 500, suffix: "+", label: "Employees Worldwide" },
    { value: 60, suffix: "+", label: "Countries Available" },
    { value: 70000, suffix: "+", label: "Happy Customers Worldwide" },
  ];

  const philosophyPrinciples = [
    {
      icon: Lightbulb,
      title: "We are simple and easy to understand",
      description: "We believe in simplicity because we know plainness will bring you much closer to us. Simplicity is one of our goals. We know it shall be easier for us to work together and form a working bond with each other due to simple and clear communication modes. We invite you to invest on the products and for that, we provide the simplest explanation.",
    },
    {
      icon: Rocket,
      title: "We love to produce",
      description: "We are innovators! We develop and produce to offer you the best service available. Being innovators, we offer services and products best suited for your taste and money. Our financial market is developed consistently to provide you a financial market in every aspect, which shall help you in gaining an accurate point of view.",
    },
    {
      icon: Target,
      title: "We love to excel",
      description: "We always explore! We love to add the value of excellence in financial markets. We aim to excel at our financial markets and to add value to it. Our priority is to excel at what we do. With the best Technology, infrastructure and trading conditions, we help you move towards a successful future.",
    },
  ];

  const naturephilosophy = [
    {
      icon: Infinity,
      title: "UNIVERSE IS CHAOS",
      description: "Investing is a lifetime profession and a discipline of constant learning. Markets appear chaotic, yet every turbulent move hides an internal structure. The Rozka Capitals philosophy embraces that duality—helping traders decode disorder to find new alpha.",
      image: "/chaos.jpg"
    },
    {
      icon: Brain,
      title: "UNPREDICTABLE",
      description: "No cycle repeats perfectly. Our research teams model the emergent patterns that self-correct and evolve, turning unpredictability into a strategic advantage without ignoring risk.",
      image: "https://images.pexels.com/photos/260024/pexels-photo-260024.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
    },
    {
      icon: Layers,
      title: "WINNING LOOP",
      description: "Each feedback loop—from strategy testing to post-trade analytics—adds a new layer of intelligence. Rozka Capitals platforms hardwire these loops so traders can refine faster and scale smarter.",
      image: "/winning.jpg"
    },
    {
      icon: Palette,
      title: "ART OF TRADING",
      description: "We believe trading is both science and art. Craft, timing, and emotional discipline harmonize with data-driven execution—turning every portfolio into a symphony of well-calibrated decisions.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f"
    },
  ];

  const howToTrade = [
    {
      step: "1",
      title: "Open Demo Account",
      description: "You can fill the free demo account form on the side to open an unreal account and try the market without any risk.",
    },
    {
      step: "2",
      title: "Open Real Account",
      description: "You can apply to open a real account to enter the world of investment.",
    },
    {
      step: "3",
      title: "Start Trading",
      description: "After depositing the initial investment you can easily start to trade.",
    },
  ];

  // Scroll to Philosophy section when navigating to /about#philosophy
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#philosophy") {
      setTimeout(() => {
        const el = document.getElementById("philosophy");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <PublicHeader />
      
      {/* Hero Section */}
      <div className="relative min-h-[65vh] md:min-h-[80vh] flex items-center overflow-hidden pt-28 md:pt-40 pb-14 md:pb-20">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/hero img.jpeg"
            alt="Rozka Capitals Hero"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.55 }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-black/90"></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5"></div>
        
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative z-10 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-block mb-10"
            >
              <div className="px-6 py-2 bg-primary/10 border border-primary/30 rounded-full backdrop-blur-sm neon-gold">
                <span className="text-primary font-semibold">An investment company for who think big</span>
              </div>
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 md:mb-10 px-4">
              About <span className="text-gradient-gold text-glow-gold">{BRAND_TITLE}</span>
            </h1>
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary mb-6 sm:mb-8 md:mb-10 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              A game Changer!
            </motion.p>
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {/*Rozka Capitals is reshaping the rules in Investment world and simplicity to invest.*/}
              Rozka Capitals is a global investment company that provides a range of investment products and services to its clients.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-6 mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="gap-2 neon-gold magnetic-hover shadow-[0_6px_20px_0_rgba(212,175,55,0.42)] hover:shadow-[0_8px_28px_0_rgba(212,175,55,0.55)] transition-all duration-300"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2 shadow-[0_2px_10px_0_rgba(212,175,55,0.18)] hover:shadow-[0_4px_14px_0_rgba(212,175,55,0.28)] hover:scale-105 transition-all duration-300"
                >
                  Contact Us
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats - Without Icons, With Counting Animation */}
          <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3 mt-16 sm:mt-20 lg:mt-24 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.15 }}
                className="text-center group"
              >
                {/* Counting Number */}
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-3 text-glow-gold">
                  <CountingNumber 
                    target={stat.value} 
                    suffix={stat.suffix}
                    duration={2500}
                  />
                </div>

                {/* Label */}
                <div className="text-base sm:text-lg text-muted-foreground font-medium group-hover:text-foreground transition-colors duration-300">
                  {stat.label}
                </div>

                {/* Decorative line */}
                <motion.div 
                  className="w-16 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 1 + index * 0.15 }}
                ></motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* About Rozka Capitals Section - Redesigned */}
      <div className="py-16 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 bg-muted/30 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 web3-grid-bg opacity-5"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Main Content - Simplified Layout */}
          <div className="max-w-5xl mx-auto relative">
            {/* Company Description */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-12 mb-20"
            >
              {/* Logo */}
                  <div className="flex justify-center">
                      <Logo className="!gap-2 [&>div]:w-12 [&>div]:h-12" showText />
                    </div>

              {/* Main Text */}
              <div className="space-y-6 text-center">
                <p className="text-xl md:text-2xl text-foreground leading-relaxed">
                  <span className="font-bold text-gradient-gold text-glow-gold">{BRAND_TITLE}</span> is a global forex broker built for traders who demand better. 
                  Founded in 2018 in London, we've grown from a boutique dealing desk into a trusted platform serving over 70,000 traders across 60 countries. 
                  Our mission is simple: make professional grade forex trading accessible to everyone. We combine institutional level execution with 
                  transparent pricing, cutting edge technology, and genuine customer support. At Rozka Capitals, you're not just another account number. 
                  You're part of a community that values your success as much as we value ours.
                  </p>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  As a company, Rozka Capitals specializes in foreign exchange trading, the world's largest financial market where over $7.5 trillion trades daily. 
                  We provide access to this market through our proprietary trading platform, offering spreads starting from 0.1 pips, execution speeds 
                  measured in milliseconds, and access to over 100 currency pairs. Whether you're taking your first steps in forex or you're a seasoned 
                  professional, Rozka Capitals delivers the tools, education, and support you need. We're regulated, secure, and committed to helping you trade 
                  with confidence. This is who we are. This is what we do. Welcome to Rozka Capitals.
                  </p>
              </div>

              {/* Timeline - Simplified */}
              <div className="grid gap-8 sm:grid-cols-3 pt-8 border-t border-primary/20">
                <div className="text-left">
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold block mb-3">2018 → Foundation</span>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        Rozka Capitals was born in London with a clear vision: bridge the gap between retail traders and institutional quality execution. 
                        We launched as a boutique dealing desk, determined to give every trader access to the same tight spreads and fast execution 
                        that professionals enjoyed. That commitment to fairness and quality became the cornerstone of our company culture.
                      </p>
                    </div>
                <div className="text-left">
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold block mb-3">2020 → Acceleration</span>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        As Rozka Capitals reached 30,000 active traders, we expanded our services significantly. We introduced comprehensive trading analytics, 
                        advanced risk management tools, and multilingual customer support. Recognizing that education drives success, we developed 
                        extensive learning resources to help our community understand forex markets and make better trading decisions.
                      </p>
                    </div>
                <div className="text-left">
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold block mb-3">2024 → Momentum</span>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        Today, with over 70,000 active accounts, Rozka Capitals continues to evolve. We've enhanced our trading interfaces, integrated 
                        intelligent market insights, and developed tools that adapt to individual trading styles. Yet our core values remain unchanged: 
                        personal service, transparent pricing, and a genuine commitment to every trader's success.
                      </p>
                </div>
              </div>
            </motion.div>

            {/* Trust Badge - Simplified */}
            <motion.div
              className="flex items-center justify-center mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="text-sm text-primary font-medium uppercase tracking-wider">
                  Regulated • Secure • Trusted Since 2018
                </span>
            </motion.div>
          </div>

          {/* Philosophy - Horizontal Timeline Flow */}
          <div className="mt-20 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            
            {/* Animated flowing dots on the line */}
            <div className="hidden md:block absolute top-20 left-0 right-0 overflow-hidden">
              <div className="w-2 h-2 bg-primary rounded-full animate-flow-horizontal"></div>
            </div>

            <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-3 relative">
              {philosophyPrinciples.map((principle, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="relative group"
                >
                  {/* Connection point on line */}
                  <div className="hidden md:block absolute top-20 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary/30 rounded-full border-2 border-primary group-hover:scale-150 group-hover:bg-primary transition-all duration-300 z-10">
                    <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
                  </div>

                  {/* Vertical connecting line from dot to icon */}
                  <div className="hidden md:block absolute top-24 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-primary/50 to-transparent"></div>

                  {/* Content */}
                  <div className="text-center pt-28 sm:pt-36 md:pt-44">
                    {/* Large Icon with Number Badge */}
                    <motion.div
                      className="relative inline-flex items-center justify-center mb-8"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150"></div>
                      
                      {/* Icon container */}
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center border-2 border-primary/40 backdrop-blur-sm">
                        <principle.icon className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-primary" />
                      </div>

                      {/* Number badge */}
                      <div className="absolute -top-2 -right-2 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center border-2 border-background text-primary-foreground font-bold text-sm sm:text-base md:text-xl">
                        {index + 1}
                      </div>
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-gradient-gold group-hover:text-glow-gold transition-all duration-300">
                      {principle.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed">
                      {principle.description}
                    </p>

                    {/* Decorative bottom element */}
                    <motion.div
                      className="w-20 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                    ></motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Our Journey - Vertical Timeline */}
      <div className="py-16 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-5"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Section Header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="text-gradient-gold text-glow-gold inline-block pb-2">Journey</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From humble beginnings to a global leader in forex trading
            </p>
          </motion.div>

          {/* Vertical Timeline */}
          <div className="max-w-5xl mx-auto relative">
            {/* Vertical connecting line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary/30 to-transparent"></div>

            {/* Timeline Items */}
            <div className="space-y-16">
              {/* 2018 - Founded */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="md:grid md:grid-cols-2 md:gap-12 items-center">
                  <div className="md:text-right mb-8 md:mb-0">
                    <div className="inline-block glass-morphism-strong border-2 border-primary/30 rounded-2xl p-8 neon-gold hover:scale-105 transition-all duration-300">
                      <div className="flex items-center gap-4 md:justify-end mb-4">
                        <Rocket className="w-10 h-10 text-primary" />
                        <h3 className="text-3xl font-bold text-primary">2018</h3>
                    </div>
                      <h4 className="text-xl font-bold mb-2">{BRAND_TITLE} Founded</h4>
                      <p className="text-muted-foreground">
                        Established with a vision to democratize forex trading and provide accessible financial services globally.
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block"></div>
                </div>
                {/* Timeline dot */}
                <div className="absolute left-8 md:left-1/2 top-8 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10">
                  <div className="absolute inset-0 bg-primary rounded-full animate-ping"></div>
                </div>
              </motion.div>

              {/* 2019 - 10K Traders */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="md:grid md:grid-cols-2 md:gap-12 items-center">
                  <div className="hidden md:block"></div>
                  <div className="mb-8 md:mb-0">
                    <div className="inline-block glass-morphism-strong border-2 border-primary/30 rounded-2xl p-8 neon-gold hover:scale-105 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4">
                        <Users className="w-10 h-10 text-primary" />
                        <h3 className="text-3xl font-bold text-primary">2019</h3>
                      </div>
                      <h4 className="text-xl font-bold mb-2">10,000+ Active Traders</h4>
                      <p className="text-muted-foreground">
                        Rapid growth through exceptional service and word-of-mouth recommendations from satisfied clients.
                      </p>
          </div>
        </div>
      </div>
                {/* Timeline dot */}
                <div className="absolute left-8 md:left-1/2 top-8 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10">
                  <div className="absolute inset-0 bg-primary rounded-full animate-ping"></div>
                </div>
          </motion.div>

              {/* 2020 - Regulation */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="md:grid md:grid-cols-2 md:gap-12 items-center">
                  <div className="md:text-right mb-8 md:mb-0">
                    <div className="inline-block glass-morphism-strong border-2 border-primary/30 rounded-2xl p-8 neon-gold hover:scale-105 transition-all duration-300">
                      <div className="flex items-center gap-4 md:justify-end mb-4">
                        <CheckCircle2 className="w-10 h-10 text-primary" />
                        <h3 className="text-3xl font-bold text-primary">2020</h3>
                    </div>
                      <h4 className="text-xl font-bold mb-2">Regulatory Licenses Achieved</h4>
                      <p className="text-muted-foreground">
                        Obtained licenses from top-tier regulatory bodies, ensuring client protection and trust.
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block"></div>
                </div>
                {/* Timeline dot */}
                <div className="absolute left-8 md:left-1/2 top-8 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10">
                  <div className="absolute inset-0 bg-primary rounded-full animate-ping"></div>
                </div>
              </motion.div>

              {/* 2022 - Global Expansion */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="md:grid md:grid-cols-2 md:gap-12 items-center">
                  <div className="hidden md:block"></div>
                  <div className="mb-8 md:mb-0">
                    <div className="inline-block glass-morphism-strong border-2 border-primary/30 rounded-2xl p-8 neon-gold hover:scale-105 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4">
                        <Globe className="w-10 h-10 text-primary" />
                        <h3 className="text-3xl font-bold text-primary">2022</h3>
                      </div>
                      <h4 className="text-xl font-bold mb-2">Expanded to 60+ Countries</h4>
                      <p className="text-muted-foreground">
                        Global expansion with multilingual support and local payment methods across continents.
                      </p>
          </div>
        </div>
      </div>
                {/* Timeline dot */}
                <div className="absolute left-8 md:left-1/2 top-8 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10">
                  <div className="absolute inset-0 bg-primary rounded-full animate-ping"></div>
                </div>
          </motion.div>

              {/* 2024 - 70K+ Traders */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="md:grid md:grid-cols-2 md:gap-12 items-center">
                  <div className="md:text-right mb-8 md:mb-0">
                    <div className="inline-block glass-morphism-strong border-2 border-primary/30 rounded-2xl p-8 neon-gold hover:scale-105 transition-all duration-300">
                      <div className="flex items-center gap-4 md:justify-end mb-4">
                        <TrendingUp className="w-10 h-10 text-primary" />
                        <h3 className="text-3xl font-bold text-primary">2024</h3>
                      </div>
                      <h4 className="text-xl font-bold mb-2">70,000+ Happy Customers</h4>
                      <p className="text-muted-foreground">
                        Became one of the fastest-growing forex brokers globally with advanced platforms and exceptional service.
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block"></div>
                </div>
                {/* Timeline dot */}
                <div className="absolute left-8 md:left-1/2 top-8 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10">
                  <div className="absolute inset-0 bg-primary rounded-full animate-ping"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Philosophy - Nature Inspired Flow Design */}
      <div id="philosophy" className="py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative overflow-hidden bg-muted/20">
        <div className="absolute inset-0 web3-grid-bg opacity-10"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto relative z-10 max-w-7xl">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-3">
              Our <span className="text-gradient-gold text-glow-gold inline-block pb-2">Philosophy</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Our perspective on investing is inspired from nature
            </p>
          </motion.div>

          {/* Philosophy Items - Editorial Image Layout */}
          <div className="relative max-w-6xl mx-auto space-y-20">
              {naturephilosophy.map((item, index) => {
              const isReversed = index % 2 === 1;

                return (
              <motion.div
                key={index}
                  initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.15 }}
                  className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-10 lg:gap-16 items-center`}
                >
                  {/* Image */}
                  <div className="relative w-full lg:w-1/2">
                    <div className="relative overflow-hidden rounded-2xl h-[260px] sm:h-[320px] lg:h-[360px] shadow-[0_0_30px_rgba(212,175,55,0.25),0_0_60px_rgba(212,175,55,0.15)]">
                      <img
                        src={item.image.startsWith('http') 
                          ? item.image.includes('?') 
                            ? item.image.split('?')[0] + '?auto=format&fit=crop&w=600&h=400&q=75'
                            : `${item.image}?auto=format&fit=crop&w=600&h=400&q=75`
                          : item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/20 to-transparent"></div>
                    </div>
                    <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/40 flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-sm tracking-[0.3em] uppercase text-primary/80 font-semibold">
                        {`Philosophy ${index + 1}`}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`w-full lg:w-1/2 space-y-6 text-center ${isReversed ? "lg:text-right" : "lg:text-left"}`}>
                        <div>
                      <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                        <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/40 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(212,175,55,0.25)]">
                                {item.title}
                              </span>
                            </h3>
                      <div
                        className={`mt-4 h-[3px] w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto ${isReversed ? "lg:mr-0" : "lg:ml-0"}`}
                      ></div>
                          </div>

                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>

                    <div
                      className={`flex items-center gap-3 text-xs uppercase tracking-widest text-primary/70 justify-center ${
                        isReversed ? "lg:justify-end" : "lg:justify-start"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full inline-block"></span>
                        <span>Insight</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary/70 rounded-full inline-block"></span>
                        <span>Strategy</span>
                        </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary/40 rounded-full inline-block"></span>
                        <span>Discipline</span>
                      </div>
                    </div>
                        </div>
                  </motion.div>
                );
              })}
          </div>

          {/* Maestro Section - Redesigned - HIDDEN */}
          {/* <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-32 relative"
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 border-2 border-primary/20 rounded-full"></div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-24 border-2 border-primary/30 rounded-full"></div>
            
            <div className="relative glass-morphism-strong border-2 border-primary/30 rounded-3xl p-12 md:p-16 text-center neon-gold overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"></div>
              <div className="absolute inset-0 scanline-effect opacity-10"></div>
              
              <div className="relative z-10">
                <motion.div
                  className="inline-flex items-center justify-center mb-8"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: 999999, ease: "easeInOut" }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150"></div>
                    <Music className="relative w-20 h-20 text-primary" />
                  </div>
              </motion.div>

                <h3 className="text-3xl md:text-5xl font-bold mb-6">
                  BE THE MAESTRO OF YOUR{' '}
                  <span className="text-gradient-gold">INVESTMENT ORCHESTRA</span>
                </h3>

                <div className="inline-block px-8 py-3 bg-primary/10 border-2 border-primary/30 rounded-full mb-8 neon-gold">
                  <p className="text-xl md:text-2xl font-bold text-primary tracking-wider">
                    MANAGE YOUR RISK SUCCESSFULLY
                  </p>
                </div>

                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                  Considering the presence of order in the sequence and order in the chaos, we provide the{' '}
                  <span className="text-primary font-semibold">right place</span>, the{' '}
                  <span className="text-primary font-semibold">right time</span>, and the{' '}
                  <span className="text-primary font-semibold">right decision</span> for investors to make.{' '}
                  We are aware of risks, profit as well as opportunities to earn, and risks of making a loss.{' '}
                  We deliver the investing, which we, <span className="text-gradient-gold text-glow-gold font-semibold inline-block pb-2">{BRAND_TITLE} family</span>, 
                  approach as an art, to you, to all investors.
                </p>

                <motion.div
                  className="w-48 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-12"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                ></motion.div>
              </div>
          </div>
          </motion.div> */}
        </div>
      </div>

      {/* How To Be A Trader */}
      <div className="py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              HOW TO BE A <span className="text-gradient-gold text-glow-gold">TRADER?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We invite you to meet Rozka Capitals investment world. You can follow the steps below to be an online investor with us.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {howToTrade.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <Card className="p-8 glass-morphism-strong border-primary/20 card-hover-3d h-full text-center group relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 neon-gold group-hover:scale-110 transition-transform duration-300">
                    <span className="text-4xl font-bold text-primary text-glow-gold">{step.step}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
                    {step.description}
                  </p>
                  <div className="mt-auto pt-4">
                  <CheckCircle2 className="w-8 h-8 text-primary mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-lg text-muted-foreground mb-6">
              Let us give you information about investment education and products:
            </p>
                <Link href="/signup">
              <Button size="lg" className="neon-gold magnetic-hover text-lg px-10">
                START NOW <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
          </motion.div>
        </div>
      </div>

      {/* Advanced Trading Platforms Section - HIDDEN */}
      {false && (
        <div className="py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative overflow-hidden bg-muted/20">
          <AnimatedGrid variant="cyber" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto max-w-7xl relative z-10">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Multi-Platform Trading</span>
              </motion.div>
              
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                <span className="text-gradient-gold text-glow-gold">Advanced</span> Trading Platforms
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
                Trade on desktop, web, or mobile with our cutting-edge platforms. 
                <span className="text-primary"> Experience lightning-fast execution anywhere, anytime.</span>
              </p>
            </motion.div>

            <div className="w-full flex justify-center">
              <div className="w-full max-w-md lg:max-w-lg">
                <TradingPlatformsMockup />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-16 sm:mt-20">
              {[
                { name: "MetaTrader 5", description: "Advanced trading platform" },
                { name: "WebTrader", description: "Trade from any browser" },
                { name: "Mobile Apps", description: "iOS & Android" },
              ].map((platform, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                >
                  <Card className="p-6 text-center glass-morphism-strong border-primary/20 card-hover-3d h-full group relative overflow-hidden">
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {platform.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {platform.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

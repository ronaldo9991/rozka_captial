import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import AnimatedGrid from "@/components/AnimatedGrid";
import ParticleField from "@/components/ParticleField";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, DollarSign, Users, Calendar, Target, Award, Zap, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import CountingNumber from "@/components/CountingNumber";

export default function TradingContest() {
  const prizes = [
    { place: "1st", amount: "$50,000", icon: Trophy, color: "from-yellow-400 to-yellow-600" },
    { place: "2nd", amount: "$25,000", icon: Award, color: "from-gray-300 to-gray-500" },
    { place: "3rd", amount: "$15,000", icon: Award, color: "from-amber-600 to-amber-800" },
    { place: "4th-10th", amount: "$5,000 each", icon: Target, color: "from-primary to-primary/60" },
  ];

  const rules = [
    "Minimum $500 initial deposit to enter the contest",
    "Contest runs for 30 days from start date",
    "Winners determined by highest percentage return",
    "Maximum leverage 1:100 for contest accounts",
    "All trading strategies allowed (scalping, hedging, EAs)",
    "Minimum 20 trades required for eligibility",
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero */}
      <div className="relative min-h-screen flex items-center overflow-hidden pt-28 md:pt-40 pb-14 md:pb-20">
        <AnimatedGrid variant="hexagon" />
        <ParticleField count={90} className="opacity-40" />
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&q=75&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-electric-purple/10"></div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge - Golden Ratio: 16px base */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-block mb-[2.618rem]"
            >
              <div className="px-6 py-2 bg-primary/10 border border-primary/30 rounded-full backdrop-blur-sm neon-gold animate-pulse-glow">
                <span className="text-sm font-semibold text-primary">🏆 Live Now • $125,000 Prize Pool</span>
              </div>
            </motion.div>
            
            {/* Main Title - Golden Ratio: 16px * 1.618^3 = ~67px (closest: 4.25rem = 68px) */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold mb-6 sm:mb-8 md:mb-[4.236rem] leading-[1.2] tracking-tight px-4">
              Binofox <span className="block mt-4 sm:mt-6 md:mt-6 text-gradient-animated text-glow-gold inline-block pb-2">Trading Contest</span>
            </h1>
            
            {/* Description - Golden Ratio: 16px * 1.618^1 = ~26px (closest: 1.625rem = 26px) */}
            <motion.p
              className="text-base sm:text-lg md:text-xl lg:text-[1.625rem] text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-[2.618rem] px-4"
              style={{ lineHeight: '1.75rem' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Compete with traders worldwide for a <span className="text-primary font-bold">$125,000 prize pool</span>. Showcase your skills, climb the leaderboard, and win big.
            </motion.p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="neon-gold magnetic-hover shadow-[0_6px_20px_0_rgba(212,175,55,0.42)]">
                  Join Contest Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                View Live Leaderboard
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Prize Pool */}
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
              Prize <span className="text-gradient-gold">Distribution</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Total prize pool of $125,000 distributed among top performers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {prizes.map((prize, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className={`p-6 glass-morphism-strong border-primary/30 card-hover-3d h-full text-center ${index === 0 ? 'scale-105 border-2' : ''}`}>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${prize.color} flex items-center justify-center mx-auto mb-4 shadow-2xl`}>
                    <prize.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gradient-gold text-glow-gold mb-2">{prize.place}</div>
                  <div className="text-2xl font-bold text-primary mb-1">{prize.amount}</div>
                  <div className="text-sm text-muted-foreground">Prize</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Contest Rules */}
      <div className="py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Contest <span className="text-gradient-gold">Rules</span>
            </h2>
          </motion.div>

          <Card className="p-8 glass-morphism-strong border-primary/20">
            <ul className="space-y-4">
              {rules.map((rule, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <span className="text-muted-foreground leading-relaxed">{rule}</span>
                </motion.li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-morphism-strong border-primary/20 p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to <span className="text-gradient-gold inline-block pb-2">Compete</span>?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join hundreds of traders competing for $125,000 in prizes. Register now and start climbing the leaderboard.
              </p>
              <Link href="/signup">
                <Button size="lg" className="neon-gold magnetic-hover shadow-[0_6px_20px_0_rgba(212,175,55,0.42)]">
                  Enter Contest
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}


import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import AnimatedGrid from "@/components/AnimatedGrid";
import ParticleField from "@/components/ParticleField";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Gift, TrendingUp, DollarSign, Check, ArrowRight, 
  Clock, Users, Zap, Shield, AlertCircle, Sparkles
} from "lucide-react";
import { Link } from "wouter";

export default function DepositBonus() {
  const bonusTiers = [
    {
      minDeposit: "$250",
      bonus: "20%",
      maxBonus: "$500",
      features: [
        "20% bonus on first deposit",
        "Maximum bonus: $500",
        "Minimum deposit: $250",
        "Standard account eligible",
        "30-day validity period"
      ],
      popular: false
    },
    {
      minDeposit: "$500",
      bonus: "30%",
      maxBonus: "$1,500",
      features: [
        "30% bonus on first deposit",
        "Maximum bonus: $1,500",
        "Minimum deposit: $500",
        "All account types eligible",
        "60-day validity period",
        "Priority support included"
      ],
      popular: true
    },
    {
      minDeposit: "$2,000",
      bonus: "50%",
      maxBonus: "$10,000",
      features: [
        "50% bonus on first deposit",
        "Maximum bonus: $10,000",
        "Minimum deposit: $2,000",
        "VIP account benefits",
        "90-day validity period",
        "Dedicated account manager",
        "Exclusive trading signals"
      ],
      popular: false
    },
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: "Increase Your Trading Capital",
      description: "Boost your account balance by up to 50% with our deposit bonus. More capital means more trading opportunities and larger position sizes.",
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=800&q=75&auto=format&fit=crop"
    },
    {
      icon: TrendingUp,
      title: "Maximize Profit Potential",
      description: "With additional trading capital, you can diversify your portfolio, try new strategies, and potentially increase your returns.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=800&q=75&auto=format&fit=crop"
    },
    {
      icon: Shield,
      title: "Risk-Free Exploration",
      description: "Use bonus funds to test advanced strategies without risking your own capital. Perfect for learning and improving your trading skills.",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=800&q=75&auto=format&fit=crop"
    },
  ];

  const termsConditions = [
    "Bonus is credited automatically upon qualifying deposit",
    "Minimum trading volume required: 10 lots per $100 bonus",
    "Bonus funds cannot be withdrawn, only profits from bonus trading",
    "Standard leverage applies to bonus funds (up to 1:100)",
    "Bonus expires if no trading activity for 30 consecutive days",
    "Withdrawing funds before meeting requirements forfeits remaining bonus",
    "One bonus per client, multiple accounts excluded",
    "Management reserves right to cancel bonus for rule violations",
  ];

  const howToClaim = [
    {
      step: "1",
      title: "Open Account",
      description: "Register for a new trading account with Binofox or log into existing account.",
      icon: Users
    },
    {
      step: "2",
      title: "Make Deposit",
      description: "Deposit minimum qualifying amount using any supported payment method.",
      icon: DollarSign
    },
    {
      step: "3",
      title: "Bonus Credited",
      description: "Bonus is automatically added to your account within 24 hours of deposit confirmation.",
      icon: Zap
    },
    {
      step: "4",
      title: "Start Trading",
      description: "Begin trading with your boosted capital and work towards withdrawal eligibility.",
      icon: TrendingUp
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero */}
      <div className="relative min-h-screen flex items-center overflow-hidden pt-28 md:pt-40 pb-14 md:pb-20">
        <AnimatedGrid variant="cyber" />
        <ParticleField count={90} className="opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-background to-background"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=75&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge - Golden Ratio: 16px base */}
            <div className="inline-block mb-[2.618rem]">
              <div className="px-6 py-2.5 bg-primary/10 border border-primary/30 rounded-full backdrop-blur-sm neon-gold animate-pulse-glow flex items-center gap-2 justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Limited Time Offer • Up to 50% Bonus</span>
              </div>
            </div>
            {/* Main Title - Golden Ratio: 16px * 1.618^3 = ~67px (closest: 4.25rem = 68px) */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold mb-6 sm:mb-8 md:mb-[4.236rem] leading-[1.2] tracking-tight px-4">
              <span className="text-gradient-animated text-glow-gold inline-block pb-2">Deposit Bonus</span>
            </h1>
            {/* Description - Golden Ratio: 16px * 1.618^1 = ~26px (closest: 1.625rem = 26px) */}
            <p className="text-base sm:text-lg md:text-xl lg:text-[1.625rem] text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-[2.618rem] px-4" style={{ lineHeight: '1.75rem' }}>
              Supercharge your trading account with up to <span className="text-primary font-bold">50% bonus</span> on your first deposit. More capital, more opportunities, more potential profits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="neon-gold magnetic-hover shadow-[0_6px_20px_0_rgba(212,175,55,0.42)]">
                  Claim Bonus Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Contact Support
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bonus Tiers */}
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
              Choose Your <span className="text-gradient-gold">Bonus Tier</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The more you deposit, the bigger your bonus. Select the plan that fits your trading goals.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {bonusTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="px-4 py-1.5 bg-primary rounded-full text-primary-foreground text-xs font-semibold animate-pulse-glow">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                <Card className={`p-8 h-full glass-morphism-strong border-primary/20 card-hover-3d ${tier.popular ? 'scale-105 border-2 border-primary/40' : ''}`}>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Gift className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-5xl font-bold text-gradient-gold text-glow-gold mb-2">{tier.bonus}</div>
                    <div className="text-sm text-muted-foreground mb-1">Bonus on Deposit</div>
                    <div className="text-xl font-semibold text-primary">{tier.minDeposit}+</div>
                    <div className="text-sm text-muted-foreground">Minimum Deposit</div>
                    <div className="mt-2 text-xs text-primary bg-primary/5 px-3 py-1 rounded-full inline-block">
                      Max Bonus: {tier.maxBonus}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-center">
                    <Link href="/signup">
                      <Button variant={tier.popular ? "default" : "outline"}>
                        Claim {tier.bonus} Bonus
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
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
              Why Claim a <span className="text-gradient-gold inline-block pb-2">Deposit Bonus</span>?
            </h2>
          </motion.div>

          <div className="space-y-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`grid lg:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <Card className="p-8 glass-morphism-strong border-primary/20 h-full">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <benefit.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gradient-gold">{benefit.title}</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </Card>
                </div>
                <div className={`relative h-[350px] rounded-2xl overflow-hidden ${index % 2 === 1 ? 'lg:order-1' : ''} shadow-[0_18px_45px_rgba(0,0,0,0.35)] shadow-primary/20`}>
                  <img 
                    src={benefit.image}
                    alt={benefit.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How to Claim */}
      <div className="py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              How to <span className="text-gradient-gold">Claim</span> Your Bonus
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to activate your deposit bonus
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howToClaim.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 glass-morphism-strong border-primary/20 card-hover-3d h-full text-center">
                  <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                    {step.step}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="py-20 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Terms & <span className="text-gradient-gold">Conditions</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Please read carefully before claiming your bonus
            </p>
          </motion.div>

          <Card className="p-8 glass-morphism-strong border-primary/20">
            <div className="flex items-start gap-4 mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Important Notice</h4>
                <p className="text-sm text-muted-foreground">
                  All bonuses are subject to trading volume requirements. Please ensure you understand the conditions before claiming.
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {termsConditions.map((term, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                  <span className="text-muted-foreground leading-relaxed">{term}</span>
                </li>
              ))}
            </ul>
          </Card>
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
                  Ready to <span className="text-gradient-gold inline-block pb-2">Boost</span> Your Capital?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Don't miss this opportunity to maximize your trading potential. Claim your deposit bonus today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button size="lg" className="neon-gold magnetic-hover shadow-[0_6px_20px_0_rgba(212,175,55,0.42)]">
                      Claim Bonus Now
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="lg">
                      Have Questions?
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground/60 mt-6">
                  *Terms and conditions apply. Bonus subject to trading volume requirements.
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


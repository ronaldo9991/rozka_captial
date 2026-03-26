import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import AnimatedGrid from "@/components/AnimatedGrid";
import ParticleField from "@/components/ParticleField";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Gift, Zap, TrendingUp, Users, Check, ArrowRight,
  Shield, Clock, DollarSign, AlertCircle
} from "lucide-react";
import { Link } from "wouter";

export default function NoDepositBonus() {
  const bonusFeatures = [
    {
      icon: Gift,
      title: "$50 Free Trading Credit",
      description: "Start trading immediately with $50 in your account. No deposit required, no credit card needed."
    },
    {
      icon: Zap,
      title: "Instant Activation",
      description: "Bonus credited automatically upon account verification. Start trading within minutes of registration."
    },
    {
      icon: TrendingUp,
      title: "Real Market Conditions",
      description: "Trade on live markets with real spreads and execution. Experience actual trading environment risk-free."
    },
    {
      icon: Users,
      title: "Keep Your Profits",
      description: "Profits generated from no deposit bonus are yours to withdraw after meeting volume requirements."
    },
    {
      icon: Shield,
      title: "Risk-Free Trading",
      description: "Test strategies, learn the platform, and gain confidence without risking your own capital."
    },
    {
      icon: Clock,
      title: "30-Day Validity",
      description: "Use your bonus within 30 days. Trade, learn, and profit with no pressure or commitment."
    },
  ];

  const eligibility = [
    "New clients only (one bonus per person)",
    "Minimum age: 18 years old",
    "Account verification required (ID + proof of address)",
    "Excluded countries: US, Canada, Iran, North Korea",
    "Cannot be combined with other promotional offers",
    "Previous clients or duplicate accounts ineligible",
  ];

  const howToQualify = [
    {
      step: "1",
      title: "Register Account",
      description: "Sign up for a new Rozka Capitals trading account. Complete the registration form with accurate information."
    },
    {
      step: "2",
      title: "Verify Identity",
      description: "Upload proof of identity (passport or ID card) and proof of address (utility bill or bank statement)."
    },
    {
      step: "3",
      title: "Bonus Credited",
      description: "$50 is automatically credited to your account within 24 hours of verification approval."
    },
    {
      step: "4",
      title: "Start Trading",
      description: "Begin trading immediately on 100+ instruments with your risk-free $50 bonus capital."
    },
  ];

  const withdrawalRequirements = [
    "Minimum trading volume: 5 standard lots ($500,000)",
    "Profits can be withdrawn after volume requirements met",
    "Maximum withdrawal from bonus: $100",
    "Verification documents must be approved",
    "Withdrawal processing time: 1-3 business days",
    "Bonus expires if no activity for 30 consecutive days",
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero */}
      <div className="relative min-h-screen flex items-center overflow-hidden pt-28 md:pt-40 pb-14 md:pb-20">
        <AnimatedGrid variant="cyber" />
        <ParticleField count={100} className="opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-background to-background"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=75&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto text-center"
          >
            {/* Badge - Golden Ratio: 16px base */}
            <div className="inline-block mb-[2.618rem]">
              <div className="px-6 py-2.5 bg-primary/10 border border-primary/30 rounded-full backdrop-blur-sm glow-gold animate-pulse-glow">
                <span className="text-sm font-semibold text-primary">🎁 FREE $50 • No Deposit Required</span>
              </div>
            </div>
            {/* Main Title - Golden Ratio: 16px * 1.618^3 = ~67px (closest: 4.25rem = 68px) */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold mb-6 sm:mb-8 md:mb-[4.236rem] leading-[1.2] tracking-tight px-4">
              <span className="text-gradient-animated text-glow-gold">$50 No Deposit Bonus</span>
            </h1>
            {/* Description - Golden Ratio: 16px * 1.618^1 = ~26px (closest: 1.625rem = 26px) */}
            <p className="text-base sm:text-lg md:text-xl lg:text-[1.625rem] text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-[2.618rem] px-4" style={{ lineHeight: '1.75rem' }}>
              Start trading with <span className="text-primary font-bold">$50 free</span> • No deposit needed • No credit card required • Keep your profits
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-primary text-black hover:bg-primary/90 magnetic-hover shadow-[0_6px_20px_0_rgba(212,175,55,0.42)] font-bold">
                  Claim $50 Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground/60 mt-6">
              *New clients only • Terms and conditions apply • Subject to verification
            </p>
          </motion.div>
        </div>
      </div>

      {/* Features */}
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
              Why Choose Our <span className="text-gradient-gold inline-block pb-2">No Deposit Bonus</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trade risk-free with real money and real market conditions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bonusFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 glass-morphism-strong border-primary/20 card-hover-3d h-full">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 animate-pulse-glow">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gradient-gold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How to Qualify */}
      <div className="py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              How to <span className="text-gradient-gold">Claim</span> Your $50
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to get your free trading capital
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howToQualify.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 glass-morphism-strong border-primary/20 card-hover-3d h-full">
                  <div className="w-14 h-14 rounded-full bg-primary/20 text-primary text-2xl font-bold flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-center">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed text-center">
                    {step.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Eligibility & Requirements */}
      <div className="py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Eligibility */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 glass-morphism-strong border-primary/20 h-full">
                <h3 className="text-2xl font-bold mb-6 text-gradient-gold inline-block pb-2">Eligibility Criteria</h3>
                <ul className="space-y-3">
                  {eligibility.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            {/* Withdrawal Requirements */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 glass-morphism-strong border-primary/20 h-full">
                <h3 className="text-2xl font-bold mb-6 text-gradient-gold">Withdrawal Requirements</h3>
                <ul className="space-y-3">
                  {withdrawalRequirements.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                      <span className="text-muted-foreground leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="py-12 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6 glass-morphism-strong border-primary/20">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold mb-3">Important Notice</h4>
                  <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                    <p>
                      • The No Deposit Bonus cannot be withdrawn itself, only profits generated from trading with the bonus.
                    </p>
                    <p>
                      • Trading with bonus funds carries the same risks as trading with your own capital. Losses will be deducted from bonus funds first.
                    </p>
                    <p>
                      • Maximum leverage on no deposit bonus accounts is 1:100. Standard account terms apply.
                    </p>
                    <p>
                      • Rozka Capitals reserves the right to cancel bonus for terms violations, abusive trading, or duplicate accounts.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
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
                  Ready to Start Trading <span className="text-gradient-gold inline-block pb-2">Risk-Free</span>?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Claim your $50 no deposit bonus today. No credit card required, no hidden fees, no risk to your own capital.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button size="lg" className="bg-primary text-black hover:bg-primary/90 magnetic-hover shadow-[0_6px_20px_0_rgba(212,175,55,0.42)] font-bold">
                      Claim Free $50 Now
                    </Button>
                  </Link>
                  <Link href="/what-is-forex">
                    <Button variant="outline" size="lg">
                      Learn Forex First
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground/60 mt-6">
                  Join thousands of traders who started with our no deposit bonus
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


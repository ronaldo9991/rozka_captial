import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Building2, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function ProductsShowcase() {
  const products = [
    {
      icon: TrendingUp,
      title: "100+ FX Forex",
      subtitle: "Currency Pairs",
      description: "Trade major, minor, and exotic currency pairs with ultra-tight spreads from 0.1 pips. Access the world's most liquid market 24/7.",
      features: ["Major Pairs", "Minor Pairs", "Exotic Pairs", "24/7 Trading"],
      color: "primary",
      accentColor: "neon-gold",
    },
    {
      icon: Building2,
      title: "452 Stocks",
      subtitle: "Global Equities",
      description: "Invest in leading companies from NYSE, NASDAQ, LSE, and more. Zero commission on share CFDs with competitive leverage.",
      features: ["US Stocks", "EU Stocks", "UK Stocks", "Asian Markets"],
      color: "primary",
      accentColor: "neon-gold",
    },
    {
      icon: BarChart3,
      title: "Futures",
      subtitle: "Commodities & Indices",
      description: "Diversify your portfolio with futures on gold, oil, indices, and more. Professional-grade execution and deep liquidity.",
      features: ["Gold & Silver", "Oil & Energy", "Indices", "Commodities"],
      color: "primary",
      accentColor: "neon-gold",
    },
  ];

  return (
    <div className="py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 web3-grid-bg opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-black/20 to-background"></div>
      
      <div className="container mx-auto max-w-[1280px] relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Trade <span className="text-primary">Global Markets</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Access 500+ instruments across Forex, Stocks, and Futures from a single platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {products.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
            >
              <Card className="p-8 glass-morphism-strong card-hover-3d h-full group border-2 border-primary/20 hover:border-primary/60 transition-all duration-500">
                {/* Icon Header */}
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 neon-gold group-hover:animate-pulse-glow transition-all duration-300">
                  <product.icon className="w-10 h-10 text-primary" />
                </div>

                {/* Title */}
                <div className="mb-6">
                  <h3 className="text-3xl font-bold mb-1 text-primary">
                    {product.title}
                  </h3>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">
                    {product.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {product.features.map((feature, i) => (
                    <div
                      key={i}
                      className="text-xs p-2 rounded-lg bg-background/30 backdrop-blur-sm border border-primary/20 text-center"
                    >
                      {feature}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex justify-center">
                  <Link href="/signup">
                    <Button className="magnetic-hover neon-border-animate" variant="outline">
                      Start Trading
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          className="glass-morphism rounded-2xl p-8 border border-primary/20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100+</div>
              <div className="text-sm text-muted-foreground">Forex Pairs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">452</div>
              <div className="text-sm text-muted-foreground">Stocks</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10+</div>
              <div className="text-sm text-muted-foreground">Futures</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p className="text-muted-foreground mb-6">
            Ready to explore our full range of trading instruments?
          </p>
          <Link href="/signup">
            <Button size="lg" className="magnetic-hover neon-gold">
              View All Products
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}


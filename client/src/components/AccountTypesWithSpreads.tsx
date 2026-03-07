import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, TrendingDown } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function AccountTypesWithSpreads() {
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);

  const accountTypes = [
    {
      name: "Startup",
      minDeposit: "$250",
      spread: "From 1.4 pips",
      leverage: "Up to 1:200",
      features: ["Personal onboarding", "Daily market brief", "Essentials education hub"],
    },
    {
      name: "Standard",
      minDeposit: "$1,000",
      spread: "From 0.90 pips",
      leverage: "Up to 1:300",
      features: ["Dedicated support team", "Signals & webinars", "Multi-currency wallets"],
      popular: true,
    },
    {
      name: "Pro",
      minDeposit: "$5,000",
      spread: "From 0.30 pips",
      leverage: "Up to 1:500",
      features: ["ECN execution", "Latency < 30ms", "Advanced analytics suite"],
    },
    {
      name: "VIP",
      minDeposit: "$25,000",
      spread: "From 0.10 pips",
      leverage: "Up to 1:500",
      features: ["Personal relationship manager", "Institutional liquidity", "Exclusive networking events"],
    },
    {
      name: "Demo",
      minDeposit: "Free",
      spread: "Live market pricing",
      leverage: "Up to 1:200",
      features: ["$100,000 virtual balance", "Real-time market data", "Unlimited resets"],
      showInSpreads: false,
    },
    {
      name: "CopyTrading",
      minDeposit: "$500",
      spread: "From 0.80 pips",
      leverage: "Up to 1:200",
      features: ["Follow pro traders instantly", "Performance fee transparency", "Auto risk management"],
    },
  ];

  const spreadAccounts = accountTypes
    .map((account, index) => ({ ...account, index }))
    .filter((account) => account.showInSpreads !== false);

  const spreadData = [
    {
      category: "FX MAJOR",
      rows: [
        {
          pair: "EURUSD",
          values: {
            Startup: 1.4,
            VIP: 0.12,
            Pro: 0.28,
            Standard: 0.9,
            CopyTrading: 0.8,
          },
        },
        {
          pair: "GBPUSD",
          values: {
            Startup: 1.6,
            VIP: 0.18,
            Pro: 0.34,
            Standard: 1.0,
            CopyTrading: 0.9,
          },
        },
        {
          pair: "USDJPY",
          values: {
            Startup: 1.5,
            VIP: 0.20,
            Pro: 0.32,
            Standard: 0.95,
            CopyTrading: 0.82,
          },
        },
        {
          pair: "AUDUSD",
          values: {
            Startup: 1.8,
            VIP: 0.25,
            Pro: 0.45,
            Standard: 1.2,
            CopyTrading: 1.0,
          },
        },
        {
          pair: "USDCAD",
          values: {
            Startup: 1.7,
            VIP: 0.22,
            Pro: 0.4,
            Standard: 1.1,
            CopyTrading: 0.95,
          },
        },
      ],
    },
    {
      category: "FX CROSS",
      rows: [
        {
          pair: "EURGBP",
          values: {
            Startup: 2.1,
            VIP: 0.35,
            Pro: 0.6,
            Standard: 1.3,
            CopyTrading: 1.1,
          },
        },
        {
          pair: "EURJPY",
          values: {
            Startup: 2.0,
            VIP: 0.32,
            Pro: 0.55,
            Standard: 1.25,
            CopyTrading: 1.05,
          },
        },
        {
          pair: "GBPJPY",
          values: {
            Startup: 2.5,
            VIP: 0.40,
            Pro: 0.7,
            Standard: 1.6,
            CopyTrading: 1.3,
          },
        },
        {
          pair: "AUDJPY",
          values: {
            Startup: 2.0,
            VIP: 0.34,
            Pro: 0.6,
            Standard: 1.4,
            CopyTrading: 1.2,
          },
        },
      ],
    },
    {
      category: "COMMODITIES",
      rows: [
        {
          pair: "XAUUSD (Gold)",
          values: {
            Startup: 42,
            VIP: 25,
            Pro: 30,
            Standard: 35,
            CopyTrading: 32,
          },
        },
        {
          pair: "XAGUSD (Silver)",
          values: {
            Startup: 50,
            VIP: 28,
            Pro: 33,
            Standard: 38,
            CopyTrading: 35,
          },
        },
      ],
    },
  ];

  return (
    <div className="py-16 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 bg-accent/30 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 hexagon-pattern opacity-10"></div>
      
        <div className="container mx-auto max-w-[1280px] relative z-10">
        {/* Section Header - Outside any card */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" id="account-types">
            Choose Your <span className="text-gradient-gold text-glow-gold">Account Type</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Compare account features and spreads to find the perfect fit for your trading style
          </p>
        </motion.div>

        {/* Account Cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-16 md:mb-24 lg:mb-32">
          {accountTypes.map((account, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.34, 1.56, 0.64, 1]
              }}
              className="relative"
              onMouseEnter={() => setSelectedAccount(index)}
              onMouseLeave={() => setSelectedAccount(null)}
            >
              {account.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold neon-gold animate-pulse-glow">
                    Most Popular
                  </div>
                </div>
              )}
              <Card className={`p-8 glass-morphism card-hover-3d h-full group transition-all duration-500 flex flex-col ${
                account.popular ? "border-2 border-primary" : "border-card-border"
              } ${selectedAccount === index ? "ring-2 ring-primary/50" : ""}`}>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-all duration-300">{account.name}</h3>
                  <div className="text-3xl font-bold text-primary mb-6">{account.minDeposit}</div>
                  <div className="space-y-3 mb-6">
                    <div className="text-sm p-2 rounded-lg bg-background/20 backdrop-blur-sm border border-primary/10">
                      <span className="text-muted-foreground">Spread: </span>
                      <span className="font-semibold text-primary">{account.spread}</span>
                    </div>
                    <div className="text-sm p-2 rounded-lg bg-background/20 backdrop-blur-sm border border-primary/10">
                      <span className="text-muted-foreground">Leverage: </span>
                      <span className="font-semibold text-primary">{account.leverage}</span>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    {account.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center mt-auto pt-4">
                  <Link href="/signup">
                    <Button className={`magnetic-hover w-full ${account.popular ? "neon-gold" : "neon-border-animate"}`} variant={account.popular ? "default" : "outline"}>
                      Open Account
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Spread Comparison Table - Better Layout */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Table Title - Outside the table card - Same size as main title */}
          <div className="text-center mb-8">
            <h3 className="text-4xl md:text-5xl font-bold mb-4" id="compare-spreads">
              Compare <span className="text-gradient-gold text-glow-gold">Spreads</span>
            </h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Hover over account cards above to highlight spreads • Lower spreads = Lower trading costs
            </p>
          </div>

          {/* Table Card */}
          <div className="glass-morphism-strong rounded-2xl overflow-hidden border border-primary/20">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-primary/20 bg-accent/50">
                    <th className="p-4 text-left text-sm font-semibold text-foreground">Instrument</th>
                    {spreadAccounts.map((account, columnIndex) => (
                      <th
                        key={account.name}
                        className={`p-4 text-center text-sm font-semibold transition-all duration-300 ${
                          selectedAccount === account.index ? "text-primary bg-primary/10" : "text-foreground"
                        }`}
                      >
                        {account.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {spreadData.map((category, catIndex) => (
                    <>
                      <tr key={`cat-${catIndex}`} className="border-b border-primary/10 bg-accent/30">
                        <td
                          colSpan={spreadAccounts.length + 1}
                          className="p-3 text-xs font-bold text-primary uppercase tracking-wider"
                        >
                          {category.category}
                        </td>
                      </tr>
                      {category.rows.map((row, rowIndex) => (
                        <motion.tr
                          key={`${catIndex}-${rowIndex}`}
                          className="border-b border-border/40 hover:bg-primary/5 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: (catIndex * category.rows.length + rowIndex) * 0.05 }}
                        >
                          <td className="p-4 text-sm font-medium text-foreground">{row.pair}</td>
                          {spreadAccounts.map((account) => {
                            const value = row.values[account.name as keyof typeof row.values];
                            const isActive = selectedAccount === account.index;
                            return (
                              <td
                                key={`${row.pair}-${account.name}`}
                                className={`p-4 text-center text-sm font-mono transition-all duration-300 ${
                                  isActive ? "text-primary font-bold bg-primary/5" : "text-muted-foreground"
                                }`}
                              >
                                {value !== undefined ? value : "—"}
                              </td>
                            );
                          })}
                        </motion.tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Note */}
            <div className="p-4 bg-accent/30 border-t border-primary/20">
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                <span>💡 <strong className="text-primary">Spreads shown in pips</strong></span>
                <span>•</span>
                <span>Lower spreads = Better value</span>
                <span>•</span>
                <span>VIP accounts offer tightest spreads</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p className="text-muted-foreground mb-6">
            Ready to start trading with competitive spreads?
          </p>
          <Link href="/signup">
            <Button size="lg" className="magnetic-hover neon-gold">
              Open Your Account Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}


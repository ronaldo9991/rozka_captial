import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface AccountType {
  name: string;
  leverage: string;
  minDeposit: string;
  spreads: string;
  features: string[];
  recommended?: boolean;
}

const accountTypes: AccountType[] = [
  {
    name: "Mini",
    leverage: "1:100",
    minDeposit: "$100",
    spreads: "From 2.0 pips",
    features: [
      "Perfect for beginners",
      "Risk management tools",
      "Educational materials",
      "24/7 Customer support"
    ]
  },
  {
    name: "Standard",
    leverage: "1:200",
    minDeposit: "$500",
    spreads: "From 1.5 pips",
    features: [
      "Competitive spreads",
      "Advanced charts",
      "Expert advisors",
      "Priority support"
    ],
    recommended: true
  },
  {
    name: "Pro",
    leverage: "1:400",
    minDeposit: "$2,500",
    spreads: "From 0.8 pips",
    features: [
      "Ultra-low spreads",
      "VPS hosting",
      "Dedicated account manager",
      "Advanced analytics"
    ]
  },
  {
    name: "VIP",
    leverage: "1:500",
    minDeposit: "$10,000",
    spreads: "From 0.0 pips",
    features: [
      "Zero spread accounts",
      "Institutional pricing",
      "Personal trader support",
      "Custom solutions"
    ]
  }
];

export default function AccountTypesCard() {
  return (
    <Card className="relative overflow-hidden border-primary/30 bg-black/80 backdrop-blur-xl">
      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
      
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary uppercase tracking-wider mb-2">
            Account Types
          </h2>
          <p className="text-muted-foreground text-sm">
            Choose the account that best suits your trading needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accountTypes.map((account, index) => (
            <motion.div
              key={account.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {account.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="px-3 py-1 bg-primary text-black text-xs font-bold rounded-full uppercase">
                    Recommended
                  </span>
                </div>
              )}
              
              <Card className={`group relative h-full p-5 transition-all duration-300 hover:scale-105 ${
                account.recommended 
                  ? "border-primary/50 bg-gradient-to-br from-primary/10 to-black/80" 
                  : "border-primary/20 bg-black/60 hover:border-primary/40"
              }`}>
                {/* Glow effect */}
                {account.recommended && (
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/40 rounded-lg blur opacity-50" />
                )}
                
                <div className="relative z-10">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-primary mb-1">{account.name}</h3>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">
                      Leverage: {account.leverage}
                    </div>
                  </div>

                  <div className="text-center mb-4 pb-4 border-b border-primary/20">
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {account.minDeposit}
                    </div>
                    <div className="text-xs text-muted-foreground">Minimum Deposit</div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-semibold text-primary mb-1">Spreads</div>
                    <div className="text-sm text-muted-foreground">{account.spreads}</div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {account.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full ${
                      account.recommended 
                        ? "neon-gold" 
                        : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                    }`}
                  >
                    Open {account.name} Account
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}


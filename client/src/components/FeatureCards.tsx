import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Zap, Target, Headphones } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Ultra-Low Spreads",
    description: "Trade with spreads as low as 0.1 pips on major currency pairs.",
  },
  {
    icon: Zap,
    title: "Instant Execution",
    description: "Lightning-fast order execution with no requotes or delays.",
  },
  {
    icon: Headphones,
    title: "24×5 Support",
    description: "Expert multilingual support available whenever you need it.",
  },
];

export default function FeatureCards() {
  return (
    <div className="py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="container mx-auto max-w-[1280px]">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Card
                className="p-6 border-card-border hover-elevate active-elevate-2 transition-all h-full"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

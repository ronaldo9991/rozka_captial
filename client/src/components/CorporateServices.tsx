import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Headphones, Network, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function CorporateServices() {
  const services = [
    {
      icon: Users,
      title: "R.O.Z.K.A CAPTIAL IB",
      subtitle: "Introducing Broker Program",
      description: "Rozka Capitals IB's revenue sharing model will help your business grow beyond benchmark. Earn competitive commissions and enjoy dedicated support.",
      features: [
        "Competitive Revenue Share",
        "Multi-Level IB Structure",
        "Dedicated Account Manager",
        "Marketing Materials",
        "Real-Time Reporting",
        "Fast Payouts",
      ],
      gradient: "from-primary to-primary",
      glowColor: "neon-gold",
    },
    {
      icon: Headphones,
      title: "R.O.Z.K.A CAPTIAL Support",
      subtitle: "Tailored Business Solutions",
      description: "Our Rozka Capitals team will analyse your customer and business structure to setup the most rewarding and efficient solution for your needs.",
      features: [
        "Custom Integration",
        "White Label Solutions",
        "API Access",
        "Technical Support 24/7",
        "Business Analytics",
        "Compliance Assistance",
      ],
      gradient: "from-primary to-primary",
      glowColor: "neon-gold",
    },
    {
      icon: Network,
      title: "R.O.Z.K.A CAPTIAL Prime",
      subtitle: "Institutional Services",
      description: "Support your business with technology driven FX clearing and ECN based liquidity pools. Professional-grade infrastructure for institutions.",
      features: [
        "ECN Liquidity Pools",
        "Prime of Prime Services",
        "Low Latency Execution",
        "Risk Management Tools",
        "Institutional Pricing",
        "Dedicated Infrastructure",
      ],
      gradient: "from-primary to-primary",
      glowColor: "neon-gold",
    },
  ];

  return (
    <div className="py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative overflow-hidden bg-gradient-to-b from-background via-accent/20 to-background">
      {/* Background effects */}
      <div className="absolute inset-0 hexagon-pattern opacity-10"></div>
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto max-w-[1280px] relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-primary">Partner With</span> R.O.Z.K.A CAPTIAL
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We offer tailor-made partnership opportunities for mutual interest and long-term success
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
            >
              <Card className={`p-8 glass-morphism-strong card-hover-3d h-full group relative overflow-hidden border-2 border-primary/20 hover:border-primary/60 transition-all duration-500`}>
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ${service.glowColor} group-hover:animate-pulse-glow transition-all duration-300`}>
                    <service.icon className="w-10 h-10 text-primary" />
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl font-bold mb-2 group-hover:text-primary transition-all duration-300">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 uppercase tracking-wider">
                    {service.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {service.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex justify-center">
                    <Link href="/contact">
                      <Button className="magnetic-hover neon-border-animate group" variant="outline">
                        More Information
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          className="glass-morphism rounded-2xl p-8 border border-primary/20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-2xl font-bold mb-4 text-primary">
            Ready to Start a Partnership?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join our growing network of partners worldwide. Our team is ready to discuss how we can work together to achieve your business goals.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="magnetic-hover neon-gold">
                Contact Partnership Team
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="magnetic-hover neon-border-animate">
              Download Brochure
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


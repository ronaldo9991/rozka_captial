import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Droplet, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function PartnershipCards() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const partnerships = [
    {
      icon: Users,
      image: "/broad.png",
      label: "IB",
      sublabel: "Introducing Broker",
      title: "ROZKA CAPTIALS IB",
      description: "Rozka Capitals IB's revenue sharing model will help your business grow beyond benchmark.",
      accentColor: "bg-primary",
      link: "/contact",
    },
    {
      icon: TrendingUp,
      image: "/vision.jpg",
      label: "",
      sublabel: "",
      title: "ROZKA CAPTIALS Support",
      description: "Our Rozka Capitals team will analyse your customer and business structure to setup the most rewarding and efficient solution.",
      accentColor: "bg-primary",
      link: "/contact",
    },
    {
      icon: Droplet,
      image: "/winning.jpg",
      label: "POP",
      sublabel: "Prime of Prime",
      title: "ROZKA CAPTIALS Prime",
      description: "Support your business with technology driven FX clearing and ECN based liquidity pools.",
      accentColor: "bg-primary",
      link: "/contact",
    },
  ];

  return (
    <div className="py-14 md:py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 bg-muted/30">
      <div className="container mx-auto max-w-[1280px]">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-1 h-12 bg-primary"></div>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                BECOME A PARTNER WITH <span className="text-gradient-gold text-glow-gold">ROZKA CAPITALS</span>
              </h2>
            </div>
            <p className="text-muted-foreground ml-0 md:ml-8 max-w-2xl text-sm sm:text-base">
              We offer tailor made partnership opportunities for mutual interest.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/contact">
              <Button
                variant="ghost"
                className="w-full sm:w-auto text-primary hover:text-primary hover:bg-primary/10 font-semibold mt-4 md:mt-0"
              >
                ALL CORPORATE PRODUCTS
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Partnership Cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {partnerships.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.15,
                ease: [0.34, 1.56, 0.64, 1]
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Card className="group border border-border hover:border-primary/60 card-hover-3d overflow-hidden flex flex-col h-full">
                {/* Icon/Logo Square Section with Illustrations and Background Image */}
                <div 
                  className="relative bg-accent p-8 h-52 sm:h-56 flex flex-col items-center justify-center overflow-hidden"
                  style={{
                    backgroundImage: `url('${partner.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Dark overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/85"></div>
                  
                  {/* Small accent square in top-left */}
                  <div className={`absolute top-4 left-4 w-3 h-3 ${partner.accentColor} neon-gold z-10`}></div>
                  
                  {/* Icon in top-right */}
                  <div className="absolute top-4 right-4 group-hover:scale-110 transition-transform duration-300 z-10">
                    <partner.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Static decorative circles - no animation */}
                  <div
                    className="absolute top-1/2 left-1/2 w-32 h-32 border border-primary/20 rounded-full opacity-30"
                    style={{ transform: 'translate(-50%, -50%)' }}
                  />
                  <div
                    className="absolute top-1/2 left-1/2 w-24 h-24 border border-primary/30 rounded-full opacity-45"
                    style={{ transform: 'translate(-50%, -50%)' }}
                  />

                  {/* Animated decorative circles only on hover */}
                  {hoveredIndex === index && (
                    <>
                      <motion.div
                        className="absolute top-1/2 left-1/2 w-32 h-32 border border-primary/30 rounded-full"
                        style={{ transform: 'translate(-50%, -50%)' }}
                        initial={{ scale: 1, opacity: 0.2 }}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          delay: index * 0.5,
                        }}
                      />
                      <motion.div
                        className="absolute top-1/2 left-1/2 w-24 h-24 border border-primary/40 rounded-full"
                        style={{ transform: 'translate(-50%, -50%)' }}
                        initial={{ scale: 1, opacity: 0.3 }}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.3,
                        }}
                      />
                    </>
                  )}

                  {/* Center text (if exists) */}
                  {partner.label && (
                    <div className="text-center relative z-10">
                      <div className="text-6xl font-bold text-white mb-1 text-glow-gold">
                        {partner.label}
                      </div>
                      <div className="text-xs text-white/80 uppercase tracking-widest">
                        {partner.sublabel}
                      </div>
                    </div>
                  )}

                  {/* If no label, show large icon instead */}
                  {!partner.label && (
                    <div className="relative z-10">
                      <div className="w-24 h-24 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center neon-gold border-2 border-primary/40">
                        <partner.icon className="w-12 h-12 text-primary" />
                      </div>
                    </div>
                  )}

                  {/* Decorative grid overlay */}
                  <div className="absolute inset-0 opacity-10 web3-grid-bg z-0"></div>
                  
                  {/* Decorative corner elements */}
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-primary/20"></div>
                  <div className="absolute top-4 right-12 w-8 h-8 border-t-2 border-r-2 border-primary/20"></div>
                  
                  {/* Floating particles - Static by default, animate on hover */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-primary/60 rounded-full"
                      style={{
                        left: `${15 + i * 18}%`,
                        top: `${20 + i * 15}%`,
                      }}
                      initial={false}
                      animate={
                        hoveredIndex === index
                          ? {
                              y: [0, -15, 0],
                              opacity: [0.3, 1, 0.3],
                              scale: [1, 1.5, 1],
                            }
                          : {
                              y: 0,
                              opacity: 0.3,
                              scale: 1,
                            }
                      }
                      transition={{
                        duration: 2 + i * 0.5,
                        repeat: hoveredIndex === index ? Infinity : 0,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </div>

                {/* Content Section - flex-grow to push button to bottom */}
                <div className="p-6 bg-card flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                    {partner.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">
                    {partner.description}
                  </p>
                  <div className="flex justify-center">
                    <Link href={partner.link}>
                      <Button 
                        className="neon-gold magnetic-hover"
                        size="default"
                      >
                        MORE INFORMATION
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}


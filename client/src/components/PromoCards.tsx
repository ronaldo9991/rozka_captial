import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function PromoCards() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 100; // 100px offset for fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  const cards = [
    {
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80&auto=format&fit=crop",
      title: "ACCOUNT TYPES",
      description: "We offer Mini, Standard, Pro and VIP Trader account types to meet your individual investment needs.",
      cta: "DETAILS",
      scrollTo: "account-types",
    },
    {
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80&auto=format&fit=crop",
      title: "COMPETITIVE SPREADS",
      description: "Reduce your trading costs and take advantage of tight spreads Binofox offers.",
      cta: "DETAILS",
      scrollTo: "compare-spreads",
    },
    {
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format&fit=crop",
      title: "OPEN LIVE ACCOUNT",
      description: "All you need is to fill the form on the side and start trading with us.",
      cta: "SIGNUP NOW",
      link: "/signup",
    },
  ];

  return (
    <div className="py-12 md:py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="container mx-auto max-w-[1280px]">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Card className="group relative overflow-hidden border-primary/30 hover:border-primary/60 transition-all duration-500 card-hover-3d h-full min-h-[400px]">
                {/* Full Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${card.image}')`
                  }}
                >
                  {/* Dark overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/85"></div>
                  
                  {/* Web3 Grid Pattern Overlay */}
                  <div className="absolute inset-0 web3-grid-bg opacity-[0.15]"></div>
                  
                  {/* Hexagon Pattern Overlay */}
                  <div className="absolute inset-0 hexagon-pattern opacity-10"></div>
                  
                  {/* Animated gradient orbs */}
                  <motion.div
                    className="absolute top-10 right-10 w-32 h-32 rounded-full blur-2xl"
                    style={{
                      background: 'radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%)'
                    }}
                    animate={
                      hoveredIndex === index
                        ? {
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.6, 0.3],
                            x: [0, 20, 0],
                            y: [0, -15, 0],
                          }
                        : {
                            scale: 1,
                            opacity: 0.3,
                            x: 0,
                            y: 0,
                          }
                    }
                    transition={{
                      duration: 4,
                      repeat: hoveredIndex === index ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  />
                  
                  {/* Dollar Sign Overlay - Bottom Left */}
                  <div className="absolute bottom-4 left-4 text-8xl font-bold text-primary/20 select-none pointer-events-none">
                    $
                  </div>
                  
                  {/* Floating particles */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1.5 h-1.5 bg-primary/50 rounded-full"
                      style={{
                        left: `${15 + i * 18}%`,
                        top: `${20 + i * 15}%`,
                      }}
                      initial={false}
                      animate={
                        hoveredIndex === index
                          ? {
                              y: [0, -30, 0],
                              opacity: [0.4, 1, 0.4],
                              scale: [1, 1.5, 1],
                            }
                          : {
                              y: 0,
                              opacity: 0.4,
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
                  
                  {/* Glowing border effect on hover */}
                  <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/40 transition-all duration-500 rounded-lg"></div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8">
                  {/* Top Section - Title */}
                  <div>
                    <motion.h3 
                      className="text-2xl md:text-3xl font-bold mb-4 text-white group-hover:text-primary transition-colors duration-300 uppercase tracking-wide"
                      initial={false}
                      animate={
                        hoveredIndex === index
                          ? { scale: [1, 1.05, 1] }
                          : { scale: 1 }
                      }
                      transition={{ duration: 0.3 }}
                    >
                      {card.title}
                    </motion.h3>
                    
                    <p className="text-white/90 text-sm md:text-base leading-relaxed mb-6 max-w-md">
                      {card.description}
                    </p>
                  </div>

                  {/* Bottom Section - CTA Button */}
                  <div>
                    {card.scrollTo ? (
                      <Button 
                        variant="ghost" 
                        className="text-primary hover:text-primary hover:bg-primary/20 p-0 h-auto font-semibold text-base md:text-lg group/btn border border-primary/30 hover:border-primary/60 px-6 py-3 rounded-lg backdrop-blur-sm bg-black/30"
                        onClick={() => scrollToSection(card.scrollTo!)}
                      >
                        {card.cta}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    ) : (
                      <Link href={card.link!}>
                        <Button 
                          variant="ghost" 
                          className="text-primary hover:text-primary hover:bg-primary/20 p-0 h-auto font-semibold text-base md:text-lg group/btn border border-primary/30 hover:border-primary/60 px-6 py-3 rounded-lg backdrop-blur-sm bg-black/30"
                        >
                          {card.cta}
                          <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    )}
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


import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Download, TrendingUp, User } from "lucide-react";

export default function ButtonShowcase() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Button Style <span className="text-gradient-gold">Comparison</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Compare button styles with and without shadows to select the perfect visual treatment for the platform.
            </p>
          </motion.div>

          {/* Primary Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Primary Buttons (Gold Background)</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* With Shadow */}
              <Card className="p-8 glass-morphism border-primary/20">
                <h3 className="text-xl font-semibold mb-6 text-center text-primary">With Shadow</h3>
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <Button 
                      size="default"
                      className="shadow-[0_4px_14px_0_rgba(212,175,55,0.39)] hover:shadow-[0_6px_20px_0_rgba(212,175,55,0.50)] transition-all duration-300"
                    >
                      Open Account <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button 
                      size="sm"
                      className="shadow-[0_3px_10px_0_rgba(212,175,55,0.35)] hover:shadow-[0_5px_15px_0_rgba(212,175,55,0.45)] transition-all duration-300"
                    >
                      Start Trading
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button 
                      size="lg"
                      className="shadow-[0_6px_20px_0_rgba(212,175,55,0.42)] hover:shadow-[0_8px_28px_0_rgba(212,175,55,0.55)] transition-all duration-300"
                    >
                      Get Started Now <TrendingUp className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button 
                      size="icon"
                      className="shadow-[0_4px_14px_0_rgba(212,175,55,0.39)] hover:shadow-[0_6px_20px_0_rgba(212,175,55,0.50)] transition-all duration-300"
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                    <Button 
                      size="icon"
                      className="shadow-[0_4px_14px_0_rgba(212,175,55,0.39)] hover:shadow-[0_6px_20px_0_rgba(212,175,55,0.50)] transition-all duration-300"
                    >
                      <User className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center mt-6 leading-relaxed">
                  Creates depth and makes buttons feel elevated from the page. Enhanced hover states with increased shadow.
                </p>
              </Card>

              {/* Without Shadow */}
              <Card className="p-8 glass-morphism border-primary/20">
                <h3 className="text-xl font-semibold mb-6 text-center text-primary">Without Shadow (Flat)</h3>
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <Button 
                      size="default"
                    >
                      Open Account <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button 
                      size="sm"
                    >
                      Start Trading
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button 
                      size="lg"
                    >
                      Get Started Now <TrendingUp className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button 
                      size="icon"
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                    <Button 
                      size="icon"
                    >
                      <User className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center mt-6 leading-relaxed">
                  Clean, modern flat design. Minimal visual weight with focus on color and typography.
                </p>
              </Card>
            </div>
          </motion.div>

          {/* Secondary / Outline Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Secondary Buttons (Outline / Ghost)</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* With Shadow */}
              <Card className="p-8 glass-morphism border-primary/20">
                <h3 className="text-xl font-semibold mb-6 text-center text-primary">With Subtle Shadow</h3>
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <Button 
                      variant="outline"
                      size="default"
                      className="shadow-[0_2px_8px_0_rgba(212,175,55,0.15)] hover:shadow-[0_4px_12px_0_rgba(212,175,55,0.25)] transition-all duration-300"
                    >
                      Learn More
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button 
                      variant="secondary"
                      size="default"
                      className="shadow-[0_2px_8px_0_rgba(0,0,0,0.20)] hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.30)] transition-all duration-300"
                    >
                      View Details
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button 
                      variant="ghost"
                      size="default"
                      className="shadow-[0_2px_6px_0_rgba(212,175,55,0.10)] hover:shadow-[0_4px_10px_0_rgba(212,175,55,0.18)] transition-all duration-300"
                    >
                      Explore Features
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center mt-6 leading-relaxed">
                  Subtle shadows add dimension to secondary actions without overpowering primary CTAs.
                </p>
              </Card>

              {/* Without Shadow */}
              <Card className="p-8 glass-morphism border-primary/20">
                <h3 className="text-xl font-semibold mb-6 text-center text-primary">Without Shadow (Flat)</h3>
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <Button 
                      variant="outline"
                      size="default"
                    >
                      Learn More
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button 
                      variant="secondary"
                      size="default"
                    >
                      View Details
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button 
                      variant="ghost"
                      size="default"
                    >
                      Explore Features
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center mt-6 leading-relaxed">
                  Ultra-clean appearance with borders and hover states providing all necessary visual feedback.
                </p>
              </Card>
            </div>
          </motion.div>

          {/* Contextual Examples */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">In Context: Hero Section</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* With Shadows */}
              <Card className="p-8 glass-morphism-strong border-primary/20 bg-gradient-to-br from-black via-background to-black">
                <h3 className="text-xl font-semibold mb-6 text-center text-primary">With Shadows</h3>
                <div className="text-center space-y-6">
                  <h4 className="text-2xl font-bold">Start Trading Today</h4>
                  <p className="text-muted-foreground">Join 100K+ traders worldwide</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg"
                      className="shadow-[0_6px_20px_0_rgba(212,175,55,0.42)] hover:shadow-[0_8px_28px_0_rgba(212,175,55,0.55)] transition-all duration-300"
                    >
                      Open Live Account
                    </Button>
                    <Button 
                      variant="outline"
                      size="lg"
                      className="shadow-[0_2px_10px_0_rgba(212,175,55,0.18)] hover:shadow-[0_4px_14px_0_rgba(212,175,55,0.28)] transition-all duration-300"
                    >
                      Try Demo
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Without Shadows */}
              <Card className="p-8 glass-morphism-strong border-primary/20 bg-gradient-to-br from-black via-background to-black">
                <h3 className="text-xl font-semibold mb-6 text-center text-primary">Without Shadows</h3>
                <div className="text-center space-y-6">
                  <h4 className="text-2xl font-bold">Start Trading Today</h4>
                  <p className="text-muted-foreground">Join 100K+ traders worldwide</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg"
                    >
                      Open Live Account
                    </Button>
                    <Button 
                      variant="outline"
                      size="lg"
                    >
                      Try Demo
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-8 glass-morphism-strong border-primary/20">
              <h2 className="text-2xl font-bold mb-6 text-center">Design Recommendations</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">✓ With Shadows</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Creates visual hierarchy and depth perception</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Buttons feel more interactive and "clickable"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Works well with the existing Web3/glassmorphism aesthetic</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Enhances gold glow effects for premium feel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Better for marketing/landing pages</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">✓ Without Shadows (Flat)</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Modern, minimal aesthetic</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Cleaner appearance, less visual noise</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Faster rendering performance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Better for dense UI like dashboards and data tables</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Aligns with ultra-modern fintech platforms</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-center text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Professional Recommendation:</strong> Use subtle shadows on primary CTA buttons for marketing pages (Home, About, Contact) to create premium feel and drive conversions. Use flat design for dashboard/application pages to maintain clean, professional interface for data-heavy screens.
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


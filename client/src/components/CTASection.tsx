import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function CTASection() {
  return (
    <motion.div
      className="bg-gradient-to-r from-primary/20 via-primary to-primary/20 py-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto max-w-[1280px] text-center">
        <h2 className="text-4xl font-bold mb-4 text-primary-foreground">
          Start Trading with R.O.Z.K.A CAPTIAL Today
        </h2>
        <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
          Join thousands of traders who trust R.O.Z.K.A CAPTIAL for their forex trading needs.
        </p>
        <Link href="/signin">
          <Button size="lg" variant="secondary" className="gap-2" data-testid="button-get-started">
            Get Started Now
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

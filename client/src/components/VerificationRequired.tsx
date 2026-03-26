import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

interface VerificationRequiredProps {
  verifiedCount: number;
  requiredCount: number;
  hasPending: boolean;
}

export default function VerificationRequired({ 
  verifiedCount, 
  requiredCount, 
  hasPending 
}: VerificationRequiredProps) {
  const [, setLocation] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[400px] flex items-center justify-center p-6"
    >
      <Card className="relative max-w-2xl w-full p-8 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl overflow-hidden">
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <div className="relative z-10 text-center space-y-6">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-primary" />
            </div>
          </motion.div>

          {/* Title */}
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2 uppercase tracking-wider">
              Verification Required
            </h2>
            <p className="text-muted-foreground text-lg">
              Please complete identity verification to start trading
            </p>
          </div>

          {/* Status */}
          <Card className="p-6 bg-black/60 border-primary/20">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {verifiedCount > 0 ? "1" : "0"}/1
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  ID Verification
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded bg-primary/5">
                {verifiedCount >= 1 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                )}
                <div className="flex-1 text-left">
                  <div className="font-semibold">ID Proof (Required)</div>
                  <div className="text-xs text-muted-foreground">
                    Passport, Driver's License, or National ID
                  </div>
                </div>
                {verifiedCount >= 1 ? (
                  <span className="text-xs text-green-400 font-semibold">✓ Verified</span>
                ) : (
                  <span className="text-xs text-yellow-400 font-semibold">⚠ Required</span>
                )}
              </div>
            </div>
          </Card>

          {/* Status Message */}
          {hasPending && (
            <div className="flex items-center gap-2 justify-center text-yellow-400">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-semibold">
                Your documents are under review. You'll be notified once verified.
              </span>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={() => setLocation("/dashboard/documents")}
            className="neon-gold text-lg font-bold py-6 px-8"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload ID Proof
          </Button>

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-2">
            <div>
              <Shield className="inline w-4 h-4 mr-1" />
              Your ID is securely encrypted and reviewed by our compliance team within 24-48 hours.
            </div>
            <div className="text-primary/80 font-semibold">
              ℹ Additional documents (Address Proof, Bank Statement) are optional.
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}


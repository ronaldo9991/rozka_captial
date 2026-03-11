import { Card } from "./ui/card";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TopupCardDisplayProps {
  cardNumber: string;
  pin: string;
  amount: string;
  status: "Valid" | "Used" | "Expired";
  cardHolderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  className?: string;
  showFullDetails?: boolean;
}

export default function TopupCardDisplay({
  cardNumber,
  pin,
  amount,
  status,
  cardHolderName = "R.O.Z.K.A CAPTIAL Limited",
  expiryMonth = "12",
  expiryYear = "2025",
  className = "",
  showFullDetails = true,
}: TopupCardDisplayProps) {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const formatCardNumber = (num: string) => {
    const cleaned = num.replace(/-/g, "").replace(/\s/g, "");
    if (cleaned.length !== 16) return num;
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 8)} ${cleaned.substring(8, 12)} ${cleaned.substring(12, 16)}`;
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: "Copied!",
      description: `${field} copied to clipboard`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusColor = () => {
    switch (status) {
      case "Valid":
        return "text-yellow-400";
      case "Used":
        return "text-gray-400";
      case "Expired":
        return "text-red-400";
      default:
        return "text-yellow-400";
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-900/90 via-yellow-800/80 to-black border-2 border-yellow-500/50 shadow-2xl">
        {/* Background Pattern - Subtle squares */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255, 215, 0, 0.1) 20px, rgba(255, 215, 0, 0.1) 21px),
                              repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255, 215, 0, 0.1) 20px, rgba(255, 215, 0, 0.1) 21px)`,
          }} />
        </div>

        {/* Gold Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-lg opacity-20 blur-xl" />

        <div className="relative z-10 p-8 text-white">
          {/* Top Section - Logo and Chip */}
          <div className="flex justify-between items-start mb-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-black">M</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-yellow-300">R.O.Z.K.A CAPTIAL</span>
                <span className="text-[10px] text-yellow-400/80">Limited</span>
              </div>
            </div>

            {/* Chip */}
            <div className="w-16 h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 flex flex-col justify-center items-center gap-1">
                <div className="w-full h-0.5 bg-black/30"></div>
                <div className="w-full h-0.5 bg-black/30"></div>
                <div className="w-full h-0.5 bg-black/30"></div>
                <div className="w-full h-0.5 bg-black/30"></div>
              </div>
            </div>
          </div>

          {/* Amount Section */}
          <div className="mb-8">
            <p className="text-sm text-yellow-200/80 mb-1">Amount</p>
            <p className="text-4xl font-bold text-yellow-400">${parseFloat(amount || "0").toFixed(2)}</p>
          </div>

          {/* Card Number */}
          <div className="mb-8">
            <p className="text-sm text-yellow-200/80 mb-2">Card Number</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-mono tracking-wider font-bold text-yellow-300">
                {formatCardNumber(cardNumber)}
              </p>
              {showFullDetails && (
                <button
                  onClick={() => copyToClipboard(cardNumber.replace(/-/g, "").replace(/\s/g, ""), "Card Number")}
                  className="p-1 hover:bg-yellow-500/20 rounded transition-colors"
                >
                  {copiedField === "Card Number" ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-yellow-300" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Bottom Section - PIN and Status */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-yellow-200/80 mb-1">Pin</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-mono font-bold text-yellow-300">{pin}</p>
                {showFullDetails && (
                  <button
                    onClick={() => copyToClipboard(pin, "PIN")}
                    className="p-1 hover:bg-yellow-500/20 rounded transition-colors"
                  >
                    {copiedField === "PIN" ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-yellow-300" />
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-yellow-200/80 mb-1">Status</p>
              <p className={`text-xl font-bold ${getStatusColor()}`}>{status}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


import { CreditCard } from "lucide-react";
import { Card } from "./ui/card";

interface TopupCardUIProps {
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: string;
  expiryYear: string;
  balance: string;
  currency?: string;
  className?: string;
}

export default function TopupCardUI({
  cardNumber,
  cardHolderName,
  expiryMonth,
  expiryYear,
  balance,
  currency = "USD",
  className = "",
}: TopupCardUIProps) {
  // Format card number with dashes and mask middle digits
  const formatCardNumber = (num: string) => {
    const cleaned = num.replace(/-/g, "");
    if (cleaned.length < 8) return num;
    const first4 = cleaned.substring(0, 4);
    const last4 = cleaned.substring(cleaned.length - 4);
    const middle = "****-****";
    return `${first4}-${middle}-${last4}`;
  };

  // Format expiry date
  const formatExpiry = (month: string, year: string) => {
    if (!month || !year) return "MM/YYYY";
    const mm = month.padStart(2, "0");
    const yy = year.length === 4 ? year.substring(2) : year;
    return `${mm}/${yy}`;
  };

  return (
    <Card
      className={`relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border-primary/50 p-6 text-white ${className}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
      </div>

      {/* Card Content */}
      <div className="relative z-10 space-y-6">
        {/* Card Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-primary" />
            <span className="text-sm font-semibold text-primary/80">Topup Card</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60">Balance</p>
            <p className="text-2xl font-bold text-primary">
              {currency} {parseFloat(balance).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Card Number */}
        <div className="space-y-2">
          <p className="text-xs text-white/60 uppercase tracking-wider">Card Number</p>
          <p className="text-2xl font-mono tracking-wider font-semibold">
            {formatCardNumber(cardNumber)}
          </p>
        </div>

        {/* Card Footer */}
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <p className="text-xs text-white/60 uppercase tracking-wider">Card Holder</p>
            <p className="text-lg font-semibold">{cardHolderName || "---"}</p>
          </div>
          <div className="text-right space-y-2">
            <p className="text-xs text-white/60 uppercase tracking-wider">Expires</p>
            <p className="text-lg font-semibold">{formatExpiry(expiryMonth, expiryYear)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}


import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Bitcoin, DollarSign, CheckCircle2, Copy } from "lucide-react";
import { FullPageLoader, InlineLoader } from "@/components/DashboardLoader";
import type { Deposit as DepositType, TradingAccount } from "@shared/schema";
import { useLocation } from "wouter";
import { QRCodeSVG } from "qrcode.react";
// MyFatoorah payment integration

export default function Deposit() {
  const [location, setLocation] = useLocation();
  const [account, setAccount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [cryptocurrency, setCryptocurrency] = useState("BTC"); // Default to Bitcoin
  const [processing, setProcessing] = useState(false);
  const [topupCardNumber, setTopupCardNumber] = useState("");
  const [topupCardPin, setTopupCardPin] = useState("");
  const [cryptoDepositData, setCryptoDepositData] = useState<{
    depositId: string;
    walletAddress: string;
    network: string;
    cryptoType: string;
    qrCodeUrl: string | null;
    amount: string;
  } | null>(null);
  const { toast } = useToast();

  // Fetch trading accounts - optimized
  const { data: accounts = [], isLoading: loadingAccounts } = useQuery<TradingAccount[]>({
    queryKey: ["/api/trading-accounts"],
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 60000,
  });

  // Fetch deposits - optimized
  const { data: deposits = [], isLoading: loadingDeposits } = useQuery<DepositType[]>({
    queryKey: ["/api/deposits"],
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });


  // Handle callback from MyFatoorah payment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get("paymentId");
    const invoiceId = urlParams.get("invoiceId");
    const success = urlParams.get("success");
    const canceled = urlParams.get("canceled");
    const error = urlParams.get("error");
    const depositId = urlParams.get("depositId");

    console.log("[Deposit] MyFatoorah payment redirect params:", JSON.stringify({ paymentId, invoiceId, success, canceled, error, depositId, fullUrl: window.location.href }));

    if (success === "true" && (paymentId || invoiceId || depositId)) {
      // Show processing toast immediately
      toast({
        title: "Processing Payment...",
        description: "Verifying your payment with MyFatoorah. Please wait.",
      });
      
      // Refresh all relevant data
      queryClient.invalidateQueries({ queryKey: ["/api/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trading-accounts"] });
      
      setTimeout(() => {
        toast({
          title: "✅ Payment Successful!",
          description: "Your payment has been processed. Balance will update shortly.",
        });
        // Clean URL after processing
        window.history.replaceState({}, "", "/dashboard/deposit");
        window.location.href = "/dashboard/deposit";
      }, 1500);
    } else if (canceled === "true") {
      toast({
        title: "Payment Canceled",
        description: "Your payment was canceled. You can try again when ready.",
        variant: "default",
      });
      // Clean URL
      window.history.replaceState({}, "", "/dashboard/deposit");
      window.location.href = "/dashboard/deposit";
    } else if (error === "true") {
      toast({
        title: "Payment Failed",
        description: "Your payment could not be processed. Please try again.",
        variant: "destructive",
      });
      // Clean URL
      window.history.replaceState({}, "", "/dashboard/deposit");
      window.location.href = "/dashboard/deposit";
    }
  }, [setLocation, toast, queryClient]);

  // Handle Crypto Deposit (Direct wallet)
  const handleCryptoDeposit = async () => {
    try {
      setProcessing(true);
      console.log("[Crypto Deposit] Starting deposit creation:", { amount, account, cryptocurrency });

      const response = await apiRequest("POST", "/api/crypto/create-deposit", {
        amount: parseFloat(amount),
        tradingAccountId: account,
        cryptocurrency,
      });

      // apiRequest returns Response, need to parse JSON
      const data = await response.json();
      console.log("[Crypto Deposit] Response data:", data);

      if (!data.walletAddress || !data.depositId) {
        console.error("[Crypto Deposit] Missing wallet address or deposit ID:", data);
        throw new Error(data.message || "Failed to get wallet address");
      }

      console.log("[Crypto Deposit] Setting cryptoDepositData:", data);
      setCryptoDepositData(data);
      
      // Invalidate deposits query to show the new deposit
      queryClient.invalidateQueries({ queryKey: ["/api/deposits"] });
      
      toast({
        title: "Deposit Address Generated",
        description: "Please send the exact amount to the wallet address shown below.",
      });
      setProcessing(false);
    } catch (error: any) {
      console.error("[Crypto Deposit] Error:", error);
      const errorMessage = error.message || error.response?.data?.message || "Failed to create crypto deposit";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setProcessing(false);
      setCryptoDepositData(null); // Clear any partial data
    }
  };

  // Handle MyFatoorah Payment (Credit Card)
  const handleMyFatoorahPayment = async () => {
    try {
      setProcessing(true);

      // Create MyFatoorah invoice
      const response = await apiRequest("POST", "/api/myfatoorah/create-invoice", {
        amount: parseFloat(amount),
        tradingAccountId: account,
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("[MyFatoorah] Non-JSON response:", text.substring(0, 200));
        throw new Error("Server returned an invalid response. Please try again.");
      }

      const data = await response.json();

      if (!data.invoiceURL) {
        throw new Error(data.message || "Failed to get payment URL");
      }

      // Redirect to MyFatoorah payment page
      toast({
        title: "Redirecting to Payment",
        description: "You will be redirected to complete your payment...",
      });
      
      window.location.href = data.invoiceURL;
    } catch (error: any) {
      console.error("[MyFatoorah Payment] Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  const handleTopupCardDeposit = async () => {
    try {
      setProcessing(true);

      if (!topupCardNumber || !topupCardPin) {
        toast({
          title: "Error",
          description: "Please enter card number and PIN",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      // Clean card number (remove dashes/spaces)
      const cleanCardNumber = topupCardNumber.replace(/[-\s]/g, '');
      if (cleanCardNumber.length !== 16 || !/^\d+$/.test(cleanCardNumber)) {
        toast({
          title: "Error",
          description: "Invalid card number format. Must be 16 digits.",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      if (topupCardPin.length !== 4 || !/^\d+$/.test(topupCardPin)) {
        toast({
          title: "Error",
          description: "Invalid PIN format. Must be 4 digits.",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      // Ensure PIN is exactly 4 digits (pad with leading zeros if needed)
      const normalizedPin = topupCardPin.padStart(4, "0");
      
      // Prepare request payload
      const payload: any = {
        cardNumber: cleanCardNumber,
        pin: normalizedPin,
        tradingAccountId: account,
      };
      
      // If amount is provided and valid, send it; otherwise backend will use full card balance
      if (amount && parseFloat(amount) > 0) {
        const depositAmount = parseFloat(amount);
        if (depositAmount >= 10) {
          payload.amount = depositAmount.toString();
        }
      }
      
      const response = await apiRequest("POST", "/api/topup-cards/verify-and-deposit", payload);

      const data = await response.json();

      if (data.success && data.deposit) {
        const depositedAmount = parseFloat(data.deposit.amount || "0");
        toast({
          title: "✅ Deposit Successful!",
          description: `Your deposit of $${depositedAmount.toFixed(2)} has been completed successfully.`,
        });

        // Reset form
        setAmount("");
        setTopupCardNumber("");
        setTopupCardPin("");
        setMerchant("");
        setAccount("");

        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/deposits"] });
        queryClient.invalidateQueries({ queryKey: ["/api/trading-accounts"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });

        setProcessing(false);
      } else {
        throw new Error(data.message || "Failed to process deposit");
      }
    } catch (error: any) {
      console.error("[Topup Card Deposit] Error:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || error.message || "Failed to process deposit",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  // Copy wallet address to clipboard
  const copyWalletAddress = () => {
    if (cryptoDepositData?.walletAddress) {
      navigator.clipboard.writeText(cryptoDepositData.walletAddress);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      toast({
        title: "Error",
        description: "Please select a trading account",
        variant: "destructive",
      });
      return;
    }

    // For topup cards, amount is optional (will use full card balance if not provided)
    // For other payment methods, amount is required
    if (merchant !== "topup-card" && (!amount || parseFloat(amount) < 10)) {
      toast({
        title: "Error",
        description: "Please enter a valid amount (minimum $10)",
        variant: "destructive",
      });
      return;
    }

    // For topup cards, if amount is provided, validate it
    if (merchant === "topup-card" && amount && parseFloat(amount) > 0 && parseFloat(amount) < 10) {
      toast({
        title: "Error",
        description: "Minimum deposit amount is $10",
        variant: "destructive",
      });
      return;
    }

    if (merchant === "myfatoorah-card") {
      await handleMyFatoorahPayment();
    } else if (merchant === "topup-card") {
      await handleTopupCardDeposit();
    } else if (merchant === "crypto") {
      await handleCryptoDeposit();
    } else {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: "accountId",
      label: "Account",
      render: (value: string) => {
        const acc = accounts.find((a) => a.id === value);
        return <span className="font-mono font-semibold">{acc?.accountId || "-"}</span>;
      },
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: string) => (
        <span className="font-semibold text-primary">${parseFloat(value).toFixed(2)}</span>
      ),
    },
    {
      key: "merchant",
      label: "Method",
      render: (value: string) => <span className="text-muted-foreground">{value}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        if (value === "Completed" || value === "Approved") {
          return (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {value}
            </Badge>
          );
        }
        if (value === "Pending") {
          return <Badge variant="secondary">{value}</Badge>;
        }
        return <Badge variant="destructive">{value}</Badge>;
      },
    },
    {
      key: "transactionId",
      label: "Transaction ID",
      render: (value: string) => (
        <span className="font-mono text-xs text-muted-foreground">{value || "-"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (value: Date) => new Date(value).toLocaleDateString(),
    },
  ];

  if (loadingAccounts || loadingDeposits) {
    return <FullPageLoader text="Loading deposit options..." />;
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-3xl" />
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
          Deposit Funds
        </h1>
        <p className="text-muted-foreground">Add funds to your trading account securely with MyFatoorah</p>
      </div>

      {/* Deposit Form */}
      <Card className="relative p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/5 backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="account" className="text-primary uppercase tracking-wider text-xs font-bold">
                Trading Account
              </Label>
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger 
                  id="account" 
                  data-testid="select-account"
                  className="border-primary/30 bg-black/40 focus:border-primary"
                >
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent className="bg-black border-primary/30">
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.accountId} - {acc.type} (${parseFloat(acc.balance).toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant" className="text-primary uppercase tracking-wider text-xs font-bold">
                Payment Method
              </Label>
              <Select value={merchant} onValueChange={setMerchant}>
                <SelectTrigger 
                  id="merchant" 
                  data-testid="select-merchant"
                  className="border-primary/30 bg-black/40 focus:border-primary"
                >
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="bg-black border-primary/30">
                  <SelectItem value="myfatoorah-card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Credit/Debit Card (MyFatoorah)
                    </div>
                  </SelectItem>
                  <SelectItem value="topup-card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Topup Card
                    </div>
                  </SelectItem>
                  <SelectItem value="crypto">
                    <div className="flex items-center gap-2">
                      <Bitcoin className="w-4 h-4" />
                      Cryptocurrency (Direct)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {merchant === "crypto" && (
            <div className="space-y-2">
              <Label htmlFor="crypto" className="text-primary uppercase tracking-wider text-xs font-bold">
                Select Cryptocurrency
              </Label>
              <Select value={cryptocurrency} onValueChange={setCryptocurrency}>
                <SelectTrigger 
                  id="crypto"
                  className="border-primary/30 bg-black/40 focus:border-primary"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-primary/30">
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="USDT-BEP20">USDT (BEP20) - BNB Smart Chain</SelectItem>
                  <SelectItem value="USDT-TRC20">USDT (TRC20) - TRON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {merchant === "topup-card" && (
            <div className="space-y-4 p-4 border border-primary/30 rounded-lg bg-black/40">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">Enter Topup Card Details</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Enter the card number and PIN provided by your admin to make a deposit.
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="text-primary uppercase tracking-wider text-xs font-bold">
                    Card Number
                  </Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234-5678-9012-3456"
                    value={topupCardNumber}
                    onChange={(e) => {
                      // Format as user types: add dashes every 4 digits
                      const value = e.target.value.replace(/[-\s]/g, '');
                      if (value.length <= 16 && /^\d*$/.test(value)) {
                        const formatted = value.match(/.{1,4}/g)?.join('-') || value;
                        setTopupCardNumber(formatted);
                      }
                    }}
                    maxLength={19} // 16 digits + 3 dashes
                    className="border-primary/30 bg-black/40 focus-visible:ring-primary font-mono"
                    disabled={processing}
                  />
                  <p className="text-xs text-muted-foreground">Enter the 16-digit card number</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardPin" className="text-primary uppercase tracking-wider text-xs font-bold">
                    PIN
                  </Label>
                  <Input
                    id="cardPin"
                    type="password"
                    placeholder="1234"
                    value={topupCardPin}
                    onChange={(e) => {
                      // Only allow 4 digits
                      const value = e.target.value.replace(/\D/g, '').substring(0, 4);
                      setTopupCardPin(value);
                    }}
                    maxLength={4}
                    className="border-primary/30 bg-black/40 focus-visible:ring-primary font-mono"
                    disabled={processing}
                  />
                  <p className="text-xs text-muted-foreground">Enter the 4-digit PIN provided with your card</p>
                </div>
              </div>
            </div>
          )}

          {/* Amount field - visible for all payment methods, optional for topup cards */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-primary uppercase tracking-wider text-xs font-bold">
              Amount (USD) {merchant === "topup-card" && <span className="text-muted-foreground font-normal normal-case">(Optional - leave empty to use full card balance)</span>}
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder={merchant === "topup-card" ? "100.00 (or leave empty)" : "100.00"}
              min="10"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-testid="input-amount"
              className="border-primary/30 bg-black/40 focus-visible:ring-primary text-lg font-semibold"
              required={merchant !== "topup-card"}
              disabled={processing}
            />
            <p className="text-xs text-muted-foreground">
              {merchant === "topup-card" 
                ? "Enter amount (minimum $10) or leave empty to deposit full card balance" 
                : "Minimum deposit: $10.00"}
            </p>
          </div>

          <Button
            type="submit"
            className="neon-gold text-lg font-bold"
            data-testid="button-submit"
            disabled={processing || !account || !merchant || !!cryptoDepositData || 
              (merchant !== "topup-card" && (!amount || parseFloat(amount) < 10)) ||
              (merchant === "topup-card" && (!topupCardNumber || !topupCardPin || topupCardNumber.replace(/[-\s]/g, '').length !== 16 || topupCardPin.length !== 4 || (amount && parseFloat(amount) > 0 && parseFloat(amount) < 10)))}
          >
            {processing ? (
              <>
                <InlineLoader className="mr-2" />
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="mr-2 h-5 w-5" />
                Deposit ${amount || "0.00"}
              </>
            )}
          </Button>
        </form>

        {/* Crypto Deposit Wallet Address Display */}
        {cryptoDepositData && merchant === "crypto" && (
          <div className="mt-6 p-6 border border-primary/30 rounded-lg bg-black/60 space-y-6">
            {cryptoDepositData.walletAddress ? (
              <>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    {cryptoDepositData.cryptoType === "BTC" ? "Bitcoin (BTC)" : 
                     cryptoDepositData.cryptoType === "USDT-BEP20" ? "USDT (BEP20)" : 
                     "USDT (TRC20)"} Deposit
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Network: {cryptoDepositData.network === "BTC" ? "Bitcoin" : 
                             cryptoDepositData.network === "BEP20" ? "BNB Smart Chain (BSC)" : 
                             "TRON (TRC20)"}
                  </p>
                  {cryptoDepositData.cryptoType === "USDT-BEP20" || cryptoDepositData.cryptoType === "USDT-TRC20" ? (
                    <p className="text-xs text-muted-foreground">For USDT deposits only</p>
                  ) : null}
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center justify-center">
                  {cryptoDepositData.qrCodeUrl ? (
                    // Use custom QR code image if available
                    <div className="p-6 bg-white rounded-lg shadow-lg border-2 border-primary/20">
                      <img
                        src={cryptoDepositData.qrCodeUrl}
                        alt="QR Code"
                        className="w-[280px] h-[280px] object-contain"
                      />
                    </div>
                  ) : (
                    // Auto-generate QR code from wallet address
                    <div className="p-6 bg-white rounded-lg shadow-lg border-2 border-primary/20">
                      <QRCodeSVG
                        value={cryptoDepositData.walletAddress}
                        size={280}
                        level="H"
                        includeMargin={true}
                        marginSize={2}
                        imageSettings={{
                          src: "",
                          height: 0,
                          width: 0,
                          excavate: false,
                        }}
                      />
                    </div>
                  )}
                  <p className="mt-4 text-xs text-muted-foreground text-center max-w-xs">
                    Scan this QR code with your crypto wallet app to send the payment
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <p className="text-destructive">Wallet address not available</p>
              </div>
            )}

            {/* Wallet Address */}
            <div className="space-y-2">
              <Label className="text-primary uppercase tracking-wider text-xs font-bold flex items-center gap-2">
                Wallet Address
                <span className="text-muted-foreground font-normal normal-case">(Tap to copy)</span>
              </Label>
              <div 
                className="flex items-center gap-2 p-4 bg-black/40 border border-primary/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                onClick={copyWalletAddress}
              >
                <code className="flex-1 text-sm font-mono text-foreground break-all select-all">
                  {cryptoDepositData.walletAddress}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyWalletAddress();
                  }}
                  className="shrink-0"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>

            {/* Deposit Info */}
            <div className="space-y-3 text-sm border-t border-primary/20 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold text-lg">${cryptoDepositData.amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="secondary">Pending</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Deposit Arrival:</span>
                <span className="text-foreground">
                  {cryptoDepositData.cryptoType === "BTC" ? "1 confirmation" : "20 confirmations"}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-primary/20">
              <p className="text-xs text-muted-foreground text-center mb-2">
                ⚠️ Send the <strong>exact amount</strong> (${cryptoDepositData.amount}) to this address.
              </p>
              <p className="text-xs text-muted-foreground text-center mb-2">
                Your deposit will be processed after confirmation on the blockchain.
              </p>
              <p className="text-xs text-yellow-400 text-center font-semibold">
                ⚠️ Admin approval required: After sending, your deposit will be reviewed and approved by an admin.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setCryptoDepositData(null);
                setAmount("");
                setMerchant("");
                setCryptocurrency("BTC");
              }}
            >
              Create New Deposit
            </Button>
          </div>
        )}
      </Card>

      {/* Benefits Section */}
      <Card className="relative p-6 border-primary/30 bg-gradient-to-br from-black/80 to-green-500/5 backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent" />
        <div className="relative z-10">
          <h3 className="text-lg font-bold text-green-400 mb-4 uppercase tracking-wider">
            <CheckCircle2 className="inline mr-2 w-5 h-5" />
            Secure & Fast Deposits
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">Instant Processing:</strong> Deposits are processed immediately after approval
            </div>
            <div>
              <strong className="text-foreground">Secure Payment:</strong> Bank-grade encryption with MyFatoorah
            </div>
            <div>
              <strong className="text-foreground">Multiple Methods:</strong> Credit cards and cryptocurrency supported
            </div>
            <div>
              <strong className="text-foreground">24/7 Support:</strong> Our team is here to help anytime
            </div>
          </div>
        </div>
      </Card>

      {/* Deposit History */}
      <div>
        <h2 className="text-2xl font-bold text-primary uppercase tracking-wider mb-4">Deposit History</h2>
        {deposits.length > 0 ? (
          <Card className="border-primary/30 bg-black/80 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="p-6">
              <DataTable columns={columns} data={deposits} />
            </div>
          </Card>
        ) : (
          <Card className="relative p-12 text-center border-primary/30 bg-black/80 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <p className="text-muted-foreground">No deposits yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

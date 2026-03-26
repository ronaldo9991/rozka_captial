import { useState, useEffect, useRef, memo } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ForexPair {
  symbol: string;
  name: string;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
}

// Memoized for better performance
function LiveForexTicker() {
  const [forexData, setForexData] = useState<ForexPair[]>([
    { symbol: "EURUSD", name: "EUR/USD", bid: 1.0856, ask: 1.0858, change: 0.0012, changePercent: 0.11 },
    { symbol: "GBPUSD", name: "GBP/USD", bid: 1.2634, ask: 1.2636, change: -0.0008, changePercent: -0.06 },
    { symbol: "USDJPY", name: "USD/JPY", bid: 149.82, ask: 149.85, change: 0.24, changePercent: 0.16 },
    { symbol: "GOLD", name: "XAU/USD", bid: 2042.50, ask: 2043.00, change: 12.30, changePercent: 0.61 },
    { symbol: "BTCUSD", name: "BTC/USD", bid: 43250, ask: 43280, change: 450, changePercent: 1.05 },
    { symbol: "ETHUSD", name: "ETH/USD", bid: 2285, ask: 2288, change: -15, changePercent: -0.65 },
  ]);
  
  const [isVisible, setIsVisible] = useState(true);
  const elementRef = useRef<HTMLDivElement>(null);

  // Pause updates when component is off-screen using Intersection Observer
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Pause updates when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Simulate live price updates - only when visible (huge performance boost)
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setForexData(prev => prev.map(pair => {
        const volatility = 0.0002;
        const change = (Math.random() - 0.5) * volatility * pair.bid;
        const newBid = pair.bid + change;
        const newAsk = pair.ask + change;
        const newChange = pair.change + change;
        const newChangePercent = (newChange / pair.bid) * 100;

        return {
          ...pair,
          bid: parseFloat(newBid.toFixed(pair.symbol.includes("JPY") ? 2 : 4)),
          ask: parseFloat(newAsk.toFixed(pair.symbol.includes("JPY") ? 2 : 4)),
          change: parseFloat(newChange.toFixed(4)),
          changePercent: parseFloat(newChangePercent.toFixed(2)),
        };
      }));
    }, 5000); // Increased to 5s for better performance (was 3s)

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <Card ref={elementRef} className="relative overflow-hidden border-primary/30 bg-black/80 backdrop-blur-xl">
      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-primary uppercase tracking-wider">
            Live Market Rates
          </h3>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-xs text-primary font-semibold">LIVE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {forexData.map((pair) => (
              <motion.div
                key={pair.symbol}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative p-4 rounded-lg bg-gradient-to-br from-black/60 to-primary/5 border border-primary/20 hover:border-primary/50 transition-all duration-300"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-xs text-muted-foreground">{pair.name}</div>
                      <div className="text-lg font-bold text-foreground font-mono">
                        {pair.bid.toFixed(pair.symbol.includes("JPY") ? 2 : 4)}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                      pair.change >= 0 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {pair.change >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-xs font-bold">
                        {pair.changePercent >= 0 ? "+" : ""}{pair.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-muted-foreground">Spread:</span>{" "}
                      <span className="text-primary font-semibold">
                        {(pair.ask - pair.bid).toFixed(4)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ask:</span>{" "}
                      <span className="text-foreground font-mono">
                        {pair.ask.toFixed(pair.symbol.includes("JPY") ? 2 : 4)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-4 pt-4 border-t border-primary/20">
          <p className="text-xs text-muted-foreground text-center">
            <span className="text-primary font-semibold">Risk Warning:</span> Trading Forex and 
            Leveraged Financial Instruments involves significant risk. Your capital is at risk.
          </p>
        </div>
      </div>
    </Card>
  );
}

export default memo(LiveForexTicker);


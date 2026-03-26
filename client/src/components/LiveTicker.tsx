import { memo, useMemo, useState, useEffect, useRef } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerItem {
  pair: string;
  price: number;
  change: number;
  changePercent: number;
  up: boolean;
}

// Initial ticker data with base prices
const initialTickerData: TickerItem[] = [
  { pair: "EUR/USD", price: 1.0834, change: 0.0012, changePercent: 0.12, up: true },
  { pair: "GBP/USD", price: 1.2654, change: 0.0010, changePercent: 0.08, up: true },
  { pair: "USD/JPY", price: 149.82, change: -0.22, changePercent: -0.15, up: false },
  { pair: "XAU/USD", price: 2356.32, change: 10.60, changePercent: 0.45, up: true },
  { pair: "AUD/USD", price: 0.6543, change: -0.0014, changePercent: -0.22, up: false },
  { pair: "USD/CHF", price: 0.8832, change: 0.0004, changePercent: 0.05, up: true },
];

// Optimized with CSS animation instead of Framer Motion for better performance
function LiveTicker() {
  const [tickerData, setTickerData] = useState<TickerItem[]>(initialTickerData);
  const [isVisible, setIsVisible] = useState(true);
  const elementRef = useRef<HTMLDivElement>(null);

  // Pause updates when component is off-screen (performance optimization)
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
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Simulate live price updates - only when visible (performance optimization)
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setTickerData(prev => prev.map(item => {
        // Calculate volatility based on pair type
        const volatility = item.pair.includes('JPY') || item.pair.includes('XAU') 
          ? 0.002  // Higher volatility for JPY and Gold
          : 0.0002; // Lower volatility for major pairs
        
        // Generate random change
        const randomChange = (Math.random() - 0.5) * volatility;
        const priceChange = item.price * randomChange;
        const newPrice = item.price + priceChange;
        
        // Calculate new change and percentage
        const basePrice = item.price - item.change; // Original base price
        const newChange = newPrice - basePrice;
        const newChangePercent = basePrice !== 0 ? (newChange / basePrice) * 100 : 0;
        
        // Format based on pair type
        const decimals = item.pair.includes('JPY') || item.pair.includes('XAU') ? 2 : 4;
        
        return {
          ...item,
          price: parseFloat(newPrice.toFixed(decimals)),
          change: parseFloat(newChange.toFixed(decimals)),
          changePercent: parseFloat(newChangePercent.toFixed(2)),
          up: newChangePercent >= 0,
        };
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isVisible]);

  const duplicatedData = useMemo(() => 
    [...tickerData, ...tickerData, ...tickerData],
    [tickerData]
  );
  
  return (
    <div 
      ref={elementRef}
      className="w-full overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-y border-primary/30"
    >
      <div
        className="flex gap-8 py-3 animate-ticker-scroll"
        style={{ 
          willChange: 'transform',
          transform: 'translateZ(0)', // Force GPU acceleration
        }}
      >
        {duplicatedData.map((item, index) => {
          const decimals = item.pair.includes('JPY') || item.pair.includes('XAU') ? 2 : 4;
          const formattedPrice = item.price.toFixed(decimals);
          const formattedChange = `${item.changePercent >= 0 ? '+' : ''}${item.changePercent.toFixed(2)}%`;
          
          return (
          <div
              key={`${item.pair}-${index}`}
            className="flex items-center gap-3 whitespace-nowrap"
            data-testid={`ticker-item-${index}`}
          >
            <span className="font-semibold text-primary">{item.pair}</span>
              <span className="text-foreground font-mono">{formattedPrice}</span>
            <span
              className={`flex items-center gap-1 text-sm ${
                item.up ? "text-chart-2" : "text-destructive"
              }`}
            >
              {item.up ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
                {formattedChange}
            </span>
          </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(LiveTicker);

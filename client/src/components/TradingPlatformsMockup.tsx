import { motion } from "framer-motion";
import { TrendingUp, Activity, Signal } from "lucide-react";

export default function TradingPlatformsMockup() {
  return (
    <div className="relative h-full flex items-center justify-center py-10 sm:py-12 px-4">
      {/* Phone Mockup - Static */}
      <motion.div
        className="relative w-[260px] h-[520px] sm:w-[300px] sm:h-[620px] md:w-[320px] md:h-[650px] z-10"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Phone Frame - Ultra Realistic */}
        <div className="relative w-full h-full rounded-[48px] bg-gradient-to-b from-gray-950 via-gray-900 to-black p-3 shadow-2xl">
          {/* Outer bezel shine */}
          <div className="absolute inset-0 rounded-[48px] bg-gradient-to-br from-gray-700/20 via-transparent to-transparent"></div>
          
          {/* Screen container */}
          <div className="relative w-full h-full rounded-[36px] bg-black overflow-hidden border border-gray-800 shadow-inner">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-black rounded-b-3xl z-30 flex items-center justify-center gap-2">
              <div className="w-12 h-1 bg-gray-800 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
            </div>
            
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-12 px-6 flex items-center justify-between z-20 pt-2">
              <span className="text-[11px] text-gray-400 font-medium">9:41</span>
              <div className="flex items-center gap-1">
                <Signal className="w-3 h-3 text-gray-400" />
                <Activity className="w-3 h-3 text-gray-400" />
                <div className="w-5 h-2.5 border border-gray-400 rounded-sm relative">
                  <div className="absolute inset-0.5 bg-gray-400 rounded-[1px]"></div>
                </div>
              </div>
            </div>
          
            {/* Screen Content */}
            <div className="relative w-full h-full bg-gradient-to-b from-gray-950 to-black overflow-hidden pt-12">
              {/* Trading Header */}
              <div className="px-4 pb-3 border-b border-primary/10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-0.5">Equity</div>
                    <div className="text-2xl font-bold text-primary">$3,500.00</div>
                  </div>
                  <div className="flex items-center gap-1 bg-chart-2/20 px-2 py-1 rounded">
                    <TrendingUp className="w-3 h-3 text-chart-2" />
                    <span className="text-xs text-chart-2 font-semibold">+2.4%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">EUR/USD</span>
                    <span className="text-[10px] text-muted-foreground">1.02012</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-[9px] px-2 py-1 bg-primary text-primary-foreground rounded font-semibold">M1</span>
                    <span className="text-[9px] px-2 py-1 text-muted-foreground">M5</span>
                    <span className="text-[9px] px-2 py-1 text-muted-foreground">M15</span>
                    <span className="text-[9px] px-2 py-1 text-muted-foreground">M30</span>
                    <span className="text-[9px] px-2 py-1 text-muted-foreground">H1</span>
                  </div>
                </div>
              </div>

              {/* Chart Area - More Realistic */}
              <div className="relative h-[440px] px-3 py-4">
              {/* Price indicators */}
              <div className="absolute top-8 right-6 z-10 space-y-2">
                <div className="bg-chart-2 text-white text-[10px] px-2 py-1 rounded-md font-bold shadow-lg">
                  Ask 1.02012
                </div>
                <div className="bg-destructive text-white text-[10px] px-2 py-1 rounded-md font-bold shadow-lg">
                  Bid 1.00983
                </div>
              </div>

              {/* Enhanced Candlestick Chart */}
              <svg className="w-full h-full" viewBox="0 0 290 400"  preserveAspectRatio="xMidYMid meet">
                {/* Grid lines - More detailed */}
                {[...Array(9)].map((_, i) => (
                  <line
                    key={`h-${i}`}
                    x1="20"
                    y1={i * 45 + 20}
                    x2="270"
                    y2={i * 45 + 20}
                    stroke="rgba(212, 175, 55, 0.08)"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                  />
                ))}
                {[...Array(10)].map((_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={i * 28 + 20}
                    y1="20"
                    x2={i * 28 + 20}
                    y2="380"
                    stroke="rgba(212, 175, 55, 0.08)"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                  />
                ))}

                {/* More realistic Candlesticks with wicks */}
                {[
                  { x: 35, open: 220, close: 180, high: 170, low: 230, type: 'up' },
                  { x: 60, open: 180, close: 150, high: 140, low: 190, type: 'up' },
                  { x: 85, open: 150, close: 130, high: 120, low: 160, type: 'up' },
                  { x: 110, open: 130, close: 155, high: 125, low: 165, type: 'down' },
                  { x: 135, open: 155, close: 175, high: 150, low: 185, type: 'down' },
                  { x: 160, open: 175, close: 140, high: 130, low: 180, type: 'up' },
                  { x: 185, open: 140, close: 115, high: 105, low: 150, type: 'up' },
                  { x: 210, open: 115, close: 100, high: 90, low: 120, type: 'up' },
                  { x: 235, open: 100, close: 90, high: 80, low: 105, type: 'up' },
                  { x: 260, open: 90, close: 85, high: 75, low: 95, type: 'up' },
                ].map((candle, i) => (
                  <g key={i}>
                    {/* High-Low Wick */}
                    <line
                      x1={candle.x}
                      y1={candle.high}
                      x2={candle.x}
                      y2={candle.low}
                      stroke={candle.type === 'up' ? '#10B981' : '#EF4444'}
                      strokeWidth="1.5"
                    />
                    {/* Open-Close Body */}
                    <rect
                      x={candle.x - 8}
                      y={Math.min(candle.open, candle.close)}
                      width="16"
                      height={Math.abs(candle.open - candle.close) || 2}
                      fill={candle.type === 'up' ? '#10B981' : '#EF4444'}
                      opacity={candle.type === 'up' ? 0.9 : 1}
                      stroke={candle.type === 'up' ? '#10B981' : '#EF4444'}
                      strokeWidth="0.5"
                    />
                  </g>
                ))}

                {/* Trend line */}
                <path
                  d="M 35 200 L 60 175 L 85 155 L 110 145 L 135 165 L 160 142 L 185 122 L 210 107 L 235 95 L 260 87"
                  fill="none"
                  stroke="rgba(212, 175, 55, 0.7)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />
                
                {/* Glow filter for trend line */}
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
              </svg>

              {/* Price axis - More detailed */}
              <div className="absolute right-1 top-6 bottom-20 w-14 flex flex-col justify-between text-[9px] text-muted-foreground font-mono">
                <span className="bg-background/50 px-1 rounded">1.030</span>
                <span className="bg-background/50 px-1 rounded">1.025</span>
                <span className="bg-chart-2/30 px-1 rounded text-chart-2 font-semibold">1.020</span>
                <span className="bg-background/50 px-1 rounded">1.015</span>
                <span className="bg-destructive/30 px-1 rounded text-destructive font-semibold">1.010</span>
                <span className="bg-background/50 px-1 rounded">1.005</span>
                <span className="bg-background/50 px-1 rounded">1.000</span>
                <span className="bg-background/50 px-1 rounded">0.995</span>
                <span className="bg-background/50 px-1 rounded">0.990</span>
              </div>

              {/* Time axis */}
              <div className="absolute bottom-2 left-6 right-16 flex justify-between text-[8px] text-muted-foreground font-mono">
                <span>14:00</span>
                <span>15:00</span>
                <span>16:00</span>
                <span>17:00</span>
                <span>18:00</span>
              </div>
              </div>

              {/* Bottom Trading Panel - Enhanced */}
              <div className="absolute bottom-0 left-0 right-0 glass-morphism border-t border-primary/30 p-4">
              {/* Top controls */}
              <div className="flex items-center justify-between mb-3">
                <button className="text-[10px] text-primary font-medium flex items-center gap-1">
                  <span className="text-primary">+</span> PENDING ORDER
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">LOTS</span>
                  <div className="flex items-center gap-1 bg-accent/50 rounded-lg p-1">
                    <button className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs text-primary hover:bg-primary/30 transition-colors">−</button>
                    <span className="text-sm font-bold w-12 text-center text-foreground">0.50</span>
                    <button className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs text-primary hover:bg-primary/30 transition-colors">+</button>
                  </div>
                </div>
              </div>
              
              {/* Trading buttons */}
              <div className="flex gap-2">
                <button className="flex-1 bg-gradient-to-br from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 text-white py-3 rounded-lg text-sm font-bold transition-all shadow-lg relative overflow-hidden group">
                  <span className="relative z-10">SELL</span>
                  <div className="text-xs font-normal opacity-80">1.07366</div>
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                </button>
                
                <button className="flex-1 bg-gradient-to-br from-chart-2 to-chart-2/80 hover:from-chart-2/90 hover:to-chart-2/70 text-white py-3 rounded-lg text-sm font-bold transition-all shadow-lg relative overflow-hidden group">
                  <span className="relative z-10">BUY</span>
                  <div className="text-xs font-normal opacity-80">1.07376</div>
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Phone reflection */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[300px] h-12 bg-primary/20 blur-2xl rounded-full"></div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[280px] h-6 bg-primary/30 blur-xl rounded-full"></div>
      </motion.div>

      {/* Static data points around phone */}
      <motion.div
        className="hidden sm:flex absolute top-4 -left-0.5 glass-morphism px-3 py-2 rounded-lg border border-primary/20"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <div className="text-[10px] text-muted-foreground">Volume</div>
        <div className="text-sm font-bold text-primary">$5.2B</div>
      </motion.div>

      <motion.div
        className="hidden sm:flex absolute bottom-32 -right-2 glass-morphism px-3 py-2 rounded-lg border border-primary/20"
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <div className="text-[10px] text-muted-foreground">Spread</div>
        <div className="text-sm font-bold text-primary">0.1 pips</div>
      </motion.div>

      <motion.div
        className="hidden sm:flex absolute top-40 -right-2 glass-morphism px-3 py-2 rounded-lg border border-chart-2/30"
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-chart-2" />
          <div className="text-xs font-bold text-chart-2">+0.12%</div>
        </div>
      </motion.div>
    </div>
  );
}


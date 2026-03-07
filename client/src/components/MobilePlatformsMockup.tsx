import { motion } from "framer-motion";
import { TrendingUp, Clock, Info, DollarSign, ArrowUp, ArrowDown, Users, Menu, Search, List, BarChart3, Bell, User } from "lucide-react";

// Phone Frame Component
function PhoneFrame({ 
  children, 
  rotate, 
  zIndex, 
  delay = 0,
  screenContent
}: { 
  children?: React.ReactNode;
  rotate: number;
  zIndex: number;
  delay?: number;
  screenContent?: React.ReactNode;
}) {
  return (
    <motion.div
      className="relative"
      style={{ zIndex }}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
      <div className="relative w-[280px] h-[560px] sm:w-[300px] sm:h-[600px]">
        {/* Phone Frame - Realistic */}
        <div className="relative w-full h-full rounded-[40px] bg-gradient-to-b from-gray-950 via-gray-900 to-black p-2.5 sm:p-3 shadow-2xl">
          {/* Outer bezel shine */}
          <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-gray-700/20 via-transparent to-transparent"></div>
          
          {/* Screen container */}
          <div className="relative w-full h-full rounded-[32px] bg-black overflow-hidden border border-gray-800 shadow-inner">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 sm:w-36 sm:h-7 bg-black rounded-b-2xl z-30 flex items-center justify-center gap-1.5">
              <div className="w-10 h-0.5 sm:w-12 sm:h-1 bg-gray-800 rounded-full"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-800 rounded-full"></div>
            </div>
            
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-10 sm:h-12 px-4 sm:px-6 flex items-center justify-between z-20 pt-1.5 sm:pt-2">
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium">9:41</span>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 border border-gray-400 rounded-full"></div>
                <div className="w-4 h-2 sm:w-5 sm:h-2.5 border border-gray-400 rounded-sm relative">
                  <div className="absolute inset-0.5 bg-gray-400 rounded-[1px]"></div>
                </div>
              </div>
            </div>
          
            {/* Screen Content */}
            {children || screenContent}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MobilePlatformsMockup() {
  return (
    <div className="relative w-full flex items-center justify-center py-8 sm:py-12 md:py-16 overflow-hidden min-h-[520px] sm:min-h-[600px] md:min-h-[650px]">
      {/* Container for three phones */}
      <div
        className="relative flex items-center justify-center w-full max-w-[1200px] mx-auto px-4 md:px-0"
        style={{ perspective: '1200px' }}
      >
        
        {/* Left Phone - Market Watch List (Behind) */}
        <div className="hidden sm:block absolute -translate-x-[80px] md:-translate-x-[150px] lg:-translate-x-[170px] scale-75 sm:scale-85 md:scale-90 opacity-85">
          <PhoneFrame rotate={0} zIndex={1} delay={0.1}>
            <div className="relative w-full h-full bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden pt-12">
              {/* Header */}
              <div className="px-3 pt-2 pb-2 border-b border-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                  <Menu className="w-5 h-5 text-gray-400" />
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500"
                  disabled
                />
              </div>
              
              {/* Market Watch List */}
              <div className="px-3 pt-3">
                <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase">MY LIST</h3>
                <div className="space-y-0.5">
                  {/* Table Header */}
                  <div className="flex items-center justify-between text-[9px] text-gray-500 pb-1 border-b border-gray-800/30">
                    <span className="flex-1">SYMBOL</span>
                    <span className="w-16 text-right">BID</span>
                    <span className="w-16 text-right">ASK</span>
                    <span className="w-14 text-right">CHANGE</span>
                  </div>
                  
                  {/* Market List Items */}
                  {[
                    { symbol: "EURUSD", bid: "1.08500", ask: "1.08510", change: "+0.00005", changeType: 'up' },
                    { symbol: "GBPUSD", bid: "1.26340", ask: "1.26360", change: "-0.00008", changeType: 'down' },
                    { symbol: "USDJPY", bid: "149.820", ask: "149.850", change: "+0.240", changeType: 'up' },
                    { symbol: "USDCAD", bid: "1.35200", ask: "1.35220", change: "-0.00010", changeType: 'down' },
                    { symbol: "AUDUSD", bid: "0.66200", ask: "0.66220", change: "+0.00015", changeType: 'up' },
                    { symbol: "NZDUSD", bid: "0.61500", ask: "0.61520", change: "+0.00008", changeType: 'up' },
                    { symbol: "USDCHF", bid: "0.88300", ask: "0.88320", change: "-0.00005", changeType: 'down' },
                    { symbol: "EURGBP", bid: "0.85900", ask: "0.85920", change: "+0.00003", changeType: 'up' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800/20 hover:bg-gray-900/30 transition-colors">
                      <span className="flex-1 text-xs font-medium text-white">{item.symbol}</span>
                      <span className="w-16 text-right text-[10px] text-gray-300 font-mono">{item.bid}</span>
                      <span className="w-16 text-right text-[10px] text-gray-300 font-mono">{item.ask}</span>
                      <span className={`w-14 text-right text-[10px] font-mono ${
                        item.changeType === 'up' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {item.change}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Bottom Navigation */}
              <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 border-t border-gray-800/50">
                <div className="flex items-center justify-around py-2">
                  <List className="w-5 h-5 text-primary" />
                  <Search className="w-5 h-5 text-gray-400" />
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                  <Bell className="w-5 h-5 text-gray-400" />
                  <User className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </PhoneFrame>
        </div>

        {/* Middle Phone - Trading View with Candlestick Chart (In Front) */}
        <div className="relative scale-95 xs:scale-100 sm:scale-105 md:scale-110 z-20">
          <PhoneFrame rotate={0} zIndex={20} delay={0.2}>
            <div className="relative w-full h-full bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden pt-12">
              {/* Trading Header */}
              <div className="px-3 pt-2 pb-2 border-b border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-0.5">Equity</div>
                    <div className="text-xl font-bold text-primary">$3,500.00</div>
                  </div>
                  <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400 font-semibold">+2.4%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">EUR/USD</span>
                    <span className="text-[10px] text-muted-foreground">1.02012</span>
                  </div>
                  <div className="flex gap-1">
                    {['M1', 'M5', 'M15', 'M30', 'H1'].map((item, i) => (
                      <span 
                        key={item}
                        className={`text-[9px] px-2 py-0.5 rounded ${
                          i === 0 
                            ? 'bg-primary text-primary-foreground font-semibold' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Candlestick Chart Area */}
              <div className="relative h-[280px] px-2 py-2">
                {/* Price indicators */}
                <div className="absolute top-2 right-3 z-10 space-y-1">
                  <div className="bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow-lg">
                    Ask 1.02012
                  </div>
                  <div className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow-lg">
                    Bid 1.00983
                  </div>
                </div>

                {/* Candlestick Chart */}
                <svg className="w-full h-full" viewBox="0 0 280 260" preserveAspectRatio="xMidYMid meet">
                  {/* Grid lines */}
                  {[...Array(7)].map((_, i) => (
                    <line
                      key={`h-${i}`}
                      x1="15"
                      y1={i * 38 + 20}
                      x2="265"
                      y2={i * 38 + 20}
                      stroke="rgba(212, 175, 55, 0.08)"
                      strokeWidth="0.5"
                      strokeDasharray="2,2"
                    />
                  ))}
                  {[...Array(9)].map((_, i) => (
                    <line
                      key={`v-${i}`}
                      x1={i * 31 + 15}
                      y1="15"
                      x2={i * 31 + 15}
                      y2="245"
                      stroke="rgba(212, 175, 55, 0.08)"
                      strokeWidth="0.5"
                      strokeDasharray="2,2"
                    />
                  ))}

                  {/* Candlesticks */}
                  {[
                    { x: 30, open: 180, close: 150, high: 165, low: 195, type: 'up' },
                    { x: 60, open: 150, close: 140, high: 135, low: 155, type: 'up' },
                    { x: 90, open: 140, close: 125, high: 120, low: 145, type: 'up' },
                    { x: 120, open: 125, close: 145, high: 118, low: 150, type: 'down' },
                    { x: 150, open: 145, close: 165, high: 140, low: 170, type: 'down' },
                    { x: 180, open: 165, close: 145, high: 135, low: 170, type: 'up' },
                    { x: 210, open: 145, close: 130, high: 125, low: 150, type: 'up' },
                    { x: 240, open: 130, close: 120, high: 115, low: 135, type: 'up' },
                  ].map((candle, i) => (
                    <g key={i}>
                      <line
                        x1={candle.x}
                        y1={candle.high}
                        x2={candle.x}
                        y2={candle.low}
                        stroke={candle.type === 'up' ? '#10B981' : '#EF4444'}
                        strokeWidth="1.5"
                      />
                      <rect
                        x={candle.x - 7}
                        y={Math.min(candle.open, candle.close)}
                        width="14"
                        height={Math.abs(candle.open - candle.close) || 2}
                        fill={candle.type === 'up' ? '#10B981' : '#EF4444'}
                        opacity={candle.type === 'up' ? 0.9 : 1}
                      />
                    </g>
                  ))}

                  {/* Trend line */}
                  <path
                    d="M 30 165 L 60 145 L 90 132 L 120 118 L 150 140 L 180 135 L 210 127 L 240 117"
                    fill="none"
                    stroke="rgba(212, 175, 55, 0.7)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Price axis */}
                <div className="absolute right-1 top-3 bottom-3 w-10 flex flex-col justify-between text-[8px] text-muted-foreground font-mono">
                  <span>1.030</span>
                  <span>1.020</span>
                  <span className="text-primary">1.010</span>
                  <span>1.005</span>
                  <span>1.000</span>
                  <span>0.995</span>
                </div>
              </div>

              {/* Trading Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gray-900/95 border-t border-primary/30 p-3">
                <div className="flex items-center justify-between mb-2">
                  <button className="text-[9px] text-primary font-medium flex items-center gap-1">
                    <span>+</span> PENDING ORDER
                  </button>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-muted-foreground uppercase font-semibold">LOTS</span>
                    <div className="flex items-center gap-1 bg-accent/50 rounded-lg p-0.5">
                      <button className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-[10px] text-primary">−</button>
                      <span className="text-xs font-bold w-10 text-center text-foreground">0.50</span>
                      <button className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-[10px] text-primary">+</button>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-500 text-white py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg">
                    <span>SELL</span>
                    <div className="text-[10px] font-normal opacity-80">1.07366</div>
                  </button>
                  
                  <button className="flex-1 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-500 text-white py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg">
                    <span>BUY</span>
                    <div className="text-[10px] font-normal opacity-80">1.07376</div>
                  </button>
                </div>
              </div>
            </div>
          </PhoneFrame>
        </div>

        {/* Right Phone - Account Dashboard with P&L Chart (Behind) */}
        <div className="hidden sm:block absolute translate-x-[80px] md:translate-x-[150px] lg:translate-x-[170px] scale-75 sm:scale-85 md:scale-90 opacity-85">
          <PhoneFrame rotate={0} zIndex={1} delay={0.3}>
            <div className="relative w-full h-full bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden pt-12">
              {/* Header */}
              <div className="px-3 pt-2 pb-2 border-b border-gray-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUp className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-white">Individual</span>
                </div>
                <div className="flex items-center gap-1 text-[9px]">
                  {['Assets', 'P&L', 'Orders(2)', 'Transfers', 'History'].map((item, i) => (
                    <span 
                      key={item}
                      className={`px-2 py-1 rounded ${
                        i === 1 
                          ? 'bg-primary/20 text-primary font-semibold' 
                          : 'text-gray-400'
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* P&L Content */}
              <div className="px-3 pt-3 overflow-hidden">
                <div className="space-y-3">
                  {/* Last 1M P&L */}
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">Last 1M P&L</p>
                    <p className="text-xl font-bold text-green-400">+$1,169.29</p>
                  </div>
                  
                  {/* Realized P&L */}
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-400">Last 1M Realized P&L</p>
                    <p className="text-sm font-semibold text-green-400">+$776.03</p>
                  </div>
                  
                  {/* P&L Line Chart */}
                  <div className="relative h-32 bg-gray-900/30 rounded-lg border border-gray-800/30 p-2 mt-2">
                    {/* Grid */}
                    <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                      {[...Array(5)].map((_, i) => (
                        <line
                          key={`h-${i}`}
                          x1="5%"
                          y1={(i + 1) * 25 + '%'}
                          x2="95%"
                          y2={(i + 1) * 25 + '%'}
                          stroke="rgba(212, 175, 55, 0.08)"
                          strokeWidth="0.5"
                          strokeDasharray="1,1"
                        />
                      ))}
                    </svg>
                    
                    {/* Line Chart */}
                    <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                      <path
                        d="M 10 70 L 30 65 L 50 60 L 70 55 L 90 75 L 110 85 L 130 40 L 150 35 L 170 30 L 190 20"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {/* Area fill */}
                      <path
                        d="M 10 70 L 30 65 L 50 60 L 70 55 L 90 75 L 110 85 L 130 40 L 150 35 L 170 30 L 190 20 L 190 100 L 10 100 Z"
                        fill="url(#gradient)"
                        opacity="0.3"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Date labels */}
                    <div className="absolute -bottom-4 left-0 right-0 flex justify-between text-[7px] text-gray-500">
                      <span>07/03</span>
                      <span>07/18</span>
                      <span>08/02</span>
                    </div>
                  </div>
                  
                  {/* P&L Percentage */}
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">Last 1M P&L%</p>
                    <p className="text-lg font-bold text-green-400">+13.56%</p>
                  </div>
                  
                  {/* Benchmark Chart */}
                  <div className="relative h-28 bg-gray-900/30 rounded-lg border border-gray-800/30 p-2">
                    <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                      {[...Array(4)].map((_, i) => (
                        <line
                          key={`h-${i}`}
                          x1="5%"
                          y1={(i + 1) * 33 + '%'}
                          x2="95%"
                          y2={(i + 1) * 33 + '%'}
                          stroke="rgba(212, 175, 55, 0.08)"
                          strokeWidth="0.5"
                          strokeDasharray="1,1"
                        />
                      ))}
                    </svg>
                    
                    {/* Comparison Line Chart */}
                    <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                      {/* Green line - P&L */}
                      <path
                        d="M 10 60 L 40 55 L 70 50 L 100 45 L 130 40 L 160 35 L 190 30"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      {/* Yellow line - Benchmark */}
                      <path
                        d="M 10 65 L 40 63 L 70 58 L 100 55 L 130 52 L 160 48 L 190 45"
                        fill="none"
                        stroke="#FCD34D"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    {/* Date labels */}
                    <div className="absolute -bottom-4 left-0 right-0 flex justify-between text-[7px] text-gray-500">
                      <span>07/11</span>
                      <span>07/17</span>
                      <span>07/23</span>
                      <span>08/02</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}


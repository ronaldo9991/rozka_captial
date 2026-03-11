import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import AnimatedGrid from "@/components/AnimatedGrid";
import ParticleField from "@/components/ParticleField";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, TrendingUp, DollarSign, BarChart3, 
  Globe, Shield, Zap, ArrowRight, Activity, Target, 
  TrendingDown, Coins, Calendar,
  AlertTriangle, Percent, Layers, ArrowUpCircle,
  ArrowDownCircle, Minus, CircleDollarSign, Signal, X,
  Newspaper, Grid3x3, Brain, Network, Calculator,
  Cloud, ArrowUpDown, Clock, FileText, Users, Cpu,
  BookOpen, Heart, Building2
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import React from "react";

export default function ForexPedia() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openCardIndex, setOpenCardIndex] = useState<number | null>(null);

  const categories = [
    { 
      name: "Trading Basics", 
      count: 45, 
      image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=600&q=75&auto=format&fit=crop" 
    },
    { 
      name: "Market Analysis", 
      count: 38, 
      image: "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?w=600&q=75&auto=format&fit=crop" 
    },
    { 
      name: "Trading Strategies", 
      count: 52, 
      image: "https://images.unsplash.com/photo-1454165205744-3b78555e5572?w=600&q=75&auto=format&fit=crop" 
    },
    { 
      name: "Risk Management", 
      count: 29, 
      image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=600&q=75&auto=format&fit=crop" 
    },
    { 
      name: "Technical Indicators", 
      count: 67, 
      image: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=600&q=75&auto=format&fit=crop" 
    },
    { 
      name: "Currency Pairs", 
      count: 34, 
      image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&q=75&auto=format&fit=crop" 
    },
  ];

  const forexTerms = [
    {
      term: "Ask Price",
      definition: "The price at which the market is prepared to sell a specific currency pair. This is the price a trader pays when buying the base currency.",
      category: "Trading Basics",
      relatedTerms: ["Bid Price", "Spread", "Quote"],
      icon: ArrowUpCircle
    },
    {
      term: "Base Currency",
      definition: "The first currency quoted in a currency pair. For example, in EUR/USD, EUR is the base currency. The base currency is always equal to 1 unit.",
      category: "Currency Pairs",
      relatedTerms: ["Quote Currency", "Currency Pair", "Exchange Rate"],
      icon: Coins
    },
    {
      term: "Bear Market",
      definition: "A market characterized by declining prices over an extended period. Traders who anticipate falling prices are called 'bears' and often take short positions.",
      category: "Market Analysis",
      relatedTerms: ["Bull Market", "Market Trend", "Short Position"],
      icon: TrendingDown
    },
    {
      term: "Bid Price",
      definition: "The price at which the market is prepared to buy a specific currency pair. This is the price a trader receives when selling the base currency.",
      category: "Trading Basics",
      relatedTerms: ["Ask Price", "Spread", "Market Maker"],
      icon: ArrowDownCircle
    },
    {
      term: "Bull Market",
      definition: "A market characterized by rising prices over an extended period. Traders who anticipate rising prices are called 'bulls' and often take long positions.",
      category: "Market Analysis",
      relatedTerms: ["Bear Market", "Market Trend", "Long Position"],
      icon: TrendingUp
    },
    {
      term: "Candlestick Chart",
      definition: "A type of price chart that displays the high, low, opening, and closing prices of a currency pair over a specific time period using candlestick-shaped marks.",
      category: "Technical Indicators",
      relatedTerms: ["Bar Chart", "Line Chart", "Technical Analysis"],
      icon: BarChart3
    },
    {
      term: "Currency Pair",
      definition: "The quotation of two different currencies, where one is quoted against the other. The first currency is the base, the second is the quote currency.",
      category: "Currency Pairs",
      relatedTerms: ["Base Currency", "Quote Currency", "Exchange Rate"],
      icon: Globe
    },
    {
      term: "Day Trading",
      definition: "A trading strategy where positions are opened and closed within the same trading day to capitalize on short-term price movements.",
      category: "Trading Strategies",
      relatedTerms: ["Scalping", "Swing Trading", "Position Trading"],
      icon: Calendar
    },
    {
      term: "Leverage",
      definition: "The use of borrowed capital to increase potential returns. For example, 1:100 leverage means you can control $100,000 with just $1,000 of your own capital.",
      category: "Trading Basics",
      relatedTerms: ["Margin", "Margin Call", "Equity"],
      icon: Zap
    },
    {
      term: "Liquidity",
      definition: "The degree to which an asset can be quickly bought or sold without affecting its price. Forex is the most liquid financial market in the world.",
      category: "Market Analysis",
      relatedTerms: ["Market Depth", "Volume", "Slippage"],
      icon: Activity
    },
    {
      term: "Long Position",
      definition: "Buying a currency pair with the expectation that its value will increase. You profit if the base currency strengthens against the quote currency.",
      category: "Trading Basics",
      relatedTerms: ["Short Position", "Buy Order", "Bull Market"],
      icon: ArrowUpCircle
    },
    {
      term: "Lot",
      definition: "A standardized unit of measurement for a forex transaction. A standard lot equals 100,000 units of the base currency. Mini lots (10,000) and micro lots (1,000) are also available.",
      category: "Trading Basics",
      relatedTerms: ["Position Size", "Volume", "Contract Size"],
      icon: Layers
    },
    {
      term: "Margin",
      definition: "The amount of money required in your account to open and maintain a leveraged trading position. It's expressed as a percentage of the full position size.",
      category: "Risk Management",
      relatedTerms: ["Leverage", "Margin Call", "Free Margin"],
      icon: Percent
    },
    {
      term: "Margin Call",
      definition: "A notification from your broker that your account equity has fallen below the required margin level. You must deposit additional funds or close positions.",
      category: "Risk Management",
      relatedTerms: ["Margin", "Stop Out", "Account Equity"],
      icon: AlertTriangle
    },
    {
      term: "Pip",
      definition: "The smallest price increment in forex trading. For most currency pairs, a pip is 0.0001 (the fourth decimal place). For JPY pairs, it's 0.01.",
      category: "Trading Basics",
      relatedTerms: ["Pipette", "Spread", "Price Quote"],
      icon: Target
    },
    {
      term: "Quote Currency",
      definition: "The second currency in a currency pair. In EUR/USD, USD is the quote currency. It represents how much of the quote currency equals one unit of the base currency.",
      category: "Currency Pairs",
      relatedTerms: ["Base Currency", "Currency Pair", "Exchange Rate"],
      icon: DollarSign
    },
    {
      term: "Resistance Level",
      definition: "A price level at which selling is thought to be strong enough to prevent the price from rising further. It acts as a 'ceiling' for price movement.",
      category: "Technical Indicators",
      relatedTerms: ["Support Level", "Breakout", "Price Action"],
      icon: Minus
    },
    {
      term: "Short Position",
      definition: "Selling a currency pair with the expectation that its value will decrease. You profit if the base currency weakens against the quote currency.",
      category: "Trading Basics",
      relatedTerms: ["Long Position", "Sell Order", "Bear Market"],
      icon: ArrowDownCircle
    },
    {
      term: "Spread",
      definition: "The difference between the bid and ask price of a currency pair. It represents the cost of trading and is how most brokers make money on forex transactions.",
      category: "Trading Basics",
      relatedTerms: ["Bid Price", "Ask Price", "Commission"],
      icon: Minus
    },
    {
      term: "Stop Loss",
      definition: "An order placed to automatically close a position when the price reaches a specified unfavorable level, limiting potential losses on a trade.",
      category: "Risk Management",
      relatedTerms: ["Take Profit", "Risk Management", "Order Types"],
      icon: Shield
    },
    {
      term: "Support Level",
      definition: "A price level at which buying is thought to be strong enough to prevent the price from declining further. It acts as a 'floor' for price movement.",
      category: "Technical Indicators",
      relatedTerms: ["Resistance Level", "Breakout", "Price Action"],
      icon: Minus
    },
    {
      term: "Swap",
      definition: "The interest rate differential between the two currencies in a pair. When you hold a position overnight, you either pay or earn swap depending on the interest rates.",
      category: "Trading Basics",
      relatedTerms: ["Rollover", "Carry Trade", "Interest Rate"],
      icon: CircleDollarSign
    },
    {
      term: "Take Profit",
      definition: "An order placed to automatically close a position when the price reaches a specified favorable level, securing your profits on a trade.",
      category: "Risk Management",
      relatedTerms: ["Stop Loss", "Limit Order", "Exit Strategy"],
      icon: Target
    },
    {
      term: "Volatility",
      definition: "The degree of variation in the price of a currency pair over time. High volatility means large price swings; low volatility means stable prices.",
      category: "Market Analysis",
      relatedTerms: ["ATR", "Standard Deviation", "Market Conditions"],
      icon: Signal
    },
    // Trading Strategies
    {
      term: "Breakout Strategy",
      definition: "A trading strategy that involves entering a position when the price breaks through a significant support or resistance level, expecting continued momentum in the breakout direction.",
      category: "Trading Strategies",
      relatedTerms: ["Support Level", "Resistance Level", "Price Action", "Momentum"],
      icon: TrendingUp
    },
    {
      term: "Trend Following Strategy",
      definition: "A trading approach that involves identifying and trading in the direction of the prevailing market trend. Traders buy during uptrends and sell during downtrends.",
      category: "Trading Strategies",
      relatedTerms: ["Trend", "Moving Average", "Bull Market", "Bear Market"],
      icon: TrendingUp
    },
    {
      term: "Scalping Strategy",
      definition: "An ultra-short-term trading strategy where traders aim to profit from small price movements, holding positions for seconds to minutes. Requires quick execution and tight spreads.",
      category: "Trading Strategies",
      relatedTerms: ["Day Trading", "High Frequency Trading", "Spread", "Execution Speed"],
      icon: Zap
    },
    {
      term: "Swing Trading Strategy",
      definition: "A medium-term trading strategy where positions are held for several days to weeks, aiming to capture price swings within a trend. Less time-intensive than day trading.",
      category: "Trading Strategies",
      relatedTerms: ["Day Trading", "Position Trading", "Trend", "Technical Analysis"],
      icon: Activity
    },
    {
      term: "Carry Trade Strategy",
      definition: "A strategy where traders borrow in a low-interest-rate currency and invest in a high-interest-rate currency, profiting from the interest rate differential (swap).",
      category: "Trading Strategies",
      relatedTerms: ["Swap", "Interest Rate", "Currency Pair", "Long Position"],
      icon: CircleDollarSign
    },
    {
      term: "Range Trading Strategy",
      definition: "A strategy used when currency pairs trade within a defined range between support and resistance levels. Traders buy at support and sell at resistance.",
      category: "Trading Strategies",
      relatedTerms: ["Support Level", "Resistance Level", "Range", "Consolidation"],
      icon: Minus
    },
    {
      term: "News Trading Strategy",
      definition: "A strategy that involves trading based on economic news releases and events. Traders anticipate market reactions to economic data, central bank announcements, and geopolitical events.",
      category: "Trading Strategies",
      relatedTerms: ["Fundamental Analysis", "Economic Calendar", "Volatility", "Market News"],
      icon: Newspaper
    },
    {
      term: "Grid Trading Strategy",
      definition: "A systematic strategy where buy and sell orders are placed at regular intervals above and below a base price, creating a grid. Profits from price oscillations.",
      category: "Trading Strategies",
      relatedTerms: ["Automated Trading", "Range Trading", "Order Placement", "Systematic Trading"],
      icon: Grid3x3
    },
    {
      term: "Hedging Strategy",
      definition: "A risk management strategy where traders open opposite positions to protect existing positions from adverse price movements. Reduces risk but also limits profit potential.",
      category: "Trading Strategies",
      relatedTerms: ["Risk Management", "Long Position", "Short Position", "Protection"],
      icon: Shield
    },
    {
      term: "Momentum Trading Strategy",
      definition: "A strategy that follows the principle that strong price movements will continue. Traders enter positions when momentum indicators show strong directional movement.",
      category: "Trading Strategies",
      relatedTerms: ["Momentum", "RSI", "MACD", "Price Action", "Trend"],
      icon: TrendingUp
    },
    // Trading Concepts
    {
      term: "Risk-Reward Ratio",
      definition: "A fundamental concept comparing the potential profit of a trade to its potential loss. A 1:2 ratio means risking $1 to make $2. Higher ratios are generally preferred.",
      category: "Trading Concepts",
      relatedTerms: ["Risk Management", "Stop Loss", "Take Profit", "Position Sizing"],
      icon: Target
    },
    {
      term: "Position Sizing",
      definition: "The concept of determining how many lots or units to trade based on account size, risk tolerance, and stop loss distance. Critical for proper risk management.",
      category: "Trading Concepts",
      relatedTerms: ["Risk Management", "Lot", "Margin", "Account Equity"],
      icon: Layers
    },
    {
      term: "Market Psychology",
      definition: "The study of emotional and psychological factors that influence trading decisions and market behavior. Understanding fear, greed, and crowd behavior is crucial for successful trading.",
      category: "Trading Concepts",
      relatedTerms: ["Emotional Trading", "Market Sentiment", "Behavioral Finance", "Trading Psychology"],
      icon: Brain
    },
    {
      term: "Market Sentiment",
      definition: "The overall attitude of traders and investors toward a particular currency pair or the market as a whole. Can be bullish (positive), bearish (negative), or neutral.",
      category: "Trading Concepts",
      relatedTerms: ["Market Psychology", "Bull Market", "Bear Market", "Fundamental Analysis"],
      icon: Activity
    },
    {
      term: "Price Action",
      definition: "A trading concept that focuses on analyzing raw price movements without relying heavily on indicators. Traders read candlestick patterns, support/resistance, and price formations.",
      category: "Trading Concepts",
      relatedTerms: ["Candlestick Chart", "Support Level", "Resistance Level", "Technical Analysis"],
      icon: BarChart3
    },
    {
      term: "Market Structure",
      definition: "The overall framework of price movement including trends, ranges, and key levels. Understanding market structure helps identify high-probability trading opportunities.",
      category: "Trading Concepts",
      relatedTerms: ["Trend", "Support Level", "Resistance Level", "Price Action"],
      icon: Network
    },
    {
      term: "Correlation",
      definition: "A statistical measure of how currency pairs move in relation to each other. Positive correlation means pairs move together; negative correlation means they move opposite.",
      category: "Trading Concepts",
      relatedTerms: ["Currency Pair", "Market Analysis", "Diversification", "Risk Management"],
      icon: Network
    },
    {
      term: "Diversification",
      definition: "A risk management concept of spreading investments across different currency pairs, timeframes, or strategies to reduce overall portfolio risk.",
      category: "Trading Concepts",
      relatedTerms: ["Risk Management", "Correlation", "Portfolio", "Position Sizing"],
      icon: Grid3x3
    },
    {
      term: "Drawdown",
      definition: "The peak-to-trough decline in account equity during a losing period. Maximum drawdown measures the largest loss from a peak before a new peak is achieved.",
      category: "Trading Concepts",
      relatedTerms: ["Risk Management", "Account Equity", "Loss", "Recovery"],
      icon: TrendingDown
    },
    {
      term: "Win Rate",
      definition: "The percentage of winning trades out of total trades. A high win rate doesn't guarantee profitability if risk-reward ratios are poor.",
      category: "Trading Concepts",
      relatedTerms: ["Risk-Reward Ratio", "Profitability", "Trading Performance", "Statistics"],
      icon: Target
    },
    {
      term: "Expectancy",
      definition: "A statistical concept that calculates the average profit or loss per trade based on win rate and risk-reward ratio. Positive expectancy indicates a profitable strategy.",
      category: "Trading Concepts",
      relatedTerms: ["Win Rate", "Risk-Reward Ratio", "Profitability", "Strategy Performance"],
      icon: Calculator
    },
    // Technical Indicators
    {
      term: "Moving Average",
      definition: "A technical indicator that smooths out price data by creating a constantly updated average price over a specific period. Used to identify trends and support/resistance levels.",
      category: "Technical Indicators",
      relatedTerms: ["Trend", "SMA", "EMA", "Technical Analysis"],
      icon: TrendingUp
    },
    {
      term: "RSI (Relative Strength Index)",
      definition: "A momentum oscillator that measures the speed and magnitude of price changes. RSI values range from 0 to 100, with readings above 70 indicating overbought conditions and below 30 indicating oversold.",
      category: "Technical Indicators",
      relatedTerms: ["Momentum", "Oscillator", "Overbought", "Oversold"],
      icon: Activity
    },
    {
      term: "MACD (Moving Average Convergence Divergence)",
      definition: "A trend-following momentum indicator that shows the relationship between two moving averages. Consists of MACD line, signal line, and histogram.",
      category: "Technical Indicators",
      relatedTerms: ["Moving Average", "Momentum", "Trend", "Divergence"],
      icon: BarChart3
    },
    {
      term: "Bollinger Bands",
      definition: "A volatility indicator consisting of a middle moving average and two standard deviation bands. Prices touching the upper or lower bands may indicate overbought or oversold conditions.",
      category: "Technical Indicators",
      relatedTerms: ["Volatility", "Moving Average", "Standard Deviation", "Overbought", "Oversold"],
      icon: Minus
    },
    {
      term: "Fibonacci Retracement",
      definition: "A technical analysis tool using horizontal lines to indicate potential support and resistance levels based on Fibonacci ratios (23.6%, 38.2%, 50%, 61.8%, 78.6%).",
      category: "Technical Indicators",
      relatedTerms: ["Support Level", "Resistance Level", "Technical Analysis", "Price Action"],
      icon: Minus
    },
    {
      term: "Stochastic Oscillator",
      definition: "A momentum indicator comparing a currency pair's closing price to its price range over a given time period. Values above 80 suggest overbought; below 20 suggest oversold.",
      category: "Technical Indicators",
      relatedTerms: ["Momentum", "Oscillator", "Overbought", "Oversold", "RSI"],
      icon: Activity
    },
    {
      term: "ATR (Average True Range)",
      definition: "A volatility indicator that measures market volatility by calculating the average of true ranges over a specified period. Used to set stop losses and position sizes.",
      category: "Technical Indicators",
      relatedTerms: ["Volatility", "Stop Loss", "Position Sizing", "Market Conditions"],
      icon: Signal
    },
    {
      term: "Ichimoku Cloud",
      definition: "A comprehensive technical indicator that provides information about support/resistance, trend direction, momentum, and trading signals through multiple components forming a 'cloud'.",
      category: "Technical Indicators",
      relatedTerms: ["Trend", "Support Level", "Resistance Level", "Technical Analysis"],
      icon: Cloud
    },
    {
      term: "ADX (Average Directional Index)",
      definition: "A trend strength indicator that measures the strength of a trend regardless of direction. Values above 25 indicate a strong trend; below 20 suggests a weak or ranging market.",
      category: "Technical Indicators",
      relatedTerms: ["Trend", "Momentum", "Market Structure", "Technical Analysis"],
      icon: TrendingUp
    },
    {
      term: "Parabolic SAR",
      definition: "A trend-following indicator that provides potential reversal points in the form of dots above or below price. When dots flip position, it may signal a trend change.",
      category: "Technical Indicators",
      relatedTerms: ["Trend", "Reversal", "Stop Loss", "Technical Analysis"],
      icon: Target
    },
    // More Trading Terms
    {
      term: "Slippage",
      definition: "The difference between the expected price of a trade and the price at which the trade is actually executed. Common during high volatility or low liquidity periods.",
      category: "Trading Basics",
      relatedTerms: ["Execution", "Liquidity", "Volatility", "Market Order"],
      icon: ArrowUpDown
    },
    {
      term: "Gap",
      definition: "A price jump where no trading occurs between two consecutive periods. Common after weekend market closures or major news events. Gaps may be filled or act as support/resistance.",
      category: "Market Analysis",
      relatedTerms: ["Price Action", "Market News", "Support Level", "Resistance Level"],
      icon: Minus
    },
    {
      term: "Divergence",
      definition: "A technical analysis concept where price moves in one direction while an indicator moves in the opposite direction. Can signal potential trend reversals.",
      category: "Technical Indicators",
      relatedTerms: ["RSI", "MACD", "Momentum", "Reversal"],
      icon: TrendingDown
    },
    {
      term: "Overbought",
      definition: "A market condition where prices have risen too far and too fast, suggesting a potential downward correction. Often identified by indicators like RSI above 70.",
      category: "Market Analysis",
      relatedTerms: ["Oversold", "RSI", "Stochastic", "Correction"],
      icon: TrendingUp
    },
    {
      term: "Oversold",
      definition: "A market condition where prices have fallen too far and too fast, suggesting a potential upward correction. Often identified by indicators like RSI below 30.",
      category: "Market Analysis",
      relatedTerms: ["Overbought", "RSI", "Stochastic", "Correction"],
      icon: TrendingDown
    },
    {
      term: "Breakout",
      definition: "A price movement that breaks through a significant support or resistance level, often with increased volume. Breakouts can signal the start of a new trend.",
      category: "Market Analysis",
      relatedTerms: ["Support Level", "Resistance Level", "Breakout Strategy", "Trend"],
      icon: TrendingUp
    },
    {
      term: "Pullback",
      definition: "A temporary reversal in the direction of a price trend. Also called a retracement. Often provides entry opportunities in the direction of the main trend.",
      category: "Market Analysis",
      relatedTerms: ["Trend", "Retracement", "Entry Point", "Price Action"],
      icon: TrendingDown
    },
    {
      term: "Consolidation",
      definition: "A period where prices move sideways in a range, indicating indecision in the market. Often precedes significant price movements in either direction.",
      category: "Market Analysis",
      relatedTerms: ["Range Trading", "Support Level", "Resistance Level", "Breakout"],
      icon: Minus
    },
    {
      term: "Reversal",
      definition: "A change in the direction of price movement. Can be a trend reversal (major change) or a correction (temporary change). Identifying reversals is crucial for timing entries and exits.",
      category: "Market Analysis",
      relatedTerms: ["Trend", "Pullback", "Divergence", "Price Action"],
      icon: ArrowUpDown
    },
    {
      term: "Trend",
      definition: "The general direction of price movement. An uptrend has higher highs and higher lows; a downtrend has lower highs and lower lows. Trading with the trend increases probability of success.",
      category: "Market Analysis",
      relatedTerms: ["Bull Market", "Bear Market", "Trend Following Strategy", "Moving Average"],
      icon: TrendingUp
    },
    {
      term: "Pipette",
      definition: "A fractional pip, equal to one-tenth of a pip. For most pairs, a pipette is 0.00001 (the fifth decimal place). Provides more precise price quotes.",
      category: "Trading Basics",
      relatedTerms: ["Pip", "Price Quote", "Spread", "Precision"],
      icon: Target
    },
    {
      term: "Equity",
      definition: "The current value of your trading account, calculated as balance plus or minus any floating profit or loss from open positions.",
      category: "Trading Basics",
      relatedTerms: ["Balance", "Margin", "Free Margin", "Account Balance"],
      icon: DollarSign
    },
    {
      term: "Free Margin",
      definition: "The amount of money in your account available to open new positions. Calculated as equity minus used margin.",
      category: "Trading Basics",
      relatedTerms: ["Margin", "Equity", "Used Margin", "Position"],
      icon: DollarSign
    },
    {
      term: "Used Margin",
      definition: "The amount of margin currently being used to maintain open positions. Cannot be used for new trades until positions are closed.",
      category: "Trading Basics",
      relatedTerms: ["Margin", "Free Margin", "Equity", "Position"],
      icon: Percent
    },
    {
      term: "Balance",
      definition: "The total amount of money in your trading account, excluding any profit or loss from open positions. Changes only when positions are closed or deposits/withdrawals are made.",
      category: "Trading Basics",
      relatedTerms: ["Equity", "Account Balance", "Profit", "Loss"],
      icon: DollarSign
    },
    {
      term: "Commission",
      definition: "A fee charged by some brokers for executing trades, usually calculated per lot or as a percentage of trade value. Some brokers offer commission-free trading but charge wider spreads.",
      category: "Trading Basics",
      relatedTerms: ["Spread", "Broker", "Trading Cost", "Fee"],
      icon: CircleDollarSign
    },
    {
      term: "Rollover",
      definition: "The process of extending the settlement date of an open position to the next trading day. Involves paying or receiving swap (interest rate differential).",
      category: "Trading Basics",
      relatedTerms: ["Swap", "Overnight Position", "Interest Rate", "Carry Trade"],
      icon: Calendar
    },
    {
      term: "Market Order",
      definition: "An order to buy or sell immediately at the current market price. Executed instantly but price may differ from expected due to slippage.",
      category: "Order Types",
      relatedTerms: ["Limit Order", "Stop Order", "Execution", "Slippage"],
      icon: ArrowUpCircle
    },
    {
      term: "Limit Order",
      definition: "An order to buy or sell at a specified price or better. Buy limit orders execute at or below the specified price; sell limit orders execute at or above.",
      category: "Order Types",
      relatedTerms: ["Market Order", "Stop Order", "Entry Point", "Price"],
      icon: Target
    },
    {
      term: "Stop Order",
      definition: "An order that becomes a market order when a specified price is reached. Used to enter positions on breakouts or to limit losses (stop loss).",
      category: "Order Types",
      relatedTerms: ["Stop Loss", "Market Order", "Breakout", "Entry Point"],
      icon: Shield
    },
    {
      term: "Pending Order",
      definition: "An order placed to execute in the future when certain conditions are met. Includes limit orders, stop orders, and stop-limit orders.",
      category: "Order Types",
      relatedTerms: ["Limit Order", "Stop Order", "Market Order", "Execution"],
      icon: Clock
    },
    {
      term: "Fundamental Analysis",
      definition: "A method of analyzing currency pairs by examining economic, social, and political factors that affect supply and demand. Includes GDP, interest rates, employment data, and geopolitical events.",
      category: "Market Analysis",
      relatedTerms: ["Technical Analysis", "Economic Calendar", "News Trading", "Market Sentiment"],
      icon: FileText
    },
    {
      term: "Technical Analysis",
      definition: "A method of analyzing currency pairs by studying historical price charts and patterns to predict future price movements. Uses indicators, support/resistance, and chart patterns.",
      category: "Market Analysis",
      relatedTerms: ["Fundamental Analysis", "Price Action", "Chart Pattern", "Technical Indicators"],
      icon: BarChart3
    },
    {
      term: "Chart Pattern",
      definition: "Recognizable formations on price charts that traders use to predict future price movements. Common patterns include triangles, head and shoulders, double tops/bottoms, and flags.",
      category: "Technical Indicators",
      relatedTerms: ["Price Action", "Technical Analysis", "Support Level", "Resistance Level"],
      icon: BarChart3
    },
    {
      term: "Major Currency Pairs",
      definition: "The most heavily traded currency pairs, typically involving USD paired with EUR, GBP, JPY, AUD, CAD, CHF, or NZD. Characterized by high liquidity and tight spreads.",
      category: "Currency Pairs",
      relatedTerms: ["Currency Pair", "Liquidity", "Spread", "Minor Pairs", "Exotic Pairs"],
      icon: Globe
    },
    {
      term: "Minor Currency Pairs",
      definition: "Currency pairs that don't include USD but involve major currencies (e.g., EUR/GBP, EUR/JPY, GBP/JPY). Less liquid than majors but more liquid than exotics.",
      category: "Currency Pairs",
      relatedTerms: ["Major Currency Pairs", "Exotic Currency Pairs", "Liquidity", "Currency Pair"],
      icon: Globe
    },
    {
      term: "Exotic Currency Pairs",
      definition: "Currency pairs involving one major currency and one from an emerging or smaller economy (e.g., USD/TRY, EUR/ZAR). Typically have wider spreads and lower liquidity.",
      category: "Currency Pairs",
      relatedTerms: ["Major Currency Pairs", "Minor Currency Pairs", "Spread", "Liquidity"],
      icon: Globe
    },
    {
      term: "Market Maker",
      definition: "A broker or financial institution that provides liquidity by quoting both bid and ask prices. Market makers profit from the spread and may take the opposite side of client trades.",
      category: "Trading Basics",
      relatedTerms: ["Broker", "Spread", "Bid Price", "Ask Price", "Liquidity"],
      icon: Building2
    },
    {
      term: "ECN (Electronic Communication Network)",
      definition: "A trading system that connects traders directly with liquidity providers. ECN brokers typically charge commissions but offer tighter spreads and better execution.",
      category: "Trading Basics",
      relatedTerms: ["Broker", "Market Maker", "Liquidity", "Execution", "Commission"],
      icon: Network
    },
    {
      term: "STP (Straight Through Processing)",
      definition: "A broker model where orders are sent directly to liquidity providers without a dealing desk. Brokers earn from markups on spreads rather than trading against clients.",
      category: "Trading Basics",
      relatedTerms: ["Broker", "Market Maker", "ECN", "Liquidity Provider"],
      icon: Network
    },
    {
      term: "Liquidity Provider",
      definition: "Large financial institutions (banks, hedge funds) that provide liquidity to the forex market by quoting bid and ask prices. Retail brokers connect traders to these providers.",
      category: "Trading Basics",
      relatedTerms: ["Liquidity", "Market Maker", "ECN", "STP", "Broker"],
      icon: Building2
    },
    {
      term: "Economic Calendar",
      definition: "A schedule of important economic events and data releases that can significantly impact currency prices. Includes GDP, employment reports, interest rate decisions, and inflation data.",
      category: "Market Analysis",
      relatedTerms: ["Fundamental Analysis", "News Trading", "Market News", "Economic Data"],
      icon: Calendar
    },
    {
      term: "Central Bank",
      definition: "A nation's primary monetary authority responsible for setting interest rates and monetary policy. Central bank decisions (e.g., Fed, ECB, BoE) heavily influence currency values.",
      category: "Market Analysis",
      relatedTerms: ["Interest Rate", "Monetary Policy", "Fundamental Analysis", "Market News"],
      icon: Building2
    },
    {
      term: "Interest Rate",
      definition: "The cost of borrowing money, set by central banks. Higher interest rates typically strengthen a currency as they attract foreign investment seeking better returns.",
      category: "Market Analysis",
      relatedTerms: ["Central Bank", "Carry Trade", "Swap", "Fundamental Analysis"],
      icon: Percent
    },
    {
      term: "Inflation",
      definition: "The rate at which the general level of prices for goods and services rises. Central banks monitor inflation closely and adjust interest rates to control it, affecting currency values.",
      category: "Market Analysis",
      relatedTerms: ["Central Bank", "Interest Rate", "Fundamental Analysis", "Economic Data"],
      icon: TrendingUp
    },
    {
      term: "GDP (Gross Domestic Product)",
      definition: "The total value of goods and services produced by a country. GDP growth rates are key economic indicators that influence currency strength and trading decisions.",
      category: "Market Analysis",
      relatedTerms: ["Economic Calendar", "Fundamental Analysis", "Economic Data", "Market News"],
      icon: TrendingUp
    },
    {
      term: "NFP (Non-Farm Payrolls)",
      definition: "A monthly U.S. employment report released on the first Friday of each month. One of the most important economic indicators, often causing significant market volatility.",
      category: "Market Analysis",
      relatedTerms: ["Economic Calendar", "Volatility", "Market News", "Fundamental Analysis"],
      icon: Users
    },
    {
      term: "FOMC (Federal Open Market Committee)",
      definition: "The branch of the U.S. Federal Reserve that sets monetary policy and interest rates. FOMC meetings and statements are closely watched by forex traders worldwide.",
      category: "Market Analysis",
      relatedTerms: ["Central Bank", "Interest Rate", "Monetary Policy", "Market News"],
      icon: Building2
    },
    {
      term: "Automated Trading",
      definition: "Trading using computer algorithms and Expert Advisors (EAs) that automatically execute trades based on predefined rules. Also called algorithmic or robot trading.",
      category: "Trading Strategies",
      relatedTerms: ["Expert Advisor", "Algorithm", "Systematic Trading", "Backtesting"],
      icon: Cpu
    },
    {
      term: "Expert Advisor (EA)",
      definition: "Automated trading software that executes trades on behalf of traders based on programmed strategies. EAs can operate 24/7 and remove emotional decision-making.",
      category: "Trading Strategies",
      relatedTerms: ["Automated Trading", "Algorithm", "Strategy", "Backtesting"],
      icon: Cpu
    },
    {
      term: "Backtesting",
      definition: "The process of testing a trading strategy on historical data to evaluate its performance. Helps traders understand how a strategy would have performed in past market conditions.",
      category: "Trading Concepts",
      relatedTerms: ["Strategy", "Performance", "Historical Data", "Optimization"],
      icon: BarChart3
    },
    {
      term: "Paper Trading",
      definition: "Simulated trading using virtual money to practice strategies without risking real capital. Also called demo trading or virtual trading.",
      category: "Trading Concepts",
      relatedTerms: ["Demo Account", "Practice", "Strategy Testing", "Risk-Free"],
      icon: FileText
    },
    {
      term: "Demo Account",
      definition: "A practice trading account with virtual funds that allows traders to test strategies, platforms, and brokers without financial risk. Essential for beginners.",
      category: "Trading Basics",
      relatedTerms: ["Paper Trading", "Practice", "Virtual Trading", "Learning"],
      icon: FileText
    },
    {
      term: "Live Account",
      definition: "A real trading account with actual money where trades are executed in the live market. Requires careful risk management and emotional control.",
      category: "Trading Basics",
      relatedTerms: ["Demo Account", "Real Trading", "Risk", "Capital"],
      icon: DollarSign
    },
    {
      term: "Trading Plan",
      definition: "A comprehensive written document outlining a trader's strategy, risk management rules, entry/exit criteria, and trading goals. Essential for consistent and disciplined trading.",
      category: "Trading Concepts",
      relatedTerms: ["Strategy", "Risk Management", "Discipline", "Trading Rules"],
      icon: FileText
    },
    {
      term: "Trading Journal",
      definition: "A record of all trades including entry/exit points, reasons for the trade, emotions, and outcomes. Used to analyze performance and improve trading decisions.",
      category: "Trading Concepts",
      relatedTerms: ["Trading Plan", "Performance Analysis", "Learning", "Improvement"],
      icon: BookOpen
    },
    {
      term: "Emotional Trading",
      definition: "Making trading decisions based on emotions (fear, greed, hope) rather than logic and strategy. A major cause of trading losses and should be avoided through discipline.",
      category: "Trading Concepts",
      relatedTerms: ["Market Psychology", "Discipline", "Trading Plan", "Risk Management"],
      icon: Heart
    },
    {
      term: "FOMO (Fear Of Missing Out)",
      definition: "An emotional state causing traders to enter trades impulsively due to fear of missing potential profits. Often leads to poor entry timing and increased risk.",
      category: "Trading Concepts",
      relatedTerms: ["Emotional Trading", "Market Psychology", "Discipline", "Impulsive Trading"],
      icon: AlertTriangle
    },
    {
      term: "Revenge Trading",
      definition: "The dangerous practice of immediately opening new trades after a loss to 'get even,' often with larger position sizes. Usually leads to further losses and should be avoided.",
      category: "Trading Concepts",
      relatedTerms: ["Emotional Trading", "Discipline", "Risk Management", "Loss"],
      icon: AlertTriangle
    },
    {
      term: "Overtrading",
      definition: "Excessive trading beyond what a strategy or plan dictates, often driven by emotions or boredom. Increases transaction costs and can lead to poor decision-making.",
      category: "Trading Concepts",
      relatedTerms: ["Emotional Trading", "Trading Plan", "Discipline", "Risk Management"],
      icon: AlertTriangle
    },
  ];

  // Advanced search with relevance scoring
  const filteredTerms = React.useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return forexTerms;

    const tokens = query.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return forexTerms;

    // Calculate relevance score for each term
    const scoredTerms = forexTerms.map((term) => {
      let score = 0;
      const termLower = term.term.toLowerCase();
      const definitionLower = term.definition.toLowerCase();
      const categoryLower = term.category.toLowerCase();
      const relatedTermsLower = (term.relatedTerms || []).join(" ").toLowerCase();
      
      // Combine all searchable content
      const allContent = `${termLower} ${definitionLower} ${categoryLower} ${relatedTermsLower}`;

      // Check each token
      for (const token of tokens) {
        // Exact match in term (title) - highest priority
        if (termLower === token) {
          score += 100;
        } else if (termLower.includes(token)) {
          score += 50;
        } else if (termLower.startsWith(token)) {
          score += 40;
        }
        
        // Match in category
        if (categoryLower.includes(token)) {
          score += 30;
        }
        
        // Match in definition (content) - check for word boundaries
        const definitionWords = definitionLower.split(/\s+/);
        const exactWordMatch = definitionWords.some(word => word === token || word.startsWith(token));
        if (exactWordMatch) {
          score += 20;
        } else if (definitionLower.includes(token)) {
          score += 10;
        }
        
        // Match in related terms
        if (relatedTermsLower.includes(token)) {
          score += 15;
        }
        
        // Partial word matching (fuzzy)
        if (allContent.includes(token)) {
          score += 5;
        }
      }

      // Bonus for matching all tokens (AND logic)
      const allTokensMatch = tokens.every(token => 
        termLower.includes(token) || 
        definitionLower.includes(token) || 
        categoryLower.includes(token) ||
        relatedTermsLower.includes(token)
      );
      
      if (allTokensMatch) {
        score += 25;
      }

      // Bonus for exact phrase match
      if (allContent.includes(query)) {
        score += 15;
      }

      return { term, score };
    });

    // Filter out terms with score 0 and sort by relevance
    return scoredTerms
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.term);
  }, [searchTerm]);

  // Handle card click - open popup
  const handleCardClick = (index: number) => {
    setOpenCardIndex(index);
  };

  // Close popup
  const closePopup = () => {
    setOpenCardIndex(null);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openCardIndex !== null) {
        const target = e.target as HTMLElement;
        if (target.closest('.forex-term-popup') === null && target.closest('.forex-term-card') === null) {
          closePopup();
        }
      }
    };

    if (openCardIndex !== null) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent body scroll when popup is open
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [openCardIndex]);

  const scrollToDictionary = () => {
    const el = document.getElementById("forex-dictionary");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero */}
      <div className="relative min-h-screen flex items-center overflow-hidden pt-28 md:pt-40 pb-14 md:pb-20">
        <AnimatedGrid variant="hexagon" />
        <ParticleField count={80} className="opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-background to-background"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=75&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge - Golden Ratio: 16px base */}
            <div className="inline-block mb-[2.618rem]">
              <div className="px-6 py-2.5 bg-primary/10 border border-primary/30 rounded-full backdrop-blur-sm neon-gold">
                <span className="text-sm font-semibold text-primary">Your Complete Forex Knowledge Base</span>
              </div>
            </div>
            {/* Main Title - Golden Ratio: 16px * 1.618^3 = ~67px (closest: 4.25rem = 68px) */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold mb-6 sm:mb-8 md:mb-[4.236rem] leading-[1.2] tracking-tight px-4">
              <span className="text-gradient-animated text-glow-gold inline-block pb-2">ForexPedia</span>
            </h1>
            {/* Description - Golden Ratio: 16px * 1.618^1 = ~26px (closest: 1.625rem = 26px) */}
            <p className="text-base sm:text-lg md:text-xl lg:text-[1.625rem] text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-[2.618rem] px-4" style={{ lineHeight: '1.75rem' }}>
              Master forex trading with our comprehensive encyclopedia of trading terms, strategies, and concepts. From basics to advanced techniques.
            </p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search forex terms, strategies, concepts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      scrollToDictionary();
                    }
                  }}
                  className="pl-12 pr-4 h-14 text-lg glass-morphism-strong border-primary/30"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Categories */}
      <div className="py-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Browse by <span className="text-gradient-gold text-glow-gold inline-block pb-1">Category</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Explore forex topics organized by subject
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <motion.div 
                  whileHover={{ scale: 1.03, y: -6 }}
                  transition={{ duration: 0.5 }}
                  className="group relative h-52 lg:h-56 rounded-3xl overflow-hidden cursor-pointer border border-primary/20 bg-black/40 backdrop-blur-sm shadow-[0_0_30px_rgba(212,175,55,0.35),0_0_60px_rgba(212,175,55,0.2),0_0_90px_rgba(212,175,55,0.1)] hover:shadow-[0_0_40px_rgba(212,175,55,0.45),0_0_80px_rgba(212,175,55,0.25),0_0_120px_rgba(212,175,55,0.15)] transition-shadow duration-500"
                  onClick={() => {
                    setSearchTerm(category.name);
                    // Scroll after React updates the DOM
                    setTimeout(scrollToDictionary, 0);
                  }}
                >
                  <img 
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/20 to-black/70 group-hover:from-black/70 group-hover:to-primary/20 transition-all duration-500"></div>
                  <div className="absolute inset-0">
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold text-white mb-1 drop-shadow-lg">
                            {category.name}
                          </div>
                          <div className="text-sm text-white/70">{category.count} terms</div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary transition-transform duration-300 group-hover:translate-x-2">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent"></div>
                  </div>
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 border border-white/5 rounded-3xl shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]"></div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Terms List */}
      <div
        id="forex-dictionary"
        className="py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 bg-gradient-to-b from-transparent via-primary/5 to-transparent"
      >
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Forex <span className="text-gradient-gold text-glow-gold inline-block pb-1">Dictionary</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              {searchTerm ? `${filteredTerms.length} results found` : `${forexTerms.length} essential forex terms`}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center">
            {filteredTerms.map((item, index) => (
              <div
                key={index}
                onClick={() => handleCardClick(index)}
                className="forex-term-card glass-morphism-strong border border-primary/20 rounded-2xl p-5 group cursor-pointer hover:border-primary/50 transition-all duration-300 w-full shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
              >
                <div className="flex items-start gap-4 text-left font-semibold">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg text-gradient-gold text-glow-gold mb-2 font-bold inline-block pb-1">{item.term}</div>
                    <span className="text-[10px] text-primary bg-primary/10 px-2.5 py-1 rounded-full font-medium">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-primary text-sm flex-shrink-0 mt-2">▶</span>
                </div>
              </div>
            ))}
          </div>

          {/* Popup Modal */}
          {openCardIndex !== null && filteredTerms[openCardIndex] && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={closePopup}
              />
              
              {/* Popup Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="forex-term-popup relative z-10 glass-morphism-strong border border-primary/30 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-[0_0_40px_rgba(212,175,55,0.4),0_0_80px_rgba(212,175,55,0.2)]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={closePopup}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 flex items-center justify-center text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="flex items-start gap-4 mb-6 pr-8">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0">
                    {React.createElement(filteredTerms[openCardIndex].icon, { className: "w-8 h-8 text-primary" })}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-bold text-gradient-gold text-glow-gold mb-2">
                      {filteredTerms[openCardIndex].term}
                    </h3>
                    <span className="text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full font-medium">
                      {filteredTerms[openCardIndex].category}
                    </span>
                  </div>
                </div>

                {/* Definition */}
                <div className="mb-6">
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    {filteredTerms[openCardIndex].definition}
                  </p>
                </div>

                {/* Related Terms */}
                {filteredTerms[openCardIndex].relatedTerms.length > 0 && (
                  <div className="pt-6 border-t border-primary/10">
                    <div className="text-sm text-muted-foreground mb-3 font-semibold flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-primary/30"></div>
                      Related Terms
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filteredTerms[openCardIndex].relatedTerms.map((related, idx) => (
                        <span 
                          key={idx} 
                          onClick={() => {
                            // Find and open related term if it exists in the list
                            const relatedIndex = filteredTerms.findIndex(t => t.term === related);
                            if (relatedIndex !== -1) {
                              setOpenCardIndex(relatedIndex);
                            }
                          }}
                          className="text-sm bg-primary/5 text-primary px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                          {related}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {filteredTerms.length === 0 && (
            <Card className="p-12 glass-morphism-strong border-primary/20 text-center">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try searching with different keywords or browse categories above
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-morphism-strong border-primary/20 p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Apply Your <span className="text-gradient-gold text-glow-gold inline-block pb-1">Knowledge</span>?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Start trading with confidence using professional tools and resources from Rozka Capitals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button size="lg" className="neon-gold magnetic-hover shadow-[0_6px_20px_0_rgba(212,175,55,0.42)]">
                      Open Live Account
                    </Button>
                  </Link>
                  <Link href="/what-is-forex">
                    <Button variant="outline" size="lg">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}


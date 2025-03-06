
import { CandlestickData, Trade, OHLCData } from "../types";
import { formatPrice } from "./dataUtils";

/**
 * Finds a candlestick at a specific time
 */
export const findCandleByTime = (candles: CandlestickData[], time: string): CandlestickData | undefined => {
  const timestamp = new Date(time).getTime() / 1000;
  return candles.find(candle => Math.abs(Number(candle.time) - timestamp) < 60); // Within 60 seconds
};

/**
 * Maps trade events to candlestick indexes
 */
export const mapTradesToCandles = (trades: Trade[], candles: CandlestickData[]): Map<number, Trade[]> => {
  const tradeMap = new Map<number, Trade[]>();
  
  trades.forEach(trade => {
    // Map open time (entry)
    const openTimeIndex = candles.findIndex(
      candle => Math.abs(Number(candle.time) - new Date(trade.open_time).getTime() / 1000) < 60
    );
    
    if (openTimeIndex >= 0) {
      const existing = tradeMap.get(openTimeIndex) || [];
      existing.push(trade);
      tradeMap.set(openTimeIndex, existing);
    }
    
    // Map close time (exit)
    const closeTimeIndex = candles.findIndex(
      candle => Math.abs(Number(candle.time) - new Date(trade.close_time).getTime() / 1000) < 60
    );
    
    if (closeTimeIndex >= 0 && closeTimeIndex !== openTimeIndex) {
      const existing = tradeMap.get(closeTimeIndex) || [];
      existing.push(trade);
      tradeMap.set(closeTimeIndex, existing);
    }
  });
  
  return tradeMap;
};

/**
 * Determines if a trade is entry or exit at a specific time
 */
export const getTradeActionAtTime = (trade: Trade, time: string): 'entry' | 'exit' | null => {
  const candleTime = new Date(time).getTime();
  const openTime = new Date(trade.open_time).getTime();
  const closeTime = new Date(trade.close_time).getTime();
  
  const openDiff = Math.abs(candleTime - openTime);
  const closeDiff = Math.abs(candleTime - closeTime);
  
  if (openDiff < 60000) return 'entry'; // Within 1 minute
  if (closeDiff < 60000) return 'exit'; // Within 1 minute
  
  return null;
};

/**
 * Calculates visual bounds for chart display
 */
export const calculateChartBounds = (candles: CandlestickData[], visibleRange: number = 50): {
  minPrice: number;
  maxPrice: number;
  priceRange: number;
} => {
  if (candles.length === 0) {
    return { minPrice: 0, maxPrice: 0, priceRange: 0 };
  }
  
  const visibleCandles = candles.slice(-visibleRange);
  
  const minPrice = Math.min(...visibleCandles.map(c => c.low));
  const maxPrice = Math.max(...visibleCandles.map(c => c.high));
  
  // Add padding of 5%
  const padding = (maxPrice - minPrice) * 0.05;
  const priceRange = maxPrice - minPrice + padding * 2;
  
  return {
    minPrice: minPrice - padding,
    maxPrice: maxPrice + padding,
    priceRange
  };
};

/**
 * Formats tooltip text for trade information
 */
export const formatTradeTooltip = (trade: Trade): string => {
  const profitClass = trade.profit_net > 0 ? 'text-trading-bullish' : 'text-trading-bearish';
  const profitSign = trade.profit_net > 0 ? '+' : '';
  
  return `
    <div class="text-xs p-2">
      <div class="font-bold">${trade.order_type.toUpperCase()} ${trade.volume} ${trade.symbol}</div>
      <div>Open: ${formatPrice(trade.open_price)}</div>
      <div>Close: ${formatPrice(trade.close_price)}</div>
      <div class="${profitClass}">P/L: ${profitSign}${trade.profit_net.toFixed(2)}</div>
    </div>
  `;
};


import { BacktestData, OHLCData, Trade, PerformanceMetrics, CandlestickData } from "../types";

/**
 * Validates the JSON structure of backtest data
 */
export const validateBacktestData = (data: any): boolean => {
  try {
    // Basic structure validation
    if (!data.symbol || !data.starting_balance || !Array.isArray(data.ohlc_history) || !Array.isArray(data.trade_history)) {
      console.error("Invalid backtest data structure");
      return false;
    }

    // Validate OHLC data
    if (data.ohlc_history.length === 0) {
      console.error("Empty OHLC history");
      return false;
    }

    // Validate the first OHLC entry to check structure
    const firstOHLC = data.ohlc_history[0];
    if (!firstOHLC.time || 
        firstOHLC.etf_open === undefined || 
        firstOHLC.etf_high === undefined || 
        firstOHLC.etf_low === undefined || 
        firstOHLC.etf_close === undefined) {
      console.error("Invalid OHLC data structure");
      return false;
    }

    // If there are trades, validate trade data
    if (data.trade_history.length > 0) {
      const firstTrade = data.trade_history[0];
      if (!firstTrade.symbol || 
          !firstTrade.order_type || 
          !firstTrade.open_time || 
          firstTrade.open_price === undefined || 
          !firstTrade.close_time || 
          firstTrade.close_price === undefined) {
        console.error("Invalid trade data structure");
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error validating backtest data:", error);
    return false;
  }
};

/**
 * Extracts candlestick data from OHLC history
 */
export const extractCandlestickData = (ohlcHistory: OHLCData[]): CandlestickData[] => {
  return ohlcHistory.map(item => ({
    time: Math.floor(new Date(item.time).getTime() / 1000), // Convert to Unix timestamp in seconds
    open: item.etf_open,
    high: item.etf_high,
    low: item.etf_low,
    close: item.etf_close,
    volume: item.etf_volume
  }));
};

/**
 * Detects the timeframe of OHLC data
 */
export const detectTimeframe = (ohlcHistory: OHLCData[]): string => {
  if (ohlcHistory.length < 2) return "unknown";

  const time1 = new Date(ohlcHistory[0].time);
  const time2 = new Date(ohlcHistory[1].time);
  
  const diffMinutes = Math.abs((time2.getTime() - time1.getTime()) / (1000 * 60));
  
  if (diffMinutes < 60) return `${Math.round(diffMinutes)}m`;
  if (diffMinutes < 24 * 60) return `${Math.round(diffMinutes / 60)}h`;
  return `${Math.round(diffMinutes / (60 * 24))}d`;
};

/**
 * Calculates performance metrics from backtest data
 */
export const calculatePerformanceMetrics = (data: BacktestData): PerformanceMetrics => {
  const { trade_history, starting_balance } = data;
  
  if (!trade_history || trade_history.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      profitFactor: 0,
      averageProfit: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      finalBalance: starting_balance,
      totalProfitLoss: 0
    };
  }

  const winningTrades = trade_history.filter(trade => trade.profit_net > 0);
  const losingTrades = trade_history.filter(trade => trade.profit_net < 0);
  
  const totalWinAmount = winningTrades.reduce((sum, trade) => sum + trade.profit_net, 0);
  const totalLossAmount = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.profit_net, 0));
  
  const largestWin = winningTrades.length > 0 
    ? Math.max(...winningTrades.map(trade => trade.profit_net)) 
    : 0;
    
  const largestLoss = losingTrades.length > 0 
    ? Math.min(...losingTrades.map(trade => trade.profit_net)) 
    : 0;
  
  const finalBalance = trade_history[trade_history.length - 1]?.balance || starting_balance;
  const totalProfitLoss = finalBalance - starting_balance;
  
  return {
    totalTrades: trade_history.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: winningTrades.length / trade_history.length * 100,
    profitFactor: totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? Infinity : 0,
    averageProfit: winningTrades.length > 0 ? totalWinAmount / winningTrades.length : 0,
    averageLoss: losingTrades.length > 0 ? totalLossAmount / losingTrades.length : 0,
    largestWin,
    largestLoss,
    finalBalance,
    totalProfitLoss
  };
};

/**
 * Gets the balance data for charting
 */
export const getBalanceHistory = (data: BacktestData): {time: string, balance: number}[] => {
  const { trade_history, starting_balance } = data;
  
  if (!trade_history || trade_history.length === 0) {
    return [];
  }
  
  // Start with initial balance
  const result = [{ 
    time: trade_history[0]?.open_time || new Date().toISOString(), 
    balance: starting_balance 
  }];
  
  // Add each trade's updated balance
  trade_history.forEach(trade => {
    result.push({
      time: trade.close_time,
      balance: trade.balance
    });
  });
  
  return result;
};

/**
 * Returns formatted price with appropriate decimal places
 */
export const formatPrice = (price: number): string => {
  if (price > 1000) return price.toFixed(2);
  if (price > 100) return price.toFixed(3);
  if (price > 10) return price.toFixed(4);
  if (price > 1) return price.toFixed(5);
  return price.toFixed(6);
};

/**
 * Formats currency values with appropriate symbol and decimal places
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formats percentage values
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};

/**
 * Returns a readable date format from ISO string
 */
export const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};


export interface OHLCData {
  time: string;
  bond_open: number;
  bond_high: number;
  bond_low: number;
  bond_rate: number;
  bond_volume: number;
  index1_open: number;
  index1_high: number;
  index1_low: number;
  index1_close: number;
  index1_volume: number;
  index2_open: number;
  index2_high: number;
  index2_low: number;
  index2_close: number;
  index2_volume: number;
  etf_open: number;
  etf_high: number;
  etf_low: number;
  etf_close: number;
  etf_volume: number;
  signal: number | null;
}

export interface Trade {
  state: string;
  symbol: string;
  order_type: "buy" | "sell";
  volume: number;
  open_time: string;
  open_price: number;
  close_time: string;
  close_price: number;
  sl: number;
  tp: number;
  profit: number;
  commission: number;
  profit_net: number;
  balance: number;
}

export interface BacktestData {
  symbol: string;
  indicators: string[];
  starting_balance: number;
  exchange_rate: number;
  ohlc_history: OHLCData[];
  trade_history: Trade[];
}

export interface CandlestickData {
  time: number; // Unix timestamp in seconds for lightweight-charts v5+
  open: number;
  high: number;
  close: number;
  low: number;
  volume: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
}

export interface TradeMarkerProps {
  trade: Trade;
  position: { x: number; y: number };
  type: "entry" | "exit";
}

export interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  averageProfit: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  finalBalance: number;
  totalProfitLoss: number;
}

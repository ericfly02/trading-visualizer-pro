
import React, { useMemo } from 'react';
import { BacktestData } from '@/lib/types';
import { calculatePerformanceMetrics, formatCurrency, formatPercentage } from '@/lib/utils/dataUtils';
import { TrendingUp, TrendingDown, BarChart4, Goal, Percent } from 'lucide-react';

interface MetricsDashboardProps {
  data: BacktestData;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ data }) => {
  const metrics = useMemo(() => calculatePerformanceMetrics(data), [data]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
      {/* Win Rate */}
      <div className="glass-card rounded-xl p-4 transition-all hover:bg-trading-card/95">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-trading-muted">Win Rate</h3>
          <div className="bg-trading-accent/10 p-1.5 rounded">
            <Percent className="h-4 w-4 text-trading-accent" />
          </div>
        </div>
        
        <div className="mb-1">
          <span className="text-2xl font-bold">{formatPercentage(metrics.winRate)}</span>
          <span className="text-xs ml-2 text-trading-muted">
            ({metrics.winningTrades}/{metrics.totalTrades} trades)
          </span>
        </div>
        
        <div className="w-full bg-trading-muted/20 rounded-full h-1.5 mt-2">
          <div 
            className="bg-trading-accent h-1.5 rounded-full" 
            style={{ width: `${metrics.winRate}%` }}
          />
        </div>
      </div>
      
      {/* Profit Factor */}
      <div className="glass-card rounded-xl p-4 transition-all hover:bg-trading-card/95">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-trading-muted">Profit Factor</h3>
          <div className="bg-trading-accent/10 p-1.5 rounded">
            <BarChart4 className="h-4 w-4 text-trading-accent" />
          </div>
        </div>
        
        <div>
          <span className="text-2xl font-bold">
            {metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}
          </span>
        </div>
        
        <div className="flex mt-2 text-xs gap-2">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-trading-bullish mr-1" />
            <span>Win: {formatCurrency(metrics.averageProfit * metrics.winningTrades)}</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-trading-bearish mr-1" />
            <span>Loss: {formatCurrency(Math.abs(metrics.averageLoss * metrics.losingTrades))}</span>
          </div>
        </div>
      </div>
      
      {/* Average Trade */}
      <div className="glass-card rounded-xl p-4 transition-all hover:bg-trading-card/95">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-trading-muted">Average Trade</h3>
          <div className="bg-trading-accent/10 p-1.5 rounded">
            <Goal className="h-4 w-4 text-trading-accent" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center gap-1 text-trading-bullish">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">Win</span>
            </div>
            <span className="text-lg font-bold">{formatCurrency(metrics.averageProfit)}</span>
          </div>
          
          <div>
            <div className="flex items-center gap-1 text-trading-bearish">
              <TrendingDown className="h-3 w-3" />
              <span className="text-xs">Loss</span>
            </div>
            <span className="text-lg font-bold">-{formatCurrency(metrics.averageLoss)}</span>
          </div>
        </div>
      </div>
      
      {/* Total P/L */}
      <div className="glass-card rounded-xl p-4 transition-all hover:bg-trading-card/95">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-trading-muted">Total P/L</h3>
          <div className={`${metrics.totalProfitLoss >= 0 ? 'bg-trading-bullish/10' : 'bg-trading-bearish/10'} p-1.5 rounded`}>
            {metrics.totalProfitLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-trading-bullish" />
            ) : (
              <TrendingDown className="h-4 w-4 text-trading-bearish" />
            )}
          </div>
        </div>
        
        <div>
          <span className={`text-2xl font-bold ${metrics.totalProfitLoss >= 0 ? 'text-trading-bullish' : 'text-trading-bearish'}`}>
            {metrics.totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(metrics.totalProfitLoss)}
          </span>
          <span className="text-xs ml-2 text-trading-muted">
            ({((metrics.totalProfitLoss / data.starting_balance) * 100).toFixed(2)}%)
          </span>
        </div>
        
        <div className="flex mt-2 text-xs gap-2">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-trading-bullish mr-1" />
            <span>Best: +{formatCurrency(metrics.largestWin)}</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-trading-bearish mr-1" />
            <span>Worst: {formatCurrency(metrics.largestLoss)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;

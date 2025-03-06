
import React from 'react';
import { LineChart, ChevronUp, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="glass-card rounded-xl py-4 px-6 mb-6 animate-slide-in-bottom">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-trading-accent/20 p-2 rounded-full">
            <LineChart className="h-6 w-6 text-trading-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI Trading Visualizer</h1>
            <p className="text-sm text-trading-muted">Backtest Analysis Tool</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium">S&P 500</span>
              <span className="text-xs text-trading-bullish flex items-center">
                <ChevronUp className="h-3 w-3" />
                1.2%
              </span>
            </div>
            <span className="text-xs text-trading-muted">4,183.85</span>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium">NASDAQ</span>
              <span className="text-xs text-trading-bearish flex items-center">
                <ChevronDown className="h-3 w-3" />
                0.5%
              </span>
            </div>
            <span className="text-xs text-trading-muted">13,105.20</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

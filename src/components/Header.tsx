
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
            <h1 className="text-xl font-bold tracking-tight">Creda Capital - Backtest Interface</h1>
            <p className="text-sm text-trading-muted">Backtest Analysis Tool</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

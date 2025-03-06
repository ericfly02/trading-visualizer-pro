import React, { useRef, useEffect, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { BacktestData } from '@/lib/types';
import { getBalanceHistory, formatCurrency } from '@/lib/utils/dataUtils';

interface BalanceChartProps {
  data: BacktestData;
  currentIndex: number;
}

const BalanceChart: React.FC<BalanceChartProps> = ({ data, currentIndex }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<any | null>(null);
  const [series, setSeries] = useState<any | null>(null);
  const [balanceData, setBalanceData] = useState<any[]>([]);
  const [currentBalance, setCurrentBalance] = useState<number>(data.starting_balance);
  const [profitLoss, setProfitLoss] = useState<number>(0);
  
  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    const chartOptions = {
      layout: {
        background: { type: ColorType.Solid, color: 'rgba(13, 17, 23, 0)' },
        textColor: '#C9D1D9',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: 'rgba(42, 46, 57, 0.2)' },
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.1)',
        visible: false,
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.1)',
      },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: true, labelVisible: true },
      },
    };
    
    const newChart = createChart(chartContainerRef.current, {
      ...chartOptions,
      width: chartContainerRef.current.clientWidth,
      height: 150,
    });
    
    // For lightweight-charts v5+, we need to use addSeries with appropriate parameters
    const lineSeries = newChart.addSeries({
      type: 'Area', // Capitalized 'Area' instead of 'area'
      color: '#58A6FF', // Use 'color' instead of 'lineColor'
      topColor: 'rgba(88, 166, 255, 0.4)',
      bottomColor: 'rgba(88, 166, 255, 0.1)',
      lineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    
    setChart(newChart);
    setSeries(lineSeries);
    
    // Handle resize
    const handleResize = () => {
      if (newChart && chartContainerRef.current) {
        newChart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (newChart) {
        newChart.remove();
      }
    };
  }, []);
  
  // Process data
  useEffect(() => {
    if (!data) return;
    
    const balanceHistory = getBalanceHistory(data);
    
    // Convert to the format expected by lightweight-charts
    const formattedData = balanceHistory.map(item => ({
      time: new Date(item.time).getTime() / 1000,
      value: item.balance,
    }));
    
    setBalanceData(formattedData);
    
    if (series) {
      series.setData(formattedData);
    }
  }, [data, series]);
  
  // Update current balance based on index
  useEffect(() => {
    if (!data || !data.trade_history || !data.ohlc_history || currentIndex < 0) {
      setCurrentBalance(data?.starting_balance || 0);
      setProfitLoss(0);
      return;
    }
    
    // Find the most recent trade that would have executed by this point
    const tradesExecuted = data.trade_history.filter((trade, i) => {
      const tradeCloseTime = new Date(trade.close_time).getTime();
      
      if (currentIndex >= data.ohlc_history.length) return true;
      
      const currentCandleTime = new Date(data.ohlc_history[currentIndex].time).getTime();
      return tradeCloseTime <= currentCandleTime;
    });
    
    if (tradesExecuted.length > 0) {
      const latestTrade = tradesExecuted[tradesExecuted.length - 1];
      setCurrentBalance(latestTrade.balance);
      setProfitLoss(latestTrade.balance - data.starting_balance);
    } else {
      setCurrentBalance(data.starting_balance);
      setProfitLoss(0);
    }
  }, [data, currentIndex]);
  
  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in-up">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium">Account Balance</h3>
        <div className="flex space-x-4">
          <div>
            <span className="text-xs text-trading-muted block">Current</span>
            <span className="text-sm font-semibold animate-number-count">
              {formatCurrency(currentBalance)}
            </span>
          </div>
          <div>
            <span className="text-xs text-trading-muted block">P/L</span>
            <span className={`text-sm font-semibold ${profitLoss >= 0 ? 'text-trading-bullish' : 'text-trading-bearish'} animate-number-count`}>
              {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
            </span>
          </div>
        </div>
      </div>
      
      <div ref={chartContainerRef} className="h-[150px] w-full" />
    </div>
  );
};

export default BalanceChart;

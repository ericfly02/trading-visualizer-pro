
import React, { useState } from 'react';
import { toast } from 'sonner';
import FileUpload from '@/components/FileUpload';
import CandlestickChart from '@/components/CandlestickChart';
import BalanceChart from '@/components/BalanceChart';
import MetricsDashboard from '@/components/MetricsDashboard';
import PlaybackControls from '@/components/PlaybackControls';
import Header from '@/components/Header';
import { BacktestData } from '@/lib/types';

const Index = () => {
  const [backtestData, setBacktestData] = useState<BacktestData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDataLoaded = (data: BacktestData) => {
    setBacktestData(data);
    setCurrentIndex(0);
    setIsPlaying(false);
    toast.success('Backtest data loaded successfully', {
      description: `${data.symbol} - ${data.ohlc_history.length} candles and ${data.trade_history.length} trades`
    });
  };

  return (
    <div className="min-h-screen bg-trading-background overflow-auto pb-6">
      <div className="container mx-auto px-4 pt-6">
        <Header />
        
        {!backtestData ? (
          <div className="py-16">
            <FileUpload onDataLoaded={handleDataLoaded} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <CandlestickChart 
                data={backtestData} 
                currentIndex={currentIndex} 
                isPlaying={isPlaying} 
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <BalanceChart data={backtestData} currentIndex={currentIndex} />
            </div>
            
            <MetricsDashboard data={backtestData} />
            
            <PlaybackControls 
              data={backtestData}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

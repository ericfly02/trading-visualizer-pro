
import React, { useRef, useEffect, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { CandlestickData, Trade, BacktestData } from '@/lib/types';
import { extractCandlestickData, detectTimeframe } from '@/lib/utils/dataUtils';
import { Tooltip } from 'react-tooltip';

interface CandlestickChartProps {
  data: BacktestData;
  currentIndex: number;
  isPlaying: boolean;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, currentIndex, isPlaying }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<any | null>(null);
  const [series, setSeries] = useState<any | null>(null);
  const [candleData, setCandleData] = useState<CandlestickData[]>([]);
  const [timeframe, setTimeframe] = useState<string>('');
  
  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    const chartOptions = {
      layout: {
        background: { type: ColorType.Solid, color: 'rgba(13, 17, 23, 0)' },
        textColor: '#C9D1D9',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.2)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.2)' },
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#58A6FF',
          style: 0, // Use numeric value instead of LineStyle enum
          visible: true,
          labelVisible: true,
        },
        horzLine: {
          color: '#58A6FF',
          style: 0, // Use numeric value instead of LineStyle enum
          visible: true,
          labelVisible: true,
        },
      },
      localization: {
        priceFormatter: (price: number) => price.toFixed(2),
      },
    };
    
    const newChart = createChart(chartContainerRef.current, {
      ...chartOptions,
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });
    
    // For lightweight-charts v5+, we need to use addSeries with appropriate parameters
    const candleSeries = newChart.addSeries({
      type: 'candlestick',
      upColor: '#25C685',
      downColor: '#EF5350',
      borderVisible: false,
      wickUpColor: '#25C685',
      wickDownColor: '#EF5350',
    });
    
    setChart(newChart);
    setSeries(candleSeries);
    
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
    if (!data || !data.ohlc_history || !data.ohlc_history.length) return;
    
    const candles = extractCandlestickData(data.ohlc_history);
    
    // Ensure time is in the correct format (unix timestamp in seconds)
    const formattedCandles = candles.map(candle => ({
      ...candle,
      time: Math.floor(new Date(candle.time).getTime() / 1000)
    }));
    
    setCandleData(formattedCandles);
    
    const tf = detectTimeframe(data.ohlc_history);
    setTimeframe(tf);
    
    if (series) {
      series.setData(formattedCandles);
    }
  }, [data, series]);
  
  // Update visible range based on current index
  useEffect(() => {
    if (!chart || !candleData.length || currentIndex <= 0) return;
    
    const visibleRange = 50; // Number of candles visible at once
    const startIndex = Math.max(0, currentIndex - visibleRange / 2);
    const endIndex = Math.min(candleData.length - 1, currentIndex + visibleRange / 2);
    
    if (startIndex <= endIndex) {
      chart.timeScale().setVisibleRange({
        from: candleData[startIndex].time,
        to: candleData[endIndex].time,
      });
    }
  }, [chart, candleData, currentIndex]);
  
  // Render trade markers on chart
  const renderTradeMarkers = () => {
    if (!data || !data.trade_history) return null;
    
    const visibleTrades = data.trade_history.filter(trade => {
      const openTime = new Date(trade.open_time).getTime() / 1000;
      
      // Show trades that have opened by the current index
      if (currentIndex < 0 || currentIndex >= candleData.length) return false;
      const currentTime = candleData[currentIndex].time;
      
      return openTime <= currentTime;
    });
    
    return (
      <>
        {visibleTrades.map((trade, index) => {
          const openTimeIndex = candleData.findIndex(
            candle => Math.abs(candle.time - new Date(trade.open_time).getTime() / 1000) < 60
          );
          
          const closeTimeIndex = candleData.findIndex(
            candle => Math.abs(candle.time - new Date(trade.close_time).getTime() / 1000) < 60
          );
          
          // Only render entry markers for now (trade markers would be added in a full implementation)
          if (openTimeIndex >= 0 && openTimeIndex <= currentIndex) {
            return (
              <div 
                key={`marker-entry-${index}`}
                className={`absolute z-10 ${trade.order_type === 'buy' ? 'trade-marker-bullish' : 'trade-marker-bearish'}`}
                style={{
                  bottom: '20px',
                  left: `${(openTimeIndex / candleData.length) * 100}%`,
                }}
              >
                <div className="w-2 h-2 rounded-full animate-pulse-glow" />
              </div>
            );
          }
          
          return null;
        })}
      </>
    );
  };

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in-up">
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-xs px-2 py-1 bg-trading-accent/10 rounded-full text-trading-accent">
            {data.symbol}
          </span>
          <span className="ml-2 text-xs px-2 py-1 bg-trading-muted/10 rounded-full text-trading-muted">
            {timeframe}
          </span>
        </div>
        <div className="text-sm text-trading-muted">
          {currentIndex >= 0 && currentIndex < candleData.length && (
            <span>
              {new Date(candleData[currentIndex].time * 1000).toLocaleDateString()} 
              {' '}
              {new Date(candleData[currentIndex].time * 1000).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
      
      <div className="relative">
        <div ref={chartContainerRef} className="h-[400px] w-full" />
        {renderTradeMarkers()}
      </div>
      
      <Tooltip id="trade-tooltip" className="z-50" />
    </div>
  );
};

export default CandlestickChart;

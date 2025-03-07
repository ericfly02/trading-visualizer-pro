import React, { useRef, useEffect, useState } from 'react';
import { createChart, type IChartApi, type ISeriesApi, type CandlestickSeriesOptions } from 'lightweight-charts';
import { type CandlestickData, type Trade, type BacktestData } from '@/lib/types';
import { extractCandlestickData, detectTimeframe } from '@/lib/utils/dataUtils';
import { Tooltip } from 'react-tooltip';

interface CandlestickChartProps {
  data: BacktestData;
  currentIndex: number;
  isPlaying: boolean;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, currentIndex, isPlaying }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [candleData, setCandleData] = useState<CandlestickData[]>([]);
  const [timeframe, setTimeframe] = useState<string>('');

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: 'solid', color: 'rgba(13, 17, 23, 0)' },
        textColor: '#C9D1D9',
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#25C685',
      downColor: '#EF5350',
      borderVisible: false,
      wickUpColor: '#25C685',
      wickDownColor: '#EF5350',
    } as CandlestickSeriesOptions);

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth || 800 });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Process and update data
  useEffect(() => {
    if (!data?.ohlc_history?.length || !seriesRef.current) return;

    const processedData = data.ohlc_history.map(ohlc => ({
      time: new Date(ohlc.time).getTime() / 1000, // Unix timestamp in seconds
      open: ohlc.etf_open,
      high: ohlc.etf_high,
      low: ohlc.etf_low,
      close: ohlc.etf_close,
    }));

    setCandleData(processedData);
    seriesRef.current.setData(processedData);
    setTimeframe(detectTimeframe(data.ohlc_history));
  }, [data]);

  // Update visible range
  useEffect(() => {
    if (!chartRef.current || !candleData.length || currentIndex < 0) return;

    const visibleCandles = 100;
    const startIndex = Math.max(0, currentIndex - visibleCandles);
    const endIndex = Math.min(candleData.length - 1, currentIndex + 10);

    chartRef.current.timeScale().setVisibleRange({
      from: candleData[startIndex].time as number,
      to: candleData[endIndex].time as number,
    });
  }, [currentIndex, candleData]);

  // Render optimization
  const visibleTrades = React.useMemo(() => {
    return data?.trade_history?.filter(trade => {
      const openTime = new Date(trade.open_time).getTime() / 1000;
      return currentIndex >= 0 && 
             candleData[currentIndex]?.time && 
             openTime <= candleData[currentIndex].time;
    }) || [];
  }, [data, currentIndex, candleData]);

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in-up">
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-xs px-2 py-1 bg-trading-accent/10 rounded-full text-trading-accent">
            {data.symbol || 'Unknown'}
          </span>
          <span className="ml-2 text-xs px-2 py-1 bg-trading-muted/10 rounded-full text-trading-muted">
            {timeframe || 'Unknown'}
          </span>
        </div>
        <div className="text-sm text-trading-muted">
          {candleData[currentIndex]?.time && 
            new Date(candleData[currentIndex].time * 1000).toLocaleString()}
        </div>
      </div>
      
      <div className="relative h-[400px] w-full" ref={chartContainerRef} />
      
      <Tooltip id="trade-tooltip" className="z-50" />
    </div>
  );
};

export default CandlestickChart;
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { createChart, type IChartApi, type ISeriesApi, type CandlestickSeriesOptions, type SeriesMarker } from 'lightweight-charts';
import { type CandlestickData, type Trade, type BacktestData } from '@/lib/types';
import { extractCandlestickData, detectTimeframe } from '@/lib/utils/dataUtils';
import { LineStyle } from 'lightweight-charts';

interface CandlestickChartProps {
  data: BacktestData;
  currentIndex: number;
  isPlaying: boolean;
}

// Add binary search utility function
const findNearestIndex = (sortedTimes: number[], target: number): number => {
  let low = 0;
  let high = sortedTimes.length - 1;
  let mid = 0;

  while (low <= high) {
    mid = Math.floor((low + high) / 2);
    if (sortedTimes[mid] === target) return mid;
    else if (sortedTimes[mid] < target) low = mid + 1;
    else high = mid - 1;
  }

  if (high < 0) return 0;
  if (low >= sortedTimes.length) return sortedTimes.length - 1;
  
  const diffHigh = target - sortedTimes[high];
  const diffLow = sortedTimes[low] - target;
  return diffHigh <= diffLow ? high : low;
};

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, currentIndex, isPlaying }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Line'>[]>([]);
  const [candleData, setCandleData] = useState<CandlestickData[]>([]);
  const [timeframe, setTimeframe] = useState<string>('');
  const [processedTrades, setProcessedTrades] = useState<Array<Trade & { openIndex: number; closeIndex: number }>>([]);

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

    lineSeriesRef.current.forEach(series => chartRef.current?.removeSeries(series));
    lineSeriesRef.current = [];

    const formattedData = data.ohlc_history.map(ohlc => ({
      // Parse time as UTC
      time: Date.parse(ohlc.time + 'Z') / 1000,
      open: ohlc.etf_open,
      high: ohlc.etf_high,
      low: ohlc.etf_low,
      close: ohlc.etf_close,
    }));

    const sortedTimes = formattedData.map(d => d.time);
    
    // Process trades with nearest indices
    const tradesWithIndices = data.trade_history.map(trade => {
      // Parse trade times as UTC
      const openTime = Date.parse(trade.open_time + 'Z') / 1000;
      const closeTime = Date.parse(trade.close_time + 'Z') / 1000;

      return {
        ...trade,
        openIndex: findNearestIndex(sortedTimes, openTime),
        closeIndex: findNearestIndex(sortedTimes, closeTime),
      };
    }).filter(t => t.openIndex !== -1 && t.closeIndex !== -1);

    // Add trend lines for each trade
    tradesWithIndices.forEach(trade => {
      if (!chartRef.current) return;

      const isLong = trade.order_type === 'buy';
      const isProfitable = trade.profit_net >= 0;
      
      const lineSeries = chartRef.current.addLineSeries({
        color: isProfitable ? '#25C685' : '#EF5350',
        lineWidth: 1,
        lineStyle: isLong ? LineStyle.Solid : LineStyle.Dashed,
        crosshairMarkerVisible: false,
      });

      // Add these guards before setting line data
      const openCandle = formattedData[trade.openIndex];
      const closeCandle = formattedData[trade.closeIndex];
      if (!openCandle || !closeCandle) return;

      lineSeries.setData([
        { 
          time: openCandle.time,
          value: trade.open_price
        },
        { 
          time: closeCandle.time,
          value: trade.close_price
        }
      ]);

      lineSeriesRef.current.push(lineSeries);
    });

    setProcessedTrades(tradesWithIndices);
    setCandleData(formattedData);
    seriesRef.current.setData(formattedData);
    setTimeframe(detectTimeframe(data.ohlc_history));
  }, [data]);

  // Update visible range and markers
  useEffect(() => {
    if (!chartRef.current || !seriesRef.current || !candleData.length) return;

    // Update visible range
    const visibleCandles = 100;
    const startIndex = Math.max(0, currentIndex - visibleCandles);
    const endIndex = Math.min(candleData.length - 1, currentIndex + 10);
    chartRef.current.timeScale().setVisibleRange({
      from: candleData[startIndex].time,
      to: candleData[endIndex].time,
    });

    // Update trade markers
    const visibleMarkers = processedTrades
      .filter(trade => trade.openIndex <= currentIndex)
      .flatMap(trade => {
        // Keep time as UNIX timestamp (number)
        const entryMarker: SeriesMarker<number> = {
          time: candleData[trade.openIndex].time, // Already in correct format
          position: 'belowBar',
          color: trade.order_type === 'buy' ? '#25C685' : '#EF5350',
          shape: 'circle',
          text: `${trade.order_type.toUpperCase()} ${trade.volume} @ ${trade.open_price}`,
        };

        const exitMarker: SeriesMarker<number> = {
          time: candleData[trade.closeIndex].time, // Already in correct format
          position: 'aboveBar',
          color: trade.profit_net >= 0 ? '#25C685' : '#EF5350',
          shape: trade.profit_net >= 0 ? 'arrowUp' : 'arrowDown',
          text: `Closed ${trade.profit_net >= 0 ? 'Profit' : 'Loss'}: ${trade.profit_net.toFixed(2)}`,
        };

        return [entryMarker, exitMarker];
      });

    // Remove the time conversion mapping
    seriesRef.current.setMarkers(visibleMarkers);

  }, [currentIndex, candleData, processedTrades]);

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
    </div>
  );
};

export default CandlestickChart;
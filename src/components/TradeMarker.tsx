
import React from 'react';
import { Triangle } from 'lucide-react';
import { TradeMarkerProps } from '@/lib/types';
import { formatTradeTooltip } from '@/lib/utils/chartUtils';

const TradeMarker: React.FC<TradeMarkerProps> = ({ trade, position, type }) => {
  const isBuy = trade.order_type === 'buy';
  const isEntryPoint = type === 'entry';
  
  // Entry point: Triangle up for buy, Triangle down for sell
  // Exit point: Triangle down for buy (closing buy = sell), Triangle up for sell (closing sell = buy)
  const isPointingUp = (isBuy && isEntryPoint) || (!isBuy && !isEntryPoint);
  
  // For entry: green for buy, red for sell
  // For exit: red for buy (closing), green for sell (closing)
  const isProfitable = trade.profit_net > 0;
  const markerClass = isPointingUp ? 'trade-marker-bullish' : 'trade-marker-bearish';
  
  return (
    <div 
      className="absolute transition-transform duration-300 ease-out animate-pulse-glow z-10"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: `translate(-50%, ${isPointingUp ? '50%' : '-150%'}) rotate(${isPointingUp ? '0' : '180'}deg)`
      }}
      data-tooltip-id="trade-tooltip"
      data-tooltip-html={formatTradeTooltip(trade)}
    >
    <Triangle 
      className={`w-6 h-6 ${markerClass}`}
      fill={isPointingUp ? 'currentColor' : 'currentColor'}
      strokeWidth={1.5}
    />
    </div>
  );
};

export default TradeMarker;

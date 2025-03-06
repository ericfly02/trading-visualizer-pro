
import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { BacktestData } from '@/lib/types';

interface PlaybackControlsProps {
  data: BacktestData;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  data,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying
}) => {
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const maxIndex = data.ohlc_history.length - 1;
  
  // Handle auto playback
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next > maxIndex) {
          setIsPlaying(false);
          return maxIndex;
        }
        return next;
      });
    }, 1000 / playbackSpeed);
    
    return () => clearInterval(timer);
  }, [isPlaying, maxIndex, playbackSpeed, setCurrentIndex, setIsPlaying]);
  
  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };
  
  const handleForward = () => {
    setCurrentIndex(Math.min(currentIndex + 1, maxIndex));
  };
  
  const handleBackward = () => {
    setCurrentIndex(Math.max(currentIndex - 1, 0));
  };
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setCurrentIndex(value);
  };
  
  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlaybackSpeed(Number(e.target.value));
  };
  
  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleReset}
            className="bg-trading-muted/20 hover:bg-trading-muted/30 p-2 rounded-full transition-colors"
            aria-label="Reset"
          >
            <SkipBack className="h-5 w-5" />
          </button>
          
          <button 
            onClick={handleBackward}
            className="bg-trading-muted/20 hover:bg-trading-muted/30 p-2 rounded-full transition-colors"
            aria-label="Step backward"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          
          <button 
            onClick={handlePlay}
            className="bg-trading-accent/20 hover:bg-trading-accent/30 p-3 rounded-full transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          
          <button 
            onClick={handleForward}
            className="bg-trading-muted/20 hover:bg-trading-muted/30 p-2 rounded-full transition-colors"
            aria-label="Step forward"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
        
        <div className="w-full max-w-md mx-4">
          <input
            type="range"
            min="0"
            max={maxIndex}
            value={currentIndex}
            onChange={handleSliderChange}
            className="w-full h-2 bg-trading-muted/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-trading-muted">Speed:</span>
          <select 
            value={playbackSpeed} 
            onChange={handleSpeedChange}
            className="bg-trading-muted/20 rounded p-1 text-xs"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="2">2x</option>
            <option value="5">5x</option>
            <option value="10">10x</option>
          </select>
        </div>
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-trading-muted">
        <span>{currentIndex === 0 ? 'Start' : new Date(data.ohlc_history[0].time).toLocaleDateString()}</span>
        <span>{Math.round((currentIndex / maxIndex) * 100)}%</span>
        <span>{new Date(data.ohlc_history[maxIndex].time).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default PlaybackControls;

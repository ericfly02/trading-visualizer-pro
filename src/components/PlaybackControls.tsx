
import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, ChevronRight, ChevronLeft, 
  FastForward, Rewind, Settings 
} from 'lucide-react';
import { BacktestData } from '@/lib/types';

interface PlaybackControlsProps {
  data: BacktestData;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  data,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying,
}) => {
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  
  const totalCandles = data?.ohlc_history?.length || 0;
  
  // Handle playback
  useEffect(() => {
    if (!isPlaying || totalCandles === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        // Stop at the end
        if (prev >= totalCandles - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);
    
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalCandles, setCurrentIndex, setIsPlaying]);
  
  // Progress percentage
  const progressPercentage = totalCandles > 0 
    ? (currentIndex / (totalCandles - 1)) * 100 
    : 0;
  
  // Format current time from OHLC data
  const currentTime = data?.ohlc_history?.[currentIndex]?.time 
    ? new Date(data.ohlc_history[currentIndex].time).toLocaleTimeString() 
    : '--:--:--';
  
  const handleTogglePlay = () => setIsPlaying(!isPlaying);
  
  const handleSkipBack = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };
  
  const handleSkipForward = () => {
    setCurrentIndex(totalCandles - 1);
    setIsPlaying(false);
  };
  
  const handleStepBack = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
    setIsPlaying(false);
  };
  
  const handleStepForward = () => {
    setCurrentIndex(Math.min(totalCandles - 1, currentIndex + 1));
    setIsPlaying(false);
  };
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (totalCandles === 0) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const position = e.clientX - rect.left;
    const percentage = position / rect.width;
    const newIndex = Math.round(percentage * (totalCandles - 1));
    
    setCurrentIndex(Math.max(0, Math.min(newIndex, totalCandles - 1)));
    setIsPlaying(false);
  };
  
  const playbackSpeedOptions = [0.5, 1, 2, 5, 10];
  
  return (
    <div className="glass-card rounded-xl p-4 animate-slide-in-bottom">
      {/* Progress bar */}
      <div 
        className="w-full h-2 bg-trading-card rounded-full mb-4 cursor-pointer relative"
        onClick={handleProgressClick}
      >
        <div 
          className="absolute h-full bg-trading-accent rounded-full transition-all duration-100"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center">
        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleSkipBack}
            className="p-2 text-trading-muted hover:text-trading-text transition-colors"
            aria-label="Skip to start"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          
          <button 
            onClick={handleStepBack}
            className="p-2 text-trading-muted hover:text-trading-text transition-colors"
            aria-label="Previous candle"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button 
            onClick={handleTogglePlay}
            className="p-2 rounded-full bg-trading-accent text-black hover:bg-trading-accent/90 transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
          
          <button 
            onClick={handleStepForward}
            className="p-2 text-trading-muted hover:text-trading-text transition-colors"
            aria-label="Next candle"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          <button 
            onClick={handleSkipForward}
            className="p-2 text-trading-muted hover:text-trading-text transition-colors"
            aria-label="Skip to end"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
        
        {/* Display current time */}
        <div className="text-sm text-trading-muted">
          {currentIndex + 1} / {totalCandles} | {currentTime}
        </div>
        
        {/* Playback speed */}
        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-trading-muted hover:text-trading-text transition-colors"
            aria-label="Playback settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          
          {showSettings && (
            <div className="absolute bottom-full right-0 mb-2 glass-card rounded-lg p-3 shadow-lg z-20 animate-fade-in-up">
              <div className="text-xs mb-2 text-trading-muted">Playback Speed</div>
              <div className="flex space-x-1">
                {playbackSpeedOptions.map(speed => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-1 text-xs rounded ${
                      playbackSpeed === speed 
                        ? 'bg-trading-accent text-black' 
                        : 'bg-trading-card hover:bg-trading-card/80'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaybackControls;


import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileJson, AlertCircle } from 'lucide-react';
import { validateBacktestData } from '@/lib/utils/dataUtils';
import { BacktestData } from '@/lib/types';

interface FileUploadProps {
  onDataLoaded: (data: BacktestData) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          throw new Error('Failed to read file');
        }

        const parsedData = JSON.parse(result);
        if (!validateBacktestData(parsedData)) {
          throw new Error('Invalid backtest data format');
        }

        onDataLoaded(parsedData);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse file');
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
      setIsLoading(false);
    };

    reader.readAsText(file);
  }, [onDataLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    maxFiles: 1
  });

  return (
    <div 
      {...getRootProps()} 
      className={`glass-card rounded-xl p-8 w-full max-w-xl mx-auto transition-all duration-300 ${
        isDragActive ? 'bg-trading-accent/10 border-trading-accent' : ''
      } animate-scale-in`}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center justify-center text-center">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-trading-accent border-t-transparent rounded-full animate-spin mb-4" />
            <p>Processing file...</p>
          </div>
        ) : (
          <>
            <div className="bg-trading-accent/10 p-4 rounded-full mb-6">
              {error ? (
                <AlertCircle className="h-12 w-12 text-trading-bearish animate-pulse" />
              ) : (
                <Upload className="h-12 w-12 text-trading-accent" />
              )}
            </div>
            
            <h3 className="text-2xl font-semibold mb-2">Upload Backtest Data</h3>
            <p className="text-trading-muted mb-4">
              Drag and drop your JSON backtest file or click to browse
            </p>
            
            {error && (
              <div className="text-trading-bearish bg-trading-bearish/10 p-3 rounded-md mt-4 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="flex items-center justify-center mt-4">
              <FileJson className="h-5 w-5 mr-2 text-trading-muted" />
              <span className="text-sm text-trading-muted">JSON format required</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;

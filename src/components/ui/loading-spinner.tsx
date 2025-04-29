
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

const LoadingSpinner = ({ size = 12, className = "" }: LoadingSpinnerProps) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`h-${size} w-${size} animate-spin text-medical-600`} />
    </div>
  );
};

export default LoadingSpinner;

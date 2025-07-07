
import React from 'react';

interface HealthIndicatorProps {
  health: 'green' | 'yellow' | 'red';
  score: number;
  className?: string;
}

const HealthIndicator: React.FC<HealthIndicatorProps> = ({ health, score, className }) => {
  const getHealthColor = () => {
    switch (health) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-muted';
    }
  };

  const getHealthText = () => {
    switch (health) {
      case 'green':
        return 'Healthy';
      case 'yellow':
        return 'At Risk';
      case 'red':
        return 'Critical';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`h-3 w-3 rounded-full ${getHealthColor()}`}></div>
      <span className="text-xs font-medium text-muted-foreground">
        {getHealthText()} ({score}%)
      </span>
    </div>
  );
};

export default HealthIndicator;

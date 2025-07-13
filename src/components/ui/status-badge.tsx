
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status?: 'active' | 'inactive' | 'pending';
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'error' | 'info';
  children?: React.ReactNode;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant, children, className }) => {
  const getStatusColor = () => {
    if (status) {
      switch (status) {
        case 'active':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'inactive':
          return 'bg-gray-100 text-gray-800 border-gray-200';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
    
    // Fallback for variant-based styling
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const displayText = children || status;

  return (
    <Badge 
      variant="outline" 
      className={cn(getStatusColor(), className)}
    >
      {displayText}
    </Badge>
  );
};

export { StatusBadge };

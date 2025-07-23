
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getStatusColors } from '@/utils/darkModeColors';

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
          const activeColors = getStatusColors('success');
          return `${activeColors.bg} ${activeColors.text} ${activeColors.border}`;
        case 'inactive':
          const inactiveColors = getStatusColors('neutral');
          return `${inactiveColors.bg} ${inactiveColors.text} ${inactiveColors.border}`;
        case 'pending':
          const pendingColors = getStatusColors('warning');
          return `${pendingColors.bg} ${pendingColors.text} ${pendingColors.border}`;
        default:
          const defaultColors = getStatusColors('neutral');
          return `${defaultColors.bg} ${defaultColors.text} ${defaultColors.border}`;
      }
    }
    
    // Fallback for variant-based styling
    switch (variant) {
      case 'success':
        const successColors = getStatusColors('success');
        return `${successColors.bg} ${successColors.text} ${successColors.border}`;
      case 'warning':
        const warningColors = getStatusColors('warning');
        return `${warningColors.bg} ${warningColors.text} ${warningColors.border}`;
      case 'error':
        const errorColors = getStatusColors('error');
        return `${errorColors.bg} ${errorColors.text} ${errorColors.border}`;
      case 'info':
        const infoColors = getStatusColors('info');
        return `${infoColors.bg} ${infoColors.text} ${infoColors.border}`;
      default:
        const neutralColors = getStatusColors('neutral');
        return `${neutralColors.bg} ${neutralColors.text} ${neutralColors.border}`;
    }
  };

  const displayText = children || status;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        getStatusColor(), 
        'text-xs font-medium border transition-colors',
        className
      )}
    >
      {displayText}
    </Badge>
  );
};

export { StatusBadge };


import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getStatusColors } from '@/utils/darkModeColors';

interface DarkModeBadgeProps {
  status?: 'active' | 'inactive' | 'pending' | 'completed' | 'overdue';
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

const DarkModeBadge: React.FC<DarkModeBadgeProps> = ({ 
  status, 
  variant, 
  children, 
  className,
  compact = false 
}) => {
  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'success';
      case 'inactive':
        return 'neutral';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const statusVariant = variant || (status ? getStatusVariant(status) : 'neutral');
  const colors = getStatusColors(statusVariant);
  
  const displayText = children || status;
  const padding = compact ? 'px-2 py-0.5' : 'px-2.5 py-0.5';

  return (
    <Badge 
      variant="outline" 
      className={cn(
        colors.bg,
        colors.text,
        colors.border,
        padding,
        'text-xs font-medium border transition-colors',
        className
      )}
    >
      {displayText}
    </Badge>
  );
};

export { DarkModeBadge };

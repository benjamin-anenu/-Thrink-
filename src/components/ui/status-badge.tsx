
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'default';
  children: React.ReactNode;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ variant, children, className }) => {
  const variantClasses = {
    success: 'bg-success-muted text-success-muted-foreground border-success/20',
    warning: 'bg-warning-muted text-warning-muted-foreground border-warning/20',
    error: 'bg-error-muted text-error-muted-foreground border-error/20',
    info: 'bg-info-muted text-info-muted-foreground border-info/20',
    default: 'bg-muted text-muted-foreground border-border'
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(variantClasses[variant], className)}
    >
      {children}
    </Badge>
  );
};

export { StatusBadge };

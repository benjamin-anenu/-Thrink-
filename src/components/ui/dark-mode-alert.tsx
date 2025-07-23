
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { getAlertColors } from '@/utils/darkModeColors';
import { AlertTriangle, Clock, CheckCircle, Info } from 'lucide-react';

interface DarkModeAlertProps {
  type: 'overdue' | 'pending' | 'completed' | 'info';
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

const DarkModeAlert: React.FC<DarkModeAlertProps> = ({
  type,
  title,
  description,
  children,
  className,
  compact = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const alertType = type === 'info' ? type : 'overdue';
  const colors = type === 'info' 
    ? { bg: 'bg-blue-900/20', text: 'text-blue-200', border: 'border-blue-700/30' }
    : getAlertColors(alertType as 'overdue' | 'pending' | 'completed');

  const padding = compact ? 'p-3' : 'p-4';

  return (
    <Alert 
      className={cn(
        colors.bg,
        colors.border,
        padding,
        'border transition-colors',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex-shrink-0 mt-0.5', colors.text)}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <AlertTitle className={cn('text-sm font-medium mb-1', colors.text)}>
              {title}
            </AlertTitle>
          )}
          {description && (
            <AlertDescription className={cn('text-sm', colors.text, 'opacity-90')}>
              {description}
            </AlertDescription>
          )}
          {children && (
            <div className={cn('text-sm', colors.text, 'opacity-90')}>
              {children}
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
};

export { DarkModeAlert };

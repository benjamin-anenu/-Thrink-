
import React from 'react';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Clock, Info } from 'lucide-react';

interface ThemeIndicatorProps {
  type: 'health' | 'status' | 'priority' | 'progress';
  value: string | number;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ThemeIndicator: React.FC<ThemeIndicatorProps> = ({
  type,
  value,
  variant,
  showIcon = true,
  size = 'md',
  className
}) => {
  const getAutoVariant = (): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    if (variant) return variant;
    
    if (type === 'health') {
      const numValue = typeof value === 'number' ? value : parseInt(value as string);
      if (numValue >= 80) return 'success';
      if (numValue >= 60) return 'warning';
      return 'error';
    }
    
    if (type === 'priority') {
      const strValue = value.toString().toLowerCase();
      if (strValue.includes('high') || strValue.includes('critical')) return 'error';
      if (strValue.includes('medium')) return 'warning';
      if (strValue.includes('low')) return 'success';
    }
    
    if (type === 'status') {
      const strValue = value.toString().toLowerCase();
      if (strValue.includes('completed') || strValue.includes('success')) return 'success';
      if (strValue.includes('progress') || strValue.includes('active')) return 'info';
      if (strValue.includes('warning') || strValue.includes('hold')) return 'warning';
      if (strValue.includes('error') || strValue.includes('failed')) return 'error';
    }
    
    return 'default';
  };

  const getIcon = () => {
    if (!showIcon) return null;
    
    const iconVariant = getAutoVariant();
    const iconClass = cn(
      size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
    );
    
    switch (iconVariant) {
      case 'success': return <CheckCircle className={iconClass} />;
      case 'warning': return <AlertTriangle className={iconClass} />;
      case 'error': return <AlertTriangle className={iconClass} />;
      case 'info': return <Info className={iconClass} />;
      default: return <Clock className={iconClass} />;
    }
  };

  const formatValue = () => {
    if (type === 'health' && typeof value === 'number') {
      return `${value}/100`;
    }
    if (type === 'progress' && typeof value === 'number') {
      return `${value}%`;
    }
    return value.toString();
  };

  return (
    <StatusBadge 
      variant={getAutoVariant()} 
      className={cn(
        'flex items-center gap-1',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 
        size === 'lg' ? 'text-base px-3 py-1' : 
        'text-sm px-2.5 py-0.5',
        className
      )}
    >
      {getIcon()}
      {formatValue()}
    </StatusBadge>
  );
};

export { ThemeIndicator };

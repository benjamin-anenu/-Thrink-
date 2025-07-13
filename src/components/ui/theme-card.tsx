
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ThemeCardProps {
  variant?: 'default' | 'surface' | 'elevated' | 'glass';
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ 
  variant = 'default', 
  children, 
  className,
  hover = true 
}) => {
  const variantClasses = {
    default: 'bg-card border-border',
    surface: 'bg-surface border-border',
    elevated: 'bg-card border-border shadow-elevated',
    glass: 'bg-card/60 backdrop-blur-xl border-border/10 shadow-premium'
  };

  const hoverClasses = hover 
    ? 'transition-all duration-200 hover:shadow-lg hover:bg-surface-hover' 
    : '';

  return (
    <Card className={cn(variantClasses[variant], hoverClasses, className)}>
      {children}
    </Card>
  );
};

const ThemeCardHeader: React.FC<React.ComponentProps<typeof CardHeader>> = ({ 
  className, 
  ...props 
}) => (
  <CardHeader className={cn("border-b border-border/50", className)} {...props} />
);

const ThemeCardContent: React.FC<React.ComponentProps<typeof CardContent>> = ({ 
  className, 
  ...props 
}) => (
  <CardContent className={cn("text-foreground", className)} {...props} />
);

export { ThemeCard, ThemeCardHeader, ThemeCardContent };


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { darkModeColors } from '@/utils/darkModeColors';

interface DarkModeCardProps {
  variant?: 'surface' | 'elevated' | 'glass';
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  compact?: boolean;
}

const DarkModeCard: React.FC<DarkModeCardProps> = ({ 
  variant = 'surface', 
  children, 
  className,
  hover = true,
  compact = false 
}) => {
  const variantClasses = {
    surface: cn(darkModeColors.card.surface, darkModeColors.card.border),
    elevated: cn(darkModeColors.card.elevated, darkModeColors.card.border, 'shadow-lg'),
    glass: cn(darkModeColors.card.glass, darkModeColors.card.border)
  };

  const hoverClasses = hover 
    ? 'transition-all duration-200 hover:shadow-lg hover:bg-zinc-800/70' 
    : '';

  const paddingClasses = compact ? '[&_.card-header]:p-4 [&_.card-content]:p-4 [&_.card-content]:pt-0' : '';

  return (
    <Card className={cn(
      variantClasses[variant], 
      hoverClasses, 
      paddingClasses,
      'border text-foreground',
      className
    )}>
      {children}
    </Card>
  );
};

const DarkModeCardHeader: React.FC<React.ComponentProps<typeof CardHeader>> = ({ 
  className, 
  ...props 
}) => (
  <CardHeader className={cn("border-b border-zinc-700/50 card-header", className)} {...props} />
);

const DarkModeCardContent: React.FC<React.ComponentProps<typeof CardContent>> = ({ 
  className, 
  ...props 
}) => (
  <CardContent className={cn("text-foreground card-content", className)} {...props} />
);

export { DarkModeCard, DarkModeCardHeader, DarkModeCardContent };

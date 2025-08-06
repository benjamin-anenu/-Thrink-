import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileEnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  elevation?: 0 | 2 | 4 | 8;
  interactive?: boolean;
  compact?: boolean;
}

export const MobileEnhancedCard: React.FC<MobileEnhancedCardProps> = ({
  children,
  className,
  elevation = 2,
  interactive = true,
  compact = false
}) => {
  const isMobile = useIsMobile();

  const elevationClasses = {
    0: '',
    2: 'mobile-elevation-2',
    4: 'mobile-elevation-4', 
    8: 'mobile-elevation-8'
  };

  const mobileClasses = isMobile ? cn(
    'mobile-card-enhanced',
    elevationClasses[elevation],
    interactive && 'mobile-touch-target mobile-press-effect',
    compact && 'mobile-card-compact'
  ) : '';

  return (
    <Card className={cn(mobileClasses, className)}>
      {children}
    </Card>
  );
};

export const MobileEnhancedCardHeader = CardHeader;
export const MobileEnhancedCardContent = CardContent;
export const MobileEnhancedCardTitle = CardTitle;
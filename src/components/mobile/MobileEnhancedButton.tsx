import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileEnhancedButtonProps extends ButtonProps {
  haptic?: boolean;
  pressEffect?: boolean;
}

export const MobileEnhancedButton: React.FC<MobileEnhancedButtonProps> = ({
  children,
  className,
  haptic = true,
  pressEffect = true,
  onClick,
  ...props
}) => {
  const isMobile = useIsMobile();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isMobile && haptic && 'vibrate' in navigator) {
      navigator.vibrate(10); // Subtle haptic feedback
    }
    onClick?.(e);
  };

  const mobileClasses = isMobile ? cn(
    'mobile-touch-target',
    pressEffect && 'mobile-press-effect mobile-tactile-feedback'
  ) : '';

  return (
    <Button
      className={cn(mobileClasses, className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
};
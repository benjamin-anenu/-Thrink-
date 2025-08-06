import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export const MobileViewportHandler: React.FC = () => {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      // Add mobile-specific meta viewport
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }

      // Add mobile body classes
      document.body.classList.add('mobile-optimized');
      
      // Set CSS custom properties for mobile
      document.documentElement.style.setProperty('--mobile-safe-area-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--mobile-safe-area-bottom', 'env(safe-area-inset-bottom)');
    } else {
      document.body.classList.remove('mobile-optimized');
    }

    return () => {
      document.body.classList.remove('mobile-optimized');
    };
  }, [isMobile]);

  return null;
};
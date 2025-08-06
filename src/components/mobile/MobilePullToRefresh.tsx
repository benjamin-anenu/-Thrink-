import React, { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { RefreshCw } from 'lucide-react';

interface MobilePullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  threshold?: number;
}

export const MobilePullToRefresh: React.FC<MobilePullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80
}) => {
  const isMobile = useIsMobile();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (!isMobile || window.scrollY > 0) return;
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isMobile || window.scrollY > 0 || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, (currentY - startY) * 0.5);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (!isMobile || isRefreshing) return;
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  };

  useEffect(() => {
    if (!isMobile) return;

    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, pullDistance, threshold, isRefreshing, startY]);

  if (!isMobile) {
    return <>{children}</>;
  }

  const progress = Math.min(pullDistance / threshold, 1);
  const opacity = Math.min(progress * 2, 1);

  return (
    <div ref={containerRef} className="relative">
      {/* Pull to refresh indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-50 transition-all duration-200"
        style={{
          transform: `translateY(${pullDistance - 60}px)`,
          opacity: opacity
        }}
      >
        <div className="bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg border">
          <RefreshCw 
            className={`h-5 w-5 text-primary transition-transform duration-200 ${
              isRefreshing || progress >= 1 ? 'animate-spin' : ''
            }`}
            style={{
              transform: `rotate(${progress * 180}deg)`
            }}
          />
        </div>
      </div>
      
      {/* Content */}
      <div 
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};
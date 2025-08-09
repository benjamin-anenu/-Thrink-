import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export interface ComplexityConfig {
  maxColumns?: number;
  maxDataPoints?: number;
  requiresInteractivity?: boolean;
  recommendDesktop?: boolean;
}

export function useMobileComplexity(config: ComplexityConfig = {}) {
  const isMobile = useIsMobile();
  const [isComplex, setIsComplex] = useState(false);

  const {
    maxColumns = 3,
    maxDataPoints = 50,
    requiresInteractivity = false,
    recommendDesktop = false
  } = config;

  useEffect(() => {
    if (!isMobile) {
      setIsComplex(false);
      return;
    }

    // Check if the view is too complex for mobile
    const complexity = recommendDesktop || requiresInteractivity;
    setIsComplex(complexity);
  }, [isMobile, maxColumns, maxDataPoints, requiresInteractivity, recommendDesktop]);

  return {
    isMobile,
    isComplex,
    shouldShowDesktopRecommendation: isMobile && isComplex
  };
}
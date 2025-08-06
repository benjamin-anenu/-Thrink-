import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from './use-mobile';

export function useMobileEnhancements() {
  const isMobile = useIsMobile();
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Parallax effect for mobile
  const handleScroll = useCallback(() => {
    if (!isMobile) return;
    
    const scrollY = window.scrollY;
    setParallaxOffset(scrollY);
    
    setIsScrolling(true);
    clearTimeout((window as any).scrollTimeout);
    (window as any).scrollTimeout = setTimeout(() => {
      setIsScrolling(false);
    }, 100);
  }, [isMobile]);

  // Entrance animations
  const observeElements = useCallback(() => {
    if (!isMobile) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('mobile-animate-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe elements with entrance animation class
    document.querySelectorAll('.mobile-entrance-animation').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    const cleanup = observeElements();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cleanup && cleanup();
    };
  }, [isMobile, handleScroll, observeElements]);

  return {
    parallaxOffset,
    isScrolling,
    isMobile
  };
}
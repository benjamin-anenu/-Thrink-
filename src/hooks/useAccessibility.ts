import { useState, useEffect } from 'react';

interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  largeFonts: boolean;
  screenReader: boolean;
}

export const useAccessibility = () => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reduceMotion: false,
    highContrast: false,
    largeFonts: false,
    screenReader: false
  });

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQueryReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Check for high contrast preference
    const mediaQueryHighContrast = window.matchMedia('(prefers-contrast: high)');
    
    // Check for large fonts preference
    const mediaQueryLargeFonts = window.matchMedia('(min-resolution: 120dpi)');

    // Detect screen reader usage
    const hasScreenReader = 'speechSynthesis' in window || 
                           navigator.userAgent.includes('NVDA') ||
                           navigator.userAgent.includes('JAWS') ||
                           navigator.userAgent.includes('VoiceOver');

    const updatePreferences = () => {
      setPreferences({
        reduceMotion: mediaQueryReduceMotion.matches,
        highContrast: mediaQueryHighContrast.matches,
        largeFonts: mediaQueryLargeFonts.matches,
        screenReader: hasScreenReader
      });
    };

    // Initial check
    updatePreferences();

    // Listen for changes
    mediaQueryReduceMotion.addEventListener('change', updatePreferences);
    mediaQueryHighContrast.addEventListener('change', updatePreferences);
    mediaQueryLargeFonts.addEventListener('change', updatePreferences);

    // Apply accessibility classes to document
    const applyAccessibilityClasses = () => {
      const root = document.documentElement;
      
      if (preferences.reduceMotion) {
        root.classList.add('reduce-motion');
      } else {
        root.classList.remove('reduce-motion');
      }

      if (preferences.highContrast) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }

      if (preferences.largeFonts) {
        root.classList.add('large-fonts');
      } else {
        root.classList.remove('large-fonts');
      }

      if (preferences.screenReader) {
        root.classList.add('screen-reader');
      } else {
        root.classList.remove('screen-reader');
      }
    };

    applyAccessibilityClasses();

    // Cleanup
    return () => {
      mediaQueryReduceMotion.removeEventListener('change', updatePreferences);
      mediaQueryHighContrast.removeEventListener('change', updatePreferences);
      mediaQueryLargeFonts.removeEventListener('change', updatePreferences);
    };
  }, [preferences]);

  // Keyboard navigation helpers
  const enhanceKeyboardNavigation = () => {
    // Focus visible indicator
    const style = document.createElement('style');
    style.innerHTML = `
      .focus-visible:focus {
        outline: 2px solid hsl(var(--primary));
        outline-offset: 2px;
      }
      
      .reduce-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      .high-contrast * {
        filter: contrast(1.5);
      }
      
      .large-fonts * {
        font-size: 1.2em !important;
      }
      
      .screen-reader .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `;
    document.head.appendChild(style);
  };

  useEffect(() => {
    enhanceKeyboardNavigation();
  }, []);

  // Skip link functionality
  const addSkipLink = () => {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:bg-primary focus:text-primary-foreground focus:p-2 focus:z-50';
    document.body.insertBefore(skipLink, document.body.firstChild);
  };

  useEffect(() => {
    addSkipLink();
  }, []);

  return {
    preferences,
    isAccessibilityEnabled: Object.values(preferences).some(Boolean)
  };
};
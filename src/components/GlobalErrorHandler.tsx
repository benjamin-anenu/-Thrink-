import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

const GlobalErrorHandler: React.FC<GlobalErrorHandlerProps> = ({ children }) => {
  const { toast } = useToast();

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[GlobalErrorHandler] Unhandled promise rejection:', event.reason);
      
      toast({
        title: "Network Error",
        description: "A connection issue occurred. Please check your internet connection.",
        variant: "destructive",
      });

      // Prevent the default browser behavior
      event.preventDefault();
    };

    // Handle JavaScript errors
    const handleError = (event: ErrorEvent) => {
      console.error('[GlobalErrorHandler] JavaScript error:', event.error);
      
      // Don't show toast for script loading errors or network errors
      if (
        event.message.includes('Loading chunk') || 
        event.message.includes('Network Error') ||
        event.filename?.includes('chrome-extension')
      ) {
        return;
      }

      toast({
        title: "Application Error",
        description: "An unexpected error occurred. The page will continue to work.",
        variant: "destructive",
      });
    };

    // Handle resource loading errors
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target?.tagName === 'IMG') {
        console.warn('[GlobalErrorHandler] Image failed to load:', target);
        // Replace with placeholder or default image
        (target as HTMLImageElement).src = '/placeholder.svg';
      } else if (target?.tagName === 'SCRIPT') {
        console.error('[GlobalErrorHandler] Script failed to load:', target);
        toast({
          title: "Loading Error",
          description: "Some features may not work properly. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    window.addEventListener('error', handleResourceError, true);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      window.removeEventListener('error', handleResourceError, true);
    };
  }, [toast]);

  return <>{children}</>;
};

export default GlobalErrorHandler;
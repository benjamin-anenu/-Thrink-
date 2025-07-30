
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

const GlobalErrorHandler: React.FC<GlobalErrorHandlerProps> = ({ children }) => {
  const { toast } = useToast();

  useEffect(() => {
    let errorCount = 0;
    const maxErrors = 3;

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[GlobalErrorHandler] Unhandled promise rejection:', event.reason);
      
      // Prevent error spam that causes restarts
      if (errorCount >= maxErrors) {
        return;
      }
      errorCount++;
      
      // Only show user-facing errors, skip technical ones
      const reason = event.reason?.message || String(event.reason);
      if (!reason.includes('chunk') && !reason.includes('import') && !reason.includes('module')) {
        toast({
          title: "Connection Issue",
          description: "Please check your internet connection.",
          variant: "destructive",
        });
      }

      event.preventDefault();
    };

    // Handle JavaScript errors more carefully
    const handleError = (event: ErrorEvent) => {
      console.error('[GlobalErrorHandler] JavaScript error:', event.error);
      
      // Skip common development errors that shouldn't show to users
      if (
        event.message?.includes('Loading chunk') || 
        event.message?.includes('import') ||
        event.message?.includes('module') ||
        event.filename?.includes('chrome-extension') ||
        errorCount >= maxErrors
      ) {
        return;
      }
      
      errorCount++;
      
      toast({
        title: "Application Notice",
        description: "The page is still working normally.",
        variant: "default",
      });
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Reset error count periodically
    const resetInterval = setInterval(() => {
      errorCount = 0;
    }, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      clearInterval(resetInterval);
    };
  }, [toast]);

  return <>{children}</>;
};

export default GlobalErrorHandler;

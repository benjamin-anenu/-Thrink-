
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

interface NetworkErrorHandlerProps {
  children: React.ReactNode;
}

const NetworkErrorHandler: React.FC<NetworkErrorHandlerProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkError, setNetworkError] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[NetworkErrorHandler] Network back online');
      setIsOnline(true);
      setNetworkError(null);
    };

    const handleOffline = () => {
      console.log('[NetworkErrorHandler] Network offline');
      setIsOnline(false);
      setNetworkError('You appear to be offline. Please check your internet connection.');
    };

    // Listen for network status changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Override fetch to catch network errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Reset network error on successful response
        if (response.ok) {
          setNetworkError(null);
        }
        
        // Handle 404 errors specifically
        if (response.status === 404) {
          console.error('[NetworkErrorHandler] 404 error detected:', args[0]);
          setNetworkError('Service temporarily unavailable. Please try again in a moment.');
        }
        
        return response;
      } catch (error) {
        console.error('[NetworkErrorHandler] Network error caught:', error);
        
        if (error instanceof Error) {
          if (error.message.includes('net::ERR_FAILED') || error.message.includes('fetch')) {
            setNetworkError('Network connection failed. Please check your connection and try again.');
          }
        }
        
        throw error;
      }
    };

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.fetch = originalFetch;
    };
  }, []);

  if (!isOnline || networkError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isOnline ? <AlertTriangle className="h-5 w-5 text-yellow-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
              {isOnline ? 'Service Error' : 'Connection Lost'}
            </CardTitle>
            <CardDescription>
              {networkError || 'Please check your internet connection'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {isOnline ? (
                  <p>The service is temporarily unavailable. This may be due to:</p>
                ) : (
                  <p>You're currently offline. Please:</p>
                )}
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {isOnline ? (
                    <>
                      <li>Server maintenance</li>
                      <li>Temporary network issues</li>
                      <li>Service overload</li>
                    </>
                  ) : (
                    <>
                      <li>Check your internet connection</li>
                      <li>Try connecting to a different network</li>
                      <li>Restart your router if necessary</li>
                    </>
                  )}
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="flex-1"
                >
                  <Wifi className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setNetworkError(null)}
                  className="flex-1"
                >
                  Continue Offline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default NetworkErrorHandler;

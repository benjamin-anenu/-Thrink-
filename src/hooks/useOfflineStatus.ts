import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OfflineStatus {
  isOnline: boolean;
  isOffline: boolean;
  hasBeenOffline: boolean;
}

export const useOfflineStatus = () => {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    isOffline: !navigator.onLine,
    hasBeenOffline: false
  });
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({
        isOnline: true,
        isOffline: false,
        hasBeenOffline: prev.hasBeenOffline
      }));

      if (status.hasBeenOffline) {
        toast({
          title: "Connection Restored",
          description: "You're back online! All features are available.",
          variant: "default",
        });
      }
    };

    const handleOffline = () => {
      setStatus({
        isOnline: false,
        isOffline: true,
        hasBeenOffline: true
      });

      toast({
        title: "Connection Lost",
        description: "You're offline. Some features may not work until you reconnect.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [status.hasBeenOffline, toast]);

  return status;
};
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { motion, AnimatePresence } from 'framer-motion';

const OfflineIndicator: React.FC = () => {
  const { isOffline, isOnline, hasBeenOffline } = useOfflineStatus();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <Alert className="rounded-none border-0 bg-destructive text-destructive-foreground">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-center">
              You're offline. Some features may not work properly.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
      
      {isOnline && hasBeenOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <Alert className="rounded-none border-0 bg-green-600 text-white">
            <Wifi className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-center">
              Connection restored! You're back online.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
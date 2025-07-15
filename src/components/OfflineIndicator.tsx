import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WifiOff, Wifi } from 'lucide-react'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOfflineStatus()

  if (isOnline && !wasOffline) return null

  return (
    <Alert className={`fixed top-4 right-4 z-50 max-w-sm transition-all duration-300 ${
      isOnline ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-orange-500 bg-orange-50 dark:bg-orange-950'
    }`}>
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        )}
        <AlertDescription className={
          isOnline ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'
        }>
          {isOnline ? 'Connection restored' : 'You are offline'}
        </AlertDescription>
      </div>
    </Alert>
  )
}
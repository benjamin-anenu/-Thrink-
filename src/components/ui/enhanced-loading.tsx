import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

interface LoadingStateProps {
  message?: string;
  size?: "small" | "default" | "large";
  fullscreen?: boolean;
}

interface LoadingOverlayProps {
  isVisible: boolean;
  title?: string;
  description?: string;
  className?: string;
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading...", 
  size = "default",
  fullscreen = false 
}) => {
  const { isOffline } = useOfflineStatus();
  
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-8 w-8",
    large: "h-12 w-12"
  };

  const containerClasses = fullscreen 
    ? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        {isOffline ? (
          <>
            <WifiOff className={cn("text-destructive", sizeClasses[size])} />
            <p className="text-sm text-destructive">You're offline</p>
          </>
        ) : (
          <>
            <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
            <p className="text-sm text-muted-foreground">{message}</p>
          </>
        )}
      </div>
    </div>
  );
};

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  title = "Processing...", 
  description,
  className 
}) => {
  const { isOffline } = useOfflineStatus();

  if (!isVisible) return null;

  return (
    <div className={cn("fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-40", className)}>
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {isOffline ? (
              <WifiOff className="h-6 w-6 text-destructive" />
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            )}
            <div className="flex-1">
              <p className="font-medium">{isOffline ? "You're offline" : title}</p>
              {description && (
                <p className="text-sm text-muted-foreground">
                  {isOffline ? "Some features may not be available" : description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const SkeletonText: React.FC<SkeletonTextProps> = ({ lines = 3, className }) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
};
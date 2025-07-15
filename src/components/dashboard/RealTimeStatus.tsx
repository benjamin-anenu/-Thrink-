
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useRealTimeEvents } from '@/hooks/useRealTimeEvents';
import { Wifi, WifiOff, Activity, Clock } from 'lucide-react';

const RealTimeStatus: React.FC = () => {
  const { status, lastEvent } = useRealTimeEvents();

  const getStatusColor = () => {
    return status.isConnected ? 'text-success' : 'text-error';
  };

  const getStatusIcon = () => {
    return status.isConnected ? (
      <Wifi className="h-4 w-4" />
    ) : (
      <WifiOff className="h-4 w-4" />
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`${getStatusColor()}`}>
              {getStatusIcon()}
            </div>
            <div>
              <p className="text-sm font-medium">
                Real-time Status
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {status.connectionStatus}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <Badge 
              variant={status.isConnected ? "success" : "error"}
              className="text-xs"
            >
              {status.isConnected ? 'Live' : 'Offline'}
            </Badge>
            
            {status.queuedEvents > 0 && (
              <Badge variant="warning" className="text-xs">
                {status.queuedEvents} queued
              </Badge>
            )}
          </div>
        </div>
        
        {lastEvent && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Last event: {lastEvent.type}</span>
              <Clock className="h-3 w-3 ml-2" />
              <span>{lastEvent.timestamp.toLocaleTimeString()}</span>
            </div>
          </div>
        )}
        
        {status.lastHeartbeat && (
          <div className="mt-1">
            <p className="text-xs text-muted-foreground">
              Last sync: {status.lastHeartbeat.toLocaleTimeString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeStatus;

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, Zap, Timer, AlertTriangle } from 'lucide-react';

interface PerformanceMetrics {
  memoryUsage: number;
  renderTime: number;
  bundleSize: number;
  errorRate: number;
  fps: number;
  loadTime: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  showDetails?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  enabled = process.env.NODE_ENV === 'development',
  showDetails = false 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    renderTime: 0,
    bundleSize: 0,
    errorRate: 0,
    fps: 60,
    loadTime: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let animationId: number;
    let frameCount = 0;
    let lastTime = performance.now();

    const measurePerformance = () => {
      const now = performance.now();
      frameCount++;

      // Calculate FPS every second
      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        frameCount = 0;
        lastTime = now;

        // Get memory usage (if available)
        const memoryInfo = (performance as any).memory;
        const memoryUsage = memoryInfo 
          ? Math.round((memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100)
          : 0;

        // Get navigation timing
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : 0;

        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage,
          loadTime,
          renderTime: Math.round(now % 100), // Simplified render time
          bundleSize: 2.1, // Static for demo
          errorRate: 0.1 // Static for demo
        }));
      }

      animationId = requestAnimationFrame(measurePerformance);
    };

    measurePerformance();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [enabled]);

  // Keyboard shortcut to toggle visibility
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!enabled || !isVisible) {
    return null;
  }

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const performanceScore = Math.round(
    (metrics.fps / 60) * 0.3 +
    ((100 - metrics.memoryUsage) / 100) * 0.3 +
    (metrics.loadTime < 3000 ? 1 : 0) * 0.4
  ) * 100;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs">
      <Card className="bg-background/95 backdrop-blur border shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance Monitor
            <Badge variant="outline" className={getStatusColor(performanceScore, { good: 80, warning: 60 })}>
              {performanceScore}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {performanceScore < 60 && (
            <Alert className="py-2">
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                Performance degraded. Consider optimizing.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                FPS
              </span>
              <span className={getStatusColor(60 - metrics.fps, { good: 5, warning: 15 })}>
                {metrics.fps}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Timer className="h-3 w-3" />
                Memory
              </span>
              <span className={getStatusColor(metrics.memoryUsage, { good: 50, warning: 80 })}>
                {metrics.memoryUsage}%
              </span>
            </div>
            <Progress value={metrics.memoryUsage} className="h-1" />

            <div className="flex justify-between items-center">
              <span>Load Time</span>
              <span className={getStatusColor(metrics.loadTime, { good: 2000, warning: 5000 })}>
                {metrics.loadTime}ms
              </span>
            </div>

            {showDetails && (
              <>
                <div className="flex justify-between items-center">
                  <span>Bundle Size</span>
                  <span>{metrics.bundleSize}MB</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Error Rate</span>
                  <span className={getStatusColor(metrics.errorRate, { good: 0.1, warning: 1 })}>
                    {metrics.errorRate}%
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Press Ctrl+Shift+P to toggle
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;
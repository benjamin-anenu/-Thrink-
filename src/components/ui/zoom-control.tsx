import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const ZOOM_LEVELS = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2];
const DEFAULT_ZOOM_INDEX = 2; // 0.9 (90%)

export const ZoomControl: React.FC = () => {
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  
  const currentZoom = ZOOM_LEVELS[zoomIndex];

  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      const scale = currentZoom;
      const compensationFactor = 100 / (scale * 100);
      
      root.style.transform = `scale(${scale})`;
      root.style.transformOrigin = 'top left';
      root.style.width = `${compensationFactor * 100}%`;
      root.style.height = `${compensationFactor * 100}%`;
      root.style.maxWidth = `${1280 * compensationFactor}px`;
      root.style.margin = '0 auto';
      root.style.overflow = 'auto';
    }
  }, [currentZoom]);

  const zoomIn = () => {
    if (zoomIndex < ZOOM_LEVELS.length - 1) {
      setZoomIndex(zoomIndex + 1);
    }
  };

  const zoomOut = () => {
    if (zoomIndex > 0) {
      setZoomIndex(zoomIndex - 1);
    }
  };

  const resetZoom = () => {
    setZoomIndex(DEFAULT_ZOOM_INDEX);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1 rounded-lg border bg-background/80 backdrop-blur-sm p-1 shadow-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={zoomOut}
        disabled={zoomIndex === 0}
        className="h-8 w-8 p-0"
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <div className="px-2 text-xs font-medium text-muted-foreground min-w-[3rem] text-center">
        {Math.round(currentZoom * 100)}%
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={zoomIn}
        disabled={zoomIndex === ZOOM_LEVELS.length - 1}
        className="h-8 w-8 p-0"
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={resetZoom}
        className="h-8 w-8 p-0"
        title="Reset Zoom"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};
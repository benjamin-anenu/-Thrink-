import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ZOOM_LEVELS = [25, 50, 75, 90, 100, 110, 125, 150, 175, 200];
const DEFAULT_ZOOM = 90;

export function ZoomControl() {
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);

  // Load zoom level from localStorage on mount
  useEffect(() => {
    const savedZoom = localStorage.getItem('app-zoom-level');
    if (savedZoom) {
      const zoom = parseInt(savedZoom, 10);
      if (ZOOM_LEVELS.includes(zoom)) {
        setZoomLevel(zoom);
        applyZoom(zoom);
      }
    }
  }, []);

  // Apply zoom to the root element
  const applyZoom = (zoom: number) => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      const scale = zoom / 100;
      rootElement.style.transform = `scale(${scale})`;
      rootElement.style.transformOrigin = 'top left';
      rootElement.style.width = `${100 / scale}%`;
      rootElement.style.height = `${100 / scale}%`;
      rootElement.style.transition = 'transform 0.2s ease-in-out';
      
      // Handle overflow for the body to ensure proper scrolling
      document.body.style.overflow = scale > 1 ? 'auto' : 'auto';
    }
  };

  // Handle zoom changes
  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(newZoom);
    applyZoom(newZoom);
    localStorage.setItem('app-zoom-level', newZoom.toString());
  };

  // Zoom in
  const zoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      handleZoomChange(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  // Zoom out
  const zoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
    if (currentIndex > 0) {
      handleZoomChange(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  // Reset zoom
  const resetZoom = () => {
    handleZoomChange(DEFAULT_ZOOM);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          zoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          zoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          resetZoom();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomLevel]);

  const canZoomOut = ZOOM_LEVELS.indexOf(zoomLevel) > 0;
  const canZoomIn = ZOOM_LEVELS.indexOf(zoomLevel) < ZOOM_LEVELS.length - 1;

  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border border-border/50">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={zoomOut}
        disabled={!canZoomOut}
      >
        <Minus className="h-3 w-3" />
        <span className="sr-only">Zoom out</span>
      </Button>
      
      <button
        onClick={resetZoom}
        className={cn(
          "px-2 py-1 text-xs font-medium rounded transition-colors min-w-[3rem] text-center",
          "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        {zoomLevel}%
      </button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={zoomIn}
        disabled={!canZoomIn}
      >
        <Plus className="h-3 w-3" />
        <span className="sr-only">Zoom in</span>
      </Button>
    </div>
  );
}
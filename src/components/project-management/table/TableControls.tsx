
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  Settings,
  Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TableControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  tableDensity: 'compact' | 'normal' | 'comfortable';
  onDensityChange: (density: 'compact' | 'normal' | 'comfortable') => void;
  onExport: () => void;
}

const TableControls: React.FC<TableControlsProps> = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  tableDensity,
  onDensityChange,
  onExport
}) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-background border-b">
      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          disabled={zoomLevel <= 0.5}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Badge variant="secondary" className="min-w-[60px] text-center">
          {Math.round(zoomLevel * 100)}%
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          disabled={zoomLevel >= 2}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomReset}
          title="Reset Zoom"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Density Controls */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {tableDensity === 'compact' ? <Minimize2 className="h-4 w-4" /> : 
             tableDensity === 'comfortable' ? <Maximize2 className="h-4 w-4" /> : 
             <Settings className="h-4 w-4" />}
            <span className="ml-2 capitalize">{tableDensity}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Table Density</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onDensityChange('compact')}>
            <Minimize2 className="h-4 w-4 mr-2" />
            Compact
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDensityChange('normal')}>
            <Settings className="h-4 w-4 mr-2" />
            Normal
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDensityChange('comfortable')}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Comfortable
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6" />

      {/* Export Button */}
      <Button variant="outline" size="sm" onClick={onExport}>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  );
};

export default TableControls;

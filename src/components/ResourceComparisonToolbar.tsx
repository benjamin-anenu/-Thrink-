
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  BarChart3, 
  X,
  Brain
} from 'lucide-react';

interface ResourceComparisonToolbarProps {
  selectedCount: number;
  onCompare: () => void;
  onClear: () => void;
  onToggleCompareMode: () => void;
  compareMode: boolean;
}

const ResourceComparisonToolbar: React.FC<ResourceComparisonToolbarProps> = ({
  selectedCount,
  onCompare,
  onClear,
  onToggleCompareMode,
  compareMode
}) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span className="font-medium">Resource Comparison</span>
        {selectedCount > 0 && (
          <Badge variant="secondary">{selectedCount} selected</Badge>
        )}
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      <div className="flex items-center gap-2">
        <Button
          variant={compareMode ? "default" : "outline"}
          size="sm"
          onClick={onToggleCompareMode}
        >
          {compareMode ? "Exit Compare" : "Compare Mode"}
        </Button>
        
        {compareMode && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onCompare}
              disabled={selectedCount < 2}
              className="flex items-center gap-1"
            >
              <Brain className="h-4 w-4" />
              AI Compare ({selectedCount})
            </Button>
            
            {selectedCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </>
        )}
      </div>
      
      {compareMode && (
        <div className="ml-auto text-sm text-muted-foreground">
          Select 2+ resources to compare with AI analysis
        </div>
      )}
    </div>
  );
};

export default ResourceComparisonToolbar;

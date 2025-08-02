
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid3X3, List } from 'lucide-react';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={view === 'grid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className="flex items-center gap-2"
      >
        <Grid3X3 size={16} />
        Grid
      </Button>
      <Button
        variant={view === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="flex items-center gap-2"
      >
        <List size={16} />
        List
      </Button>
    </div>
  );
};

export default ViewToggle;

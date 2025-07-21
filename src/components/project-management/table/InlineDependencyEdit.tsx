
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';
import { ProjectTask } from '@/types/project';
import { cn } from '@/lib/utils';
import DependencyEditModal from './DependencyEditModal';

interface InlineDependencyEditProps {
  value: string[];
  allTasks: ProjectTask[];
  currentTaskId: string;
  onSave: (dependencies: string[]) => void;
  className?: string;
}

interface ParsedDependency {
  taskId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  lag: number;
  taskName?: string;
}

const InlineDependencyEdit: React.FC<InlineDependencyEditProps> = ({
  value,
  allTasks,
  currentTaskId,
  onSave,
  className = ""
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Parse dependency string into components
  const parseDependencyString = (depString: string): ParsedDependency => {
    const parts = depString.split(':');
    const taskId = parts[0];
    const type = (parts[1] as ParsedDependency['type']) || 'finish-to-start';
    const lag = parseInt(parts[2]) || 0;
    const task = allTasks.find(t => t.id === taskId);
    
    return {
      taskId,
      type,
      lag,
      taskName: task?.name || 'Unknown Task'
    };
  };

  const getDependencyTypeColor = (type: string) => {
    switch (type) {
      case 'finish-to-start': return 'bg-blue-100 text-blue-800';
      case 'start-to-start': return 'bg-green-100 text-green-800';
      case 'finish-to-finish': return 'bg-orange-100 text-orange-800';
      case 'start-to-finish': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDependencyTypeAbbr = (type: string) => {
    switch (type) {
      case 'finish-to-start': return 'FS';
      case 'start-to-start': return 'SS';
      case 'finish-to-finish': return 'FF';
      case 'start-to-finish': return 'SF';
      default: return 'FS';
    }
  };

  const renderDependencyBadge = (dep: string) => {
    const parsed = parseDependencyString(dep);
    const typeAbbr = getDependencyTypeAbbr(parsed.type);
    const lagText = parsed.lag !== 0 ? ` ${parsed.lag > 0 ? '+' : ''}${parsed.lag}d` : '';
    
    return (
      <Badge 
        key={dep} 
        variant="outline" 
        className={cn("text-xs flex items-center gap-1", getDependencyTypeColor(parsed.type))}
      >
        <span className="font-medium">{typeAbbr}</span>
        <span className="truncate max-w-[80px]" title={parsed.taskName}>
          {parsed.taskName}
        </span>
        {lagText && (
          <span className="text-xs opacity-75">{lagText}</span>
        )}
      </Badge>
    );
  };

  const handleSave = (dependencies: string[]) => {
    onSave(dependencies);
  };

  return (
    <>
      <div
        className={cn(
          "group cursor-pointer hover:bg-muted/50 p-2 rounded min-h-[32px] flex items-center justify-between gap-2",
          className
        )}
        onClick={() => setIsModalOpen(true)}
        title="Click to manage dependencies"
      >
        <div className="flex flex-wrap gap-1 items-center flex-1">
          {value && value.length > 0 ? (
            <>
              {value.slice(0, 2).map((dep) => renderDependencyBadge(dep))}
              {value.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{value.length - 2} more
                </Badge>
              )}
            </>
          ) : (
            <span className="text-muted-foreground italic text-sm">No dependencies</span>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </div>

      <DependencyEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        value={value}
        allTasks={allTasks}
        currentTaskId={currentTaskId}
        onSave={handleSave}
      />
    </>
  );
};

export default InlineDependencyEdit;

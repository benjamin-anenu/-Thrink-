import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, AlertTriangle, Clock } from 'lucide-react';
import { ProjectTask } from '@/types/project';
import { useDependencyCalculator } from '@/hooks/useDependencyCalculator';
import { cn } from '@/lib/utils';

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

const DEPENDENCY_TYPES = [
  { value: 'finish-to-start', label: 'Finish-to-Start (FS)', description: 'Task starts after predecessor finishes' },
  { value: 'start-to-start', label: 'Start-to-Start (SS)', description: 'Task starts when predecessor starts' },
  { value: 'finish-to-finish', label: 'Finish-to-Finish (FF)', description: 'Task finishes when predecessor finishes' },
  { value: 'start-to-finish', label: 'Start-to-Finish (SF)', description: 'Task finishes when predecessor starts' }
];

const InlineDependencyEdit: React.FC<InlineDependencyEditProps> = ({
  value,
  allTasks,
  currentTaskId,
  onSave,
  className = ""
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [dependencies, setDependencies] = useState<string[]>(value || []);
  const [newDependency, setNewDependency] = useState({
    taskId: '',
    type: 'finish-to-start' as const,
    lag: 0
  });
  const [conflicts, setConflicts] = useState<string[]>([]);
  const { parseDependency, checkCircularDependency, calculateTaskSchedule } = useDependencyCalculator(allTasks);

  useEffect(() => {
    setDependencies(value || []);
  }, [value]);

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

  // Format dependency object into string
  const formatDependencyString = (dep: Partial<ParsedDependency>): string => {
    return `${dep.taskId}:${dep.type}:${dep.lag}`;
  };

  // Get available tasks (excluding current task and already selected dependencies)
  const availableTasks = allTasks.filter(task => {
    if (task.id === currentTaskId) return false;
    const existingTaskIds = dependencies.map(dep => parseDependencyString(dep).taskId);
    return !existingTaskIds.includes(task.id);
  });

  // Check for conflicts when dependencies change
  useEffect(() => {
    if (dependencies.length > 0) {
      calculateTaskSchedule(allTasks.find(t => t.id === currentTaskId)!)
        .then(result => {
          if (result.hasConflicts && result.conflictDetails) {
            setConflicts(result.conflictDetails);
          } else {
            setConflicts([]);
          }
        });
    } else {
      setConflicts([]);
    }
  }, [dependencies, currentTaskId, calculateTaskSchedule, allTasks]);

  const handleAddDependency = async () => {
    if (!newDependency.taskId) return;

    // Check for circular dependency
    const isCircular = await checkCircularDependency(currentTaskId, newDependency.taskId);
    if (isCircular) {
      setConflicts(['This dependency would create a circular reference']);
      return;
    }

    // Format and add the new dependency
    const formattedDependency = formatDependencyString(newDependency);
    const newDependencies = [...dependencies, formattedDependency];
    setDependencies(newDependencies);
    
    // Reset form
    setNewDependency({
      taskId: '',
      type: 'finish-to-start',
      lag: 0
    });
    setConflicts([]);
  };

  const handleRemoveDependency = (depToRemove: string) => {
    const newDependencies = dependencies.filter(dep => dep !== depToRemove);
    setDependencies(newDependencies);
    setConflicts([]);
  };

  const handleSave = () => {
    onSave(dependencies);
    setIsEditing(false);
    setConflicts([]);
  };

  const handleCancel = () => {
    setDependencies(value || []);
    setNewDependency({
      taskId: '',
      type: 'finish-to-start',
      lag: 0
    });
    setConflicts([]);
    setIsEditing(false);
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

  if (isEditing) {
    return (
      <div className={cn("space-y-3 p-2 border rounded-md bg-background", className)}>
        {/* Existing Dependencies */}
        {dependencies.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Dependencies:</h4>
            <div className="flex flex-wrap gap-1">
              {dependencies.map((dep) => (
                <div key={dep} className="flex items-center gap-1">
                  {renderDependencyBadge(dep)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleRemoveDependency(dep)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conflicts Display */}
        {conflicts.length > 0 && (
          <div className="flex items-start gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              {conflicts.map((conflict, index) => (
                <p key={index} className="text-sm text-destructive">{conflict}</p>
              ))}
            </div>
          </div>
        )}

        {/* Add New Dependency */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Add Dependency:</h4>
          
          <div className="grid grid-cols-1 gap-2">
            {/* Task Selection */}
            <Select 
              value={newDependency.taskId} 
              onValueChange={(value) => setNewDependency(prev => ({ ...prev, taskId: value }))}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select predecessor task" />
              </SelectTrigger>
              <SelectContent>
                {availableTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Dependency Type & Lag */}
            <div className="flex gap-2">
              <Select 
                value={newDependency.type} 
                onValueChange={(value: ParsedDependency['type']) => 
                  setNewDependency(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="h-8 text-sm flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPENDENCY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <Input
                  type="number"
                  value={newDependency.lag}
                  onChange={(e) => setNewDependency(prev => ({ ...prev, lag: parseInt(e.target.value) || 0 }))}
                  className="h-8 w-16 text-sm"
                  placeholder="0"
                />
                <span className="text-xs text-muted-foreground">days</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddDependency}
            disabled={!newDependency.taskId}
            className="w-full"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Dependency
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave}
            disabled={conflicts.length > 0}
            className="flex-1"
          >
            Save
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "cursor-pointer hover:bg-muted/50 p-1 rounded min-h-[32px] flex items-center",
        className
      )}
      onClick={() => setIsEditing(true)}
      title="Click to edit dependencies"
    >
      <div className="flex flex-wrap gap-1 items-center">
        {dependencies.length > 0 ? (
          <>
            {dependencies.slice(0, 2).map((dep) => renderDependencyBadge(dep))}
            {dependencies.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{dependencies.length - 2} more
              </Badge>
            )}
          </>
        ) : (
          <span className="text-muted-foreground italic text-sm">No dependencies</span>
        )}
      </div>
    </div>
  );
};

export default InlineDependencyEdit;

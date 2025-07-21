
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { ProjectTask } from '@/types/project';
import { useDependencyCalculator } from '@/hooks/useDependencyCalculator';

interface InlineDependencyEditProps {
  value: string[];
  allTasks: ProjectTask[];
  currentTaskId: string;
  onSave: (dependencies: string[]) => void;
  className?: string;
}

const InlineDependencyEdit: React.FC<InlineDependencyEditProps> = ({
  value,
  allTasks,
  currentTaskId,
  onSave,
  className = ""
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [dependencies, setDependencies] = useState<string[]>(value || []);
  const [newDependency, setNewDependency] = useState('');
  const { parseDependency, checkCircularDependency } = useDependencyCalculator(allTasks);

  useEffect(() => {
    setDependencies(value || []);
  }, [value]);

  // Get available tasks (excluding current task and already selected dependencies)
  const availableTasks = allTasks.filter(task => {
    if (task.id === currentTaskId) return false;
    const existingTaskIds = dependencies.map(dep => parseDependency(dep).taskId);
    return !existingTaskIds.includes(task.id);
  });

  const handleAddDependency = async () => {
    if (!newDependency) return;

    // Check for circular dependency
    const isCircular = await checkCircularDependency(currentTaskId, newDependency);
    if (isCircular) {
      alert('This dependency would create a circular reference');
      return;
    }

    // Default to finish-to-start dependency with 0 lag
    const formattedDependency = `${newDependency}:finish-to-start:0`;
    const newDependencies = [...dependencies, formattedDependency];
    setDependencies(newDependencies);
    setNewDependency('');
  };

  const handleRemoveDependency = (depToRemove: string) => {
    const newDependencies = dependencies.filter(dep => dep !== depToRemove);
    setDependencies(newDependencies);
  };

  const handleSave = () => {
    onSave(dependencies);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDependencies(value || []);
    setNewDependency('');
    setIsEditing(false);
  };

  const renderDependencyBadge = (dep: string) => {
    const parsed = parseDependency(dep);
    const task = allTasks.find(t => t.id === parsed.taskId);
    const taskName = task?.name || 'Unknown Task';
    
    return (
      <Badge key={dep} variant="outline" className="text-xs">
        {taskName.substring(0, 15)}...
        {parsed.type !== 'finish-to-start' && (
          <span className="ml-1 text-muted-foreground">
            ({parsed.type})
          </span>
        )}
      </Badge>
    );
  };

  if (isEditing) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex flex-wrap gap-1">
          {dependencies.map((dep) => (
            <div key={dep} className="flex items-center">
              {renderDependencyBadge(dep)}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleRemoveDependency(dep)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={newDependency} onValueChange={setNewDependency}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Add dependency" />
            </SelectTrigger>
            <SelectContent>
              {availableTasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddDependency}
            disabled={!newDependency}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSave}>
            Save
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`cursor-pointer hover:bg-muted/50 p-1 rounded ${className}`}
      onClick={() => setIsEditing(true)}
      title="Click to edit dependencies"
    >
      <div className="flex flex-wrap gap-1">
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
          <span className="text-muted-foreground italic text-sm">None</span>
        )}
      </div>
    </div>
  );
};

export default InlineDependencyEdit;

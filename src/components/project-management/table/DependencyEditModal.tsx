import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Plus, X, AlertTriangle, Clock } from 'lucide-react';
import { ProjectTask } from '@/types/project';
import { useDependencyCalculator } from '@/hooks/useDependencyCalculator';
import { cn } from '@/lib/utils';

interface DependencyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string[];
  allTasks: ProjectTask[];
  currentTaskId: string;
  onSave: (dependencies: string[]) => void;
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

const DependencyEditModal: React.FC<DependencyEditModalProps> = ({
  isOpen,
  onClose,
  value,
  allTasks,
  currentTaskId,
  onSave
}) => {
  const [dependencies, setDependencies] = useState<string[]>(value || []);
  const [newDependency, setNewDependency] = useState<{
    taskId: string;
    type: ParsedDependency['type'];
    lag: number;
  }>({
    taskId: '',
    type: 'finish-to-start',
    lag: 0
  });
  const [conflicts, setConflicts] = useState<string[]>([]);
  const { parseDependency, checkCircularDependency, calculateTaskSchedule } = useDependencyCalculator(allTasks);

  useEffect(() => {
    if (isOpen) {
      setDependencies(value || []);
      setNewDependency({
        taskId: '',
        type: 'finish-to-start',
        lag: 0
      });
      setConflicts([]);
    }
  }, [isOpen, value]);

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
    if (dependencies.length > 0 && isOpen) {
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
  }, [dependencies, currentTaskId, calculateTaskSchedule, allTasks, isOpen]);

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
    onClose();
  };

  const handleCancel = () => {
    setDependencies(value || []);
    setNewDependency({
      taskId: '',
      type: 'finish-to-start',
      lag: 0
    });
    setConflicts([]);
    onClose();
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
      <div key={dep} className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
        <Badge 
          variant="outline" 
          className={cn("text-sm", getDependencyTypeColor(parsed.type))}
        >
          {typeAbbr}
        </Badge>
        <div className="flex-1">
          <div className="font-medium">{parsed.taskName}</div>
          {lagText && (
            <div className="text-sm text-muted-foreground">
              Lag: {lagText}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRemoveDependency(dep)}
          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Task Dependencies</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Dependencies */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Current Dependencies ({dependencies.length})</h4>
            {dependencies.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {dependencies.map((dep) => renderDependencyBadge(dep))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No dependencies configured</p>
              </div>
            )}
          </div>

          {/* Conflicts Display */}
          {conflicts.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-destructive">Conflicts Detected</h4>
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      {conflicts.map((conflict, index) => (
                        <p key={index} className="text-sm text-destructive">{conflict}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Add New Dependency */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Add New Dependency</h4>
            
            <div className="grid gap-4">
              {/* Task Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Predecessor Task</label>
                <Select 
                  value={newDependency.taskId} 
                  onValueChange={(value) => setNewDependency(prev => ({ ...prev, taskId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task that must complete before this one" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dependency Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Dependency Type</label>
                <Select 
                  value={newDependency.type} 
                  onValueChange={(value: ParsedDependency['type']) => 
                    setNewDependency(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPENDENCY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lag/Lead Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Lag/Lead Time</label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={newDependency.lag}
                    onChange={(e) => setNewDependency(prev => ({ ...prev, lag: parseInt(e.target.value) || 0 }))}
                    className="w-24"
                    placeholder="0"
                  />
                  <span className="text-sm text-muted-foreground">
                    days ({newDependency.lag >= 0 ? 'lag' : 'lead'})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Positive values add delay, negative values allow overlap
                </p>
              </div>

              <Button
                onClick={handleAddDependency}
                disabled={!newDependency.taskId}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Dependency
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={conflicts.length > 0}
          >
            Save Dependencies
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DependencyEditModal;


import React, { useState } from 'react';
import { ProjectTask } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, ArrowRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export interface DependencyType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export const DEPENDENCY_TYPES: DependencyType[] = [
  {
    id: 'finish-to-start',
    name: 'Finish-to-Start (FS)',
    description: 'Task B starts after Task A finishes',
    icon: <ArrowRight className="h-3 w-3" />
  },
  {
    id: 'start-to-start',
    name: 'Start-to-Start (SS)', 
    description: 'Task B starts when Task A starts',
    icon: <ArrowRight className="h-3 w-3" />
  },
  {
    id: 'finish-to-finish',
    name: 'Finish-to-Finish (FF)',
    description: 'Task B finishes when Task A finishes',
    icon: <ArrowRight className="h-3 w-3" />
  },
  {
    id: 'start-to-finish',
    name: 'Start-to-Finish (SF)',
    description: 'Task B finishes when Task A starts',
    icon: <ArrowRight className="h-3 w-3" />
  }
];

interface DependencyManagerProps {
  task: ProjectTask;
  allTasks: ProjectTask[];
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
}

export interface TaskDependency {
  taskId: string;
  type: string;
  lag: number; // days
}

const DependencyManager: React.FC<DependencyManagerProps> = ({
  task,
  allTasks,
  onUpdateTask
}) => {
  const [open, setOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [dependencyType, setDependencyType] = useState<string>('finish-to-start');
  const [lagDays, setLagDays] = useState<number>(0);

  // Parse existing dependencies (assuming they're stored as taskId:type:lag format)
  const parseDependencies = (): TaskDependency[] => {
    return task.dependencies.map(dep => {
      const parts = dep.split(':');
      return {
        taskId: parts[0],
        type: parts[1] || 'finish-to-start',
        lag: parseInt(parts[2]) || 0
      };
    });
  };

  const formatDependency = (dependency: TaskDependency): string => {
    return `${dependency.taskId}:${dependency.type}:${dependency.lag}`;
  };

  const validateDependency = (taskId: string): string | null => {
    if (taskId === task.id) {
      return 'A task cannot depend on itself';
    }

    // Check for circular dependencies
    const checkCircular = (currentTaskId: string, visited: Set<string>): boolean => {
      if (visited.has(currentTaskId)) return true;
      visited.add(currentTaskId);

      const currentTask = allTasks.find(t => t.id === currentTaskId);
      if (!currentTask) return false;

      for (const dep of currentTask.dependencies) {
        const depTaskId = dep.split(':')[0];
        if (depTaskId === task.id) return true;
        if (checkCircular(depTaskId, new Set(visited))) return true;
      }

      return false;
    };

    if (checkCircular(taskId, new Set())) {
      return 'This would create a circular dependency';
    }

    return null;
  };

  const addDependency = () => {
    if (!selectedTaskId) return;

    const validationError = validateDependency(selectedTaskId);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const existingDeps = parseDependencies();
    const newDependency: TaskDependency = {
      taskId: selectedTaskId,
      type: dependencyType,
      lag: lagDays
    };

    // Check if dependency already exists
    if (existingDeps.some(dep => dep.taskId === selectedTaskId)) {
      toast.error('Dependency already exists');
      return;
    }

    const updatedDependencies = [...existingDeps, newDependency];
    const formattedDeps = updatedDependencies.map(formatDependency);

    onUpdateTask(task.id, { dependencies: formattedDeps });
    
    // Reset form
    setSelectedTaskId('');
    setDependencyType('finish-to-start');
    setLagDays(0);
    toast.success('Dependency added successfully');
  };

  const removeDependency = (taskId: string) => {
    const existingDeps = parseDependencies();
    const filteredDeps = existingDeps.filter(dep => dep.taskId !== taskId);
    const formattedDeps = filteredDeps.map(formatDependency);

    onUpdateTask(task.id, { dependencies: formattedDeps });
    toast.success('Dependency removed');
  };

  const availableTasks = allTasks.filter(t => 
    t.id !== task.id && 
    !parseDependencies().some(dep => dep.taskId === t.id)
  );

  const currentDependencies = parseDependencies();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Plus className="h-3 w-3 mr-1" />
          Manage Dependencies
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Dependencies for "{task.name}"</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Dependencies */}
          <div>
            <h4 className="text-sm font-medium mb-3">Current Dependencies</h4>
            {currentDependencies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No dependencies set</p>
            ) : (
              <div className="space-y-2">
                {currentDependencies.map((dep) => {
                  const depTask = allTasks.find(t => t.id === dep.taskId);
                  const depType = DEPENDENCY_TYPES.find(t => t.id === dep.type);
                  
                  return (
                    <div key={dep.taskId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {depType?.icon}
                        <div>
                          <div className="font-medium text-sm">{depTask?.name || 'Unknown Task'}</div>
                          <div className="text-xs text-muted-foreground">
                            {depType?.name} {dep.lag !== 0 && `(${dep.lag > 0 ? '+' : ''}${dep.lag} days)`}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDependency(dep.taskId)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add New Dependency */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium mb-3">Add New Dependency</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dependentTask">Dependent Task</Label>
                <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.map(availableTask => (
                      <SelectItem key={availableTask.id} value={availableTask.id}>
                        {availableTask.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dependencyType">Dependency Type</Label>
                <Select value={dependencyType} onValueChange={setDependencyType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPENDENCY_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          <div>
                            <div className="font-medium">{type.name}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lagDays">Lead/Lag Time (days)</Label>
                <Input
                  id="lagDays"
                  type="number"
                  value={lagDays}
                  onChange={(e) => setLagDays(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Positive values add delay, negative values add lead time
                </p>
              </div>

              <Button 
                onClick={addDependency} 
                disabled={!selectedTaskId}
                className="w-full"
              >
                Add Dependency
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DependencyManager;

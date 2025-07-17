
import React, { useState } from 'react';
import { ProjectTask } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface DependencyManagerProps {
  task: ProjectTask;
  allTasks: ProjectTask[];
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
}

const DependencyManager: React.FC<DependencyManagerProps> = ({
  task,
  allTasks,
  onUpdateTask
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const [dependencyType, setDependencyType] = useState('finish-to-start');
  const [lagDays, setLagDays] = useState(0);

  const availableTasks = allTasks.filter(t => t.id !== task.id);
  
  const parseDependencies = () => {
    return task.dependencies.map(dep => {
      const parts = dep.split(':');
      return {
        taskId: parts[0],
        type: parts[1] || 'finish-to-start',
        lag: parseInt(parts[2]) || 0,
        task: allTasks.find(t => t.id === parts[0])
      };
    }).filter(dep => dep.task);
  };

  const checkCircularDependency = (newTaskId: string): boolean => {
    const visited = new Set<string>();
    
    const hasCircularPath = (currentTaskId: string): boolean => {
      if (visited.has(currentTaskId)) return true;
      if (currentTaskId === task.id) return true;
      
      visited.add(currentTaskId);
      
      const currentTask = allTasks.find(t => t.id === currentTaskId);
      if (!currentTask) return false;
      
      for (const dep of currentTask.dependencies) {
        const depTaskId = dep.split(':')[0];
        if (hasCircularPath(depTaskId)) return true;
      }
      
      visited.delete(currentTaskId);
      return false;
    };
    
    return hasCircularPath(newTaskId);
  };

  const addDependency = () => {
    if (!selectedTask) {
      toast.error('Please select a task');
      return;
    }

    if (checkCircularDependency(selectedTask)) {
      toast.error('Warning: This creates a circular dependency. Please review your task dependencies.');
      // Don't return here - allow the dependency but warn the user
    }

    const existingDep = task.dependencies.find(dep => dep.startsWith(selectedTask));
    if (existingDep) {
      toast.error('Dependency already exists for this task');
      return;
    }

    const dependencyString = `${selectedTask}:${dependencyType}:${lagDays}`;
    const updatedDependencies = [...task.dependencies, dependencyString];
    
    onUpdateTask(task.id, { dependencies: updatedDependencies });
    
    setSelectedTask('');
    setDependencyType('finish-to-start');
    setLagDays(0);
    toast.success('Dependency added successfully');
  };

  const removeDependency = (taskId: string) => {
    const updatedDependencies = task.dependencies.filter(dep => !dep.startsWith(taskId));
    onUpdateTask(task.id, { dependencies: updatedDependencies });
    toast.success('Dependency removed');
  };

  const currentDependencies = parseDependencies();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full h-6 px-2 text-xs group"
        >
          <Settings className="h-3 w-3 shrink-0" />
          <span className="ml-1 truncate group-hover:hidden">Manage</span>
          <span className="ml-1 truncate hidden group-hover:inline">Manage Dependencies</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Dependencies for "{task.name}"</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Dependencies */}
          <div>
            <Label className="text-sm font-medium">Current Dependencies</Label>
            <div className="mt-2 space-y-2">
              {currentDependencies.length === 0 ? (
                <p className="text-sm text-muted-foreground">No dependencies</p>
              ) : (
                currentDependencies.map((dep) => (
                  <div key={dep.taskId} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{dep.task?.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {dep.type.replace('-', ' to ')}
                        </Badge>
                        {dep.lag !== 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {dep.lag > 0 ? `+${dep.lag}d` : `${dep.lag}d`}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDependency(dep.taskId)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add New Dependency */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Add New Dependency</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="task-select" className="text-xs">Dependent Task</Label>
                <Select value={selectedTask} onValueChange={setSelectedTask}>
                  <SelectTrigger id="task-select">
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex flex-col">
                          <span>{t.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {t.startDate} - {t.endDate}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type-select" className="text-xs">Dependency Type</Label>
                <Select value={dependencyType} onValueChange={setDependencyType}>
                  <SelectTrigger id="type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finish-to-start">Finish to Start (FS)</SelectItem>
                    <SelectItem value="start-to-start">Start to Start (SS)</SelectItem>
                    <SelectItem value="finish-to-finish">Finish to Finish (FF)</SelectItem>
                    <SelectItem value="start-to-finish">Start to Finish (SF)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lag-input" className="text-xs">Lead/Lag (days)</Label>
                <Input
                  id="lag-input"
                  type="number"
                  value={lagDays}
                  onChange={(e) => setLagDays(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <Button onClick={addDependency} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Dependency
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Dependency Types:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Finish to Start (FS):</strong> Task B starts when Task A finishes</li>
              <li><strong>Start to Start (SS):</strong> Task B starts when Task A starts</li>
              <li><strong>Finish to Finish (FF):</strong> Task B finishes when Task A finishes</li>
              <li><strong>Start to Finish (SF):</strong> Task B finishes when Task A starts</li>
            </ul>
            <p><strong>Lead/Lag:</strong> Positive values add delay, negative values create lead time</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DependencyManager;

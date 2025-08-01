
import React, { useState, useEffect } from 'react';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { addBusinessDays, format } from 'date-fns';

interface TaskCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (task: Omit<ProjectTask, 'id'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  editingTask: ProjectTask | null;
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  availableResources: Array<{ id: string; name: string; role: string }>;
  availableStakeholders: Array<{ id: string; name: string; role: string }>;
}

const TaskCreationDialog: React.FC<TaskCreationDialogProps> = ({
  open,
  onOpenChange,
  onCreateTask,
  onUpdateTask,
  editingTask,
  tasks,
  milestones,
  availableResources,
  availableStakeholders
}) => {
  const [formData, setFormData] = useState<Partial<ProjectTask>>({
    name: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    duration: 1,
    progress: 0,
    priority: 'Medium',
    status: 'Not Started',
    assignedResources: [],
    assignedStakeholders: [],
    dependencies: [],
    milestoneId: undefined
  });

  useEffect(() => {
    if (editingTask) {
      setFormData(editingTask);
    } else {
      setFormData({
        name: '',
        description: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        duration: 1,
        progress: 0,
        priority: 'Medium',
        status: 'Not Started',
        assignedResources: [],
        assignedStakeholders: [],
        dependencies: [],
        milestoneId: undefined
      });
    }
  }, [editingTask]);

  const calculateEndDate = (startDate: string, duration: number) => {
    const start = new Date(startDate);
    const end = addBusinessDays(start, duration - 1);
    return format(end, 'yyyy-MM-dd');
  };

  const handleStartDateChange = (startDate: string) => {
    const endDate = calculateEndDate(startDate, formData.duration || 1);
    setFormData(prev => ({
      ...prev,
      startDate,
      endDate
    }));
  };

  const handleDurationChange = (duration: number) => {
    const endDate = calculateEndDate(formData.startDate || format(new Date(), 'yyyy-MM-dd'), duration);
    setFormData(prev => ({
      ...prev,
      duration,
      endDate
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.startDate || !formData.duration) return;

    const endDate = calculateEndDate(formData.startDate, formData.duration);
    const taskData = {
      ...formData,
      endDate,
      baselineStartDate: formData.baselineStartDate || formData.startDate,
      baselineEndDate: formData.baselineEndDate || endDate,
      duration: formData.duration
    } as Omit<ProjectTask, 'id'>;

    if (editingTask) {
      onUpdateTask(editingTask.id, taskData);
    } else {
      onCreateTask(taskData);
    }

    onOpenChange(false);
  };

  const addDependency = (taskId: string) => {
    if (taskId && !formData.dependencies?.includes(taskId)) {
      setFormData(prev => ({
        ...prev,
        dependencies: [...(prev.dependencies || []), taskId]
      }));
    }
  };

  const removeDependency = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies?.filter(id => id !== taskId) || []
    }));
  };

  const addResource = (resourceId: string) => {
    if (resourceId && !formData.assignedResources?.includes(resourceId)) {
      setFormData(prev => ({
        ...prev,
        assignedResources: [...(prev.assignedResources || []), resourceId]
      }));
    }
  };

  const removeResource = (resourceId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedResources: prev.assignedResources?.filter(id => id !== resourceId) || []
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="taskName">Task Name *</Label>
              <Input
                id="taskName"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter task name"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Task description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (days) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration || 1}
                  onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              End Date: {formData.startDate && formData.duration ? 
                calculateEndDate(formData.startDate, formData.duration) : 'Not calculated'
              }
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority || 'Medium'} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status || 'Not Started'} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="milestone">Milestone</Label>
              <Select 
                value={formData.milestoneId || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, milestoneId: value || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select milestone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No milestone</SelectItem>
                  {milestones.map((milestone) => (
                    <SelectItem key={milestone.id} value={milestone.id}>
                      {milestone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label>Dependencies</Label>
              <Select onValueChange={addDependency}>
                <SelectTrigger>
                  <SelectValue placeholder="Add dependency" />
                </SelectTrigger>
                <SelectContent>
                  {tasks
                    .filter(t => t.id !== editingTask?.id)
                    .map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {formData.dependencies && formData.dependencies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.dependencies.map((depId) => {
                    const depTask = tasks.find(t => t.id === depId);
                    return (
                      <Badge key={depId} variant="outline" className="text-xs">
                        {depTask?.name}
                        <button
                          onClick={() => removeDependency(depId)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <Label>Assigned Resources</Label>
              <Select onValueChange={addResource}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign resource" />
                </SelectTrigger>
                <SelectContent>
                  {availableResources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.name} - {resource.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.assignedResources && formData.assignedResources.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.assignedResources.map((resourceId) => {
                    const resource = availableResources.find(r => r.id === resourceId);
                    return (
                      <Badge key={resourceId} variant="outline" className="text-xs">
                        {resource?.name}
                        <button
                          onClick={() => removeResource(resourceId)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editingTask ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskCreationDialog;

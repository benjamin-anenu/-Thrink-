
import React, { useState, useEffect } from 'react';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { TaskHierarchyUtils } from '@/utils/taskHierarchy';

interface TaskCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (task: Omit<ProjectTask, 'id'>) => Promise<void>;
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => Promise<void>;
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
  const [formData, setFormData] = useState<Omit<ProjectTask, 'id'>>({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    baselineStartDate: new Date().toISOString().split('T')[0],
    baselineEndDate: new Date().toISOString().split('T')[0],
    progress: 0,
    assignedResources: [],
    assignedStakeholders: [],
    dependencies: [],
    priority: 'Medium',
    status: 'Not Started',
    milestoneId: undefined,
    duration: 1,
    parentTaskId: undefined,
    hierarchyLevel: 0,
    sortOrder: 0,
    hasChildren: false
  });

  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [selectedStakeholders, setSelectedStakeholders] = useState<string[]>([]);
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);

  const isEditing = !!editingTask?.id;

  // Get parent task info if creating a subtask 
  const parentTask = formData.parentTaskId ? tasks.find(t => t.id === formData.parentTaskId) : null;

  useEffect(() => {
    if (editingTask) {
      setFormData({
        name: editingTask.name || '',
        description: editingTask.description || '',
        startDate: editingTask.startDate || new Date().toISOString().split('T')[0],
        endDate: editingTask.endDate || new Date().toISOString().split('T')[0],
        baselineStartDate: editingTask.baselineStartDate || editingTask.startDate || new Date().toISOString().split('T')[0],
        baselineEndDate: editingTask.baselineEndDate || editingTask.endDate || new Date().toISOString().split('T')[0],
        progress: editingTask.progress || 0,
        assignedResources: editingTask.assignedResources || [],
        assignedStakeholders: editingTask.assignedStakeholders || [],
        dependencies: editingTask.dependencies || [],
        priority: editingTask.priority || 'Medium',
        status: editingTask.status || 'Not Started',
        milestoneId: editingTask.milestoneId,
        duration: editingTask.duration || 1,
        parentTaskId: editingTask.parentTaskId,
        hierarchyLevel: editingTask.hierarchyLevel || 0,
        sortOrder: editingTask.sortOrder || 0,
        hasChildren: editingTask.hasChildren || false
      });
      setSelectedResources(editingTask.assignedResources || []);
      setSelectedStakeholders(editingTask.assignedStakeholders || []);
      setSelectedDependencies(editingTask.dependencies || []);
    } else {
      // Reset form for new task
      const newSortOrder = TaskHierarchyUtils.generateSortOrder(
        formData.parentTaskId, 
        0, 
        tasks
      );
      
      setFormData({
        name: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        baselineStartDate: new Date().toISOString().split('T')[0],
        baselineEndDate: new Date().toISOString().split('T')[0],
        progress: 0,
        assignedResources: [],
        assignedStakeholders: [],
        dependencies: [],
        priority: 'Medium',
        status: 'Not Started',
        milestoneId: undefined,
        duration: 1,
        parentTaskId: undefined,
        hierarchyLevel: 0,
        sortOrder: newSortOrder,
        hasChildren: false
      });
      setSelectedResources([]);
      setSelectedStakeholders([]);
      setSelectedDependencies([]);
    }
  }, [editingTask, tasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const taskData = {
      ...formData,
      assignedResources: selectedResources,
      assignedStakeholders: selectedStakeholders,
      dependencies: selectedDependencies,
    };

    try {
      if (isEditing && editingTask?.id) {
        await onUpdateTask(editingTask.id, taskData);
      } else {
        await onCreateTask(taskData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const addResource = (resourceId: string) => {
    if (!selectedResources.includes(resourceId)) {
      setSelectedResources([...selectedResources, resourceId]);
    }
  };

  const removeResource = (resourceId: string) => {
    setSelectedResources(selectedResources.filter(id => id !== resourceId));
  };

  const addStakeholder = (stakeholderId: string) => {
    if (!selectedStakeholders.includes(stakeholderId)) {
      setSelectedStakeholders([...selectedStakeholders, stakeholderId]);
    }
  };

  const removeStakeholder = (stakeholderId: string) => {
    setSelectedStakeholders(selectedStakeholders.filter(id => id !== stakeholderId));
  };

  const addDependency = (taskId: string) => {
    if (!selectedDependencies.includes(taskId) && taskId !== editingTask?.id) {
      setSelectedDependencies([...selectedDependencies, taskId]);
    }
  };

  const removeDependency = (taskId: string) => {
    setSelectedDependencies(selectedDependencies.filter(id => id !== taskId));
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Filter available dependency tasks (exclude self and descendants if editing)
  const availableDependencyTasks = tasks.filter(task => {
    if (task.id === editingTask?.id) return false;
    if (editingTask?.id) {
      // Exclude descendants to prevent circular dependencies
      const descendants = TaskHierarchyUtils.getTaskDescendants(editingTask.id, []);
      if (descendants.includes(task.id)) return false;
    }
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Task' : 'Create New Task'}
            {parentTask && (
              <div className="text-sm text-muted-foreground mt-1">
                Creating subtask under: <span className="font-medium">{parentTask.name}</span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Task Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter task name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dates and Timeline */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div>
                  <Label htmlFor="progress">Progress (%)</Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => handleInputChange('progress', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="milestone">Milestone</Label>
                <Select 
                  value={formData.milestoneId || ''} 
                  onValueChange={(value) => handleInputChange('milestoneId', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select milestone (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Milestone</SelectItem>
                    {milestones.map((milestone) => (
                      <SelectItem key={milestone.id} value={milestone.id}>
                        {milestone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Hierarchy Information */}
              {(parentTask || formData.hierarchyLevel > 0) && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <Label className="text-sm font-medium">Hierarchy Information</Label>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {parentTask && (
                      <div>Parent Task: <span className="font-medium">{parentTask.name}</span></div>
                    )}
                    <div>Hierarchy Level: {formData.hierarchyLevel}</div>
                    <div>Sort Order: {formData.sortOrder}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resources Section */}
          <div className="space-y-4">
            <div>
              <Label>Assigned Resources</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedResources.map((resourceId) => {
                  const resource = availableResources.find(r => r.id === resourceId);
                  return resource ? (
                    <Badge key={resourceId} variant="secondary" className="flex items-center gap-1">
                      {resource.name}
                      <button
                        type="button"
                        onClick={() => removeResource(resourceId)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
              <Select onValueChange={addResource}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Add resource" />
                </SelectTrigger>
                <SelectContent>
                  {availableResources
                    .filter(resource => !selectedResources.includes(resource.id))
                    .map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.name} - {resource.role}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Assigned Stakeholders</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedStakeholders.map((stakeholderId) => {
                  const stakeholder = availableStakeholders.find(s => s.id === stakeholderId);
                  return stakeholder ? (
                    <Badge key={stakeholderId} variant="secondary" className="flex items-center gap-1">
                      {stakeholder.name}
                      <button
                        type="button"
                        onClick={() => removeStakeholder(stakeholderId)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
              <Select onValueChange={addStakeholder}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Add stakeholder" />
                </SelectTrigger>
                <SelectContent>
                  {availableStakeholders
                    .filter(stakeholder => !selectedStakeholders.includes(stakeholder.id))
                    .map((stakeholder) => (
                      <SelectItem key={stakeholder.id} value={stakeholder.id}>
                        {stakeholder.name} - {stakeholder.role}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dependencies Section */}
          <div>
            <Label>Task Dependencies</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedDependencies.map((taskId) => {
                const task = tasks.find(t => t.id === taskId);
                return task ? (
                  <Badge key={taskId} variant="outline" className="flex items-center gap-1">
                    {task.name}
                    <button
                      type="button"
                      onClick={() => removeDependency(taskId)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null;
              })}
            </div>
            <Select onValueChange={addDependency}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Add dependency" />
            </SelectTrigger>
            <SelectContent>
              {availableDependencyTasks
                .filter(task => !selectedDependencies.includes(task.id))
                .map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
);
};

export default TaskCreationDialog;

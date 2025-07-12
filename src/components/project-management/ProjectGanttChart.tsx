
import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { ProjectTask, ProjectMilestone, RebaselineRequest } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar, ChevronLeft, ChevronRight, Users, Clock, Plus, Edit, Trash2, Target, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectGanttChartProps {
  projectId: string;
}

const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({ projectId }) => {
  const { getProject, addTask, updateTask, deleteTask, rebaselineTasks } = useProject();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showRebaselineDialog, setShowRebaselineDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | null>(null);
  const [rebaselineTask, setRebaselineTask] = useState<ProjectTask | null>(null);
  const [rebaselineData, setRebaselineData] = useState({ newStartDate: '', newEndDate: '', reason: '' });
  const [newTask, setNewTask] = useState<Partial<ProjectTask>>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    progress: 0,
    priority: 'Medium',
    status: 'Not Started',
    assignedResources: [],
    assignedStakeholders: [],
    dependencies: [],
    milestoneId: ''
  });

  const project = getProject(projectId);
  if (!project) return <div>Project not found</div>;

  // Available resources and stakeholders
  const availableResources = [
    { id: 'sarah', name: 'Sarah Johnson', role: 'Frontend Developer' },
    { id: 'michael', name: 'Michael Chen', role: 'Backend Developer' },
    { id: 'emily', name: 'Emily Rodriguez', role: 'UX Designer' },
    { id: 'david', name: 'David Kim', role: 'Project Manager' },
    { id: 'james', name: 'James Wilson', role: 'DevOps Engineer' }
  ];

  const availableStakeholders = [
    { id: 'john-doe', name: 'John Doe', role: 'Product Manager' },
    { id: 'jane-smith', name: 'Jane Smith', role: 'Business Analyst' },
    { id: 'mike-wilson', name: 'Mike Wilson', role: 'Tech Lead' }
  ];

  const generateTimelineData = () => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const days = [];
    
    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  const getTaskPosition = (task: ProjectTask, days: Date[]) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const monthStart = days[0];

    const startPos = Math.max(0, Math.floor((taskStart.getTime() - monthStart.getTime()) / (24 * 60 * 60 * 1000)));
    const endPos = Math.min(days.length - 1, Math.floor((taskEnd.getTime() - monthStart.getTime()) / (24 * 60 * 60 * 1000)));
    
    return { startPos, endPos, width: Math.max(1, endPos - startPos + 1) };
  };

  const getMilestonePosition = (milestone: ProjectMilestone, days: Date[]) => {
    const milestoneDate = new Date(milestone.date);
    const monthStart = days[0];
    const position = Math.floor((milestoneDate.getTime() - monthStart.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, Math.min(days.length - 1, position));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const isTaskDelayed = (task: ProjectTask) => {
    return new Date(task.endDate) > new Date(task.baselineEndDate);
  };

  const handleCreateTask = () => {
    if (newTask.name && newTask.startDate && newTask.endDate) {
      const startDate = new Date(newTask.startDate);
      const endDate = new Date(newTask.endDate);
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      
      const task: Omit<ProjectTask, 'id'> = {
        name: newTask.name,
        description: newTask.description || '',
        startDate: newTask.startDate,
        endDate: newTask.endDate,
        baselineStartDate: newTask.startDate,
        baselineEndDate: newTask.endDate,
        progress: newTask.progress || 0,
        assignedResources: newTask.assignedResources || [],
        assignedStakeholders: newTask.assignedStakeholders || [],
        dependencies: newTask.dependencies || [],
        priority: newTask.priority as 'High' | 'Medium' | 'Low',
        status: newTask.status as 'Not Started' | 'In Progress' | 'Completed' | 'On Hold',
        milestoneId: newTask.milestoneId,
        duration
      };
      
      addTask(projectId, task);
      resetNewTask();
      setShowTaskDialog(false);
      toast.success('Task created successfully');
    }
  };

  const handleEditTask = (task: ProjectTask) => {
    setEditingTask(task);
    setNewTask(task);
    setShowTaskDialog(true);
  };

  const handleUpdateTask = () => {
    if (editingTask && newTask.name && newTask.startDate && newTask.endDate) {
      const startDate = new Date(newTask.startDate);
      const endDate = new Date(newTask.endDate);
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));

      updateTask(projectId, editingTask.id, { 
        ...newTask as ProjectTask,
        duration
      });
      setEditingTask(null);
      resetNewTask();
      setShowTaskDialog(false);
      toast.success('Task updated successfully');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(projectId, taskId);
    toast.success('Task deleted successfully');
  };

  const handleRebaselineClick = (task: ProjectTask) => {
    setRebaselineTask(task);
    setRebaselineData({
      newStartDate: task.startDate,
      newEndDate: task.endDate,
      reason: ''
    });
    setShowRebaselineDialog(true);
  };

  const handleRebaseline = () => {
    if (rebaselineTask && rebaselineData.reason) {
      const dependentTasks = project.tasks.filter(t => 
        t.dependencies.includes(rebaselineTask.id)
      ).map(t => t.id);

      const request: RebaselineRequest = {
        taskId: rebaselineTask.id,
        newStartDate: rebaselineData.newStartDate,
        newEndDate: rebaselineData.newEndDate,
        reason: rebaselineData.reason,
        affectedTasks: dependentTasks
      };

      rebaselineTasks(projectId, request);
      setShowRebaselineDialog(false);
      setRebaselineTask(null);
      toast.success(`Task rebaselined. ${dependentTasks.length} dependent tasks updated.`);
    }
  };

  const resetNewTask = () => {
    setNewTask({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      progress: 0,
      priority: 'Medium',
      status: 'Not Started',
      assignedResources: [],
      assignedStakeholders: [],
      dependencies: [],
      milestoneId: ''
    });
  };

  const handleMilestoneClick = (milestone: ProjectMilestone) => {
    setSelectedMilestone(milestone);
  };

  const days = generateTimelineData();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Interactive Gantt Chart
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTask ? 'Edit Task' : 'Create New Task'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="taskName">Task Name</Label>
                        <Input
                          id="taskName"
                          value={newTask.name || ''}
                          onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                          placeholder="Enter task name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newTask.description || ''}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          placeholder="Task description..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={newTask.startDate || ''}
                            onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={newTask.endDate || ''}
                            onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <Select value={newTask.priority || 'Medium'} onValueChange={(value) => setNewTask({ ...newTask, priority: value as any })}>
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
                          <Select value={newTask.status || 'Not Started'} onValueChange={(value) => setNewTask({ ...newTask, status: value as any })}>
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
                        <Select value={newTask.milestoneId || ''} onValueChange={(value) => setNewTask({ ...newTask, milestoneId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select milestone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No milestone</SelectItem>
                            {project.milestones.map((milestone) => (
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
                          value={newTask.progress || 0}
                          onChange={(e) => setNewTask({ ...newTask, progress: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>Dependencies</Label>
                        <Select 
                          value="" 
                          onValueChange={(value) => {
                            if (value && !newTask.dependencies?.includes(value)) {
                              setNewTask({ 
                                ...newTask, 
                                dependencies: [...(newTask.dependencies || []), value] 
                              });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Add dependency" />
                          </SelectTrigger>
                          <SelectContent>
                            {project.tasks
                              .filter(t => t.id !== editingTask?.id)
                              .map((task) => (
                                <SelectItem key={task.id} value={task.id}>
                                  {task.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {newTask.dependencies && newTask.dependencies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {newTask.dependencies.map((depId) => {
                              const depTask = project.tasks.find(t => t.id === depId);
                              return (
                                <Badge key={depId} variant="outline" className="text-xs">
                                  {depTask?.name}
                                  <button
                                    onClick={() => setNewTask({
                                      ...newTask,
                                      dependencies: newTask.dependencies?.filter(d => d !== depId)
                                    })}
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
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => {
                      setShowTaskDialog(false);
                      setEditingTask(null);
                      resetNewTask();
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={editingTask ? handleUpdateTask : handleCreateTask}>
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          {selectedMilestone && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {selectedMilestone.name}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedMilestone(null)}>
                  ×
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{selectedMilestone.description}</p>
              <div className="text-sm">
                <span className="font-medium">Progress: {selectedMilestone.progress}%</span>
                <span className="mx-2">•</span>
                <span>Due: {new Date(selectedMilestone.date).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span>{project.tasks.filter(t => t.milestoneId === selectedMilestone.id).length} tasks</span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Timeline Header */}
              <div className="flex border-b border-border pb-2 mb-4">
                <div className="w-80 flex-shrink-0 text-sm font-medium text-muted-foreground">Task</div>
                <div className="flex-1 grid grid-cols-31 gap-px">
                  {days.map((day, index) => (
                    <div key={index} className="text-xs text-center text-muted-foreground p-1">
                      {day.getDate()}
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones Row */}
              <div className="flex items-center mb-4">
                <div className="w-80 flex-shrink-0 pr-4">
                  <div className="font-medium text-sm text-blue-600">Milestones</div>
                </div>
                <div className="flex-1 relative h-8">
                  <div className="grid grid-cols-31 gap-px h-full">
                    {days.map((_, index) => (
                      <div key={index} className="border-r border-border/30 h-full"></div>
                    ))}
                  </div>
                  {project.milestones.map((milestone) => {
                    const position = getMilestonePosition(milestone, days);
                    return (
                      <div
                        key={milestone.id}
                        className={`absolute top-0 w-2 h-8 ${getMilestoneStatusColor(milestone.status)} cursor-pointer hover:opacity-80 transition-opacity`}
                        style={{ left: `${(position / days.length) * 100}%` }}
                        onClick={() => handleMilestoneClick(milestone)}
                        title={`${milestone.name} - ${new Date(milestone.date).toLocaleDateString()}`}
                      />
                    );
                  })}
                </div>
              </div>

              <Separator className="mb-4" />

              {/* Task Rows */}
              <div className="space-y-3">
                {project.tasks.map((task) => {
                  const { startPos, width } = getTaskPosition(task, days);
                  const isDelayed = isTaskDelayed(task);
                  
                  return (
                    <div key={task.id} className="flex items-center">
                      {/* Task Info */}
                      <div className="w-80 flex-shrink-0 pr-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">{task.name}</div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTask(task)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              {isDelayed && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRebaselineClick(task)}
                                  className="h-6 w-6 p-0 text-orange-500"
                                  title="Rebaseline task"
                                >
                                  <AlertTriangle className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTask(task.id)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)} text-white`}>
                              {task.priority}
                            </Badge>
                            <Badge variant="secondary" className={`text-xs ${getStatusColor(task.status)}`}>
                              {task.status}
                            </Badge>
                            {isDelayed && (
                              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
                                Delayed
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {task.assignedResources.length}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.progress}%
                            </div>
                            <span>{task.duration}d</span>
                          </div>
                          {task.assignedResources.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Resources: {task.assignedResources.map(resourceId => 
                                availableResources.find(r => r.id === resourceId)?.name
                              ).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timeline Bar */}
                      <div className="flex-1 relative h-8">
                        <div className="grid grid-cols-31 gap-px h-full">
                          {days.map((_, index) => (
                            <div key={index} className="border-r border-border/30 h-full"></div>
                          ))}
                        </div>
                        <div 
                          className={`absolute top-1 h-6 ${getPriorityColor(task.priority)} rounded-md flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${isDelayed ? 'border-2 border-orange-400' : ''}`}
                          style={{
                            left: `${(startPos / days.length) * 100}%`,
                            width: `${(width / days.length) * 100}%`
                          }}
                          onClick={() => handleEditTask(task)}
                        >
                          {task.progress}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rebaseline Dialog */}
      <AlertDialog open={showRebaselineDialog} onOpenChange={setShowRebaselineDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rebaseline Task</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to rebaseline "{rebaselineTask?.name}". This will update the task's timeline and may affect dependent tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newStartDate">New Start Date</Label>
                <Input
                  id="newStartDate"
                  type="date"
                  value={rebaselineData.newStartDate}
                  onChange={(e) => setRebaselineData({ ...rebaselineData, newStartDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="newEndDate">New End Date</Label>
                <Input
                  id="newEndDate"
                  type="date"
                  value={rebaselineData.newEndDate}
                  onChange={(e) => setRebaselineData({ ...rebaselineData, newEndDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="reason">Reason for Rebaseline</Label>
              <Textarea
                id="reason"
                value={rebaselineData.reason}
                onChange={(e) => setRebaselineData({ ...rebaselineData, reason: e.target.value })}
                placeholder="Explain why this task needs to be rebaselined..."
                required
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRebaseline}>
              Rebaseline Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectGanttChart;

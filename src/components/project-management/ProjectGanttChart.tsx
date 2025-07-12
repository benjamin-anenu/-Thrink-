
import React, { useState, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { ProjectTask, ProjectMilestone, RebaselineRequest } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, ChevronLeft, ChevronRight, Plus, Target } from 'lucide-react';
import { toast } from 'sonner';
import { parseISO, addDays, startOfMonth, endOfMonth, format, differenceInDays } from 'date-fns';

import GanttTimeline from './gantt/GanttTimeline';
import GanttTaskRow from './gantt/GanttTaskRow';
import TaskCreationDialog from './gantt/TaskCreationDialog';

interface ProjectGanttChartProps {
  projectId: string;
}

const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({ projectId }) => {
  const { getProject, addTask, updateTask, deleteTask, rebaselineTasks } = useProject();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showRebaselineDialog, setShowRebaselineDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | null>(null);
  const [rebaselineTask, setRebaselineTask] = useState<ProjectTask | null>(null);
  const [rebaselineData, setRebaselineData] = useState({ newStartDate: '', newEndDate: '', reason: '' });

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

  // Calculate timeline bounds based on project dates
  const timelineBounds = useMemo(() => {
    const projectStart = parseISO(project.startDate);
    const projectEnd = parseISO(project.endDate);
    
    // Add some padding to show context
    const startDate = addDays(startOfMonth(projectStart), -7);
    const endDate = addDays(endOfMonth(projectEnd), 7);
    
    return { startDate, endDate };
  }, [project.startDate, project.endDate]);

  const getMilestonePosition = (milestone: ProjectMilestone) => {
    const milestoneDate = parseISO(milestone.date);
    const totalDays = differenceInDays(timelineBounds.endDate, timelineBounds.startDate) + 1;
    const position = differenceInDays(milestoneDate, timelineBounds.startDate);
    return Math.max(0, Math.min(100, (position / totalDays) * 100));
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const handleCreateTask = (task: Omit<ProjectTask, 'id'>) => {
    addTask(projectId, task);
    toast.success('Task created successfully');
  };

  const handleEditTask = (task: ProjectTask) => {
    setEditingTask(task);
    setShowTaskDialog(true);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<ProjectTask>) => {
    updateTask(projectId, taskId, updates);
    setEditingTask(null);
    toast.success('Task updated successfully');
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

  const handleMilestoneClick = (milestone: ProjectMilestone) => {
    setSelectedMilestone(milestone);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

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
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                className="flex items-center gap-2"
                onClick={() => {
                  setEditingTask(null);
                  setShowTaskDialog(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
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
                <span>Due: {format(parseISO(selectedMilestone.date), 'MMM d, yyyy')}</span>
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
              <GanttTimeline 
                startDate={timelineBounds.startDate}
                endDate={timelineBounds.endDate}
                viewMode="day"
              />

              {/* Milestones Row */}
              <div className="flex items-center mb-4">
                <div className="w-80 flex-shrink-0 pr-4">
                  <div className="font-medium text-sm text-blue-600">Milestones</div>
                </div>
                <div className="flex-1 relative h-8">
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: differenceInDays(timelineBounds.endDate, timelineBounds.startDate) + 1 }).map((_, index) => (
                      <div key={index} className="flex-1 border-r border-border/20 h-full"></div>
                    ))}
                  </div>
                  {project.milestones.map((milestone) => {
                    const position = getMilestonePosition(milestone);
                    return (
                      <div
                        key={milestone.id}
                        className={`absolute top-0 w-2 h-8 ${getMilestoneStatusColor(milestone.status)} cursor-pointer hover:opacity-80 transition-opacity`}
                        style={{ left: `${position}%` }}
                        onClick={() => handleMilestoneClick(milestone)}
                        title={`${milestone.name} - ${format(parseISO(milestone.date), 'MMM d, yyyy')}`}
                      />
                    );
                  })}
                </div>
              </div>

              <Separator className="mb-4" />

              {/* Task Rows */}
              <div className="space-y-1">
                {project.tasks.map((task) => (
                  <GanttTaskRow
                    key={task.id}
                    task={task}
                    startDate={timelineBounds.startDate}
                    endDate={timelineBounds.endDate}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onRebaselineTask={handleRebaselineClick}
                    availableResources={availableResources}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Creation/Edit Dialog */}
      <TaskCreationDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        onCreateTask={handleCreateTask}
        onUpdateTask={handleUpdateTask}
        editingTask={editingTask}
        tasks={project.tasks}
        milestones={project.milestones}
        availableResources={availableResources}
        availableStakeholders={availableStakeholders}
      />

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
                  onChange={(e) => setRebaselineData(prev => ({ ...prev, newStartDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="newEndDate">New End Date</Label>
                <Input
                  id="newEndDate"
                  type="date"
                  value={rebaselineData.newEndDate}
                  onChange={(e) => setRebaselineData(prev => ({ ...prev, newEndDate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="reason">Reason for Rebaseline</Label>
              <Textarea
                id="reason"
                value={rebaselineData.reason}
                onChange={(e) => setRebaselineData(prev => ({ ...prev, reason: e.target.value }))}
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

import React, { useState, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { ProjectTask, ProjectMilestone, RebaselineRequest } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Filter, ChevronDown, ChevronRight, Target, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import MilestoneManagementDialog from './MilestoneManagementDialog';
import TaskRow from './TaskRow';

import TaskTableRow from './table/TaskTableRow';
import TaskCreationDialog from './gantt/TaskCreationDialog';
import TableControls from './table/TableControls';
import ResizableTable from './table/ResizableTable';

interface ProjectGanttChartProps {
  projectId: string;
}

const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({ projectId }) => {
  const { getProject } = useProject();
  
  // ALL early returns MUST happen before any hooks are called
  if (!projectId) {
    return <div>No project ID provided</div>;
  }

  const project = getProject(projectId);
  if (!project) {
    return <div className="p-6 text-center text-muted-foreground">Project not found</div>;
  }
  
  // Now we can safely call all hooks - they will ALWAYS be called in the same order
  const { 
    tasks, 
    milestones, 
    loading, 
    createTask, 
    updateTask: updateTaskDB, 
    deleteTask: deleteTaskDB,
    createMilestone,
    updateMilestone,
    deleteMilestone
  } = useTaskManagement(projectId);
  
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [showRebaselineDialog, setShowRebaselineDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const [rebaselineTask, setRebaselineTask] = useState<ProjectTask | null>(null);
  const [rebaselineData, setRebaselineData] = useState({ newStartDate: '', newEndDate: '', reason: '' });
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<string>('startDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // New table state management
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tableDensity, setTableDensity] = useState<'compact' | 'normal' | 'comfortable'>('normal');

  // Available resources and stakeholders - should be fetched from database in production
  const availableResources = useMemo(() => [
    { id: 'sarah', name: 'Sarah Johnson', role: 'Frontend Developer', email: 'sarah@company.com' },
    { id: 'michael', name: 'Michael Chen', role: 'Backend Developer', email: 'michael@company.com' },
    { id: 'emily', name: 'Emily Rodriguez', role: 'UX Designer', email: 'emily@company.com' },
    { id: 'david', name: 'David Kim', role: 'Project Manager', email: 'david@company.com' },
    { id: 'james', name: 'James Wilson', role: 'DevOps Engineer', email: 'james@company.com' }
  ], []);

  const availableStakeholders = useMemo(() => [
    { id: 'john-doe', name: 'John Doe', role: 'Product Manager', email: 'john@company.com' },
    { id: 'jane-smith', name: 'Jane Smith', role: 'Business Analyst', email: 'jane@company.com' },
    { id: 'mike-wilson', name: 'Mike Wilson', role: 'Tech Lead', email: 'mike@company.com' }
  ], []);

  // Group tasks by milestone with safe data handling
  const groupedTasks = useMemo(() => {
    if (!Array.isArray(tasks) || !Array.isArray(milestones)) {
      return { 'no-milestone': { milestone: null, tasks: [] } };
    }
    
    const groups: { [key: string]: { milestone: ProjectMilestone | null; tasks: ProjectTask[] } } = {};
    
    // Initialize groups for each milestone
    milestones.forEach(milestone => {
      if (milestone && milestone.id) {
        groups[milestone.id] = { milestone, tasks: [] };
      }
    });
    
    // Add group for tasks without milestone
    groups['no-milestone'] = { milestone: null, tasks: [] };
    
    // Assign tasks to groups
    tasks.forEach(task => {
      if (!task || !task.id) return;
      
      const groupKey = task.milestoneId || 'no-milestone';
      if (groups[groupKey]) {
        groups[groupKey].tasks.push(task);
      } else {
        groups['no-milestone'].tasks.push(task);
      }
    });
    
    // Sort tasks within each group
    Object.values(groups).forEach(group => {
      if (group.tasks) {
        group.tasks.sort((a, b) => {
          try {
            const aValue = (a as any)[sortBy] || '';
            const bValue = (b as any)[sortBy] || '';
            const modifier = sortDirection === 'asc' ? 1 : -1;
            
            if (aValue < bValue) return -1 * modifier;
            if (aValue > bValue) return 1 * modifier;
            return 0;
          } catch {
            return 0;
          }
        });
      }
    });
    
    return groups;
  }, [tasks, milestones, sortBy, sortDirection]);

  // NO MORE EARLY RETURNS AFTER THIS POINT - ALL HOOKS CALLED CONSISTENTLY
  
  // Handle loading state in render, not with early return
  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading tasks and milestones...</div>;
  }

  // Table control handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => setZoomLevel(1);
  const handleDensityChange = (density: 'compact' | 'normal' | 'comfortable') => setTableDensity(density);
  
  const handleExport = () => {
    toast.info('Export functionality will be implemented');
  };

  const handleCreateTask = async (task: Omit<ProjectTask, 'id'>) => {
    try {
      await createTask(task);
      toast.success('Task created successfully');
      setShowTaskDialog(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleEditTask = (task: ProjectTask) => {
    setEditingTask(task);
    setShowTaskDialog(true);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<ProjectTask>) => {
    try {
      await updateTaskDB(taskId, updates);
      toast.success('Task updated successfully');
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTaskDB(taskId);
      toast.success('Task deleted successfully');
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleCreateMilestone = async (milestone: Omit<ProjectMilestone, 'id'>) => {
    try {
      await createMilestone(milestone);
      toast.success('Milestone created successfully');
      setShowMilestoneDialog(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleEditMilestone = (milestone: ProjectMilestone) => {
    setEditingMilestone(milestone);
    setShowMilestoneDialog(true);
  };

  const handleUpdateMilestone = async (milestoneId: string, updates: Partial<ProjectMilestone>) => {
    try {
      await updateMilestone(milestoneId, updates);
      toast.success('Milestone updated successfully');
      setShowMilestoneDialog(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      await deleteMilestone(milestoneId);
      toast.success('Milestone deleted successfully');
    } catch (error) {
      // Error is handled in the hook
    }
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

  const handleRebaseline = async () => {
    if (rebaselineTask && rebaselineData.reason) {
      try {
        await updateTaskDB(rebaselineTask.id, {
          startDate: rebaselineData.newStartDate,
          endDate: rebaselineData.newEndDate
        });
        
        setShowRebaselineDialog(false);
        setRebaselineTask(null);
        toast.success('Task rebaselined successfully');
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  const toggleMilestone = (milestoneId: string) => {
    const newExpanded = new Set(expandedMilestones);
    if (newExpanded.has(milestoneId)) {
      newExpanded.delete(milestoneId);
    } else {
      newExpanded.add(milestoneId);
    }
    setExpandedMilestones(newExpanded);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <Card className="table-container">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Project Task Management
            </CardTitle>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  setEditingMilestone(null);
                  setShowMilestoneDialog(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Milestone
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
        </CardHeader>
        
        <CardContent className="p-0">
          <TableControls
            zoomLevel={zoomLevel}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            tableDensity={tableDensity}
            onDensityChange={handleDensityChange}
            onExport={handleExport}
          />
          
          <div className="overflow-auto bg-background">
            <div className="min-w-[1400px]">
              {/* Fixed Table Header */}
              <div className="grid grid-cols-12 gap-0 border-b bg-muted/50 sticky top-0 z-20 backdrop-blur-sm">
                <div className="col-span-2 p-3 font-medium border-r cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort('name')}>
                  Task Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-1 p-3 font-medium border-r cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort('status')}>
                  Status {sortBy === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-1 p-3 font-medium border-r cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort('priority')}>
                  Priority {sortBy === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-1 p-3 font-medium border-r">Resources</div>
                <div className="col-span-1 p-3 font-medium border-r cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort('startDate')}>
                  Start Date {sortBy === 'startDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-1 p-3 font-medium border-r cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort('endDate')}>
                  End Date {sortBy === 'endDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-1 p-3 font-medium border-r cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort('duration')}>
                  Duration {sortBy === 'duration' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-1 p-3 font-medium border-r cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort('progress')}>
                  Progress {sortBy === 'progress' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-1 p-3 font-medium border-r">Dependencies</div>
                <div className="col-span-1 p-3 font-medium border-r">Milestone</div>
                <div className="col-span-1 p-3 font-medium">Actions</div>
              </div>
              
              {/* Task Content */}
              <div className="space-y-0">
                {Object.entries(groupedTasks).map(([groupKey, group]) => (
                  <React.Fragment key={groupKey}>
                    {/* Milestone Header */}
                    {group.milestone && (
                      <div className="border-b bg-muted/30">
                        <Collapsible
                          open={expandedMilestones.has(group.milestone.id)}
                          onOpenChange={() => toggleMilestone(group.milestone.id)}
                        >
                          <CollapsibleTrigger className="w-full p-3 hover:bg-muted/40 transition-colors">
                            <div className="flex items-center gap-2 w-full text-left">
                              {expandedMilestones.has(group.milestone.id) ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              <Target className="h-4 w-4 text-primary" />
                              <span className="font-semibold text-foreground">{group.milestone.name}</span>
                              <Badge variant="outline" className="ml-2">
                                {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`ml-1 ${
                                  group.milestone.status === 'completed' ? 'bg-success/10 text-success border-success/20' :
                                  group.milestone.status === 'in-progress' ? 'bg-primary/10 text-primary border-primary/20' :
                                  group.milestone.status === 'overdue' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                  'bg-muted text-muted-foreground'
                                }`}
                              >
                                {group.milestone.status}
                              </Badge>
                              <div className="ml-auto flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-muted"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditMilestone(group.milestone!);
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMilestone(group.milestone!.id);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="space-y-0">
                              {group.tasks.map((task) => (
                                <div key={task.id} className="grid grid-cols-12 gap-0 border-b hover:bg-muted/50">
                                  <div className="col-span-2 p-3 border-r">
                                    <div className="font-medium">{task.name}</div>
                                  </div>
                                  <div className="col-span-1 p-3 border-r">
                                    <Badge variant="outline">{task.status}</Badge>
                                  </div>
                                  <div className="col-span-1 p-3 border-r">
                                    <Badge variant="outline">{task.priority}</Badge>
                                  </div>
                                  <div className="col-span-1 p-3 border-r">
                                    <div className="flex flex-wrap gap-1">
                                      {Array.isArray(task.assignedResources) && task.assignedResources.map(resourceId => {
                                        const resource = availableResources.find(r => r.id === resourceId);
                                        return resource ? (
                                          <Badge key={resourceId} variant="secondary" className="text-xs">
                                            {resource.name}
                                          </Badge>
                                        ) : null;
                                      })}
                                    </div>
                                  </div>
                                  <div className="col-span-1 p-3 border-r text-sm">{task.startDate || '-'}</div>
                                  <div className="col-span-1 p-3 border-r text-sm">{task.endDate || '-'}</div>
                                  <div className="col-span-1 p-3 border-r text-sm">{task.duration || 1}d</div>
                                  <div className="col-span-1 p-3 border-r text-sm">{task.progress || 0}%</div>
                                  <div className="col-span-1 p-3 border-r text-sm">
                                    {Array.isArray(task.dependencies) && task.dependencies.length > 0 ? `${task.dependencies.length} deps` : '-'}
                                  </div>
                                  <div className="col-span-1 p-3 border-r text-sm">
                                    {group.milestone?.name || '-'}
                                  </div>
                                  <div className="col-span-1 p-3">
                                    <div className="flex items-center gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleEditTask(task)}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteTask(task.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    )}
                    
                    {/* Tasks without milestone */}
                    {groupKey === 'no-milestone' && group.tasks.length > 0 && (
                      <>
                        {group.tasks.map((task) => (
                          <div key={task.id} className="grid grid-cols-12 gap-0 border-b hover:bg-muted/50">
                            <div className="col-span-2 p-3 border-r">
                              <div className="font-medium">{task.name}</div>
                            </div>
                            <div className="col-span-1 p-3 border-r">
                              <Badge variant="outline">{task.status}</Badge>
                            </div>
                            <div className="col-span-1 p-3 border-r">
                              <Badge variant="outline">{task.priority}</Badge>
                            </div>
                             <div className="col-span-1 p-3 border-r">
                               <div className="flex flex-wrap gap-1">
                                 {Array.isArray(task.assignedResources) && task.assignedResources.map(resourceId => {
                                   const resource = availableResources.find(r => r.id === resourceId);
                                   return resource ? (
                                     <Badge key={resourceId} variant="secondary" className="text-xs">
                                       {resource.name}
                                     </Badge>
                                   ) : null;
                                 })}
                               </div>
                             </div>
                             <div className="col-span-1 p-3 border-r text-sm">{task.startDate || '-'}</div>
                             <div className="col-span-1 p-3 border-r text-sm">{task.endDate || '-'}</div>
                             <div className="col-span-1 p-3 border-r text-sm">{task.duration || 1}d</div>
                             <div className="col-span-1 p-3 border-r text-sm">{task.progress || 0}%</div>
                             <div className="col-span-1 p-3 border-r text-sm">
                               {Array.isArray(task.dependencies) && task.dependencies.length > 0 ? `${task.dependencies.length} deps` : '-'}
                             </div>
                            <div className="col-span-1 p-3 border-r text-sm">-</div>
                            <div className="col-span-1 p-3">
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditTask(task)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <TaskCreationDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        onCreateTask={handleCreateTask}
        onUpdateTask={handleUpdateTask}
        editingTask={editingTask}
        tasks={tasks}
        milestones={milestones}
        availableResources={availableResources}
        availableStakeholders={availableStakeholders}
      />

      <MilestoneManagementDialog
        open={showMilestoneDialog}
        onOpenChange={setShowMilestoneDialog}
        onCreateMilestone={handleCreateMilestone}
        onUpdateMilestone={handleUpdateMilestone}
        editingMilestone={editingMilestone}
      />

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
    </ErrorBoundary>
  );
};

export default ProjectGanttChart;
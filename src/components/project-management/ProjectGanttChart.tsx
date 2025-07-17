
import React, { useState, useMemo, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { ProjectTask, ProjectMilestone, TaskHierarchyNode } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ChevronDown, ChevronRight, Target, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { TaskHierarchyUtils } from '@/utils/taskHierarchy';
import MilestoneManagementDialog from './MilestoneManagementDialog';
import TaskCreationDialog from './gantt/TaskCreationDialog';
import TableControls from './table/TableControls';
import ResizableTable from './table/ResizableTable';
import DeleteTaskConfirmationDialog from './DeleteTaskConfirmationDialog';
import TaskFilterDialog, { TaskFilters } from './table/TaskFilterDialog';
import TaskHierarchyRenderer from './table/TaskHierarchyRenderer';
import { supabase } from '@/integrations/supabase/client';

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
    deleteMilestone,
    refreshData
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

  // Task filtering state
  const [taskFilters, setTaskFilters] = useState<TaskFilters>({});

  // Hierarchy state management
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Load resources and stakeholders from database
  const [availableResources, setAvailableResources] = useState<Array<{ id: string; name: string; role: string; email?: string }>>([]);
  const [availableStakeholders, setAvailableStakeholders] = useState<Array<{ id: string; name: string; role: string; email?: string }>>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<ProjectTask | null>(null);

  // Load resources and stakeholders from database
  useEffect(() => {
    const loadResourcesAndStakeholders = async () => {
      try {
        // Load resources
        const { data: resourcesData, error: resourcesError } = await supabase
          .from('resources')
          .select('id, name, role, email')
          .order('name');

        if (resourcesError) {
          console.error('Error loading resources:', resourcesError);
        } else {
          setAvailableResources((resourcesData || []).map(r => ({
            id: r.id,
            name: r.name,
            role: r.role || 'Unknown',
            email: r.email
          })));
        }

        // Load stakeholders
        const { data: stakeholdersData, error: stakeholdersError } = await supabase
          .from('stakeholders')
          .select('id, name, role, email')
          .eq('workspace_id', project.workspaceId)
          .order('name');

        if (stakeholdersError) {
          console.error('Error loading stakeholders:', stakeholdersError);
        } else {
          setAvailableStakeholders((stakeholdersData || []).map(s => ({
            id: s.id,
            name: s.name,
            role: s.role || 'Unknown',
            email: s.email
          })));
        }
      } catch (error) {
        console.error('Error loading resources and stakeholders:', error);
      }
    };

    if (project?.workspaceId) {
      loadResourcesAndStakeholders();
    }
  }, [project?.workspaceId]);

  // Enhanced task filtering with dependency conflicts
  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    
    return tasks.filter(task => {
      // Search filter
      if (taskFilters.search) {
        const searchLower = taskFilters.search.toLowerCase();
        if (!task.name.toLowerCase().includes(searchLower) && 
            !task.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (taskFilters.status && task.status !== taskFilters.status) {
        return false;
      }

      // Priority filter
      if (taskFilters.priority && task.priority !== taskFilters.priority) {
        return false;
      }

      // Assignee filter
      if (taskFilters.assignee) {
        if (taskFilters.assignee === 'unassigned') {
          if (task.assignedResources.length > 0) return false;
        } else {
          if (!task.assignedResources.includes(taskFilters.assignee)) return false;
        }
      }

      // Milestone filter
      if (taskFilters.milestone) {
        if (taskFilters.milestone === 'no-milestone') {
          if (task.milestoneId) return false;
        } else {
          if (task.milestoneId !== taskFilters.milestone) return false;
        }
      }

      // Date range filter
      if (taskFilters.dateRange?.start || taskFilters.dateRange?.end) {
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.endDate);
        
        if (taskFilters.dateRange.start && taskEnd < new Date(taskFilters.dateRange.start)) {
          return false;
        }
        
        if (taskFilters.dateRange.end && taskStart > new Date(taskFilters.dateRange.end)) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, taskFilters]);

  // Group tasks by milestone with hierarchical structure
  const groupedTasksWithHierarchy = useMemo(() => {
    if (!Array.isArray(filteredTasks) || !Array.isArray(milestones)) {
      return { 'no-milestone': { milestone: null, hierarchyTree: [] } };
    }
    
    const groups: { [key: string]: { milestone: ProjectMilestone | null; hierarchyTree: TaskHierarchyNode[] } } = {};
    
    // Initialize groups for each milestone
    milestones.forEach(milestone => {
      if (milestone && milestone.id) {
        groups[milestone.id] = { milestone, hierarchyTree: [] };
      }
    });
    
    // Add group for tasks without milestone
    groups['no-milestone'] = { milestone: null, hierarchyTree: [] };
    
    // Group tasks by milestone and build hierarchy for each group
    const tasksByMilestone: { [key: string]: ProjectTask[] } = {};
    
    filteredTasks.forEach(task => {
      if (!task || !task.id) return;
      
      const groupKey = task.milestoneId || 'no-milestone';
      if (!tasksByMilestone[groupKey]) {
        tasksByMilestone[groupKey] = [];
      }
      tasksByMilestone[groupKey].push(task);
    });
    
    // Build hierarchy tree for each milestone group
    Object.keys(tasksByMilestone).forEach(groupKey => {
      const groupTasks = tasksByMilestone[groupKey];
      if (groupTasks && groupTasks.length > 0) {
        const hierarchyTree = TaskHierarchyUtils.buildHierarchyTree(groupTasks);
        if (groups[groupKey]) {
          groups[groupKey].hierarchyTree = hierarchyTree;
        }
      }
    });
    
    return groups;
  }, [filteredTasks, milestones]);

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
      // Fix UUID conversion issues
      const taskData = {
        ...task,
        // Ensure milestoneId is properly handled as UUID or null
        milestoneId: task.milestoneId && task.milestoneId !== '' ? task.milestoneId : undefined,
      };
      
      await createTask(taskData);
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

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
      setShowDeleteDialog(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    
    try {
      await deleteTaskDB(taskToDelete.id);
      toast.success('Task deleted successfully');
      setShowDeleteDialog(false);
      setTaskToDelete(null);
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
      // Refresh data to ensure UI is updated
      await refreshData();
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

  // Fixed: Proper rebaseline handling with baseline date updates
  const handleRebaseline = async () => {
    if (rebaselineTask && rebaselineData.reason) {
      try {
        await updateTaskDB(rebaselineTask.id, {
          startDate: rebaselineData.newStartDate,
          endDate: rebaselineData.newEndDate,
          // Update baseline dates to current values before changing
          baselineStartDate: rebaselineTask.startDate,
          baselineEndDate: rebaselineTask.endDate
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

  // Hierarchy control handlers
  const handleToggleExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedNodes(newExpanded);
  };

  const handlePromoteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const canMove = TaskHierarchyUtils.canMoveTask(taskId, undefined, Object.values(groupedTasksWithHierarchy).flatMap(g => g.hierarchyTree));
    if (!canMove.canMove) {
      toast.error(canMove.reason || 'Cannot promote task');
      return;
    }

    try {
      const newLevel = Math.max(0, task.hierarchyLevel - 1);
      const newSortOrder = TaskHierarchyUtils.generateSortOrder(undefined, 0, tasks);
      
      await handleUpdateTask(taskId, {
        parentTaskId: undefined,
        hierarchyLevel: newLevel,
        sortOrder: newSortOrder
      });
      toast.success('Task promoted successfully');
    } catch (error) {
      toast.error('Failed to promote task');
    }
  };

  const handleDemoteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const siblings = TaskHierarchyUtils.getTaskSiblings(taskId, tasks);
    
    if (!task || siblings.length === 0) {
      toast.error('Cannot demote task - no suitable parent found');
      return;
    }

    // Find the previous sibling to use as parent
    const taskIndex = siblings.findIndex(s => s.sortOrder > task.sortOrder);
    const newParent = taskIndex > 0 ? siblings[taskIndex - 1] : siblings[0];

    const canMove = TaskHierarchyUtils.canMoveTask(taskId, newParent.id, Object.values(groupedTasksWithHierarchy).flatMap(g => g.hierarchyTree));
    if (!canMove.canMove) {
      toast.error(canMove.reason || 'Cannot demote task');
      return;
    }

    try {
      const newLevel = newParent.hierarchyLevel + 1;
      const newSortOrder = TaskHierarchyUtils.generateSortOrder(newParent.id, 0, tasks);
      
      await handleUpdateTask(taskId, {
        parentTaskId: newParent.id,
        hierarchyLevel: newLevel,
        sortOrder: newSortOrder
      });
      toast.success('Task demoted successfully');
    } catch (error) {
      toast.error('Failed to demote task');
    }
  };

  const handleAddSubtask = (parentTaskId: string) => {
    const parentTask = tasks.find(t => t.id === parentTaskId);
    if (!parentTask) return;

    // Set the editing task with parent context for the dialog
    setEditingTask({
      id: '',
      name: '',
      description: '',
      startDate: parentTask.endDate,
      endDate: parentTask.endDate,
      baselineStartDate: parentTask.endDate,
      baselineEndDate: parentTask.endDate,
      progress: 0,
      assignedResources: [],
      assignedStakeholders: [],
      dependencies: [],
      priority: parentTask.priority,
      status: 'Not Started',
      milestoneId: parentTask.milestoneId,
      duration: 1,
      parentTaskId: parentTaskId,
      hierarchyLevel: parentTask.hierarchyLevel + 1,
      sortOrder: TaskHierarchyUtils.generateSortOrder(parentTaskId, 0, tasks),
      hasChildren: false
    } as ProjectTask);
    
    setShowTaskDialog(true);
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <Card className="table-container">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Project Task Management
              {tasks.some(task => task.dependencies.length > 0) && (
                <Badge variant="outline" className="ml-2">
                  {tasks.filter(task => task.dependencies.length > 0).length} with dependencies
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <TaskFilterDialog
                filters={taskFilters}
                onFiltersChange={setTaskFilters}
                availableResources={availableResources}
                milestones={milestones}
                tasks={tasks}
              />
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
          
          <ResizableTable
            zoomLevel={zoomLevel}
            tableDensity={tableDensity}
            className="w-full"
          >
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort('name')}>
                  Task Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort('status')}>
                  Status {sortBy === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort('priority')}>
                  Priority {sortBy === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Resources</TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort('startDate')}>
                  Start Date {sortBy === 'startDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort('endDate')}>
                  End Date {sortBy === 'endDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort('duration')}>
                  Duration {sortBy === 'duration' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort('progress')}>
                  Progress {sortBy === 'progress' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="w-64 max-w-64 text-xs leading-tight px-2">
                  <span className="block truncate">Dependencies</span>
                </TableHead>
                <TableHead>Milestone</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedTasksWithHierarchy).map(([groupKey, group]) => (
                <React.Fragment key={groupKey}>
                  {/* Milestone Header Row */}
                  {group.milestone && (
                    <TableRow className="bg-muted/30 hover:bg-muted/40">
                      <td colSpan={12} className="p-0 border-b">
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
                                {TaskHierarchyUtils.flattenHierarchy(group.hierarchyTree).length} task{TaskHierarchyUtils.flattenHierarchy(group.hierarchyTree).length !== 1 ? 's' : ''}
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
                        </Collapsible>
                      </td>
                    </TableRow>
                  )}
                  
                  {/* Hierarchical Task Rows - Show if no milestone or milestone is expanded */}
                  {(groupKey === 'no-milestone' || (group.milestone && expandedMilestones.has(group.milestone.id))) && (
                    <TaskHierarchyRenderer
                      hierarchyTree={group.hierarchyTree}
                      expandedNodes={expandedNodes}
                      milestones={milestones}
                      availableResources={availableResources}
                      availableStakeholders={availableStakeholders}
                      allTasks={tasks}
                      onUpdateTask={handleUpdateTask}
                      onDeleteTask={handleDeleteTask}
                      onEditTask={handleEditTask}
                      onRebaselineTask={handleRebaselineClick}
                      onToggleExpansion={handleToggleExpansion}
                      onPromoteTask={handlePromoteTask}
                      onDemoteTask={handleDemoteTask}
                      onAddSubtask={handleAddSubtask}
                    />
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </ResizableTable>
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
              You are about to rebaseline "{rebaselineTask?.name}". This will update the task's timeline and save the current dates as the new baseline.
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

      {/* Delete Confirmation Dialog */}
      <DeleteTaskConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        task={taskToDelete}
        allTasks={tasks}
        onConfirm={handleConfirmDelete}
      />
      </div>
    </ErrorBoundary>
  );
};

export default ProjectGanttChart;

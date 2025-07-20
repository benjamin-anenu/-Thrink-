
import React, { useState, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronDown, ChevronRight, Target, Calendar, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import TaskCreationDialog from './gantt/TaskCreationDialog';
import MilestoneManagementDialog from './MilestoneManagementDialog';
import TaskFilterDialog, { TaskFilters } from './table/TaskFilterDialog';
import TaskTableRow from './table/TaskTableRow';
import TableControls from './table/TableControls';
import { supabase } from '@/integrations/supabase/client';

interface ProjectGanttChartProps {
  projectId: string;
}

const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({ projectId }) => {
  const { getProject } = useProject();
  
  if (!projectId) {
    return <div>No project ID provided</div>;
  }

  const project = getProject(projectId);
  if (!project) {
    return <div className="p-6 text-center text-muted-foreground">Project not found</div>;
  }
  
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
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const [taskFilters, setTaskFilters] = useState<TaskFilters>({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tableDensity, setTableDensity] = useState<'compact' | 'normal' | 'comfortable'>('normal');

  // Inline creation states
  const [showInlineTaskForm, setShowInlineTaskForm] = useState(false);
  const [showInlineMilestoneForm, setShowInlineMilestoneForm] = useState(false);
  const [inlineTaskData, setInlineTaskData] = useState({
    name: '',
    priority: 'Medium',
    status: 'Not Started',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [inlineMilestoneData, setInlineMilestoneData] = useState({
    name: '',
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Load resources and stakeholders
  const [availableResources, setAvailableResources] = useState<Array<{ id: string; name: string; role: string; email?: string }>>([]);
  const [availableStakeholders, setAvailableStakeholders] = useState<Array<{ id: string; name: string; role: string; email?: string }>>([]);

  React.useEffect(() => {
    const loadResourcesAndStakeholders = async () => {
      try {
        const { data: resourcesData } = await supabase
          .from('resources')
          .select('id, name, role, email')
          .order('name');

        const { data: stakeholdersData } = await supabase
          .from('stakeholders')
          .select('id, name, role, email')
          .eq('workspace_id', project.workspaceId)
          .order('name');

        if (resourcesData) {
          setAvailableResources(resourcesData.map(r => ({
            id: r.id,
            name: r.name,
            role: r.role || 'Unknown',
            email: r.email
          })));
        }

        if (stakeholdersData) {
          setAvailableStakeholders(stakeholdersData.map(s => ({
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

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    
    return tasks.filter(task => {
      if (taskFilters.search) {
        const searchLower = taskFilters.search.toLowerCase();
        if (!task.name.toLowerCase().includes(searchLower) && 
            !task.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      if (taskFilters.status && task.status !== taskFilters.status) {
        return false;
      }

      if (taskFilters.priority && task.priority !== taskFilters.priority) {
        return false;
      }

      if (taskFilters.assignee) {
        if (taskFilters.assignee === 'unassigned') {
          if (task.assignedResources.length > 0) return false;
        } else {
          if (!task.assignedResources.includes(taskFilters.assignee)) return false;
        }
      }

      if (taskFilters.milestone) {
        if (taskFilters.milestone === 'no-milestone') {
          if (task.milestoneId) return false;
        } else {
          if (task.milestoneId !== taskFilters.milestone) return false;
        }
      }

      return true;
    });
  }, [tasks, taskFilters]);

  // Group tasks by milestone
  const groupedTasks = useMemo(() => {
    if (!Array.isArray(filteredTasks) || !Array.isArray(milestones)) {
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
    filteredTasks.forEach(task => {
      if (!task || !task.id) return;
      
      const groupKey = task.milestoneId || 'no-milestone';
      if (groups[groupKey]) {
        groups[groupKey].tasks.push(task);
      } else {
        groups['no-milestone'].tasks.push(task);
      }
    });
    
    return groups;
  }, [filteredTasks, milestones]);

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading tasks and milestones...</div>;
  }

  const handleCreateTask = async (task: Omit<ProjectTask, 'id'>) => {
    try {
      const taskData = {
        ...task,
        milestoneId: task.milestoneId && task.milestoneId !== '' ? task.milestoneId : undefined,
      };
      
      await createTask(taskData);
      toast.success('Task created successfully');
      setShowTaskDialog(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleInlineTaskCreate = async () => {
    try {
      const taskData = {
        name: inlineTaskData.name,
        description: '',
        startDate: inlineTaskData.start_date,
        endDate: inlineTaskData.end_date,
        baselineStartDate: inlineTaskData.start_date,
        baselineEndDate: inlineTaskData.end_date,
        priority: inlineTaskData.priority as 'Low' | 'Medium' | 'High' | 'Critical',
        status: inlineTaskData.status as 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled',
        progress: 0,
        duration: Math.ceil((new Date(inlineTaskData.end_date).getTime() - new Date(inlineTaskData.start_date).getTime()) / (24 * 60 * 60 * 1000)),
        dependencies: [],
        assignedResources: [],
        assignedStakeholders: [],
        hierarchyLevel: 0,
        sortOrder: 0
      };

      await createTask(taskData);
      toast.success('Task created successfully');
      setInlineTaskData({
        name: '',
        priority: 'Medium',
        status: 'Not Started',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      setShowInlineTaskForm(false);
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleInlineMilestoneCreate = async () => {
    try {
      const milestoneData = {
        name: inlineMilestoneData.name,
        description: '',
        due_date: inlineMilestoneData.due_date,
        baseline_date: inlineMilestoneData.due_date,
        status: 'Not Started' as const,
        progress: 0,
        task_ids: []
      };

      await createMilestone(milestoneData);
      toast.success('Milestone created successfully');
      setInlineMilestoneData({
        name: '',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      setShowInlineMilestoneForm(false);
    } catch (error) {
      toast.error('Failed to create milestone');
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<ProjectTask>) => {
    try {
      await updateTaskDB(taskId, updates);
      toast.success('Task updated successfully');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTaskDB(taskId);
      toast.success('Task deleted successfully');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCreateMilestone = async (milestone: Omit<ProjectMilestone, 'id'>) => {
    try {
      await createMilestone(milestone);
      toast.success('Milestone created successfully');
      setShowMilestoneDialog(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleRebaselineTask = async (taskId: string, newStartDate: string, newEndDate: string, reason: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        toast.error('Task not found');
        return;
      }

      // Store the old baseline dates for audit trail
      const oldBaselineStart = task.baselineStartDate;
      const oldBaselineEnd = task.baselineEndDate;

      // Update the task with new baseline dates and actual dates
      const updates = {
        baselineStartDate: newStartDate,
        baselineEndDate: newEndDate,
        startDate: newStartDate,
        endDate: newEndDate
      };
      
      await updateTaskDB(taskId, updates);
      
      // Log the rebaseline action (you could enhance this to store in audit table)
      console.log('Task rebaselined:', {
        taskId,
        taskName: task.name,
        oldBaseline: { start: oldBaselineStart, end: oldBaselineEnd },
        newBaseline: { start: newStartDate, end: newEndDate },
        reason,
        timestamp: new Date().toISOString()
      });

      toast.success(`Task "${task.name}" has been rebaselined`, {
        description: `Reason: ${reason}`
      });
    } catch (error) {
      console.error('Error rebaselining task:', error);
      toast.error('Failed to rebaseline task');
    }
  };

  const handleUpdateMilestone = async (milestoneId: string, updates: Partial<ProjectMilestone>) => {
    try {
      await updateMilestone(milestoneId, updates);
      toast.success('Milestone updated successfully');
      setShowMilestoneDialog(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      await deleteMilestone(milestoneId);
      toast.success('Milestone deleted successfully');
    } catch (error) {
      // Error handled in hook
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

  // Table control handlers
  const handleZoomIn = () => {
    const newZoom = Math.min(2, zoomLevel + 0.1);
    setZoomLevel(newZoom);
    toast.info(`Zoom: ${Math.round(newZoom * 100)}%`);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.5, zoomLevel - 0.1);
    setZoomLevel(newZoom);
    toast.info(`Zoom: ${Math.round(newZoom * 100)}%`);
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    toast.info('Zoom reset to 100%');
  };

  const handleDensityChange = (density: 'compact' | 'normal' | 'comfortable') => {
    setTableDensity(density);
    toast.info(`Table density: ${density}`);
  };

  const handleExport = () => {
    try {
      // Create CSV content
      const headers = ['Task Name', 'Status', 'Priority', 'Start Date', 'End Date', 'Duration', 'Progress', 'Milestone'];
      const csvContent = [
        headers.join(','),
        ...filteredTasks.map(task => [
          `"${task.name}"`,
          task.status,
          task.priority,
          task.startDate,
          task.endDate,
          task.duration,
          `${task.progress}%`,
          task.milestoneId ? milestones.find(m => m.id === task.milestoneId)?.name || '' : ''
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `project-tasks-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Tasks exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export tasks');
    }
  };

  // Calculate table cell padding based on density
  const getDensityClass = () => {
    switch (tableDensity) {
      case 'compact': return 'py-1 px-2';
      case 'comfortable': return 'py-4 px-4';
      default: return 'py-3 px-4';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
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

          <div 
            className="overflow-x-auto" 
            style={{ 
              fontSize: `${zoomLevel * 100}%`,
              maxHeight: '70vh'
            }}
          >
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className={`w-80 min-w-[320px] ${getDensityClass()}`}>Task Name</TableHead>
                  <TableHead className={`w-40 min-w-[160px] ${getDensityClass()}`}>Status</TableHead>
                  <TableHead className={`w-32 ${getDensityClass()}`}>Priority</TableHead>
                  <TableHead className={`w-40 ${getDensityClass()}`}>Resources</TableHead>
                  <TableHead className={`w-32 ${getDensityClass()}`}>Start Date</TableHead>
                  <TableHead className={`w-32 ${getDensityClass()}`}>End Date</TableHead>
                  <TableHead className={`w-24 ${getDensityClass()}`}>Duration</TableHead>
                  <TableHead className={`w-24 ${getDensityClass()}`}>Progress</TableHead>
                  <TableHead className={`w-48 ${getDensityClass()}`}>Dependencies</TableHead>
                  <TableHead className={`w-32 ${getDensityClass()}`}>Milestone</TableHead>
                  <TableHead className={`w-24 ${getDensityClass()}`}>Variance</TableHead>
                  <TableHead className={`w-32 ${getDensityClass()}`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Inline Task Creation Row */}
                {showInlineTaskForm && (
                  <TableRow className="bg-blue-50">
                    <TableCell className={getDensityClass()}>
                      <Input
                        placeholder="Task name"
                        value={inlineTaskData.name}
                        onChange={(e) => setInlineTaskData({ ...inlineTaskData, name: e.target.value })}
                      />
                    </TableCell>
                    <TableCell className={getDensityClass()}>
                      <Select value={inlineTaskData.status} onValueChange={(value) => setInlineTaskData({ ...inlineTaskData, status: value })}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Not Started">Not Started</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="On Hold">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className={getDensityClass()}>
                      <Select value={inlineTaskData.priority} onValueChange={(value) => setInlineTaskData({ ...inlineTaskData, priority: value })}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className={getDensityClass()}>-</TableCell>
                    <TableCell className={getDensityClass()}>
                      <Input
                        type="date"
                        value={inlineTaskData.start_date}
                        onChange={(e) => setInlineTaskData({ ...inlineTaskData, start_date: e.target.value })}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell className={getDensityClass()}>
                      <Input
                        type="date"
                        value={inlineTaskData.end_date}
                        onChange={(e) => setInlineTaskData({ ...inlineTaskData, end_date: e.target.value })}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell className={getDensityClass()}>
                      {Math.ceil((new Date(inlineTaskData.end_date).getTime() - new Date(inlineTaskData.start_date).getTime()) / (24 * 60 * 60 * 1000))} days
                    </TableCell>
                    <TableCell className={getDensityClass()}>0%</TableCell>
                    <TableCell className={getDensityClass()}>-</TableCell>
                    <TableCell className={getDensityClass()}>-</TableCell>
                    <TableCell className={getDensityClass()}>-</TableCell>
                    <TableCell className={getDensityClass()}>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={handleInlineTaskCreate}
                          disabled={!inlineTaskData.name.trim()}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowInlineTaskForm(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Inline Milestone Creation Row */}
                {showInlineMilestoneForm && (
                  <TableRow className="bg-green-50">
                    <TableCell className={getDensityClass()}>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <Input
                          placeholder="Milestone name"
                          value={inlineMilestoneData.name}
                          onChange={(e) => setInlineMilestoneData({ ...inlineMilestoneData, name: e.target.value })}
                        />
                      </div>
                    </TableCell>
                    <TableCell className={getDensityClass()}>Not Started</TableCell>
                    <TableCell className={getDensityClass()}>-</TableCell>
                    <TableCell className={getDensityClass()}>-</TableCell>
                    <TableCell className={getDensityClass()}>-</TableCell>
                    <TableCell className={getDensityClass()}>
                      <Input
                        type="date"
                        value={inlineMilestoneData.due_date}
                        onChange={(e) => setInlineMilestoneData({ ...inlineMilestoneData, due_date: e.target.value })}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell className={getDensityClass()}>-</TableCell>
                    <TableCell className={getDensityClass()}>0%</TableCell>
                    <TableCell className={getDensityClass()}>-</TableCell>
                    <TableCell className={getDensityClass()}>Milestone</TableCell>
                    <TableCell className={getDensityClass()}>-</TableCell>
                    <TableCell className={getDensityClass()}>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={handleInlineMilestoneCreate}
                          disabled={!inlineMilestoneData.name.trim()}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowInlineMilestoneForm(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Quick Add Buttons Row */}
                {!showInlineTaskForm && !showInlineMilestoneForm && (
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={12} className={`text-center ${getDensityClass()}`}>
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowInlineTaskForm(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Quick Add Task
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowInlineMilestoneForm(true)}
                        >
                          <Target className="h-4 w-4 mr-2" />
                          Quick Add Milestone
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {Object.entries(groupedTasks).map(([groupKey, group]) => (
                  <React.Fragment key={groupKey}>
                    {/* Milestone Header Row */}
                    {group.milestone && (
                      <TableRow>
                        <TableCell colSpan={12} className="p-0 border-b">
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
                              </div>
                            </CollapsibleTrigger>
                          </Collapsible>
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {/* Task Rows */}
                    {(groupKey === 'no-milestone' || (group.milestone && expandedMilestones.has(group.milestone.id))) && (
                      <>
                        {group.tasks.map((task) => (
                          <TaskTableRow
                            key={task.id}
                            task={task}
                            milestones={milestones}
                            availableResources={availableResources}
                            availableStakeholders={availableStakeholders}
                            allTasks={tasks}
                            onUpdateTask={handleUpdateTask}
                            onDeleteTask={handleDeleteTask}
                            onEditTask={(task) => {
                              setEditingTask(task);
                              setShowTaskDialog(true);
                            }}
                            onRebaselineTask={handleRebaselineTask}
                            densityClass={getDensityClass()}
                          />
                        ))}
                      </>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
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
    </div>
  );
};

export default ProjectGanttChart;

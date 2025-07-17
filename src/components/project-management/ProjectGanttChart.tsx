
import React, { useState, useEffect, useMemo } from 'react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { useResources } from '@/hooks/useResources';
import { useStakeholders } from '@/hooks/useStakeholders';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Download, Upload, Calendar, Users, Target, ChevronDown, ChevronRight, Filter, BarChart3, Zap, FileText } from 'lucide-react';
import { toast } from 'sonner';
import ResizableTable from './table/ResizableTable';
import TableControls from './table/TableControls';
import TaskCreationDialog from './gantt/TaskCreationDialog';
import MilestoneManagementDialog from './MilestoneManagementDialog';
import DeleteTaskConfirmationDialog from './DeleteTaskConfirmationDialog';
import TaskHierarchyRenderer from './table/TaskHierarchyRenderer';
import BulkOperationsBar from './table/BulkOperationsBar';
import QuickTaskCreator from './table/QuickTaskCreator';
import AdvancedTaskFilters, { TaskFilters } from './table/AdvancedTaskFilters';
import TaskTemplateManager, { TaskTemplate } from './templates/TaskTemplateManager';

interface ProjectGanttChartProps {
  projectId: string;
}

const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({ projectId }) => {
  const {
    tasks,
    milestones,
    loading,
    createTask,
    updateTask,
    deleteTask,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    hierarchyTree,
    expandedNodes,
    promoteTask,
    demoteTask,
    moveTask,
    toggleNodeExpansion,
    expandAllNodes,
    collapseAllNodes
  } = useTaskManagement(projectId);

  const { resources } = useResources();
  const { stakeholders } = useStakeholders();

  // Table UI state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tableDensity, setTableDensity] = useState<'compact' | 'normal' | 'comfortable'>('normal');

  // State for advanced features
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showQuickCreator, setShowQuickCreator] = useState(false);
  const [quickCreatorParent, setQuickCreatorParent] = useState<string | undefined>();
  const [taskFilters, setTaskFilters] = useState<TaskFilters>({
    search: '',
    status: [],
    priority: [],
    assignedResources: [],
    milestones: [],
    dateRange: {},
    hierarchyLevel: [],
    hasChildren: null,
    overdue: false,
    completedTasks: true
  });
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);

  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<ProjectTask | null>(null);

  // Table control handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => setZoomLevel(1);
  const handleDensityChange = (density: 'compact' | 'normal' | 'comfortable') => setTableDensity(density);
  const handleExport = () => {
    // Simple CSV export
    const csvData = tasks.map(task => ({
      Name: task.name,
      Status: task.status,
      Priority: task.priority,
      'Start Date': task.startDate,
      'End Date': task.endDate,
      Progress: `${task.progress}%`
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-tasks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Tasks exported to CSV');
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    if (taskFilters.search) {
      const searchLower = taskFilters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.name.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      );
    }

    if (taskFilters.status.length > 0) {
      filtered = filtered.filter(task => taskFilters.status.includes(task.status));
    }

    if (taskFilters.priority.length > 0) {
      filtered = filtered.filter(task => taskFilters.priority.includes(task.priority));
    }

    if (!taskFilters.completedTasks) {
      filtered = filtered.filter(task => task.status !== 'Completed');
    }

    if (taskFilters.overdue) {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(task => task.endDate < today && task.status !== 'Completed');
    }

    return filtered;
  }, [tasks, taskFilters]);

  // Bulk operations handlers
  const handleBulkStatusUpdate = async (status: string) => {
    try {
      await Promise.all(
        selectedTasks.map(taskId => updateTask(taskId, { status: status as any }))
      );
      setSelectedTasks([]);
      toast.success(`Updated ${selectedTasks.length} tasks`);
    } catch (error) {
      toast.error('Failed to update tasks');
    }
  };

  const handleBulkPriorityUpdate = async (priority: string) => {
    try {
      await Promise.all(
        selectedTasks.map(taskId => updateTask(taskId, { priority: priority as any }))
      );
      setSelectedTasks([]);
      toast.success(`Updated ${selectedTasks.length} tasks`);
    } catch (error) {
      toast.error('Failed to update tasks');
    }
  };

  const handleBulkResourceAssign = async (resourceIds: string[]) => {
    try {
      await Promise.all(
        selectedTasks.map(taskId => updateTask(taskId, { assignedResources: resourceIds }))
      );
      setSelectedTasks([]);
      toast.success(`Assigned resources to ${selectedTasks.length} tasks`);
    } catch (error) {
      toast.error('Failed to assign resources');
    }
  };

  const handleBulkMilestoneAssign = async (milestoneId: string) => {
    try {
      await Promise.all(
        selectedTasks.map(taskId => updateTask(taskId, { milestoneId: milestoneId || undefined }))
      );
      setSelectedTasks([]);
      toast.success(`Updated milestone for ${selectedTasks.length} tasks`);
    } catch (error) {
      toast.error('Failed to update tasks');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedTasks.map(taskId => deleteTask(taskId)));
      setSelectedTasks([]);
      toast.success(`Deleted ${selectedTasks.length} tasks`);
    } catch (error) {
      toast.error('Failed to delete tasks');
    }
  };

  const handleCreateFromTemplate = async (template: TaskTemplate, parentTaskId?: string) => {
    try {
      const createdTasks: ProjectTask[] = [];
      
      for (let i = 0; i < template.tasks.length; i++) {
        const templateTask = template.tasks[i];
        const today = new Date();
        const startDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = new Date(today.getTime() + (i + templateTask.duration) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const taskData: Omit<ProjectTask, 'id'> = {
          name: templateTask.name,
          description: templateTask.description,
          startDate,
          endDate,
          baselineStartDate: startDate,
          baselineEndDate: endDate,
          progress: 0,
          assignedResources: [],
          assignedStakeholders: [],
          dependencies: [],
          priority: templateTask.priority as any,
          status: 'Not Started',
          milestoneId: undefined,
          duration: templateTask.duration,
          parentTaskId,
          hierarchyLevel: parentTaskId ? 1 : 0,
          sortOrder: 0,
          hasChildren: false
        };

        const createdTask = await createTask(taskData);
        createdTasks.push(createdTask);
      }

      toast.success(`Created ${createdTasks.length} tasks from template`);
    } catch (error) {
      toast.error('Failed to create tasks from template');
    }
  };

  const handleCreateTask = async (taskData: Omit<ProjectTask, 'id'>) => {
    try {
      const taskWithDefaults = {
        ...taskData,
        hasChildren: false,
        sortOrder: taskData.sortOrder || 0,
        dependencies: Array.isArray(taskData.dependencies) ? taskData.dependencies : [],
        assignedResources: Array.isArray(taskData.assignedResources) ? taskData.assignedResources : [],
        assignedStakeholders: Array.isArray(taskData.assignedStakeholders) ? taskData.assignedStakeholders : []
      };
      await createTask(taskWithDefaults);
      setShowTaskDialog(false);
      setEditingTask(null);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Task creation error:', error);
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<ProjectTask>) => {
    try {
      // Ensure arrays are properly handled
      const cleanUpdates = {
        ...updates,
        dependencies: Array.isArray(updates.dependencies) ? updates.dependencies : [],
        assignedResources: Array.isArray(updates.assignedResources) ? updates.assignedResources : [],
        assignedStakeholders: Array.isArray(updates.assignedStakeholders) ? updates.assignedStakeholders : []
      };
      await updateTask(taskId, cleanUpdates);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Task update error:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
      setShowDeleteDialog(true);
    }
  };

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      try {
        await deleteTask(taskToDelete.id);
        setShowDeleteDialog(false);
        setTaskToDelete(null);
        toast.success('Task deleted successfully');
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleEditTask = (task: ProjectTask) => {
    setEditingTask(task);
    setShowTaskDialog(true);
  };

  const handleRebaselineTask = async (task: ProjectTask) => {
    try {
      await updateTask(task.id, {
        baselineStartDate: task.startDate,
        baselineEndDate: task.endDate
      });
      toast.success('Task baseline updated');
    } catch (error) {
      toast.error('Failed to update baseline');
    }
  };

  const handleAddSubtask = (parentTaskId: string) => {
    setQuickCreatorParent(parentTaskId);
    setShowQuickCreator(true);
  };

  const handleQuickTaskCreate = async (taskData: Omit<ProjectTask, 'id'>) => {
    try {
      await createTask(taskData);
      setShowQuickCreator(false);
      setQuickCreatorParent(undefined);
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleSelectionChange = (taskId: string, selected: boolean) => {
    if (selected) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Project Tasks & Milestones
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {filteredTasks.length} tasks
                </Badge>
                <Badge variant="outline">
                  {milestones.length} milestones
                </Badge>
                {selectedTasks.length > 0 && (
                  <Badge variant="secondary">
                    {selectedTasks.length} selected
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowTaskDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
              <Button variant="outline" onClick={() => setShowMilestoneDialog(true)}>
                <Target className="h-4 w-4 mr-2" />
                Milestones
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Advanced Filters */}
          <div className="mb-4">
            <AdvancedTaskFilters
              filters={taskFilters}
              onFiltersChange={setTaskFilters}
              tasks={tasks}
              milestones={milestones}
              availableResources={resources.map(r => ({ id: r.id, name: r.name, role: r.role || 'Member' }))}
              savedFilters={[]}
              onSaveFilter={() => {}}
              onLoadFilter={() => {}}
            />
          </div>

          {/* Table Controls */}
          <TableControls
            zoomLevel={zoomLevel}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            tableDensity={tableDensity}
            onDensityChange={handleDensityChange}
            onExport={handleExport}
          />

          {/* Quick Task Creator */}
          {showQuickCreator && (
            <QuickTaskCreator
              onCreateTask={handleQuickTaskCreate}
              parentTaskId={quickCreatorParent}
              milestones={milestones}
              onCancel={() => {
                setShowQuickCreator(false);
                setQuickCreatorParent(undefined);
              }}
            />
          )}

          <ResizableTable zoomLevel={zoomLevel} tableDensity={tableDensity}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <input
                      type="checkbox"
                      checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTasks(filteredTasks.map(t => t.id));
                        } else {
                          setSelectedTasks([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="min-w-60">Task/Milestone Name</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-28">Priority</TableHead>
                  <TableHead className="w-40">Resources</TableHead>
                  <TableHead className="w-32">Start Date</TableHead>
                  <TableHead className="w-32">End Date</TableHead>
                  <TableHead className="w-24">Duration</TableHead>
                  <TableHead className="w-28">Progress</TableHead>
                  <TableHead className="w-48">Dependencies</TableHead>
                  <TableHead className="w-36">Milestone</TableHead>
                  <TableHead className="w-28">Variance</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TaskHierarchyRenderer
                  hierarchyTree={hierarchyTree}
                  expandedNodes={expandedNodes}
                  milestones={milestones}
                  availableResources={resources.map(r => ({ id: r.id, name: r.name, role: r.role || 'Member' }))}
                  availableStakeholders={stakeholders.map(s => ({ id: s.id, name: s.name, role: s.role || 'Stakeholder' }))}
                  allTasks={filteredTasks}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={handleEditTask}
                  onRebaselineTask={handleRebaselineTask}
                  onToggleExpansion={toggleNodeExpansion}
                  onPromoteTask={promoteTask}
                  onDemoteTask={demoteTask}
                  onAddSubtask={handleAddSubtask}
                  selectedTasks={selectedTasks}
                  onSelectionChange={handleSelectionChange}
                />
              </TableBody>
            </Table>
          </ResizableTable>
        </CardContent>
      </Card>

      {/* Bulk Operations Bar */}
      <BulkOperationsBar
        selectedTasks={selectedTasks}
        allTasks={filteredTasks}
        milestones={milestones}
        availableResources={resources.map(r => ({ id: r.id, name: r.name, role: r.role || 'Member' }))}
        onClearSelection={() => setSelectedTasks([])}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onBulkPriorityUpdate={handleBulkPriorityUpdate}
        onBulkResourceAssign={handleBulkResourceAssign}
        onBulkMilestoneAssign={handleBulkMilestoneAssign}
        onBulkDelete={handleBulkDelete}
      />

      {/* Dialogs */}
      <TaskCreationDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        onCreateTask={handleCreateTask}
        onUpdateTask={handleUpdateTask}
        editingTask={editingTask}
        tasks={tasks}
        milestones={milestones}
        availableResources={resources.map(r => ({ id: r.id, name: r.name, role: r.role || 'Member' }))}
        availableStakeholders={stakeholders.map(s => ({ id: s.id, name: s.name, role: s.role || 'Stakeholder' }))}
      />

      <MilestoneManagementDialog
        open={showMilestoneDialog}
        onOpenChange={setShowMilestoneDialog}
        onCreateMilestone={createMilestone}
        onUpdateMilestone={updateMilestone}
        editingMilestone={null}
      />

      <DeleteTaskConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        task={taskToDelete}
        allTasks={tasks}
        onConfirm={confirmDeleteTask}
      />
    </div>
  );
};

export default ProjectGanttChart;

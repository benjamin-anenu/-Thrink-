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
import TaskCreationDialog from './gantt/TaskCreationDialog';
import MilestoneManagementDialog from './MilestoneManagementDialog';
import DeleteTaskConfirmationDialog from './DeleteTaskConfirmationDialog';
import TaskHierarchyRenderer from './table/TaskHierarchyRenderer';
import BulkOperationsBar from './table/BulkOperationsBar';
import QuickTaskCreator from './table/QuickTaskCreator';
import AdvancedTaskFilters, { TaskFilters } from './table/AdvancedTaskFilters';
import TaskTemplateManager, { TaskTemplate } from './templates/TaskTemplateManager';
import { TaskAutomationEngine } from './automation/TaskAutomation';

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
  const [savedFilters, setSavedFilters] = useState<Array<{ id: string; name: string; filters: TaskFilters }>>([]);
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<ProjectTask | null>(null);

  // Filtered and processed tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply filters
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

    if (taskFilters.hierarchyLevel.length > 0) {
      filtered = filtered.filter(task => taskFilters.hierarchyLevel.includes(task.hierarchyLevel || 0));
    }

    if (taskFilters.hasChildren !== null) {
      filtered = filtered.filter(task => task.hasChildren === taskFilters.hasChildren);
    }

    if (!taskFilters.completedTasks) {
      filtered = filtered.filter(task => task.status !== 'Completed');
    }

    if (taskFilters.overdue) {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(task => task.endDate < today && task.status !== 'Completed');
    }

    if (taskFilters.dateRange.start || taskFilters.dateRange.end) {
      filtered = filtered.filter(task => {
        if (taskFilters.dateRange.start && task.endDate < taskFilters.dateRange.start) return false;
        if (taskFilters.dateRange.end && task.startDate > taskFilters.dateRange.end) return false;
        return true;
      });
    }

    return filtered;
  }, [tasks, taskFilters]);

  // Auto-update parent task progress
  useEffect(() => {
    const parentTasks = tasks.filter(task => task.hasChildren);
    for (const parentTask of parentTasks) {
      const calculatedProgress = TaskAutomationEngine.calculateParentTaskProgress(parentTask.id, tasks);
      if (calculatedProgress !== parentTask.progress) {
        updateTask(parentTask.id, { progress: calculatedProgress });
      }
    }
  }, [tasks, updateTask]);

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

  const handleSaveFilter = (name: string, filters: TaskFilters) => {
    const newFilter = {
      id: Date.now().toString(),
      name,
      filters
    };
    setSavedFilters(prev => [...prev, newFilter]);
    toast.success('Filter saved');
  };

  const handleLoadFilter = (filters: TaskFilters) => {
    setTaskFilters(filters);
    toast.success('Filter applied');
  };

  const handleAutoSchedule = () => {
    const optimizedTasks = TaskAutomationEngine.autoScheduleTasks(filteredTasks);
    optimizedTasks.forEach(task => {
      const originalTask = tasks.find(t => t.id === task.id);
      if (originalTask && (originalTask.startDate !== task.startDate || originalTask.endDate !== task.endDate)) {
        updateTask(task.id, {
          startDate: task.startDate,
          endDate: task.endDate
        });
      }
    });
    toast.success('Tasks auto-scheduled based on dependencies');
  };

  const handleCreateTask = async (taskData: Omit<ProjectTask, 'id'>) => {
    try {
      // Ensure hasChildren is set correctly
      const taskWithDefaults = {
        ...taskData,
        hasChildren: false,
        sortOrder: taskData.sortOrder || 0
      };
      await createTask(taskWithDefaults);
      setShowTaskDialog(false);
      setEditingTask(null);
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<ProjectTask>) => {
    try {
      await updateTask(taskId, updates);
      toast.success('Task updated successfully');
    } catch (error) {
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
                Project Tasks
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {filteredTasks.length} of {tasks.length} tasks
                </Badge>
                {selectedTasks.length > 0 && (
                  <Badge variant="secondary">
                    {selectedTasks.length} selected
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoSchedule}
                disabled={filteredTasks.length === 0}
              >
                <Zap className="h-4 w-4 mr-2" />
                Auto Schedule
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateManager(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </Button>
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
              savedFilters={savedFilters}
              onSaveFilter={handleSaveFilter}
              onLoadFilter={handleLoadFilter}
            />
          </div>

          <Tabs defaultValue="table" className="w-full">
            <TabsList>
              <TabsTrigger value="table">Task Table</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="space-y-4">
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

              <ResizableTable zoomLevel={1} tableDensity="comfortable">
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
                      <TableHead className="min-w-60">Task Name</TableHead>
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
            </TabsContent>

            <TabsContent value="templates">
              <TaskTemplateManager
                templates={taskTemplates}
                onCreateFromTemplate={handleCreateFromTemplate}
                onSaveTemplate={(template) => {
                  const newTemplate: TaskTemplate = {
                    ...template,
                    id: Date.now().toString()
                  };
                  setTaskTemplates(prev => [...prev, newTemplate]);
                  toast.success('Template saved');
                }}
                onDeleteTemplate={(templateId) => {
                  setTaskTemplates(prev => prev.filter(t => t.id !== templateId));
                  toast.success('Template deleted');
                }}
                availableRoles={resources.map(r => r.role || 'Member')}
              />
            </TabsContent>
          </Tabs>
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

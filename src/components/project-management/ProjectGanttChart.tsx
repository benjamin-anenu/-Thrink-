
import React, { useState, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { ProjectTask, ProjectMilestone, RebaselineRequest } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ui/theme-toggle';

import TaskCreationDialog from './gantt/TaskCreationDialog';
import TableControls from './table/TableControls';
import ResizableTable from './table/ResizableTable';
import GanttTableHeader from './gantt/GanttTableHeader';
import GanttTableContent from './gantt/GanttTableContent';
import RebaselineDialog from './gantt/RebaselineDialog';

interface ProjectGanttChartProps {
  projectId: string;
}

const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({ projectId }) => {
  const { getProject, addTask, updateTask, deleteTask, rebaselineTasks } = useProject();
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showRebaselineDialog, setShowRebaselineDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [rebaselineTask, setRebaselineTask] = useState<ProjectTask | null>(null);
  const [rebaselineData, setRebaselineData] = useState({ newStartDate: '', newEndDate: '', reason: '' });
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<string>('startDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Table state management
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tableDensity, setTableDensity] = useState<'compact' | 'normal' | 'comfortable'>('normal');

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

  // Group tasks by milestone
  const groupedTasks = useMemo(() => {
    const groups: { [key: string]: { milestone: ProjectMilestone | null; tasks: ProjectTask[] } } = {};
    
    // Initialize groups for each milestone
    project.milestones.forEach(milestone => {
      groups[milestone.id] = { milestone, tasks: [] };
    });
    
    // Add group for tasks without milestone
    groups['no-milestone'] = { milestone: null, tasks: [] };
    
    // Assign tasks to groups
    project.tasks.forEach(task => {
      const groupKey = task.milestoneId || 'no-milestone';
      if (groups[groupKey]) {
        groups[groupKey].tasks.push(task);
      }
    });
    
    // Sort tasks within each group
    Object.values(groups).forEach(group => {
      group.tasks.sort((a, b) => {
        const aValue = (a as any)[sortBy];
        const bValue = (b as any)[sortBy];
        const modifier = sortDirection === 'asc' ? 1 : -1;
        
        if (aValue < bValue) return -1 * modifier;
        if (aValue > bValue) return 1 * modifier;
        return 0;
      });
    });
    
    return groups;
  }, [project.tasks, project.milestones, sortBy, sortDirection]);

  // Table control handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => setZoomLevel(1);
  const handleDensityChange = (density: 'compact' | 'normal' | 'comfortable') => setTableDensity(density);
  
  const handleExport = () => {
    toast.info('Export functionality will be implemented');
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
          
          <div className="overflow-hidden">
            <ResizableTable
              zoomLevel={zoomLevel}
              tableDensity={tableDensity}
              className="table-container"
            >
              <GanttTableHeader
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <GanttTableContent
                groupedTasks={groupedTasks}
                expandedMilestones={expandedMilestones}
                onToggleMilestone={toggleMilestone}
                allTasks={project.tasks}
                milestones={project.milestones}
                availableResources={availableResources}
                availableStakeholders={availableStakeholders}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
                onRebaselineTask={handleRebaselineClick}
              />
            </ResizableTable>
          </div>
        </CardContent>
      </Card>

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

      <RebaselineDialog
        open={showRebaselineDialog}
        onOpenChange={setShowRebaselineDialog}
        task={rebaselineTask}
        rebaselineData={rebaselineData}
        onDataChange={setRebaselineData}
        onRebaseline={handleRebaseline}
      />
    </div>
  );
};

export default ProjectGanttChart;

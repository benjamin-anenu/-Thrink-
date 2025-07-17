
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Filter, Download, Settings } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import ResizableTable from './table/ResizableTable';
import TaskHierarchyRenderer from './table/TaskHierarchyRenderer';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { TaskHierarchyUtils } from '@/utils/taskHierarchy';
import { useTaskManagement } from '@/hooks/useTaskManagement';

interface ProjectGanttChartProps {
  projectId: string;
}

const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({ projectId }) => {
  const { getProject } = useProject();
  const { currentWorkspace } = useWorkspace();
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [resources, setResources] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [stakeholders, setStakeholders] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tableDensity, setTableDensity] = useState<'compact' | 'normal' | 'comfortable'>('normal');

  const project = getProject(projectId);

  const {
    updateTask,
    deleteTask,
    promoteTask,
    demoteTask,
    createTask
  } = useTaskManagement(projectId);

  // Placeholder functions for missing functionality
  const editTask = (task: ProjectTask) => {
    console.log('Edit task:', task);
  };

  const rebaselineTask = (task: ProjectTask) => {
    console.log('Rebaseline task:', task);
  };

  const addSubtask = (parentTaskId: string) => {
    const parentTask = tasks.find(t => t.id === parentTaskId);
    createTask({
      name: 'New Subtask',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      baselineStartDate: new Date().toISOString().split('T')[0],
      baselineEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0,
      assignedResources: [],
      assignedStakeholders: [],
      dependencies: [],
      priority: 'Medium',
      status: 'Not Started',
      duration: 1,
      parentTaskId: parentTaskId,
      hierarchyLevel: (parentTask?.hierarchyLevel || 0) + 1,
      sortOrder: 0
    });
  };

  useEffect(() => {
    const loadProjectData = async () => {
      if (!project) return;

      try {
        setLoading(true);
        
        // Load tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('project_tasks')
          .select('*')
          .eq('project_id', projectId)
          .order('sort_order');

        if (tasksError) throw tasksError;

        // Load milestones
        const { data: milestonesData, error: milestonesError } = await supabase
          .from('milestones')
          .select('*')
          .eq('project_id', projectId)
          .order('due_date');

        if (milestonesError) throw milestonesError;

        // Load resources
        const { data: resourcesData, error: resourcesError } = await supabase
          .from('resources')
          .select('id, name, role');

        if (resourcesError) throw resourcesError;

        // Load stakeholders
        const { data: stakeholdersData, error: stakeholdersError } = await supabase
          .from('stakeholders')
          .select('id, name, role')
          .eq('workspace_id', currentWorkspace?.id);

        if (stakeholdersError) throw stakeholdersError;

        // Transform the database data to match our frontend interfaces
        const transformedTasks = (tasksData || []).map(dbTask => ({
          id: dbTask.id,
          name: dbTask.name || '',
          description: dbTask.description || '',
          startDate: dbTask.start_date || new Date().toISOString().split('T')[0],
          endDate: dbTask.end_date || new Date().toISOString().split('T')[0],
          baselineStartDate: dbTask.baseline_start_date || dbTask.start_date || new Date().toISOString().split('T')[0],
          baselineEndDate: dbTask.baseline_end_date || dbTask.end_date || new Date().toISOString().split('T')[0],
          progress: dbTask.progress || 0,
          assignedResources: dbTask.assigned_resources || [],
          assignedStakeholders: dbTask.assigned_stakeholders || [],
          dependencies: dbTask.dependencies || [],
          priority: (dbTask.priority as any) || 'Medium',
          status: (dbTask.status as any) || 'Not Started',
          milestoneId: dbTask.milestone_id,
          duration: dbTask.duration || 1,
          parentTaskId: dbTask.parent_task_id,
          hierarchyLevel: dbTask.hierarchy_level || 0,
          sortOrder: dbTask.sort_order || 0,
          hasChildren: false
        }));

        const transformedMilestones = (milestonesData || []).map(dbMilestone => ({
          id: dbMilestone.id,
          name: dbMilestone.name || '',
          description: dbMilestone.description || '',
          date: dbMilestone.due_date || new Date().toISOString().split('T')[0],
          baselineDate: dbMilestone.baseline_date || dbMilestone.due_date || new Date().toISOString().split('T')[0],
          status: (dbMilestone.status as any) || 'upcoming',
          tasks: dbMilestone.task_ids || [],
          progress: dbMilestone.progress || 0
        }));

        setTasks(transformedTasks);
        setMilestones(transformedMilestones);
        setResources(resourcesData || []);
        setStakeholders(stakeholdersData || []);
      } catch (error) {
        console.error('Error loading project data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [projectId, project, currentWorkspace?.id]);

  const hierarchyTree = TaskHierarchyUtils.buildHierarchyTree(tasks);

  const handleToggleExpansion = (taskId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  if (!project) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Project not found
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentWorkspace || project.workspace_id !== currentWorkspace.id) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Project not accessible in current workspace
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Task Management</h2>
          <p className="text-muted-foreground">Manage project tasks with dependencies and hierarchy</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Zoom:</label>
            <Badge variant="outline">{Math.round(zoomLevel * 100)}%</Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
            >
              -
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setZoomLevel(1)}
            >
              Normal
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
            >
              +
            </Button>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Task Management Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found for this project
            </div>
          ) : (
            <ResizableTable 
              zoomLevel={zoomLevel} 
              tableDensity={tableDensity}
              className="w-full"
            >
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Task Name</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[100px]">Priority</TableHead>
                  <TableHead className="w-[150px]">Resources</TableHead>
                  <TableHead className="w-[120px]">Start Date</TableHead>
                  <TableHead className="w-[120px]">End Date</TableHead>
                  <TableHead className="w-[100px]">Duration</TableHead>
                  <TableHead className="w-[100px]">Progress</TableHead>
                  <TableHead className="w-[150px]">Dependencies</TableHead>
                  <TableHead className="w-[130px]">Milestone</TableHead>
                  <TableHead className="w-[100px]">Variance</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TaskHierarchyRenderer
                  hierarchyTree={hierarchyTree}
                  expandedNodes={expandedNodes}
                  milestones={milestones}
                  availableResources={resources}
                  availableStakeholders={stakeholders}
                  allTasks={tasks}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  onEditTask={editTask}
                  onRebaselineTask={rebaselineTask}
                  onToggleExpansion={handleToggleExpansion}
                  onPromoteTask={promoteTask}
                  onDemoteTask={demoteTask}
                  onAddSubtask={addSubtask}
                />
              </TableBody>
            </ResizableTable>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectGanttChart;

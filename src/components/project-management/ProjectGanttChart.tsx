
import React, { useState, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { ProjectTask, ProjectMilestone, RebaselineRequest } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Filter, Download, ChevronDown, ChevronRight, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

import TaskTableRow from './table/TaskTableRow';
import TaskCreationDialog from './gantt/TaskCreationDialog';

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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Project Task Management
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
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
        
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                    Task Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    Status {sortBy === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('priority')}>
                    Priority {sortBy === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Assigned Resources</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('startDate')}>
                    Start Date {sortBy === 'startDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('endDate')}>
                    End Date {sortBy === 'endDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('duration')}>
                    Duration {sortBy === 'duration' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('progress')}>
                    Progress {sortBy === 'progress' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Dependencies</TableHead>
                  <TableHead>Milestone</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedTasks).map(([groupKey, group]) => (
                  <React.Fragment key={groupKey}>
                    {/* Milestone Header */}
                    {group.milestone && (
                      <TableRow className="bg-muted/50">
                        <td colSpan={12} className="p-4">
                          <Collapsible
                            open={expandedMilestones.has(group.milestone.id)}
                            onOpenChange={() => toggleMilestone(group.milestone.id)}
                          >
                            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                              {expandedMilestones.has(group.milestone.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <Target className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold">{group.milestone.name}</span>
                              <Badge variant="outline" className="ml-2">
                                {group.tasks.length} tasks
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`ml-1 ${
                                  group.milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  group.milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                  group.milestone.status === 'delayed' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {group.milestone.status}
                              </Badge>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              {group.tasks.map((task) => (
                                <TaskTableRow
                                  key={task.id}
                                  task={task}
                                  milestones={project.milestones}
                                  availableResources={availableResources}
                                  availableStakeholders={availableStakeholders}
                                  allTasks={project.tasks}
                                  onUpdateTask={handleUpdateTask}
                                  onDeleteTask={handleDeleteTask}
                                  onEditTask={handleEditTask}
                                  onRebaselineTask={handleRebaselineClick}
                                />
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        </td>
                      </TableRow>
                    )}
                    
                    {/* Tasks without milestone */}
                    {groupKey === 'no-milestone' && group.tasks.length > 0 && (
                      <>
                        {group.tasks.map((task) => (
                          <TaskTableRow
                            key={task.id}
                            task={task}
                            milestones={project.milestones}
                            availableResources={availableResources}
                            availableStakeholders={availableStakeholders}
                            allTasks={project.tasks}
                            onUpdateTask={handleUpdateTask}
                            onDeleteTask={handleDeleteTask}
                            onEditTask={handleEditTask}
                            onRebaselineTask={handleRebaselineClick}
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

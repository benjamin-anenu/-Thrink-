
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Calendar, CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { InlineTaskCreator } from './InlineTaskCreator';
import { format } from 'date-fns';

interface ProjectGanttChartProps {
  projectId: string;
}

const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({ projectId }) => {
  const { tasks, milestones, loading, createTask, createMilestone } = useTaskManagement(projectId);
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [showMilestoneCreator, setShowMilestoneCreator] = useState(false);

  const getStatusIcon = (status: string, type: 'task' | 'milestone') => {
    if (type === 'milestone') {
      switch (status) {
        case 'completed':
          return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        case 'overdue':
          return <AlertCircle className="h-4 w-4 text-red-500" />;
        default:
          return <Circle className="h-4 w-4 text-blue-500" />;
      }
    } else {
      switch (status) {
        case 'Completed':
          return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        case 'In Progress':
          return <Clock className="h-4 w-4 text-yellow-500" />;
        case 'On Hold':
          return <AlertCircle className="h-4 w-4 text-orange-500" />;
        default:
          return <Circle className="h-4 w-4 text-gray-500" />;
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTaskCreate = async (taskData: any) => {
    try {
      await createTask(taskData);
      setShowTaskCreator(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleMilestoneCreate = async (milestoneData: any) => {
    try {
      await createMilestone(milestoneData);
      setShowMilestoneCreator(false);
    } catch (error) {
      console.error('Error creating milestone:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Gantt Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading tasks and milestones...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tasks & Milestones</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowTaskCreator(true)}
                disabled={showTaskCreator || showMilestoneCreator}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowMilestoneCreator(true)}
                disabled={showTaskCreator || showMilestoneCreator}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Priority/Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End/Due Date</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Tasks */}
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status, 'task')}
                        <span className="font-medium">{task.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{task.status}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(task.startDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(new Date(task.endDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-primary rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, task.progress))}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{task.progress}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Milestones */}
                {milestones.map((milestone) => (
                  <TableRow key={milestone.id} className="bg-purple-50/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(milestone.status, 'milestone')}
                        <span className="font-medium">{milestone.name}</span>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          Milestone
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{milestone.description}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <Badge variant="outline">{milestone.status}</Badge>
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{format(new Date(milestone.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-purple-500 rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, milestone.progress))}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{milestone.progress}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Inline Task Creator */}
                {showTaskCreator && (
                  <InlineTaskCreator
                    type="task"
                    onCreateTask={handleTaskCreate}
                    onCreateMilestone={handleMilestoneCreate}
                    onCancel={() => setShowTaskCreator(false)}
                  />
                )}

                {/* Inline Milestone Creator */}
                {showMilestoneCreator && (
                  <InlineTaskCreator
                    type="milestone"
                    onCreateTask={handleTaskCreate}
                    onCreateMilestone={handleMilestoneCreate}
                    onCancel={() => setShowMilestoneCreator(false)}
                  />
                )}

                {tasks.length === 0 && milestones.length === 0 && !showTaskCreator && !showMilestoneCreator && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No tasks or milestones found. Click "Add Task" or "Add Milestone" to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectGanttChart;

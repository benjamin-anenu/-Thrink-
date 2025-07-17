
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  name: string;
  status: string;
  start_date?: string;
  end_date?: string;
  progress?: number;
  assignee_id?: string;
  priority?: string;
}

interface Milestone {
  id: string;
  name: string;
  due_date?: string;
  status?: string;
  progress?: number;
  description?: string;
}

interface ProjectTimelineProps {
  projectId: string;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projectId }) => {
  const { getProject } = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  
  const project = getProject(projectId);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      // Load tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('start_date');

      if (tasksError) throw tasksError;

      // Load milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date');

      if (milestonesError) throw milestonesError;

      setTasks(tasksData || []);
      setMilestones(milestonesData || []);
    } catch (error) {
      console.error('Error loading project timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'in progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Timeline view data with proper typing
  const timelineItems = [
    ...tasks.map(task => ({
      id: task.id,
      name: task.name,
      type: 'task' as const,
      date: task.start_date || '',
      endDate: task.end_date,
      status: task.status,
      progress: task.progress || 0,
      priority: task.priority
    })),
    ...milestones.map(milestone => ({
      id: milestone.id,
      name: milestone.name,
      type: 'milestone' as const,
      date: milestone.due_date || '',
      status: milestone.status || 'Upcoming',
      progress: milestone.progress || 0
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate project timeline metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const overdueTasks = tasks.filter(t => {
    if (!t.end_date) return false;
    return new Date(t.end_date) < new Date() && t.status !== 'Completed';
  }).length;

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
  const upcomingMilestones = milestones.filter(m => {
    if (!m.due_date) return false;
    const dueDate = new Date(m.due_date);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 7 && daysUntilDue >= 0 && m.status !== 'Completed';
  }).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                <p className="font-semibold">{completedTasks}/{totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="font-semibold">{inProgressTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="font-semibold">{overdueTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Milestones</p>
                <p className="font-semibold">{completedMilestones}/{totalMilestones}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Tabs */}
      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Project Timeline</CardTitle>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {timelineItems.length > 0 ? (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
                    
                    {timelineItems.map((item, index) => (
                      <div key={item.id} className="relative flex items-start gap-4 pb-6">
                        {/* Timeline dot */}
                        <div className={`relative z-10 w-3 h-3 rounded-full ${getStatusColor(item.status)} border-2 border-background`}></div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={item.type === 'milestone' ? 'default' : 'secondary'}>
                              {item.type}
                            </Badge>
                            {item.type === 'task' && 'priority' in item && item.priority && (
                              <span className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                                {item.priority} Priority
                              </span>
                            )}
                          </div>
                          
                          <h4 className="font-medium mb-1">{item.name}</h4>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span>{new Date(item.date).toLocaleDateString()}</span>
                            {item.type === 'task' && 'endDate' in item && item.endDate && (
                              <span>- {new Date(item.endDate).toLocaleDateString()}</span>
                            )}
                            <Badge variant="outline" className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                          
                          {item.progress > 0 && (
                            <div className="flex items-center gap-2">
                              <Progress value={item.progress} className="flex-1 max-w-xs" />
                              <span className="text-sm text-muted-foreground">{item.progress}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No timeline items found for this project</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Project Tasks</CardTitle>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.length > 0 ? tasks.map((task) => (
                  <div key={task.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{task.name}</h4>
                      <Badge variant="outline" className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Start:</span> {task.start_date ? new Date(task.start_date).toLocaleDateString() : 'Not set'}
                      </div>
                      <div>
                        <span className="font-medium">End:</span> {task.end_date ? new Date(task.end_date).toLocaleDateString() : 'Not set'}
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span> {task.priority || 'Normal'}
                      </div>
                    </div>

                    {task.progress !== undefined && task.progress > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <Progress value={task.progress} className="flex-1" />
                          <span className="text-sm text-muted-foreground">{task.progress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks found for this project</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Project Milestones</CardTitle>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Milestone
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.length > 0 ? milestones.map((milestone) => (
                  <div key={milestone.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{milestone.name}</h4>
                      <Badge variant="outline" className={getStatusColor(milestone.status || 'Upcoming')}>
                        {milestone.status || 'Upcoming'}
                      </Badge>
                    </div>
                    
                    {milestone.description && (
                      <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Due Date:</span> {milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : 'Not set'}
                      </div>
                    </div>

                    {milestone.progress !== undefined && milestone.progress > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <Progress value={milestone.progress} className="flex-1" />
                          <span className="text-sm text-muted-foreground">{milestone.progress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No milestones found for this project</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectTimeline;

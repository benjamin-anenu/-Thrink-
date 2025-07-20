
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Target, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { useMilestones } from '@/hooks/useMilestones';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';

interface ProjectTimelineProps {
  projectId: string;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projectId }) => {
  const { tasks, loading: tasksLoading } = useTaskManagement(projectId);
  const { milestones, loading: milestonesLoading } = useMilestones(projectId);

  if (tasksLoading || milestonesLoading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading timeline data...
      </div>
    );
  }

  // Calculate real-time metrics
  const today = new Date();
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const totalTasks = tasks.length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate overdue items
  const overdueTasks = tasks.filter(task => 
    task.status !== 'Completed' && 
    isAfter(today, new Date(task.endDate))
  );

  const overdueMilestones = milestones.filter(milestone => 
    milestone.status !== 'completed' && 
    isAfter(today, new Date(milestone.date))
  );

  // Find next milestone
  const upcomingMilestones = milestones
    .filter(m => m.status !== 'completed' && !isAfter(today, new Date(m.date)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextMilestone = upcomingMilestones[0];

  // Calculate project health
  const criticalTasks = tasks.filter(task => 
    (task.priority === 'High' || task.priority === 'Critical') && 
    task.status !== 'Completed'
  ).length;

  const healthScore = Math.max(0, 100 - (overdueTasks.length * 10) - (overdueMilestones.length * 15) - (criticalTasks * 5));
  let healthStatus: 'red' | 'yellow' | 'green' = 'green';
  if (healthScore < 60) healthStatus = 'red';
  else if (healthScore < 80) healthStatus = 'yellow';

  // Get recent milestones for timeline
  const recentMilestones = milestones
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  // Calculate variance metrics
  const taskVariances = tasks.map(task => {
    const baseline = new Date(task.baselineEndDate);
    const actual = new Date(task.endDate);
    return differenceInDays(actual, baseline);
  });

  const averageVariance = taskVariances.length > 0 
    ? Math.round(taskVariances.reduce((sum, variance) => sum + variance, 0) / taskVariances.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="font-semibold">{overallProgress}%</p>
                <Progress value={overallProgress} className="mt-1 h-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                <p className="font-semibold">{completedTasks}/{totalTasks}</p>
                <p className="text-xs text-muted-foreground">{totalTasks - completedTasks} remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-8 w-8 ${overdueTasks.length > 0 ? 'text-red-500' : 'text-green-500'}`} />
              <div>
                <p className="text-sm text-muted-foreground">Overdue Items</p>
                <p className="font-semibold">{overdueTasks.length + overdueMilestones.length}</p>
                <p className="text-xs text-muted-foreground">
                  {overdueTasks.length} tasks, {overdueMilestones.length} milestones
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className={`h-8 w-8 ${
                healthStatus === 'red' ? 'text-red-500' : 
                healthStatus === 'yellow' ? 'text-yellow-500' : 'text-green-500'
              }`} />
              <div>
                <p className="text-sm text-muted-foreground">Project Health</p>
                <p className="font-semibold">{healthScore}/100</p>
                <Badge variant={healthStatus === 'red' ? 'destructive' : healthStatus === 'yellow' ? 'secondary' : 'default'}>
                  {healthStatus === 'red' ? 'At Risk' : healthStatus === 'yellow' ? 'Caution' : 'Healthy'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline and Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Project Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMilestones.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No milestones defined</p>
              ) : (
                recentMilestones.map((milestone, index) => {
                  const isCompleted = milestone.status === 'completed';
                  const isOverdue = !isCompleted && isAfter(today, new Date(milestone.date));
                  const isCurrent = !isCompleted && !isOverdue;
                  
                  return (
                    <div key={milestone.id} className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        isCompleted ? 'bg-green-500' : 
                        isOverdue ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium">{milestone.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(milestone.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Badge variant={
                        isCompleted ? 'default' : 
                        isOverdue ? 'destructive' : 'secondary'
                      }>
                        {milestone.status}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Milestones Completed</span>
                <span className="font-medium">
                  {milestones.filter(m => m.status === 'completed').length}/{milestones.length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Critical Tasks</span>
                <span className="font-medium text-red-600">{criticalTasks}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Task Duration</span>
                <span className="font-medium">
                  {tasks.length > 0 ? Math.round(tasks.reduce((sum, task) => sum + task.duration, 0) / tasks.length) : 0} days
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Schedule Variance</span>
                <span className={`font-medium ${averageVariance > 0 ? 'text-red-600' : averageVariance < 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {averageVariance > 0 ? '+' : ''}{averageVariance} days
                </span>
              </div>

              {nextMilestone && (
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Next Milestone</span>
                    <span className="font-medium">{nextMilestone.name}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-muted-foreground">Due in</span>
                    <span className="font-medium">
                      {Math.max(0, differenceInDays(new Date(nextMilestone.date), today))} days
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Task Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { status: 'Not Started', count: tasks.filter(t => t.status === 'Not Started').length, color: 'bg-gray-500' },
              { status: 'In Progress', count: tasks.filter(t => t.status === 'In Progress').length, color: 'bg-blue-500' },
              { status: 'Completed', count: tasks.filter(t => t.status === 'Completed').length, color: 'bg-green-500' },
              { status: 'On Hold', count: tasks.filter(t => t.status === 'On Hold').length, color: 'bg-yellow-500' },
              { status: 'Cancelled', count: tasks.filter(t => t.status === 'Cancelled').length, color: 'bg-red-500' }
            ].map((item) => (
              <div key={item.status} className="text-center">
                <div className={`w-12 h-12 ${item.color} rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                  {item.count}
                </div>
                <p className="text-sm font-medium">{item.status}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectTimeline;

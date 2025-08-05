
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Target, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { useMilestones } from '@/hooks/useMilestones';
import { usePhaseManagement } from '@/hooks/usePhaseManagement';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import MilestoneCard from './timeline/MilestoneCard';
import CriticalPathAnalysis from './timeline/CriticalPathAnalysis';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProjectTimelineProps {
  projectId: string;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projectId }) => {
  const { tasks, loading: tasksLoading } = useTaskManagement(projectId);
  const { milestones, loading: milestonesLoading } = useMilestones(projectId);
  const { phases, loading: phasesLoading } = usePhaseManagement(projectId);
  const [realTimeData, setRealTimeData] = useState<any>(null);

  // Real-time data subscription
  useEffect(() => {
    const channel = supabase
      .channel('project-timeline-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_tasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Real-time task update:', payload);
          setRealTimeData(prev => ({ ...prev, lastTaskUpdate: new Date() }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'milestones',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Real-time milestone update:', payload);
          setRealTimeData(prev => ({ ...prev, lastMilestoneUpdate: new Date() }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  if (tasksLoading || milestonesLoading || phasesLoading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading timeline data...
      </div>
    );
  }

  // Calculate milestone progress
  const getMilestoneProgress = (milestone: any) => {
    const milestoneTasks = tasks.filter(task => task.milestoneId === milestone.id);
    if (milestoneTasks.length === 0) return 0;
    
    const completedMilestoneTasks = milestoneTasks.filter(task => task.status === 'Completed').length;
    return Math.round((completedMilestoneTasks / milestoneTasks.length) * 100);
  };

  // Calculate real-time metrics
  const today = new Date();
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const totalTasks = tasks.length;
  
  // Calculate phase-based overall progress (more accurate than simple task completion ratio)
  const overallProgress = phases.length > 0 
    ? Math.round(phases.reduce((sum, phase) => sum + (phase.progress || 0), 0) / phases.length)
    : totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate overdue items
  const overdueTasks = tasks.filter(task => 
    task.status !== 'Completed' && 
    isAfter(today, new Date(task.endDate))
  );

  const overdueMilestones = milestones.filter(milestone => {
    const progress = getMilestoneProgress(milestone);
    const status = progress === 100 ? 'completed' : milestone.status;
    return status !== 'completed' && 
           isAfter(today, new Date(milestone.date));
  });

  // Find next milestone
  const upcomingMilestones = milestones
    .filter(m => {
      const progress = getMilestoneProgress(m);
      const status = progress === 100 ? 'completed' : m.status;
      return status !== 'completed' && !isAfter(today, new Date(m.date));
    })
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
              <AlertTriangle className={`h-8 w-8 ${(overdueTasks.length + overdueMilestones.length) > 0 ? 'text-red-500' : 'text-green-500'}`} />
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="font-semibold cursor-help">{healthScore}/100</p>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">Health score calculation:</p>
                      <p className="text-xs mt-1">
                        100 - (overdue tasks × 10) - (overdue milestones × 15) - (critical tasks × 5)
                      </p>
                      <p className="text-xs mt-1 opacity-75">
                        Current: 100 - ({overdueTasks.length} × 10) - ({overdueMilestones.length} × 15) - ({criticalTasks} × 5) = {healthScore}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Badge variant={healthStatus === 'red' ? 'destructive' : healthStatus === 'yellow' ? 'secondary' : 'default'}>
                  {healthStatus === 'red' ? 'At Risk' : healthStatus === 'yellow' ? 'Caution' : 'Healthy'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Timeline - Milestone Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Project Timeline
            {realTimeData?.lastMilestoneUpdate && (
              <Badge variant="outline" className="ml-2 text-xs">
                Updated: {format(realTimeData.lastMilestoneUpdate, 'HH:mm:ss')}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No milestones defined</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {milestones.map((milestone) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  progress={getMilestoneProgress(milestone)}
                />
              ))}
            </div>
          )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Milestones Completed</span>
                <span className="font-medium">
                  {milestones.filter(m => {
                    const progress = getMilestoneProgress(m);
                    return progress === 100 || m.status === 'completed';
                  }).length}/{milestones.length}
                </span>
              </div>
              <Progress 
                value={milestones.length > 0 ? 
                  (milestones.filter(m => {
                    const progress = getMilestoneProgress(m);
                    return progress === 100 || m.status === 'completed';
                  }).length / milestones.length) * 100 : 0}
                className="h-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Critical Tasks</span>
                <span className="font-medium text-red-600">{criticalTasks}</span>
              </div>
              <Progress 
                value={totalTasks > 0 ? (criticalTasks / totalTasks) * 100 : 0}
                className="h-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Task Duration</span>
                <span className="font-medium">
                  {tasks.length > 0 ? Math.round(tasks.reduce((sum, task) => sum + task.duration, 0) / tasks.length) : 0} days
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Schedule Variance</span>
                <span className={`font-medium ${averageVariance > 0 ? 'text-red-600' : averageVariance < 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {averageVariance > 0 ? '+' : ''}{averageVariance} days
                </span>
              </div>
            </div>
          </div>

          {nextMilestone && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-semibold mb-2">Next Milestone</h4>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{nextMilestone.name}</span>
                 <span className="font-medium">
                   {Math.max(0, differenceInDays(new Date(nextMilestone.date), today))} days remaining
                 </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critical Path Analysis */}
      <CriticalPathAnalysis projectId={projectId} tasks={tasks} />

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

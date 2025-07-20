
import React from 'react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, AlertCircle, Target } from 'lucide-react';

interface ProjectTimelineProps {
  projectId: string;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projectId }) => {
  const { tasks, milestones, loading } = useTaskManagement(projectId);

  if (loading) {
    return <div>Loading timeline...</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'upcoming':
        return <Target className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getMilestoneTasks = (milestoneId: string) => {
    return tasks.filter(task => task.milestoneId === milestoneId);
  };

  const calculateMilestoneProgress = (milestoneId: string) => {
    const milestoneTasks = getMilestoneTasks(milestoneId);
    if (milestoneTasks.length === 0) return 0;
    return Math.round(milestoneTasks.reduce((acc, task) => acc + task.progress, 0) / milestoneTasks.length);
  };

  // Calculate milestone statistics
  const milestoneStats = {
    completed: milestones.filter(m => m.status === 'completed').length,
    inProgress: milestones.filter(m => m.status === 'in-progress').length,
    upcoming: milestones.filter(m => m.status === 'upcoming').length,
    total: milestones.length
  };

  return (
    <div className="space-y-6">
      {/* Timeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="font-semibold">{milestoneStats.completed}</p>
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
                <p className="font-semibold">{milestoneStats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="font-semibold">{milestoneStats.upcoming}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Milestones</p>
                <p className="font-semibold">{milestoneStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Project Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border"></div>
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => {
                const milestoneTasks = getMilestoneTasks(milestone.id);
                const actualProgress = calculateMilestoneProgress(milestone.id);
                const completedTasks = milestoneTasks.filter(t => t.status === 'Completed').length;
                const isDelayed = milestone.date && milestone.baselineDate && 
                                 new Date(milestone.date) > new Date(milestone.baselineDate);

                return (
                  <div key={milestone.id} className="relative flex items-start gap-6">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-background border-2 border-border rounded-full">
                      {getStatusIcon(milestone.status)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <Card className={`border-l-4 ${
                        milestone.status === 'completed' ? 'border-l-green-500' : 
                        milestone.status === 'in-progress' ? 'border-l-blue-500' : 
                        'border-l-gray-400'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{milestone.name}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Due: {milestone.date ? new Date(milestone.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : 'No due date'}
                                {isDelayed && milestone.baselineDate && (
                                  <span className="text-orange-600">
                                    (Originally: {new Date(milestone.baselineDate).toLocaleDateString()})
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className={getStatusColor(milestone.status)}>
                                {milestone.status}
                              </Badge>
                              {isDelayed && (
                                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                                  Delayed
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {milestone.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {milestone.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between text-sm mb-3">
                            <div className="flex items-center gap-4">
                              <span className="text-muted-foreground">
                                Tasks: {completedTasks}/{milestoneTasks.length}
                              </span>
                              <div className="w-24 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all"
                                  style={{ width: `${actualProgress}%` }}
                                ></div>
                              </div>
                              <span className="text-muted-foreground">
                                {actualProgress}%
                              </span>
                            </div>
                            
                            {milestone.status === 'completed' && (
                              <span className="text-green-600 text-xs font-medium">
                                ✓ Completed
                              </span>
                            )}
                            
                            {milestone.status === 'in-progress' && (
                              <span className="text-blue-600 text-xs font-medium">
                                🔄 In progress
                              </span>
                            )}
                          </div>

                          {/* Milestone Tasks */}
                          {milestoneTasks.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-muted-foreground">Associated Tasks:</h4>
                              <div className="grid grid-cols-1 gap-2">
                                {milestoneTasks.map((task) => (
                                  <div key={task.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${
                                        task.status === 'Completed' ? 'bg-green-500' :
                                        task.status === 'In Progress' ? 'bg-blue-500' :
                                        task.status === 'On Hold' ? 'bg-yellow-500' : 'bg-gray-400'
                                      }`} />
                                      <span className="text-sm font-medium">{task.name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {task.progress}%
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {task.startDate && task.endDate ? 
                                        `${new Date(task.startDate).toLocaleDateString()} - ${new Date(task.endDate).toLocaleDateString()}` :
                                        'No dates set'
                                      }
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Path Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Path Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Critical tasks that directly impact the project timeline
            </p>
            <div className="grid grid-cols-1 gap-4">
              {tasks
                .filter(task => {
                  const isDelayed = task.endDate && task.baselineEndDate && 
                                   new Date(task.endDate) > new Date(task.baselineEndDate);
                  const hasDependents = tasks.some(t => t.dependencies.includes(task.id));
                  return isDelayed || hasDependents || task.priority === 'High' || task.priority === 'Critical';
                })
                .slice(0, 4)
                .map((task) => {
                  const isDelayed = task.endDate && task.baselineEndDate && 
                                   new Date(task.endDate) > new Date(task.baselineEndDate);
                  return (
                    <div key={task.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {isDelayed ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <span className="font-medium">{task.name}</span>
                        <Badge variant="outline" className={`text-xs ${
                          task.priority === 'Critical' || task.priority === 'High' ? 'bg-red-100 text-red-800' : 
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isDelayed && task.endDate && task.baselineEndDate
                          ? `Delay risk: High - Behind baseline by ${Math.ceil((new Date(task.endDate).getTime() - new Date(task.baselineEndDate).getTime()) / (24 * 60 * 60 * 1000))} days`
                          : task.status === 'Completed' 
                            ? 'On track - Completed successfully'
                            : `Progress: ${task.progress}% - ${task.status}`
                        }
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectTimeline;


import React, { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { ProjectData } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import HealthIndicator from '@/components/HealthIndicator';
import { Calendar, Users, Target, Clock, MapPin, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { calculateRealTimeProjectProgress, calculateProjectHealth } from '@/utils/phaseCalculations';

interface ProjectOverviewProps {
  project: ProjectData;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project }) => {
  // Debug logging to see what project data we're receiving
  useEffect(() => {
    console.log('[ProjectOverview] Received project data:', {
      name: project.name,
      startDate: project.startDate,
      endDate: project.endDate,
      computed_start_date: project.computed_start_date,
      computed_end_date: project.computed_end_date
    });
  }, [project]);
  const [realTimeProgress, setRealTimeProgress] = useState<number>(0);
  const [projectDates, setProjectDates] = useState<{ startDate: string | null, endDate: string | null }>({ startDate: null, endDate: null });
  const [healthData, setHealthData] = useState(project.health);

  // Load real-time data
  useEffect(() => {
    const loadRealTimeData = async () => {
      try {
        console.log(`[PROJECT OVERVIEW] Loading data for project: ${project.id}`);
        
        const [progress, health] = await Promise.all([
          calculateRealTimeProjectProgress(project.id),
          ProjectHealthService.calculateRealTimeProjectHealth(project.id)
        ]);
        
        console.log(`[PROJECT OVERVIEW] Results:`, { progress, health });
        
        setRealTimeProgress(progress);
        // Use stored computed dates directly from project instead of recalculating
        setProjectDates({
          startDate: project.computed_start_date,
          endDate: project.computed_end_date
        });
        setHealthData({ status: health.healthStatus, score: health.healthScore });
      } catch (error) {
        console.error('[PROJECT OVERVIEW] Error loading real-time project data:', error);
      }
    };

    loadRealTimeData();
  }, [project.id]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  const getDaysRemaining = () => {
    // Use computed project dates first, then manual dates as fallback
    const endDate = project.computed_end_date ? new Date(project.computed_end_date) :
                   (project.endDate ? new Date(project.endDate) : new Date());
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProjectDuration = () => {
    // Use computed project dates first, then manual dates as fallback
    const startDate = project.computed_start_date ? new Date(project.computed_start_date) :
                     (project.startDate ? new Date(project.startDate) : new Date());
    const endDate = project.computed_end_date ? new Date(project.computed_end_date) :
                   (project.endDate ? new Date(project.endDate) : new Date());
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate actual project statistics from real data - handle undefined tasks array
  const tasks = project.tasks || [];
  const milestones = project.milestones || [];
  
  // Calculate team size from unique assigned resources
  const assignedResourceIds = new Set<string>();
  tasks.forEach(task => {
    if (task.assignedResources) {
      task.assignedResources.forEach(resourceId => {
        assignedResourceIds.add(resourceId);
      });
    }
  });
  const actualTeamSize = assignedResourceIds.size || project.teamSize || 0;
  
  const projectStats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'Completed').length,
    inProgressTasks: tasks.filter(t => t.status === 'In Progress').length,
    delayedTasks: tasks.filter(t => new Date(t.endDate) > new Date(t.baselineEndDate)).length,
    totalMilestones: milestones.length,
    completedMilestones: milestones.filter(m => m.status === 'completed').length,
    averageProgress: tasks.length > 0 ? Math.round(tasks.reduce((acc, task) => acc + (task.progress || 0), 0) / tasks.length) : 0,
    actualTeamSize
  };

  return (
    <div className="space-y-6">
      {/* Project Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Project Overview</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${getPriorityColor(project.priority)} text-white`}>
                {project.priority} Priority
              </Badge>
            <HealthIndicator health={healthData.status} score={healthData.score} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{project.description}</p>
          
          {/* Status and Progress */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Current Status</p>
              <Badge variant="secondary" className="text-sm">{project.status}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Overall Progress</p>
              <div className="flex items-center gap-2">
                <Progress value={realTimeProgress} className="flex-1" />
                <span className="text-sm font-medium">{realTimeProgress}%</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Metrics - 2x2 grid on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="h-20 md:h-auto">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Calendar className="h-5 md:h-8 w-5 md:w-8 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground">Timeline</p>
                <p className="text-sm md:text-base font-semibold truncate">{getProjectDuration()} days</p>
                <p className="text-xs text-muted-foreground hidden md:block">
                  {(() => {
                    const startDisplay = project.computed_start_date ? new Date(project.computed_start_date).toLocaleDateString() :
                                        (project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set');
                    const endDisplay = project.computed_end_date ? new Date(project.computed_end_date).toLocaleDateString() :
                                      (project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set');
                    return `${startDisplay} - ${endDisplay}`;
                  })()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-20 md:h-auto">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Clock className="h-5 md:h-8 w-5 md:w-8 text-orange-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground">Days Left</p>
                <p className="text-sm md:text-base font-semibold truncate">{getDaysRemaining()} days</p>
                <p className="text-xs text-muted-foreground hidden md:block">Until completion</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-20 md:h-auto">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Users className="h-5 md:h-8 w-5 md:w-8 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground">Team</p>
                <p className="text-sm md:text-base font-semibold truncate">{projectStats.actualTeamSize} members</p>
                <p className="text-xs text-muted-foreground hidden md:block">Active contributors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-20 md:h-auto">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <DollarSign className="h-5 md:h-8 w-5 md:w-8 text-purple-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground">Budget</p>
                <p className="text-sm md:text-base font-semibold truncate">{project.budget || 'Not set'}</p>
                <p className="text-xs text-muted-foreground hidden md:block">Total allocated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task & Milestone Statistics - stacked on mobile */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Target className="h-4 md:h-5 w-4 md:w-5" />
              Task Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="text-center p-2 md:p-3 bg-muted/50 rounded-lg">
                <p className="text-lg md:text-2xl font-bold text-green-600">{projectStats.completedTasks}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center p-2 md:p-3 bg-muted/50 rounded-lg">
                <p className="text-lg md:text-2xl font-bold text-blue-600">{projectStats.inProgressTasks}</p>
                <p className="text-xs md:text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-muted-foreground">Total Tasks</span>
              <span className="text-sm md:text-base font-semibold">{projectStats.totalTasks}</span>
            </div>
            {projectStats.delayedTasks > 0 && (
              <div className="flex justify-between items-center text-orange-600">
                <span className="text-xs md:text-sm flex items-center gap-1">
                  <AlertTriangle className="h-3 md:h-4 w-3 md:w-4" />
                  Delayed Tasks
                </span>
                <span className="text-sm md:text-base font-semibold">{projectStats.delayedTasks}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <MapPin className="h-4 md:h-5 w-4 md:w-5" />
              Milestone Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="text-center p-2 md:p-3 bg-muted/50 rounded-lg">
                <p className="text-lg md:text-2xl font-bold text-green-600">{projectStats.completedMilestones}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center p-2 md:p-3 bg-muted/50 rounded-lg">
                <p className="text-lg md:text-2xl font-bold text-gray-600">{projectStats.totalMilestones - projectStats.completedMilestones}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Remaining</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-muted-foreground">Total Milestones</span>
              <span className="text-sm md:text-base font-semibold">{projectStats.totalMilestones}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-muted-foreground">Completion Rate</span>
              <span className="text-sm md:text-base font-semibold">{projectStats.totalMilestones > 0 ? Math.round((projectStats.completedMilestones / projectStats.totalMilestones) * 100) : 0}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Score Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Project Health Analysis
            <HealthIndicator health={healthData.status} score={healthData.score} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Overall Health Score</span>
              <span className="font-semibold">{healthData.score}/100</span>
            </div>
            <Progress value={healthData.score} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="h-3 bg-green-500 rounded mb-2"></div>
                <p className="text-sm font-medium">On Track</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round((projectStats.completedTasks / Math.max(projectStats.totalTasks, 1)) * 100)}% of Tasks
                </p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="h-3 bg-yellow-500 rounded mb-2"></div>
                <p className="text-sm font-medium">In Progress</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round((projectStats.inProgressTasks / Math.max(projectStats.totalTasks, 1)) * 100)}% of Tasks
                </p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="h-3 bg-red-500 rounded mb-2"></div>
                <p className="text-sm font-medium">Delayed</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round((projectStats.delayedTasks / Math.max(projectStats.totalTasks, 1)) * 100)}% of Tasks
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.length > 0 ? (
              <>
                {tasks
                  .filter(task => task.status === 'Completed')
                  .sort((a, b) => new Date(b.endDate || '').getTime() - new Date(a.endDate || '').getTime())
                  .slice(0, 3)
                  .map((task) => (
                    <div key={task.id} className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full mt-2 bg-green-500"></div>
                      <div>
                        <p className="text-sm">Task "{task.name}" completed</p>
                        <p className="text-xs text-muted-foreground">
                          Completed on {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                  ))}
                
                {tasks
                  .filter(task => task.status === 'In Progress' && (task.progress || 0) > 50)
                  .sort((a, b) => (b.progress || 0) - (a.progress || 0))
                  .slice(0, 2)
                  .map((task) => (
                    <div key={task.id} className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full mt-2 bg-blue-500"></div>
                      <div>
                        <p className="text-sm">Task "{task.name}" is {task.progress || 0}% complete</p>
                        <p className="text-xs text-muted-foreground">In progress</p>
                      </div>
                    </div>
                  ))}
                
                {milestones
                  .filter(milestone => milestone.status === 'completed')
                  .slice(-2)
                  .map((milestone) => (
                    <div key={milestone.id} className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full mt-2 bg-yellow-500"></div>
                      <div>
                        <p className="text-sm">Milestone "{milestone.name}" achieved</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(milestone.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity to display</p>
                <p className="text-xs">Tasks and milestones will appear here once they're created</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectOverview;

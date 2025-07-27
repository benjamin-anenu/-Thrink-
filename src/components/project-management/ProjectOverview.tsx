
import React, { useMemo, useEffect, useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { ProjectData } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import HealthIndicator from '@/components/HealthIndicator';
import { Calendar, Users, Target, Clock, MapPin, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { EventBus } from '@/services/EventBus';

interface ProjectOverviewProps {
  project: ProjectData;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Listen for real-time updates
  useEffect(() => {
    const eventBus = EventBus.getInstance();
    
    const handleProjectUpdate = (data: any) => {
      if (data.projectId === project.id) {
        setRefreshTrigger(prev => prev + 1);
      }
    };

    const unsubscribers = [
      eventBus.subscribe('task_updated', handleProjectUpdate),
      eventBus.subscribe('task_created', handleProjectUpdate),
      eventBus.subscribe('task_deleted', handleProjectUpdate),
      eventBus.subscribe('project_updated', handleProjectUpdate)
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
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
    const endDate = new Date(project.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProjectDuration = () => {
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 1000));
    return diffDays;
  };

  // Calculate weighted project health score
  const calculateProjectHealth = () => {
    if (!project.tasks || project.tasks.length === 0) return 100;
    
    let totalScore = 0;
    let totalWeight = 0;
    
    project.tasks.forEach(task => {
      // Weight based on priority
      const priorityWeight = task.priority === 'High' ? 3 : task.priority === 'Medium' ? 2 : 1;
      
      // Base score from progress
      let taskScore = task.progress || 0;
      
      // Apply penalties for schedule variance
      if (task.endDate && task.baselineEndDate) {
        const actualEnd = new Date(task.endDate);
        const baselineEnd = new Date(task.baselineEndDate);
        const variance = Math.ceil((actualEnd.getTime() - baselineEnd.getTime()) / (1000 * 60 * 60 * 24));
        
        if (variance > 0) {
          // Penalty for delayed tasks (up to -30 points)
          const delayPenalty = Math.min(30, variance * 2);
          taskScore = Math.max(0, taskScore - delayPenalty);
        } else if (variance < 0) {
          // Bonus for early completion (up to +10 points)
          const earlyBonus = Math.min(10, Math.abs(variance));
          taskScore = Math.min(100, taskScore + earlyBonus);
        }
      }
      
      // Apply status modifiers
      if (task.status === 'Completed') {
        taskScore = 100; // Completed tasks always score 100
      } else if (task.status === 'On Hold') {
        taskScore *= 0.5; // On-hold tasks get penalty
      } else if (task.status === 'Cancelled') {
        taskScore = 0; // Cancelled tasks score 0
      }
      
      totalScore += taskScore * priorityWeight;
      totalWeight += priorityWeight;
    });
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 100;
  };

  // Calculate actual project statistics from real data
  const projectStats = {
    totalTasks: project.tasks.length,
    completedTasks: project.tasks.filter(t => t.status === 'Completed').length,
    inProgressTasks: project.tasks.filter(t => t.status === 'In Progress').length,
    delayedTasks: project.tasks.filter(t => {
      if (!t.endDate || !t.baselineEndDate) return false;
      const actualEnd = new Date(t.endDate);
      const baselineEnd = new Date(t.baselineEndDate);
      return actualEnd > baselineEnd;
    }).length,
    totalMilestones: project.milestones.length,
    completedMilestones: project.milestones.filter(m => m.status === 'completed').length,
    averageProgress: Math.round(project.tasks.reduce((acc, task) => acc + (task.progress || 0), 0) / project.tasks.length),
    healthScore: calculateProjectHealth()
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
              <HealthIndicator health={project.health.status} score={project.health.score} />
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
                <Progress value={projectStats.averageProgress} className="flex-1" />
                <span className="text-sm font-medium">{projectStats.averageProgress}%</span>
              </div>
            </div>
          </div>

          {/* Tags */}
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
        </CardContent>
      </Card>

      {/* Project Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Timeline</p>
                <p className="font-semibold">{getProjectDuration()} days</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p className="font-semibold">{getDaysRemaining()} days</p>
                <p className="text-xs text-muted-foreground">Until completion</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Team Size</p>
                <p className="font-semibold">{project.teamSize} members</p>
                <p className="text-xs text-muted-foreground">Active contributors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-semibold">{project.budget}</p>
                <p className="text-xs text-muted-foreground">Total allocated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task & Milestone Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Task Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{projectStats.completedTasks}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{projectStats.inProgressTasks}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Tasks</span>
              <span className="font-semibold">{projectStats.totalTasks}</span>
            </div>
            {projectStats.delayedTasks > 0 && (
              <div className="flex justify-between items-center text-orange-600">
                <span className="text-sm flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Delayed Tasks
                </span>
                <span className="font-semibold">{projectStats.delayedTasks}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Milestone Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{projectStats.completedMilestones}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">{projectStats.totalMilestones - projectStats.completedMilestones}</p>
                <p className="text-sm text-muted-foreground">Remaining</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Milestones</span>
              <span className="font-semibold">{projectStats.totalMilestones}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Completion Rate</span>
              <span className="font-semibold">{Math.round((projectStats.completedMilestones / projectStats.totalMilestones) * 100)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Score Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Project Health Analysis
            <HealthIndicator health={project.health.status} score={project.health.score} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Overall Health Score</span>
              <span className="font-semibold">{projectStats.healthScore}/100</span>
            </div>
            <Progress value={projectStats.healthScore} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="h-3 bg-green-500 rounded mb-2"></div>
                <p className="text-sm font-medium">On Track</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round((projectStats.completedTasks / projectStats.totalTasks) * 100)}% Tasks
                </p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="h-3 bg-yellow-500 rounded mb-2"></div>
                <p className="text-sm font-medium">At Risk</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round((projectStats.inProgressTasks / projectStats.totalTasks) * 100)}% Tasks
                </p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="h-3 bg-red-500 rounded mb-2"></div>
                <p className="text-sm font-medium">Critical</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round((projectStats.delayedTasks / projectStats.totalTasks) * 100)}% Tasks
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
            {project.tasks
              .filter(task => task.status === 'Completed' || task.progress > 80)
              .slice(-5)
              .map((task, index) => (
                <div key={task.id} className="flex items-start gap-3">
                  <div className={`h-2 w-2 rounded-full mt-2 ${
                    task.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <p className="text-sm">
                      {task.status === 'Completed' 
                        ? `Task "${task.name}" completed`
                        : `Task "${task.name}" is ${task.progress}% complete`
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {task.status === 'Completed' ? 'Completed' : 'Updated'} recently
                    </p>
                  </div>
                </div>
              ))}
            
            {project.milestones
              .filter(milestone => milestone.status === 'completed' || milestone.status === 'in-progress')
              .slice(-2)
              .map((milestone) => (
                <div key={milestone.id} className="flex items-start gap-3">
                  <div className={`h-2 w-2 rounded-full mt-2 ${
                    milestone.status === 'completed' ? 'bg-yellow-500' : 'bg-purple-500'
                  }`}></div>
                  <div>
                    <p className="text-sm">
                      Milestone "{milestone.name}" {milestone.status === 'completed' ? 'achieved' : 'in progress'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(milestone.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectOverview;

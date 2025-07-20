import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, 
  Activity, Target, Users, ArrowUp, ArrowDown, Minus, Brain,
  Calendar, Zap, Award
} from 'lucide-react';
import { ProjectData } from '@/types/project';
import useAdvancedAnalytics from '@/hooks/useAdvancedAnalytics';

interface ProjectAnalyticsCardProps {
  project: ProjectData;
  compact?: boolean;
}

const ProjectAnalyticsCard: React.FC<ProjectAnalyticsCardProps> = ({ project, compact = false }) => {
  const {
    getProjectVelocity,
    getProjectQuality,
    analytics,
    hasData
  } = useAdvancedAnalytics();

  const velocity = getProjectVelocity(project.id);
  const quality = getProjectQuality(project.id);

  // Calculate project-specific metrics
  const completedTasks = project.tasks.filter(t => t.status === 'Completed').length;
  const totalTasks = project.tasks.length;
  const progressRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const overdueTasks = project.tasks.filter(task => {
    const taskDate = new Date(task.endDate);
    return taskDate < new Date() && task.status !== 'Completed';
  }).length;

  // Calculate project health score
  const healthScore = calculateProjectHealth(project, velocity, quality);
  
  // Get project-specific insights from the main analytics
  const projectInsights = analytics?.insights.filter(insight => 
    insight.description.toLowerCase().includes(project.name.toLowerCase()) ||
    insight.actionItems.some(action => 
      action.toLowerCase().includes(project.name.toLowerCase())
    )
  ) || [];

  const projectRisks = analytics?.activeRisks.filter(risk =>
    risk.affectedProjects.includes(project.id)
  ) || [];

  if (!hasData) {
    return null;
  }

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing': return <ArrowUp className="h-3 w-3 text-success" />;
      case 'decreasing': return <ArrowDown className="h-3 w-3 text-destructive" />;
      default: return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getHealthBadge = (score: number) => {
    if (score >= 80) return { variant: 'outline', color: 'bg-success/10 border-success/30', label: 'Healthy' };
    if (score >= 60) return { variant: 'outline', color: 'bg-warning/10 border-warning/30', label: 'At Risk' };
    return { variant: 'destructive', color: '', label: 'Critical' };
  };

  if (compact) {
    return (
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">Project Analytics</h4>
            <Badge {...getHealthBadge(healthScore)} className={getHealthBadge(healthScore).color}>
              {getHealthBadge(healthScore).label}
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-primary">{healthScore}</div>
              <p className="text-xs text-muted-foreground">Health Score</p>
            </div>
            
            {velocity && (
              <div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-lg font-bold">{velocity.currentVelocity}</span>
                  {getTrendIcon(velocity.velocityTrend)}
                </div>
                <p className="text-xs text-muted-foreground">Velocity</p>
              </div>
            )}
            
            <div>
              <div className="text-lg font-bold text-success">{progressRate.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>

          {(projectRisks.length > 0 || overdueTasks > 0) && (
            <div className="mt-3 p-2 bg-destructive/5 border border-destructive/20 rounded text-xs">
              {overdueTasks > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                  <span>{overdueTasks} overdue tasks</span>
                </div>
              )}
              {projectRisks.length > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                  <span>{projectRisks.length} active risks</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Project Analytics
          </div>
          <Badge {...getHealthBadge(healthScore)} className={getHealthBadge(healthScore).color}>
            Health: {healthScore}/100
          </Badge>
        </CardTitle>
        <CardDescription>Comprehensive insights for {project.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <Activity className="h-4 w-4 mx-auto mb-2 text-primary" />
            <div className="text-xl font-bold">{healthScore}</div>
            <p className="text-xs text-muted-foreground">Health Score</p>
          </div>

          {velocity && (
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-2">
                <TrendingUp className="h-4 w-4 text-info" />
                {getTrendIcon(velocity.velocityTrend)}
              </div>
              <div className="text-xl font-bold">{velocity.currentVelocity}</div>
              <p className="text-xs text-muted-foreground">Tasks/Week</p>
            </div>
          )}

          {quality && (
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <CheckCircle className="h-4 w-4 mx-auto mb-2 text-success" />
              <div className="text-xl font-bold">{quality.qualityScore}%</div>
              <p className="text-xs text-muted-foreground">Quality Score</p>
            </div>
          )}

          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <Target className="h-4 w-4 mx-auto mb-2 text-warning" />
            <div className="text-xl font-bold">{progressRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>

        {/* Progress Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Progress Breakdown</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Completed Tasks</span>
              <span>{completedTasks}/{totalTasks}</span>
            </div>
            <Progress value={progressRate} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div>Completed: {completedTasks}</div>
              <div>In Progress: {project.tasks.filter(t => t.status === 'In Progress').length}</div>
              <div>Pending: {project.tasks.filter(t => t.status === 'To Do').length}</div>
            </div>
          </div>
        </div>

        {/* Velocity and Predictions */}
        {velocity && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Velocity & Predictions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current Velocity</span>
                  {getTrendIcon(velocity.velocityTrend)}
                </div>
                <div className="text-lg font-bold">{velocity.currentVelocity} tasks/week</div>
                <p className="text-xs text-muted-foreground">
                  Average: {velocity.averageVelocity} tasks/week
                </p>
              </div>
              
              {velocity.predictedCompletion && (
                <div className="p-3 bg-info/5 border border-info/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-info" />
                    <span className="text-sm font-medium">Predicted Completion</span>
                  </div>
                  <div className="text-lg font-bold text-info">
                    {new Date(velocity.predictedCompletion).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on current velocity
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Risks and Issues */}
        {(projectRisks.length > 0 || overdueTasks > 0) && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Risks & Issues
            </h4>
            <div className="space-y-2">
              {overdueTasks > 0 && (
                <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-destructive" />
                      <span className="font-medium text-sm">Overdue Tasks</span>
                    </div>
                    <Badge variant="destructive">{overdueTasks}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tasks past their deadline requiring immediate attention
                  </p>
                </div>
              )}

              {projectRisks.map((risk, index) => (
                <div key={index} className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <span className="font-medium text-sm">{risk.type} Risk</span>
                    </div>
                    <Badge variant="outline">{risk.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{risk.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Project-Specific Insights */}
        {projectInsights.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Smart Insights
            </h4>
            <div className="space-y-2">
              {projectInsights.slice(0, 2).map((insight, index) => (
                <div key={index} className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{insight.title}</span>
                    <Badge variant="outline">{insight.confidence}% confidence</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {insight.description.substring(0, 150)}...
                  </p>
                  {insight.actionItems.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium">Recommended Action:</p>
                      <p className="text-xs text-muted-foreground">
                        • {insight.actionItems[0]}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Issues State */}
        {projectRisks.length === 0 && overdueTasks === 0 && projectInsights.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-success" />
            <h4 className="font-medium">Project Running Smoothly</h4>
            <p className="text-sm">No critical issues or risks detected</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to calculate project health score
function calculateProjectHealth(project: ProjectData, velocity: any, quality: any): number {
  let healthScore = 100;

  // Deduct points for overdue tasks
  const overdueTasks = project.tasks.filter(task => {
    const taskDate = new Date(task.endDate);
    return taskDate < new Date() && task.status !== 'Completed';
  }).length;
  
  healthScore -= overdueTasks * 10; // -10 points per overdue task

  // Factor in velocity trend
  if (velocity?.velocityTrend === 'decreasing') {
    healthScore -= 15;
  } else if (velocity?.velocityTrend === 'increasing') {
    healthScore += 5;
  }

  // Factor in quality score
  if (quality?.qualityScore) {
    // If quality is below 80%, deduct points
    if (quality.qualityScore < 80) {
      healthScore -= (80 - quality.qualityScore) / 2;
    }
  }

  // Factor in project progress
  const completedTasks = project.tasks.filter(t => t.status === 'Completed').length;
  const totalTasks = project.tasks.length;
  const progressRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Check if project is significantly behind schedule
  const projectStart = new Date(project.startDate);
  const projectEnd = new Date(project.endDate);
  const now = new Date();
  const totalDuration = projectEnd.getTime() - projectStart.getTime();
  const elapsedDuration = now.getTime() - projectStart.getTime();
  const expectedProgress = totalDuration > 0 ? (elapsedDuration / totalDuration) * 100 : 0;
  
  if (progressRate < expectedProgress - 20) {
    healthScore -= 20; // Significantly behind schedule
  } else if (progressRate < expectedProgress - 10) {
    healthScore -= 10; // Slightly behind schedule
  }

  return Math.max(0, Math.min(100, Math.round(healthScore)));
}

export default ProjectAnalyticsCard;
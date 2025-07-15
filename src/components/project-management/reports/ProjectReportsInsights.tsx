
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProjectInsights } from '@/hooks/useProjectInsights';
import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';

interface ProjectReportsInsightsProps {
  projectId?: string;
}

const ProjectReportsInsights: React.FC<ProjectReportsInsightsProps> = ({ projectId }) => {
  const { insights, teamPerformance, deadlineStatus, recommendations, isLoading, error } = useProjectInsights(projectId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading insights...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-destructive">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-800 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-800 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-800 bg-red-50 border-red-200';
      default:
        return 'text-blue-800 bg-blue-50 border-blue-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Insights & Recommendations
          {projectId && <Badge variant="outline">Project Specific</Badge>}
        </CardTitle>
        {!projectId && (
          <p className="text-sm text-muted-foreground">
            Workspace-wide insights across all projects
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{teamPerformance.averageScore.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                {getTrendIcon(teamPerformance.trend)}
                Avg Performance
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{teamPerformance.highPerformers}</div>
              <div className="text-sm text-muted-foreground">High Performers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{teamPerformance.lowPerformers}</div>
              <div className="text-sm text-muted-foreground">Need Support</div>
            </div>
          </div>

          {/* Deadline Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{deadlineStatus.onTrack}</div>
              <div className="text-xs text-muted-foreground">On Track</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-600">{deadlineStatus.atRisk}</div>
              <div className="text-xs text-muted-foreground">At Risk</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">{deadlineStatus.overdue}</div>
              <div className="text-xs text-muted-foreground">Overdue</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{deadlineStatus.upcomingDeadlines}</div>
              <div className="text-xs text-muted-foreground">Due Soon</div>
            </div>
          </div>

          {/* Insights List */}
          <div className="space-y-3">
            {insights.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>All systems running smoothly!</p>
                <p className="text-sm">No critical insights to display at the moment.</p>
              </div>
            ) : (
              insights.slice(0, 6).map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 border rounded-lg ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{insight.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {insight.category}
                        </Badge>
                        {insight.actionable && (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Action Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm opacity-90">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Recommendations
              </h4>
              <div className="space-y-2">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.length > 6 && (
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {insights.length - 6} more insights available in detailed analytics
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectReportsInsights;

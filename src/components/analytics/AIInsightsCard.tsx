
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAIInsights } from '@/hooks/useAIInsights';
import { LoadingOverlay } from '@/components/ui/loading-state';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Info, Clock, Target, BookOpen, Users } from 'lucide-react';
import { getStatusColors } from '@/utils/darkModeColors';

const AIInsightsCard: React.FC = () => {
  const { insights, loading, error } = useAIInsights();

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
        const successColors = getStatusColors('success');
        return `${successColors.bg} ${successColors.text} ${successColors.border}`;
      case 'warning':
        const warningColors = getStatusColors('warning');
        return `${warningColors.bg} ${warningColors.text} ${warningColors.border}`;
      case 'error':
        const errorColors = getStatusColors('error');
        return `${errorColors.bg} ${errorColors.text} ${errorColors.border}`;
      default:
        const infoColors = getStatusColors('info');
        return `${infoColors.bg} ${infoColors.text} ${infoColors.border}`;
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI-Powered Resource Analytics
        </CardTitle>
        <CardDescription>
          Smart insights to optimize team performance, identify skill gaps, and improve project outcomes. Take action on recommendations below to drive growth.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoadingOverlay isLoading={loading} loadingText="Loading AI insights...">
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground font-medium">Ready to Optimize Your Team</p>
              <p className="text-sm text-muted-foreground mt-1">
                Assign resources to projects and let AI identify optimization opportunities for better performance and growth.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.slice(0, 6).map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {insight.category}
                        </Badge>
                      </div>
                      <p className="text-sm opacity-90 mb-2">
                        {insight.description}
                      </p>
                      
                      {/* Show actionable metrics */}
                      {(insight.overallFitScore !== undefined || insight.skillMatchScore !== undefined) && (
                        <div className="flex gap-2 text-xs mb-2">
                          {insight.overallFitScore !== undefined && (
                            <div className="flex items-center gap-1 bg-zinc-800/50 px-2 py-1 rounded">
                              <Target className="h-3 w-3" />
                              <span>Fit: {insight.overallFitScore}%</span>
                            </div>
                          )}
                          {insight.skillMatchScore !== undefined && (
                            <div className="flex items-center gap-1 bg-zinc-800/50 px-2 py-1 rounded">
                              <BookOpen className="h-3 w-3" />
                              <span>Skills: {insight.skillMatchScore}%</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {insight.actionable && (
                        <div className="flex items-center gap-1 mt-2 text-xs p-2 bg-amber-900/20 text-amber-300 rounded border border-amber-700/30">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium">Action Required: Training Recommended</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {insights.length > 6 && (
            <div className="text-center mt-4 pt-4 border-t border-zinc-700/50">
              <p className="text-sm text-muted-foreground">
                <Users className="h-4 w-4 inline mr-1" />
                {insights.length - 6} more optimization opportunities available
              </p>
            </div>
          )}
        </LoadingOverlay>
      </CardContent>
    </Card>
  );
};

export default AIInsightsCard;

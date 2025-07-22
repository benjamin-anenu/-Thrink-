
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAIInsights } from '@/hooks/useAIInsights';
import { LoadingOverlay } from '@/components/ui/loading-state';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';

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
        return 'text-green-800 bg-green-50 border-green-200 dark:text-green-200 dark:bg-green-950/20 dark:border-green-800';
      case 'warning':
        return 'text-yellow-800 bg-yellow-50 border-yellow-200 dark:text-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800';
      case 'error':
        return 'text-red-800 bg-red-50 border-red-200 dark:text-red-200 dark:bg-red-950/20 dark:border-red-800';
      default:
        return 'text-blue-800 bg-blue-50 border-blue-200 dark:text-blue-200 dark:bg-blue-950/20 dark:border-blue-800';
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
          AI Insights & Recommendations
        </CardTitle>
        <CardDescription>
          Latest analytics and AI-powered recommendations for your workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoadingOverlay isLoading={loading} loadingText="Loading AI insights...">
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No AI insights available yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create projects and assign resources to generate AI recommendations.
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
                      
                      {/* Show scores if available */}
                      {(insight.overallFitScore !== undefined || insight.skillMatchScore !== undefined) && (
                        <div className="flex gap-2 text-xs">
                          {insight.overallFitScore !== undefined && (
                            <span className="bg-black/10 dark:bg-white/10 px-2 py-1 rounded">
                              Fit: {insight.overallFitScore}%
                            </span>
                          )}
                          {insight.skillMatchScore !== undefined && (
                            <span className="bg-black/10 dark:bg-white/10 px-2 py-1 rounded">
                              Skills: {insight.skillMatchScore}%
                            </span>
                          )}
                        </div>
                      )}
                      
                      {insight.actionable && (
                        <div className="flex items-center gap-1 mt-2 text-xs">
                          <Clock className="h-3 w-3" />
                          <span>Action Required</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {insights.length > 6 && (
            <div className="text-center mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {insights.length - 6} more insights available in detailed analytics
              </p>
            </div>
          )}
        </LoadingOverlay>
      </CardContent>
    </Card>
  );
};

export default AIInsightsCard;

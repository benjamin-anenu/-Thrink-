import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAIInsights } from '@/hooks/useAIInsights';
import { useAISettings } from '@/hooks/useAISettings';
import { LoadingOverlay } from '@/components/ui/loading-state';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AIInsightsSettings from '@/components/analytics/AIInsightsSettings';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Info, Clock, Target, BookOpen, Users, RefreshCw } from 'lucide-react';

const AIInsightsCard: React.FC = () => {
  const { insights, loading, error, refreshInsights } = useAIInsights();
  const { settings } = useAISettings();

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
        return 'bg-green-900/20 text-green-300 border border-green-800/20';
      case 'warning':
        return 'bg-amber-900/20 text-amber-300 border border-amber-800/20';
      case 'error':
        return 'bg-red-900/20 text-red-300 border border-red-800/20';
      default:
        return 'bg-blue-900/20 text-blue-300 border border-blue-800/20';
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <AIInsightsSettings />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI-Powered Resource Analytics
              <Badge variant={settings.useAIAnalysis ? "default" : "secondary"}>
                {settings.useAIAnalysis ? "AI Mode" : "Basic Mode"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshInsights}
                  className="ml-2"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AIInsightsSettings />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Resource Analytics
            <Badge variant={settings.useAIAnalysis ? "default" : "secondary"}>
              {settings.useAIAnalysis ? "AI Mode" : "Basic Mode"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {settings.useAIAnalysis 
              ? "Advanced AI analysis provides detailed skill gap insights and personalized recommendations."
              : "Basic analysis provides general insights. Enable AI mode for detailed recommendations."
            }
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
                    className={`p-4 rounded-lg ${getInsightColor(insight.type)}`}
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
                              <div className="flex items-center gap-1 bg-zinc-800/30 px-2 py-1 rounded">
                                <Target className="h-3 w-3" />
                                <span>Fit: {insight.overallFitScore}%</span>
                              </div>
                            )}
                            {insight.skillMatchScore !== undefined && (
                              <div className="flex items-center gap-1 bg-zinc-800/30 px-2 py-1 rounded">
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
    </div>
  );
};

export default AIInsightsCard;

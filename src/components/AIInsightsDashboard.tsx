
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useEnhancedResources } from '@/hooks/useEnhancedResources';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { DataPopulationService } from '@/services/DataPopulationService';
import { toast } from 'sonner';

const AIInsightsDashboard = () => {
  const { 
    utilizationMetrics, 
    aiRecommendations, 
    resources,
    refreshEnhancedData 
  } = useEnhancedResources();
  const { currentWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(false);

  const handlePopulateSampleData = async () => {
    if (!currentWorkspace?.id) return;
    
    setLoading(true);
    try {
      await DataPopulationService.populateAllSampleData(currentWorkspace.id);
      await refreshEnhancedData();
      toast.success('Sample data populated successfully');
    } catch (error) {
      toast.error('Failed to populate sample data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate AI insights
  const utilizationData = Object.values(utilizationMetrics);
  const avgUtilization = utilizationData.length > 0 
    ? Math.round(utilizationData.reduce((acc, m) => acc + m.utilization_percentage, 0) / utilizationData.length)
    : 0;

  const overloadedCount = utilizationData.filter(m => m.status.includes('Overloaded')).length;
  const underutilizedCount = utilizationData.filter(m => m.status === 'Underutilized').length;
  const bottleneckRisk = utilizationData.length > 0
    ? Math.round(utilizationData.reduce((acc, m) => acc + m.bottleneck_risk, 0) / utilizationData.length)
    : 0;

  const highConfidenceRecommendations = aiRecommendations.filter(r => r.overall_fit_score > 8).length;
  const avgTaskCompletionForecast = aiRecommendations.length > 0
    ? Math.round(aiRecommendations.reduce((acc, r) => acc + r.task_completion_forecast, 0) / aiRecommendations.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Resource Insights
          </h2>
          <p className="text-muted-foreground">
            AI-powered analytics and recommendations for resource optimization
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handlePopulateSampleData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Populate Sample Data
          </Button>
          
          <Button 
            variant="outline" 
            onClick={refreshEnhancedData}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Recommendations</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiRecommendations.length}</div>
            <p className="text-xs text-muted-foreground">
              {highConfidenceRecommendations} high confidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgUtilization}%</div>
            <Progress value={avgUtilization} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Health</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Overloaded</span>
                <Badge variant={overloadedCount > 0 ? "destructive" : "secondary"}>
                  {overloadedCount}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Underutilized</span>
                <Badge variant={underutilizedCount > 0 ? "outline" : "secondary"}>
                  {underutilizedCount}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Forecast</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTaskCompletionForecast}%</div>
            <p className="text-xs text-muted-foreground">
              Bottleneck risk: {bottleneckRisk}/10
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Latest AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {aiRecommendations.length > 0 ? (
            <div className="space-y-4">
              {aiRecommendations.slice(0, 5).map((recommendation) => (
                <div key={recommendation.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Score: {recommendation.overall_fit_score.toFixed(1)}
                      </Badge>
                      <Badge variant={recommendation.overload_risk_score > 5 ? "destructive" : "outline"}>
                        Risk: {recommendation.overload_risk_score}/10
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.round(recommendation.success_probability)}% success probability
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div>
                      <div className="text-sm font-medium mb-1">Task Capacity Fit</div>
                      <Progress value={recommendation.task_capacity_fit_score * 10} className="h-2" />
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Skill Match</div>
                      <Progress value={recommendation.skill_match_score * 10} className="h-2" />
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Availability</div>
                      <Progress value={recommendation.availability_score * 10} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm text-muted-foreground">
                    Recommended tasks: {recommendation.recommended_task_count} | 
                    Quality prediction: {Math.round(recommendation.quality_prediction)}%
                  </div>
                </div>
              ))}
              
              {aiRecommendations.length > 5 && (
                <div className="text-center pt-4">
                  <Badge variant="outline">
                    +{aiRecommendations.length - 5} more recommendations
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No AI recommendations available</p>
              <p className="text-sm">Click "Populate Sample Data" to generate demo recommendations</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Utilization Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Utilization Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {utilizationData.length > 0 ? (
            <div className="space-y-4">
              {utilizationData.slice(0, 8).map((metrics, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Resource {index + 1}</div>
                      <div className="text-sm text-muted-foreground">
                        {metrics.task_count}/{metrics.task_capacity} tasks
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(metrics.utilization_percentage)}%
                      </div>
                      <Badge 
                        variant={
                          metrics.status.includes('Overloaded') ? 'destructive' :
                          metrics.status === 'Underutilized' ? 'outline' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {metrics.status}
                      </Badge>
                    </div>
                    <Progress 
                      value={metrics.utilization_percentage} 
                      className="w-24"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No utilization data available</p>
              <p className="text-sm">Click "Populate Sample Data" to generate demo metrics</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsightsDashboard;

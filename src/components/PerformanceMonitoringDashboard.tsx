
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Clock, 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Users,
  BarChart3
} from 'lucide-react';
import { useEnhancedResources } from '@/hooks/useEnhancedResources';

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

const PerformanceMonitoringDashboard = () => {
  const { utilizationMetrics, aiRecommendations, resources } = useEnhancedResources();
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    calculatePerformanceMetrics();
  }, [utilizationMetrics, aiRecommendations, resources]);

  const calculatePerformanceMetrics = () => {
    const utilizationData = Object.values(utilizationMetrics);
    
    if (utilizationData.length === 0) return;

    const avgUtilization = utilizationData.reduce((acc, m) => acc + m.utilization_percentage, 0) / utilizationData.length;
    // Fix: Use predicted_completion_count instead of tasks_completed
    const avgTaskCompletion = utilizationData.reduce((acc, m) => acc + (m.predicted_completion_count / m.task_count * 100), 0) / utilizationData.length;
    const avgBottleneckRisk = utilizationData.reduce((acc, m) => acc + m.bottleneck_risk, 0) / utilizationData.length;
    const resourceEfficiency = aiRecommendations.length > 0 
      ? aiRecommendations.reduce((acc, r) => acc + r.overall_fit_score, 0) / aiRecommendations.length * 10
      : 0;

    const metrics: PerformanceMetric[] = [
      {
        name: 'Resource Utilization',
        value: avgUtilization,
        target: 80,
        trend: avgUtilization > 75 ? 'up' : avgUtilization < 60 ? 'down' : 'stable',
        status: avgUtilization > 90 ? 'critical' : avgUtilization > 75 ? 'good' : 'warning'
      },
      {
        name: 'Task Completion Rate',
        value: avgTaskCompletion,
        target: 85,
        trend: avgTaskCompletion > 80 ? 'up' : 'stable',
        status: avgTaskCompletion > 80 ? 'good' : avgTaskCompletion > 60 ? 'warning' : 'critical'
      },
      {
        name: 'Bottleneck Risk Score',
        value: avgBottleneckRisk,
        target: 3,
        trend: avgBottleneckRisk < 4 ? 'up' : 'down',
        status: avgBottleneckRisk < 3 ? 'good' : avgBottleneckRisk < 6 ? 'warning' : 'critical'
      },
      {
        name: 'AI Assignment Efficiency',
        value: resourceEfficiency,
        target: 75,
        trend: resourceEfficiency > 70 ? 'up' : 'stable',
        status: resourceEfficiency > 75 ? 'good' : resourceEfficiency > 60 ? 'warning' : 'critical'
      }
    ];

    setPerformanceMetrics(metrics);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default:
        return <div className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Performance Monitoring
        </h2>
        <p className="text-muted-foreground">
          Real-time performance metrics and system health monitoring
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              {getStatusIcon(metric.status)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold">
                  {metric.name === 'Bottleneck Risk Score' 
                    ? `${metric.value.toFixed(1)}/10`
                    : `${Math.round(metric.value)}%`
                  }
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              <Progress 
                value={metric.name === 'Bottleneck Risk Score' 
                  ? (10 - metric.value) * 10  // Invert for risk score
                  : metric.value
                } 
                className="mb-2" 
              />
              <p className="text-xs text-muted-foreground">
                Target: {metric.name === 'Bottleneck Risk Score' 
                  ? `${metric.target}/10 or less`
                  : `${metric.target}%`
                }
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Resource Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(utilizationMetrics).slice(0, 6).map(([resourceId, metrics], index) => (
                <div key={resourceId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      metrics.status.includes('Overloaded') ? 'bg-red-500' :
                      metrics.status === 'Underutilized' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <div className="font-medium">Resource {index + 1}</div>
                      <div className="text-sm text-muted-foreground">
                        {metrics.task_count} tasks • {Math.round(metrics.utilization_percentage)}% utilized
                      </div>
                    </div>
                  </div>
                  <Badge variant={
                    metrics.status.includes('Overloaded') ? 'destructive' :
                    metrics.status === 'Underutilized' ? 'outline' : 'secondary'
                  }>
                    {metrics.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              AI Recommendation Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiRecommendations.slice(0, 5).map((recommendation, index) => (
                <div key={recommendation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      recommendation.overall_fit_score > 8 ? 'bg-green-500' :
                      recommendation.overall_fit_score > 6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="font-medium">Recommendation {index + 1}</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(recommendation.success_probability)}% success probability
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">
                      {recommendation.overall_fit_score.toFixed(1)}/10
                    </div>
                    <Badge variant={
                      recommendation.overall_fit_score > 8 ? 'secondary' :
                      recommendation.overall_fit_score > 6 ? 'outline' : 'destructive'
                    } className="text-xs">
                      {recommendation.overall_fit_score > 8 ? 'Excellent' :
                       recommendation.overall_fit_score > 6 ? 'Good' : 'Poor'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(utilizationMetrics).filter(m => m.predicted_completion_count > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Resources</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(utilizationMetrics).reduce((acc, m) => acc + m.predicted_completion_count, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Predicted Completions</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {aiRecommendations.filter(r => r.overall_fit_score > 7).length}
                </div>
                <div className="text-sm text-muted-foreground">High-Quality Recommendations</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitoringDashboard;

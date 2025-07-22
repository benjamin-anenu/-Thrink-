import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useEnhancedResources } from '@/hooks/useEnhancedResources';

export function AIInsightsDashboard() {
  const { resources, utilizationMetrics } = useEnhancedResources();

  // Generate simplified, actionable insights
  const generateInsights = () => {
    const insights = [];
    
    // Check for overloaded resources
    const overloadedResources = Object.entries(utilizationMetrics).filter(
      ([_, metrics]) => (metrics?.utilization_percentage || 0) > 85
    );
    
    if (overloadedResources.length > 0) {
      const resourceNames = overloadedResources
        .map(([id, _]) => resources.find(r => r.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      
      insights.push({
        type: 'warning',
        title: 'Workload Alert',
        description: `${resourceNames} may be overloaded. Consider redistributing tasks.`,
        icon: AlertTriangle,
        priority: 'high'
      });
    }

    // Check for underutilized resources
    const underutilizedResources = Object.entries(utilizationMetrics).filter(
      ([_, metrics]) => (metrics?.utilization_percentage || 0) < 40
    );
    
    if (underutilizedResources.length > 0) {
      const resourceNames = underutilizedResources
        .map(([id, _]) => resources.find(r => r.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      
      insights.push({
        type: 'opportunity',
        title: 'Available Capacity',
        description: `${resourceNames} can take on additional work this week.`,
        icon: TrendingUp,
        priority: 'medium'
      });
    }

    // Check for bottleneck risks
    const highRiskResources = Object.entries(utilizationMetrics).filter(
      ([_, metrics]) => (metrics?.bottleneck_risk || 0) > 7
    );
    
    if (highRiskResources.length > 0) {
      const resourceNames = highRiskResources
        .map(([id, _]) => resources.find(r => r.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      
      insights.push({
        type: 'critical',
        title: 'Bottleneck Risk',
        description: `${resourceNames} might become project bottlenecks. Monitor closely.`,
        icon: AlertTriangle,
        priority: 'high'
      });
    }

    // General recommendations
    if (resources.length > 0 && insights.length === 0) {
      insights.push({
        type: 'success',
        title: 'Team Performance',
        description: 'Your team workload is well balanced. Great job!',
        icon: CheckCircle,
        priority: 'low'
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getInsightVariant = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'opportunity': return 'default';
      case 'success': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">AI Insights</h2>
          <p className="text-muted-foreground">Smart recommendations for your team</p>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{resources.length}</div>
                <p className="text-xs text-muted-foreground">Active Resources</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {Object.values(utilizationMetrics).filter(m => m?.status === 'Overloaded').length}
                </div>
                <p className="text-xs text-muted-foreground">Overloaded</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {Object.values(utilizationMetrics).filter(m => (m?.utilization_percentage || 0) < 40).length}
                </div>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Recommendations</CardTitle>
          <CardDescription>
            AI-powered suggestions to optimize your team performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    <Icon className="h-5 w-5 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant={getInsightVariant(insight.type)}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Add resources to get AI-powered insights</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resource Performance Overview */}
      {resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resources.slice(0, 5).map(resource => {
                const metrics = utilizationMetrics[resource.id];
                return (
                  <div key={resource.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{resource.name}</p>
                        <p className="text-sm text-muted-foreground">{resource.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <Progress value={metrics?.utilization_percentage || 0} />
                      </div>
                      <Badge variant={
                        metrics?.status === 'Overloaded' ? 'destructive' :
                        metrics?.status === 'Well Utilized' ? 'default' : 'secondary'
                      }>
                        {metrics?.status || 'Available'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
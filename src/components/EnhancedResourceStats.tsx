
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { useEnhancedResources } from '@/hooks/useEnhancedResources';

const EnhancedResourceStats = () => {
  const { resources, utilizationMetrics, aiRecommendations } = useEnhancedResources();

  // Calculate enhanced metrics
  const totalResources = resources.length;
  const activeResources = resources.filter(r => r.type === 'human').length;
  
  const utilizationData = Object.values(utilizationMetrics);
  const avgUtilization = utilizationData.length > 0 
    ? Math.round(utilizationData.reduce((acc, m) => acc + m.utilization_percentage, 0) / utilizationData.length)
    : 0;

  const overloadedResources = utilizationData.filter(m => m.status.includes('Overloaded')).length;
  const underutilizedResources = utilizationData.filter(m => m.status === 'Underutilized').length;
  const aiRecommendationsCount = aiRecommendations.length;
  
  const bottleneckRisk = utilizationData.length > 0
    ? Math.round(utilizationData.reduce((acc, m) => acc + m.bottleneck_risk, 0) / utilizationData.length)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalResources}</div>
          <p className="text-xs text-muted-foreground">
            {activeResources} active human resources
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
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
              <Badge variant={overloadedResources > 0 ? "destructive" : "secondary"}>
                {overloadedResources}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Underutilized</span>
              <Badge variant={underutilizedResources > 0 ? "outline" : "secondary"}>
                {underutilizedResources}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Recommendations</span>
              <Badge variant="secondary">{aiRecommendationsCount}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Bottleneck Risk</span>
              <Badge variant={bottleneckRisk > 7 ? "destructive" : bottleneckRisk > 4 ? "outline" : "secondary"}>
                {bottleneckRisk}/10
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedResourceStats;

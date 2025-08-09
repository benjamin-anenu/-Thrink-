
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

  // Calculate enhanced metrics from real data only
  const totalResources = resources.length;
  const activeResources = resources.filter(r => r.workspace_id).length;
  
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
      <Card className="h-24 md:h-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
          <CardTitle className="text-xs md:text-sm font-medium">Total Resources</CardTitle>
          <Users className="h-3 md:h-4 w-3 md:w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="text-lg md:text-2xl font-bold">{totalResources}</div>
          <p className="text-xs text-muted-foreground truncate">
            {activeResources} active
          </p>
        </CardContent>
      </Card>

      <Card className="h-24 md:h-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
          <CardTitle className="text-xs md:text-sm font-medium">Avg Utilization</CardTitle>
          <TrendingUp className="h-3 md:h-4 w-3 md:w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="text-lg md:text-2xl font-bold">{avgUtilization}%</div>
          {avgUtilization > 0 && <Progress value={avgUtilization} className="mt-1 md:mt-2 h-1 md:h-2" />}
        </CardContent>
      </Card>

      <Card className="h-24 md:h-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
          <CardTitle className="text-xs md:text-sm font-medium">Resource Health</CardTitle>
          <AlertTriangle className="h-3 md:h-4 w-3 md:w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="space-y-1 md:space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm truncate">Overloaded</span>
              <Badge variant={overloadedResources > 0 ? "destructive" : "secondary"} className="text-xs">
                {overloadedResources}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm truncate">Under-used</span>
              <Badge variant={underutilizedResources > 0 ? "outline" : "secondary"} className="text-xs">
                {underutilizedResources}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="h-24 md:h-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
          <CardTitle className="text-xs md:text-sm font-medium">AI Insights</CardTitle>
          <Brain className="h-3 md:h-4 w-3 md:w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="space-y-1 md:space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm truncate">Recommend</span>
              <Badge variant="secondary" className="text-xs">{aiRecommendationsCount}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm truncate">Risk</span>
              <Badge variant={bottleneckRisk > 7 ? "destructive" : bottleneckRisk > 4 ? "outline" : "secondary"} className="text-xs">
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

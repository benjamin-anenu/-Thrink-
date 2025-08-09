import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';

interface MobileReportsViewProps {
  projectId: string;
}

export const MobileReportsView: React.FC<MobileReportsViewProps> = ({ projectId }) => {
  // Mock data for demo - replace with actual data from hooks
  const metrics = [
    {
      title: "Project Progress",
      value: 68,
      unit: "%",
      trend: "up",
      description: "Overall project completion"
    },
    {
      title: "Tasks Completed",
      value: 24,
      total: 35,
      unit: "tasks",
      trend: "up",
      description: "Tasks completed this sprint"
    },
    {
      title: "Budget Used",
      value: 45,
      unit: "%",
      trend: "neutral",
      description: "Of allocated budget"
    },
    {
      title: "Days Remaining",
      value: 22,
      unit: "days",
      trend: "down",
      description: "Until project deadline"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">{metric.title}</h3>
                {getTrendIcon(metric.trend)}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  {metric.total && (
                    <span className="text-sm text-muted-foreground">/ {metric.total}</span>
                  )}
                </div>
                
                {metric.unit === "%" && (
                  <Progress value={metric.value} className="h-2" />
                )}
                
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Project Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">On Track</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              Healthy
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Budget Status</span>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20">
              <Clock className="h-3 w-3 mr-1" />
              Watch
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Timeline</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              On Time
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Simple Chart Placeholder */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { week: "Week 1", progress: 20 },
              { week: "Week 2", progress: 45 },
              { week: "Week 3", progress: 60 },
              { week: "Week 4", progress: 68 }
            ].map((week, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-xs w-12 text-muted-foreground">{week.week}</span>
                <Progress value={week.progress} className="h-2 flex-1" />
                <span className="text-xs w-8 text-muted-foreground">{week.progress}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
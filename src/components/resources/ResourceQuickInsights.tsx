
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle, UserX } from 'lucide-react';
import { useResourceDashboardData } from '@/hooks/useResourceDashboardData';

const ResourceQuickInsights: React.FC = () => {
  const { metrics, loading } = useResourceDashboardData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const insights = [
    {
      title: 'Available Resources',
      value: metrics.availableResources,
      subtitle: 'Ready for assignments',
      icon: Users,
      badgeColor: metrics.availableResources > 0 ? 'bg-green-500' : 'bg-gray-500',
      status: metrics.availableResources > 0 ? 'Available' : 'None Available'
    },
    {
      title: 'Projects with Resource Gaps',
      value: metrics.projectsWithGaps,
      subtitle: 'Need resource allocation',
      icon: AlertTriangle,
      badgeColor: metrics.projectsWithGaps > 0 ? 'bg-yellow-500' : 'bg-green-500',
      status: metrics.projectsWithGaps > 0 ? 'Action Required' : 'All Covered'
    },
    {
      title: 'Unassigned Resources',
      value: metrics.unassignedResources,
      subtitle: 'Without active projects',
      icon: UserX,
      badgeColor: metrics.unassignedResources > 0 ? 'bg-blue-500' : 'bg-gray-500',
      status: metrics.unassignedResources > 0 ? 'Available' : 'All Assigned'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {insights.map((insight, index) => {
        const IconComponent = insight.icon;
        
        return (
          <Card key={index} className="bg-card border-border hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {insight.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {insight.subtitle}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-foreground">
                      {insight.value}
                    </div>
                    <Badge 
                      className={`${insight.badgeColor} text-white text-xs px-2 py-1`}
                      variant="secondary"
                    >
                      {insight.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ResourceQuickInsights;

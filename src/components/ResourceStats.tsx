
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Clock, TrendingUp } from 'lucide-react';
import { Resource } from '@/contexts/ResourceContext';

interface ResourceStatsProps {
  resources: Resource[];
}

const ResourceStats: React.FC<ResourceStatsProps> = ({ resources }) => {
  const totalResources = resources.length;
  const availableResources = resources.filter(r => r.availability && r.availability > 50).length;
  const busyResources = resources.filter(r => r.availability && r.availability <= 50).length;
  const avgAvailability = resources.length > 0 
    ? Math.round(resources.reduce((sum, r) => sum + (r.availability || 0), 0) / resources.length)
    : 0;

  const stats = [
    {
      title: 'Total Resources',
      value: totalResources,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Available',
      value: availableResources,
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      title: 'Busy',
      value: busyResources,
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Avg Availability',
      value: `${avgAvailability}%`,
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ResourceStats;

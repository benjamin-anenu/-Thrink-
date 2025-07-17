import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/metric-card';
import { useProject } from '@/contexts/ProjectContext';
import { useResources } from '@/contexts/ResourceContext';
import { useStakeholders } from '@/contexts/StakeholderContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Users, ListChecks, BarChart3, PieChart as LucidePieChart } from 'lucide-react';

const AnalyticsMetrics = () => {
  const { projects } = useProject();
  const { resources } = useResources();
  const { stakeholders } = useStakeholders();

  // Calculate metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Planning').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const totalResources = resources.length;
  const totalStakeholders = stakeholders.length;

  // Calculate resource utilization safely
  const avgUtilization = resources.length > 0 
    ? Math.round(resources.reduce((acc, r) => acc + (r.utilization || 0), 0) / resources.length)
    : 0;

  // Calculate workspace distribution safely
  const workspaceDistribution = resources.reduce((acc: Record<string, number>, resource) => {
    const workspaceId = resource.workspaceId || 'Unknown';
    acc[workspaceId] = (acc[workspaceId] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for the pie chart
  const workspaceData = Object.entries(workspaceDistribution).map(([name, value], index) => ({
    name,
    value,
    color: `hsl(${index * 60}, 70%, 50%)` // Generate distinct colors
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Projects"
        value={totalProjects}
        icon={ListChecks}
        description="Number of projects in the workspace"
      />
      <MetricCard
        title="Active Projects"
        value={activeProjects}
        icon={BarChart3}
        description="Projects currently in progress"
      />
      <MetricCard
        title="Completed Projects"
        value={completedProjects}
        icon={ListChecks}
        description="Projects successfully completed"
      />
      <MetricCard
        title="Total Resources"
        value={totalResources}
        icon={Users}
        description="Number of resources available"
      />
      <MetricCard
        title="Total Stakeholders"
        value={totalStakeholders}
        icon={Users}
        description="Number of stakeholders involved"
      />
      <MetricCard
        title="Avg. Resource Utilization"
        value={`${avgUtilization}%`}
        icon={BarChart3}
        description="Average utilization of resources"
      />

      {/* Workspace Distribution Chart */}
      <Card className="bg-card border-border col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucidePieChart className="h-5 w-5" />
            Workspace Distribution
          </CardTitle>
          <CardDescription>
            Distribution of resources across workspaces
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={workspaceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={30}
                label
              >
                {workspaceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsMetrics;

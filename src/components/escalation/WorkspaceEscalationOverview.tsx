import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, Users, Activity, TrendingUp, Shield, Clock, Target } from 'lucide-react';
import { useEscalationLevels } from '@/hooks/useEscalationLevels';
import { useEscalationAssignments } from '@/hooks/useEscalationAssignments';
import { useEscalationTriggers } from '@/hooks/useEscalationTriggers';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useProjects } from '@/hooks/useProjects';

interface ProjectEscalationData {
  id: string;
  name: string;
  status: string;
  escalationSetup: boolean;
  escalationCount: number;
  healthScore: number;
  lastEscalation?: string;
}

const WorkspaceEscalationOverview: React.FC = () => {
  const { levels } = useEscalationLevels();
  const { assignments } = useEscalationAssignments();
  const { triggers } = useEscalationTriggers();
  const { stakeholders } = useStakeholders();
  const { projects = [] } = useProjects();

  // Generate mock escalation data for projects
  const generateProjectEscalationData = (): ProjectEscalationData[] => {
    return projects.map(project => {
      const hasEscalationSetup = Math.random() > 0.3; // 70% have setup
      const escalationCount = hasEscalationSetup ? Math.floor(Math.random() * 10) : 0;
      const healthScore = hasEscalationSetup 
        ? Math.max(20, 100 - (escalationCount * 8)) // More escalations = lower health
        : Math.floor(Math.random() * 60) + 40; // Random health for non-setup projects
      
      return {
        id: project.id,
        name: project.name,
        status: project.status || 'active',
        escalationSetup: hasEscalationSetup,
        escalationCount,
        healthScore,
        lastEscalation: escalationCount > 0 ? 
          new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString() : 
          undefined
      };
    });
  };

  const projectData = generateProjectEscalationData();

  const stats = {
    totalLevels: levels.length,
    totalAssignments: assignments.length,
    totalTriggers: triggers.length,
    assignedTriggers: [...new Set(assignments.map(a => a.trigger_id))].length,
    assignedStakeholders: [...new Set(assignments.map(a => a.stakeholder_id))].length,
    projectsWithSetup: projectData.filter(p => p.escalationSetup).length,
    totalProjects: projects.length,
    avgHealthScore: projectData.reduce((sum, p) => sum + p.healthScore, 0) / projectData.length || 0
  };

  const coveragePercentage = stats.totalTriggers > 0 
    ? (stats.assignedTriggers / stats.totalTriggers) * 100 
    : 0;

  const setupPercentage = stats.totalProjects > 0
    ? (stats.projectsWithSetup / stats.totalProjects) * 100
    : 0;

  // Chart data for project escalations
  const chartData = projectData
    .filter(p => p.escalationSetup)
    .sort((a, b) => b.escalationCount - a.escalationCount)
    .slice(0, 8)
    .map(p => ({
      name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
      escalations: p.escalationCount,
      health: p.healthScore
    }));

  // Health distribution data
  const healthDistribution = [
    { name: 'Healthy (80-100%)', value: projectData.filter(p => p.healthScore >= 80).length, color: '#22c55e' },
    { name: 'Warning (60-79%)', value: projectData.filter(p => p.healthScore >= 60 && p.healthScore < 80).length, color: '#f59e0b' },
    { name: 'Critical (<60%)', value: projectData.filter(p => p.healthScore < 60).length, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workspace Escalation Overview</h2>
          <p className="text-muted-foreground">
            Comprehensive view of escalation management across all projects
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {stats.totalProjects} Projects
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Setup Coverage</span>
            </div>
            <div className="text-2xl font-bold">{Math.round(setupPercentage)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.projectsWithSetup} of {stats.totalProjects} projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Avg Health Score</span>
            </div>
            <div className="text-2xl font-bold">{Math.round(stats.avgHealthScore)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Active Escalations</span>
            </div>
            <div className="text-2xl font-bold">
              {projectData.reduce((sum, p) => sum + p.escalationCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Stakeholders</span>
            </div>
            <div className="text-2xl font-bold">{stats.assignedStakeholders}</div>
            <p className="text-xs text-muted-foreground">
              Involved in escalations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Escalation Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Project Escalation Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="escalations" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No escalation data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Project Health Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {healthDistribution.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={healthDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {healthDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No health data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Status Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Project Escalation Status</CardTitle>
          <p className="text-sm text-muted-foreground">
            Overview of escalation setup and activity across all projects
          </p>
        </CardHeader>
        <CardContent>
          {projectData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No projects found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectData.map((project) => (
                <div 
                  key={project.id} 
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{project.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{project.status}</p>
                    </div>
                    <Badge 
                      variant={project.escalationSetup ? "default" : "outline"}
                      className="text-xs"
                    >
                      {project.escalationSetup ? "Setup" : "No Setup"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Health Score</span>
                      <span className={
                        project.healthScore >= 80 ? "text-green-600" :
                        project.healthScore >= 60 ? "text-yellow-600" : "text-red-600"
                      }>
                        {project.healthScore}%
                      </span>
                    </div>
                    <Progress value={project.healthScore} className="h-2" />
                    
                    {project.escalationSetup && (
                      <div className="flex justify-between text-xs">
                        <span>Escalations</span>
                        <span className="font-medium">{project.escalationCount}</span>
                      </div>
                    )}
                    
                    {project.lastEscalation && (
                      <div className="flex justify-between text-xs">
                        <span>Last Escalation</span>
                        <span>{project.lastEscalation}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.totalLevels}</div>
              <p className="text-sm text-muted-foreground">Escalation Levels</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalTriggers}</div>
              <p className="text-sm text-muted-foreground">Trigger Conditions</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{Math.round(coveragePercentage)}%</div>
              <p className="text-sm text-muted-foreground">Trigger Coverage</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkspaceEscalationOverview;
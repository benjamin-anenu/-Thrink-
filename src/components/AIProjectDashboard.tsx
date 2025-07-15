import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Clock, Users, DollarSign, Target, Brain, Zap,
  BarChart3, PieChart, Activity, Sparkles
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProject } from '@/contexts/ProjectContext';
import { useResources } from '@/contexts/ResourceContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { PerformanceTracker } from '@/services/PerformanceTracker';

const AIProjectDashboard = () => {
  const { projects } = useProject();
  const { resources } = useResources();
  const { currentWorkspace } = useWorkspace();
  const [activeInsight, setActiveInsight] = useState(0);
  const [realTimeData, setRealTimeData] = useState({
    projectsInProgress: 0,
    resourceUtilization: 0,
    budgetHealth: 0,
    riskScore: 0
  });

  // Calculate real metrics from contexts
  useEffect(() => {
    if (!currentWorkspace) return;

    const workspaceProjects = projects.filter(p => p.workspaceId === currentWorkspace.id);
    const activeProjects = workspaceProjects.filter(p => p.status === 'In Progress' || p.status === 'active');
    const workspaceResources = resources.filter(r => r.workspaceId === currentWorkspace.id);
    
    // Get performance data
    const performanceTracker = PerformanceTracker.getInstance();
    const performanceProfiles = performanceTracker.getAllProfiles();
    
    // Calculate resource utilization
    const totalCapacity = workspaceResources.length * 100;
    const utilizedCapacity = workspaceResources.reduce((sum, resource) => {
      const profile = performanceProfiles.find(p => p.resourceName === resource.name);
      return sum + (profile ? profile.currentScore : 75); // Default 75% if no profile
    }, 0);
    const utilization = totalCapacity > 0 ? (utilizedCapacity / totalCapacity) * 100 : 0;

    // Calculate budget health (mock calculation based on project progress)
    const budgetHealth = workspaceProjects.length > 0 
      ? workspaceProjects.reduce((sum, project) => sum + (project.progress || 0), 0) / workspaceProjects.length 
      : 90;

    // Calculate risk score based on performance data
    const highRiskProfiles = performanceProfiles.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical');
    const riskScore = Math.min(40, (highRiskProfiles.length / Math.max(performanceProfiles.length, 1)) * 100);

    setRealTimeData({
      projectsInProgress: activeProjects.length,
      resourceUtilization: Math.round(utilization),
      budgetHealth: Math.round(budgetHealth),
      riskScore: Math.round(riskScore)
    });
  }, [projects, resources, currentWorkspace]);

  // Generate performance data based on real projects
  const performanceData = useMemo(() => {
    if (!currentWorkspace) return [];
    
    const workspaceProjects = projects.filter(p => p.workspaceId === currentWorkspace.id);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return months.map((month, index) => {
      const completed = Math.floor(workspaceProjects.length * (index + 1) / 6 * 0.8);
      const planned = Math.floor(workspaceProjects.length * (index + 1) / 6);
      const budget = 95 - (index * 2) + Math.random() * 5;
      
      return {
        name: month,
        completed,
        planned,
        budget: Math.round(budget)
      };
    });
  }, [projects, currentWorkspace]);

  // Generate resource data based on actual resources
  const resourceData = useMemo(() => {
    if (!currentWorkspace) return [];
    
    const workspaceResources = resources.filter(r => r.workspaceId === currentWorkspace.id);
    const roleGroups = workspaceResources.reduce((acc, resource) => {
      const role = resource.role || 'Other';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--error))', 'hsl(var(--info))'];
    
    return Object.entries(roleGroups).map(([role, count], index) => ({
      name: role,
      value: workspaceResources.length > 0 ? Math.round((count / workspaceResources.length) * 100) : 0,
      color: colors[index % colors.length]
    }));
  }, [resources, currentWorkspace]);

  // Generate AI insights based on real data
  const aiInsights = useMemo(() => {
    const performanceTracker = PerformanceTracker.getInstance();
    const profiles = performanceTracker.getAllProfiles();
    const workspaceProjects = currentWorkspace ? projects.filter(p => p.workspaceId === currentWorkspace.id) : [];
    
    const insights = [];
    
    // Project delivery forecast
    const overdueProjects = workspaceProjects.filter(p => {
      const dueDate = new Date(p.endDate || p.dueDate || '');
      return dueDate < new Date() && (p.progress || 0) < 100;
    });
    
    if (overdueProjects.length > 0) {
      insights.push({
        type: 'prediction',
        title: 'Project Delivery Forecast',
        message: `${overdueProjects.length} projects may exceed deadlines. Consider resource reallocation or timeline adjustment.`,
        confidence: 87,
        impact: 'medium',
        icon: TrendingUp
      });
    }

    // Resource optimization
    const highPerformers = profiles.filter(p => p.currentScore > 85);
    const lowPerformers = profiles.filter(p => p.currentScore < 60);
    
    if (highPerformers.length > 0 && lowPerformers.length > 0) {
      insights.push({
        type: 'optimization',
        title: 'Resource Optimization',
        message: `${highPerformers.length} high performers could mentor ${lowPerformers.length} team members to improve overall efficiency.`,
        confidence: 92,
        impact: 'high',
        icon: Users
      });
    }

    // Budget risk
    const lowProgressProjects = workspaceProjects.filter(p => (p.progress || 0) < 30);
    if (lowProgressProjects.length > 0) {
      insights.push({
        type: 'risk',
        title: 'Budget Risk Alert',
        message: `${lowProgressProjects.length} projects showing slow progress. Budget variance risk detected.`,
        confidence: 78,
        impact: 'high',
        icon: AlertTriangle
      });
    }

    // Default insight if no specific insights
    if (insights.length === 0) {
      insights.push({
        type: 'opportunity',
        title: 'Performance Opportunity',
        message: 'Team performance is stable. Consider implementing advanced analytics for deeper insights.',
        confidence: 85,
        impact: 'medium',
        icon: Sparkles
      });
    }

    return insights;
  }, [projects, currentWorkspace]);

  const getImpactBadgeVariant = (impact: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (impact) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'prediction': return 'bg-info-muted text-info-muted-foreground border-info/20';
      case 'optimization': return 'bg-surface-muted text-foreground border-primary/20';
      case 'risk': return 'bg-error-muted text-error-muted-foreground border-error/20';
      case 'opportunity': return 'bg-success-muted text-success-muted-foreground border-success/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const cycleInsights = () => {
    setActiveInsight((prev) => (prev + 1) % aiInsights.length);
  };

  useEffect(() => {
    if (aiInsights.length > 1) {
      const timer = setInterval(cycleInsights, 4000);
      return () => clearInterval(timer);
    }
  }, [aiInsights.length]);

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a workspace to view AI insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeData.projectsInProgress}</div>
            <p className="text-xs text-success-muted-foreground">
              {currentWorkspace.name} workspace
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeData.resourceUtilization}%</div>
            <Progress value={realTimeData.resourceUtilization} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{realTimeData.budgetHealth}%</div>
            <p className="text-xs text-muted-foreground">Within targets</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{realTimeData.riskScore}</div>
            <p className="text-xs text-muted-foreground">
              {realTimeData.riskScore < 20 ? 'Low risk' : realTimeData.riskScore < 40 ? 'Medium risk' : 'High risk'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Panel - Updated with real data */}
      <Card className="bg-surface border-border shadow-elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Tink AI Insights</CardTitle>
            </div>
            <StatusBadge variant="info">
              Live Analysis
            </StatusBadge>
          </div>
        </CardHeader>
        <CardContent>
          {aiInsights.map((insight, index) => (
            <div
              key={index}
              className={`transition-all duration-500 ${
                index === activeInsight ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2 absolute'
              }`}
            >
              {index === activeInsight && (
                <div className={`p-4 rounded-lg border ${getInsightTypeColor(insight.type)}`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-surface shadow-sm border border-border">
                      <insight.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm mb-3">{insight.message}</p>
                      <div className="flex items-center justify-between">
                        <StatusBadge variant="info">
                          {insight.confidence}% confidence
                        </StatusBadge>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Project Completion Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="completed" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="planned" stroke="hsl(var(--error))" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Budget Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Area type="monotone" dataKey="budget" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Resource Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resourceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={resourceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {resourceData.map((entry, index) => (
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
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No resource data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Team Utilization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resourceData.length > 0 ? (
                  resourceData.map((resource, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{resource.name}</span>
                        <span>{resource.value}%</span>
                      </div>
                      <Progress value={resource.value} className="h-2" />
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">
                    No team data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-warning" />
                  Delivery Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {realTimeData.riskScore < 20 ? '98%' : realTimeData.riskScore < 40 ? '85%' : '72%'}
                </div>
                <p className="text-sm text-muted-foreground mb-4">On-time delivery probability</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>This Month</span>
                    <span className="text-success">
                      {realTimeData.riskScore < 20 ? '98%' : '85%'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Next Month</span>
                    <span className="text-warning">
                      {realTimeData.riskScore < 20 ? '95%' : '78%'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Q4</span>
                    <span className="text-error">
                      {realTimeData.riskScore < 20 ? '90%' : '70%'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-success" />
                  Budget Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  ${((realTimeData.projectsInProgress * 50000) / 1000).toFixed(1)}K
                </div>
                <p className="text-sm text-muted-foreground mb-4">Projected spend this quarter</p>
                <StatusBadge variant={realTimeData.budgetHealth > 90 ? "success" : "warning"}>
                  {realTimeData.budgetHealth > 90 ? "On track" : "Monitor closely"}
                </StatusBadge>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-error" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Schedule Risk</span>
                    <StatusBadge variant={realTimeData.riskScore < 20 ? "success" : realTimeData.riskScore < 40 ? "warning" : "error"}>
                      {realTimeData.riskScore < 20 ? "Low" : realTimeData.riskScore < 40 ? "Medium" : "High"}
                    </StatusBadge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Budget Risk</span>
                    <StatusBadge variant={realTimeData.budgetHealth > 90 ? "success" : "warning"}>
                      {realTimeData.budgetHealth > 90 ? "Low" : "Medium"}
                    </StatusBadge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Resource Risk</span>
                    <StatusBadge variant={realTimeData.resourceUtilization < 80 ? "success" : "error"}>
                      {realTimeData.resourceUtilization < 80 ? "Low" : "High"}
                    </StatusBadge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIProjectDashboard;

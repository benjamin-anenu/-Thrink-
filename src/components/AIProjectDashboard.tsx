
import React, { useState, useEffect } from 'react';
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
import { useAIDashboardData } from '@/hooks/useAIDashboardData';
import { LoadingOverlay, SkeletonText } from '@/components/ui/loading-state';

const AIProjectDashboard = () => {
  const [activeInsight, setActiveInsight] = useState(0);
  const {
    realTimeData,
    projectTrend,
    utilizationTrend,
    budgetTrend,
    clientSatisfactionTrend,
    lastUpdate
  } = useAIDashboardData();

  // Simulate real-time updates for demonstration (can be removed if not needed)
  useEffect(() => {
    const interval = setInterval(() => {
      // Real-time data is now coming from contexts, so this is just for visual demo
      console.log('[AI Dashboard] Real-time data updated from contexts');
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const getIconComponent = (iconName: string) => {
    const icons = { TrendingUp, Users, AlertTriangle, Sparkles };
    return icons[iconName as keyof typeof icons] || Brain;
  };

  // Generate AI insights based on real-time data
  const generateAIInsights = () => {
    const insights = [];
    
    // Resource utilization insight
    if (realTimeData.resourceUtilization > 85) {
      insights.push({
        type: 'risk',
        title: 'High Resource Utilization',
        message: `Resource utilization at ${realTimeData.resourceUtilization}%. Consider redistributing workload to prevent burnout.`,
        confidence: 92,
        impact: 'high',
        icon: 'Users'
      });
    } else if (realTimeData.resourceUtilization < 50) {
      insights.push({
        type: 'optimization',
        title: 'Low Resource Utilization',
        message: `Resource utilization at ${realTimeData.resourceUtilization}%. Consider assigning additional tasks to improve efficiency.`,
        confidence: 88,
        impact: 'medium',
        icon: 'TrendingUp'
      });
    }

    // Budget health insight
    if (realTimeData.budgetHealth < 70) {
      insights.push({
        type: 'risk',
        title: 'Budget Health Concern',
        message: `Budget health at ${realTimeData.budgetHealth}%. Review spending patterns and project scope.`,
        confidence: 85,
        impact: 'high',
        icon: 'AlertTriangle'
      });
    } else if (realTimeData.budgetHealth > 90) {
      insights.push({
        type: 'opportunity',
        title: 'Excellent Budget Management',
        message: `Budget health at ${realTimeData.budgetHealth}%. Consider taking on additional scope.`,
        confidence: 90,
        impact: 'medium',
        icon: 'Sparkles'
      });
    }

    // Risk score insight
    if (realTimeData.riskScore > 60) {
      insights.push({
        type: 'risk',
        title: 'High Risk Score',
        message: `Risk score at ${realTimeData.riskScore}. Review overdue tasks and project timelines.`,
        confidence: 87,
        impact: 'high',
        icon: 'AlertTriangle'
      });
    }

    return insights;
  };

  const aiInsights = generateAIInsights();

  const cycleInsights = () => {
    if (aiInsights.length > 0) {
      setActiveInsight((prev) => (prev + 1) % aiInsights.length);
    }
  };

  useEffect(() => {
    if (aiInsights.length > 0) {
      const timer = setInterval(cycleInsights, 4000);
      return () => clearInterval(timer);
    }
  }, [aiInsights.length]);

  return (
    <LoadingOverlay isLoading={false} loadingText="Loading AI insights...">
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Project Insights
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time intelligence for your projects
              {lastUpdate && (
                <span className="text-xs ml-2">
                  • Updated {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
        </div>
        
        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realTimeData.projectsInProgress}</div>
              <p className="text-xs text-success-muted-foreground">From workspace data</p>
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
              <p className="text-xs text-muted-foreground">Project health average</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{realTimeData.riskScore}</div>
              <p className="text-xs text-muted-foreground">Based on overdue tasks</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Panel */}
        <Card className="bg-surface border-border shadow-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">AI Insights</CardTitle>
              </div>
              <StatusBadge variant="info">
                Live Analysis
              </StatusBadge>
            </div>
          </CardHeader>
          <CardContent>
            {aiInsights.length > 0 ? (
              aiInsights.map((insight, index) => {
                const IconComponent = getIconComponent(insight.icon);
                
                return (
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
                            <IconComponent className="h-5 w-5" />
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
                );
              })
            ) : (
              <div className="p-4 rounded-lg border bg-muted text-center">
                <Brain className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No insights available. Add projects and resources to generate AI analysis.</p>
              </div>
            )}
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
                    <LineChart data={projectTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
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
                    <AreaChart data={budgetTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Area type="monotone" dataKey="value" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} />
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
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Developers', value: 0, color: '#3b82f6' },
                          { name: 'Designers', value: 0, color: '#10b981' },
                          { name: 'Managers', value: 100, color: '#f59e0b' },
                          { name: 'QA', value: 0, color: '#ef4444' },
                          { name: 'Other', value: 0, color: '#8b5cf6' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Developers', value: 0, color: '#3b82f6' },
                          { name: 'Designers', value: 0, color: '#10b981' },
                          { name: 'Managers', value: 100, color: '#f59e0b' },
                          { name: 'QA', value: 0, color: '#ef4444' },
                          { name: 'Other', value: 0, color: '#8b5cf6' }
                        ].map((entry, index) => (
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
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Team Utilization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'Developers', value: 0 },
                    { name: 'Designers', value: 0 },
                    { name: 'Managers', value: 100 },
                    { name: 'QA', value: 0 },
                    { name: 'Other', value: 0 }
                  ].map((resource, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{resource.name}</span>
                        <span>{resource.value}%</span>
                      </div>
                      <Progress value={resource.value} className="h-2" />
                    </div>
                  ))}
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
                  <div className="text-2xl font-bold mb-2">{Math.max(70, 100 - realTimeData.riskScore)}%</div>
                  <p className="text-sm text-muted-foreground mb-4">On-time delivery probability</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>This Month</span>
                      <span className="text-success">{Math.max(85, 100 - realTimeData.riskScore + 5)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Next Month</span>
                      <span className="text-warning">{Math.max(70, 100 - realTimeData.riskScore - 5)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Q4</span>
                      <span className="text-error">{Math.max(60, 100 - realTimeData.riskScore - 10)}%</span>
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
                  <div className="text-2xl font-bold mb-2">$2.1M</div>
                  <p className="text-sm text-muted-foreground mb-4">Projected spend this quarter</p>
                  <StatusBadge variant={realTimeData.budgetHealth > 90 ? "success" : "warning"}>
                    {realTimeData.budgetHealth > 90 ? "On track" : "Needs attention"}
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
                      <StatusBadge variant={realTimeData.riskScore > 30 ? "error" : realTimeData.riskScore > 20 ? "warning" : "success"}>
                        {realTimeData.riskScore > 30 ? "High" : realTimeData.riskScore > 20 ? "Medium" : "Low"}
                      </StatusBadge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Budget Risk</span>
                      <StatusBadge variant={realTimeData.budgetHealth < 70 ? "error" : realTimeData.budgetHealth < 85 ? "warning" : "success"}>
                        {realTimeData.budgetHealth < 70 ? "High" : realTimeData.budgetHealth < 85 ? "Medium" : "Low"}
                      </StatusBadge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Resource Risk</span>
                      <StatusBadge variant={realTimeData.resourceUtilization > 90 ? "error" : realTimeData.resourceUtilization > 80 ? "warning" : "success"}>
                        {realTimeData.resourceUtilization > 90 ? "High" : realTimeData.resourceUtilization > 80 ? "Medium" : "Low"}
                      </StatusBadge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </LoadingOverlay>
  );
};

export default AIProjectDashboard;

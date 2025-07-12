import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Clock, Users, DollarSign, Target, Brain, Zap,
  BarChart3, PieChart, Activity, Sparkles
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AIProjectDashboard = () => {
  const [activeInsight, setActiveInsight] = useState(0);
  const [realTimeData, setRealTimeData] = useState({
    projectsInProgress: 12,
    resourceUtilization: 78,
    budgetHealth: 92,
    riskScore: 23
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        resourceUtilization: Math.max(60, Math.min(95, prev.resourceUtilization + (Math.random() - 0.5) * 4)),
        budgetHealth: Math.max(80, Math.min(100, prev.budgetHealth + (Math.random() - 0.5) * 2)),
        riskScore: Math.max(10, Math.min(40, prev.riskScore + (Math.random() - 0.5) * 3))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const performanceData = [
    { name: 'Jan', completed: 8, planned: 10, budget: 95 },
    { name: 'Feb', completed: 12, planned: 14, budget: 88 },
    { name: 'Mar', completed: 15, planned: 16, budget: 92 },
    { name: 'Apr', completed: 18, planned: 20, budget: 85 },
    { name: 'May', completed: 22, planned: 24, budget: 90 },
    { name: 'Jun', completed: 25, planned: 26, budget: 93 }
  ];

  const resourceData = [
    { name: 'Developers', value: 35, color: '#3b82f6' },
    { name: 'Designers', value: 15, color: '#10b981' },
    { name: 'Managers', value: 20, color: '#f59e0b' },
    { name: 'QA', value: 12, color: '#ef4444' },
    { name: 'DevOps', value: 18, color: '#8b5cf6' }
  ];

  const aiInsights = [
    {
      type: 'prediction',
      title: 'Project Delivery Forecast',
      message: 'Based on current velocity, 3 projects may exceed deadlines by 5-7 days. Consider resource reallocation.',
      confidence: 87,
      impact: 'medium',
      icon: TrendingUp
    },
    {
      type: 'optimization',
      title: 'Resource Optimization',
      message: 'Moving 2 developers from Project Alpha to Project Beta could improve overall delivery by 12%.',
      confidence: 92,
      impact: 'high',
      icon: Users
    },
    {
      type: 'risk',
      title: 'Budget Risk Alert',
      message: 'E-commerce Platform project showing 15% budget variance. Review required.',
      confidence: 78,
      impact: 'high',
      icon: AlertTriangle
    },
    {
      type: 'opportunity',
      title: 'Efficiency Opportunity',
      message: 'Implementing automated testing could reduce QA time by 30% across all projects.',
      confidence: 85,
      impact: 'medium',
      icon: Sparkles
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const cycleInsights = () => {
    setActiveInsight((prev) => (prev + 1) % aiInsights.length);
  };

  useEffect(() => {
    const timer = setInterval(cycleInsights, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeData.projectsInProgress}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(realTimeData.resourceUtilization)}%</div>
            <Progress value={realTimeData.resourceUtilization} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{Math.round(realTimeData.budgetHealth)}%</div>
            <p className="text-xs text-muted-foreground">Within targets</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{Math.round(realTimeData.riskScore)}</div>
            <p className="text-xs text-muted-foreground">Low risk range</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Panel */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">AI Insights</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Live Analysis
            </Badge>
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
                <div className={`p-4 rounded-lg border ${getImpactColor(insight.impact)}`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <insight.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm mb-3">{insight.message}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence}% confidence
                        </Badge>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Project Completion Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="planned" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Budget Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="budget" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
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
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Utilization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resourceData.map((resource, index) => (
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Delivery Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">95%</div>
                <p className="text-sm text-muted-foreground mb-4">On-time delivery probability</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>This Month</span>
                    <span className="text-green-600">98%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Next Month</span>
                    <span className="text-yellow-600">92%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Q4</span>
                    <span className="text-red-600">87%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Budget Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">$2.1M</div>
                <p className="text-sm text-muted-foreground mb-4">Projected spend this quarter</p>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  8% under budget
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Schedule Risk</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Medium</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Budget Risk</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Low</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Resource Risk</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-700">High</Badge>
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

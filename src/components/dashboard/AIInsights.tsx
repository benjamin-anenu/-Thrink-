
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, AlertTriangle, Sparkles, Target } from 'lucide-react';
import { useAIDashboardData } from '@/hooks/useAIDashboardData';

const AIInsights = () => {
  const { realTimeData, clientSatisfactionTrend } = useAIDashboardData();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return TrendingUp;
      case 'optimization': return Users;
      case 'risk': return AlertTriangle;
      case 'opportunity': return Sparkles;
      default: return Target;
    }
  };

  const getInsightVariant = (impact: string): 'destructive' | 'secondary' | 'outline' | 'default' => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
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

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aiInsights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No insights available. Add more project data to get AI recommendations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {aiInsights.slice(0, 4).map((insight, index) => {
                const IconComponent = getInsightIcon(insight.type);
                return (
                  <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="flex-shrink-0">
                      <IconComponent className="h-5 w-5 text-primary mt-0.5" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{insight.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={getInsightVariant(insight.impact)} className="text-xs">
                            {insight.impact}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {insight.confidence}% confidence
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Satisfaction Trend */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Client Satisfaction Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={clientSatisfactionTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-muted-foreground"
                  fontSize={12}
                />
                <YAxis 
                  className="text-muted-foreground"
                  fontSize={12}
                  domain={[0, 5]}
                  tickFormatter={(value) => `${value}/5`}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--success))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-success">
                {clientSatisfactionTrend.length > 0 
                  ? (clientSatisfactionTrend.reduce((sum, t) => sum + t.score, 0) / clientSatisfactionTrend.length).toFixed(1)
                  : '4.5'
                }
              </div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-info">
                {clientSatisfactionTrend.reduce((sum, t) => sum + (t.responses || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Responses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {clientSatisfactionTrend.length > 1 && clientSatisfactionTrend[clientSatisfactionTrend.length - 1].score > clientSatisfactionTrend[clientSatisfactionTrend.length - 2].score ? '↗' : '→'}
              </div>
              <div className="text-sm text-muted-foreground">Trend</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-info">{realTimeData.projectsInProgress}</div>
              <div className="text-sm text-muted-foreground">Active Projects</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-success">{realTimeData.resourceUtilization}%</div>
              <div className="text-sm text-muted-foreground">Resource Utilization</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{realTimeData.budgetHealth}%</div>
              <div className="text-sm text-muted-foreground">Budget Health</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-warning">{realTimeData.riskScore}%</div>
              <div className="text-sm text-muted-foreground">Risk Score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsights;

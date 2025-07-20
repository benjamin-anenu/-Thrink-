
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, AlertTriangle, Sparkles, Target } from 'lucide-react';
import { useAIDashboardData } from '@/hooks/useAIDashboardData';
import AIConfigStatus from '@/components/AIConfigStatus';

const AIInsights = () => {
  const { aiInsights, clientSatisfactionTrend, realTimeData } = useAIDashboardData();

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

  return (
    <div className="space-y-6">
      {/* Coming Soon Banner */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">Real AI Integration Coming Soon!</h3>
                <p className="text-sm text-muted-foreground">
                  Connect OpenAI or Claude for advanced AI-powered insights and recommendations.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
              Coming Soon
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* AI Configuration Status */}
      <AIConfigStatus showDetails={false} />

      {/* AI Insights */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Insights (Simulated)
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

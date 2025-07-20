import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Users, 
  Target, Zap, Brain, BarChart3, PieChart, Activity, RefreshCw,
  Download, Filter, Calendar, ArrowUp, ArrowDown, Minus, 
  Star, Award, AlertCircle, Lightbulb
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useAdvancedAnalytics from '@/hooks/useAdvancedAnalytics';
import { PredictiveInsight, RiskIndicator, ResourceEfficiency } from '@/services/AdvancedAnalyticsEngine';

const AdvancedAnalyticsDashboard = () => {
  const {
    analytics,
    isLoading,
    error,
    lastUpdate,
    getPerformanceSummary,
    getTrendAnalysis,
    getHighPriorityInsights,
    getCriticalRisks,
    getTopPerformers,
    getUnderPerformers,
    refreshAnalytics,
    exportAnalyticsData,
    hasData,
    projectCount,
    resourceCount,
    insightCount,
    riskCount
  } = useAdvancedAnalytics();

  const [activeSection, setActiveSection] = useState('overview');
  const performanceSummary = getPerformanceSummary();
  const trendAnalysis = getTrendAnalysis();
  const highPriorityInsights = getHighPriorityInsights();
  const criticalRisks = getCriticalRisks();
  const topPerformers = getTopPerformers();
  const underPerformers = getUnderPerformers();

  // Helper functions
  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing': return <ArrowUp className="h-4 w-4 text-success" />;
      case 'decreasing': return <ArrowDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: 'outline',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive'
    };
    return <Badge variant={variants[severity as keyof typeof variants] || 'outline'}>{severity}</Badge>;
  };

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'forecast': return <TrendingUp className="h-4 w-4 text-info" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-warning" />;
      case 'alert': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'opportunity': return <Star className="h-4 w-4 text-success" />;
      default: return <Brain className="h-4 w-4 text-primary" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-lg">Generating Advanced Analytics...</span>
          </div>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mx-auto max-w-2xl">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Analytics Generation Error</p>
            <p>{error}</p>
            <Button onClick={refreshAnalytics} size="sm" className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasData) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <BarChart3 className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">No Analytics Data Available</h3>
          <p className="text-muted-foreground">Add projects and resources to generate comprehensive analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Advanced Analytics
          </h2>
          <p className="text-muted-foreground">
            Comprehensive insights powered by local intelligence
            {lastUpdate && (
              <span className="text-xs ml-2">
                • Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {projectCount} Projects • {resourceCount} Resources
          </Badge>
          <Button variant="outline" size="sm" onClick={refreshAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const data = exportAnalyticsData();
            if (data) {
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `analytics-${Date.now()}.json`;
              a.click();
            }
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Performance Summary Cards */}
      {performanceSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Velocity Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Velocity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceSummary.velocity.current}</div>
              <div className="flex items-center gap-2 text-xs">
                {getTrendIcon(performanceSummary.velocity.trend)}
                <span className="text-muted-foreground">
                  avg {performanceSummary.velocity.average} tasks/week
                </span>
              </div>
              {performanceSummary.velocity.predictedCompletion && (
                <p className="text-xs text-muted-foreground mt-1">
                  Predicted completion: {new Date(performanceSummary.velocity.predictedCompletion).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quality Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceSummary.quality.score}%</div>
              <div className="flex items-center gap-2 text-xs">
                {getTrendIcon(performanceSummary.quality.trend)}
                <span className="text-muted-foreground">
                  {performanceSummary.quality.reworkRate}% rework rate
                </span>
              </div>
              <Progress value={performanceSummary.quality.score} className="h-1 mt-2" />
            </CardContent>
          </Card>

          {/* Team Efficiency Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Efficiency</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceSummary.team.averageEfficiency}%</div>
              <div className="text-xs text-muted-foreground">
                {performanceSummary.team.utilization}% capacity used
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs bg-green-50">
                  {performanceSummary.team.topPerformersCount} top
                </Badge>
                {performanceSummary.team.underPerformersCount > 0 && (
                  <Badge variant="outline" className="text-xs bg-orange-50">
                    {performanceSummary.team.underPerformersCount} need help
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Benchmarks Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Benchmarks</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {performanceSummary.benchmarks.vsIndustry > 0 ? '+' : ''}{performanceSummary.benchmarks.vsIndustry}%
              </div>
              <div className="text-xs text-muted-foreground">vs industry avg</div>
              {performanceSummary.benchmarks.improvementPotential > 0 && (
                <p className="text-xs text-warning mt-1">
                  {performanceSummary.benchmarks.improvementPotential}% improvement potential
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Analytics Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights" className="relative">
            Insights
            {insightCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {insightCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="risks" className="relative">
            Risks
            {riskCount > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {riskCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* High Priority Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Key Insights
                </CardTitle>
                <CardDescription>Most important findings from data analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {highPriorityInsights.length > 0 ? (
                  highPriorityInsights.slice(0, 3).map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      {getInsightTypeIcon(insight.type)}
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <p className="text-xs text-muted-foreground">{insight.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {insight.confidence}% confidence
                          </Badge>
                          <span className="text-xs text-muted-foreground">{insight.timeframe}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No high-priority insights available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Critical Risks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Critical Risks
                </CardTitle>
                <CardDescription>Risks requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {criticalRisks.length > 0 ? (
                  criticalRisks.slice(0, 3).map((risk, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{risk.description}</h4>
                          {getSeverityBadge(risk.severity)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Risk Score: {risk.riskScore}/100
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Affects: {risk.affectedProjects.length} project(s)
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50 text-success" />
                    <p className="text-sm">No critical risks detected</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Predictive Insights</CardTitle>
              <CardDescription>
                Data-driven recommendations and forecasts based on current patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics?.insights.map((insight, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightTypeIcon(insight.type)}
                      <h3 className="font-semibold">{insight.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'secondary' : 'outline'}>
                        {insight.impact} impact
                      </Badge>
                      <Badge variant="outline">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground">{insight.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Timeframe</h4>
                      <p className="text-sm text-muted-foreground">{insight.timeframe}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Data Source</h4>
                      <p className="text-sm text-muted-foreground">{insight.dataSource}</p>
                    </div>
                  </div>
                  
                  {insight.actionItems.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Recommended Actions</h4>
                      <ul className="space-y-1">
                        {insight.actionItems.map((action, actionIndex) => (
                          <li key={actionIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full"></div>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No insights generated yet. Add more project data to get recommendations.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>
                Identified risks with mitigation strategies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics?.activeRisks.map((risk, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 ${
                        risk.severity === 'critical' ? 'text-red-500' :
                        risk.severity === 'high' ? 'text-orange-500' :
                        risk.severity === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                      <h3 className="font-semibold">{risk.description}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(risk.severity)}
                      <Badge variant="outline">{risk.riskScore}/100</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span>
                      <span className="ml-2 capitalize">{risk.type}</span>
                    </div>
                    <div>
                      <span className="font-medium">Probability:</span>
                      <span className="ml-2">{risk.probability}%</span>
                    </div>
                    <div>
                      <span className="font-medium">Impact:</span>
                      <span className="ml-2">{risk.impact}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Mitigation Strategies</h4>
                    <ul className="space-y-1">
                      {risk.mitigation.map((strategy, strategyIndex) => (
                        <li key={strategyIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full"></div>
                          {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-success" />
                  <p>No active risks detected. Your projects are in good shape!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Performance Tab */}
        <TabsContent value="team" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-success" />
                  Top Performers
                </CardTitle>
                <CardDescription>Team members excelling in their roles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topPerformers.length > 0 ? (
                  topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-success/5 rounded-lg border border-success/20">
                      <div>
                        <h4 className="font-medium">{performer.resourceName}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Efficiency: {performer.efficiencyScore}%</p>
                          <p>Completion Rate: {performer.taskCompletionRate}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="bg-success/10 border-success/30">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No top performers identified yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Underperformers / Need Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-warning" />
                  Need Support
                </CardTitle>
                <CardDescription>Team members who could benefit from assistance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {underPerformers.length > 0 ? (
                  underPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20">
                      <div>
                        <h4 className="font-medium">{performer.resourceName}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Efficiency: {performer.efficiencyScore}%</p>
                          <p>Utilization: {performer.utilizationRate}%</p>
                        </div>
                        {performer.recommendations.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium">Suggestions:</p>
                            <p className="text-xs text-muted-foreground">
                              {performer.recommendations[0]}
                            </p>
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="bg-warning/10 border-warning/30">
                        Needs Help
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50 text-success" />
                    <p>All team members performing well!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {trendAnalysis && (
            <div className="space-y-6">
              {/* Velocity Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Velocity Trends</CardTitle>
                  <CardDescription>
                    Team velocity over time with trend analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendAnalysis.velocity.history}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          className="text-muted-foreground"
                          fontSize={12}
                          tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis 
                          className="text-muted-foreground"
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                          labelFormatter={(date) => new Date(date).toLocaleDateString()}
                          formatter={(value: any) => [`${value} tasks`, 'Completed']}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Trends</CardTitle>
                  <CardDescription>
                    Risk score evolution over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendAnalysis.risks.history}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          className="text-muted-foreground"
                          fontSize={12}
                          tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis 
                          className="text-muted-foreground"
                          fontSize={12}
                          domain={[0, 100]}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                          labelFormatter={(date) => new Date(date).toLocaleDateString()}
                          formatter={(value: any) => [`${value}/100`, 'Risk Score']}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--destructive))"
                          fill="hsl(var(--destructive))"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
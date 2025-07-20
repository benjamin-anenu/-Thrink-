import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Activity, 
  Target, Users, CheckCircle, ArrowUp, ArrowDown, Minus,
  Brain, Zap, Award, AlertCircle
} from 'lucide-react';
import useAdvancedAnalytics from '@/hooks/useAdvancedAnalytics';

const SmartAnalyticsWidgets = () => {
  const {
    isLoading,
    hasData,
    getPerformanceSummary,
    getHighPriorityInsights,
    getCriticalRisks,
    getTopPerformers
  } = useAdvancedAnalytics();

  const performanceSummary = getPerformanceSummary();
  const highPriorityInsights = getHighPriorityInsights();
  const criticalRisks = getCriticalRisks();
  const topPerformers = getTopPerformers();

  // Don't render anything if loading or no data
  if (isLoading || !hasData || !performanceSummary) {
    return null;
  }

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing': return <ArrowUp className="h-3 w-3 text-success" />;
      case 'decreasing': return <ArrowDown className="h-3 w-3 text-destructive" />;
      default: return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'forecast': return <TrendingUp className="h-4 w-4 text-info" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-warning" />;
      case 'alert': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'opportunity': return <Zap className="h-4 w-4 text-success" />;
      default: return <Brain className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Smart Performance Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Smart Performance Summary
          </CardTitle>
          <CardDescription>AI-powered insights from your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Velocity Insight */}
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-primary" />
                {getTrendIcon(performanceSummary.velocity.trend)}
              </div>
              <div className="text-2xl font-bold text-primary">
                {performanceSummary.velocity.current}
              </div>
              <p className="text-xs text-muted-foreground">
                Tasks/week • {performanceSummary.velocity.trend}
              </p>
            </div>

            {/* Quality Insight */}
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-success" />
                {getTrendIcon(performanceSummary.quality.trend)}
              </div>
              <div className="text-2xl font-bold text-success">
                {performanceSummary.quality.score}%
              </div>
              <p className="text-xs text-muted-foreground">
                Quality Score • {performanceSummary.quality.trend}
              </p>
            </div>

            {/* Team Insight */}
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-4 w-4 text-info" />
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-info">
                {performanceSummary.team.averageEfficiency}%
              </div>
              <p className="text-xs text-muted-foreground">
                Team Efficiency • {performanceSummary.team.utilization}% utilized
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Smart Alerts & Insights */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Smart Alerts
            </CardTitle>
            <CardDescription>Important insights requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Critical Risks */}
            {criticalRisks.length > 0 && (
              <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-sm text-destructive">Critical Risk Detected</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {criticalRisks[0].description}
                </p>
                <Badge variant="destructive" className="mt-2 text-xs">
                  {criticalRisks[0].severity.toUpperCase()}
                </Badge>
              </div>
            )}

            {/* High Priority Insights */}
            {highPriorityInsights.slice(0, 2).map((insight, index) => (
              <div key={index} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getInsightTypeIcon(insight.type)}
                  <span className="font-medium text-sm">{insight.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {insight.description.substring(0, 100)}...
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {insight.confidence}% confidence
                  </Badge>
                  <span className="text-xs text-muted-foreground">{insight.timeframe}</span>
                </div>
              </div>
            ))}

            {criticalRisks.length === 0 && highPriorityInsights.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50 text-success" />
                <p className="text-sm">All systems running smoothly!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Performance Spotlight */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4 text-success" />
              Team Spotlight
            </CardTitle>
            <CardDescription>Recognition and performance highlights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Top Performer */}
            {topPerformers.length > 0 && (
              <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-success" />
                    <span className="font-medium text-sm">Top Performer</span>
                  </div>
                  <Badge variant="outline" className="bg-success/10 border-success/30 text-xs">
                    #{1}
                  </Badge>
                </div>
                <p className="font-medium mt-2">{topPerformers[0].resourceName}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Efficiency: {topPerformers[0].efficiencyScore}%</span>
                  <span>Completion: {topPerformers[0].taskCompletionRate}%</span>
                </div>
                {topPerformers[0].strengths.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    💪 {topPerformers[0].strengths[0]}
                  </p>
                )}
              </div>
            )}

            {/* Performance Distribution */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Team Performance Distribution</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>High Performers ({performanceSummary.team.topPerformersCount})</span>
                  <span className="text-success">{((performanceSummary.team.topPerformersCount / Math.max(1, performanceSummary.team.topPerformersCount + performanceSummary.team.underPerformersCount)) * 100).toFixed(0)}%</span>
                </div>
                <Progress 
                  value={(performanceSummary.team.topPerformersCount / Math.max(1, performanceSummary.team.topPerformersCount + performanceSummary.team.underPerformersCount)) * 100} 
                  className="h-1"
                />
              </div>
              
              {performanceSummary.team.underPerformersCount > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span>{performanceSummary.team.underPerformersCount} team members could benefit from support</span>
                </div>
              )}
            </div>

            {/* Capacity Utilization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Capacity Utilization</span>
                <span className="font-medium">{performanceSummary.team.utilization}%</span>
              </div>
              <Progress value={performanceSummary.team.utilization} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {performanceSummary.team.utilization > 90 ? 'High utilization - consider load balancing' :
                 performanceSummary.team.utilization < 60 ? 'Capacity available for new projects' :
                 'Optimal utilization level'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benchmarking Insight */}
      {performanceSummary.benchmarks.vsIndustry !== 0 && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Performance Benchmarking
            </CardTitle>
            <CardDescription>How your team compares to industry standards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${performanceSummary.benchmarks.vsIndustry > 0 ? 'text-success' : 'text-warning'}`}>
                  {performanceSummary.benchmarks.vsIndustry > 0 ? '+' : ''}{performanceSummary.benchmarks.vsIndustry}%
                </div>
                <p className="text-xs text-muted-foreground">vs Industry Average</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-info">
                  {performanceSummary.team.averageEfficiency}%
                </div>
                <p className="text-xs text-muted-foreground">Your Team Average</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {performanceSummary.benchmarks.improvementPotential}%
                </div>
                <p className="text-xs text-muted-foreground">Improvement Potential</p>
              </div>
            </div>
            
            {performanceSummary.benchmarks.vsIndustry > 0 && (
              <div className="mt-4 p-3 bg-success/5 border border-success/20 rounded-lg">
                <p className="text-sm text-success-foreground">
                  🎉 Excellent! Your team is performing {performanceSummary.benchmarks.vsIndustry}% above industry average.
                </p>
              </div>
            )}
            
            {performanceSummary.benchmarks.improvementPotential > 10 && (
              <div className="mt-4 p-3 bg-info/5 border border-info/20 rounded-lg">
                <p className="text-sm text-info-foreground">
                  💡 There's {performanceSummary.benchmarks.improvementPotential}% improvement potential available through optimization.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartAnalyticsWidgets;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Clock, 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Users,
  BarChart3
} from 'lucide-react';
import { usePerformanceData } from '@/hooks/usePerformanceData';

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

const PerformanceMonitoringDashboard = () => {
  const { loading, performanceMetrics, profiles, reports } = usePerformanceData();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default:
        return <div className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Performance Monitoring
        </h2>
        <p className="text-muted-foreground">
          Real-time performance metrics and system health monitoring
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              {getStatusIcon(metric.status)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold">
                  {metric.name === 'Bottleneck Risk Score' 
                    ? `${metric.value.toFixed(1)}/10`
                    : `${Math.round(metric.value)}%`
                  }
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              <Progress 
                value={metric.name === 'Bottleneck Risk Score' 
                  ? (10 - metric.value) * 10  // Invert for risk score
                  : metric.value
                } 
                className="mb-2" 
              />
              <p className="text-xs text-muted-foreground">
                Target: {metric.name === 'Bottleneck Risk Score' 
                  ? `${metric.target}/10 or less`
                  : `${metric.target}%`
                }
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Resource Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profiles.slice(0, 6).map((profile, index) => (
                <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      profile.risk_level === 'critical' ? 'bg-red-500' :
                      profile.risk_level === 'high' ? 'bg-orange-500' :
                      profile.risk_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <div className="font-medium">{profile.resource_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Current Score: {Math.round(profile.current_score)}% • {profile.trend}
                      </div>
                    </div>
                  </div>
                  <Badge variant={
                    profile.risk_level === 'critical' ? 'destructive' :
                    profile.risk_level === 'high' ? 'destructive' :
                    profile.risk_level === 'medium' ? 'outline' : 'secondary'
                  }>
                    {profile.risk_level.charAt(0).toUpperCase() + profile.risk_level.slice(1)}
                  </Badge>
                </div>
              ))}
              {profiles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No performance profiles available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              AI Recommendation Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.slice(0, 5).map((report, index) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      report.overall_score > 80 ? 'bg-green-500' :
                      report.overall_score > 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="font-medium">{report.month} {report.year}</div>
                        <div className="text-sm text-muted-foreground">
                          Overall Score: {report.overall_score}%
                        </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">
                      {report.overall_score}%
                    </div>
                    <Badge variant={
                      report.overall_score > 80 ? 'secondary' :
                      report.overall_score > 60 ? 'outline' : 'destructive'
                    } className="text-xs">
                      {report.overall_score > 80 ? 'Excellent' :
                       report.overall_score > 60 ? 'Good' : 'Poor'}
                    </Badge>
                  </div>
                </div>
              ))}
              {reports.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No AI quality reports available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {profiles.filter(p => p.current_score > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Profiles</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {reports.length}
                </div>
                <div className="text-sm text-muted-foreground">Performance Reports</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {profiles.filter(p => p.trend === 'improving').length}
                </div>
                <div className="text-sm text-muted-foreground">Improving Resources</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitoringDashboard;

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { IssueMetrics } from '@/types/issue';

interface IssueMetricsCardsProps {
  metrics: IssueMetrics;
}

export const IssueMetricsCards = ({ metrics }: IssueMetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.total}</div>
          <div className="flex gap-1 mt-2">
            <Badge variant="destructive" className="text-xs">
              {metrics.open} Open
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {metrics.inProgress} In Progress
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
          <TrendingUp className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{metrics.bySeverity.critical}</div>
          <div className="flex gap-1 mt-2">
            <Badge className="text-xs bg-red-100 text-red-800 border-red-200">
              High: {metrics.bySeverity.high}
            </Badge>
            <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
              Med: {metrics.bySeverity.medium}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Issues</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{metrics.overdue}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Require immediate attention
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{metrics.resolved}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.total > 0 ? Math.round((metrics.resolved / metrics.total) * 100) : 0}% resolution rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
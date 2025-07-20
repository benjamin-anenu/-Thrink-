
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity } from 'lucide-react';
import { ReportsData } from '@/hooks/useReportsData';

interface ProjectReportsPerformanceProps {
  reportData: ReportsData;
}

const ProjectReportsPerformance: React.FC<ProjectReportsPerformanceProps> = ({ reportData }) => {
  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'text-red-800 bg-red-100';
      case 'medium': return 'text-yellow-800 bg-yellow-100';
      default: return 'text-green-800 bg-green-100';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Performance Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium">Task Completion</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completed Tasks</span>
                <span>{reportData.tasksCompleted}/{reportData.totalTasks}</span>
              </div>
              <Progress value={reportData.completionRate} />
              <p className="text-xs text-muted-foreground">
                {reportData.totalTasks - reportData.tasksCompleted} tasks remaining
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Next Milestone</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="truncate pr-2">{reportData.nextMilestone}</span>
                <span className="flex-shrink-0">
                  {reportData.daysToMilestone > 0 ? `${reportData.daysToMilestone} days` : 'Overdue'}
                </span>
              </div>
              <Progress value={Math.max(0, 100 - (reportData.daysToMilestone * 2))} />
              <p className="text-xs text-muted-foreground">
                {reportData.milestonesCompleted}/{reportData.totalMilestones} milestones completed
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Risk Assessment</h4>
            <div className="space-y-2">
              <Badge variant={getRiskBadgeVariant(reportData.riskLevel)} className={getRiskColor(reportData.riskLevel)}>
                {reportData.riskLevel} Risk
              </Badge>
              <p className="text-xs text-muted-foreground">
                {reportData.overdueItems === 0 ? 'No overdue items' : `${reportData.overdueItems} overdue items`}
              </p>
              {reportData.criticalTasks > 0 && (
                <p className="text-xs text-red-600">
                  {reportData.criticalTasks} critical tasks pending
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Performance Metrics */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{reportData.teamEfficiency}%</p>
              <p className="text-sm text-muted-foreground">Team Efficiency</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{reportData.averageTaskDuration}</p>
              <p className="text-sm text-muted-foreground">Avg Task Duration (days)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{reportData.budgetUsed}%</p>
              <p className="text-sm text-muted-foreground">Budget Used</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{reportData.overdueItems}</p>
              <p className="text-sm text-muted-foreground">Overdue Items</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectReportsPerformance;

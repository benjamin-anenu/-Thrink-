
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity } from 'lucide-react';

interface ReportData {
  overallProgress: number;
  tasksCompleted: number;
  totalTasks: number;
  budgetUsed: number;
  timeElapsed: number;
  teamEfficiency: number;
  riskLevel: string;
  nextMilestone: string;
  daysToMilestone: number;
}

interface ProjectReportsPerformanceProps {
  reportData: ReportData;
}

const ProjectReportsPerformance: React.FC<ProjectReportsPerformanceProps> = ({ reportData }) => {
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
              <Progress value={(reportData.tasksCompleted / reportData.totalTasks) * 100} />
              <p className="text-xs text-muted-foreground">
                {reportData.totalTasks - reportData.tasksCompleted} tasks remaining
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Next Milestone</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{reportData.nextMilestone}</span>
                <span>{reportData.daysToMilestone} days</span>
              </div>
              <Progress value={75} />
              <p className="text-xs text-muted-foreground">
                On track for completion
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Risk Assessment</h4>
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {reportData.riskLevel} Risk
              </Badge>
              <p className="text-xs text-muted-foreground">
                No critical issues identified
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectReportsPerformance;

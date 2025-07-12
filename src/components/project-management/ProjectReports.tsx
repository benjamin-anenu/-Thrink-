
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Clock, Users, Download, FileText, PieChart, Activity } from 'lucide-react';

interface ProjectReportsProps {
  projectId: string;
}

const ProjectReports: React.FC<ProjectReportsProps> = ({ projectId }) => {
  const reportData = {
    overallProgress: 75,
    tasksCompleted: 18,
    totalTasks: 24,
    budgetUsed: 65,
    timeElapsed: 60,
    teamEfficiency: 85,
    riskLevel: 'Low',
    nextMilestone: 'Beta Testing',
    daysToMilestone: 12
  };

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="font-semibold">{reportData.overallProgress}%</p>
                <Progress value={reportData.overallProgress} className="mt-1 h-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Time Progress</p>
                <p className="font-semibold">{reportData.timeElapsed}%</p>
                <Progress value={reportData.timeElapsed} className="mt-1 h-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Team Efficiency</p>
                <p className="font-semibold">{reportData.teamEfficiency}%</p>
                <Progress value={reportData.teamEfficiency} className="mt-1 h-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Budget Used</p>
                <p className="font-semibold">{reportData.budgetUsed}%</p>
                <Progress value={reportData.budgetUsed} className="mt-1 h-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
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

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Progress Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Progress chart would be displayed here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Resource Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Resource utilization chart would be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Project Summary PDF
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Detailed Analytics CSV
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Timeline Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-green-800">Project is on track</p>
                  <p className="text-sm text-green-700">
                    Current progress aligns well with timeline expectations. Team velocity is consistent.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-blue-800">Resource optimization opportunity</p>
                  <p className="text-sm text-blue-700">
                    Consider reallocating Michael Chen's hours to balance workload across the team.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-yellow-800">Milestone dependency alert</p>
                  <p className="text-sm text-yellow-700">
                    UI/UX Design phase completion is critical for next milestone. Monitor closely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectReports;

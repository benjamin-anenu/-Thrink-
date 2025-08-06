
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Clock, Users } from 'lucide-react';
import { ReportsData } from '@/hooks/useReportsData';

interface ProjectReportsKPIsProps {
  reportData: ReportsData;
}

const ProjectReportsKPIs: React.FC<ProjectReportsKPIsProps> = ({ reportData }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-500" />
            <div className="flex-1">
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
            <div className="flex-1">
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
            <div className="flex-1">
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
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Budget Used</p>
              <p className="font-semibold">{reportData.budgetUsed}%</p>
              <Progress value={reportData.budgetUsed} className="mt-1 h-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectReportsKPIs;

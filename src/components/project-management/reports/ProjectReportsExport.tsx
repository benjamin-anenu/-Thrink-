
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Table } from 'lucide-react';
import { ProjectTask, ProjectMilestone } from '@/types/project';

interface ProjectReportsExportProps {
  projectId: string;
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
}

const ProjectReportsExport: React.FC<ProjectReportsExportProps> = ({ projectId, tasks, milestones }) => {
  const handleExportPDF = () => {
    console.log('Exporting PDF for project:', projectId);
  };

  const handleExportCSV = () => {
    console.log('Exporting CSV for project:', projectId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={handleExportPDF} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export as PDF
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Export as CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectReportsExport;

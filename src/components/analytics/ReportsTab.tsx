
import React from 'react';
import ProjectSelector from '@/components/reports/ProjectSelector';
import RecipientSelector from '@/components/reports/RecipientSelector';
import ReportScheduler from '@/components/reports/ReportScheduler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealReportsData } from '@/hooks/useRealReportsData';
import { LoadingOverlay } from '@/components/ui/loading-state';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ReportsTabProps {
  selectedProject: string;
  onProjectChange: (project: string) => void;
  selectedRecipients: string[];
  onRecipientsChange: (recipients: string[]) => void;
  onScheduleReport?: (config: any) => void;
  onDownloadReport?: (type: string, dateRange: any) => void;
  onSendReport?: (type: string, dateRange: any) => void;
}

const ReportsTab: React.FC<ReportsTabProps> = ({
  selectedProject,
  onProjectChange,
  selectedRecipients,
  onRecipientsChange,
  onScheduleReport,
  onDownloadReport,
  onSendReport
}) => {
  const { 
    reports, 
    loading, 
    error, 
    generateReport, 
    downloadReport 
  } = useRealReportsData(selectedProject);

  const handleScheduleReport = async (config: any) => {
    try {
      const report = await generateReport({
        type: config.type || 'project-summary',
        frequency: config.frequency || 'weekly',
        recipients: selectedRecipients,
        sections: config.sections || ['summary', 'progress'],
        dateRange: config.dateRange || {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          to: new Date()
        }
      });

      if (report) {
        toast.success('Report generated successfully');
        if (onScheduleReport) onScheduleReport(config);
      }
    } catch (err) {
      toast.error('Failed to generate report');
    }
  };

  const handleDownloadReport = async (type: string, dateRange: any) => {
    if (reports.length === 0) {
      toast.error('No reports available to download');
      return;
    }

    const latestReport = reports[0];
    const success = await downloadReport(latestReport.id, 'pdf');
    
    if (success) {
      toast.success('Report downloaded successfully');
      if (onDownloadReport) onDownloadReport(type, dateRange);
    }
  };

  const handleSendReport = (type: string, dateRange: any) => {
    if (selectedRecipients.length === 0) {
      toast.error('Please select recipients first');
      return;
    }
    
    toast.success(`Report sent to ${selectedRecipients.length} recipients`);
    if (onSendReport) onSendReport(type, dateRange);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <LoadingOverlay isLoading={loading} loadingText="Loading reports data...">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <ProjectSelector 
            selectedProject={selectedProject}
            onProjectChange={onProjectChange}
          />
          <RecipientSelector
            selectedRecipients={selectedRecipients}
            onRecipientsChange={onRecipientsChange}
          />
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <ReportScheduler
            onScheduleReport={handleScheduleReport}
            onDownloadReport={handleDownloadReport}
            onSendReport={handleSendReport}
          />

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No reports generated yet. Create your first report above.
                </p>
              ) : (
                <div className="space-y-3">
                  {reports.slice(0, 5).map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{report.type}</p>
                        <p className="text-sm text-muted-foreground">
                          Generated on {report.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReport(report.id, 'pdf')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </LoadingOverlay>
  );
};

export default ReportsTab;

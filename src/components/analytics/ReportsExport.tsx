import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Mail, Calendar as CalendarIcon, Loader2, Edit, Trash2, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRealReportsData } from '@/hooks/useRealReportsData';
import { useScheduledReports } from '@/hooks/useScheduledReports';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { addDays, format } from 'date-fns';
import ScheduleReportModal from './ScheduleReportModal';
import { useEmailService } from '@/hooks/useEmailService';

const ReportsExport: React.FC = () => {
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const { generateReport, downloadReport } = useRealReportsData();
  const { 
    scheduledReports, 
    loading: scheduledLoading, 
    deleteScheduledReport, 
    toggleReportStatus 
  } = useScheduledReports();
  const { sendReportEmail, isSending } = useEmailService();

  const [exportFormat, setExportFormat] = useState<string>('pdf');
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'summary', 'progress', 'resources', 'timeline'
  ]);
  const [dateRange, setDateRange] = useState<any>({
    from: new Date(),
    to: addDays(new Date(), 30)
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const exportSections = [
    { id: 'summary', label: 'Project Summary', icon: FileText },
    { id: 'progress', label: 'Progress Analytics', icon: CalendarIcon },
    { id: 'resources', label: 'Resource Utilization', icon: FileText },
    { id: 'timeline', label: 'Timeline Analysis', icon: CalendarIcon },
    { id: 'budget', label: 'Budget Overview', icon: FileText },
    { id: 'risks', label: 'Risk Assessment', icon: FileText },
  ];

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleExport = async () => {
    if (selectedSections.length === 0) {
      toast({
        title: "No sections selected",
        description: "Please select at least one section to export.",
        variant: "destructive"
      });
      return;
    }

    if (!currentWorkspace?.id) {
      toast({
        title: "No workspace selected",
        description: "Please select a workspace to export reports.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Generate the report with real data
      const reportData = await generateReport({
        type: 'analytics_export',
        frequency: 'one_time',
        recipients: ['current_user@company.com'],
        sections: selectedSections,
        dateRange: {
          from: dateRange.from?.toISOString(),
          to: dateRange.to?.toISOString()
        }
      });

      if (reportData) {
        // Download the report
        const success = await downloadReport(reportData.id, exportFormat);
        
        if (success) {
          toast({
            title: "Export completed",
            description: `Report exported as ${exportFormat.toUpperCase()} with ${selectedSections.length} sections.`,
          });
        } else {
          throw new Error('Download failed');
        }
      } else {
        throw new Error('Report generation failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleEmailNow = async () => {
    if (selectedSections.length === 0) {
      toast({
        title: "No sections selected",
        description: "Please select at least one section to email.",
        variant: "destructive"
      });
      return;
    }

    if (!currentWorkspace?.id) {
      toast({
        title: "No workspace selected",
        description: "Please select a workspace to send reports.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate report data for email
      const reportData = await generateReport({
        type: 'analytics_export',
        frequency: 'one_time',
        recipients: ['current_user@company.com'],
        sections: selectedSections,
        dateRange: {
          from: dateRange.from?.toISOString(),
          to: dateRange.to?.toISOString()
        }
      });

      if (reportData) {
        const success = await sendReportEmail({
          recipients: ['current_user@company.com'], // You can make this configurable
          reportType: 'analytics_export',
          reportData: reportData.data,
          format: exportFormat,
          workspaceId: currentWorkspace.id
        });

        if (!success) {
          throw new Error('Email sending failed');
        }
      } else {
        throw new Error('Report generation failed');
      }
    } catch (error) {
      console.error('Email error:', error);
      toast({
        title: "Email failed",
        description: "There was an error sending the report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadNow = async () => {
    await handleExport(); // Reuse existing export logic
  };

  const handleDeleteSchedule = async (reportId: string) => {
    try {
      await deleteScheduledReport(reportId);
      toast({
        title: "Schedule deleted",
        description: "The scheduled report has been removed.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete the scheduled report.",
        variant: "destructive"
      });
    }
  };

  const handleToggleSchedule = async (reportId: string, isActive: boolean) => {
    try {
      await toggleReportStatus(reportId, !isActive);
      toast({
        title: isActive ? "Schedule paused" : "Schedule activated",
        description: `The scheduled report has been ${isActive ? 'paused' : 'activated'}.`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update the scheduled report.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                <SelectItem value="csv">CSV Data</SelectItem>
                <SelectItem value="pptx">PowerPoint Presentation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              className="rounded-md border"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Include Sections</label>
            <div className="space-y-2">
              {exportSections.map((section) => (
                <div key={section.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={section.id}
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={() => handleSectionToggle(section.id)}
                  />
                  <label 
                    htmlFor={section.id}
                    className="text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <section.icon className="h-4 w-4" />
                    {section.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Scheduled Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scheduledLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading scheduled reports...
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Current Schedules</h4>
                {scheduledReports.length === 0 ? (
                  <div className="border rounded-lg p-3 text-center text-muted-foreground">
                    No scheduled reports configured
                  </div>
                ) : (
                  <div className="space-y-2">
                    {scheduledReports.map((report) => (
                      <div key={report.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {report.report_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                              <Badge variant={report.is_active ? 'default' : 'secondary'}>
                                {report.is_active ? 'Active' : 'Paused'}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1)} • {report.format.toUpperCase()}
                            </div>
                            {report.next_run_at && (
                              <div className="text-xs text-muted-foreground">
                                Next run: {format(new Date(report.next_run_at), 'MMM dd, yyyy HH:mm')}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleSchedule(report.id, report.is_active)}
                            >
                              {report.is_active ? (
                                <Pause className="h-3 w-3" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSchedule(report.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {report.recipients.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Recipients: {report.recipients.map(r => r.recipient_email).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                variant="outline" 
                onClick={() => setIsScheduleModalOpen(true)}
                className="w-full"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Add New Schedule
              </Button>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEmailNow}
                    disabled={isSending}
                  >
                    <Mail className="mr-1 h-3 w-3" />
                    {isSending ? 'Sending...' : 'Email Now'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownloadNow}
                    disabled={isExporting}
                  >
                    <Download className="mr-1 h-3 w-3" />
                    {isExporting ? 'Downloading...' : 'Download'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ScheduleReportModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        initialConfig={{
          exportFormat,
          selectedSections,
          dateRange
        }}
      />
    </div>
  );
};

export default ReportsExport;

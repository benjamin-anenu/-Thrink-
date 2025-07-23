import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Download, FileText, Mail, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRealReportsData } from '@/hooks/useRealReportsData';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { addDays } from 'date-fns';

const ReportsExport: React.FC = () => {
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const { generateReport, downloadReport } = useRealReportsData();
  const [exportFormat, setExportFormat] = useState<string>('pdf');
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'summary', 'progress', 'resources', 'timeline'
  ]);
  const [dateRange, setDateRange] = useState<any>({
    from: new Date(),
    to: addDays(new Date(), 30)
  });
  const [isExporting, setIsExporting] = useState(false);

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

  const handleScheduleReport = async () => {
    if (!currentWorkspace?.id) {
      toast({
        title: "No workspace selected",
        description: "Please select a workspace to schedule reports.",
        variant: "destructive"
      });
      return;
    }

    try {
      const reportData = await generateReport({
        type: 'scheduled_analytics',
        frequency: 'weekly',
        recipients: ['current_user@company.com'],
        sections: selectedSections,
        dateRange: {
          from: dateRange.from?.toISOString(),
          to: dateRange.to?.toISOString()
        }
      });

      if (reportData) {
        toast({
          title: "Report scheduled",
          description: "Weekly reports will be sent to your email every Monday at 9:00 AM.",
        });
      } else {
        throw new Error('Failed to schedule report');
      }
    } catch (error) {
      console.error('Schedule error:', error);
      toast({
        title: "Schedule failed",
        description: "Failed to schedule the report. Please try again.",
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
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current Schedules</h4>
            <div className="border rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Weekly Summary</span>
                <span className="text-xs text-muted-foreground">Every Monday</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Monthly Analytics</span>
                <span className="text-xs text-muted-foreground">1st of each month</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Recipients</label>
            <div className="text-sm text-muted-foreground">
              • project.manager@company.com<br/>
              • stakeholder@company.com<br/>
              • team.lead@company.com
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleScheduleReport}
            className="w-full"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Configure Schedule
          </Button>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                <Mail className="mr-1 h-3 w-3" />
                Email Now
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-1 h-3 w-3" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsExport;
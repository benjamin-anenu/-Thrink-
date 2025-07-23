
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import ReportScheduler from '@/components/reports/ReportScheduler';
import RecipientSelector from '@/components/reports/RecipientSelector';
import { useScheduledReports } from '@/hooks/useScheduledReports';
import { useRecipients } from '@/hooks/useRecipients';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Save, X } from 'lucide-react';

interface ScheduleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig?: {
    exportFormat: string;
    selectedSections: string[];
    dateRange: {
      from: Date | undefined;
      to: Date | undefined;
    };
  };
}

const ScheduleReportModal: React.FC<ScheduleReportModalProps> = ({
  isOpen,
  onClose,
  initialConfig
}) => {
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const { createScheduledReport } = useScheduledReports();
  const { recipients } = useRecipients();
  
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [reportConfig, setReportConfig] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleScheduleReport = (config: any) => {
    setReportConfig(config);
  };

  const handleSaveSchedule = async () => {
    if (!reportConfig) {
      toast({
        title: "Configuration required",
        description: "Please configure the report schedule first.",
        variant: "destructive"
      });
      return;
    }

    if (selectedRecipients.length === 0) {
      toast({
        title: "Recipients required",
        description: "Please select at least one recipient.",
        variant: "destructive"
      });
      return;
    }

    if (!currentWorkspace?.id) {
      toast({
        title: "No workspace selected",
        description: "Please select a workspace to schedule reports.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      await createScheduledReport({
        report_type: reportConfig.type || 'analytics_export',
        frequency: reportConfig.frequency,
        sections: initialConfig?.selectedSections || ['summary', 'progress'],
        date_range_start: reportConfig.dateRange?.start?.toISOString(),
        date_range_end: reportConfig.dateRange?.end?.toISOString(),
        format: initialConfig?.exportFormat || 'pdf',
        recipients: selectedRecipients.map(id => {
          const recipient = recipients.find(r => r.id === id);
          return {
            recipient_id: id,
            recipient_name: recipient?.name || 'Unknown',
            recipient_email: recipient?.email || 'unknown@company.com',
            recipient_type: recipient?.type || 'workspace_member'
          };
        })
      });

      toast({
        title: "Schedule created",
        description: `${reportConfig.frequency} reports will be sent to ${selectedRecipients.length} recipients.`,
      });

      onClose();
    } catch (error) {
      console.error('Schedule creation error:', error);
      toast({
        title: "Schedule failed",
        description: "Failed to create the scheduled report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownloadReport = (type: string, dateRange: { start: Date | null; end: Date | null }) => {
    // This would trigger immediate download
    toast({
      title: "Download started",
      description: `Generating ${type} report for download...`,
    });
  };

  const handleSendReport = (type: string, dateRange: { start: Date | null; end: Date | null }) => {
    // This would trigger immediate email
    toast({
      title: "Email sent",
      description: `${type} report has been sent to selected recipients.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Report</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule">Schedule Configuration</TabsTrigger>
            <TabsTrigger value="recipients">Recipients</TabsTrigger>
          </TabsList>
          
          <TabsContent value="schedule" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Configure when and how often to send reports. Current settings: {initialConfig?.exportFormat.toUpperCase()} format with {initialConfig?.selectedSections.length} sections.
            </div>
            
            <ReportScheduler
              onScheduleReport={handleScheduleReport}
              onDownloadReport={handleDownloadReport}
              onSendReport={handleSendReport}
            />
          </TabsContent>
          
          <TabsContent value="recipients" className="space-y-4">
            <RecipientSelector
              selectedRecipients={selectedRecipients}
              onRecipientsChange={setSelectedRecipients}
            />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            onClick={handleSaveSchedule}
            disabled={isCreating || !reportConfig || selectedRecipients.length === 0}
          >
            <Save className="mr-2 h-4 w-4" />
            {isCreating ? 'Creating...' : 'Save Schedule'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleReportModal;

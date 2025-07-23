
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmailReportRequest {
  recipients: string[];
  reportType: string;
  reportData: any;
  format: string;
  workspaceId: string;
}

export const useEmailService = () => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendReportEmail = async (emailRequest: EmailReportRequest) => {
    setIsSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-report-email', {
        body: emailRequest
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Email sent successfully",
          description: `Report sent to ${emailRequest.recipients.length} recipients`,
        });
        return true;
      } else {
        throw new Error(data?.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email sending error:', error);
      toast({
        title: "Email failed",
        description: error instanceof Error ? error.message : "Failed to send email",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const sendScheduledReportEmail = async (reportId: string, recipients: string[]) => {
    setIsSending(true);
    
    try {
      // Get scheduled report data
      const { data: reportData, error: reportError } = await supabase
        .from('scheduled_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (reportError) throw reportError;

      // Generate report content based on the scheduled report configuration
      const emailRequest: EmailReportRequest = {
        recipients,
        reportType: reportData.report_type,
        reportData: {
          generatedAt: new Date().toISOString(),
          sections: reportData.sections || [],
          summary: {
            totalProjects: 0,
            activeProjects: 0,
            completedProjects: 0,
            totalResources: 0
          }
        },
        format: reportData.format,
        workspaceId: reportData.workspace_id
      };

      const success = await sendReportEmail(emailRequest);
      
      if (success) {
        // Update last_run_at for the scheduled report
        await supabase
          .from('scheduled_reports')
          .update({ last_run_at: new Date().toISOString() })
          .eq('id', reportId);
      }
      
      return success;
    } catch (error) {
      console.error('Scheduled email sending error:', error);
      toast({
        title: "Scheduled email failed",
        description: error instanceof Error ? error.message : "Failed to send scheduled email",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendReportEmail,
    sendScheduledReportEmail,
    isSending
  };
};

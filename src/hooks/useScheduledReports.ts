import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface ScheduledReport {
  id: string;
  report_type: string;
  frequency: string;
  is_active: boolean;
  next_run_at: string | null;
  last_run_at: string | null;
  sections: string[];
  date_range_start: string | null;
  date_range_end: string | null;
  format: string;
  created_at: string;
  recipients: Array<{
    id: string;
    recipient_name: string;
    recipient_email: string;
    recipient_type: string;
  }>;
}

export interface ScheduleReportConfig {
  report_type: string;
  frequency: string;
  sections: string[];
  date_range_start?: string;
  date_range_end?: string;
  format: string;
  recipients: Array<{
    recipient_id: string;
    recipient_name: string;
    recipient_email: string;
    recipient_type: string;
  }>;
}

export const useScheduledReports = () => {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspace();

  const fetchScheduledReports = async () => {
    if (!currentWorkspace?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: reports, error: reportsError } = await supabase
        .from('scheduled_reports')
        .select(`
          *,
          report_recipients (
            id,
            recipient_name,
            recipient_email,
            recipient_type
          )
        `)
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      const transformedReports: ScheduledReport[] = (reports || []).map(report => ({
        ...report,
        recipients: report.report_recipients || []
      }));

      setScheduledReports(transformedReports);
    } catch (err) {
      console.error('Error fetching scheduled reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch scheduled reports');
    } finally {
      setLoading(false);
    }
  };

  const createScheduledReport = async (config: ScheduleReportConfig): Promise<ScheduledReport | null> => {
    if (!currentWorkspace?.id) {
      throw new Error('No workspace selected');
    }

    try {
      // Calculate next run time based on frequency
      const now = new Date();
      let nextRunAt: Date | null = null;
      
      switch (config.frequency) {
        case 'daily':
          nextRunAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          nextRunAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          nextRunAt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case 'milestone':
          // For milestone-based, we'll set it to run weekly
          nextRunAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
      }

      // Create the scheduled report
      const { data: reportData, error: reportError } = await supabase
        .from('scheduled_reports')
        .insert({
          workspace_id: currentWorkspace.id,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          report_type: config.report_type,
          frequency: config.frequency,
          sections: config.sections,
          date_range_start: config.date_range_start,
          date_range_end: config.date_range_end,
          format: config.format,
          next_run_at: nextRunAt?.toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Create recipients
      if (config.recipients.length > 0) {
        const recipientInserts = config.recipients.map(recipient => ({
          scheduled_report_id: reportData.id,
          recipient_type: recipient.recipient_type,
          recipient_id: recipient.recipient_id,
          recipient_email: recipient.recipient_email,
          recipient_name: recipient.recipient_name
        }));

        const { error: recipientsError } = await supabase
          .from('report_recipients')
          .insert(recipientInserts);

        if (recipientsError) throw recipientsError;
      }

      // Refetch to get the complete data
      await fetchScheduledReports();
      
      return {
        ...reportData,
        recipients: []
      };
    } catch (err) {
      console.error('Error creating scheduled report:', err);
      throw err;
    }
  };

  const updateScheduledReport = async (id: string, updates: Partial<ScheduleReportConfig>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('scheduled_reports')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchScheduledReports();
      return true;
    } catch (err) {
      console.error('Error updating scheduled report:', err);
      return false;
    }
  };

  const deleteScheduledReport = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('scheduled_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchScheduledReports();
      return true;
    } catch (err) {
      console.error('Error deleting scheduled report:', err);
      return false;
    }
  };

  const toggleReportStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('scheduled_reports')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      await fetchScheduledReports();
      return true;
    } catch (err) {
      console.error('Error toggling report status:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchScheduledReports();
  }, [currentWorkspace?.id]);

  return {
    scheduledReports,
    loading,
    error,
    createScheduledReport,
    updateScheduledReport,
    deleteScheduledReport,
    toggleReportStatus,
    refetch: fetchScheduledReports
  };
};
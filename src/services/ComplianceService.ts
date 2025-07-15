import { supabase } from '@/integrations/supabase/client';
import { ComplianceLog, DataProcessingActivity } from '@/types/enterprise';

export class ComplianceService {
  static async logEvent(
    eventType: string,
    category: 'data_access' | 'data_modification' | 'user_management' | 'security' | 'compliance',
    description: string,
    workspaceId?: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase
      .from('compliance_logs')
      .insert({
        workspace_id: workspaceId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        event_type: eventType,
        event_category: category,
        resource_type: resourceType,
        resource_id: resourceId,
        description,
        ip_address: null, // Could be enhanced with real IP detection
        user_agent: navigator.userAgent,
        metadata: metadata || {}
      });

    if (error) {
      console.error('Failed to log compliance event:', error);
    }
  }

  static async getComplianceLogs(
    workspaceId?: string,
    limit = 100,
    offset = 0
  ): Promise<ComplianceLog[]> {
    let query = supabase
      .from('compliance_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as ComplianceLog[];
  }

  static async searchComplianceLogs(
    searchTerm: string,
    workspaceId?: string,
    category?: string
  ): Promise<ComplianceLog[]> {
    let query = supabase
      .from('compliance_logs')
      .select('*')
      .or(`description.ilike.%${searchTerm}%,event_type.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    if (category) {
      query = query.eq('event_category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as ComplianceLog[];
  }

  static async createDataProcessingActivity(
    workspaceId: string,
    activity: Omit<DataProcessingActivity, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>
  ): Promise<DataProcessingActivity> {
    const { data, error } = await supabase
      .from('data_processing_activities')
      .insert({
        workspace_id: workspaceId,
        ...activity
      })
      .select()
      .single();

    if (error) throw error;

    await this.logEvent(
      'data_processing_activity_created',
      'compliance',
      `Data processing activity created: ${activity.activity_name}`,
      workspaceId,
      'data_processing_activity',
      data.id
    );

    return data;
  }

  static async getDataProcessingActivities(workspaceId: string): Promise<DataProcessingActivity[]> {
    const { data, error } = await supabase
      .from('data_processing_activities')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async updateDataProcessingActivity(
    id: string,
    updates: Partial<DataProcessingActivity>
  ): Promise<DataProcessingActivity> {
    const { data, error } = await supabase
      .from('data_processing_activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await this.logEvent(
      'data_processing_activity_updated',
      'compliance',
      `Data processing activity updated: ${data.activity_name}`,
      data.workspace_id,
      'data_processing_activity',
      id
    );

    return data;
  }

  static async generateGDPRReport(workspaceId: string): Promise<{
    activities: DataProcessingActivity[];
    logs: ComplianceLog[];
    summary: {
      totalActivities: number;
      activeActivities: number;
      crossBorderTransfers: number;
      averageRetentionPeriod: number;
    };
  }> {
    const [activities, logs] = await Promise.all([
      this.getDataProcessingActivities(workspaceId),
      this.getComplianceLogs(workspaceId, 1000)
    ]);

    const activeActivities = activities.filter(a => a.is_active);
    const crossBorderTransfers = activities.filter(a => a.cross_border_transfers);
    const avgRetention = activities
      .filter(a => a.retention_period)
      .reduce((sum, a) => sum + (a.retention_period || 0), 0) / activities.length;

    return {
      activities,
      logs,
      summary: {
        totalActivities: activities.length,
        activeActivities: activeActivities.length,
        crossBorderTransfers: crossBorderTransfers.length,
        averageRetentionPeriod: Math.round(avgRetention || 0)
      }
    };
  }

  static async exportComplianceData(workspaceId: string): Promise<Blob> {
    const report = await this.generateGDPRReport(workspaceId);
    
    const exportData = {
      workspace_id: workspaceId,
      generated_at: new Date().toISOString(),
      data_processing_activities: report.activities,
      compliance_logs: report.logs,
      summary: report.summary
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }
}
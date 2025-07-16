
import { supabase } from '@/integrations/supabase/client';

export interface ClientSatisfactionData {
  id: string;
  projectId: string;
  workspaceId: string;
  clientName: string;
  clientEmail?: string;
  satisfactionScore: number;
  feedbackText?: string;
  surveyDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SatisfactionTrend {
  month: string;
  score: number;
  responses: number;
}

class ClientSatisfactionService {
  async addSatisfactionRecord(data: Omit<ClientSatisfactionData, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data: result, error } = await supabase
      .from('client_satisfaction')
      .insert({
        project_id: data.projectId,
        workspace_id: data.workspaceId,
        client_name: data.clientName,
        client_email: data.clientEmail,
        satisfaction_score: data.satisfactionScore,
        feedback_text: data.feedbackText,
        survey_date: data.surveyDate
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getSatisfactionTrend(workspaceId: string): Promise<SatisfactionTrend[]> {
    const { data, error } = await supabase
      .from('client_satisfaction')
      .select('satisfaction_score, survey_date')
      .eq('workspace_id', workspaceId)
      .order('survey_date', { ascending: true });

    if (error) throw error;

    // Group by month and calculate average
    const monthlyData = new Map<string, { total: number; count: number }>();
    
    data?.forEach(record => {
      const date = new Date(record.survey_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { total: 0, count: 0 });
      }
      
      const existing = monthlyData.get(monthKey)!;
      existing.total += record.satisfaction_score;
      existing.count += 1;
    });

    const trend: SatisfactionTrend[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    monthlyData.forEach((value, key) => {
      const [year, month] = key.split('-');
      trend.push({
        month: monthNames[parseInt(month) - 1],
        score: Math.round((value.total / value.count) * 10) / 10,
        responses: value.count
      });
    });

    return trend.sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month));
  }

  async getWorkspaceSatisfactionAverage(workspaceId: string): Promise<number> {
    const { data, error } = await supabase
      .from('client_satisfaction')
      .select('satisfaction_score')
      .eq('workspace_id', workspaceId);

    if (error) throw error;
    
    if (!data || data.length === 0) return 4.2; // Default fallback
    
    const average = data.reduce((sum, record) => sum + record.satisfaction_score, 0) / data.length;
    return Math.round(average * 10) / 10;
  }
}

export const clientSatisfactionService = new ClientSatisfactionService();

import { supabase } from '@/integrations/supabase/client';

export interface ProjectDraft {
  id: string;
  user_id: string;
  workspace_id: string;
  draft_name: string;
  draft_data: any;
  current_step: number;
  last_modified: string;
  created_at: string;
  updated_at: string;
}

export class ProjectDraftService {
  // Save or update a draft
  static async saveDraft(
    draftName: string,
    workspaceId: string,
    draftData: any,
    currentStep: number,
    draftId?: string
  ): Promise<ProjectDraft> {
    if (draftId) {
      // Update existing draft
      const { data, error } = await supabase
        .from('project_drafts')
        .update({
          draft_name: draftName,
          draft_data: draftData,
          current_step: currentStep,
          last_modified: new Date().toISOString()
        })
        .eq('id', draftId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new draft
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('project_drafts')
        .insert({
          user_id: userData.user.id,
          draft_name: draftName,
          workspace_id: workspaceId,
          draft_data: draftData,
          current_step: currentStep
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  // Get all drafts for current user in workspace
  static async getDrafts(workspaceId: string): Promise<ProjectDraft[]> {
    const { data, error } = await supabase
      .from('project_drafts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('last_modified', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get a specific draft
  static async getDraft(draftId: string): Promise<ProjectDraft | null> {
    const { data, error } = await supabase
      .from('project_drafts')
      .select('*')
      .eq('id', draftId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }
    return data;
  }

  // Delete a draft
  static async deleteDraft(draftId: string): Promise<void> {
    const { error } = await supabase
      .from('project_drafts')
      .delete()
      .eq('id', draftId);

    if (error) throw error;
  }

  // Auto-save draft (debounced)
  private static saveTimeouts = new Map<string, NodeJS.Timeout>();

  static autoSaveDraft(
    draftName: string,
    workspaceId: string,
    draftData: any,
    currentStep: number,
    draftId?: string,
    delay: number = 3000
  ): Promise<ProjectDraft> {
    const key = draftId || `${workspaceId}-${draftName}`;
    
    // Clear existing timeout
    const existingTimeout = this.saveTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(async () => {
        try {
          const result = await this.saveDraft(draftName, workspaceId, draftData, currentStep, draftId);
          this.saveTimeouts.delete(key);
          resolve(result);
        } catch (error) {
          this.saveTimeouts.delete(key);
          reject(error);
        }
      }, delay);

      this.saveTimeouts.set(key, timeout);
    });
  }

  // Clear auto-save timeout
  static clearAutoSave(draftId: string): void {
    const timeout = this.saveTimeouts.get(draftId);
    if (timeout) {
      clearTimeout(timeout);
      this.saveTimeouts.delete(draftId);
    }
  }
}
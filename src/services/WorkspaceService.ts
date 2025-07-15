import { supabase } from '@/integrations/supabase/client';
import { Workspace, WorkspaceMember, WorkspaceInvitation, WorkspaceCreateData, InvitationFormData } from '@/types/enterprise';

export class WorkspaceService {
  static async createWorkspace(data: WorkspaceCreateData): Promise<Workspace> {
    const { data: result, error } = await supabase.rpc('create_workspace_with_owner', {
      workspace_name: data.name,
      workspace_description: data.description || null,
      workspace_slug: data.slug || null,
    });

    if (error) throw error;

    // Fetch the created workspace
    const { data: workspace, error: fetchError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', result)
      .single();

    if (fetchError) throw fetchError;
    return workspace;
  }

  static async getWorkspaces(): Promise<Workspace[]> {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getWorkspace(id: string): Promise<Workspace> {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace> {
    const { data, error } = await supabase
      .from('workspaces')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as WorkspaceMember[];
  }

  static async inviteMember(workspaceId: string, invitation: InvitationFormData): Promise<WorkspaceInvitation> {
    const { data, error } = await supabase
      .from('workspace_invitations')
      .insert({
        workspace_id: workspaceId,
        email: invitation.email,
        role: invitation.role,
        invited_by: (await supabase.auth.getUser()).data.user?.id,
        metadata: { message: invitation.message || '' }
      })
      .select()
      .single();

    if (error) throw error;

    // Log the invitation
    await this.logComplianceEvent(workspaceId, 'member_invited', 'user_management', 
      `Member invited: ${invitation.email} with role ${invitation.role}`);

    return data as WorkspaceInvitation;
  }

  static async getWorkspaceInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
    const { data, error } = await supabase
      .from('workspace_invitations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as WorkspaceInvitation[];
  }

  static async acceptInvitation(token: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('accept_workspace_invitation', {
      invitation_token: token
    });

    if (error) throw error;
    return data;
  }

  static async removeMember(workspaceId: string, memberId: string): Promise<void> {
    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('id', memberId);

    if (error) throw error;

    await this.logComplianceEvent(workspaceId, 'member_removed', 'user_management', 
      'Member removed from workspace');
  }

  static async updateMemberRole(workspaceId: string, memberId: string, role: string): Promise<void> {
    const { error } = await supabase
      .from('workspace_members')
      .update({ role })
      .eq('workspace_id', workspaceId)
      .eq('id', memberId);

    if (error) throw error;

    await this.logComplianceEvent(workspaceId, 'member_role_updated', 'user_management', 
      `Member role updated to ${role}`);
  }

  static async revokeInvitation(workspaceId: string, invitationId: string): Promise<void> {
    const { error } = await supabase
      .from('workspace_invitations')
      .update({ status: 'revoked' })
      .eq('workspace_id', workspaceId)
      .eq('id', invitationId);

    if (error) throw error;

    await this.logComplianceEvent(workspaceId, 'invitation_revoked', 'user_management', 
      'Workspace invitation revoked');
  }

  private static async logComplianceEvent(
    workspaceId: string,
    eventType: string,
    category: string,
    description: string
  ): Promise<void> {
    const { error } = await supabase
      .from('compliance_logs')
      .insert({
        workspace_id: workspaceId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        event_type: eventType,
        event_category: category,
        description,
        ip_address: null, // Could be enhanced to capture real IP
        user_agent: navigator.userAgent,
        metadata: {}
      });

    if (error) console.error('Failed to log compliance event:', error);
  }
}
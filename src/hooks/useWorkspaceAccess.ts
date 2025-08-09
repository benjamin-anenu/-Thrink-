
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useWorkspaceAccess() {
  const { user } = useAuth();

  const key = (uid: string) => `thrink_assumed_workspace_${uid}`;

  const assumeAccess = async (workspaceId: string, ttlMinutes = 240, role: string = 'admin') => {
    if (!user) {
      console.warn('[WorkspaceAccess] No user - cannot assume access');
      return { ok: false, error: 'Not authenticated' };
    }
    console.log('[WorkspaceAccess] Assuming temporary access for workspace:', workspaceId, 'ttl:', ttlMinutes, 'role:', role);
    const { error } = await supabase.rpc('assume_workspace_access', {
      _workspace_id: workspaceId,
      _ttl_minutes: ttlMinutes,
      _role: role,
    });
    if (error) {
      console.error('[WorkspaceAccess] assume_workspace_access error:', error);
      toast.error('Failed to assume workspace access');
      return { ok: false, error };
    }
    localStorage.setItem(key(user.id), workspaceId);
    toast.success('Temporary workspace access granted');
    return { ok: true };
  };

  const clearAccess = async (workspaceId: string, options?: { silent?: boolean }) => {
    if (!user) {
      console.warn('[WorkspaceAccess] No user - cannot clear access');
      return { ok: false, error: 'Not authenticated' };
    }
    console.log('[WorkspaceAccess] Clearing temporary access for workspace:', workspaceId, 'silent:', options?.silent);
    const { error } = await supabase.rpc('clear_workspace_access', {
      _workspace_id: workspaceId,
    });
    if (error) {
      console.error('[WorkspaceAccess] clear_workspace_access error:', error);
      return { ok: false, error };
    }
    localStorage.removeItem(key(user.id));
    if (!options?.silent) {
      toast.success('Workspace access cleared');
    }
    return { ok: true };
  };

  const getAssumedWorkspaceId = () => {
    if (!user) return null;
    return localStorage.getItem(key(user.id));
  };

  return {
    assumeAccess,
    clearAccess,
    getAssumedWorkspaceId,
  };
}

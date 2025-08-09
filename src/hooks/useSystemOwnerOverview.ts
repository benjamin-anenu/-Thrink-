import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TopPerformer {
  name: string;
  workspaceId?: string;
  workspaceName?: string;
  completedTasks?: number;
  efficiency?: number;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  members: number;
  projects: number;
  progress?: number;
  status?: 'active' | 'warning' | 'inactive';
  lastActivity?: string;
}

export interface SystemOwnerOverviewData {
  totalWorkspaces: number;
  totalUsers: number;
  totalProjects: number;
  activeProjects: number;
  clientSatisfactionAvg: number;
  workspaces: WorkspaceSummary[];
  topPerformers: TopPerformer[];
}

export function useSystemOwnerOverview() {
  const { user } = useAuth();
  const [data, setData] = useState<SystemOwnerOverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 1) Get workspace memberships (RLS will scope to accessible rows)
      const { data: memberships, error: memErr } = await supabase
        .from('workspace_members')
        .select('workspace_id,user_id,status');
      if (memErr) throw memErr;

      const activeMemberships = (memberships || []).filter(m => m.status === 'active');
      const workspaceIds = Array.from(new Set(activeMemberships.map(m => m.workspace_id).filter(Boolean)));

      // If no workspaces visible, return empty aggregates
      if (workspaceIds.length === 0) {
        setData({
          totalWorkspaces: 0,
          totalUsers: 0,
          totalProjects: 0,
          activeProjects: 0,
          clientSatisfactionAvg: 0,
          workspaces: [],
          topPerformers: [],
        });
        setLoading(false);
        return;
      }

      // 2) Fetch in parallel
      const [workspacesRes, projectsRes, csatRes, perfProfilesRes] = await Promise.all([
        supabase.from('workspaces').select('id,name').in('id', workspaceIds),
        supabase.from('projects').select('id,workspace_id,status').in('workspace_id', workspaceIds),
        supabase.from('client_satisfaction').select('satisfaction_score,workspace_id').in('workspace_id', workspaceIds),
        supabase
          .from('performance_profiles')
          .select('resource_name,current_score,workspace_id')
          .in('workspace_id', workspaceIds)
          .order('current_score', { ascending: false })
          .limit(5),
      ]);

      if (workspacesRes.error) throw workspacesRes.error;
      if (projectsRes.error) throw projectsRes.error;
      if (csatRes.error) throw csatRes.error;
      if (perfProfilesRes.error) throw perfProfilesRes.error;

      const workspaces = workspacesRes.data || [];
      const projects = projectsRes.data || [];
      const csat = csatRes.data || [];
      const performers = perfProfilesRes.data || [];

      // Aggregate counts
      const totalWorkspaces = workspaces.length;
      const totalUsers = Array.from(new Set(activeMemberships.map(m => m.user_id))).length;
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => (p as any).status && (p as any).status !== 'Completed' && (p as any).status !== 'Archived').length;

      const clientSatisfactionAvg = csat.length
        ? Math.round((csat.reduce((sum, r) => sum + (r as any).satisfaction_score, 0) / csat.length) * 100) / 100
        : 0;

      // Workspace summaries
      const membersByWs = activeMemberships.reduce<Record<string, number>>((acc, m: any) => {
        const id = m.workspace_id as string;
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {});

      const projectsByWs = projects.reduce<Record<string, number>>((acc, p: any) => {
        const id = p.workspace_id as string;
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {});

      const workspaceSummaries: WorkspaceSummary[] = workspaces.map((w: any) => ({
        id: w.id as string,
        name: w.name as string,
        members: membersByWs[w.id] || 0,
        projects: projectsByWs[w.id] || 0,
        progress: undefined,
        status: 'active',
        lastActivity: undefined,
      }));

      // Top performers mapping
      const topPerformers: TopPerformer[] = performers.map((p: any) => ({
        name: p.resource_name as string,
        workspaceId: p.workspace_id as string,
        completedTasks: undefined,
        efficiency: Number(p.current_score) || 0,
      }));

      setData({
        totalWorkspaces,
        totalUsers,
        totalProjects,
        activeProjects,
        clientSatisfactionAvg,
        workspaces: workspaceSummaries,
        topPerformers,
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to load system overview');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}

import { useEffect, useState, useCallback, useMemo } from 'react';
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

export interface ProjectOverview {
  id: string;
  name: string;
  workspaceId: string;
  workspaceName: string;
  status?: string;
  tasksTotal: number;
  tasksCompleted: number;
  progress: number;
  issuesOpen: number;
  overdueTasks: number;
  nextMilestone?: { id: string; name: string; dueDate?: string; status?: string } | null;
  lastUpdated?: string;
}

export interface SystemOwnerOverviewData {
  totalWorkspaces: number;
  totalUsers: number;
  totalProjects: number;
  activeProjects: number;
  clientSatisfactionAvg: number;
  workspaces: WorkspaceSummary[];
  topPerformers: TopPerformer[];
  // Real-time operational stats
  openIssues: number;
  overdueTasks: number;
  tasksDueToday: number;
  escalationsLast7: number;
  escalationsLast30: number;
  atRiskProjects: number;
  projectsDetails: ProjectOverview[];
}

export interface SystemOwnerFilters {
  workspaceIds?: string[];
  dateFrom?: string; // ISO date (inclusive)
  dateTo?: string;   // ISO date (inclusive)
  search?: string;
}

export function useSystemOwnerOverview(filters?: SystemOwnerFilters) {
  const { user } = useAuth();
  const [data, setData] = useState<SystemOwnerOverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedDateRange = useMemo(() => {
    const to = filters?.dateTo ? new Date(filters.dateTo) : new Date();
    const from = filters?.dateFrom
      ? new Date(filters.dateFrom)
      : new Date(new Date().setDate(to.getDate() - 30));
    // Strip time for date equality comparisons
    const toISO = to.toISOString();
    const fromISO = from.toISOString();
    return { fromISO, toISO };
  }, [filters?.dateFrom, filters?.dateTo]);

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
      let workspaceIds = Array.from(new Set(activeMemberships.map(m => m.workspace_id).filter(Boolean)));

      // Apply workspace filter if provided
      if (filters?.workspaceIds && filters.workspaceIds.length > 0) {
        const allowed = new Set(filters.workspaceIds);
        workspaceIds = workspaceIds.filter(id => allowed.has(id as string));
      }

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
          openIssues: 0,
          overdueTasks: 0,
          tasksDueToday: 0,
          escalationsLast7: 0,
          escalationsLast30: 0,
          atRiskProjects: 0,
          projectsDetails: [],
        });
        setLoading(false);
        return;
      }

      // 2) Fetch core workspace and project data first
      const [workspacesRes, projectsRes, csatRes, perfProfilesRes] = await Promise.all([
        supabase.from('workspaces').select('id,name').in('id', workspaceIds as string[]),
        supabase.from('projects').select('id,workspace_id,name,status,updated_at').in('workspace_id', workspaceIds as string[]),
        supabase.from('client_satisfaction').select('satisfaction_score,workspace_id').in('workspace_id', workspaceIds as string[]),
        supabase
          .from('performance_profiles')
          .select('resource_name,current_score,workspace_id')
          .in('workspace_id', workspaceIds as string[])
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

      const projectIds = projects.map((p: any) => p.id as string);

      // 3) Fetch dependent resources for metrics
      const [tasksRes, issuesRes, milestonesRes, escalations7Res, escalations30Res] = await Promise.all([
        projectIds.length > 0
          ? supabase
              .from('project_tasks')
              .select('id,project_id,status,progress,end_date,updated_at')
              .in('project_id', projectIds)
          : Promise.resolve({ data: [], error: null } as any),
        projectIds.length > 0
          ? supabase
              .from('project_issues')
              .select('id,project_id,status,created_at')
              .in('project_id', projectIds)
          : Promise.resolve({ data: [], error: null } as any),
        projectIds.length > 0
          ? supabase
              .from('milestones')
              .select('id,project_id,name,due_date,status')
              .in('project_id', projectIds)
          : Promise.resolve({ data: [], error: null } as any),
        supabase
          .from('escalation_history')
          .select('id,workspace_id,sent_at')
          .in('workspace_id', workspaceIds as string[])
          .gte('sent_at', new Date(new Date().setDate(new Date().getDate() - 7)).toISOString()),
        supabase
          .from('escalation_history')
          .select('id,workspace_id,sent_at')
          .in('workspace_id', workspaceIds as string[])
          .gte('sent_at', normalizedDateRange.fromISO)
          .lte('sent_at', normalizedDateRange.toISO),
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (issuesRes.error) throw issuesRes.error;
      if (milestonesRes.error) throw milestonesRes.error;
      if (escalations7Res.error) throw escalations7Res.error;
      if (escalations30Res.error) throw escalations30Res.error;

      const tasks = tasksRes.data || [];
      const issues = issuesRes.data || [];
      const milestones = milestonesRes.data || [];

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

      const wsNameMap = new Map<string, string>(workspaces.map((w: any) => [w.id as string, w.name as string]));

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

      // Real-time operational metrics
      const todayStr = new Date().toISOString().slice(0, 10);
      const tasksDueToday = tasks.filter((t: any) => t.end_date && String(t.end_date).startsWith(todayStr)).length;
      const overdueTasks = tasks.filter((t: any) => t.end_date && new Date(t.end_date) < new Date() && t.status !== 'Completed').length;
      const openIssues = (issues as any[]).filter(i => (i as any).status && (i as any).status !== 'Closed' && (i as any).status !== 'Resolved').length;

      // At risk projects: has overdue tasks or >= 1 open issue
      const tasksByProject = (tasks as any[]).reduce((acc, t: any) => {
        const pid = t.project_id as string;
        (acc[pid] = acc[pid] || []).push(t);
        return acc;
      }, {} as Record<string, any[]>);

      const issuesByProject = (issues as any[]).reduce((acc, i: any) => {
        const pid = i.project_id as string;
        acc[pid] = (acc[pid] || 0) + ((i.status && i.status !== 'Closed' && i.status !== 'Resolved') ? 1 : 0);
        return acc;
      }, {} as Record<string, number>);

      const milestonesByProject = (milestones as any[]).reduce((acc, m: any) => {
        const pid = m.project_id as string;
        (acc[pid] = acc[pid] || []).push(m);
        return acc;
      }, {} as Record<string, any[]>);

      const projectsDetails: ProjectOverview[] = projects.map((p: any) => {
        const pid = p.id as string;
        const projTasks = tasksByProject[pid] || [];
        const total = projTasks.length;
        const completed = projTasks.filter((t: any) => t.status === 'Completed').length;
        const avgProgress = total > 0
          ? Math.round(projTasks.reduce((s: number, t: any) => s + (Number(t.progress) || 0), 0) / total)
          : 0;
        const projIssuesOpen = issuesByProject[pid] || 0;
        const projOverdue = projTasks.filter((t: any) => t.end_date && new Date(t.end_date) < new Date() && t.status !== 'Completed').length;
        const ms = (milestonesByProject[pid] || [])
          .filter((m: any) => m.due_date && new Date(m.due_date) >= new Date())
          .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        const nextMilestone = ms.length > 0 ? { id: ms[0].id, name: ms[0].name, dueDate: ms[0].due_date, status: ms[0].status } : null;

        return {
          id: pid,
          name: p.name as string,
          workspaceId: p.workspace_id as string,
          workspaceName: wsNameMap.get(p.workspace_id as string) || '—',
          status: p.status as string,
          tasksTotal: total,
          tasksCompleted: completed,
          progress: Math.min(Math.max(avgProgress, 0), 100),
          issuesOpen: projIssuesOpen,
          overdueTasks: projOverdue,
          nextMilestone,
          lastUpdated: p.updated_at as string,
        };
      });

      const atRiskProjects = projectsDetails.filter(pd => pd.overdueTasks > 0 || pd.issuesOpen > 0).length;

      const escalationsLast7 = (escalations7Res.data || []).length;
      const escalationsLast30 = (escalations30Res.data || []).length;

      // Optional search filter on projects
      const filteredProjectsDetails = filters?.search
        ? projectsDetails.filter(p => p.name.toLowerCase().includes(filters.search!.toLowerCase()))
        : projectsDetails;

      setData({
        totalWorkspaces,
        totalUsers,
        totalProjects,
        activeProjects,
        clientSatisfactionAvg,
        workspaces: workspaceSummaries,
        topPerformers,
        openIssues,
        overdueTasks,
        tasksDueToday,
        escalationsLast7,
        escalationsLast30,
        atRiskProjects,
        projectsDetails: filteredProjectsDetails,
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to load system overview');
    } finally {
      setLoading(false);
    }
  }, [user, filters?.workspaceIds, filters?.search, normalizedDateRange.fromISO, normalizedDateRange.toISO]);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time updates via Realtime channels
  useEffect(() => {
    const channel = supabase
      .channel('system-owner-overview')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_tasks' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_issues' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'escalation_history' }, () => load())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return { data, loading, error, refresh: load };
}

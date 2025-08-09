import { supabase } from '@/integrations/supabase/client';
import type { ProcessedQuery } from './LocalNLPProcessor';

export interface QueryResult { data: any[]; planUsed: string; }

export class QueryBuilder {
  async execute(processed: ProcessedQuery, workspaceId: string): Promise<QueryResult> {
    const i = processed.intent.intent;

    // Helper dates
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    // Extract simple flags from entities/action words for composable filtering
    const entities = processed.entities || [];
    const dateEntity = entities.find((e: any) => e.type === 'date');
    const statusEntities: string[] = (entities
      .filter((e: any) => e.type === 'status')
      .map((e: any) => String(e.value).toLowerCase())) as string[];

    const wantsTasks = i.includes('task') || (processed.actionWords || []).some((aw: any) =>
      (aw.category?.toLowerCase?.() || '').includes('task') || (aw.id?.toLowerCase?.() || '').includes('task')
    );
    const wantsProjects = i.includes('project') || (processed.actionWords || []).some((aw: any) =>
      (aw.category?.toLowerCase?.() || '').includes('project') || (aw.id?.toLowerCase?.() || '').includes('project')
    );

    const wantsUrgent = i === 'urgent_tasks';
    const wantsOverdueProjects = i === 'overdue_projects';

    // Normalize "active" status intent
    const wantsActive = statusEntities.includes('active') || statusEntities.includes('in progress');

    // Utility to apply date filters to task query based on entity
    const applyTaskDateFilter = (q: any) => {
      if (!dateEntity) return q;
      switch (dateEntity.value) {
        case 'today':
          return q.eq('end_date', todayStr);
        case 'this_week': {
          const d = new Date();
          const day = d.getUTCDay();
          const diff = (day + 6) % 7; // Monday
          const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff));
          const sunday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + (6 - diff)));
          return q.gte('end_date', monday.toISOString().slice(0, 10)).lte('end_date', sunday.toISOString().slice(0, 10));
        }
        case 'this_month': {
          const d = new Date();
          const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
          const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
          return q.gte('end_date', start.toISOString().slice(0, 10)).lte('end_date', end.toISOString().slice(0, 10));
        }
        default:
          return q;
      }
    };

    // TASKS: If the user asks for tasks OR combines project filters with task listing
    if (wantsTasks || i === 'list_tasks' || i === 'overdue_tasks' || wantsUrgent) {
      // Determine project scope: active projects vs all workspace projects
      let projectIds: string[] = [];
      if (wantsActive) {
        const { data: activeProjects } = await supabase
          .from('projects')
          .select('id')
          .eq('workspace_id', workspaceId)
          .is('deleted_at', null)
          .neq('status', 'Completed')
          .neq('status', 'Cancelled')
          .neq('status', 'Archived');
        projectIds = (activeProjects || []).map((p: any) => p.id);
      } else {
        const { data: allProjects } = await supabase
          .from('projects')
          .select('id')
          .eq('workspace_id', workspaceId)
          .is('deleted_at', null);
        projectIds = (allProjects || []).map((p: any) => p.id);
      }

      // If no projects, return empty
      if (!projectIds.length) return { data: [], planUsed: 'composed_tasks_no_projects' };

      let q = supabase
        .from('project_tasks')
        .select('id, name, status, priority, progress, start_date, end_date, project_id, updated_at')
        .in('project_id', projectIds)
        .limit(50);

      // Intent-specific filters
      if (i === 'overdue_tasks') q = q.lt('end_date', todayStr).neq('status', 'Completed');
      if (wantsUrgent) q = q.in('priority', ['Critical', 'High']);

      // Date filter from entities (e.g., today/this_week/this_month)
      q = applyTaskDateFilter(q);

      const { data } = await q.order('updated_at', { ascending: false });
      return { data: data || [], planUsed: 'composed_tasks' };
    }

    // PROJECTS: Handle list/details/overdue with optional active/time filters
    if (wantsProjects || i === 'list_projects' || i === 'project_details' || wantsOverdueProjects) {
      let q = supabase
        .from('projects')
        .select('id, name, status, progress, start_date, end_date, computed_start_date, computed_end_date, created_at')
        .eq('workspace_id', workspaceId)
        .is('deleted_at', null)
        .limit(50);

      if (wantsOverdueProjects) q = q.lt('end_date', todayStr).neq('status', 'Completed');
      if (wantsActive) q = q.neq('status', 'Completed').neq('status', 'Cancelled').neq('status', 'Archived');

      // Optional date context for projects: include projects spanning today
      if ((dateEntity as any)?.value === 'today') {
        q = q.or(`and(computed_start_date.lte.${todayStr},computed_end_date.gte.${todayStr})`);
      }

      const { data } = await q.order('created_at', { ascending: false });
      return { data: data || [], planUsed: 'composed_projects' };
    }

    // RESOURCES (keep simple for now)
    if (i === 'list_resources' || i === 'available_resources' || i === 'busy_resources') {
      let q = supabase
        .from('resources')
        .select('id, name, role, availability, workspace_id')
        .eq('workspace_id', workspaceId)
        .limit(20);
      if (i === 'available_resources') q = q.gte('availability', 50);
      if (i === 'busy_resources') q = q.lt('availability', 30);
      const { data } = await q;
      return { data: data || [], planUsed: i };
    }

    // Fallback: general projects quick search
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, status, progress')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .limit(5);
    return { data: projects || [], planUsed: 'general' };
  }
}

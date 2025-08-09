import { supabase } from '@/integrations/supabase/client';
import type { ProcessedQuery } from './LocalNLPProcessor';

export interface QueryResult { data: any[]; planUsed: string; }

export class QueryBuilder {
  async execute(processed: ProcessedQuery, workspaceId: string): Promise<QueryResult> {
    const i = processed.intent.intent;
    // Projects
    if (i === 'list_projects' || i === 'project_details') {
      let q = supabase
        .from('projects')
        .select('id, name, status, progress, start_date, end_date, created_at')
        .eq('workspace_id', workspaceId)
        .is('deleted_at', null)
        .limit(10);

      if (i === 'project_details') {
        // no joins; keep details basic locally
      }
      const { data } = await q;
      return { data: data || [], planUsed: i };
    }

    // Overdue projects
    if (i === 'overdue_projects') {
      const { data } = await supabase
        .from('projects')
        .select('id, name, status, progress, end_date')
        .eq('workspace_id', workspaceId)
        .is('deleted_at', null)
        .lt('end_date', new Date().toISOString().slice(0,10))
        .neq('status', 'Completed')
        .limit(10);
      return { data: data || [], planUsed: i };
    }

    // Tasks
    if (i === 'list_tasks' || i === 'overdue_tasks' || i === 'urgent_tasks') {
      // get project ids in workspace
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('workspace_id', workspaceId)
        .is('deleted_at', null);
      const projectIds = (projects || []).map(p => p.id);
      let q = supabase
        .from('project_tasks')
        .select('id, name, status, priority, progress, end_date, project_id, updated_at')
        .in('project_id', projectIds)
        .limit(20);
      if (i === 'overdue_tasks') q = q.lt('end_date', new Date().toISOString().slice(0,10)).neq('status','Completed');
      if (i === 'urgent_tasks') q = q.eq('priority','Critical');
      const { data } = await q.order('updated_at', { ascending: false });
      return { data: data || [], planUsed: i };
    }

    // Resources
    if (i === 'list_resources' || i === 'available_resources' || i === 'busy_resources') {
      let q = supabase
        .from('resources')
        .select('id, name, role, availability, workspace_id')
        .eq('workspace_id', workspaceId)
        .limit(20);
      if (i === 'available_resources') {
        // heuristic: availability >= 50 as available
        q = q.gte('availability', 50);
      }
      if (i === 'busy_resources') {
        q = q.lt('availability', 30);
      }
      const { data } = await q;
      return { data: data || [], planUsed: i };
    }

    // Fallback: general projects/tasks quick search
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, status, progress')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .limit(5);
    return { data: projects || [], planUsed: 'general' };
  }
}


import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectIssue, IssueComment, IssueFilters, IssueMetrics } from '@/types/issue';
import { useToast } from '@/hooks/use-toast';

export const useIssueManagement = (projectId: string) => {
  const [issues, setIssues] = useState<ProjectIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<ProjectIssue[]>([]);
  const [metrics, setMetrics] = useState<IssueMetrics>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    overdue: 0,
    bySeverity: { low: 0, medium: 0, high: 0, critical: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<IssueFilters>({
    search: '',
    status: [],
    severity: [],
    priority: [],
    category: [],
    assignee: [],
    dateRange: {}
  });
  const { toast } = useToast();

  // Fetch issues with task and milestone names
  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_issues')
        .select(`
          *,
          project_tasks:linked_task_id (
            id,
            name,
            milestone_id
          ),
          milestones:linked_milestone_id (
            id,
            name
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedIssues: ProjectIssue[] = (data || []).map(issue => {
        const scheduleVariance = issue.resolved_at && issue.due_date
          ? Math.ceil((new Date(issue.resolved_at).getTime() - new Date(issue.due_date).getTime()) / (1000 * 60 * 60 * 24))
          : undefined;

        const timeToResolve = issue.resolved_at && issue.date_identified
          ? Math.ceil((new Date(issue.resolved_at).getTime() - new Date(issue.date_identified).getTime()) / (1000 * 60 * 60 * 24))
          : undefined;

        return {
          ...issue,
          category: issue.category as ProjectIssue['category'],
          severity: issue.severity as ProjectIssue['severity'],
          priority: issue.priority as ProjectIssue['priority'],
          status: issue.status as ProjectIssue['status'],
          attachments: (issue.attachments as any) || [],
          tags: issue.tags || [],
          task_name: issue.project_tasks?.name,
          milestone_name: issue.milestones?.name,
          schedule_variance_days: scheduleVariance,
          time_to_resolve_days: timeToResolve
        };
      });
      
      setIssues(mappedIssues);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast({ title: 'Error', description: 'Failed to fetch issues', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  // Get task details for milestone auto-population
  const getTaskDetails = useCallback(async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('id, name, milestone_id')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching task details:', error);
      return null;
    }
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...issues];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(issue => 
        issue.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        issue.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(issue => filters.status.includes(issue.status));
    }

    // Severity filter
    if (filters.severity.length > 0) {
      filtered = filtered.filter(issue => filters.severity.includes(issue.severity));
    }

    // Priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(issue => filters.priority.includes(issue.priority));
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(issue => filters.category.includes(issue.category));
    }

    setFilteredIssues(filtered);
  }, [issues, filters]);

  // Calculate metrics
  useEffect(() => {
    const newMetrics: IssueMetrics = {
      total: issues.length,
      open: issues.filter(i => i.status === 'Open').length,
      inProgress: issues.filter(i => i.status === 'In Progress').length,
      resolved: issues.filter(i => ['Resolved', 'Closed'].includes(i.status)).length,
      overdue: issues.filter(i => i.due_date && new Date(i.due_date) < new Date() && !['Resolved', 'Closed'].includes(i.status)).length,
      bySeverity: {
        low: issues.filter(i => i.severity === 'Low').length,
        medium: issues.filter(i => i.severity === 'Medium').length,
        high: issues.filter(i => i.severity === 'High').length,
        critical: issues.filter(i => i.severity === 'Critical').length
      }
    };
    setMetrics(newMetrics);
  }, [issues]);

  // Create issue
  const createIssue = async (issueData: Partial<ProjectIssue>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('project_issues')
        .insert({
          title: issueData.title!,
          description: issueData.description,
          category: issueData.category || 'Technical',
          severity: issueData.severity || 'Medium',
          priority: issueData.priority || 'Medium',
          status: issueData.status || 'Open',
          assignee_id: issueData.assignee_id === 'unassigned' ? null : issueData.assignee_id,
          linked_task_id: issueData.linked_task_id === 'none' ? null : issueData.linked_task_id,
          linked_milestone_id: issueData.linked_milestone_id === 'none' ? null : issueData.linked_milestone_id,
          date_identified: issueData.date_identified || new Date().toISOString().split('T')[0],
          due_date: issueData.due_date,
          source: issueData.source,
          tags: issueData.tags || [],
          attachments: issueData.attachments || [],
          impact_summary: issueData.impact_summary,
          suggested_resolver: issueData.suggested_resolver,
          suggested_action: issueData.suggested_action,
          estimated_delay_days: issueData.estimated_delay_days || 0,
          project_id: projectId,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      const mappedIssue: ProjectIssue = {
        ...data,
        category: data.category as ProjectIssue['category'],
        severity: data.severity as ProjectIssue['severity'],
        priority: data.priority as ProjectIssue['priority'],
        status: data.status as ProjectIssue['status'],
        attachments: (data.attachments as any) || [],
        tags: data.tags || []
      };
      
      setIssues(prev => [mappedIssue, ...prev]);
      toast({ title: 'Success', description: 'Issue created successfully' });
      return mappedIssue;
    } catch (error) {
      console.error('Error creating issue:', error);
      toast({ title: 'Error', description: 'Failed to create issue', variant: 'destructive' });
      throw error;
    }
  };

  // Update issue
  const updateIssue = async (issueId: string, updates: Partial<ProjectIssue>) => {
    try {
      // Set resolved_at when status changes to Resolved or Closed
      if (updates.status && ['Resolved', 'Closed'].includes(updates.status)) {
        updates.resolved_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('project_issues')
        .update(updates)
        .eq('id', issueId)
        .select()
        .single();

      if (error) throw error;
      
      const mappedIssue: ProjectIssue = {
        ...data,
        category: data.category as ProjectIssue['category'],
        severity: data.severity as ProjectIssue['severity'],
        priority: data.priority as ProjectIssue['priority'],
        status: data.status as ProjectIssue['status'],
        attachments: (data.attachments as any) || [],
        tags: data.tags || []
      };
      
      setIssues(prev => prev.map(issue => issue.id === issueId ? mappedIssue : issue));
      toast({ title: 'Success', description: 'Issue updated successfully' });
      return mappedIssue;
    } catch (error) {
      console.error('Error updating issue:', error);
      toast({ title: 'Error', description: 'Failed to update issue', variant: 'destructive' });
      throw error;
    }
  };

  // Delete issue
  const deleteIssue = async (issueId: string) => {
    try {
      const { error } = await supabase
        .from('project_issues')
        .delete()
        .eq('id', issueId);

      if (error) throw error;
      
      setIssues(prev => prev.filter(issue => issue.id !== issueId));
      toast({ title: 'Success', description: 'Issue deleted successfully' });
    } catch (error) {
      console.error('Error deleting issue:', error);
      toast({ title: 'Error', description: 'Failed to delete issue', variant: 'destructive' });
      throw error;
    }
  };

  // Generate AI insights
  const generateAIInsights = useCallback(async (issue: ProjectIssue) => {
    try {
      // Fetch related tasks and resources for analysis
      const { data: tasks } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId);

      const { data: resources } = await supabase
        .from('resources')
        .select('*');

      // Simple AI logic for suggestions
      let suggestedResolver = '';
      let suggestedAction = '';
      let impactSummary = '';
      let estimatedDelay = 0;

      // Find best resolver based on linked task
      if (issue.linked_task_id && tasks && resources) {
        const linkedTask = tasks.find(t => t.id === issue.linked_task_id);
        if (linkedTask) {
          impactSummary = `Affects task: ${linkedTask.name}`;
          
          // Check if task is on critical path or has dependencies
          const dependentTasks = tasks.filter(t => 
            t.dependencies?.some(dep => dep.includes(linkedTask.id))
          );
          
          if (dependentTasks.length > 0) {
            impactSummary += ` - May delay ${dependentTasks.length} dependent task(s)`;
            estimatedDelay = issue.severity === 'Critical' ? 5 : issue.severity === 'High' ? 3 : 1;
          }

          // Find assigned resources
          if (linkedTask.assigned_resources?.length > 0) {
            const assignedResource = resources.find(r => 
              linkedTask.assigned_resources.includes(r.id)
            );
            if (assignedResource) {
              suggestedResolver = assignedResource.name;
            }
          }
        }
      }

      // Suggest actions based on category and severity
      if (issue.category === 'Technical') {
        suggestedAction = issue.severity === 'Critical' 
          ? 'Immediate escalation to technical lead required'
          : 'Assign to senior developer for investigation';
      } else if (issue.category === 'Client') {
        suggestedAction = 'Schedule client meeting to discuss resolution';
      } else if (issue.category === 'Resource') {
        suggestedAction = 'Review resource allocation and adjust timeline';
      }

      return {
        impact_summary: impactSummary || 'Impact analysis pending',
        suggested_resolver: suggestedResolver || 'To be assigned',
        suggested_action: suggestedAction || 'Awaiting assessment',
        estimated_delay_days: estimatedDelay
      };
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return {
        impact_summary: 'Impact analysis failed',
        suggested_resolver: 'Manual assignment required',
        suggested_action: 'Manual assessment required',
        estimated_delay_days: 0
      };
    }
  }, [projectId]);

  // Initialize
  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  return {
    issues: filteredIssues,
    allIssues: issues,
    metrics,
    loading,
    filters,
    setFilters,
    createIssue,
    updateIssue,
    deleteIssue,
    generateAIInsights,
    getTaskDetails,
    refetch: fetchIssues
  };
};

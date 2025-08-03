import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  ProjectData, 
  ProjectEvent, 
  ProjectEventPayload, 
  ProjectStatusType, 
  ProjectStatus,
  determineProjectStatus,
  isActiveProject,
  canTransitionTo,
  getAvailableTransitions,
  mapToLegacyStatus
} from '@/types/project';

export function useProjectStatus() {
  
  const updateProjectStatus = useCallback(async (
    projectId: string, 
    event: ProjectEvent, 
    metadata?: Record<string, any>,
    adminOverrideStatus?: ProjectStatusType
  ) => {
    try {
      // First, get the current project data with AI data
      const { data: projectData, error: fetchError } = await supabase
        .from('projects')
        .select('*, project_tasks(*), project_ai_data(*)')
        .eq('id', projectId)
        .single();

      if (fetchError || !projectData) {
        console.error('Error fetching project for status update:', fetchError);
        return;
      }

      // Convert database project to ProjectData format
      const project: ProjectData = {
        id: projectData.id,
        name: projectData.name,
        description: projectData.description || '',
        status: projectData.status as any,
        priority: projectData.priority as any,
        progress: projectData.progress || 0,
        health: { status: 'green', score: 100 }, // Default health
        startDate: projectData.start_date || '',
        endDate: projectData.end_date || '',
        teamSize: projectData.team_size || 0,
        budget: projectData.budget || '',
        tags: projectData.tags || [],
        workspaceId: projectData.workspace_id || '',
        resources: projectData.resources || [],
        stakeholders: projectData.stakeholder_ids || [],
        tasks: (projectData.project_tasks || []).map((task: any) => ({
          id: task.id,
          name: task.name,
          description: task.description || '',
          startDate: task.start_date || '',
          endDate: task.end_date || '',
          baselineStartDate: task.baseline_start_date || task.start_date || '',
          baselineEndDate: task.baseline_end_date || task.end_date || '',
          progress: task.progress || 0,
          assignedResources: task.assigned_resources || [],
          assignedStakeholders: task.assigned_stakeholders || [],
          dependencies: task.dependencies || [],
          priority: task.priority || 'Medium',
          status: task.status || 'Not Started',
          milestoneId: task.milestone_id,
          duration: task.duration || 1,
          parentTaskId: task.parent_task_id,
          hierarchyLevel: task.hierarchy_level || 0,
          sortOrder: task.sort_order || 0,
          manualOverrideDates: task.manual_override_dates || false
        })),
        milestones: [],
        aiGenerated: {
          projectPlan: projectData.project_ai_data?.[0]?.project_plan || '',
          riskAssessment: projectData.project_ai_data?.[0]?.risk_assessment || '',
          recommendations: projectData.project_ai_data?.[0]?.recommendations || []
        }
      };

      let newStatus: ProjectStatusType;

      if (event === 'admin_override' && adminOverrideStatus) {
        newStatus = adminOverrideStatus;
      } else {
        // Determine new status based on event and current project state
        newStatus = determineProjectStatus(project);
      }

      // Update the project status in the database
      const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (updateError) {
        console.error('Error updating project status:', updateError);
        toast.error('Failed to update project status');
        return;
      }

      // Log the status change event
      await supabase
        .from('audit_logs')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          action: 'project_status_updated',
          resource_type: 'project',
          resource_id: projectId,
          metadata: {
            event,
            newStatus,
            previousStatus: project.status,
            ...metadata
          }
        });

      toast.success(`Project status updated to ${newStatus}`);
      
    } catch (error) {
      console.error('Error in updateProjectStatus:', error);
      toast.error('Failed to update project status');
    }
  }, []);

  const triggerStatusEvent = useCallback(async (payload: ProjectEventPayload) => {
    await updateProjectStatus(
      payload.projectId, 
      payload.event, 
      payload.metadata, 
      payload.adminOverrideStatus
    );
  }, [updateProjectStatus]);

  // Event handlers for specific project events
  const onWizardComplete = useCallback(async (projectId: string) => {
    await triggerStatusEvent({ projectId, event: 'wizard_completed' });
  }, [triggerStatusEvent]);

  const onProjectPlanCreated = useCallback(async (projectId: string) => {
    await triggerStatusEvent({ projectId, event: 'project_plan_created' });
  }, [triggerStatusEvent]);

  const onTaskAssigned = useCallback(async (projectId: string) => {
    await triggerStatusEvent({ projectId, event: 'all_tasks_assigned' });
  }, [triggerStatusEvent]);

  const onTaskCompleted = useCallback(async (projectId: string) => {
    await triggerStatusEvent({ projectId, event: 'first_task_completed' });
  }, [triggerStatusEvent]);

  const onAllTasksCompleted = useCallback(async (projectId: string) => {
    await triggerStatusEvent({ projectId, event: 'all_tasks_completed' });
  }, [triggerStatusEvent]);

  return {
    updateProjectStatus,
    triggerStatusEvent,
    determineProjectStatus,
    isActiveProject,
    canTransitionTo,
    getAvailableTransitions,
    mapToLegacyStatus,
    // Event handlers
    onWizardComplete,
    onProjectPlanCreated,
    onTaskAssigned,
    onTaskCompleted,
    onAllTasksCompleted
  };
}
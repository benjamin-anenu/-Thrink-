import { supabase } from '@/integrations/supabase/client';
import { ProjectData } from '@/types/project';
import { ProjectHealthService } from './ProjectHealthService';
import { ProjectDateService } from './ProjectDateService';
import { calculateRealTimeProjectProgress } from '@/utils/phaseCalculations';

/**
 * Centralized service for loading and transforming project data
 * Ensures consistent data format across all views
 */
export class ProjectDataService {
  /**
   * Load project with enhanced real-time data
   * Single source for project data transformation
   */
  static async getEnhancedProject(projectId: string): Promise<ProjectData | null> {
    try {
      // Fetch all project related data in parallel
      const [projectResult, tasksResult, milestonesResult, phasesResult] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('project_tasks').select('*').eq('project_id', projectId),
        supabase.from('milestones').select('*').eq('project_id', projectId),
        supabase.from('phases').select('*').eq('project_id', projectId)
      ]);

      if (projectResult.error || !projectResult.data) {
        console.error('Error fetching project:', projectResult.error);
        return null;
      }

      const project = projectResult.data;
      const tasks = tasksResult.data || [];
      const milestones = milestonesResult.data || [];
      const phases = phasesResult.data || [];

      // Calculate real-time health and progress
      const [healthData, progress] = await Promise.all([
        ProjectHealthService.calculateRealTimeProjectHealth(projectId),
        calculateRealTimeProjectProgress(projectId)
      ]);

      // Transform to ProjectData format with enhanced data
      const enhancedProject: ProjectData = {
        id: project.id,
        name: project.name,
        description: project.description || '',
        status: project.status as any,
        priority: (project.priority || 'Medium') as any,
        progress,
        health: {
          status: healthData.healthStatus,
          score: healthData.healthScore
        },
        startDate: project.start_date,
        endDate: project.end_date,
        computed_start_date: project.computed_start_date,
        computed_end_date: project.computed_end_date,
        teamSize: project.team_size || 0,
        budget: project.budget || '0',
        tags: project.tags || [],
        workspaceId: project.workspace_id,
        resources: project.resources || [],
        stakeholders: project.stakeholder_ids || [],
        phases: phases.map(phase => ({
          id: phase.id,
          projectId: phase.project_id,
          name: phase.name,
          description: phase.description,
          startDate: phase.start_date,
          endDate: phase.end_date,
          baselineStartDate: phase.baseline_start_date,
          baselineEndDate: phase.baseline_end_date,
          status: phase.status as any,
          priority: phase.priority as any,
          progress: phase.progress || 0,
          sortOrder: phase.sort_order || 0,
          color: phase.color,
          computedStartDate: phase.computed_start_date,
          computedEndDate: phase.computed_end_date
        })),
        milestones: milestones.map(milestone => ({
          id: milestone.id,
          name: milestone.name,
          description: milestone.description || '',
          date: milestone.due_date || '',
          baselineDate: milestone.baseline_date || '',
          status: (milestone.status || 'upcoming') as any,
          tasks: milestone.task_ids || [],
          progress: milestone.progress || 0,
          phaseId: milestone.phase_id,
          sortOrderInPhase: milestone.sort_order_in_phase
        })),
        tasks: tasks.map(task => ({
          id: task.id,
          name: task.name,
          description: task.description || '',
          startDate: task.start_date || '',
          endDate: task.end_date || '',
          baselineStartDate: task.baseline_start_date || '',
          baselineEndDate: task.baseline_end_date || '',
          progress: task.progress || 0,
          assignedResources: task.assigned_resources || [],
          assignedStakeholders: task.assigned_stakeholders || [],
          dependencies: task.dependencies || [],
          priority: (task.priority || 'Medium') as any,
          status: (task.status || 'Not Started') as any,
          milestoneId: task.milestone_id,
          duration: task.duration || 1,
          parentTaskId: task.parent_task_id,
          hierarchyLevel: task.hierarchy_level || 0,
          sortOrder: task.sort_order || 0,
          manualOverrideDates: task.manual_override_dates || false
        })),
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        createdBy: project.created_by
      };

      return enhancedProject;
    } catch (error) {
      console.error('Error loading enhanced project:', error);
      return null;
    }
  }

  /**
   * Load multiple projects with enhanced data
   */
  static async getEnhancedProjects(workspaceId: string): Promise<ProjectData[]> {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false });

      if (error || !projects) {
        console.error('Error fetching projects:', error);
        return [];
      }

      // Load enhanced data for all projects in parallel
      const enhancedProjects = await Promise.all(
        projects.map(project => this.getEnhancedProject(project.id))
      );

      return enhancedProjects.filter(project => project !== null) as ProjectData[];
    } catch (error) {
      console.error('Error loading enhanced projects:', error);
      return [];
    }
  }

  /**
   * Get project summary data for list/grid views (lighter weight)
   */
  static async getProjectSummaries(workspaceId: string): Promise<ProjectData[]> {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_tasks!inner(count),
          milestones(count)
        `)
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false });

      if (error || !projects) {
        console.error('Error fetching project summaries:', error);
        return [];
      }

      // Transform with real-time health and progress
      const summaries = await Promise.all(
        projects.map(async (project) => {
          const [healthData, progress] = await Promise.all([
            ProjectHealthService.calculateRealTimeProjectHealth(project.id),
            calculateRealTimeProjectProgress(project.id)
          ]);

          return {
            id: project.id,
            name: project.name,
            description: project.description || '',
            status: project.status as any,
            priority: (project.priority || 'Medium') as any,
            progress,
            health: {
              status: healthData.healthStatus,
              score: healthData.healthScore
            },
            startDate: project.start_date,
            endDate: project.end_date,
            computed_start_date: project.computed_start_date,
            computed_end_date: project.computed_end_date,
            teamSize: project.team_size || 0,
            budget: project.budget || '0',
            tags: project.tags || [],
            workspaceId: project.workspace_id,
            resources: project.resources || [],
            stakeholders: project.stakeholder_ids || [],
            milestones: [],
            tasks: [],
            createdAt: project.created_at,
            updatedAt: project.updated_at,
            createdBy: project.created_by
          } as ProjectData;
        })
      );

      return summaries;
    } catch (error) {
      console.error('Error loading project summaries:', error);
      return [];
    }
  }

  /**
   * Refresh computed dates for a project
   */
  static async refreshProjectComputedDates(projectId: string): Promise<boolean> {
    try {
      // This would typically call the phase calculation functions
      // to update computed_start_date and computed_end_date
      const { data: phases } = await supabase
        .from('phases')
        .select('computed_start_date, computed_end_date')
        .eq('project_id', projectId)
        .order('sort_order');

      if (phases && phases.length > 0) {
        const startDates = phases.map(p => p.computed_start_date).filter(Boolean);
        const endDates = phases.map(p => p.computed_end_date).filter(Boolean);

        if (startDates.length > 0 && endDates.length > 0) {
          const earliestStart = startDates.sort()[0];
          const latestEnd = endDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

          return await ProjectDateService.updateComputedDates(projectId, earliestStart, latestEnd);
        }
      }

      return true;
    } catch (error) {
      console.error('Error refreshing computed dates:', error);
      return false;
    }
  }
}
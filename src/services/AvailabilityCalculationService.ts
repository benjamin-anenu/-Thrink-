import { supabase } from '@/integrations/supabase/client';

export interface ResourceAvailability {
  resourceId: string;
  resourceName: string;
  baseAvailability: number;
  currentUtilization: number;
  calculatedAvailability: number;
  status: 'Available' | 'Busy' | 'Overallocated';
  assignedTasks: string[];
  totalAssignedHours: number;
  standardCapacity: number;
}

export class AvailabilityCalculationService {
  private static readonly STANDARD_CAPACITY = 160; // 4 weeks * 40 hours
  private static readonly HOURS_PER_DAY = 8;

  /**
   * Calculate real availability for a single resource
   */
  static async calculateResourceAvailability(
    resourceId: string, 
    workspaceId?: string
  ): Promise<ResourceAvailability | null> {
    try {
      // Get resource data
      const { data: resource, error: resourceError } = await supabase
        .from('resources')
        .select('*')
        .eq('id', resourceId)
        .single();

      if (resourceError || !resource) {
        console.error('Error fetching resource:', resourceError);
        return null;
      }

      // Get all tasks assigned to this resource
      const { data: assignedTasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select(`
          id,
          name,
          duration,
          status,
          assigned_resources,
          assignee_id,
          project_id,
          projects!inner(workspace_id)
        `)
        .or(`assigned_resources.cs.{${resourceId}},assignee_id.eq.${resourceId}`)
        .eq('projects.workspace_id', workspaceId || resource.workspace_id);

      if (tasksError) {
        console.error('Error fetching assigned tasks:', tasksError);
        return null;
      }

      // Calculate utilization from assigned tasks
      const utilizationData = this.calculateUtilizationFromTasks(assignedTasks || [], resourceId);
      
      // Calculate availability (resources table doesn't have availability column, default to 100)
      const baseAvailability = 100;
      const calculatedAvailability = Math.max(0, baseAvailability - utilizationData.utilization);
      
      // Determine status
      const status = this.determineResourceStatus(utilizationData.utilization);

      return {
        resourceId: resource.id,
        resourceName: resource.name,
        baseAvailability,
        currentUtilization: utilizationData.utilization,
        calculatedAvailability: Math.round(calculatedAvailability),
        status,
        assignedTasks: assignedTasks?.map(task => task.name) || [],
        totalAssignedHours: utilizationData.totalHours,
        standardCapacity: this.STANDARD_CAPACITY
      };
    } catch (error) {
      console.error('Error calculating resource availability:', error);
      return null;
    }
  }

  /**
   * Calculate availability for all resources in a workspace
   */
  static async calculateWorkspaceAvailability(workspaceId: string): Promise<ResourceAvailability[]> {
    try {
      // Get all resources in the workspace
      const { data: resources, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (resourcesError || !resources) {
        console.error('Error fetching workspace resources:', resourcesError);
        return [];
      }

      // Calculate availability for each resource
      const availabilityPromises = resources.map(resource => 
        this.calculateResourceAvailability(resource.id, workspaceId)
      );

      const availabilityResults = await Promise.all(availabilityPromises);
      return availabilityResults.filter(Boolean) as ResourceAvailability[];
    } catch (error) {
      console.error('Error calculating workspace availability:', error);
      return [];
    }
  }

  /**
   * Calculate availability for resources assigned to a specific project
   */
  static async calculateProjectAvailability(projectId: string): Promise<ResourceAvailability[]> {
    try {
      // Get project data
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('workspace_id')
        .eq('id', projectId)
        .single();

      if (projectError || !project) {
        console.error('Error fetching project:', projectError);
        return [];
      }

      // Get all tasks for this project
      const { data: projectTasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId);

      if (tasksError) {
        console.error('Error fetching project tasks:', tasksError);
        return [];
      }

      // Get unique resource IDs from task assignments
      const resourceIds = new Set<string>();
      projectTasks?.forEach(task => {
        if (task.assigned_resources) {
          task.assigned_resources.forEach((resourceId: string) => resourceIds.add(resourceId));
        }
      });

      // Calculate availability for each resource
      const availabilityPromises = Array.from(resourceIds).map(resourceId => 
        this.calculateResourceAvailability(resourceId, project.workspace_id)
      );

      const availabilityResults = await Promise.all(availabilityPromises);
      return availabilityResults.filter(Boolean) as ResourceAvailability[];
    } catch (error) {
      console.error('Error calculating project availability:', error);
      return [];
    }
  }

  /**
   * Calculate utilization from task assignments
   */
  private static calculateUtilizationFromTasks(tasks: any[], resourceId: string) {
    let totalAssignedHours = 0;

    tasks.forEach(task => {
      // Check if this resource is assigned to this task
      const isAssigned = 
        task.assigned_resources?.includes(resourceId);

      if (!isAssigned) return;

      // Skip completed tasks for current utilization
      if (task.status === 'Completed') return;

      const duration = task.duration || 1;
      const taskHours = duration * this.HOURS_PER_DAY;
      
      // Apply utilization factor based on task status
      const utilizationFactor = task.status === 'On Hold' ? 0.5 : 1.0;
      totalAssignedHours += taskHours * utilizationFactor;
    });

    // Calculate utilization percentage
    const utilization = Math.min(100, Math.round((totalAssignedHours / this.STANDARD_CAPACITY) * 100));
    
    return {
      utilization: Math.max(0, utilization),
      totalHours: totalAssignedHours
    };
  }

  /**
   * Determine resource status based on utilization
   */
  private static determineResourceStatus(utilization: number): 'Available' | 'Busy' | 'Overallocated' {
    if (utilization > 100) return 'Overallocated';
    if (utilization > 80) return 'Busy';
    return 'Available';
  }

  /**
   * Update resource availability in the database
   */
  static async updateResourceAvailability(resourceId: string, availability: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ 
          availability,
          updated_at: new Date().toISOString()
        })
        .eq('id', resourceId);

      if (error) {
        console.error('Error updating resource availability:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating resource availability:', error);
      return false;
    }
  }

  /**
   * Get availability statistics for a workspace
   */
  static async getWorkspaceAvailabilityStats(workspaceId: string) {
    const availabilities = await this.calculateWorkspaceAvailability(workspaceId);
    
    const totalResources = availabilities.length;
    const availableResources = availabilities.filter(r => r.status === 'Available').length;
    const busyResources = availabilities.filter(r => r.status === 'Busy').length;
    const overallocatedResources = availabilities.filter(r => r.status === 'Overallocated').length;
    
    const avgUtilization = totalResources > 0 
      ? availabilities.reduce((acc, r) => acc + r.currentUtilization, 0) / totalResources
      : 0;

    const avgAvailability = totalResources > 0
      ? availabilities.reduce((acc, r) => acc + r.calculatedAvailability, 0) / totalResources
      : 100;

    return {
      totalResources,
      availableResources,
      busyResources,
      overallocatedResources,
      avgUtilization: Math.round(avgUtilization),
      avgAvailability: Math.round(avgAvailability)
    };
  }
} 
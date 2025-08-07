import { supabase } from '@/integrations/supabase/client';
import { ProjectData } from '@/types/project';

/**
 * Single source of truth for project timeline calculations
 * Prioritizes computed dates over manual dates for consistency
 */
export class ProjectDateService {
  /**
   * Get the display dates for a project with proper prioritization
   * Priority: computed_start_date/computed_end_date → start_date/end_date → 'Not set'
   */
  static getProjectDisplayDates(project: ProjectData): {
    startDisplay: string;
    endDisplay: string;
    startDate: string | null;
    endDate: string | null;
  } {
    const startDate = project.computed_start_date || project.startDate || null;
    const endDate = project.computed_end_date || project.endDate || null;
    
    const startDisplay = startDate ? 
      new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
      'Not set';
    
    const endDisplay = endDate ? 
      new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
      'Not set';
    
    return {
      startDisplay,
      endDisplay,
      startDate,
      endDate
    };
  }

  /**
   * Get the full date format for a project
   */
  static getProjectFullDates(project: ProjectData): {
    startDateFull: string;
    endDateFull: string;
    startDate: string | null;
    endDate: string | null;
  } {
    const startDate = project.computed_start_date || project.startDate || null;
    const endDate = project.computed_end_date || project.endDate || null;
    
    const startDateFull = startDate ? 
      new Date(startDate).toLocaleDateString() : 
      'Not set';
    
    const endDateFull = endDate ? 
      new Date(endDate).toLocaleDateString() : 
      'Not set';
    
    return {
      startDateFull,
      endDateFull,
      startDate,
      endDate
    };
  }

  /**
   * Get timeline duration in days
   */
  static getProjectDuration(project: ProjectData): number | null {
    const { startDate, endDate } = this.getProjectDisplayDates(project);
    
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if project timeline is overdue
   */
  static isProjectOverdue(project: ProjectData): boolean {
    const { endDate } = this.getProjectDisplayDates(project);
    
    if (!endDate) return false;
    
    const today = new Date();
    const projectEndDate = new Date(endDate);
    
    return projectEndDate < today;
  }

  /**
   * Get days until project deadline
   */
  static getDaysUntilDeadline(project: ProjectData): number | null {
    const { endDate } = this.getProjectDisplayDates(project);
    
    if (!endDate) return null;
    
    const today = new Date();
    const projectEndDate = new Date(endDate);
    
    return Math.ceil((projectEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Format timeline range for display
   */
  static formatTimelineRange(project: ProjectData): string {
    const { startDisplay, endDisplay } = this.getProjectDisplayDates(project);
    return `${startDisplay} - ${endDisplay}`;
  }

  /**
   * Get timeline status (not-started, active, overdue, completed)
   */
  static getTimelineStatus(project: ProjectData): 'not-started' | 'active' | 'overdue' | 'completed' {
    const { startDate, endDate } = this.getProjectDisplayDates(project);
    const today = new Date();
    
    if (!startDate) return 'not-started';
    
    const projectStartDate = new Date(startDate);
    const projectEndDate = endDate ? new Date(endDate) : null;
    
    // Not started yet
    if (projectStartDate > today) return 'not-started';
    
    // Check if project is completed based on status
    if (project.status === 'Closure' || project.status === 'Completed') return 'completed';
    
    // Check if overdue
    if (projectEndDate && projectEndDate < today) return 'overdue';
    
    return 'active';
  }

  /**
   * Update computed dates for a project
   */
  static async updateComputedDates(projectId: string, computedStartDate: string, computedEndDate: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          computed_start_date: computedStartDate,
          computed_end_date: computedEndDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        console.error('Error updating computed dates:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating computed dates:', error);
      return false;
    }
  }
}
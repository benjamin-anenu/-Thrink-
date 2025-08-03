import { supabase } from '@/integrations/supabase/client';
import type { Entity } from './EntityExtractor';

export interface QuickResponse {
  content: string;
  confidence: number;
  dataCount: number;
  processingTime: number;
}

export class QuickResponseGenerator {
  async generateQuickResponse(
    intent: string,
    entities: Entity[],
    workspaceId: string
  ): Promise<QuickResponse> {
    const startTime = Date.now();
    
    try {
      const data = await this.fetchRelevantData(intent, entities, workspaceId);
      const content = this.formatQuickResponse(intent, data, entities);
      const processingTime = Date.now() - startTime;

      return {
        content,
        confidence: 0.85,
        dataCount: data.length,
        processingTime
      };
    } catch (error) {
      console.error('Quick response generation failed:', error);
      throw error;
    }
  }

  private async fetchRelevantData(intent: string, entities: Entity[], workspaceId: string): Promise<any[]> {
    try {
      switch (intent) {
        case 'project_status':
          return await this.fetchProjectStatus(workspaceId);
        case 'deadlines':
          return await this.fetchDeadlines(workspaceId);
        case 'task_status':
          return await this.fetchTaskStatus(workspaceId);
        case 'team_performance':
          return await this.fetchTeamPerformance(workspaceId);
        default:
          return await this.fetchProjectStatus(workspaceId);
      }
    } catch (error) {
      console.error('Data fetching error:', error);
      return [];
    }
  }

  private async fetchProjectStatus(workspaceId: string): Promise<any[]> {
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, status, progress, start_date, end_date, created_at')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (projectsError) throw projectsError;

    // Get task counts for each project
    const projectsWithTasks = await Promise.all(
      (projects || []).map(async (project) => {
        const { data: tasks } = await supabase
          .from('project_tasks')
          .select('id, status')
          .eq('project_id', project.id);
        
        return {
          ...project,
          total_tasks: tasks?.length || 0,
          completed_tasks: tasks?.filter(task => task.status === 'Completed').length || 0
        };
      })
    );

    return projectsWithTasks;
  }

  private async fetchDeadlines(workspaceId: string): Promise<any[]> {
    // First get projects in workspace
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null);

    if (!projects || projects.length === 0) return [];

    const projectIds = projects.map(p => p.id);
    
    const { data: tasks, error } = await supabase
      .from('project_tasks')
      .select('id, name, end_date, status, priority, project_id')
      .in('project_id', projectIds)
      .not('end_date', 'is', null)
      .gte('end_date', new Date().toISOString().split('T')[0])
      .neq('status', 'Completed')
      .order('end_date', { ascending: true })
      .limit(10);

    if (error) throw error;
    
    return (tasks || []).map(task => {
      const project = projects.find(p => p.id === task.project_id);
      return {
        ...task,
        project_name: project?.name || 'Unknown Project'
      };
    });
  }

  private async fetchTaskStatus(workspaceId: string): Promise<any[]> {
    // First get projects in workspace
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null);

    if (!projects || projects.length === 0) return [];

    const projectIds = projects.map(p => p.id);
    
    const { data: tasks, error } = await supabase
      .from('project_tasks')
      .select('id, name, status, progress, priority, updated_at, project_id')
      .in('project_id', projectIds)
      .order('updated_at', { ascending: false })
      .limit(8);

    if (error) throw error;
    
    return (tasks || []).map(task => {
      const project = projects.find(p => p.id === task.project_id);
      return {
        ...task,
        project_name: project?.name || 'Unknown Project'
      };
    });
  }

  private async fetchTeamPerformance(workspaceId: string): Promise<any[]> {
    const { data: resources, error } = await supabase
      .from('resources')
      .select('id, name, role')
      .eq('workspace_id', workspaceId)
      .limit(8);

    if (error) {
      console.error('Team performance fetch error:', error);
      return [];
    }
    if (!resources) return [];
    
    // Add mock utilization and task count for now
    const results: any[] = [];
    for (const resource of resources) {
      results.push({
        id: resource.id,
        name: resource.name,
        role: resource.role,
        utilization: Math.floor(Math.random() * 100), // Mock data
        assigned_tasks: Math.floor(Math.random() * 10) // Mock data
      });
    }
    
    return results;
  }

  private formatQuickResponse(intent: string, data: any[], entities: Entity[]): string {
    const formatters = {
      project_status: this.formatProjectStatus,
      deadlines: this.formatDeadlines,
      task_status: this.formatTaskStatus,
      team_performance: this.formatTeamPerformance
    };

    const formatter = formatters[intent] || this.formatGeneric;
    return formatter.call(this, data, entities);
  }

  private formatProjectStatus(data: any[], entities: Entity[]): string {
    if (data.length === 0) {
      return "📊 **Project Status Overview**\n\nNo active projects found in your workspace.";
    }

    let response = "📊 **Project Status Overview**\n\n";

    for (const project of data.slice(0, 3)) {
      const progressBar = this.createProgressBar(project.progress || 0);
      const statusIcon = this.getStatusIcon(project.status);
      
      response += `**${project.name}** ${statusIcon}\n`;
      response += `Status: ${project.status} | Progress: ${progressBar} ${project.progress || 0}%\n`;
      response += `Tasks: ${project.completed_tasks}/${project.total_tasks} completed\n\n`;
    }

    return response;
  }

  private formatDeadlines(data: any[], entities: Entity[]): string {
    if (data.length === 0) {
      return "⏰ **Upcoming Deadlines**\n\nNo upcoming deadlines found.";
    }

    let response = "⏰ **Upcoming Deadlines**\n\n";

    for (const task of data.slice(0, 5)) {
      const daysUntil = this.calculateDaysUntil(task.end_date);
      const priorityIcon = this.getPriorityIcon(task.priority);
      
      response += `**${task.name}** ${priorityIcon}\n`;
      response += `Project: ${task.project_name}\n`;
      response += `Due: ${this.formatDate(task.end_date)} (${daysUntil})\n\n`;
    }

    return response;
  }

  private formatTaskStatus(data: any[], entities: Entity[]): string {
    if (data.length === 0) {
      return "📋 **Task Status**\n\nNo tasks found.";
    }

    let response = "📋 **Recent Tasks**\n\n";
    const statusGroups = this.groupByStatus(data);

    Object.entries(statusGroups).forEach(([status, tasks]) => {
      if (tasks.length > 0) {
        response += `**${status}** (${tasks.length})\n`;
        tasks.slice(0, 3).forEach(task => {
          response += `• ${task.name} - ${task.project_name}\n`;
        });
        response += '\n';
      }
    });

    return response;
  }

  private formatTeamPerformance(data: any[], entities: Entity[]): string {
    if (data.length === 0) {
      return "👥 **Team Performance**\n\nNo team members found.";
    }

    let response = "👥 **Team Performance**\n\n";

    for (const member of data.slice(0, 5)) {
      const utilizationBar = this.createProgressBar(member.utilization || 0);
      
      response += `**${member.name}** (${member.role})\n`;
      response += `Utilization: ${utilizationBar} ${member.utilization || 0}%\n`;
      response += `Assigned Tasks: ${member.assigned_tasks}\n\n`;
    }

    return response;
  }

  private formatGeneric(data: any[], entities: Entity[]): string {
    return `Found ${data.length} results for your query.`;
  }

  private createProgressBar(percentage: number): string {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return `${'█'.repeat(filled)}${'░'.repeat(empty)}`;
  }

  private getStatusIcon(status: string): string {
    const icons = {
      'completed': '✅',
      'in progress': '🔄',
      'pending': '⏳',
      'blocked': '🚫',
      'on hold': '⏸️'
    };
    return icons[status?.toLowerCase()] || '📋';
  }

  private getPriorityIcon(priority: string): string {
    const icons = {
      'high': '🔴',
      'medium': '🟡',
      'low': '🟢'
    };
    return icons[priority?.toLowerCase()] || '⚪';
  }

  private calculateDaysUntil(date: string): string {
    const days = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  }

  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  private groupByStatus(tasks: any[]): Record<string, any[]> {
    return tasks.reduce((groups, task) => {
      const status = task.status || 'Unknown';
      if (!groups[status]) groups[status] = [];
      groups[status].push(task);
      return groups;
    }, {});
  }
}
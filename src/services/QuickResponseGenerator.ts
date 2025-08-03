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
    const queries = {
      project_status: `
        SELECT p.id, p.name, p.status, p.progress, p.start_date, p.end_date,
               COUNT(pt.id) as total_tasks,
               COUNT(CASE WHEN pt.status = 'Completed' THEN 1 END) as completed_tasks
        FROM projects p
        LEFT JOIN project_tasks pt ON p.id = pt.project_id
        WHERE p.workspace_id = $1
        GROUP BY p.id, p.name, p.status, p.progress, p.start_date, p.end_date
        ORDER BY p.created_at DESC
        LIMIT 5
      `,
      deadlines: `
        SELECT pt.id, pt.name, pt.end_date, pt.status, pt.priority,
               p.name as project_name
        FROM project_tasks pt
        LEFT JOIN projects p ON pt.project_id = p.id
        WHERE p.workspace_id = $1 
          AND pt.end_date >= CURRENT_DATE
          AND pt.status != 'Completed'
        ORDER BY pt.end_date ASC
        LIMIT 10
      `,
      task_status: `
        SELECT pt.id, pt.name, pt.status, pt.progress, pt.priority,
               p.name as project_name
        FROM project_tasks pt
        LEFT JOIN projects p ON pt.project_id = p.id
        WHERE p.workspace_id = $1
        ORDER BY pt.updated_at DESC
        LIMIT 8
      `,
      team_performance: `
        SELECT r.id, r.name, r.role, r.utilization, r.status,
               COUNT(pt.id) as assigned_tasks
        FROM resources r
        LEFT JOIN project_tasks pt ON r.id = ANY(pt.assigned_resources)
        WHERE r.workspace_id = $1 AND r.status = 'active'
        GROUP BY r.id, r.name, r.role, r.utilization, r.status
        ORDER BY r.utilization DESC
        LIMIT 8
      `
    };

    const query = queries[intent] || queries.project_status;
    const { data, error } = await supabase.rpc('execute_sql', { query });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
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
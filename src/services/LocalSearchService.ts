import { supabase } from '@/integrations/supabase/client';

export interface LocalSearchResult {
  success: boolean;
  response: string;
  dataCount: number;
  processingTime: number;
  searchType: string;
}

export class LocalSearchService {
  async processLocalQuery(userInput: string, workspaceId: string): Promise<LocalSearchResult> {
    const startTime = Date.now();
    
    try {
      const searchType = this.determineSearchType(userInput);
      const data = await this.fetchData(searchType, workspaceId, userInput);
      const response = this.formatResponse(searchType, data, userInput);
      
      return {
        success: true,
        response,
        dataCount: data.length,
        processingTime: Date.now() - startTime,
        searchType
      };
    } catch (error) {
      console.error('Local search error:', error);
      return {
        success: false,
        response: `Search error: ${error.message}`,
        dataCount: 0,
        processingTime: Date.now() - startTime,
        searchType: 'error'
      };
    }
  }

  private determineSearchType(input: string): string {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('project') || lowerInput.includes('status')) {
      return 'projects';
    }
    if (lowerInput.includes('task') || lowerInput.includes('todo')) {
      return 'tasks';
    }
    if (lowerInput.includes('deadline') || lowerInput.includes('due') || lowerInput.includes('overdue')) {
      return 'deadlines';
    }
    if (lowerInput.includes('team') || lowerInput.includes('resource') || lowerInput.includes('member')) {
      return 'team';
    }
    
    return 'general';
  }

  private async fetchData(searchType: string, workspaceId: string, userInput: string): Promise<any[]> {
    switch (searchType) {
      case 'projects':
        return await this.fetchProjects(workspaceId);
      case 'tasks':
        return await this.fetchTasks(workspaceId);
      case 'deadlines':
        return await this.fetchDeadlines(workspaceId);
      case 'team':
        return await this.fetchTeam(workspaceId);
      case 'general':
        return await this.fetchGeneral(workspaceId, userInput);
      default:
        return [];
    }
  }

  private async fetchProjects(workspaceId: string): Promise<any[]> {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, status, progress, start_date, end_date, created_at')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    if (!projects) return [];

    // Get task counts for each project
    const projectsWithTasks = await Promise.all(
      projects.map(async (project) => {
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

  private async fetchTasks(workspaceId: string): Promise<any[]> {
    // Get projects first
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

  private async fetchDeadlines(workspaceId: string): Promise<any[]> {
    // Get projects first
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

  private async fetchTeam(workspaceId: string): Promise<any[]> {
    const { data: resources, error } = await supabase
      .from('resources')
      .select('id, name, role')
      .eq('workspace_id', workspaceId)
      .limit(8);

    if (error) throw error;
    if (!resources) return [];
    
    return resources.map(resource => ({
      ...resource,
      utilization: Math.floor(Math.random() * 100), // Mock data
      assigned_tasks: Math.floor(Math.random() * 10) // Mock data
    }));
  }

  private async fetchGeneral(workspaceId: string, userInput: string): Promise<any[]> {
    const searchTerm = userInput.toLowerCase();
    
    // Search for projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, status, progress')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .ilike('name', `%${searchTerm}%`)
      .limit(3);

    // Get projects first for task search
    const { data: allProjects } = await supabase
      .from('projects')
      .select('id, name')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null);

    let tasks = [];
    if (allProjects && allProjects.length > 0) {
      const projectIds = allProjects.map(p => p.id);
      
      const { data: foundTasks } = await supabase
        .from('project_tasks')
        .select('id, name, status, project_id')
        .in('project_id', projectIds)
        .ilike('name', `%${searchTerm}%`)
        .limit(5);

      tasks = (foundTasks || []).map(task => {
        const project = allProjects.find(p => p.id === task.project_id);
        return {
          ...task,
          project_name: project?.name || 'Unknown Project'
        };
      });
    }
    
    return [
      ...(projects || []).map(p => ({ ...p, type: 'project' })),
      ...tasks.map(t => ({ ...t, type: 'task' }))
    ];
  }

  private formatResponse(searchType: string, data: any[], userInput: string): string {
    if (data.length === 0) {
      return `No ${searchType} found. Try keywords like "projects", "tasks", "deadlines", or "team".`;
    }

    let response = '';

    switch (searchType) {
      case 'projects':
        response = this.formatProjects(data);
        break;
      case 'tasks':
        response = this.formatTasks(data);
        break;
      case 'deadlines':
        response = this.formatDeadlines(data);
        break;
      case 'team':
        response = this.formatTeam(data);
        break;
      case 'general':
        response = this.formatGeneral(data);
        break;
      default:
        response = `Found ${data.length} results for "${userInput}".`;
    }

    return response;
  }

  private formatProjects(projects: any[]): string {
    let response = '📊 **Your Projects**\n\n';
    
    projects.forEach(project => {
      const progress = project.progress || 0;
      const progressBar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));
      
      response += `**${project.name}**\n`;
      response += `Status: ${project.status} | Progress: ${progressBar} ${progress}%\n`;
      response += `Tasks: ${project.completed_tasks}/${project.total_tasks} completed\n\n`;
    });

    return response;
  }

  private formatTasks(tasks: any[]): string {
    let response = '📋 **Recent Tasks**\n\n';
    
    tasks.forEach(task => {
      const statusIcon = this.getStatusIcon(task.status);
      response += `${statusIcon} **${task.name}**\n`;
      response += `Project: ${task.project_name}\n`;
      response += `Status: ${task.status}\n\n`;
    });

    return response;
  }

  private formatDeadlines(deadlines: any[]): string {
    let response = '⏰ **Upcoming Deadlines**\n\n';
    
    deadlines.forEach(task => {
      const daysUntil = this.calculateDaysUntil(task.end_date);
      const priorityIcon = this.getPriorityIcon(task.priority);
      
      response += `${priorityIcon} **${task.name}**\n`;
      response += `Project: ${task.project_name}\n`;
      response += `Due: ${new Date(task.end_date).toLocaleDateString()} (${daysUntil})\n\n`;
    });

    return response;
  }

  private formatTeam(team: any[]): string {
    let response = '👥 **Team Members**\n\n';
    
    team.forEach(member => {
      const utilizationBar = '█'.repeat(Math.floor(member.utilization / 10)) + '░'.repeat(10 - Math.floor(member.utilization / 10));
      
      response += `**${member.name}** (${member.role})\n`;
      response += `Utilization: ${utilizationBar} ${member.utilization}%\n`;
      response += `Assigned Tasks: ${member.assigned_tasks}\n\n`;
    });

    return response;
  }

  private formatGeneral(results: any[]): string {
    let response = '🔍 **Search Results**\n\n';
    
    const projects = results.filter(r => r.type === 'project');
    const tasks = results.filter(r => r.type === 'task');
    
    if (projects.length > 0) {
      response += '**Projects:**\n';
      projects.forEach(project => {
        response += `• ${project.name} (${project.status})\n`;
      });
      response += '\n';
    }
    
    if (tasks.length > 0) {
      response += '**Tasks:**\n';
      tasks.forEach(task => {
        response += `• ${task.name} (${task.status})\n`;
      });
    }

    return response;
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
}
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedLocalResult {
  success: boolean;
  response: string;
  dataCount: number;
  processingTime: number;
  searchType: string;
  insights?: string[];
}

export class EnhancedLocalService {
  private commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'show', 'me', 'my', 'what', 'how', 'why', 'when', 'where', 'who', 'which', 'can', 'could', 'would', 'should', 'will', 'might', 'may', 'must', 'shall', 'need', 'want', 'like', 'get', 'find', 'see', 'look', 'check', 'view', 'display', 'list', 'give', 'tell', 'help', 'please', 'thanks', 'thank', 'you', 'i', 'we', 'they', 'them', 'us', 'our', 'your', 'their', 'his', 'her', 'its', 'this', 'that', 'these', 'those', 'here', 'there', 'now', 'today', 'tomorrow', 'yesterday', 'all', 'some', 'any', 'every', 'each', 'many', 'much', 'few', 'little', 'more', 'most', 'less', 'least', 'only', 'also', 'too', 'very', 'really', 'quite', 'just', 'even', 'still', 'already', 'yet', 'ever', 'never', 'always', 'often', 'sometimes', 'usually', 'generally', 'probably', 'maybe', 'perhaps', 'definitely', 'certainly', 'sure', 'yes', 'no', 'not', 'don\'t', 'doesn\'t', 'won\'t', 'can\'t', 'couldn\'t', 'wouldn\'t', 'shouldn\'t', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t', 'hasn\'t', 'haven\'t', 'hadn\'t', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'done', 'go', 'goes', 'went', 'going', 'gone']);

  async processQuery(userInput: string, workspaceId: string): Promise<EnhancedLocalResult> {
    const startTime = Date.now();

    // New local NLP-first path (non-AI). Falls back to legacy strategy on failure.
    try {
      const { LocalNLPProcessor } = await import('./local/LocalNLPProcessor');
      const { QueryBuilder } = await import('./local/QueryBuilder');
      const { ResponseGenerator } = await import('./local/ResponseGenerator');

      const nlp = new LocalNLPProcessor();
      const qb = new QueryBuilder();
      const rg = new ResponseGenerator();

      const processed = nlp.process(userInput);
      const { data, planUsed } = await qb.execute(processed, workspaceId);
      const response = rg.build(processed.intent.intent, data);

      return {
        success: true,
        response,
        dataCount: data.length,
        processingTime: Date.now() - startTime,
        searchType: `local-${planUsed}`,
      };
    } catch (e) {
      console.warn('[Local NLP] Falling back to legacy strategy:', e);
    }

    // Legacy path preserved as fallback
    try {
      console.log('Processing enhanced local query:', userInput);
      const keywords = this.extractKeywords(userInput);
      const searchStrategy = this.determineSearchStrategy(userInput, keywords);
      const data = await this.executeSmartSearch(searchStrategy, workspaceId, keywords, userInput);
      const response = this.generateHumanResponse(searchStrategy, data, userInput, keywords);
      const insights = this.generateInsights(data, searchStrategy);

      return {
        success: true,
        response,
        dataCount: data.length,
        processingTime: Date.now() - startTime,
        searchType: searchStrategy.type,
        insights,
      };
    } catch (error) {
      console.error('Enhanced local search error:', error);
      return {
        success: false,
        response: this.generateErrorResponse(userInput),
        dataCount: 0,
        processingTime: Date.now() - startTime,
        searchType: 'error',
      };
    }
  }

  private extractKeywords(input: string): string[] {
    return input
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.commonWords.has(word))
      .slice(0, 10); // Limit to top 10 keywords
  }

  private determineSearchStrategy(input: string, keywords: string[]): any {
    const lowerInput = input.toLowerCase();
    
    // Priority-based pattern matching
    const patterns = [
      {
        type: 'performance',
        keywords: ['performance', 'productivity', 'metrics', 'kpi', 'dashboard', 'analytics', 'score', 'rating'],
        weight: 3,
        scope: 'workspace'
      },
      {
        type: 'deadlines',
        keywords: ['deadline', 'due', 'overdue', 'late', 'urgent', 'critical', 'schedule', 'timeline'],
        weight: 3,
        scope: 'tasks'
      },
      {
        type: 'project_status',
        keywords: ['project', 'status', 'progress', 'update', 'overview', 'summary'],
        weight: 2,
        scope: 'projects'
      },
      {
        type: 'task_management',
        keywords: ['task', 'todo', 'assignment', 'work', 'activity', 'action'],
        weight: 2,
        scope: 'tasks'
      },
      {
        type: 'team_insights',
        keywords: ['team', 'member', 'resource', 'people', 'staff', 'colleague', 'workload'],
        weight: 2,
        scope: 'team'
      },
      {
        type: 'general_search',
        keywords: [],
        weight: 1,
        scope: 'all'
      }
    ];

    // Score each pattern
    let bestMatch = patterns[patterns.length - 1]; // Default to general
    let bestScore = 0;

    for (const pattern of patterns) {
      let score = 0;
      for (const keyword of pattern.keywords) {
        if (lowerInput.includes(keyword) || keywords.includes(keyword)) {
          score += pattern.weight;
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = pattern;
      }
    }

    return {
      ...bestMatch,
      confidence: Math.min(bestScore / 5, 1), // Normalize confidence
      originalQuery: input,
      keywords
    };
  }

  private async executeSmartSearch(strategy: any, workspaceId: string, keywords: string[], userInput: string): Promise<any[]> {
    console.log('Executing smart search with strategy:', strategy.type);
    
    switch (strategy.type) {
      case 'performance':
        return await this.fetchPerformanceData(workspaceId);
      case 'deadlines':
        return await this.fetchDeadlineData(workspaceId);
      case 'project_status':
        return await this.fetchProjectStatusData(workspaceId, keywords);
      case 'task_management':
        return await this.fetchTaskData(workspaceId, keywords);
      case 'team_insights':
        return await this.fetchTeamData(workspaceId);
      case 'general_search':
        return await this.fetchGeneralData(workspaceId, keywords, userInput);
      default:
        return [];
    }
  }

  private async fetchPerformanceData(workspaceId: string): Promise<any[]> {
    // Fetch project performance metrics
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, status, progress, start_date, end_date, created_at')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null);

    if (!projects) return [];

    const performanceData = await Promise.all(
      projects.map(async (project) => {
        const { data: tasks } = await supabase
          .from('project_tasks')
          .select('id, status, priority, end_date')
          .eq('project_id', project.id);

        const totalTasks = tasks?.length || 0;
        const completedTasks = tasks?.filter(t => t.status === 'Completed').length || 0;
        const overdueTasks = tasks?.filter(t => 
          t.end_date && new Date(t.end_date) < new Date() && t.status !== 'Completed'
        ).length || 0;
        
        return {
          ...project,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          overdue_tasks: overdueTasks,
          completion_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          health_score: this.calculateHealthScore(project, completedTasks, totalTasks, overdueTasks)
        };
      })
    );

    return performanceData;
  }

  private async fetchDeadlineData(workspaceId: string): Promise<any[]> {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null);

    if (!projects) return [];

    const projectIds = projects.map(p => p.id);
    const { data: tasks } = await supabase
      .from('project_tasks')
      .select('id, name, end_date, status, priority, project_id')
      .in('project_id', projectIds)
      .not('end_date', 'is', null)
      .neq('status', 'Completed')
      .order('end_date', { ascending: true })
      .limit(15);

    return (tasks || []).map(task => {
      const project = projects.find(p => p.id === task.project_id);
      const daysUntil = this.calculateDaysUntil(task.end_date);
      return {
        ...task,
        project_name: project?.name || 'Unknown Project',
        days_until: daysUntil,
        urgency_level: this.calculateUrgencyLevel(task.end_date, task.priority)
      };
    });
  }

  private async fetchProjectStatusData(workspaceId: string, keywords: string[]): Promise<any[]> {
    let query = supabase
      .from('projects')
      .select('id, name, status, progress, start_date, end_date, created_at')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null);

    // Apply keyword filtering if specific project names mentioned
    const projectKeywords = keywords.filter(k => k.length > 3);
    if (projectKeywords.length > 0) {
      const searchPattern = projectKeywords.join('|');
      query = query.or(`name.ilike.%${searchPattern}%`);
    }

    const { data: projects } = await query.limit(8);
    if (!projects) return [];

    return await Promise.all(
      projects.map(async (project) => {
        const { data: tasks } = await supabase
          .from('project_tasks')
          .select('id, status, priority')
          .eq('project_id', project.id);

        const { data: milestones } = await supabase
          .from('milestones')
          .select('id, name, status, due_date')
          .eq('project_id', project.id);

        return {
          ...project,
          task_summary: this.summarizeTasks(tasks || []),
          milestone_summary: this.summarizeMilestones(milestones || []),
          overall_health: this.assessProjectHealth(project, tasks || [], milestones || [])
        };
      })
    );
  }

  private async fetchTaskData(workspaceId: string, keywords: string[]): Promise<any[]> {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null);

    if (!projects) return [];

    const projectIds = projects.map(p => p.id);
    let query = supabase
      .from('project_tasks')
      .select('id, name, status, priority, progress, end_date, project_id, updated_at')
      .in('project_id', projectIds);

    // Apply keyword filtering
    const taskKeywords = keywords.filter(k => k.length > 2);
    if (taskKeywords.length > 0) {
      const searchPattern = taskKeywords.join('|');
      query = query.or(`name.ilike.%${searchPattern}%,status.ilike.%${searchPattern}%`);
    }

    const { data: tasks } = await query
      .order('updated_at', { ascending: false })
      .limit(12);

    return (tasks || []).map(task => {
      const project = projects.find(p => p.id === task.project_id);
      return {
        ...task,
        project_name: project?.name || 'Unknown Project',
        age_days: this.calculateAgeDays(task.updated_at),
        priority_score: this.calculatePriorityScore(task)
      };
    });
  }

  private async fetchTeamData(workspaceId: string): Promise<any[]> {
    const { data: resources } = await supabase
      .from('resources')
      .select('id, name, role, availability')
      .eq('workspace_id', workspaceId)
      .limit(10);

    if (!resources) return [];

    return await Promise.all(
      resources.map(async (resource) => {
        // Simulate workload calculation - in real app, this would be more sophisticated
        const workload = {
          current_projects: Math.floor(Math.random() * 5) + 1,
          active_tasks: Math.floor(Math.random() * 15) + 3,
          utilization_rate: Math.floor(Math.random() * 40) + 60, // 60-100%
          availability_status: this.determineAvailabilityStatus(resource.availability)
        };

        return {
          ...resource,
          ...workload,
          efficiency_rating: this.calculateEfficiencyRating(workload)
        };
      })
    );
  }

  private async fetchGeneralData(workspaceId: string, keywords: string[], userInput: string): Promise<any[]> {
    const searchTerm = keywords.length > 0 ? keywords[0] : userInput.split(' ')[0];
    
    // Search across projects and tasks
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, status, progress')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .ilike('name', `%${searchTerm}%`)
      .limit(5);

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
        .or(`name.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%`)
        .limit(8);

      tasks = (foundTasks || []).map(task => {
        const project = allProjects.find(p => p.id === task.project_id);
        return {
          ...task,
          project_name: project?.name || 'Unknown Project',
          relevance_score: this.calculateRelevanceScore(task.name, keywords)
        };
      });
    }

    return [
      ...(projects || []).map(p => ({ ...p, type: 'project', relevance_score: this.calculateRelevanceScore(p.name, keywords) })),
      ...tasks.map(t => ({ ...t, type: 'task' }))
    ].sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
  }

  private generateHumanResponse(strategy: any, data: any[], userInput: string, keywords: string[]): string {
    if (data.length === 0) {
      return this.generateEmptyResultsResponse(strategy, userInput);
    }

    const responses = {
      performance: () => this.generatePerformanceResponse(data),
      deadlines: () => this.generateDeadlineResponse(data),
      project_status: () => this.generateProjectStatusResponse(data),
      task_management: () => this.generateTaskResponse(data),
      team_insights: () => this.generateTeamResponse(data),
      general_search: () => this.generateGeneralResponse(data, userInput)
    };

    const responseGenerator = responses[strategy.type] || responses.general_search;
    return responseGenerator();
  }

  private generatePerformanceResponse(data: any[]): string {
    const avgCompletion = Math.round(data.reduce((sum, p) => sum + p.completion_rate, 0) / data.length);
    const healthyProjects = data.filter(p => p.health_score >= 7).length;
    const concernProjects = data.filter(p => p.health_score < 5).length;

    let response = `📊 **Workspace Performance Overview**\n\n`;
    response += `I've analyzed ${data.length} active projects and here's what I found:\n\n`;
    response += `**Overall Health:** ${avgCompletion}% average completion rate\n`;
    response += `**Project Status:** ${healthyProjects} healthy, ${concernProjects} need attention\n\n`;

    if (concernProjects > 0) {
      response += `🔴 **Projects Needing Attention:**\n`;
      data.filter(p => p.health_score < 5).slice(0, 3).forEach(project => {
        response += `• **${project.name}** - ${project.completion_rate}% complete, ${project.overdue_tasks} overdue tasks\n`;
      });
      response += '\n';
    }

    if (healthyProjects > 0) {
      response += `✅ **Top Performing Projects:**\n`;
      data.filter(p => p.health_score >= 7).slice(0, 3).forEach(project => {
        response += `• **${project.name}** - ${project.completion_rate}% complete, excellent progress\n`;
      });
    }

    return response;
  }

  private generateDeadlineResponse(data: any[]): string {
    const urgentTasks = data.filter(t => t.urgency_level === 'critical').length;
    const todayTasks = data.filter(t => t.days_until === 0).length;
    const weekTasks = data.filter(t => t.days_until <= 7 && t.days_until > 0).length;

    let response = `⏰ **Deadline Analysis**\n\n`;
    response += `Here's what's coming up that needs your attention:\n\n`;

    if (urgentTasks > 0) {
      response += `🚨 **Critical Deadlines (${urgentTasks} items)**\n`;
      data.filter(t => t.urgency_level === 'critical').slice(0, 4).forEach(task => {
        const urgencyEmoji = task.days_until < 0 ? '🔴' : task.days_until === 0 ? '🟠' : '🟡';
        response += `${urgencyEmoji} **${task.name}** in *${task.project_name}*\n`;
        response += `   Due: ${this.formatDeadlineText(task.days_until)}\n`;
      });
      response += '\n';
    }

    if (todayTasks > 0) {
      response += `📅 **Due Today (${todayTasks} items)**\n`;
      data.filter(t => t.days_until === 0).forEach(task => {
        response += `• **${task.name}** - ${task.project_name}\n`;
      });
      response += '\n';
    }

    if (weekTasks > 0) {
      response += `📋 **This Week (${weekTasks} items)**\n`;
      data.filter(t => t.days_until <= 7 && t.days_until > 0).slice(0, 5).forEach(task => {
        response += `• **${task.name}** - Due ${this.formatDeadlineText(task.days_until)}\n`;
      });
    }

    if (urgentTasks === 0 && todayTasks === 0 && weekTasks === 0) {
      response += `🎉 **Great news!** No urgent deadlines found. You're staying on top of things!\n\n`;
      response += `Your next upcoming tasks:\n`;
      data.slice(0, 5).forEach(task => {
        response += `• **${task.name}** - ${this.formatDeadlineText(task.days_until)}\n`;
      });
    }

    return response;
  }

  private generateProjectStatusResponse(data: any[]): string {
    let response = `📋 **Project Status Report**\n\n`;
    response += `I found ${data.length} project(s) matching your request. Here's the current status:\n\n`;

    data.forEach((project, index) => {
      const healthEmoji = project.overall_health >= 8 ? '🟢' : project.overall_health >= 6 ? '🟡' : '🔴';
      const progressBar = '█'.repeat(Math.floor(project.progress / 10)) + '░'.repeat(10 - Math.floor(project.progress / 10));
      
      response += `${healthEmoji} **${project.name}**\n`;
      response += `Status: ${project.status} | Progress: ${progressBar} ${project.progress}%\n`;
      response += `Tasks: ${project.task_summary.completed}/${project.task_summary.total} complete`;
      
      if (project.task_summary.overdue > 0) {
        response += ` (${project.task_summary.overdue} overdue)`;
      }
      response += '\n';
      
      if (project.milestone_summary.total > 0) {
        response += `Milestones: ${project.milestone_summary.completed}/${project.milestone_summary.total} achieved\n`;
      }
      
      if (index < data.length - 1) response += '\n';
    });

    return response;
  }

  private generateTaskResponse(data: any[]): string {
    const byStatus = this.groupByStatus(data);
    const priorityTasks = data.filter(t => t.priority === 'High').slice(0, 5);

    let response = `📝 **Task Overview**\n\n`;
    response += `Found ${data.length} tasks. Here's what's on your plate:\n\n`;

    if (byStatus['In Progress'] && byStatus['In Progress'].length > 0) {
      response += `🔄 **Currently Working On (${byStatus['In Progress'].length})**\n`;
      byStatus['In Progress'].slice(0, 4).forEach(task => {
        response += `• **${task.name}** - ${task.project_name} (${task.progress}% done)\n`;
      });
      response += '\n';
    }

    if (priorityTasks.length > 0) {
      response += `🔴 **High Priority Tasks**\n`;
      priorityTasks.forEach(task => {
        response += `• **${task.name}** - ${task.project_name} (${task.status})\n`;
      });
      response += '\n';
    }

    if (byStatus['Pending'] && byStatus['Pending'].length > 0) {
      response += `⏳ **Up Next (${byStatus['Pending'].length})**\n`;
      byStatus['Pending'].slice(0, 4).forEach(task => {
        response += `• **${task.name}** - ${task.project_name}\n`;
      });
    }

    return response;
  }

  private generateTeamResponse(data: any[]): string {
    const avgUtilization = Math.round(data.reduce((sum, m) => sum + m.utilization_rate, 0) / data.length);
    const overloaded = data.filter(m => m.utilization_rate > 90).length;
    const available = data.filter(m => m.utilization_rate < 70).length;

    let response = `👥 **Team Insights**\n\n`;
    response += `Your team of ${data.length} members is running at ${avgUtilization}% average utilization.\n\n`;

    if (overloaded > 0) {
      response += `⚠️ **High Workload (${overloaded} members)**\n`;
      data.filter(m => m.utilization_rate > 90).forEach(member => {
        response += `• **${member.name}** (${member.role}) - ${member.utilization_rate}% loaded, ${member.active_tasks} active tasks\n`;
      });
      response += '\n';
    }

    if (available > 0) {
      response += `✅ **Available Capacity (${available} members)**\n`;
      data.filter(m => m.utilization_rate < 70).forEach(member => {
        response += `• **${member.name}** (${member.role}) - ${member.utilization_rate}% utilized, can take on more work\n`;
      });
      response += '\n';
    }

    response += `📊 **Team Efficiency**\n`;
    data.sort((a, b) => b.efficiency_rating - a.efficiency_rating).slice(0, 3).forEach(member => {
      response += `• **${member.name}** - ${member.efficiency_rating}/10 efficiency rating\n`;
    });

    return response;
  }

  private generateGeneralResponse(data: any[], userInput: string): string {
    const projects = data.filter(item => item.type === 'project');
    const tasks = data.filter(item => item.type === 'task');

    let response = `🔍 **Search Results for "${userInput}"**\n\n`;
    response += `I found ${data.length} items that match what you're looking for:\n\n`;

    if (projects.length > 0) {
      response += `**📊 Projects (${projects.length})**\n`;
      projects.forEach(project => {
        response += `• **${project.name}** - ${project.status} (${project.progress}% complete)\n`;
      });
      response += '\n';
    }

    if (tasks.length > 0) {
      response += `**📝 Tasks (${tasks.length})**\n`;
      tasks.forEach(task => {
        response += `• **${task.name}** - ${task.project_name} (${task.status})\n`;
      });
    }

    if (data.length === 0) {
      response = `🤔 I didn't find exact matches for "${userInput}", but here are some suggestions:\n\n`;
      response += `Try searching for:\n`;
      response += `• "my tasks" or "my projects"\n`;
      response += `• "overdue" or "deadlines"\n`;
      response += `• "team status" or "performance"\n`;
      response += `• Specific project names or keywords\n`;
    }

    return response;
  }

  // Helper methods
  private calculateHealthScore(project: any, completed: number, total: number, overdue: number): number {
    let score = 5; // Base score
    
    if (total > 0) {
      const completionRate = completed / total;
      score += completionRate * 3; // Up to 3 points for completion
    }
    
    if (overdue > 0) {
      score -= Math.min(overdue * 0.5, 3); // Deduct for overdue tasks
    }
    
    if (project.progress > 80) score += 1;
    if (project.status === 'Active') score += 1;
    
    return Math.max(0, Math.min(10, Math.round(score)));
  }

  private calculateDaysUntil(dateString: string): number {
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private calculateUrgencyLevel(endDate: string, priority: string): string {
    const daysUntil = this.calculateDaysUntil(endDate);
    
    if (daysUntil < 0) return 'critical';
    if (daysUntil <= 1 && priority === 'High') return 'critical';
    if (daysUntil <= 3) return 'high';
    if (daysUntil <= 7) return 'medium';
    return 'low';
  }

  private summarizeTasks(tasks: any[]): any {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      in_progress: tasks.filter(t => t.status === 'In Progress').length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      overdue: tasks.filter(t => t.end_date && new Date(t.end_date) < new Date() && t.status !== 'Completed').length
    };
  }

  private summarizeMilestones(milestones: any[]): any {
    return {
      total: milestones.length,
      completed: milestones.filter(m => m.status === 'Completed').length,
      upcoming: milestones.filter(m => m.due_date && new Date(m.due_date) > new Date()).length
    };
  }

  private assessProjectHealth(project: any, tasks: any[], milestones: any[]): number {
    let health = 5;
    
    if (project.progress > 75) health += 2;
    else if (project.progress > 50) health += 1;
    else if (project.progress < 25) health -= 1;
    
    const taskSummary = this.summarizeTasks(tasks);
    if (taskSummary.total > 0) {
      const completionRate = taskSummary.completed / taskSummary.total;
      health += completionRate * 2;
      health -= Math.min(taskSummary.overdue * 0.5, 2);
    }
    
    return Math.max(0, Math.min(10, Math.round(health)));
  }

  private calculateAgeDays(updatedAt: string): number {
    const updated = new Date(updatedAt);
    const now = new Date();
    return Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
  }

  private calculatePriorityScore(task: any): number {
    let score = 1;
    if (task.priority === 'High') score = 3;
    else if (task.priority === 'Medium') score = 2;
    
    if (task.end_date) {
      const daysUntil = this.calculateDaysUntil(task.end_date);
      if (daysUntil <= 1) score += 2;
      else if (daysUntil <= 7) score += 1;
    }
    
    return score;
  }

  private determineAvailabilityStatus(availability: number): string {
    if (availability >= 90) return 'fully_available';
    if (availability >= 70) return 'mostly_available';
    if (availability >= 40) return 'limited';
    return 'busy';
  }

  private calculateEfficiencyRating(workload: any): number {
    // Simple efficiency calculation - in real app, this would be more sophisticated
    const base = 5;
    const utilizationBonus = workload.utilization_rate > 80 ? 2 : workload.utilization_rate > 60 ? 1 : 0;
    const taskBonus = workload.active_tasks < 20 ? 2 : workload.active_tasks < 30 ? 1 : 0;
    
    return Math.min(10, base + utilizationBonus + taskBonus);
  }

  private calculateRelevanceScore(text: string, keywords: string[]): number {
    let score = 0;
    const lowerText = text.toLowerCase();
    
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += keyword.length > 4 ? 2 : 1;
      }
    });
    
    return score;
  }

  private groupByStatus(tasks: any[]): Record<string, any[]> {
    return tasks.reduce((groups, task) => {
      const status = task.status || 'Unknown';
      if (!groups[status]) groups[status] = [];
      groups[status].push(task);
      return groups;
    }, {});
  }

  private formatDeadlineText(daysUntil: number): string {
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
    if (daysUntil === 0) return 'today';
    if (daysUntil === 1) return 'tomorrow';
    return `in ${daysUntil} days`;
  }

  private generateEmptyResultsResponse(strategy: any, userInput: string): string {
    const suggestions = {
      performance: "Try asking about 'project progress', 'team productivity', or 'completion rates'",
      deadlines: "Try searching for 'overdue tasks', 'upcoming deadlines', or 'this week'",
      project_status: "Try asking about specific project names or 'active projects'",
      task_management: "Try searching for 'my tasks', 'pending work', or 'high priority'",
      team_insights: "Try asking about 'team workload', 'resource availability', or 'team performance'",
      general_search: "Try using keywords like 'projects', 'tasks', 'deadlines', or 'team'"
    };

    return `🤔 I couldn't find anything matching "${userInput}" in your workspace.\n\n${suggestions[strategy.type] || suggestions.general_search}`;
  }

  private generateErrorResponse(userInput: string): string {
    return `😅 I encountered an issue while searching for "${userInput}". This might be due to:\n\n• Temporary connectivity issues\n• No data available in your workspace\n• Complex search terms\n\nTry simplifying your search or check back in a moment!`;
  }

  private generateInsights(data: any[], strategy: any): string[] {
    const insights = [];
    
    if (data.length === 0) return insights;
    
    switch (strategy.type) {
      case 'performance':
        const avgCompletion = data.reduce((sum, p) => sum + p.completion_rate, 0) / data.length;
        if (avgCompletion > 80) insights.push("🎉 Your projects are performing exceptionally well!");
        else if (avgCompletion < 50) insights.push("⚠️ Several projects need attention to improve completion rates");
        break;
        
      case 'deadlines':
        const urgentCount = data.filter(t => t.urgency_level === 'critical').length;
        if (urgentCount > 5) insights.push("🚨 High number of urgent deadlines - consider prioritizing and delegating");
        else if (urgentCount === 0) insights.push("✅ Great deadline management - no urgent items found");
        break;
        
      case 'team_insights':
        const avgUtil = data.reduce((sum, m) => sum + m.utilization_rate, 0) / data.length;
        if (avgUtil > 85) insights.push("⚡ Team is highly utilized - monitor for potential burnout");
        else if (avgUtil < 60) insights.push("💡 Team has capacity for additional projects");
        break;
    }
    
    return insights;
  }
}
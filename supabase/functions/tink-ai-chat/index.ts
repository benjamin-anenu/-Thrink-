
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced intent detection patterns
const INTENT_PATTERNS = {
  data_query: [
    /(?:show|display|get|fetch|analytics|performance|metrics|utilization)/i,
    /(?:team|resource|project)\s+(?:performance|utilization|analytics)/i,
    /(?:list|show|display|get|fetch)\s+(?:all\s+)?(?:my\s+)?(projects?|tasks?|resources?|milestones?|deadlines?|issues?)/i,
    /what\s+(?:projects?|tasks?|resources?)\s+(?:do\s+i\s+have|are\s+there)/i,
    /(?:status|progress)\s+(?:of|for)\s+(?:my\s+)?(projects?|tasks?)/i,
    /(?:how\s+is|what's\s+the\s+status\s+of)\s+(?:my\s+)?(project|task)/i,
    /(?:tasks?|deadlines?|milestones?)\s+(?:for\s+)?(?:today|tomorrow|this\s+week|next\s+week|upcoming)/i,
    /(?:what's\s+)?(?:due|overdue)\s+(?:today|tomorrow|this\s+week)/i,
    /(?:team|resource)\s+(?:utilization|allocation|capacity|workload)/i,
    /(?:who\s+is\s+assigned\s+to|assignments?\s+for)/i,
  ],
  insight_query: [
    /(?:analyze|insights?|recommendations?|advice|suggestions?)/i,
    /(?:what\s+should\s+i|how\s+can\s+i|what's\s+the\s+best\s+way\s+to)/i,
    /(?:risks?|issues?|problems?)\s+(?:with|in)/i,
    /(?:optimize|improve|enhance)/i
  ]
};

// Enhanced database query engine
class TinkQueryEngine {
  constructor(private supabase: any, private userId: string, private workspaceId: string) {}

  async executeQuery(intent: string, entities: string[], query: string): Promise<any> {
    console.log(`Executing query - Intent: ${intent}, Entities: ${entities.join(', ')}, Query: ${query}`);
    
    try {
      switch (intent) {
        case 'list_projects':
          return await this.getProjects();
        case 'list_tasks':
          return await this.getTasks(entities);
        case 'list_resources':
          return await this.getResources();
        case 'project_status':
          return await this.getProjectStatus(entities);
        case 'task_status':
          return await this.getTaskStatus(entities);
        case 'deadlines':
          return await this.getDeadlines(entities);
        case 'performance':
          return await this.getPerformanceMetrics(entities);
        case 'team_utilization':
          return await this.getTeamUtilization();
        case 'assignments':
          return await this.getAssignments(entities);
        case 'analytics':
          return await this.getAnalytics(entities);
        default:
          return { error: 'Query type not supported yet' };
      }
    } catch (error) {
      console.error('Query execution error:', error);
      return { error: 'Failed to execute query', details: error.message };
    }
  }

  async getProjects(): Promise<any> {
    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        id, name, description, status, priority, start_date, end_date, 
        progress, created_at, updated_at, workspace_id,
        milestones(id, name, status, due_date, progress),
        project_tasks(id, name, status, assignee_id, start_date, end_date, progress)
      `)
      .eq('workspace_id', this.workspaceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
    
    return {
      type: 'projects_list',
      data: data || [],
      summary: `Found ${data?.length || 0} projects in your workspace`,
      count: data?.length || 0
    };
  }

  async getTasks(entities: string[]): Promise<any> {
    let query = this.supabase
      .from('project_tasks')
      .select(`
        id, name, description, status, priority, assignee_id, 
        start_date, end_date, progress, created_at,
        projects!inner(id, name, workspace_id),
        milestones(id, name)
      `)
      .eq('projects.workspace_id', this.workspaceId);

    // Apply filters based on entities
    if (entities.includes('today')) {
      const today = new Date().toISOString().split('T')[0];
      query = query.lte('start_date', today).gte('end_date', today);
    }
    
    if (entities.includes('overdue')) {
      const today = new Date().toISOString().split('T')[0];
      query = query.lt('end_date', today).neq('status', 'Completed');
    }

    if (entities.includes('upcoming')) {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      query = query.gte('start_date', today).lte('start_date', futureDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query.order('start_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    return {
      type: 'tasks_list',
      data: data || [],
      summary: `Found ${data?.length || 0} tasks matching your criteria`,
      count: data?.length || 0
    };
  }

  async getResources(): Promise<any> {
    const { data, error } = await this.supabase
      .from('resources')
      .select(`
        id, name, email, role, department, created_at, updated_at
      `)
      .eq('workspace_id', this.workspaceId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }

    return {
      type: 'resources_list',
      data: data || [],
      summary: `Found ${data?.length || 0} resources in your workspace`,
      count: data?.length || 0
    };
  }

  async getPerformanceMetrics(entities: string[]): Promise<any> {
    const { data, error } = await this.supabase
      .from('performance_metrics')
      .select(`
        id, resource_id, type, value, timestamp, description, workspace_id
      `)
      .eq('workspace_id', this.workspaceId)
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }

    return {
      type: 'performance_metrics',
      data: data || [],
      summary: `Performance metrics for the last 30 days`,
      count: data?.length || 0
    };
  }

  async getTeamUtilization(): Promise<any> {
    // Get resources and their current assignments
    const { data: resources, error: resourceError } = await this.supabase
      .from('resources')
      .select(`
        id, name, role, department,
        project_assignments(
          id, project_id, role,
          projects(id, name, status)
        )
      `)
      .eq('workspace_id', this.workspaceId);

    if (resourceError) {
      console.error('Error fetching team utilization:', resourceError);
      throw resourceError;
    }

    return {
      type: 'team_utilization',
      data: resources || [],
      summary: `Team utilization data for ${resources?.length || 0} resources`,
      count: resources?.length || 0
    };
  }

  async getDeadlines(entities: string[]): Promise<any> {
    const days = entities.includes('today') ? 1 : 
                 entities.includes('tomorrow') ? 2 : 
                 entities.includes('week') ? 7 : 
                 entities.includes('upcoming') ? 14 : 30;
    
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('project_tasks')
      .select(`
        id, name, end_date, status, priority,
        projects!inner(id, name, workspace_id),
        milestones(id, name, due_date)
      `)
      .eq('projects.workspace_id', this.workspaceId)
      .gte('end_date', today)
      .lte('end_date', futureDateStr)
      .order('end_date', { ascending: true });

    if (error) {
      console.error('Error fetching deadlines:', error);
      throw error;
    }

    return {
      type: 'deadlines',
      data: data || [],
      summary: `Found ${data?.length || 0} upcoming deadlines`,
      count: data?.length || 0
    };
  }

  async getAnalytics(entities: string[]): Promise<any> {
    // Get comprehensive analytics data
    const [projectsData, tasksData, resourcesData, metricsData] = await Promise.all([
      this.getProjects(),
      this.getTasks([]),
      this.getResources(),
      this.getPerformanceMetrics([])
    ]);

    const analytics = {
      projects: {
        total: projectsData.count,
        byStatus: this.groupByStatus(projectsData.data, 'status'),
        byPriority: this.groupByStatus(projectsData.data, 'priority')
      },
      tasks: {
        total: tasksData.count,
        byStatus: this.groupByStatus(tasksData.data, 'status'),
        byPriority: this.groupByStatus(tasksData.data, 'priority')
      },
      resources: {
        total: resourcesData.count,
        byDepartment: this.groupByStatus(resourcesData.data, 'department'),
        byRole: this.groupByStatus(resourcesData.data, 'role')
      },
      performance: {
        totalMetrics: metricsData.count,
        averagePerformance: this.calculateAveragePerformance(metricsData.data)
      }
    };

    return {
      type: 'analytics',
      data: analytics,
      summary: `Comprehensive analytics for your workspace`,
      count: Object.keys(analytics).length
    };
  }

  private groupByStatus(data: any[], field: string): Record<string, number> {
    return data.reduce((acc, item) => {
      const value = item[field] || 'Unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateAveragePerformance(metrics: any[]): number {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, metric) => acc + (metric.value || 0), 0);
    return sum / metrics.length;
  }

  async getProjectStatus(entities: string[]): Promise<any> {
    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        id, name, status, progress, start_date, end_date,
        project_tasks(id, status)
      `)
      .eq('workspace_id', this.workspaceId);

    if (error) throw error;

    const projectsWithStats = data?.map(project => {
      const totalTasks = project.project_tasks?.length || 0;
      const completedTasks = project.project_tasks?.filter(task => task.status === 'Completed').length || 0;
      
      return {
        ...project,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        health_status: this.calculateProjectHealth(project)
      };
    });

    return {
      type: 'project_status',
      data: projectsWithStats || [],
      summary: `Status overview for ${data?.length || 0} projects`
    };
  }

  async getTaskStatus(entities: string[]): Promise<any> {
    const { data, error } = await this.supabase
      .from('project_tasks')
      .select(`
        id, name, status, priority, progress, start_date, end_date,
        projects!inner(id, name, workspace_id)
      `)
      .eq('projects.workspace_id', this.workspaceId)
      .order('status', { ascending: true });

    if (error) throw error;

    // Group tasks by status for better overview
    const tasksByStatus = data?.reduce((acc: any, task: any) => {
      const status = task.status || 'Unknown';
      if (!acc[status]) acc[status] = [];
      acc[status].push(task);
      return acc;
    }, {});

    return {
      type: 'task_status',
      data: data || [],
      groupedData: tasksByStatus || {},
      summary: `Task status overview: ${data?.length || 0} total tasks`
    };
  }

  async getAssignments(entities: string[]): Promise<any> {
    const { data, error } = await this.supabase
      .from('project_tasks')
      .select(`
        id, name, assignee_id, status, start_date, end_date,
        projects!inner(id, name, workspace_id)
      `)
      .eq('projects.workspace_id', this.workspaceId)
      .not('assignee_id', 'is', null)
      .order('start_date', { ascending: true });

    if (error) throw error;

    return {
      type: 'assignments',
      data: data || [],
      summary: `Found ${data?.length || 0} task assignments`
    };
  }

  private calculateProjectHealth(project: any): string {
    const progress = project.progress || 0;
    const now = new Date();
    const endDate = project.end_date ? new Date(project.end_date) : null;
    
    if (!endDate) return 'unknown';
    
    const isOverdue = now > endDate && progress < 100;
    const isAtRisk = endDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000 && progress < 80;
    
    if (isOverdue) return 'critical';
    if (isAtRisk) return 'warning';
    if (progress >= 90) return 'excellent';
    if (progress >= 70) return 'good';
    return 'on-track';
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { message, userId, workspaceId } = await req.json();

    if (!message || !userId || !workspaceId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Processing message:', message, 'for user:', userId, 'in workspace:', workspaceId);

    // Initialize query engine
    const queryEngine = new TinkQueryEngine(supabase, userId, workspaceId);

    // Enhanced intent detection and entity extraction
    const { intent, entities, isDataQuery } = detectIntentAndEntities(message);
    console.log('Intent detection result:', { intent, entities, isDataQuery, message });

    let assistantMessage = '';
    let queryResult = null;
    let responseType = 'conversational';

    if (isDataQuery && intent) {
      // Handle data queries directly
      console.log('Processing data query:', intent);
      queryResult = await queryEngine.executeQuery(intent, entities, message);
      
      if (queryResult.error) {
        assistantMessage = `I encountered an issue retrieving that data: ${queryResult.error}. Let me try to help in another way.`;
      } else {
        // Format the data response
        assistantMessage = formatDataResponse(queryResult, message);
        responseType = 'data_with_insights';
      }
    } else {
      // Handle conversational queries with contextual information
      console.log('Processing conversational query');
      
      // Get some context data to help with responses
      const contextData = await queryEngine.getAnalytics([]);
      
      // Build a contextual response
      assistantMessage = buildContextualResponse(message, contextData);
      responseType = 'conversational';
    }

    // Save conversation history
    await supabase.from('ai_conversation_history').insert([
      {
        user_id: userId,
        workspace_id: workspaceId,
        conversation_type: 'tink_assistant',
        message_role: 'user',
        message_content: message,
        context_data: { 
          timestamp: new Date().toISOString(),
          intent,
          entities,
          isDataQuery
        }
      },
      {
        user_id: userId,
        workspace_id: workspaceId,
        conversation_type: 'tink_assistant',
        message_role: 'assistant',
        message_content: assistantMessage,
        context_data: { 
          timestamp: new Date().toISOString(),
          responseType,
          queryResult: queryResult ? { type: queryResult.type, summary: queryResult.summary } : null
        }
      }
    ]);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: assistantMessage,
        responseType,
        queryResult: queryResult ? { 
          type: queryResult.type, 
          summary: queryResult.summary,
          dataCount: queryResult.count || 0
        } : null,
        intent,
        entities
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in tink-ai-chat:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Enhanced intent detection and entity extraction
function detectIntentAndEntities(message: string): { intent: string | null, entities: string[], isDataQuery: boolean } {
  const lowerMessage = message.toLowerCase();
  const entities: string[] = [];
  
  // Extract time entities
  if (/\btoday\b/i.test(message)) entities.push('today');
  if (/\btomorrow\b/i.test(message)) entities.push('tomorrow');
  if (/\bthis\s+week\b/i.test(message)) entities.push('week');
  if (/\bnext\s+week\b/i.test(message)) entities.push('week');
  if (/\bupcoming\b/i.test(message)) entities.push('upcoming');
  if (/\boverdue\b/i.test(message)) entities.push('overdue');
  
  // Extract object entities
  if (/\bprojects?\b/i.test(message)) entities.push('projects');
  if (/\btasks?\b/i.test(message)) entities.push('tasks');
  if (/\bresources?\b/i.test(message)) entities.push('resources');
  if (/\bdeadlines?\b/i.test(message)) entities.push('deadlines');
  if (/\bmilestones?\b/i.test(message)) entities.push('milestones');
  if (/\bperformance\b/i.test(message)) entities.push('performance');
  if (/\banalytics?\b/i.test(message)) entities.push('analytics');
  if (/\bteam\b/i.test(message)) entities.push('team');
  if (/\butilization\b/i.test(message)) entities.push('utilization');

  // Check for data query patterns
  let intent = null;
  let isDataQuery = false;

  for (const pattern of INTENT_PATTERNS.data_query) {
    if (pattern.test(message)) {
      isDataQuery = true;
      
      // Determine specific intent
      if (/(?:analytics|performance|metrics)/i.test(message)) {
        intent = 'analytics';
      } else if (/(?:team|resource)\s+(?:utilization|allocation|capacity)/i.test(message)) {
        intent = 'team_utilization';
      } else if (/(?:list|show|display|get|fetch)\s+(?:all\s+)?(?:my\s+)?projects?/i.test(message)) {
        intent = 'list_projects';
      } else if (/(?:list|show|display|get|fetch)\s+(?:all\s+)?(?:my\s+)?tasks?/i.test(message)) {
        intent = 'list_tasks';
      } else if (/(?:list|show|display|get|fetch)\s+(?:all\s+)?(?:my\s+)?resources?/i.test(message)) {
        intent = 'list_resources';
      } else if (/(?:status|progress)\s+(?:of|for)\s+(?:my\s+)?projects?/i.test(message)) {
        intent = 'project_status';
      } else if (/(?:status|progress)\s+(?:of|for)\s+(?:my\s+)?tasks?/i.test(message)) {
        intent = 'task_status';
      } else if (/(?:deadlines?|due)\s+/i.test(message)) {
        intent = 'deadlines';
      } else if (/(?:performance|metrics)/i.test(message)) {
        intent = 'performance';
      } else if (/(?:assignments?|assigned)/i.test(message)) {
        intent = 'assignments';
      } else {
        intent = 'analytics'; // Default to analytics for data queries
      }
      break;
    }
  }

  return { intent, entities, isDataQuery };
}

// Enhanced data response formatting
function formatDataResponse(queryResult: any, originalMessage: string): string {
  const { type, data, summary, count } = queryResult;
  
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return `${summary}. No items found matching your request.`;
  }

  let response = `📊 **${summary}**\n\n`;

  switch (type) {
    case 'projects_list':
      response += data.slice(0, 8).map((project: any, index: number) => 
        `${index + 1}. **${project.name}** (${project.status || 'Unknown'})\n   📈 Progress: ${project.progress || 0}% | 🔥 Priority: ${project.priority || 'Medium'}\n   📅 ${project.start_date ? new Date(project.start_date).toLocaleDateString() : 'No start date'} - ${project.end_date ? new Date(project.end_date).toLocaleDateString() : 'No end date'}`
      ).join('\n\n');
      if (data.length > 8) response += `\n\n... and ${data.length - 8} more projects`;
      break;
      
    case 'tasks_list':
      response += data.slice(0, 8).map((task: any, index: number) => 
        `${index + 1}. **${task.name}** (${task.status || 'Unknown'})\n   📋 Project: ${task.projects?.name || 'N/A'} | 📅 Due: ${task.end_date ? new Date(task.end_date).toLocaleDateString() : 'Not set'}\n   📊 Progress: ${task.progress || 0}% | 🔥 Priority: ${task.priority || 'Medium'}`
      ).join('\n\n');
      if (data.length > 8) response += `\n\n... and ${data.length - 8} more tasks`;
      break;
      
    case 'resources_list':
      response += data.slice(0, 8).map((resource: any, index: number) => 
        `${index + 1}. **${resource.name}** (${resource.role || 'No role'})\n   🏢 Department: ${resource.department || 'Not set'} | 📧 ${resource.email || 'No email'}`
      ).join('\n\n');
      if (data.length > 8) response += `\n\n... and ${data.length - 8} more resources`;
      break;
      
    case 'deadlines':
      response += data.slice(0, 8).map((task: any, index: number) => 
        `${index + 1}. **${task.name}** - 📅 Due: ${new Date(task.end_date).toLocaleDateString()}\n   📋 Project: ${task.projects?.name || 'N/A'} | 🔥 Priority: ${task.priority || 'Medium'}\n   📊 Status: ${task.status || 'Unknown'}`
      ).join('\n\n');
      if (data.length > 8) response += `\n\n... and ${data.length - 8} more deadlines`;
      break;
      
    case 'analytics':
      response += `📊 **Workspace Overview:**\n\n`;
      response += `🚀 **Projects:** ${data.projects.total} total\n`;
      response += `   • Status: ${Object.entries(data.projects.byStatus).map(([k, v]) => `${k}: ${v}`).join(', ')}\n\n`;
      response += `✅ **Tasks:** ${data.tasks.total} total\n`;
      response += `   • Status: ${Object.entries(data.tasks.byStatus).map(([k, v]) => `${k}: ${v}`).join(', ')}\n\n`;
      response += `👥 **Resources:** ${data.resources.total} total\n`;
      response += `   • By Department: ${Object.entries(data.resources.byDepartment).map(([k, v]) => `${k}: ${v}`).join(', ')}\n\n`;
      response += `📈 **Performance:** ${data.performance.totalMetrics} metrics tracked\n`;
      response += `   • Average Performance: ${data.performance.averagePerformance.toFixed(1)}/10`;
      break;
      
    case 'team_utilization':
      response += data.slice(0, 8).map((resource: any, index: number) => 
        `${index + 1}. **${resource.name}** (${resource.role || 'No role'})\n   🏢 ${resource.department || 'No department'}\n   📋 Active Projects: ${resource.project_assignments?.length || 0}`
      ).join('\n\n');
      if (data.length > 8) response += `\n\n... and ${data.length - 8} more team members`;
      break;
      
    case 'performance_metrics':
      response += data.slice(0, 8).map((metric: any, index: number) => 
        `${index + 1}. **${metric.type}** - Value: ${metric.value}\n   📅 Date: ${new Date(metric.timestamp).toLocaleDateString()}\n   📝 ${metric.description || 'No description'}`
      ).join('\n\n');
      if (data.length > 8) response += `\n\n... and ${data.length - 8} more metrics`;
      break;
      
    default:
      response += 'Data retrieved successfully, but formatting is not yet implemented for this query type.';
  }

  return response;
}

// Build contextual response for conversational queries
function buildContextualResponse(message: string, contextData: any): string {
  const lowerMessage = message.toLowerCase();
  
  if (/hello|hi|hey/i.test(message)) {
    return `Hello! I'm Tink, your AI assistant. I can help you with:\n\n• 📊 Project analytics and performance metrics\n• 📅 Deadlines and task management\n• 👥 Team utilization and resource allocation\n• 📈 Performance insights and recommendations\n\nWhat would you like to know about your workspace?`;
  }
  
  if (/help|what can you do/i.test(message)) {
    return `I'm here to help you manage your workspace efficiently! Here's what I can do:\n\n**📊 Analytics & Insights:**\n• Show project performance metrics\n• Analyze team productivity\n• Generate utilization reports\n\n**📅 Project Management:**\n• List upcoming deadlines\n• Track task progress\n• Monitor project status\n\n**👥 Team Management:**\n• Show resource allocation\n• Display team utilization\n• Track individual performance\n\n**🤖 Smart Queries:**\nJust ask me naturally! For example:\n• "Show me our team utilization"\n• "What deadlines are coming up?"\n• "How are our projects performing?"`;
  }
  
  if (/thank/i.test(message)) {
    return `You're welcome! I'm always here to help you stay on top of your projects and team performance. Feel free to ask me anything about your workspace data! 😊`;
  }
  
  return `I'd be happy to help you with that! To get the most relevant information, try asking me about:\n\n• 📊 "Show me project analytics"\n• 📅 "What are our upcoming deadlines?"\n• 👥 "How is our team utilization?"\n• 📈 "Show me performance metrics"\n\nWhat specific information would you like to see?`;
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

// Enhanced intent detection patterns
const INTENT_PATTERNS = {
  data_query: [
    // List/show patterns
    /(?:list|show|display|get|fetch)\s+(?:all\s+)?(?:my\s+)?(projects?|tasks?|resources?|milestones?|deadlines?|issues?)/i,
    /what\s+(?:projects?|tasks?|resources?)\s+(?:do\s+i\s+have|are\s+there)/i,
    /show\s+me\s+(?:all\s+)?(?:my\s+)?(projects?|tasks?|resources?)/i,
    
    // Status/progress patterns
    /(?:status|progress)\s+(?:of|for)\s+(?:my\s+)?(projects?|tasks?)/i,
    /(?:how\s+is|what's\s+the\s+status\s+of)\s+(?:my\s+)?(project|task)/i,
    
    // Time-based patterns
    /(?:tasks?|deadlines?|milestones?)\s+(?:for\s+)?(?:today|tomorrow|this\s+week|next\s+week)/i,
    /(?:what's\s+)?(?:due|overdue)\s+(?:today|tomorrow|this\s+week)/i,
    
    // Performance patterns
    /(?:performance|metrics|utilization)\s+(?:of|for)\s+(?:my\s+)?(resources?|team)/i,
    /(?:how\s+is|what's\s+the)\s+performance\s+of/i,
    
    // Assignment patterns
    /(?:who\s+is\s+assigned\s+to|assignments?\s+for)/i,
    /(?:what\s+(?:tasks?|projects?)\s+(?:is|are)\s+assigned\s+to)/i
  ],
  
  insight_query: [
    /(?:analyze|insights?|recommendations?|advice|suggestions?)/i,
    /(?:what\s+should\s+i|how\s+can\s+i|what's\s+the\s+best\s+way\s+to)/i,
    /(?:risks?|issues?|problems?)\s+(?:with|in)/i,
    /(?:optimize|improve|enhance)/i
  ]
};

// Database query builders
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
          return await this.getPerformance(entities);
        case 'assignments':
          return await this.getAssignments(entities);
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
        progress, created_at, updated_at,
        milestones(id, name, status, due_date, progress),
        project_tasks(id, name, status, assignee_id, start_date, end_date, progress)
      `)
      .eq('workspace_id', this.workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return {
      type: 'projects_list',
      data: data || [],
      summary: `Found ${data?.length || 0} projects in your workspace`
    };
  }

  async getTasks(entities: string[]): Promise<any> {
    let query = this.supabase
      .from('project_tasks')
      .select(`
        id, name, description, status, priority, assignee_id, 
        start_date, end_date, progress, created_at,
        projects(id, name),
        milestones(id, name)
      `)
      .in('project_id', 
        await this.supabase
          .from('projects')
          .select('id')
          .eq('workspace_id', this.workspaceId)
          .then(({ data }) => data?.map(p => p.id) || [])
      );

    // Apply filters based on entities
    if (entities.includes('today')) {
      const today = new Date().toISOString().split('T')[0];
      query = query.lte('start_date', today).gte('end_date', today);
    }
    
    if (entities.includes('overdue')) {
      const today = new Date().toISOString().split('T')[0];
      query = query.lt('end_date', today).neq('status', 'Completed');
    }

    const { data, error } = await query.order('start_date', { ascending: true });
    
    if (error) throw error;

    return {
      type: 'tasks_list',
      data: data || [],
      summary: `Found ${data?.length || 0} tasks matching your criteria`
    };
  }

  async getResources(): Promise<any> {
    const { data, error } = await this.supabase
      .from('resources')
      .select(`
        id, name, email, role, department, hourly_rate,
        created_at, updated_at
      `)
      .eq('workspace_id', this.workspaceId)
      .order('name', { ascending: true });

    if (error) throw error;

    return {
      type: 'resources_list',
      data: data || [],
      summary: `Found ${data?.length || 0} resources in your workspace`
    };
  }

  async getProjectStatus(entities: string[]): Promise<any> {
    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        id, name, status, progress, start_date, end_date,
        project_tasks(count),
        project_tasks!inner(status)
      `)
      .eq('workspace_id', this.workspaceId);

    if (error) throw error;

    const projectsWithStats = data?.map(project => {
      // Count tasks by status (this is a simplified approach)
      return {
        ...project,
        total_tasks: project.project_tasks?.length || 0,
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
        projects(id, name),
        resources(id, name, email)
      `)
      .in('project_id', 
        await this.supabase
          .from('projects')
          .select('id')
          .eq('workspace_id', this.workspaceId)
          .then(({ data }) => data?.map(p => p.id) || [])
      )
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

  async getDeadlines(entities: string[]): Promise<any> {
    const days = entities.includes('today') ? 0 : 
                 entities.includes('tomorrow') ? 1 : 
                 entities.includes('week') ? 7 : 30;
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('project_tasks')
      .select(`
        id, name, end_date, status, priority,
        projects(id, name),
        milestones(id, name, due_date)
      `)
      .in('project_id', 
        await this.supabase
          .from('projects')
          .select('id')
          .eq('workspace_id', this.workspaceId)
          .then(({ data }) => data?.map(p => p.id) || [])
      )
      .gte('end_date', todayStr)
      .lte('end_date', futureDateStr)
      .order('end_date', { ascending: true });

    if (error) throw error;

    return {
      type: 'deadlines',
      data: data || [],
      summary: `Found ${data?.length || 0} upcoming deadlines`
    };
  }

  async getPerformance(entities: string[]): Promise<any> {
    const { data, error } = await this.supabase
      .from('performance_metrics')
      .select(`
        id, resource_id, type, value, timestamp,
        resources(id, name, role)
      `)
      .eq('workspace_id', this.workspaceId)
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return {
      type: 'performance_metrics',
      data: data || [],
      summary: `Performance data for the last 30 days`
    };
  }

  async getAssignments(entities: string[]): Promise<any> {
    const { data, error } = await this.supabase
      .from('project_tasks')
      .select(`
        id, name, assignee_id, status, start_date, end_date,
        projects(id, name),
        resources(id, name, email, role)
      `)
      .in('project_id', 
        await this.supabase
          .from('projects')
          .select('id')
          .eq('workspace_id', this.workspaceId)
          .then(({ data }) => data?.map(p => p.id) || [])
      )
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

    // Get user context from enhanced-ai-context function
    const contextResponse = await supabase.functions.invoke('enhanced-ai-context', {
      body: { userId, workspaceId, contextType: 'full' }
    });

    const { context } = contextResponse.data || {};

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
        
        // Optional: Add AI insights to the data
        if (queryResult.data && queryResult.data.length > 0) {
          const insightPrompt = buildInsightPrompt(context, queryResult, message);
          const aiInsight = await getAIInsight(insightPrompt, context);
          if (aiInsight) {
            assistantMessage += '\n\n🔍 **AI Insights:**\n' + aiInsight;
          }
        }
      }
    } else {
      // Handle conversational queries with AI model
      console.log('Processing conversational query');
      responseType = 'conversational';
      
      // Get conversation history if enabled
      let conversationHistory = [];
      if (context?.aiSettings?.conversation_history_enabled) {
        const { data: history } = await supabase
          .from('ai_conversation_history')
          .select('message_role, message_content')
          .eq('user_id', userId)
          .eq('workspace_id', workspaceId)
          .eq('conversation_type', 'tink_assistant')
          .order('created_at', { ascending: true })
          .limit(20);

        conversationHistory = history || [];
      }

      // Build enhanced system prompt
      const systemPrompt = buildEnhancedSystemPrompt(context, responseType);

      // Prepare messages for AI
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(h => ({
          role: h.message_role === 'user' ? 'user' : 'assistant',
          content: h.message_content
        })),
        { role: 'user', content: message }
      ];

      // Get preferred model from AI settings
      const model = getModelFromSettings(context?.aiSettings?.preferred_model || 'auto');

      // Call OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Title': 'Tink AI Assistant'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const aiResponse = await response.json();
      assistantMessage = aiResponse.choices[0]?.message?.content || 'I apologize, but I cannot provide a response right now.';
    }

    // Save conversation history
    if (context?.aiSettings?.conversation_history_enabled) {
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
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: assistantMessage,
        responseType,
        queryResult: queryResult ? { 
          type: queryResult.type, 
          summary: queryResult.summary,
          dataCount: queryResult.data?.length || 0
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

function buildSystemPrompt(context: any): string {
  const user = context?.user || {};
  const personality = context?.aiSettings?.chat_personality || 'professional';
  const awarenessLevel = context?.aiSettings?.context_awareness_level || 'standard';

  let prompt = `You are Tink, an AI assistant for project management and resource allocation. `;

  // Personality adjustment
  switch (personality) {
    case 'friendly':
      prompt += `You have a warm, encouraging, and supportive personality. Use casual language and show enthusiasm for helping users succeed. `;
      break;
    case 'technical':
      prompt += `You are detail-oriented and technical. Provide precise, data-driven responses with specific metrics and actionable insights. `;
      break;
    default: // professional
      prompt += `You maintain a professional, helpful tone while being approachable and clear in your communication. `;
  }

  prompt += `The user's name is ${user.name || 'there'} and they have the role of ${user.role || 'team member'} in their workspace. `;

  if (awarenessLevel === 'advanced' && context.projects) {
    prompt += `Current projects context: ${JSON.stringify(context.projects.slice(0, 3))}. `;
  }

  if (awarenessLevel !== 'basic' && context.performance) {
    prompt += `Recent performance data available for personalized insights. `;
  }

  prompt += `Your capabilities include:
  - Project status updates and insights
  - Resource allocation recommendations  
  - Performance analysis and trends
  - Task management assistance
  - Deadline and milestone tracking
  - Team collaboration insights

  Keep responses concise (under 200 words) and actionable. If you need more context for a specific question, ask clarifying questions.`;

  return prompt;
}

// Enhanced intent detection and entity extraction
function detectIntentAndEntities(message: string): { intent: string | null, entities: string[], isDataQuery: boolean } {
  const lowerMessage = message.toLowerCase();
  const entities: string[] = [];
  
  // Extract time entities
  if (/\btoday\b/i.test(message)) entities.push('today');
  if (/\btomorrow\b/i.test(message)) entities.push('tomorrow');
  if (/\bthis\s+week\b/i.test(message)) entities.push('week');
  if (/\bnext\s+week\b/i.test(message)) entities.push('week');
  if (/\boverdue\b/i.test(message)) entities.push('overdue');
  
  // Extract object entities
  if (/\bprojects?\b/i.test(message)) entities.push('projects');
  if (/\btasks?\b/i.test(message)) entities.push('tasks');
  if (/\bresources?\b/i.test(message)) entities.push('resources');
  if (/\bdeadlines?\b/i.test(message)) entities.push('deadlines');
  if (/\bmilestones?\b/i.test(message)) entities.push('milestones');
  if (/\bperformance\b/i.test(message)) entities.push('performance');
  if (/\bassignments?\b/i.test(message)) entities.push('assignments');

  // Check for data query patterns
  let intent = null;
  let isDataQuery = false;

  for (const pattern of INTENT_PATTERNS.data_query) {
    if (pattern.test(message)) {
      isDataQuery = true;
      
      // Determine specific intent
      if (/(?:list|show|display|get|fetch)\s+(?:all\s+)?(?:my\s+)?projects?/i.test(message)) {
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
      } else if (/(?:performance|metrics|utilization)/i.test(message)) {
        intent = 'performance';
      } else if (/(?:assignments?|assigned)/i.test(message)) {
        intent = 'assignments';
      } else {
        intent = 'list_projects'; // Default fallback
      }
      break;
    }
  }

  return { intent, entities, isDataQuery };
}

// Format data responses for user-friendly display
function formatDataResponse(queryResult: any, originalMessage: string): string {
  const { type, data, summary } = queryResult;
  
  if (!data || data.length === 0) {
    return `${summary}. No items found matching your request.`;
  }

  let response = `${summary}:\n\n`;

  switch (type) {
    case 'projects_list':
      response += data.slice(0, 10).map((project: any, index: number) => 
        `${index + 1}. **${project.name}** (${project.status || 'Unknown'})\n   Progress: ${project.progress || 0}% | Priority: ${project.priority || 'Not set'}`
      ).join('\n\n');
      if (data.length > 10) response += `\n\n... and ${data.length - 10} more projects`;
      break;
      
    case 'tasks_list':
      response += data.slice(0, 10).map((task: any, index: number) => 
        `${index + 1}. **${task.name}** (${task.status || 'Unknown'})\n   Project: ${task.projects?.name || 'N/A'} | Due: ${task.end_date ? new Date(task.end_date).toLocaleDateString() : 'Not set'}`
      ).join('\n\n');
      if (data.length > 10) response += `\n\n... and ${data.length - 10} more tasks`;
      break;
      
    case 'resources_list':
      response += data.slice(0, 10).map((resource: any, index: number) => 
        `${index + 1}. **${resource.name}** (${resource.role || 'No role'})\n   Department: ${resource.department || 'Not set'} | Email: ${resource.email || 'N/A'}`
      ).join('\n\n');
      if (data.length > 10) response += `\n\n... and ${data.length - 10} more resources`;
      break;
      
    case 'deadlines':
      response += data.slice(0, 10).map((task: any, index: number) => 
        `${index + 1}. **${task.name}** - Due: ${new Date(task.end_date).toLocaleDateString()}\n   Project: ${task.projects?.name || 'N/A'} | Priority: ${task.priority || 'Medium'}`
      ).join('\n\n');
      if (data.length > 10) response += `\n\n... and ${data.length - 10} more deadlines`;
      break;
      
    case 'project_status':
      response += data.slice(0, 10).map((project: any, index: number) => 
        `${index + 1}. **${project.name}** - ${project.health_status}\n   Status: ${project.status} | Progress: ${project.progress || 0}% | Tasks: ${project.total_tasks}`
      ).join('\n\n');
      if (data.length > 10) response += `\n\n... and ${data.length - 10} more projects`;
      break;
      
    case 'assignments':
      response += data.slice(0, 10).map((task: any, index: number) => 
        `${index + 1}. **${task.name}** → ${task.resources?.name || 'Unassigned'}\n   Project: ${task.projects?.name || 'N/A'} | Status: ${task.status || 'Unknown'}`
      ).join('\n\n');
      if (data.length > 10) response += `\n\n... and ${data.length - 10} more assignments`;
      break;
      
    case 'performance_metrics':
      response += data.slice(0, 10).map((metric: any, index: number) => 
        `${index + 1}. **${metric.resources?.name || 'Unknown'}** - ${metric.type}\n   Value: ${metric.value} | Date: ${new Date(metric.timestamp).toLocaleDateString()}`
      ).join('\n\n');
      if (data.length > 10) response += `\n\n... and ${data.length - 10} more metrics`;
      break;
      
    default:
      response += 'Data retrieved successfully, but formatting is not yet implemented for this query type.';
  }

  return response;
}

// Build insight prompt for AI analysis
function buildInsightPrompt(context: any, queryResult: any, originalMessage: string): string {
  return `Analyze this project management data and provide 2-3 key insights:

Data Type: ${queryResult.type}
Data Summary: ${queryResult.summary}
Sample Data: ${JSON.stringify(queryResult.data?.slice(0, 3) || [])}

User Question: "${originalMessage}"
User Context: ${context?.user?.name || 'User'} (${context?.user?.role || 'team member'})

Provide actionable insights focusing on:
- Key patterns or trends
- Potential risks or opportunities  
- Specific recommendations
- Priority actions

Keep response under 150 words and be specific.`;
}

// Get AI insight for data analysis
async function getAIInsight(prompt: string, context: any): Promise<string | null> {
  try {
    const model = getModelFromSettings(context?.aiSettings?.preferred_model || 'auto');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Title': 'Tink AI Insights'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a project management analyst providing concise, actionable insights.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 300
      })
    });

    if (!response.ok) return null;
    
    const aiResponse = await response.json();
    return aiResponse.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('Failed to get AI insight:', error);
    return null;
  }
}

// Enhanced system prompt for conversational queries
function buildEnhancedSystemPrompt(context: any, responseType: string): string {
  const user = context?.user || {};
  const personality = context?.aiSettings?.chat_personality || 'professional';
  const awarenessLevel = context?.aiSettings?.context_awareness_level || 'standard';

  let prompt = `You are Tink, an advanced AI assistant for project management and resource allocation with full database access. `;

  // Personality adjustment
  switch (personality) {
    case 'friendly':
      prompt += `You have a warm, encouraging, and supportive personality. Use casual language and show enthusiasm for helping users succeed. `;
      break;
    case 'technical':
      prompt += `You are detail-oriented and technical. Provide precise, data-driven responses with specific metrics and actionable insights. `;
      break;
    default: // professional
      prompt += `You maintain a professional, helpful tone while being approachable and clear in your communication. `;
  }

  prompt += `The user's name is ${user.name || 'there'} and they have the role of ${user.role || 'team member'} in their workspace. `;

  if (awarenessLevel === 'advanced' && context.projects) {
    prompt += `Current projects context: ${JSON.stringify(context.projects.slice(0, 5))}. `;
  }

  if (awarenessLevel !== 'basic' && context.performance) {
    prompt += `Recent performance data available for personalized insights. `;
  }

  prompt += `Your enhanced capabilities include:
  - Direct database queries for real-time project data
  - Comprehensive project status analysis and insights
  - Resource allocation and utilization recommendations  
  - Performance analysis and trend identification
  - Task management and deadline tracking
  - Team collaboration and efficiency insights
  - Risk assessment and opportunity identification
  - Custom data analysis and reporting

  You can now answer specific data questions like:
  - "List all my projects" - provides actual project data
  - "Show tasks due today" - returns real deadline information
  - "What's the status of my team?" - gives current resource utilization
  - "Performance metrics for this month" - displays actual performance data

  For conversational queries, provide strategic insights, recommendations, and guidance.
  Keep responses informative yet concise (under 300 words) and always actionable.`;

  return prompt;
}

function getModelFromSettings(preferredModel: string): string {
  switch (preferredModel) {
    case 'gpt-4o-mini':
      return 'openai/gpt-4o-mini';
    case 'claude-3-haiku':
      return 'anthropic/claude-3-haiku';
    case 'mistral-7b':
      return 'mistralai/mistral-7b-instruct';
    default:
      return 'openai/gpt-4o-mini'; // Default fast model
  }
}
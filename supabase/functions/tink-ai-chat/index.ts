import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenRouter API integration for natural language to SQL conversion
class OpenRouterAI {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateSQLQuery(userQuestion: string, conversationHistory: any[] = []): Promise<{ sql: string, queryType: string }> {
    const databaseSchema = `
    Database Schema:
    - projects: id, name, description, status, priority, start_date, end_date, progress, workspace_id
    - project_tasks: id, name, description, status, priority, assignee_id, start_date, end_date, progress, project_id, milestone_id
    - resources: id, name, email, role, department, workspace_id
    - milestones: id, name, description, due_date, progress, project_id, status
    - performance_metrics: id, resource_id, type, value, timestamp, workspace_id, description
    - performance_profiles: id, resource_id, resource_name, current_score, monthly_score, trend, risk_level, workspace_id
    - project_issues: id, title, description, status, priority, severity, project_id, created_by, assignee_id
    - client_satisfaction: id, client_name, satisfaction_score, survey_date, project_id, workspace_id
    - project_budgets: id, project_id, budget_category, allocated_amount, spent_amount, currency
    - calendar_events: id, title, start_date, end_date, project_id, task_id, workspace_id
    `;

    const contextPrompt = conversationHistory.length > 0 
      ? `Previous conversation context: ${conversationHistory.slice(-3).map(h => `${h.message_role}: ${h.message_content}`).join('\n')}`
      : '';

    const prompt = `You are a SQL query generator. Convert the following natural language question into a SQL query.

${databaseSchema}

${contextPrompt}

User Question: "${userQuestion}"

Rules:
1. Only use tables and columns from the schema above
2. Always filter by workspace_id when querying main tables
3. Use proper JOINs for related data
4. Return SELECT queries only
5. Limit results to 50 for performance
6. Use appropriate WHERE clauses for date/time filters

Return JSON with: {"sql": "your_sql_query", "queryType": "descriptive_name"}

Examples:
- "Show me my projects" -> {"sql": "SELECT * FROM projects WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 50", "queryType": "projects_list"}
- "Team performance this month" -> {"sql": "SELECT pm.*, r.name as resource_name FROM performance_metrics pm JOIN resources r ON pm.resource_id = r.id WHERE pm.workspace_id = $1 AND pm.timestamp >= date_trunc('month', CURRENT_DATE) LIMIT 50", "queryType": "performance_metrics"}
`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://lovable.dev',
          'X-Title': 'Tink AI Assistant'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            { role: 'system', content: 'You are a helpful SQL query generator. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '{}';
      
      try {
        const parsed = JSON.parse(content);
        return {
          sql: parsed.sql || '',
          queryType: parsed.queryType || 'general'
        };
      } catch (parseError) {
        console.error('Failed to parse OpenRouter response:', content);
        return { sql: '', queryType: 'error' };
      }
    } catch (error) {
      console.error('OpenRouter API error:', error);
      return { sql: '', queryType: 'error' };
    }
  }

  async generateConversationalResponse(userQuestion: string, queryResults: any, conversationHistory: any[] = []): Promise<string> {
    const contextPrompt = conversationHistory.length > 0 
      ? `Previous conversation: ${conversationHistory.slice(-3).map(h => `${h.message_role}: ${h.message_content}`).join('\n')}`
      : '';

    const prompt = `You are Tink, a friendly and knowledgeable AI project management assistant. 

${contextPrompt}

User asked: "${userQuestion}"

Query results: ${JSON.stringify(queryResults, null, 2)}

Generate a natural, conversational response that:
1. Addresses the user's question directly
2. Presents the data in an easy-to-understand format
3. Offers insights or observations about the data
4. Asks relevant follow-up questions when appropriate
5. Uses a friendly, professional tone
6. Keeps the response concise but informative

If there's no data or an error occurred, politely explain and offer alternative ways to help.
`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://lovable.dev',
          'X-Title': 'Tink AI Assistant'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            { role: 'system', content: 'You are Tink, a friendly AI assistant specializing in project management. Be conversational and helpful.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "I'm having trouble generating a response right now. Could you try rephrasing your question?";
    } catch (error) {
      console.error('OpenRouter response generation error:', error);
      return "I'm experiencing some technical difficulties right now. Let me try to help you in a different way.";
    }
  }
}

// Enhanced database query engine with OpenRouter integration
class TinkQueryEngine {
  constructor(private supabase: any, private userId: string, private workspaceId: string, private openRouter: OpenRouterAI) {}

  async processNaturalLanguageQuery(userQuestion: string, conversationHistory: any[] = []): Promise<any> {
    console.log(`Processing natural language query: ${userQuestion}`);
    
    try {
      // Step 1: Generate SQL using OpenRouter
      const { sql, queryType } = await this.openRouter.generateSQLQuery(userQuestion, conversationHistory);
      
      if (!sql || sql.trim() === '') {
        return {
          type: 'error',
          message: "I couldn't understand how to query that data. Could you try rephrasing your question?",
          error: 'SQL generation failed'
        };
      }

      console.log(`Generated SQL (${queryType}):`, sql);

      // Step 2: Execute the generated SQL
      const queryResult = await this.executeSQLQuery(sql, queryType);
      
      // Step 3: Generate conversational response
      const conversationalResponse = await this.openRouter.generateConversationalResponse(
        userQuestion, 
        queryResult, 
        conversationHistory
      );

      return {
        type: queryType,
        data: queryResult.data,
        message: conversationalResponse,
        sql: sql, // For debugging
        count: queryResult.count || 0
      };
    } catch (error) {
      console.error('Natural language query processing error:', error);
      return {
        type: 'error',
        message: "I encountered an issue processing your request. Let me try to help you in another way.",
        error: error.message
      };
    }
  }

  async executeSQLQuery(sql: string, queryType: string): Promise<any> {
    try {
      // Replace $1 placeholder with actual workspace_id
      const processedSQL = sql.replace(/\$1/g, `'${this.workspaceId}'`);
      
      // Use Supabase's .rpc() method to execute raw SQL safely
      const { data, error } = await this.supabase.rpc('execute_sql', { 
        query: processedSQL 
      });

      if (error) {
        console.error('SQL execution error:', error);
        // Fall back to predefined queries for common requests
        return await this.fallbackQuery(queryType);
      }

      return {
        type: queryType,
        data: data || [],
        count: Array.isArray(data) ? data.length : 0
      };
    } catch (error) {
      console.error('SQL execution error:', error);
      return await this.fallbackQuery(queryType);
    }
  }

  async fallbackQuery(queryType: string): Promise<any> {
    console.log(`Using fallback query for type: ${queryType}`);
    
    try {
      switch (queryType) {
        case 'projects_list':
          return await this.getProjects();
        case 'tasks_list':
          return await this.getTasks([]);
        case 'resources_list':
          return await this.getResources();
        case 'performance_metrics':
          return await this.getPerformanceMetrics([]);
        case 'team_utilization':
          return await this.getTeamUtilization();
        case 'deadlines':
          return await this.getDeadlines(['upcoming']);
        case 'analytics':
          return await this.getAnalytics([]);
        default:
          return await this.getAnalytics([]); // Default to analytics overview
      }
    } catch (error) {
      console.error('Fallback query error:', error);
      return {
        type: 'error',
        data: [],
        count: 0,
        message: "I'm having trouble accessing your data right now."
      };
    }
  }

  async getProjects(): Promise<any> {
    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        id, name, description, status, priority, start_date, end_date, 
        progress, created_at, updated_at, workspace_id
      `)
      .eq('workspace_id', this.workspaceId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
    
    return {
      type: 'projects_list',
      data: data || [],
      count: data?.length || 0
    };
  }

  async getTasks(entities: string[]): Promise<any> {
    let query = this.supabase
      .from('project_tasks')
      .select(`
        id, name, description, status, priority, assignee_id, 
        start_date, end_date, progress, created_at, project_id
      `)
      .in('project_id', 
        this.supabase
          .from('projects')
          .select('id')
          .eq('workspace_id', this.workspaceId)
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

    if (entities.includes('upcoming')) {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      query = query.gte('start_date', today).lte('start_date', futureDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query
      .order('start_date', { ascending: true })
      .limit(50);
    
    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    return {
      type: 'tasks_list',
      data: data || [],
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
      .order('name', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }

    return {
      type: 'resources_list',
      data: data || [],
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
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }

    return {
      type: 'performance_metrics',
      data: data || [],
      count: data?.length || 0
    };
  }

  async getTeamUtilization(): Promise<any> {
    const { data: resources, error: resourceError } = await this.supabase
      .from('resources')
      .select(`
        id, name, role, department
      `)
      .eq('workspace_id', this.workspaceId)
      .limit(50);

    if (resourceError) {
      console.error('Error fetching team utilization:', resourceError);
      throw resourceError;
    }

    return {
      type: 'team_utilization',
      data: resources || [],
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
        id, name, end_date, status, priority, project_id
      `)
      .in('project_id', 
        this.supabase
          .from('projects')
          .select('id')
          .eq('workspace_id', this.workspaceId)
      )
      .gte('end_date', today)
      .lte('end_date', futureDateStr)
      .order('end_date', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error fetching deadlines:', error);
      throw error;
    }

    return {
      type: 'deadlines',
      data: data || [],
      count: data?.length || 0
    };
  }

  async getAnalytics(entities: string[]): Promise<any> {
    try {
      // Get basic analytics data
      const [projectsData, tasksData, resourcesData] = await Promise.all([
        this.getProjects(),
        this.getTasks([]),
        this.getResources()
      ]);

      const analytics = {
        projects: {
          total: projectsData.count,
          data: projectsData.data?.slice(0, 5) || [] // Show top 5 projects
        },
        tasks: {
          total: tasksData.count,
          data: tasksData.data?.slice(0, 5) || [] // Show top 5 tasks
        },
        resources: {
          total: resourcesData.count,
          data: resourcesData.data?.slice(0, 5) || [] // Show top 5 resources
        }
      };

      return {
        type: 'analytics',
        data: analytics,
        count: Object.keys(analytics).length
      };
    } catch (error) {
      console.error('Error in getAnalytics:', error);
      return {
        type: 'analytics',
        data: { projects: { total: 0, data: [] }, tasks: { total: 0, data: [] }, resources: { total: 0, data: [] } },
        count: 0
      };
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for OpenRouter API key
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'OpenRouter API key not configured',
          message: "I need the OpenRouter API key to provide intelligent responses. Please configure it in your environment." 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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

    // Initialize OpenRouter AI and query engine
    const openRouter = new OpenRouterAI(openRouterApiKey);
    const queryEngine = new TinkQueryEngine(supabase, userId, workspaceId, openRouter);

    // Load recent conversation history for context
    const { data: conversationHistory } = await supabase
      .from('ai_conversation_history')
      .select('message_role, message_content, created_at')
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .eq('conversation_type', 'tink_assistant')
      .order('created_at', { ascending: false })
      .limit(6); // Last 3 exchanges (6 messages)

    // Process the query using OpenRouter intelligence
    const queryResult = await queryEngine.processNaturalLanguageQuery(
      message, 
      conversationHistory?.reverse() || []
    );

    const assistantMessage = queryResult.message || "I'm having trouble generating a response right now. Could you try rephrasing your question?";

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
          queryType: queryResult.type
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
          responseType: 'openrouter_enhanced',
          queryResult: queryResult ? { 
            type: queryResult.type, 
            dataCount: queryResult.count || 0 
          } : null
        }
      }
    ]);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: assistantMessage,
        responseType: 'openrouter_enhanced',
        queryResult: queryResult ? { 
          type: queryResult.type, 
          dataCount: queryResult.count || 0,
          hasData: (queryResult.count || 0) > 0
        } : null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in tink-ai-chat function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: "I'm experiencing technical difficulties right now. Please try again in a moment."
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
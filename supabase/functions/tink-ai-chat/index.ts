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
    const conversationContext = conversationHistory.length > 0 
      ? `\n\nPrevious conversation context:\n${conversationHistory.slice(-3).map(msg => `${msg.message_role}: ${msg.message_content}`).join('\n')}`
      : '';

    const prompt = `You are an expert SQL assistant for a project management platform. 
Your job is to convert user requests into safe, correct SQL queries for a PostgreSQL database. 
Only generate SELECT queries. Never generate INSERT, UPDATE, DELETE, DROP, or ALTER statements.

## Database Schema

### projects
- id (UUID, primary key)
- name (TEXT)
- description (TEXT)
- status (TEXT: 'Planning', 'In Progress', 'Completed', 'On Hold')
- priority (TEXT: 'Low', 'Medium', 'High', 'Critical')
- workspace_id (UUID)
- start_date (DATE)
- end_date (DATE)
- progress (INTEGER 0-100)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- resources (UUID[])

### project_tasks
- id (UUID, primary key)
- name (TEXT)
- description (TEXT)
- start_date (DATE)
- end_date (DATE)
- status (TEXT: 'Not Started', 'In Progress', 'Completed', 'Blocked')
- priority (TEXT: 'Low', 'Medium', 'High', 'Critical')
- progress (INTEGER 0-100)
- project_id (UUID, foreign key to projects)
- assignee_id (UUID, foreign key to resources)
- milestone_id (UUID, foreign key to milestones)
- dependencies (TEXT[])
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### resources
- id (UUID, primary key)
- name (TEXT)
- email (TEXT)
- role (TEXT)
- department (TEXT)
- skills (TEXT[])
- workspace_id (UUID)
- availability_hours (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### milestones
- id (UUID, primary key)
- name (TEXT)
- description (TEXT)
- due_date (DATE)
- project_id (UUID, foreign key to projects)
- status (TEXT: 'Upcoming', 'In Progress', 'Completed', 'Overdue')
- progress (INTEGER 0-100)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### performance_profiles
- id (UUID, primary key)
- resource_id (UUID, foreign key to resources)
- resource_name (TEXT)
- workspace_id (UUID)
- current_score (NUMERIC)
- monthly_score (NUMERIC)
- trend (TEXT: 'improving', 'stable', 'declining')
- risk_level (TEXT: 'low', 'medium', 'high')
- strengths (TEXT[])
- improvement_areas (TEXT[])
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## Instructions

- Only use the tables and columns listed above
- Use parameterized values: $1 for workspace_id
- If user asks for "today", use CURRENT_DATE
- If user asks for "this month", use date functions to filter current month
- Never return more than 50 rows unless user requests all results
- Always include ORDER BY clause for consistent results
- Use COUNT(*) for counting queries
- Use aggregate functions (SUM, AVG, MAX, MIN) for summaries
- For JOIN queries, use proper table aliases
- Handle NULL values appropriately

## Example Queries

User: "Show me all projects in my workspace"
Response: {
  "sql": "SELECT id, name, status, priority, start_date, end_date, progress FROM projects WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 50",
  "queryType": "projects_list"
}

User: "What tasks are due today?"
Response: {
  "sql": "SELECT pt.id, pt.name, pt.status, pt.end_date, r.name as assignee_name, p.name as project_name FROM project_tasks pt JOIN projects p ON pt.project_id = p.id LEFT JOIN resources r ON pt.assignee_id = r.id WHERE p.workspace_id = $1 AND DATE(pt.end_date) = CURRENT_DATE AND pt.status != 'Completed' ORDER BY pt.priority DESC, pt.end_date ASC LIMIT 50",
  "queryType": "tasks_due_today"
}

User: "Team utilization this month"
Response: {
  "sql": "SELECT r.name as resource_name, r.role, r.department, pp.current_score, pp.monthly_score, pp.trend, pp.risk_level, COUNT(DISTINCT pt.id) as assigned_tasks, AVG(pt.progress) as avg_task_progress FROM resources r LEFT JOIN performance_profiles pp ON r.id = pp.resource_id AND pp.workspace_id = $1 LEFT JOIN project_tasks pt ON r.id = pt.assignee_id WHERE r.workspace_id = $1 GROUP BY r.id, r.name, r.role, r.department, pp.current_score, pp.monthly_score, pp.trend, pp.risk_level ORDER BY pp.current_score DESC LIMIT 50",
  "queryType": "team_utilization_metrics"
}

User Question: "${userQuestion}"${conversationContext}

Respond with only a JSON object in this exact format:
{
  "sql": "your SELECT query here with $1 as workspace_id parameter",
  "queryType": "descriptive_name_for_query_type"
}`;

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
    const conversationContext = conversationHistory.length > 0 
      ? `\n\nPrevious conversation context:\n${conversationHistory.slice(-3).map(msg => `${msg.message_role}: ${msg.message_content}`).join('\n')}`
      : '';

    let prompt: string;

    if (queryResults === null) {
      // Chat mode: No database query, just conversation
      prompt = `You are Tink, a helpful AI assistant specializing in project management and productivity. 
You help users with analysis, planning, advice, and general questions about project management best practices.

User Question: "${userQuestion}"${conversationContext}

Instructions:
- Be conversational, friendly, and helpful
- Provide expert advice on project management topics
- Offer actionable insights and recommendations
- Help with planning, analysis, and decision-making
- If the user asks for specific data, suggest they switch to Agent mode for database queries
- Keep responses informative but not overly long
- End with helpful suggestions when appropriate

Respond as Tink:`;
    } else {
      // Agent mode: Use database results
      const dataContext = queryResults && queryResults.length > 0 
        ? `\n\nQuery Results:\n${JSON.stringify(queryResults, null, 2)}`
        : '\n\nNo data was found for this query.';

      prompt = `You are Tink, a helpful AI assistant for project management. 
Respond to the user's question in a conversational, friendly way using the provided data.

User Question: "${userQuestion}"${dataContext}${conversationContext}

Instructions:
- Be conversational and helpful
- Use the query results to provide specific, actionable insights
- If no data is found, explain what might be the reason and suggest alternatives
- Keep responses concise but informative
- Use bullet points or formatting to make information easy to read
- Include relevant numbers and metrics from the data
- End with a helpful suggestion or follow-up question when appropriate

Respond as Tink:`;
    }

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

  async processNaturalLanguageQuery(userQuestion: string, conversationHistory: any[] = [], mode: string = 'agent'): Promise<any> {
    console.log(`Processing natural language query: ${userQuestion} (mode: ${mode})`);
    
    try {
      if (mode === 'chat') {
        // Chat mode: Use OpenRouter for conversational responses only
        const conversationalResponse = await this.openRouter.generateConversationalResponse(
          userQuestion, 
          null, // No query results in chat mode
          conversationHistory
        );
        
        return {
          message: conversationalResponse,
          queryType: 'conversation',
          sql: null,
          results: null,
          success: true,
          mode: 'chat'
        };
      } else {
        // Agent mode: Generate SQL and execute queries
        const { sql, queryType } = await this.openRouter.generateSQLQuery(userQuestion, conversationHistory);
        console.log(`Generated SQL (${queryType}): ${sql}`);
        
        // Execute the SQL query
        const queryResults = await this.executeSQLQuery(sql, queryType);
        
        // Generate conversational response with data
        const conversationalResponse = await this.openRouter.generateConversationalResponse(
          userQuestion, 
          queryResults.data, 
          conversationHistory
        );
        
        return {
          message: conversationalResponse,
          queryType,
          sql,
          results: queryResults.data,
          success: true,
          mode: 'agent'
        };
      }
    } catch (error) {
      console.error('Error processing natural language query:', error);
      return {
        message: "I apologize, but I encountered an error while processing your request. Could you please rephrase your question or try asking something different?",
        error: error.message,
        success: false
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

    const { message, userId, workspaceId, mode = 'agent' } = await req.json();

    if (!message || !userId || !workspaceId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing message: ${message} for user: ${userId} in workspace: ${workspaceId} (mode: ${mode})`);

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
      conversationHistory?.reverse() || [],
      mode
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
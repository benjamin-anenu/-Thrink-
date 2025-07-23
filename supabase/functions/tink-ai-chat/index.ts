import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced OpenRouter AI integration with natural response processing
class EnhancedOpenRouterAI {
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

  async generateNaturalResponse(userQuestion: string, queryResults: any, conversationHistory: any[] = [], mode: string = 'agent'): Promise<string> {
    const conversationContext = conversationHistory.length > 0 
      ? `\n\nPrevious conversation context:\n${conversationHistory.slice(-3).map(msg => `${msg.message_role}: ${msg.message_content}`).join('\n')}`
      : '';

    let prompt: string;

    if (mode === 'chat') {
      // Chat mode: No database query, just conversation
      prompt = `You are Tink, a friendly and intelligent AI assistant specializing in project management and productivity. 
You're knowledgeable, helpful, and genuinely interested in helping users succeed with their projects.

User Question: "${userQuestion}"${conversationContext}

Instructions:
- Be conversational, warm, and engaging like a helpful colleague
- Provide expert advice on project management topics with specific, actionable insights
- Share best practices, methodologies, and practical tips
- Help with planning, analysis, problem-solving, and decision-making
- Use examples and scenarios to illustrate your points
- If the user asks for specific data, suggest they try Agent mode for database queries
- Show genuine interest in their success and challenges
- Keep responses informative but conversational, not overly technical
- End with helpful follow-up questions or suggestions when appropriate

Respond as Tink with enthusiasm and expertise:`;
    } else {
      // Agent mode: Use database results for intelligent analysis
      const dataContext = queryResults && queryResults.length > 0 
        ? `\n\nQuery Results (${queryResults.length} records):\n${JSON.stringify(queryResults, null, 2)}`
        : '\n\nNo data was found for this query.';

      prompt = `You are Tink, an intelligent AI assistant specializing in project management data analysis. 
You excel at turning raw data into actionable insights and recommendations.

User Question: "${userQuestion}"${dataContext}${conversationContext}

Instructions:
- Analyze the data thoroughly and provide specific, actionable insights
- Use exact numbers, percentages, and metrics from the data
- Identify patterns, trends, and potential issues or opportunities
- Provide clear recommendations based on the analysis
- If no data is found, explain possible reasons and suggest alternatives
- Use bullet points or formatting to make complex information digestible
- Highlight key metrics and what they mean for project success
- Include comparisons, benchmarks, or context when relevant
- End with specific next steps or follow-up suggestions
- Be conversational but data-driven and analytical

Examples of great responses:
- "I analyzed your team's performance data and found some interesting patterns..."
- "Based on the 23 active tasks I found, here's what stands out..."
- "Your resource utilization shows 3 key trends that need attention..."

Respond as Tink with analytical expertise:`;
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
            { role: 'system', content: 'You are Tink, an intelligent and helpful AI assistant specializing in project management. Be conversational, insightful, and genuinely helpful.' },
            { role: 'user', content: prompt }
          ],
          temperature: mode === 'chat' ? 0.8 : 0.7, // Higher temperature for chat mode
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "I'm having trouble generating a response right now. Could you try rephrasing your question?";
    } catch (error) {
      console.error('OpenRouter response generation error:', error);
      return mode === 'chat' 
        ? "I'm experiencing some technical difficulties right now. Let me try to help you in a different way - what specific project management challenge are you facing?"
        : "I'm having trouble analyzing that data right now. Could you try asking about a specific aspect of your projects or team?";
    }
  }
}

// Enhanced database query engine with intelligent processing
class EnhancedTinkQueryEngine {
  constructor(private supabase: any, private userId: string, private workspaceId: string, private openRouter: EnhancedOpenRouterAI) {}

  async processIntelligentQuery(userQuestion: string, conversationHistory: any[] = [], mode: string = 'agent'): Promise<any> {
    console.log(`[Enhanced Tink] Processing: "${userQuestion}" (mode: ${mode})`);
    
    try {
      if (mode === 'chat') {
        // Chat mode: Pure conversational AI
        const conversationalResponse = await this.openRouter.generateNaturalResponse(
          userQuestion, 
          null, 
          conversationHistory,
          'chat'
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
        // Agent mode: 3-step intelligent processing
        
        // Step 1: Generate SQL with enhanced context
        const { sql, queryType } = await this.openRouter.generateSQLQuery(userQuestion, conversationHistory);
        console.log(`[Enhanced Tink] Generated SQL (${queryType}): ${sql}`);
        
        // Step 2: Execute SQL query with fallback
        let queryResults;
        try {
          queryResults = await this.executeSQLQuery(sql, queryType);
        } catch (sqlError) {
          console.error('[Enhanced Tink] SQL execution failed, using fallback:', sqlError);
          queryResults = await this.intelligentFallback(userQuestion, queryType);
        }
        
        // Step 3: Generate natural, insightful response
        const intelligentResponse = await this.openRouter.generateNaturalResponse(
          userQuestion, 
          queryResults.data, 
          conversationHistory,
          'agent'
        );
        
        return {
          message: intelligentResponse,
          queryType,
          sql,
          results: queryResults.data,
          success: true,
          mode: 'agent'
        };
      }
    } catch (error) {
      console.error('[Enhanced Tink] Error processing query:', error);
      return {
        message: this.generateIntelligentErrorResponse(userQuestion, error.message, mode),
        error: error.message,
        success: false,
        mode
      };
    }
  }

  async executeSQLQuery(sql: string, queryType: string): Promise<any> {
    try {
      if (!sql || sql.trim() === '') {
        throw new Error('Empty SQL query generated');
      }

      // Replace $1 placeholder with actual workspace_id
      const processedSQL = sql.replace(/\$1/g, `'${this.workspaceId}'`);
      
      const { data, error } = await this.supabase.rpc('execute_sql', { 
        sql_query: processedSQL 
      });

      if (error) {
        console.error('[Enhanced Tink] SQL execution error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        type: queryType,
        data: data || [],
        count: Array.isArray(data) ? data.length : 0
      };
    } catch (error) {
      console.error('[Enhanced Tink] SQL execution error:', error);
      throw error;
    }
  }

  async intelligentFallback(userQuestion: string, queryType: string): Promise<any> {
    console.log(`[Enhanced Tink] Using intelligent fallback for: ${queryType}`);
    
    // Try to understand user intent and provide relevant fallback data
    const fallbackQueries = {
      'projects_list': () => this.getProjects(),
      'tasks_list': () => this.getTasks([]),
      'resources_list': () => this.getResources(),
      'performance_metrics': () => this.getPerformanceMetrics([]),
      'team_utilization': () => this.getTeamUtilization(),
      'deadlines': () => this.getDeadlines(['upcoming']),
      'analytics': () => this.getAnalytics([])
    };

    const fallbackFunction = fallbackQueries[queryType] || fallbackQueries['analytics'];
    
    try {
      return await fallbackFunction();
    } catch (error) {
      console.error('[Enhanced Tink] Fallback query error:', error);
      return {
        type: 'error',
        data: [],
        count: 0
      };
    }
  }

  generateIntelligentErrorResponse(userQuestion: string, errorMessage: string, mode: string): string {
    if (mode === 'chat') {
      return `I'm having a bit of trouble right now, but I'd love to help you with your project management questions. What specific challenge are you facing? I can provide advice on planning, team management, risk assessment, or any other project-related topic.`;
    } else {
      const suggestions = [
        "Try asking about your current projects: 'What projects are active?'",
        "Check on your team: 'How is my team performing?'",
        "Look at deadlines: 'What's due this week?'",
        "Analyze workload: 'Show me resource utilization'"
      ];
      
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      
      return `I'm having trouble accessing that specific data right now. ${randomSuggestion}

Feel free to ask me about your projects, tasks, team performance, or any other data in your workspace. I'm here to help you make better project decisions!`;
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
      .from('performance_profiles')
      .select(`
        id, resource_id, resource_name, current_score, monthly_score, 
        trend, risk_level, workspace_id, created_at, updated_at
      `)
      .eq('workspace_id', this.workspaceId)
      .order('current_score', { ascending: false })
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
      const [projectsData, tasksData, resourcesData] = await Promise.all([
        this.getProjects(),
        this.getTasks([]),
        this.getResources()
      ]);

      const analytics = {
        projects: {
          total: projectsData.count,
          data: projectsData.data?.slice(0, 5) || []
        },
        tasks: {
          total: tasksData.count,
          data: tasksData.data?.slice(0, 5) || []
        },
        resources: {
          total: resourcesData.count,
          data: resourcesData.data?.slice(0, 5) || []
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    console.log(`[Enhanced Tink] Processing message: ${message} for user: ${userId} in workspace: ${workspaceId} (mode: ${mode})`);

    // Initialize enhanced services
    const openRouter = new EnhancedOpenRouterAI(openRouterApiKey);
    const queryEngine = new EnhancedTinkQueryEngine(supabase, userId, workspaceId, openRouter);

    // Load conversation history for intelligent context
    const { data: conversationHistory } = await supabase
      .from('ai_conversation_history')
      .select('message_role, message_content, created_at')
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .eq('conversation_type', 'tink_assistant')
      .order('created_at', { ascending: false })
      .limit(6);

    // Process with enhanced intelligence
    const queryResult = await queryEngine.processIntelligentQuery(
      message, 
      conversationHistory?.reverse() || [],
      mode
    );

    const assistantMessage = queryResult.message || "I'm having trouble generating a response right now. Could you try rephrasing your question?";

    // Save conversation history with enhanced context
    await supabase.from('ai_conversation_history').insert([
      {
        user_id: userId,
        workspace_id: workspaceId,
        conversation_type: 'tink_assistant',
        message_role: 'user',
        message_content: message,
        context_data: { 
          timestamp: new Date().toISOString(),
          queryType: queryResult.queryType || 'general',
          mode: mode
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
          responseType: 'enhanced_openrouter',
          queryResult: queryResult ? { 
            type: queryResult.queryType, 
            dataCount: queryResult.results?.length || 0,
            mode: mode,
            success: queryResult.success
          } : null
        }
      }
    ]);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: assistantMessage,
        responseType: 'enhanced_openrouter',
        queryResult: queryResult ? { 
          type: queryResult.queryType, 
          dataCount: queryResult.results?.length || 0,
          hasData: (queryResult.results?.length || 0) > 0,
          mode: mode
        } : null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[Enhanced Tink] Error in tink-ai-chat function:', error);
    
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

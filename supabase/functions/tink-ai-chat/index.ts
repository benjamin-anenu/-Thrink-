import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Claude-like Enhanced OpenRouter AI integration
class ClaudeStyleOpenRouterAI {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getClaudeSystemPrompt(mode: string): string {
    const basePersonality = `You are Tink, an intelligent AI assistant with Claude's thoughtful and analytical personality. You are genuinely helpful, insightful, and conversational. You think step-by-step and provide reasoning for your insights.

Core traits:
- Thoughtful and genuinely helpful
- Natural conversation flow like a knowledgeable colleague
- Contextual awareness and memory
- Ask clarifying questions when needed
- Acknowledge and validate user feedback
- Show your reasoning process
- Admit limitations honestly
- Provide actionable insights and suggestions`;

    if (mode === 'chat') {
      return `${basePersonality}

**Chat Mode Behavior:**
- You're a project management expert consultant
- Provide comprehensive advice on planning, risk management, team dynamics, and best practices
- Ask thoughtful follow-up questions to better understand the situation
- Reference previous conversation context
- Offer multiple perspectives and solutions
- Be conversational and engaging, not robotic

**Response Style:**
- Start naturally, skip robotic phrases like "I can help you with that"
- Show your thought process: "That's an interesting challenge. Let me think through a few approaches..."
- Provide specific, actionable advice
- End with relevant follow-up questions or next steps

Example: Instead of "Here are some project management tips:", say "That timeline crunch sounds familiar - I've seen teams navigate similar challenges successfully. The key is usually..."`;
    } else {
      return `${basePersonality}

**Agent Mode Behavior:**
You are a data analyst AI with access to project management data. When processing queries:

1. **Pre-Query Explanation**: Explain what data you're looking for
   - "To answer that, I need to analyze your team's task completion rates..."

2. **Data Analysis**: Provide insights, not just raw numbers
   - Identify patterns, trends, and anomalies
   - Compare against benchmarks (70-85% utilization is healthy)
   - Spot concerning issues that need attention

3. **Conversational Data Presentation**:
   - Start with key insight: "Looking at your team's workload, I notice..."
   - Provide supporting details with context
   - Explain what the numbers mean practically
   - End with actionable suggestions

4. **Handle Data Issues Gracefully**:
   - No data: "I don't see data for that period. Would you like me to check a different timeframe?"
   - Incomplete data: "I have partial data - let me show what I can see and suggest how to get the complete picture"

**Response Format:**
🔍 **Key Insight**: [Main finding]
📊 **Details**: [Supporting data with context]
💡 **What this means**: [Interpretation]
🎯 **Suggestions**: [Actionable next steps]
❓ **Follow-up**: [Related questions]

Always be genuinely interested in helping users understand and improve their project management.`;
    }
  }

  async generateSQLQuery(userQuestion: string, conversationHistory: any[] = []): Promise<{ sql: string, queryType: string, explanation: string }> {
    const conversationContext = conversationHistory.length > 0 
      ? `\n\nPrevious conversation context:\n${conversationHistory.slice(-3).map(msg => `${msg.message_role}: ${msg.message_content}`).join('\n')}`
      : '';

    const prompt = `You are an expert SQL analyst with Claude's thoughtful personality. Convert the user's question into a PostgreSQL query with explanation.

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

- Generate ONLY SELECT queries
- Use $1 for workspace_id filtering
- Include proper JOINs and table aliases
- Add ORDER BY for consistent results
- Limit to 50 unless requested otherwise
- Handle NULL values appropriately

User Question: "${userQuestion}"${conversationContext}

Before generating SQL, explain what data you're looking for in a conversational way.

Response format:
{
  "explanation": "To answer your question about team performance, I need to look at...",
  "sql": "SELECT ... FROM ... WHERE workspace_id = $1 ORDER BY ... LIMIT 50",
  "queryType": "team_performance_analysis"
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
            { role: 'system', content: 'You are a helpful SQL query generator with Claude\'s thoughtful personality. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 800
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
          queryType: parsed.queryType || 'general',
          explanation: parsed.explanation || 'Let me analyze your data...'
        };
      } catch (parseError) {
        console.error('Failed to parse OpenRouter response:', content);
        return { sql: '', queryType: 'error', explanation: 'Let me look at your data...' };
      }
    } catch (error) {
      console.error('OpenRouter API error:', error);
      return { sql: '', queryType: 'error', explanation: 'Let me try to help you with your data...' };
    }
  }

  async generateClaudeStyleResponse(userQuestion: string, queryResults: any, conversationHistory: any[] = [], mode: string = 'agent', preQueryExplanation: string = ''): Promise<string> {
    const conversationContext = conversationHistory.length > 0 
      ? `\n\nPrevious conversation context:\n${conversationHistory.slice(-3).map(msg => `${msg.message_role}: ${msg.message_content}`).join('\n')}`
      : '';

    let prompt: string;

    if (mode === 'chat') {
      prompt = `${this.getClaudeSystemPrompt('chat')}

User: "${userQuestion}"${conversationContext}

Respond as Claude would - thoughtful, helpful, and genuinely interested in helping with project management challenges. Ask follow-up questions when appropriate.`;
    } else {
      const dataContext = queryResults && queryResults.length > 0 
        ? `\n\nQuery Results (${queryResults.length} records):\n${JSON.stringify(queryResults, null, 2)}`
        : '\n\nNo data found for this query.';

      prompt = `${this.getClaudeSystemPrompt('agent')}

User asked: "${userQuestion}"
${preQueryExplanation ? `\nPre-query explanation: ${preQueryExplanation}` : ''}

${dataContext}${conversationContext}

Analyze this data like Claude would - be thoughtful, insightful, and genuinely helpful. Provide specific insights, identify patterns, and offer actionable recommendations.

Use the response format specified in the system prompt with emojis and clear sections.`;
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
            { role: 'system', content: 'You are Tink, an intelligent AI assistant with Claude\'s thoughtful and analytical personality. Be conversational, insightful, and genuinely helpful.' },
            { role: 'user', content: prompt }
          ],
          temperature: mode === 'chat' ? 0.8 : 0.7,
          max_tokens: 1200
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || this.generateClaudeStyleFallback(userQuestion, queryResults, mode);
    } catch (error) {
      console.error('OpenRouter response generation error:', error);
      return this.generateClaudeStyleFallback(userQuestion, queryResults, mode);
    }
  }

  generateClaudeStyleFallback(userQuestion: string, queryResults: any, mode: string): string {
    if (mode === 'chat') {
      return `That's an interesting question about "${userQuestion}". While I'm having some technical difficulties right now, I'd still love to help you think through this project management challenge. 

Based on what you're asking, here are some general approaches that might be helpful... Could you tell me more about the specific context or challenges you're facing?`;
    } else {
      if (queryResults && queryResults.length > 0) {
        return `🔍 **Key Insight**: I can see you have ${queryResults.length} records in your data.

📊 **Details**: While I'm having trouble providing a full analysis right now, this data contains valuable information about your project performance.

💡 **What this means**: There's definitely actionable information here that could help you make better project decisions.

🎯 **Suggestions**: Would you like me to focus on a specific aspect of these results? I can try a different approach to analyze this data.

❓ **Follow-up**: What specific insights are you most interested in from this data?`;
      } else {
        return `🔍 **Key Insight**: I don't see any data matching your query.

📊 **Details**: This could mean either the data doesn't exist for this timeframe, or we might need to adjust our search criteria.

💡 **What this means**: Sometimes this happens when looking at specific date ranges or when projects haven't been fully set up yet.

🎯 **Suggestions**: Would you like me to try looking at a different date range or aspect of your projects?

❓ **Follow-up**: What time period or specific projects would you like me to focus on?`;
      }
    }
  }
}

// Enhanced Query Engine with Claude-style intelligence
class ClaudeStyleQueryEngine {
  constructor(private supabase: any, private userId: string, private workspaceId: string, private openRouter: ClaudeStyleOpenRouterAI) {}

  async processIntelligentQuery(userQuestion: string, conversationHistory: any[] = [], mode: string = 'agent'): Promise<any> {
    console.log(`[Claude-Style Tink] Processing: "${userQuestion}" (mode: ${mode})`);
    
    try {
      if (mode === 'chat') {
        // Pure conversational mode
        const conversationalResponse = await this.openRouter.generateClaudeStyleResponse(
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
        // Agent mode: 3-step Claude-style processing
        
        // Step 1: Generate SQL with explanation
        const { sql, queryType, explanation } = await this.openRouter.generateSQLQuery(userQuestion, conversationHistory);
        console.log(`[Claude-Style Tink] Generated SQL (${queryType}): ${sql}`);
        
        // Step 2: Execute SQL query
        let queryResults;
        try {
          queryResults = await this.executeSQLQuery(sql, queryType);
        } catch (sqlError) {
          console.error('[Claude-Style Tink] SQL execution failed:', sqlError);
          queryResults = await this.intelligentFallback(userQuestion, queryType);
        }
        
        // Step 3: Generate Claude-style response
        const intelligentResponse = await this.openRouter.generateClaudeStyleResponse(
          userQuestion, 
          queryResults.data, 
          conversationHistory,
          'agent',
          explanation
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
      console.error('[Claude-Style Tink] Error processing query:', error);
      return {
        message: this.generateClaudeStyleError(userQuestion, error.message, mode),
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

      const processedSQL = sql.replace(/\$1/g, `'${this.workspaceId}'`);
      
      const { data, error } = await this.supabase.rpc('execute_sql', { 
        query: processedSQL 
      });

      if (error) {
        console.error('[Claude-Style Tink] SQL execution error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        type: queryType,
        data: data || [],
        count: Array.isArray(data) ? data.length : 0
      };
    } catch (error) {
      console.error('[Claude-Style Tink] SQL execution error:', error);
      throw error;
    }
  }

  async intelligentFallback(userQuestion: string, queryType: string): Promise<any> {
    console.log(`[Claude-Style Tink] Using intelligent fallback for: ${queryType}`);
    
    // Fallback queries based on intent
    const fallbackQueries = {
      'team_performance': () => this.getTeamPerformance(),
      'project_status': () => this.getProjectStatus(),
      'resource_utilization': () => this.getResourceUtilization(),
      'upcoming_deadlines': () => this.getUpcomingDeadlines(),
      'general': () => this.getGeneralOverview()
    };

    const fallbackFunction = fallbackQueries[queryType] || fallbackQueries['general'];
    
    try {
      return await fallbackFunction();
    } catch (error) {
      console.error('[Claude-Style Tink] Fallback query error:', error);
      return {
        type: 'error',
        data: [],
        count: 0
      };
    }
  }

  generateClaudeStyleError(userQuestion: string, errorMessage: string, mode: string): string {
    if (mode === 'chat') {
      return `I'm having some technical difficulties right now, but I'd still love to help you think through your project management challenge. Based on your question about "${userQuestion}", let me share some approaches that might be helpful while I work on getting back to full functionality...`;
    } else {
      return `🔍 **Technical Issue**: I'm having trouble accessing your data right now.

📊 **Details**: There's a temporary issue with my data connection, but I don't want to leave you without help.

💡 **What this means**: While I work on resolving this, I can still provide general guidance and suggestions.

🎯 **Suggestions**: Could you tell me more about what specific insights you're looking for? I might be able to suggest manual approaches or alternative ways to get the information you need.

❓ **Follow-up**: What's the most important question you're trying to answer about your projects right now?`;
    }
  }

  async getTeamPerformance(): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('performance_profiles')
        .select('*')
        .eq('workspace_id', this.workspaceId)
        .order('current_score', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      return {
        type: 'team_performance',
        data: data || [],
        count: data?.length || 0
      };
    } catch (error) {
      console.error('Error fetching team performance:', error);
      return { type: 'team_performance', data: [], count: 0 };
    }
  }

  async getProjectStatus(): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', this.workspaceId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      return {
        type: 'project_status',
        data: data || [],
        count: data?.length || 0
      };
    } catch (error) {
      console.error('Error fetching project status:', error);
      return { type: 'project_status', data: [], count: 0 };
    }
  }

  async getResourceUtilization(): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('resources')
        .select('*')
        .eq('workspace_id', this.workspaceId)
        .order('name', { ascending: true })
        .limit(20);

      if (error) throw error;
      
      return {
        type: 'resource_utilization',
        data: data || [],
        count: data?.length || 0
      };
    } catch (error) {
      console.error('Error fetching resource utilization:', error);
      return { type: 'resource_utilization', data: [], count: 0 };
    }
  }

  async getUpcomingDeadlines(): Promise<any> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const { data, error } = await this.supabase
        .from('project_tasks')
        .select('*, projects(name)')
        .gte('end_date', today)
        .lte('end_date', futureDateStr)
        .order('end_date', { ascending: true })
        .limit(20);

      if (error) throw error;
      
      return {
        type: 'upcoming_deadlines',
        data: data || [],
        count: data?.length || 0
      };
    } catch (error) {
      console.error('Error fetching upcoming deadlines:', error);
      return { type: 'upcoming_deadlines', data: [], count: 0 };
    }
  }

  async getGeneralOverview(): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('id, name, status, progress')
        .eq('workspace_id', this.workspaceId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      return {
        type: 'general_overview',
        data: data || [],
        count: data?.length || 0
      };
    } catch (error) {
      console.error('Error fetching general overview:', error);
      return { type: 'general_overview', data: [], count: 0 };
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

    console.log(`[Claude-Style Tink] Processing message: ${message} for user: ${userId} in workspace: ${workspaceId} (mode: ${mode})`);

    // Initialize Claude-style services
    const openRouter = new ClaudeStyleOpenRouterAI(openRouterApiKey);
    const queryEngine = new ClaudeStyleQueryEngine(supabase, userId, workspaceId, openRouter);

    // Load conversation history for intelligent context
    const { data: conversationHistory } = await supabase
      .from('ai_conversation_history')
      .select('message_role, message_content, created_at')
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .eq('conversation_type', 'tink_assistant')
      .order('created_at', { ascending: false })
      .limit(6);

    // Process with Claude-style intelligence
    const queryResult = await queryEngine.processIntelligentQuery(
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
          responseType: 'claude_style_openrouter',
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
        responseType: 'claude_style_openrouter',
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
    console.error('[Claude-Style Tink] Error in tink-ai-chat function:', error);
    
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

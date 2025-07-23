
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userQuestion, workspaceId, conversationHistory = [], mode = 'agent' } = await req.json();
    
    // Handle API key check
    if (action === 'check_key') {
      return new Response(JSON.stringify({ hasKey: !!openRouterApiKey }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openRouterApiKey) {
      return new Response(JSON.stringify({ 
        error: 'OpenRouter API key not configured',
        response: 'I need an OpenRouter API key to function properly. Please set up your API key in the project settings.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!userQuestion || !workspaceId) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[Tink AI] Processing question: "${userQuestion}" (mode: ${mode})`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (mode === 'chat') {
      // Chat mode: Direct consultation without data querying
      const response = await generateChatResponse(userQuestion, conversationHistory);
      return new Response(JSON.stringify({
        success: true,
        response,
        mode: 'chat',
        processingTime: Date.now()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Agent mode: 3-step process (SQL generation, execution, analysis)
      const result = await processAgentQuery(userQuestion, workspaceId, conversationHistory, supabase);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('[Tink AI] Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I'm having some technical difficulties right now. Let me try to help you in a different way - what specific aspect of your project management are you most interested in discussing?"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateChatResponse(userQuestion: string, conversationHistory: any[]): Promise<string> {
  const systemPrompt = `You are Tink, an AI assistant with Claude's thoughtful and analytical personality. You are a project management expert consultant who provides comprehensive advice on planning, risk management, team dynamics, and best practices.

Core traits:
- Thoughtful and genuinely helpful
- Natural conversation flow like a knowledgeable colleague
- Contextual awareness and memory
- Ask clarifying questions when needed
- Show your reasoning process
- Admit limitations honestly
- Provide actionable insights and suggestions

Response Style:
- Start naturally, skip robotic phrases
- Show your thought process: "That's an interesting challenge. Let me think through a few approaches..."
- Provide specific, actionable advice
- Use formatting like **bold** for emphasis and bullet points for clarity
- End with relevant follow-up questions or next steps

Always be conversational and engaging, not robotic.`;

  const conversationContext = conversationHistory.length > 0 
    ? `\n\nConversation context:\n${conversationHistory.slice(-4).map(msg => `${msg.message_role}: ${msg.message_content}`).join('\n')}`
    : '';

  const prompt = `${systemPrompt}

User: "${userQuestion}"${conversationContext}

Respond as Tink would - thoughtful, helpful, and genuinely interested in helping with project management challenges.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.8
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "That's an interesting project management question. Let me think through some approaches that might help...";
}

async function processAgentQuery(userQuestion: string, workspaceId: string, conversationHistory: any[], supabase: any) {
  const startTime = Date.now();
  
  try {
    // Step 1: Generate SQL query with explanation
    const { sql, explanation } = await generateSQLQuery(userQuestion, conversationHistory);
    console.log(`[Tink AI] Generated SQL: ${sql}`);
    
    // Step 2: Execute SQL query
    const sqlResults = await executeSQL(sql, workspaceId, supabase);
    console.log(`[Tink AI] Query returned ${sqlResults?.length || 0} rows`);
    
    // Step 3: Analyze results with Claude-style response
    const response = await analyzeResults(userQuestion, sqlResults, conversationHistory, explanation);
    
    return {
      success: true,
      query: sql,
      data: sqlResults,
      response,
      mode: 'agent',
      processingTime: Date.now() - startTime,
      insights: extractInsights(sqlResults)
    };
  } catch (error) {
    console.error('[Tink AI] Error in agent processing:', error);
    return {
      success: false,
      error: error.message,
      response: generateErrorResponse(userQuestion, error.message),
      mode: 'agent',
      processingTime: Date.now() - startTime
    };
  }
}

async function generateSQLQuery(userQuestion: string, conversationHistory: any[]): Promise<{ sql: string; explanation: string }> {
  const conversationContext = conversationHistory.length > 0 
    ? `\n\nConversation context:\n${conversationHistory.slice(-3).map(msg => `${msg.message_role}: ${msg.message_content}`).join('\n')}`
    : '';

  const prompt = `You are an expert SQL analyst. Convert the user's question into a PostgreSQL query with explanation.

Database Schema:
1. projects (id UUID, name TEXT, description TEXT, status TEXT, priority TEXT, 
   workspace_id UUID, start_date DATE, end_date DATE, progress INTEGER, 
   created_at TIMESTAMP, updated_at TIMESTAMP, resources UUID[])

2. project_tasks (id UUID, name TEXT, description TEXT, start_date DATE, 
   end_date DATE, status TEXT, priority TEXT, progress INTEGER, 
   project_id UUID, assignee_id UUID, milestone_id UUID, 
   dependencies TEXT[], created_at TIMESTAMP, updated_at TIMESTAMP)

3. resources (id UUID, name TEXT, email TEXT, role TEXT, department TEXT, 
   skills TEXT[], workspace_id UUID, availability_hours INTEGER, 
   created_at TIMESTAMP, updated_at TIMESTAMP)

4. performance_profiles (id UUID, resource_id UUID, resource_name TEXT, 
   workspace_id UUID, current_score NUMERIC, monthly_score NUMERIC, 
   trend TEXT, risk_level TEXT, strengths TEXT[], improvement_areas TEXT[], 
   created_at TIMESTAMP, updated_at TIMESTAMP)

User Question: "${userQuestion}"${conversationContext}

REQUIREMENTS:
- Generate ONLY SELECT queries
- Use parameterized query with $1 for workspace_id filtering
- Include proper JOINs and table aliases
- Add ORDER BY for consistent results
- Limit results to 50 unless requested otherwise

Before generating SQL, explain what data you're looking for in a conversational way.

Response format:
{
  "explanation": "To answer your question about team performance, I need to look at...",
  "sql": "SELECT ... FROM ... WHERE workspace_id = $1 ORDER BY ... LIMIT 50"
}`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.1
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content?.trim() || '';
  
  try {
    const parsed = JSON.parse(content);
    return {
      sql: parsed.sql || '',
      explanation: parsed.explanation || 'Let me analyze your data...'
    };
  } catch (parseError) {
    return {
      sql: content.replace(/```sql\n?/g, '').replace(/```/g, '').trim(),
      explanation: 'Let me look at your data to answer that question...'
    };
  }
}

async function executeSQL(sqlQuery: string, workspaceId: string, supabase: any): Promise<any> {
  try {
    const processedSQL = sqlQuery.replace(/\$1/g, `'${workspaceId}'`);
    
    const { data, error } = await supabase.rpc('execute_sql', { 
      query: processedSQL 
    });

    if (error) {
      console.error('SQL execution error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('SQL execution error:', error);
    throw error;
  }
}

async function analyzeResults(userQuestion: string, sqlResults: any, conversationHistory: any[], preQueryExplanation: string): Promise<string> {
  const systemPrompt = `You are Tink, a data analyst AI with Claude's thoughtful and analytical personality. When analyzing data:

1. **Provide Context**: Don't just return raw numbers - explain what they mean
2. **Identify Patterns**: Look for trends, anomalies, and insights
3. **Compare Against Benchmarks**: Use ranges like "70-85% utilization is healthy"
4. **Offer Actionable Suggestions**: Always end with specific next steps
5. **Show Your Reasoning**: Explain your analytical process

Response Format:
🔍 **Key Insight**: [Main finding]
📊 **Details**: [Supporting data with context]
💡 **What this means**: [Interpretation]
🎯 **Suggestions**: [Actionable next steps]
❓ **Follow-up**: [Related questions]

Always be genuinely helpful and insightful, like Claude would be when analyzing data.`;

  const conversationContext = conversationHistory.length > 0 
    ? `\n\nConversation context:\n${conversationHistory.slice(-3).map(msg => `${msg.message_role}: ${msg.message_content}`).join('\n')}`
    : '';

  const resultsContext = sqlResults && sqlResults.length > 0 
    ? `\n\nQuery Results (${sqlResults.length} records):\n${JSON.stringify(sqlResults, null, 2)}`
    : '\n\nNo data found for this query.';

  const prompt = `${systemPrompt}

User asked: "${userQuestion}"
${preQueryExplanation ? `\nPre-query explanation: ${preQueryExplanation}` : ''}

${resultsContext}${conversationContext}

Analyze this data like Claude would - be thoughtful, insightful, and genuinely helpful. Use the response format specified above.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "I'm having trouble analyzing that data right now. Let me try a different approach - what specific aspect of your project data are you most interested in?";
}

function extractInsights(data: any[]): string[] {
  if (!data || data.length === 0) return [];
  
  const insights = [];
  
  if (data.length > 10) {
    insights.push(`Found ${data.length} records - substantial dataset for analysis`);
  }
  
  const firstRecord = data[0];
  if (firstRecord) {
    const keys = Object.keys(firstRecord);
    if (keys.includes('progress')) {
      insights.push('Progress tracking data available');
    }
    if (keys.includes('status')) {
      insights.push('Status information included');
    }
  }
  
  return insights;
}

function generateErrorResponse(userQuestion: string, errorMessage: string): string {
  return `I'm having trouble accessing your data right now, but I don't want to leave you hanging. While I work on resolving this technical issue, could you tell me more about what specific insights you're looking for? 

In the meantime, here are some things I can help you think through:
- **Project planning strategies** for your current challenges
- **Risk assessment approaches** for your upcoming deadlines  
- **Team management best practices** based on your question about "${userQuestion}"

What would be most helpful for you right now?`;
}

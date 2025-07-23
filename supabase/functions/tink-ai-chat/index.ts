import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

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

    // Build system prompt based on user context
    const systemPrompt = buildSystemPrompt(context);

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
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices[0]?.message?.content || 'I apologize, but I cannot provide a response right now.';

    // Save conversation history
    if (context?.aiSettings?.conversation_history_enabled) {
      await supabase.from('ai_conversation_history').insert([
        {
          user_id: userId,
          workspace_id: workspaceId,
          conversation_type: 'tink_assistant',
          message_role: 'user',
          message_content: message,
          context_data: { timestamp: new Date().toISOString() }
        },
        {
          user_id: userId,
          workspace_id: workspaceId,
          conversation_type: 'tink_assistant',
          message_role: 'assistant',
          message_content: assistantMessage,
          context_data: { model, timestamp: new Date().toISOString() }
        }
      ]);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: assistantMessage,
        model: model
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
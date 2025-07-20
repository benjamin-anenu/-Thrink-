import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, options = {} }: { messages: AIMessage[], options: AIOptions } = await req.json()

    // Get environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    const aiProvider = Deno.env.get('AI_PROVIDER') || 'openai'
    
    console.log(`[AI Edge Function] Processing request with ${aiProvider} provider`)

    let response: AIResponse;

    if (aiProvider === 'openai' && openaiApiKey) {
      response = await generateOpenAICompletion(messages, options, openaiApiKey);
    } else if (aiProvider === 'anthropic' && anthropicApiKey) {
      response = await generateAnthropicCompletion(messages, options, anthropicApiKey);
    } else {
      throw new Error(`AI provider ${aiProvider} not configured or API key missing`);
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('[AI Edge Function] Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'AI processing failed',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

async function generateOpenAICompletion(
  messages: AIMessage[], 
  options: AIOptions, 
  apiKey: string
): Promise<AIResponse> {
  const systemMessage: AIMessage = {
    role: 'system',
    content: options.systemPrompt || 'You are a helpful project management AI assistant.'
  };

  const requestBody = {
    model: options.model || 'gpt-4o-mini',
    messages: [systemMessage, ...messages],
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 2000,
  };

  console.log(`[OpenAI] Making request with model: ${requestBody.model}`);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('[OpenAI] API Error:', response.status, errorData);
    throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
  }

  const completion = await response.json();
  
  const choice = completion.choices?.[0];
  if (!choice?.message?.content) {
    throw new Error('No content in OpenAI response');
  }

  return {
    content: choice.message.content,
    usage: {
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
    }
  };
}

async function generateAnthropicCompletion(
  messages: AIMessage[], 
  options: AIOptions, 
  apiKey: string
): Promise<AIResponse> {
  // Convert messages to Anthropic format
  const systemPrompt = options.systemPrompt || 'You are a helpful project management AI assistant.';
  const userMessages = messages.filter(m => m.role === 'user');
  const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';

  const requestBody = {
    model: options.model || 'claude-3-sonnet-20240229',
    max_tokens: options.maxTokens || 2000,
    temperature: options.temperature || 0.7,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: lastUserMessage
      }
    ]
  };

  console.log(`[Anthropic] Making request with model: ${requestBody.model}`);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('[Anthropic] API Error:', response.status, errorData);
    throw new Error(`Anthropic API error: ${response.status} - ${errorData}`);
  }

  const completion = await response.json();
  
  const content = completion.content?.[0]?.text;
  if (!content) {
    throw new Error('No content in Anthropic response');
  }

  return {
    content,
    usage: {
      promptTokens: completion.usage?.input_tokens || 0,
      completionTokens: completion.usage?.output_tokens || 0,
      totalTokens: (completion.usage?.input_tokens || 0) + (completion.usage?.output_tokens || 0),
    }
  };
}

/* To deploy this function:
1. Make sure you have the Supabase CLI installed
2. Set your environment variables in the Supabase dashboard:
   - OPENAI_API_KEY (for OpenAI)
   - ANTHROPIC_API_KEY (for Anthropic Claude)
   - AI_PROVIDER (openai or anthropic)
3. Deploy using: supabase functions deploy ai-completion
*/
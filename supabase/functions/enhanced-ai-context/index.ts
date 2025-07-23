import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { userId, workspaceId, contextType = 'full' } = await req.json();

    if (!userId || !workspaceId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get workspace role
    const { data: workspaceMember } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .single();

    // Get AI settings
    const { data: aiSettings } = await supabase
      .from('ai_user_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .single();

    let contextData: any = {
      user: {
        name: profile?.full_name || 'User',
        email: profile?.email,
        role: workspaceMember?.role || 'member',
        timezone: profile?.timezone || 'UTC'
      },
      workspace: {
        id: workspaceId
      },
      aiSettings: aiSettings || {
        chatPersonality: 'professional',
        contextAwarenessLevel: 'standard'
      }
    };

    if (contextType === 'full' || contextType === 'projects') {
      // Get user's projects
      const { data: projects } = await supabase
        .from('projects')
        .select(`
          id, name, status, progress, priority,
          project_tasks(id, name, status, assignee_id)
        `)
        .eq('workspace_id', workspaceId)
        .limit(10);

      contextData.projects = projects || [];
    }

    if (contextType === 'full' || contextType === 'performance') {
      // Get recent performance data
      const { data: performanceMetrics } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('resource_id', userId)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(20);

      contextData.performance = performanceMetrics || [];
    }

    if (contextType === 'full' || contextType === 'assignments') {
      // Get recent AI assignment recommendations
      const { data: recommendations } = await supabase
        .from('ai_assignment_recommendations')
        .select('*')
        .eq('resource_id', userId)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(10);

      contextData.recommendations = recommendations || [];
    }

    if (aiSettings?.conversation_history_enabled) {
      // Get recent conversation history
      const { data: conversationHistory } = await supabase
        .from('ai_conversation_history')
        .select('message_role, message_content, created_at')
        .eq('user_id', userId)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(10);

      contextData.conversationHistory = conversationHistory || [];
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        context: contextData,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in enhanced-ai-context:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function validateEmailInput(input: any): { isValid: boolean; error?: string } {
  if (!input || typeof input !== 'object') {
    return { isValid: false, error: 'Invalid request format' }
  }
  
  if (!input.to || typeof input.to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.to)) {
    return { isValid: false, error: 'Valid email address is required' }
  }
  
  if (!input.subject || typeof input.subject !== 'string' || input.subject.length > 200) {
    return { isValid: false, error: 'Subject is required and must be under 200 characters' }
  }
  
  if (!input.html || typeof input.html !== 'string' || input.html.length > 50000) {
    return { isValid: false, error: 'HTML content is required and must be under 50KB' }
  }
  
  return { isValid: true }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { to, subject, html, metadata } = requestBody;
    
    // Validate input
    const validation = validateEmailInput(requestBody);
    if (!validation.isValid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  
    // Use your email service (SendGrid, Resend, etc.)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'notifications@planova.ai',
        to,
        subject,
        html,
      }),
    });

    // Log to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabase
      .from('notification_queue')
      .insert({
        user_id: metadata?.user_id,
        type: metadata?.type || 'email',
        category: 'email',
        title: subject,
        message: html,
        priority: 'high',
        metadata: metadata || {},
        sent_via: ['email'],
        sent_at: new Date().toISOString()
      });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 
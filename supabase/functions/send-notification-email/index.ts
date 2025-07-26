import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { to, subject, html, metadata } = await req.json();
  
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
      user_id: metadata.user_id,
      type: metadata.type,
      category: 'email',
      title: subject,
      message: html,
      priority: 'high',
      metadata,
      sent_via: ['email'],
      sent_at: new Date().toISOString()
    });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}); 
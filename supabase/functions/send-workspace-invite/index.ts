import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Role = 'owner' | 'admin' | 'member' | 'viewer';

interface InvitePayload {
  workspaceId: string;
  emails: string[];
  role: Role;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

// Service client (admin)
const adminClient = createClient(supabaseUrl, serviceKey);

function getAuthClient(req: Request) {
  // Client with caller's JWT to read auth user
  return createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
}

function randomPassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  let pwd = "";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) pwd += chars[array[i] % chars.length];
  return pwd;
}

function inviteEmailHtml(params: {
  appName: string;
  workspaceName: string;
  signInUrl: string;
  email: string;
  tempPassword?: string;
}) {
  const { appName, workspaceName, signInUrl, email, tempPassword } = params;
  const hasTemp = Boolean(tempPassword);
  // Simple, responsive, brand-like gradient email with inline CSS
  return `
  <!doctype html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${appName} Invitation</title>
    <style>
      body { margin:0; background:#0b1020; font-family:Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color:#e6eefc; }
      .wrapper { width:100%; table-layout:fixed; background:#0b1020; padding:24px; }
      .container { max-width:640px; margin:0 auto; background:#0d1228; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px rgba(16,24,40,.3); }
      .hero { padding:40px 32px; background:linear-gradient(135deg, #3b82f6, #06b6d4); position:relative; }
      .brand { font-weight:800; font-size:14px; letter-spacing:.12em; text-transform:uppercase; color:#e6f4ff; opacity:.9 }
      .title { margin:8px 0 0; font-size:28px; line-height:1.2; font-weight:800; color:white; }
      .subtitle { margin:8px 0 0; font-size:14px; opacity:.95; color:#f0f9ff; }
      .card { padding:28px 32px; }
      .row { margin-bottom:16px; }
      .label { font-size:12px; text-transform:uppercase; letter-spacing:.08em; color:#9fb6dd; }
      .value { font-size:16px; color:#e6eefc; font-weight:600; }
      .badge { display:inline-block; padding:2px 10px; border-radius:999px; font-size:12px; background:rgba(59,130,246,.15); color:#9ecbff; border:1px solid rgba(59,130,246,.35); }
      .cta { display:inline-block; background:linear-gradient(135deg, #3b82f6, #06b6d4); color:white; text-decoration:none; padding:14px 22px; border-radius:12px; font-weight:700; box-shadow:0 6px 20px rgba(14,165,233,.35); }
      .note { font-size:12px; color:#a6b6d6; }
      .footer { padding:18px 32px 28px; font-size:12px; color:#7f8fb2; }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="hero">
          <div class="brand">${appName}</div>
          <div class="title">You’re invited to ${workspaceName}</div>
          <div class="subtitle">Access projects, tasks and insights with your new account.</div>
        </div>
        <div class="card">
          <div class="row"><span class="label">Username</span><div class="value mono">${email}</div></div>
          ${hasTemp ? `<div class="row"><span class="label">Temporary password</span><div class="value mono">${tempPassword}</div></div>` : ''}
          <div class="row"><a class="cta" href="${signInUrl}" target="_blank" rel="noopener">Sign in to ${appName}</a></div>
          ${hasTemp ? `<div class="note">For security, you’ll be asked to set a new password on first login.</div>` : `<div class="note">If you already have an account, sign in with your existing password.</div>`}
        </div>
        <div class="footer">If the button doesn’t work, copy and paste this link into your browser:<br/><span class="mono">${signInUrl}</span></div>
      </div>
    </div>
  </body>
  </html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { workspaceId, emails, role }: InvitePayload = await req.json();
    if (!workspaceId || !emails?.length) {
      return new Response(JSON.stringify({ error: "workspaceId and emails are required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const authClient = getAuthClient(req);
    const { data: userData } = await authClient.auth.getUser();
    const inviterId = userData?.user?.id ?? null;

    // Load workspace name for nicer email copy
    const { data: ws, error: wsErr } = await adminClient
      .from('workspaces')
      .select('id,name')
      .eq('id', workspaceId)
      .single();
    if (wsErr) throw wsErr;

    const origin = req.headers.get('origin') || req.headers.get('referer') || `${supabaseUrl.replace('https://', 'https://')}`;
    const signInUrl = `${origin}/auth`;

    const results: Array<{ email: string; sent: boolean; createdNewUser: boolean; tempPassword?: string; error?: string } > = [];

    for (const rawEmail of emails) {
      const email = String(rawEmail).trim().toLowerCase();

      // Create or refresh invitation
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      let invitationToken: string | null = null;

      // Try to find existing pending invite
      const { data: existingInvite } = await adminClient
        .from('workspace_invitations')
        .select('id, invitation_token, status')
        .eq('workspace_id', workspaceId)
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingInvite?.id) {
        // Refresh status/expiry
        const { data: updated, error: updErr } = await adminClient
          .from('workspace_invitations')
          .update({ status: 'pending', expires_at: expiresAt })
          .eq('id', existingInvite.id)
          .select('invitation_token')
          .single();
        if (updErr) throw updErr;
        invitationToken = updated?.invitation_token ?? existingInvite.invitation_token ?? null;
      } else {
        const insertPayload: any = {
          workspace_id: workspaceId,
          email,
          role,
          invited_by: inviterId,
          expires_at: expiresAt,
          status: 'pending',
        };
        const { data: inserted, error: insErr } = await adminClient
          .from('workspace_invitations')
          .insert([insertPayload])
          .select('invitation_token')
          .single();
        if (insErr) throw insErr;
        invitationToken = inserted?.invitation_token ?? null;
      }

      let createdNewUser = false;
      let tempPassword: string | undefined = undefined;

      // Try creating the user with a temp password
      try {
        tempPassword = randomPassword(12);
        const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { must_reset_password: true },
        });
        if (createErr) throw createErr;
        createdNewUser = true;
        // Ensure metadata flag
        if (created?.user?.id) {
          await adminClient.auth.admin.updateUserById(created.user.id, {
            user_metadata: { must_reset_password: true },
          });
        }
      } catch (e: any) {
        // If user already exists, we still proceed to send an email without temp password
        createdNewUser = false;
        tempPassword = undefined;
      }

      // Send email
      const html = inviteEmailHtml({
        appName: 'Tink Project AI',
        workspaceName: ws?.name ?? 'your workspace',
        signInUrl,
        email,
        tempPassword,
      });

      try {
        const emailResp = await resend.emails.send({
          from: 'Tink Project AI <onboarding@resend.dev>',
          to: [email],
          subject: `You’re invited to ${ws?.name ?? 'a workspace'}`,
          html,
        });
        if ((emailResp as any)?.error) throw (emailResp as any).error;

        // Mark sent timestamp
        await adminClient
          .from('workspace_invitations')
          .update({ email_sent_at: new Date().toISOString() })
          .eq('workspace_id', workspaceId)
          .eq('email', email)
          .eq('status', 'pending');

        results.push({ email, sent: true, createdNewUser, tempPassword });
      } catch (sendErr: any) {
        results.push({ email, sent: false, createdNewUser, error: String(sendErr?.message || sendErr) });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error('send-workspace-invite error', err);
    return new Response(JSON.stringify({ error: err?.message || 'Unexpected error' }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
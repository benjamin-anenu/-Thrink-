
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportEmailRequest {
  recipients: string[];
  reportType: string;
  reportData: any;
  format: string;
  workspaceId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { recipients, reportType, reportData, format, workspaceId }: ReportEmailRequest = await req.json();

    // Generate email content based on report type
    const emailContent = generateEmailContent(reportType, reportData, format);
    
    // Here you would integrate with your email service (e.g., Resend, SendGrid, etc.)
    // For now, we'll simulate sending emails and store the activity
    
    const emailResults = [];
    
    for (const recipient of recipients) {
      // Simulate email sending
      const emailResult = {
        recipient,
        status: 'sent',
        sentAt: new Date().toISOString(),
        subject: `${reportType} Report - ${format.toUpperCase()}`,
        content: emailContent
      };
      
      emailResults.push(emailResult);
      
      // Log the email activity
      await supabase
        .from('compliance_logs')
        .insert({
          workspace_id: workspaceId,
          event_type: 'report_email_sent',
          event_category: 'communication',
          description: `Report email sent to ${recipient}`,
          metadata: {
            report_type: reportType,
            format: format,
            recipient: recipient
          }
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      results: emailResults 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Error in send-report-email function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

function generateEmailContent(reportType: string, reportData: any, format: string): string {
  const timestamp = new Date().toLocaleString();
  
  let content = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>📊 ${reportType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Report</h2>
        <p>Generated on: ${timestamp}</p>
        <p>Format: ${format.toUpperCase()}</p>
        
        <h3>Report Summary</h3>
  `;

  if (reportData?.summary) {
    content += `
      <ul>
        <li>Total Projects: ${reportData.summary.totalProjects || 0}</li>
        <li>Active Projects: ${reportData.summary.activeProjects || 0}</li>
        <li>Completed Projects: ${reportData.summary.completedProjects || 0}</li>
        <li>Total Resources: ${reportData.summary.totalResources || 0}</li>
      </ul>
    `;
  }

  content += `
        <h3>Report Details</h3>
        <p>This report was generated automatically and contains the latest project and resource information.</p>
        
        <hr style="margin: 20px 0;">
        <p style="font-size: 0.9em; color: #666;">
          This email was sent from your Project Management System. 
          If you have any questions, please contact your system administrator.
        </p>
      </body>
    </html>
  `;

  return content;
}

serve(handler);

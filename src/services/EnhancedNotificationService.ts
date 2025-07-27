import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class EnhancedNotificationService {
  private static instance: EnhancedNotificationService;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new EnhancedNotificationService();
    }
    return this.instance;
  }

  // Schedule daily check-in prompts for project managers
  async scheduleDailyCheckIns() {
    const { data: projects } = await supabase
      .from('projects')
      .select('*, project_managers:profiles!inner(user_id, email, full_name)')
      .eq('status', 'Active');

    if (!projects) return;

    for (const project of projects) {
      // Check if today's check-in exists
      const today = new Date().toISOString().split('T')[0];
      const { data: existingCheckin } = await supabase
        .from('project_daily_checkins')
        .select('id')
        .eq('project_id', project.id)
        .eq('checkin_date', today)
        .single();

      if (!existingCheckin) {
        // Send check-in request
        await this.sendDailyCheckInRequest(project);
      }
    }
  }

  // Send daily check-in email with action buttons
  async sendDailyCheckInRequest(project: any) {
    const checkInUrl = `${window.location.origin}/checkin/${project.id}`;
    
    const emailContent = {
      to: project.project_managers.email,
      subject: `Daily Check-in Required: ${project.name}`,
      html: `
        <h2>Daily Project Update Required</h2>
        <p>Hi ${project.project_managers.full_name},</p>
        <p>Please provide your daily update for <strong>${project.name}</strong>.</p>
        <div style="margin: 20px 0;">
          <a href="${checkInUrl}" style="
            background-color: #3b82f6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
          ">Provide Update</a>
        </div>
        <p>Questions to answer:</p>
        <ul>
          <li>What was accomplished today?</li>
          <li>Are there any blockers?</li>
          <li>What's planned for tomorrow?</li>
          <li>Any updates for stakeholders?</li>
        </ul>
      `,
      metadata: {
        project_id: project.id,
        type: 'daily_checkin'
      }
    };

    await supabase.functions.invoke('send-notification-email', {
      body: emailContent
    });
  }

  // Monitor upcoming task deadlines and send confirmations
  async checkUpcomingDeliveries() {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const { data: upcomingTasks } = await supabase
      .from('project_tasks')
      .select(`
        *,
        assignee:resources(id, name, email),
        project:projects(name)
      `)
      .lte('end_date', threeDaysFromNow.toISOString())
      .gte('end_date', new Date().toISOString())
      .eq('status', 'In Progress');

    if (!upcomingTasks) return;

    for (const task of upcomingTasks) {
      await this.sendDeliveryConfirmationRequest(task);
    }
  }

  // Send delivery confirmation with Yes/No options
  async sendDeliveryConfirmationRequest(task: any) {
    const { data: confirmation } = await supabase
      .from('resource_delivery_confirmations')
      .insert({
        task_id: task.id,
        resource_id: task.assignee.id,
        scheduled_date: task.end_date,
        status: 'pending'
      })
      .select()
      .single();

    if (!confirmation) return;

    const confirmUrl = `${window.location.origin}/confirm-delivery/${confirmation.confirmation_token}`;
    
    const emailContent = {
      to: task.assignee.email,
      subject: `Delivery Confirmation Required: ${task.name}`,
      html: `
        <h2>Task Delivery Confirmation</h2>
        <p>Hi ${task.assignee.name},</p>
        <p>Your task "<strong>${task.name}</strong>" is due on ${new Date(task.end_date).toLocaleDateString()}.</p>
        <p><strong>Are you on track to deliver on time?</strong></p>
        <div style="margin: 20px 0;">
          <a href="${confirmUrl}?response=on_track" style="
            background-color: #10b981;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            margin-right: 10px;
          ">Yes, On Track</a>
          <a href="${confirmUrl}?response=needs_rebaseline" style="
            background-color: #ef4444;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
          ">No, Need Extension</a>
        </div>
        <p>Project: ${task.project.name}</p>
      `,
      metadata: {
        task_id: task.id,
        confirmation_id: confirmation.id,
        type: 'delivery_confirmation'
      }
    };

    await supabase.functions.invoke('send-notification-email', {
      body: emailContent
    });
  }

  // ... (other methods for rebaseline, approvals, and reports can be added here)
} 
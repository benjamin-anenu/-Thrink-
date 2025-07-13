
import { TaskDeadlineReminder, RebaselineRequest } from '@/types/performance';

export class EmailReminderService {
  private static instance: EmailReminderService;
  private reminders: TaskDeadlineReminder[] = [];
  private rebaselineRequests: RebaselineRequest[] = [];

  public static getInstance(): EmailReminderService {
    if (!EmailReminderService.instance) {
      EmailReminderService.instance = new EmailReminderService();
    }
    return EmailReminderService.instance;
  }

  public scheduleTaskReminders(task: any, resource: any, project: any) {
    const deadline = new Date(task.deadline || task.dueDate);
    const now = new Date();

    // Calculate reminder dates
    const reminderDates = [
      { type: 'week_before' as const, date: new Date(deadline.getTime() - 7 * 24 * 60 * 60 * 1000) },
      { type: 'three_days' as const, date: new Date(deadline.getTime() - 3 * 24 * 60 * 60 * 1000) },
      { type: 'day_before' as const, date: new Date(deadline.getTime() - 1 * 24 * 60 * 60 * 1000) },
      { type: 'day_of' as const, date: deadline },
      { type: 'overdue' as const, date: new Date(deadline.getTime() + 1 * 24 * 60 * 60 * 1000) }
    ];

    reminderDates.forEach(({ type, date }) => {
      if (date > now) {
        const reminder: TaskDeadlineReminder = {
          id: `${task.id}-${type}`,
          taskId: task.id,
          taskName: task.title || task.name,
          resourceId: resource.id,
          resourceName: resource.name,
          resourceEmail: resource.email,
          projectId: project.id,
          projectName: project.name,
          deadline,
          reminderType: type,
          sent: false,
          responseRequired: type === 'three_days' || type === 'day_before',
        };

        this.reminders.push(reminder);
      }
    });

    console.log(`[Email Reminder Service] Scheduled ${reminderDates.length} reminders for task ${task.id}`);
  }

  public processReminders() {
    const now = new Date();
    const pendingReminders = this.reminders.filter(r => !r.sent && new Date(r.deadline) <= now);

    pendingReminders.forEach(reminder => {
      this.sendReminderEmail(reminder);
      reminder.sent = true;
      reminder.sentAt = now;
    });

    if (pendingReminders.length > 0) {
      console.log(`[Email Reminder Service] Sent ${pendingReminders.length} reminder emails`);
    }
  }

  private sendReminderEmail(reminder: TaskDeadlineReminder) {
    // In a real implementation, this would integrate with an email service
    // For now, we'll simulate the email sending and log the content
    
    const emailContent = this.generateEmailContent(reminder);
    
    console.log(`[EMAIL SENT] To: ${reminder.resourceEmail}`);
    console.log(`Subject: ${emailContent.subject}`);
    console.log(`Body: ${emailContent.body}`);
    
    // Simulate email tracking
    if (reminder.responseRequired) {
      // Simulate some responses for demo purposes
      setTimeout(() => {
        this.simulateEmailResponse(reminder);
      }, Math.random() * 5000 + 2000); // Random delay between 2-7 seconds
    }
  }

  private generateEmailContent(reminder: TaskDeadlineReminder) {
    const urgencyLevel = this.getUrgencyLevel(reminder.reminderType);
    const daysToDeadline = Math.ceil((new Date(reminder.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    let subject = '';
    let body = '';

    switch (reminder.reminderType) {
      case 'week_before':
        subject = `📅 Upcoming Deadline: ${reminder.taskName} (7 days)`;
        break;
      case 'three_days':
        subject = `⚠️ Task Deadline in 3 Days: ${reminder.taskName}`;
        break;
      case 'day_before':
        subject = `🚨 URGENT: Task Due Tomorrow - ${reminder.taskName}`;
        break;
      case 'day_of':
        subject = `🔥 DEADLINE TODAY: ${reminder.taskName}`;
        break;
      case 'overdue':
        subject = `❌ OVERDUE: ${reminder.taskName} - Immediate Action Required`;
        break;
    }

    body = `
Hi ${reminder.resourceName},

${this.getGreetingMessage(reminder.reminderType, daysToDeadline)}

📋 **Task Details:**
- Task: ${reminder.taskName}
- Project: ${reminder.projectName}
- Deadline: ${reminder.deadline.toLocaleDateString()} at ${reminder.deadline.toLocaleTimeString()}
- Status: ${reminder.reminderType === 'overdue' ? 'OVERDUE' : 'Pending'}

${reminder.responseRequired ? `
🤖 **AI Status Check:**
Please take a moment to update us on your progress:

1. Are you on track to meet this deadline? (Yes/No)
2. Confidence level (1-10): ___
3. Do you need to request a deadline extension? (Yes/No)
4. If yes, what factors are causing the delay?

[Click here to respond quickly: ${this.generateResponseLink(reminder.id)}]
` : ''}

${this.getActionItems(reminder.reminderType)}

Best regards,
Project Management AI System

---
This email was sent automatically by our AI system. If you have any questions, please contact your project manager.
    `.trim();

    return { subject, body };
  }

  private getUrgencyLevel(type: TaskDeadlineReminder['reminderType']): 'low' | 'medium' | 'high' | 'critical' {
    const levels = {
      'week_before': 'low' as const,
      'three_days': 'medium' as const,
      'day_before': 'high' as const,
      'day_of': 'critical' as const,
      'overdue': 'critical' as const
    };
    return levels[type];
  }

  private getGreetingMessage(type: TaskDeadlineReminder['reminderType'], daysToDeadline: number): string {
    switch (type) {
      case 'week_before':
        return 'This is a friendly reminder that you have a task deadline coming up in one week.';
      case 'three_days':
        return 'Your task deadline is approaching in 3 days. Please confirm your progress status.';
      case 'day_before':
        return 'URGENT: Your task is due tomorrow. Please ensure completion or request an extension.';
      case 'day_of':
        return 'Your task deadline is TODAY. Please complete and submit immediately.';
      case 'overdue':
        return 'Your task is now OVERDUE. Immediate action is required to minimize project impact.';
      default:
        return 'Task deadline notification.';
    }
  }

  private getActionItems(type: TaskDeadlineReminder['reminderType']): string {
    switch (type) {
      case 'week_before':
        return `
📝 **Recommended Actions:**
- Review task requirements and dependencies
- Plan your work schedule for the coming week
- Identify any potential blockers early
- Communicate with team members if collaboration is needed`;

      case 'three_days':
        return `
📝 **Immediate Actions Required:**
- Assess current progress and remaining work
- Update task status in project management system
- Flag any risks or delays to your project manager
- Prepare for final sprint to completion`;

      case 'day_before':
        return `
🚨 **URGENT Actions:**
- Complete all remaining work items
- Test and review your deliverables
- Prepare for submission tomorrow
- Contact PM immediately if extension needed`;

      case 'day_of':
        return `
🔥 **TODAY's Actions:**
- Submit completed work immediately
- Update all project documentation
- Notify team of completion status
- Schedule any required follow-up meetings`;

      case 'overdue':
        return `
❌ **CRITICAL Actions:**
- Contact your project manager IMMEDIATELY
- Provide updated completion estimate
- Submit partial work if available
- Document reasons for delay for project records`;

      default:
        return 'Please review your task and take appropriate action.';
    }
  }

  private generateResponseLink(reminderId: string): string {
    return `https://projectmanager.app/task-response/${reminderId}`;
  }

  private simulateEmailResponse(reminder: TaskDeadlineReminder) {
    // Simulate different types of responses
    const responses = [
      { onTrack: true, confidence: 8, needsRebaseline: false },
      { onTrack: true, confidence: 6, needsRebaseline: false },
      { onTrack: false, confidence: 4, needsRebaseline: true, reasons: ['Unexpected complexity', 'Waiting for dependencies'] },
      { onTrack: false, confidence: 3, needsRebaseline: true, reasons: ['Resource constraints', 'Technical challenges'] }
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    
    reminder.responseReceived = true;
    reminder.responseData = response;

    if (response.needsRebaseline) {
      this.createRebaselineRequest(reminder, response);
    }

    console.log(`[EMAIL RESPONSE] Received response for ${reminder.taskName}: On track: ${response.onTrack}, Confidence: ${response.confidence}`);
  }

  private createRebaselineRequest(reminder: TaskDeadlineReminder, response: any) {
    const newDeadline = new Date(reminder.deadline);
    newDeadline.setDate(newDeadline.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7 days extension

    const request: RebaselineRequest = {
      id: `rebaseline-${reminder.taskId}-${Date.now()}`,
      taskId: reminder.taskId,
      resourceId: reminder.resourceId,
      originalDeadline: reminder.deadline,
      proposedDeadline: newDeadline,
      reasons: response.reasons || ['Additional time required'],
      impact: 'Project timeline may be affected',
      status: 'pending',
      submittedAt: new Date()
    };

    this.rebaselineRequests.push(request);
    console.log(`[REBASELINE REQUEST] Created request for task ${reminder.taskName}: ${reminder.deadline.toDateString()} → ${newDeadline.toDateString()}`);
  }

  public getReminders(): TaskDeadlineReminder[] {
    return this.reminders;
  }

  public getRebaselineRequests(): RebaselineRequest[] {
    return this.rebaselineRequests;
  }

  public approveRebaseline(requestId: string, reviewedBy: string, notes?: string) {
    const request = this.rebaselineRequests.find(r => r.id === requestId);
    if (request) {
      request.status = 'approved';
      request.reviewedAt = new Date();
      request.reviewedBy = reviewedBy;
      request.reviewNotes = notes;
      console.log(`[REBASELINE APPROVED] Request ${requestId} approved by ${reviewedBy}`);
    }
  }

  public rejectRebaseline(requestId: string, reviewedBy: string, notes: string) {
    const request = this.rebaselineRequests.find(r => r.id === requestId);
    if (request) {
      request.status = 'rejected';
      request.reviewedAt = new Date();
      request.reviewedBy = reviewedBy;
      request.reviewNotes = notes;
      console.log(`[REBASELINE REJECTED] Request ${requestId} rejected by ${reviewedBy}`);
    }
  }
}

// Initialize and start the reminder processing
export const startEmailReminderService = () => {
  const service = EmailReminderService.getInstance();
  
  // Process reminders every minute
  setInterval(() => {
    service.processReminders();
  }, 60000);
  
  console.log('[Email Reminder Service] Started monitoring for task deadlines');
};

import { TaskDeadlineReminder, RebaselineRequest } from '@/types/performance';
import { EventBus } from './EventBus';

export class EmailReminderService {
  private static instance: EmailReminderService;
  private reminders: TaskDeadlineReminder[] = [];
  private rebaselineRequests: RebaselineRequest[] = [];
  private eventBus: EventBus;
  private monitoringInterval: NodeJS.Timeout | null = null;

  public static getInstance(): EmailReminderService {
    if (!EmailReminderService.instance) {
      EmailReminderService.instance = new EmailReminderService();
    }
    return EmailReminderService.instance;
  }

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.loadReminders();
    this.setupRealDataMonitoring();
  }

  private loadReminders() {
    const savedReminders = localStorage.getItem('email-reminders');
    const savedRebaselines = localStorage.getItem('rebaseline-requests');
    
    if (savedReminders) {
      try {
        this.reminders = JSON.parse(savedReminders).map((r: any) => ({
          ...r,
          deadline: new Date(r.deadline),
          sentAt: r.sentAt ? new Date(r.sentAt) : undefined
        }));
      } catch (error) {
        console.error('[Email Reminder Service] Error loading reminders:', error);
      }
    }

    if (savedRebaselines) {
      try {
        this.rebaselineRequests = JSON.parse(savedRebaselines).map((r: any) => ({
          ...r,
          originalDeadline: new Date(r.originalDeadline),
          proposedDeadline: new Date(r.proposedDeadline),
          submittedAt: new Date(r.submittedAt),
          reviewedAt: r.reviewedAt ? new Date(r.reviewedAt) : undefined
        }));
      } catch (error) {
        console.error('[Email Reminder Service] Error loading rebaseline requests:', error);
      }
    }
  }

  private saveReminders() {
    localStorage.setItem('email-reminders', JSON.stringify(this.reminders));
    localStorage.setItem('rebaseline-requests', JSON.stringify(this.rebaselineRequests));
  }

  private emailQueue: Array<{reminder: TaskDeadlineReminder, retryCount: number}> = [];
  private isProcessing = false;
  private maxRetries = 3;
  private backoffDelay = 5000; // 5 seconds

  private setupRealDataMonitoring() {
    // Monitor real project data for tasks with deadlines
    this.monitoringInterval = setInterval(() => {
      this.scanProjectsForDeadlines();
    }, 300000); // Check every 5 minutes instead of every minute

    // Listen for task updates with debouncing
    let taskUpdateTimer: NodeJS.Timeout;
    this.eventBus.subscribe('task_updated', (event) => {
      clearTimeout(taskUpdateTimer);
      taskUpdateTimer = setTimeout(() => {
        const { task, project } = event.payload;
        if (task.endDate || task.dueDate) {
          this.scheduleTaskRemindersFromRealData(task, project);
        }
      }, 2000); // Debounce task updates by 2 seconds
    });

    // Listen for resource assignments with validation
    this.eventBus.subscribe('resource_assigned', (event) => {
      const { taskId, resourceId, projectId } = event.payload;
      if (taskId && resourceId && projectId) {
        this.updateTaskReminderForResource(taskId, resourceId, projectId);
      }
    });

    console.log('[Email Reminder Service] Enhanced real data monitoring established');
  }

  private scanProjectsForDeadlines() {
    try {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const resources = JSON.parse(localStorage.getItem('resources') || '[]');

      projects.forEach((project: any) => {
        if (project.tasks) {
          project.tasks.forEach((task: any) => {
            if ((task.endDate || task.dueDate) && task.assignedTo) {
              const resource = resources.find((r: any) => r.id === task.assignedTo);
              if (resource && !this.hasExistingReminder(task.id)) {
                this.scheduleTaskRemindersFromRealData(task, project, resource);
              }
            }
          });
        }

        // Check milestones
        if (project.milestones) {
          project.milestones.forEach((milestone: any) => {
            if (milestone.date && milestone.assignedTo) {
              const resource = resources.find((r: any) => r.id === milestone.assignedTo);
              if (resource && !this.hasExistingReminder(milestone.id)) {
                this.scheduleTaskRemindersFromRealData(milestone, project, resource);
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('[Email Reminder Service] Error scanning projects:', error);
    }
  }

  private hasExistingReminder(taskId: string): boolean {
    return this.reminders.some(r => r.taskId === taskId);
  }

  private scheduleTaskRemindersFromRealData(task: any, project: any, resource?: any) {
    if (!resource) {
      // Try to find resource if not provided
      try {
        const resources = JSON.parse(localStorage.getItem('resources') || '[]');
        resource = resources.find((r: any) => r.id === task.assignedTo);
      } catch (error) {
        console.warn('[Email Reminder Service] Could not find resource for task');
        return;
      }
    }

    const deadline = new Date(task.endDate || task.dueDate || task.date);
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

        // Remove existing reminder of same type
        this.reminders = this.reminders.filter(r => r.id !== reminder.id);
        this.reminders.push(reminder);
      }
    });

    this.saveReminders();
    console.log(`[Email Reminder Service] Scheduled reminders for task ${task.title || task.name}`);
  }

  private updateTaskReminderForResource(taskId: string, resourceId: string, projectId: string) {
    try {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const resources = JSON.parse(localStorage.getItem('resources') || '[]');
      
      const project = projects.find((p: any) => p.id === projectId);
      const resource = resources.find((r: any) => r.id === resourceId);
      const task = project?.tasks?.find((t: any) => t.id === taskId);

      if (task && resource && project) {
        // Remove old reminders for this task
        this.reminders = this.reminders.filter(r => r.taskId !== taskId);
        this.scheduleTaskRemindersFromRealData(task, project, resource);
      }
    } catch (error) {
      console.error('[Email Reminder Service] Error updating task reminder:', error);
    }
  }

  public scheduleTaskReminders(task: any, resource: any, project: any) {
    this.scheduleTaskRemindersFromRealData(task, project, resource);
  }

  public async processReminders() {
    if (this.isProcessing) {
      console.debug('[Email Reminder Service] Already processing reminders, skipping');
      return;
    }

    this.isProcessing = true;
    
    try {
      const now = new Date();
      const pendingReminders = this.reminders.filter(r => !r.sent && new Date(r.deadline) <= now);

      // Process reminders in batches to avoid overwhelming the system
      const batchSize = 5;
      for (let i = 0; i < pendingReminders.length; i += batchSize) {
        const batch = pendingReminders.slice(i, i + batchSize);
        await this.processBatch(batch, now);
        
        // Add delay between batches
        if (i + batchSize < pendingReminders.length) {
          await this.delay(1000);
        }
      }

      if (pendingReminders.length > 0) {
        this.saveReminders();
        console.log(`[Email Reminder Service] Processed ${pendingReminders.length} reminder emails`);
      }
    } catch (error) {
      console.error('[Email Reminder Service] Error processing reminders:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processBatch(reminders: TaskDeadlineReminder[], timestamp: Date) {
    const promises = reminders.map(async (reminder) => {
      try {
        await this.sendReminderEmailWithRetry(reminder);
        reminder.sent = true;
        reminder.sentAt = timestamp;
      } catch (error) {
        console.error(`[Email Reminder Service] Failed to send reminder for ${reminder.taskName}:`, error);
        // Mark as failed but don't block other reminders
        reminder.sent = false;
      }
    });

    await Promise.allSettled(promises);
  }

  private async sendReminderEmailWithRetry(reminder: TaskDeadlineReminder, retryCount = 0): Promise<void> {
    try {
      await this.sendReminderEmail(reminder);
    } catch (error) {
      if (retryCount < this.maxRetries) {
        console.warn(`[Email Reminder Service] Retry ${retryCount + 1}/${this.maxRetries} for ${reminder.taskName}`);
        await this.delay(this.backoffDelay * Math.pow(2, retryCount)); // Exponential backoff
        return this.sendReminderEmailWithRetry(reminder, retryCount + 1);
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async sendReminderEmail(reminder: TaskDeadlineReminder): Promise<void> {
    // Enhanced email sending with validation and error handling
    if (!reminder.resourceEmail || !reminder.resourceEmail.includes('@')) {
      throw new Error(`Invalid email address for ${reminder.resourceName}`);
    }
    
    const emailContent = this.generateEmailContent(reminder);
    
    // Simulate network delay and potential failures
    await this.delay(Math.random() * 1000 + 500); // 0.5-1.5 second delay
    
    // Simulate occasional failures for testing resilience
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error(`Network error sending email to ${reminder.resourceEmail}`);
    }
    
    console.log(`[EMAIL SENT] To: ${reminder.resourceEmail}`);
    console.log(`Subject: ${emailContent.subject}`);
    console.log(`Body Preview: ${emailContent.body.substring(0, 100)}...`);
    
    // Emit email sent event with enhanced payload
    this.eventBus.emit('email_reminder_sent', {
      type: 'email_reminder_sent',
      taskId: reminder.taskId,
      resourceId: reminder.resourceId,
      reminderType: reminder.reminderType,
      emailAddress: reminder.resourceEmail,
      timestamp: new Date(),
      priority: this.getUrgencyLevel(reminder.reminderType)
    }, 'email_service');
    
    // Simulate responses for demo purposes with better logic
    if (reminder.responseRequired) {
      setTimeout(() => {
        this.simulateEmailResponse(reminder);
      }, Math.random() * 10000 + 5000); // Random delay between 5-15 seconds
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
    const actionItems = {
      'week_before': `📝 **Recommended Actions:**\n- Review task requirements and dependencies\n- Plan your work schedule for the coming week\n- Identify any potential blockers early\n- Communicate with team members if collaboration is needed`,
      'three_days': `📝 **Immediate Actions Required:**\n- Assess current progress and remaining work\n- Update task status in project management system\n- Flag any risks or delays to your project manager\n- Prepare for final sprint to completion`,
      'day_before': `🚨 **URGENT Actions:**\n- Complete all remaining work items\n- Test and review your deliverables\n- Prepare for submission tomorrow\n- Contact PM immediately if extension needed`,
      'day_of': `🔥 **TODAY's Actions:**\n- Submit completed work immediately\n- Update all project documentation\n- Notify team of completion status\n- Schedule any required follow-up meetings`,
      'overdue': `❌ **CRITICAL Actions:**\n- Contact your project manager IMMEDIATELY\n- Provide updated completion estimate\n- Submit partial work if available\n- Document reasons for delay for project records`
    };
    return actionItems[type] || 'Please review your task and take appropriate action.';
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

    this.saveReminders();
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
    this.saveReminders();
    
    // Emit rebaseline request event
    this.eventBus.emit('task_updated', {
      type: 'rebaseline_requested',
      taskId: request.taskId,
      resourceId: request.resourceId,
      originalDeadline: request.originalDeadline,
      proposedDeadline: request.proposedDeadline
    }, 'email_service');
    
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
      this.saveReminders();
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
      this.saveReminders();
      console.log(`[REBASELINE REJECTED] Request ${requestId} rejected by ${reviewedBy}`);
    }
  }

  public destroy() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

// Initialize and start the reminder processing with real data
export const startEmailReminderService = () => {
  const service = EmailReminderService.getInstance();
  
  // Process reminders every minute
  setInterval(() => {
    service.processReminders();
  }, 60000);
  
  console.log('[Email Reminder Service] Started with real project data monitoring');
  return service;
};

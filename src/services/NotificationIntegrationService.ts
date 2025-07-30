
// Disabled version of NotificationIntegrationService due to missing database table

export interface NotificationSettings {
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  escalation_enabled: boolean;
  blackout_periods: any[];
}

export interface NotificationPriority {
  level: 'low' | 'medium' | 'high' | 'urgent';
  requiresAcknowledgment: boolean;
  escalationTimeMinutes: number;
}

export interface ProjectNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  created_at: string;
  metadata?: any;
  category?: 'project' | 'deadline' | 'team' | 'system' | 'performance' | 'escalation';
  timestamp?: Date;
  projectId?: string;
  projectName?: string;
  actionRequired?: boolean;
}

export class NotificationIntegrationService {
  private static instance: NotificationIntegrationService;
  
  public static getInstance(): NotificationIntegrationService {
    if (!NotificationIntegrationService.instance) {
      NotificationIntegrationService.instance = new NotificationIntegrationService();
    }
    return NotificationIntegrationService.instance;
  }

  private constructor() {
    console.warn('NotificationIntegrationService: Disabled due to missing database tables');
  }

  async queueNotification(
    userId: string,
    title: string,
    message: string,
    priority: NotificationPriority = { level: 'medium', requiresAcknowledgment: false, escalationTimeMinutes: 60 },
    metadata: any = {},
    workspaceId?: string
  ): Promise<boolean> {
    console.warn('NotificationIntegrationService: queueNotification disabled due to missing notification_queue table');
    return false;
  }

  async processNotificationQueue(): Promise<void> {
    console.warn('NotificationIntegrationService: processNotificationQueue disabled');
  }

  async sendEmailNotification(
    to: string,
    subject: string,
    body: string,
    metadata: any = {}
  ): Promise<boolean> {
    console.warn('NotificationIntegrationService: sendEmailNotification disabled');
    return false;
  }

  async getUserSettings(userId: string): Promise<NotificationSettings> {
    console.warn('NotificationIntegrationService: getUserSettings disabled');
    return {
      email_enabled: false,
      push_enabled: false,
      sms_enabled: false,
      escalation_enabled: false,
      blackout_periods: []
    };
  }

  async updateUserSettings(userId: string, settings: Partial<NotificationSettings>): Promise<boolean> {
    console.warn('NotificationIntegrationService: updateUserSettings disabled');
    return false;
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    console.warn('NotificationIntegrationService: markAsRead disabled');
    return false;
  }

  async getUnreadCount(userId: string): Promise<number> {
    console.warn('NotificationIntegrationService: getUnreadCount disabled');
    return 0;
  }

  // Additional methods required by other components
  getNotifications(userId?: string): ProjectNotification[] {
    console.warn('NotificationIntegrationService: getNotifications disabled');
    return [];
  }

  subscribe(callback: (notifications: ProjectNotification[]) => void): void {
    console.warn('NotificationIntegrationService: subscribe disabled');
  }

  markAllAsRead(): boolean {
    console.warn('NotificationIntegrationService: markAllAsRead disabled');
    return false;
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    console.warn('NotificationIntegrationService: deleteNotification disabled');
    return false;
  }

  async addNotification(notification: Partial<ProjectNotification>): Promise<boolean> {
    console.warn('NotificationIntegrationService: addNotification disabled');
    return false;
  }

  onTaskCompleted(taskId: string, projectId: string, taskName: string, assignedTo: string, completedBy: string, metadata: any = {}): void {
    console.warn('NotificationIntegrationService: onTaskCompleted disabled');
  }

  onProjectMilestone(milestoneId: string, projectId: string, milestoneName: string, dueDate: string, isOverdue: boolean): void {
    console.warn('NotificationIntegrationService: onProjectMilestone disabled');
  }

  onDeadlineApproaching(taskId: string, projectId: string, taskName: string, dueDate: string, daysRemaining: number): void {
    console.warn('NotificationIntegrationService: onDeadlineApproaching disabled');
  }

  onResourceAssigned(resourceId: string, projectId: string, resourceName: string, taskName: string, assignedBy: string): void {
    console.warn('NotificationIntegrationService: onResourceAssigned disabled');
  }
}

// Export additional functions required by index.ts
export const initializeNotificationIntegration = async (): Promise<void> => {
  console.warn('initializeNotificationIntegration: disabled due to missing database tables');
  // Return a resolved promise to maintain compatibility
  return Promise.resolve();
};

export const notificationIntegrationService = NotificationIntegrationService.getInstance();

// Disabled version of EnhancedNotificationService due to missing database tables

export class EnhancedNotificationService {
  private static instance: EnhancedNotificationService;

  public static getInstance(): EnhancedNotificationService {
    if (!EnhancedNotificationService.instance) {
      EnhancedNotificationService.instance = new EnhancedNotificationService();
    }
    return EnhancedNotificationService.instance;
  }

  private constructor() {
    console.warn('EnhancedNotificationService: Disabled due to missing database tables');
  }

  async getLastCheckIn(projectId: string): Promise<any> {
    console.warn('EnhancedNotificationService: getLastCheckIn disabled due to missing project_daily_checkins table');
    return null;
  }

  async sendReminderNotification(
    title: string, 
    message: string, 
    priority: string = 'medium',
    metadata: any = {}
  ): Promise<boolean> {
    console.warn('EnhancedNotificationService: sendReminderNotification disabled');
    return false;
  }

  async recordDeliveryConfirmation(
    resourceId: string,
    notificationId: string,
    token: string
  ): Promise<boolean> {
    console.warn('EnhancedNotificationService: recordDeliveryConfirmation disabled due to missing resource_delivery_confirmations table');
    return false;
  }

  async processScheduledNotifications(): Promise<void> {
    console.warn('EnhancedNotificationService: processScheduledNotifications disabled');
  }
}

export const enhancedNotificationService = EnhancedNotificationService.getInstance();
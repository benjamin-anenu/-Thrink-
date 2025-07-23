
import { supabase } from '@/integrations/supabase/client';
import { EventBus } from './EventBus';
import { toast } from 'sonner';

export interface EscalationCondition {
  id: string;
  trigger_id: string;
  condition_type: string;
  threshold_value: number;
  threshold_unit: string;
  project_id?: string;
  workspace_id: string;
}

export interface EscalationEvent {
  id: string;
  project_id: string;
  trigger_id: string;
  level_id: string;
  stakeholder_id: string;
  condition_met: boolean;
  threshold_exceeded: number;
  context: any;
  workspace_id: string;
}

export class EscalationMonitoringService {
  private static instance: EscalationMonitoringService;
  private eventBus: EventBus;
  private monitoringInterval?: number;
  private isMonitoring = false;
  private conditions: Map<string, EscalationCondition> = new Map();

  public static getInstance(): EscalationMonitoringService {
    if (!EscalationMonitoringService.instance) {
      EscalationMonitoringService.instance = new EscalationMonitoringService();
    }
    return EscalationMonitoringService.instance;
  }

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.setupEventListeners();
  }

  public async initialize(workspaceId: string): Promise<void> {
    console.log('[Escalation Monitor] Initializing for workspace:', workspaceId);
    
    try {
      await this.loadEscalationConditions(workspaceId);
      this.startMonitoring();
      console.log('[Escalation Monitor] Initialized successfully');
    } catch (error) {
      console.error('[Escalation Monitor] Failed to initialize:', error);
      throw error;
    }
  }

  private async loadEscalationConditions(workspaceId: string): Promise<void> {
    try {
      const { data: triggers, error } = await supabase
        .from('escalation_triggers')
        .select('*')
        .or(`workspace_id.is.null,workspace_id.eq.${workspaceId}`)
        .eq('is_active', true);

      if (error) throw error;

      this.conditions.clear();
      triggers?.forEach(trigger => {
        const condition: EscalationCondition = {
          id: trigger.id,
          trigger_id: trigger.id,
          condition_type: trigger.condition_type,
          threshold_value: trigger.threshold_value,
          threshold_unit: trigger.threshold_unit,
          workspace_id: workspaceId
        };
        this.conditions.set(trigger.id, condition);
      });

      console.log(`[Escalation Monitor] Loaded ${this.conditions.size} conditions`);
    } catch (error) {
      console.error('[Escalation Monitor] Error loading conditions:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    // Listen for project updates that might trigger escalations
    this.eventBus.subscribe('project_updated', (event) => {
      this.evaluateProjectConditions(event.payload.projectId);
    });

    // Listen for task updates
    this.eventBus.subscribe('task_updated', (event) => {
      if (event.payload.projectId) {
        this.evaluateProjectConditions(event.payload.projectId);
      }
    });

    // Listen for deadline approaching events
    this.eventBus.subscribe('deadline_approaching', (event) => {
      this.handleDeadlineEscalation(event.payload);
    });

    // Listen for performance alerts
    this.eventBus.subscribe('performance_alert', (event) => {
      this.handlePerformanceEscalation(event.payload);
    });
  }

  private startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    
    // Check conditions every 5 minutes
    this.monitoringInterval = window.setInterval(() => {
      this.performScheduledCheck();
    }, 5 * 60 * 1000);

    console.log('[Escalation Monitor] Started monitoring');
  }

  private async performScheduledCheck(): Promise<void> {
    if (this.conditions.size === 0) return;

    console.log('[Escalation Monitor] Performing scheduled check...');

    try {
      // Get all active projects
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, name, workspace_id, start_date, end_date, status')
        .eq('status', 'active');

      if (error) throw error;

      // Check each project against all conditions
      for (const project of projects || []) {
        await this.evaluateProjectConditions(project.id);
      }
    } catch (error) {
      console.error('[Escalation Monitor] Error in scheduled check:', error);
    }
  }

  private async evaluateProjectConditions(projectId: string): Promise<void> {
    try {
      // Get project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError || !project) return;

      // Get project tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId);

      if (tasksError) throw tasksError;

      // Evaluate each condition
      for (const condition of this.conditions.values()) {
        const shouldEscalate = await this.evaluateCondition(condition, project, tasks || []);
        
        if (shouldEscalate) {
          await this.triggerEscalation(condition, project, tasks || []);
        }
      }
    } catch (error) {
      console.error('[Escalation Monitor] Error evaluating conditions:', error);
    }
  }

  private async evaluateCondition(
    condition: EscalationCondition,
    project: any,
    tasks: any[]
  ): Promise<boolean> {
    const { condition_type, threshold_value, threshold_unit } = condition;

    switch (condition_type) {
      case 'overdue_tasks':
        return this.checkOverdueTasks(tasks, threshold_value);
      
      case 'budget_overrun':
        return this.checkBudgetOverrun(project, threshold_value);
      
      case 'schedule_delay':
        return this.checkScheduleDelay(project, tasks, threshold_value, threshold_unit);
      
      case 'task_completion_rate':
        return this.checkTaskCompletionRate(tasks, threshold_value);
      
      case 'resource_utilization':
        return this.checkResourceUtilization(project, tasks, threshold_value);
      
      case 'quality_issues':
        return this.checkQualityIssues(project, threshold_value);
      
      default:
        return false;
    }
  }

  private checkOverdueTasks(tasks: any[], threshold: number): boolean {
    const now = new Date();
    const overdueTasks = tasks.filter(task => 
      task.end_date && new Date(task.end_date) < now && task.status !== 'Completed'
    );
    return overdueTasks.length >= threshold;
  }

  private checkBudgetOverrun(project: any, threshold: number): boolean {
    // This would require budget tracking - placeholder for now
    return false;
  }

  private checkScheduleDelay(project: any, tasks: any[], threshold: number, unit: string): boolean {
    if (!project.end_date) return false;
    
    const projectEndDate = new Date(project.end_date);
    const latestTaskDate = tasks.reduce((latest, task) => {
      if (!task.end_date) return latest;
      const taskDate = new Date(task.end_date);
      return taskDate > latest ? taskDate : latest;
    }, new Date(0));

    if (latestTaskDate.getTime() === 0) return false;

    const delayDays = Math.ceil((latestTaskDate.getTime() - projectEndDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return unit === 'days' ? delayDays >= threshold : false;
  }

  private checkTaskCompletionRate(tasks: any[], threshold: number): boolean {
    if (tasks.length === 0) return false;
    
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const completionRate = (completedTasks / tasks.length) * 100;
    
    return completionRate < threshold;
  }

  private checkResourceUtilization(project: any, tasks: any[], threshold: number): boolean {
    // This would require resource utilization tracking - placeholder for now
    return false;
  }

  private checkQualityIssues(project: any, threshold: number): boolean {
    // This would require quality metrics tracking - placeholder for now
    return false;
  }

  private async triggerEscalation(
    condition: EscalationCondition,
    project: any,
    tasks: any[]
  ): Promise<void> {
    try {
      console.log('[Escalation Monitor] Triggering escalation for condition:', condition.condition_type);

      // Get escalation assignments for this trigger
      const { data: assignments, error } = await supabase
        .from('escalation_assignments')
        .select(`
          *,
          level:escalation_levels(name, level_order),
          stakeholder:stakeholders(name, email, role),
          trigger:escalation_triggers(name, description)
        `)
        .eq('trigger_id', condition.trigger_id)
        .eq('workspace_id', condition.workspace_id)
        .order('level.level_order');

      if (error) throw error;

      // Process escalation for each assignment
      for (const assignment of assignments || []) {
        await this.processEscalationAssignment(assignment, project, condition, tasks);
      }

      // Emit escalation event
      this.eventBus.emit('escalation_triggered', {
        projectId: project.id,
        triggerId: condition.trigger_id,
        conditionType: condition.condition_type,
        workspaceId: condition.workspace_id,
        timestamp: new Date()
      }, 'escalation_monitor');

    } catch (error) {
      console.error('[Escalation Monitor] Error triggering escalation:', error);
    }
  }

  private async processEscalationAssignment(
    assignment: any,
    project: any,
    condition: EscalationCondition,
    tasks: any[]
  ): Promise<void> {
    try {
      // Check if this escalation was already sent recently (within last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const { data: recentEscalations, error: historyError } = await supabase
        .from('escalation_history')
        .select('*')
        .eq('project_id', project.id)
        .eq('trigger_id', condition.trigger_id)
        .eq('level_id', assignment.level_id)
        .eq('stakeholder_id', assignment.stakeholder_id)
        .gte('sent_at', oneHourAgo.toISOString())
        .limit(1);

      if (historyError) throw historyError;

      if (recentEscalations && recentEscalations.length > 0) {
        console.log('[Escalation Monitor] Skipping duplicate escalation');
        return;
      }

      // Record escalation in history
      const { data: escalationHistory, error: insertError } = await supabase
        .from('escalation_history')
        .insert([{
          project_id: project.id,
          trigger_id: condition.trigger_id,
          level_id: assignment.level_id,
          stakeholder_id: assignment.stakeholder_id,
          workspace_id: condition.workspace_id,
          status: 'sent'
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Send notification (this would integrate with email service)
      await this.sendEscalationNotification(assignment, project, condition, tasks);

      console.log('[Escalation Monitor] Escalation sent to:', assignment.stakeholder.email);

    } catch (error) {
      console.error('[Escalation Monitor] Error processing escalation assignment:', error);
    }
  }

  private async sendEscalationNotification(
    assignment: any,
    project: any,
    condition: EscalationCondition,
    tasks: any[]
  ): Promise<void> {
    // This would integrate with the email service
    // For now, show a toast notification
    toast.error(`Escalation Alert: ${assignment.trigger.name} for project ${project.name}`, {
      description: `Notifying ${assignment.stakeholder.name} (${assignment.level.name})`,
      duration: 5000
    });

    // Emit notification event for the notification system
    this.eventBus.emit('escalation_notification', {
      type: 'escalation_alert',
      projectId: project.id,
      projectName: project.name,
      triggerName: assignment.trigger.name,
      levelName: assignment.level.name,
      stakeholderName: assignment.stakeholder.name,
      stakeholderEmail: assignment.stakeholder.email,
      conditionType: condition.condition_type,
      workspaceId: condition.workspace_id
    }, 'escalation_monitor');
  }

  private handleDeadlineEscalation(payload: any): void {
    // Handle deadline-specific escalations
    console.log('[Escalation Monitor] Handling deadline escalation:', payload);
  }

  private handlePerformanceEscalation(payload: any): void {
    // Handle performance-specific escalations
    console.log('[Escalation Monitor] Handling performance escalation:', payload);
  }

  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    console.log('[Escalation Monitor] Stopped monitoring');
  }

  public getMonitoringStatus(): {
    isMonitoring: boolean;
    conditionsCount: number;
    lastCheck: Date | null;
  } {
    return {
      isMonitoring: this.isMonitoring,
      conditionsCount: this.conditions.size,
      lastCheck: new Date() // Would track actual last check time
    };
  }

  public async refreshConditions(workspaceId: string): Promise<void> {
    await this.loadEscalationConditions(workspaceId);
  }
}

export const escalationMonitoringService = EscalationMonitoringService.getInstance();

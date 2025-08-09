
import { ProjectTask, ProjectData } from '@/types/project';
import { differenceInDays, isAfter } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { BudgetStatusEngine } from './BudgetStatusEngine';

export interface ProjectHealthData {
  healthScore: number;
  healthStatus: 'green' | 'yellow' | 'red';
  overdueTasks: number;
  overdueMilestones: number;
  criticalTasks: number;
  totalTasks: number;
  completedTasks: number;
  healthBreakdown: {
    timeline: 'green' | 'yellow' | 'red';
    budget: 'green' | 'yellow' | 'red';
    resources: 'green' | 'yellow' | 'red';
    quality: 'green' | 'yellow' | 'red';
  };
}

/**
 * Enhanced project health calculation service
 * Single source of truth for all project health metrics across the application
 * Real-time health calculation with consistent scoring
 */
export class ProjectHealthService {
  /**
   * Real-time project health calculation - PRIMARY METHOD
   * This is the single source of truth for project health across all views
   */
  static async calculateRealTimeProjectHealth(projectId: string): Promise<ProjectHealthData> {
    try {
      // Fetch project data and related entities
      const [projectResult, tasksResult, milestonesResult, budgetResult] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('project_tasks').select('*').eq('project_id', projectId),
        supabase.from('milestones').select('*').eq('project_id', projectId),
        supabase.from('project_budgets').select('*').eq('project_id', projectId)
      ]);

      const project = projectResult.data;
      const tasks = tasksResult.data || [];
      const milestones = milestonesResult.data || [];
      const budgets = budgetResult.data || [];

      return this.calculateProjectHealthFromData(projectId, tasks, milestones, budgets, project);
    } catch (error) {
      console.error('Error calculating real-time project health:', error);
      return this.getFallbackHealth();
    }
  }

  /**
   * Calculate project health from provided data (for performance optimization)
   */
  static async calculateProjectHealthFromData(
    projectId: string,
    tasks: any[] = [],
    milestones: any[] = [],
    budgets: any[] = [],
    project: any = null
  ): Promise<ProjectHealthData> {
    try {
      const clamp = (x: number) => Math.min(Math.max(x, 0), 1);
      const ESC_THRESH = 10;
      const ESC_CRIT = 0.8 * ESC_THRESH; // 8
      const WEIGHTS = {
        schedule: 0.25,
        budget: 0.20,
        tasks: 0.20,
        issues: 0.15,
        resources: 0.10,
        escalations: 0.10
      } as const;

      // Helper: safe days difference inclusive
      const daysBetween = (start?: string | Date | null, end?: string | Date | null) => {
        if (!start || !end) return 0;
        const s = typeof start === 'string' ? new Date(start) : start;
        const e = typeof end === 'string' ? new Date(end) : end;
        const d = differenceInDays(e, s);
        return Math.max(d, 0);
      };

      // Derive Planned Duration (PD) and Actual Duration (AD)
      const today = new Date();
      let plannedStart: Date | null = null;
      let plannedEnd: Date | null = null;

      // Prefer project baseline dates, then manual start/end, then task range
      if (project) {
        plannedStart = project.baseline_start_date ? new Date(project.baseline_start_date) : (project.start_date ? new Date(project.start_date) : null);
        plannedEnd = project.baseline_end_date ? new Date(project.baseline_end_date) : (project.end_date ? new Date(project.end_date) : null);
      }

      if (!plannedStart || !plannedEnd) {
        // Fallback to task range
        const starts = tasks.map(t => t.baseline_start_date || t.start_date).filter(Boolean).map((d: string) => new Date(d)).sort((a: Date, b: Date) => a.getTime() - b.getTime());
        const ends = tasks.map(t => t.baseline_end_date || t.end_date).filter(Boolean).map((d: string) => new Date(d)).sort((a: Date, b: Date) => b.getTime() - a.getTime());
        plannedStart = plannedStart || starts[0] || null;
        plannedEnd = plannedEnd || ends[0] || null;
      }

      const PD = plannedStart && plannedEnd ? Math.max(daysBetween(plannedStart, plannedEnd), 1) : 1;

      // Actual duration: earliest actual start to latest actual end (or today if ongoing)
      const actualStarts = tasks.map(t => t.start_date).filter(Boolean).map((d: string) => new Date(d)).sort((a: Date, b: Date) => a.getTime() - b.getTime());
      const actualEnds = tasks.map(t => t.end_date).filter(Boolean).map((d: string) => new Date(d)).sort((a: Date, b: Date) => b.getTime() - a.getTime());
      const actualStart = actualStarts[0] || plannedStart || today;
      const latestEnd = actualEnds[0] && isAfter(actualEnds[0], today) ? actualEnds[0] : today;
      const AD = Math.max(daysBetween(actualStart, latestEnd), 1);

      const SH = clamp(1 - (AD - PD) / PD);

      // Budget - Use Budget Status Engine for consistency
      const budgetStatus = await BudgetStatusEngine.calculateProjectBudgetStatus(projectId);
      const BH = budgetStatus.budget_health;

      // Tasks (weighted completion)
      const priorityWeight = (p?: string) => {
        switch ((p || 'Medium').toLowerCase()) {
          case 'critical': return 4;
          case 'high': return 3;
          case 'medium': return 2;
          case 'low': return 1;
          default: return 1;
        }
      };
      const taskWeights = tasks.map(t => priorityWeight(t.priority));
      const totalW = taskWeights.reduce((a: number, b: number) => a + b, 0);
      const doneW = tasks.reduce((sum: number, t: any, idx: number) => {
        const done = t.status === 'Completed' || (t.progress || 0) >= 100;
        return sum + (done ? taskWeights[idx] : 0);
      }, 0);
      const TH = totalW > 0 ? doneW / totalW : 1;

      // Issues (open severities)
      const { data: issues } = await supabase
        .from('project_issues')
        .select('severity,status')
        .eq('project_id', projectId);
      const openIssues = (issues || []).filter(i => !['Resolved', 'Closed'].includes((i.status || '').toString()));
      const sevWeight = (s?: string) => {
        switch ((s || 'Medium').toLowerCase()) {
          case 'critical': return 4;
          case 'high': return 3;
          case 'medium': return 2;
          case 'low': return 1;
          default: return 1;
        }
      };
      const S_open = openIssues.reduce((sum, i) => sum + sevWeight(i.severity as string), 0);
      const S_max = Math.max(openIssues.length * 4, 1);
      const IH = clamp(1 - S_open / S_max);

      // Resources (hours proxy via planned vs earned hours)
      const taskPlannedHours = tasks.reduce((sum, t) => {
        const durationDays = t.duration ? Number(t.duration) : daysBetween(t.start_date, t.end_date) || 1;
        return sum + durationDays * 8; // assume 8h/day
      }, 0);
      const taskEarnedHours = tasks.reduce((sum, t) => {
        const durationDays = t.duration ? Number(t.duration) : daysBetween(t.start_date, t.end_date) || 1;
        const planned = durationDays * 8;
        const completion = t.status === 'Completed' ? 1 : (Math.min(Math.max(Number(t.progress || 0), 0), 100) / 100);
        return sum + planned * completion;
      }, 0);
      const PH = taskPlannedHours;
      const AH = taskEarnedHours; // proxy for actual logged hours
      const RU = PH > 0 ? clamp(1 - Math.abs(AH / PH - 1)) : 1;

      // Escalations
      const { data: escalations } = await supabase
        .from('escalation_history')
        .select('status, acknowledged_at')
        .eq('project_id', projectId);
      const activeE = (escalations || []).filter(e => (e.status || 'sent') !== 'resolved' && !e.acknowledged_at).length;
      const EH = activeE === 0 ? 1 : activeE >= ESC_THRESH ? 0 : clamp(1 - activeE / ESC_THRESH);
      const escCrit = activeE >= ESC_CRIT;

      // Critical override
      if (escCrit || [SH, BH, TH, IH, RU, EH].some(v => v === 0)) {
        const breakdown = this.mapBreakdown(SH, BH, RU, TH, IH);
        const counts = this.computeCounts(tasks, milestones);
        return {
          healthScore: 0,
          healthStatus: 'red',
          overdueTasks: counts.overdueTasks,
          overdueMilestones: counts.overdueMilestones,
          criticalTasks: counts.criticalTasks,
          totalTasks: counts.totalTasks,
          completedTasks: counts.completedTasks,
          healthBreakdown: breakdown
        };
      }

      // Weighted sum
      const raw = WEIGHTS.schedule * SH + WEIGHTS.budget * BH + WEIGHTS.tasks * TH + WEIGHTS.issues * IH + WEIGHTS.resources * RU + WEIGHTS.escalations * EH;
      const percent = Math.round(raw * 100);
      const state: 'green' | 'yellow' | 'red' =
        percent >= 70 ? 'green' : percent >= 30 ? 'yellow' : 'red';

      const breakdown = this.mapBreakdown(SH, BH, RU, TH, IH);
      const counts = this.computeCounts(tasks, milestones);

      return {
        healthScore: percent,
        healthStatus: state,
        overdueTasks: counts.overdueTasks,
        overdueMilestones: counts.overdueMilestones,
        criticalTasks: counts.criticalTasks,
        totalTasks: counts.totalTasks,
        completedTasks: counts.completedTasks,
        healthBreakdown: breakdown
      };
    } catch (error) {
      console.error('Error calculating project health:', error);
      return this.getFallbackHealth();
    }
  }

  // Map normalized dimension scores to the existing 4-category breakdown
  private static mapBreakdown(
    SH: number,
    BH: number,
    RU: number,
    TH: number,
    IH: number
  ): ProjectHealthData['healthBreakdown'] {
    const toColor = (v: number): 'green' | 'yellow' | 'red' => (v >= 0.8 ? 'green' : v >= 0.5 ? 'yellow' : 'red');
    const timeline = toColor(SH);
    const budget = toColor(BH);
    const resources = toColor(RU);
    // Quality combines task completion and issue load equally
    const quality = toColor((TH + IH) / 2);

    return { timeline, budget, resources, quality };
  }


  /**
   * Get fallback health data when calculation fails
   */
  private static getFallbackHealth(): ProjectHealthData {
    return {
      healthScore: 50,
      healthStatus: 'yellow',
      overdueTasks: 0,
      overdueMilestones: 0,
      criticalTasks: 0,
      totalTasks: 0,
      completedTasks: 0,
      healthBreakdown: {
        timeline: 'yellow',
        budget: 'yellow',
        resources: 'yellow',
        quality: 'yellow'
      }
    };
  }

  /**
   * Legacy method for backward compatibility
   */
  static async calculateProjectHealthData(
    projectId: string,
    tasks: ProjectTask[] = [],
    milestones: any[] = []
  ): Promise<ProjectHealthData> {
    return this.calculateRealTimeProjectHealth(projectId);
  }

  // Counts used in the response
  private static computeCounts(milestoneTasks: any[], milestones: any[]) {
    const today = new Date();
    const totalTasks = milestoneTasks.length;
    const completedTasks = milestoneTasks.filter(t => t.status === 'Completed').length;
    const overdueTasks = milestoneTasks.filter(t => t.status !== 'Completed' && t.end_date && isAfter(today, new Date(t.end_date))).length;
    const overdueMilestones = milestones.filter(m => m.due_date && isAfter(today, new Date(m.due_date))).length;
    const criticalTasks = milestoneTasks.filter(t => (t.priority === 'High' || t.priority === 'Critical') && t.status !== 'Completed').length;

    return { totalTasks, completedTasks, overdueTasks, overdueMilestones, criticalTasks };
  }

  /**
   * Get health description for UI display
   */
  static getHealthDescription(healthStatus: 'green' | 'yellow' | 'red'): string {
    switch (healthStatus) {
      case 'green':
        return 'Healthy';
      case 'yellow':
        return 'Caution';
      case 'red':
        return 'At Risk';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get health color classes for UI styling
   */
  static getHealthColorClass(healthStatus: 'green' | 'yellow' | 'red'): string {
    switch (healthStatus) {
      case 'green':
        return 'text-green-500';
      case 'yellow':
        return 'text-yellow-500';
      case 'red':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  }

  /**
   * Get badge variant for health status
   */
  static getHealthBadgeVariant(healthStatus: 'green' | 'yellow' | 'red'): 'default' | 'secondary' | 'destructive' {
    switch (healthStatus) {
      case 'green':
        return 'default';
      case 'yellow':
        return 'secondary';
      case 'red':
        return 'destructive';
      default:
        return 'secondary';
    }
  }
}
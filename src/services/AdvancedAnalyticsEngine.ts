import { ProjectData, ProjectTask } from '@/types/project';
import { Resource } from '@/contexts/ResourceContext';
import { PerformanceTracker } from './PerformanceTracker';
import { budgetService, BudgetSummary } from './BudgetService';
import { clientSatisfactionService } from './ClientSatisfactionService';

export interface TrendPoint {
  date: string;
  value: number;
  label?: string;
}

export interface VelocityMetrics {
  currentVelocity: number;
  averageVelocity: number;
  velocityTrend: 'increasing' | 'decreasing' | 'stable';
  velocityHistory: TrendPoint[];
  predictedCompletion?: string;
}

export interface QualityMetrics {
  reworkRate: number;
  defectDensity: number;
  qualityTrend: 'improving' | 'declining' | 'stable';
  qualityScore: number;
}

export interface ResourceEfficiency {
  resourceId: string;
  resourceName: string;
  efficiencyScore: number;
  utilizationRate: number;
  taskCompletionRate: number;
  averageTaskDuration: number;
  strengths: string[];
  recommendations: string[];
}

export interface RiskIndicator {
  type: 'schedule' | 'budget' | 'resource' | 'quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  probability: number;
  impact: number;
  riskScore: number;
  mitigation: string[];
  affectedProjects: string[];
}

export interface PredictiveInsight {
  type: 'forecast' | 'recommendation' | 'alert' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timeframe: string;
  actionItems: string[];
  dataSource: string;
}

export interface AdvancedAnalytics {
  // Velocity and Performance
  workspaceVelocity: VelocityMetrics;
  projectVelocities: Map<string, VelocityMetrics>;
  
  // Quality Metrics
  overallQuality: QualityMetrics;
  projectQuality: Map<string, QualityMetrics>;
  
  // Resource Analytics
  resourceEfficiencies: ResourceEfficiency[];
  teamPerformance: {
    averageEfficiency: number;
    topPerformers: ResourceEfficiency[];
    underPerformers: ResourceEfficiency[];
    capacityUtilization: number;
  };
  
  // Risk Analysis
  activeRisks: RiskIndicator[];
  riskTrends: TrendPoint[];
  
  // Predictive Insights
  insights: PredictiveInsight[];
  
  // Comparative Analytics
  benchmarks: {
    industryAverage?: number;
    teamBest: number;
    workspaceAverage: number;
    improvementPotential: number;
  };
}

export class AdvancedAnalyticsEngine {
  private static instance: AdvancedAnalyticsEngine;
  private performanceTracker: PerformanceTracker;
  private analyticsCache: Map<string, any> = new Map();
  private lastAnalyticsUpdate: Date = new Date(0);

  public static getInstance(): AdvancedAnalyticsEngine {
    if (!AdvancedAnalyticsEngine.instance) {
      AdvancedAnalyticsEngine.instance = new AdvancedAnalyticsEngine();
    }
    return AdvancedAnalyticsEngine.instance;
  }

  private constructor() {
    this.performanceTracker = PerformanceTracker.getInstance();
    this.loadHistoricalData();
  }

  async generateAdvancedAnalytics(
    projects: ProjectData[], 
    resources: Resource[], 
    workspaceId: string
  ): Promise<AdvancedAnalytics> {
    
    // Check cache validity (refresh every 5 minutes)
    const cacheKey = `analytics-${workspaceId}`;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    if (this.lastAnalyticsUpdate > fiveMinutesAgo && this.analyticsCache.has(cacheKey)) {
      return this.analyticsCache.get(cacheKey);
    }

    console.log('[Analytics Engine] Generating advanced analytics for workspace:', workspaceId);

    const analytics: AdvancedAnalytics = {
      workspaceVelocity: this.calculateWorkspaceVelocity(projects),
      projectVelocities: this.calculateProjectVelocities(projects),
      overallQuality: this.calculateOverallQuality(projects),
      projectQuality: this.calculateProjectQuality(projects),
      resourceEfficiencies: this.calculateResourceEfficiencies(resources, projects),
      teamPerformance: this.calculateTeamPerformance(resources, projects),
      activeRisks: this.identifyActiveRisks(projects, resources),
      riskTrends: this.calculateRiskTrends(projects),
      insights: await this.generatePredictiveInsights(projects, resources, workspaceId),
      benchmarks: this.calculateBenchmarks(projects, resources)
    };

    // Cache results
    this.analyticsCache.set(cacheKey, analytics);
    this.lastAnalyticsUpdate = new Date();

    console.log('[Analytics Engine] Generated analytics with', analytics.insights.length, 'insights');
    return analytics;
  }

  private calculateWorkspaceVelocity(projects: ProjectData[]): VelocityMetrics {
    const activeProjects = projects.filter(p => p.status === 'In Progress');
    const completedProjects = projects.filter(p => p.status === 'Completed');
    
    // Calculate current velocity (tasks completed per week)
    const recentTasks = this.getRecentCompletedTasks(projects, 7); // Last 7 days
    const currentVelocity = recentTasks.length;
    
    // Calculate historical velocity
    const velocityHistory: TrendPoint[] = [];
    for (let i = 12; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const weekTasks = this.getTasksCompletedInRange(projects, weekStart, weekEnd);
      velocityHistory.push({
        date: weekStart.toISOString().split('T')[0],
        value: weekTasks.length,
        label: `Week ${13 - i}`
      });
    }
    
    const averageVelocity = velocityHistory.reduce((sum, point) => sum + point.value, 0) / velocityHistory.length;
    
    // Determine trend
    const recentAvg = velocityHistory.slice(-4).reduce((sum, point) => sum + point.value, 0) / 4;
    const olderAvg = velocityHistory.slice(-8, -4).reduce((sum, point) => sum + point.value, 0) / 4;
    
    let velocityTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentAvg > olderAvg * 1.1) velocityTrend = 'increasing';
    else if (recentAvg < olderAvg * 0.9) velocityTrend = 'decreasing';
    
    // Predict completion for active projects
    const remainingTasks = activeProjects.reduce((sum, p) => 
      sum + p.tasks.filter(t => t.status !== 'Completed').length, 0
    );
    
    const weeksToCompletion = averageVelocity > 0 ? Math.ceil(remainingTasks / averageVelocity) : null;
    const predictedCompletion = weeksToCompletion ? 
      new Date(Date.now() + weeksToCompletion * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
      undefined;

    return {
      currentVelocity,
      averageVelocity: Math.round(averageVelocity * 10) / 10,
      velocityTrend,
      velocityHistory,
      predictedCompletion
    };
  }

  private calculateProjectVelocities(projects: ProjectData[]): Map<string, VelocityMetrics> {
    const projectVelocities = new Map<string, VelocityMetrics>();
    
    projects.forEach(project => {
      const completedTasks = project.tasks.filter(t => t.status === 'Completed');
      const totalTasks = project.tasks.length;
      
      if (totalTasks === 0) return;
      
      // Calculate project-specific velocity
      const projectStartDate = new Date(project.startDate);
      const daysSinceStart = Math.max(1, Math.floor((Date.now() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24)));
      const currentVelocity = (completedTasks.length / daysSinceStart) * 7; // Tasks per week
      
      // Simple velocity history for project
      const velocityHistory: TrendPoint[] = [];
      const weeksElapsed = Math.min(12, Math.floor(daysSinceStart / 7));
      
      for (let week = 0; week < weeksElapsed; week++) {
        const weekStart = new Date(projectStartDate);
        weekStart.setDate(weekStart.getDate() + (week * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const weekTasks = project.tasks.filter(task => {
          const taskDate = new Date(task.endDate);
          return taskDate >= weekStart && taskDate < weekEnd && task.status === 'Completed';
        });
        
        velocityHistory.push({
          date: weekStart.toISOString().split('T')[0],
          value: weekTasks.length,
          label: `Week ${week + 1}`
        });
      }
      
      const averageVelocity = velocityHistory.length > 0 ? 
        velocityHistory.reduce((sum, point) => sum + point.value, 0) / velocityHistory.length : 
        currentVelocity;
      
      // Predict completion
      const remainingTasks = totalTasks - completedTasks.length;
      const weeksToCompletion = averageVelocity > 0 ? Math.ceil(remainingTasks / averageVelocity) : null;
      const predictedCompletion = weeksToCompletion ? 
        new Date(Date.now() + weeksToCompletion * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
        undefined;
      
      projectVelocities.set(project.id, {
        currentVelocity: Math.round(currentVelocity * 10) / 10,
        averageVelocity: Math.round(averageVelocity * 10) / 10,
        velocityTrend: this.determineTrend(velocityHistory),
        velocityHistory,
        predictedCompletion
      });
    });
    
    return projectVelocities;
  }

  private calculateOverallQuality(projects: ProjectData[]): QualityMetrics {
    let totalTasks = 0;
    let reworkTasks = 0;
    let qualityIssues = 0;
    
    projects.forEach(project => {
      project.tasks.forEach(task => {
        totalTasks++;
        
        // Simulate quality metrics based on task characteristics
        if (task.progress < 100 && task.status === 'In Progress') {
          // Tasks that are in progress but have low progress might indicate rework
          if (task.progress < 30) reworkTasks++;
        }
        
        // Tasks that took much longer than estimated might indicate quality issues
        const estimatedDuration = this.parseDuration(task.duration);
        const actualDuration = this.calculateActualDuration(task);
        
        if (actualDuration > estimatedDuration * 1.5) {
          qualityIssues++;
        }
      });
    });
    
    const reworkRate = totalTasks > 0 ? (reworkTasks / totalTasks) * 100 : 0;
    const defectDensity = totalTasks > 0 ? (qualityIssues / totalTasks) * 100 : 0;
    const qualityScore = Math.max(0, 100 - reworkRate - defectDensity);
    
    return {
      reworkRate: Math.round(reworkRate * 10) / 10,
      defectDensity: Math.round(defectDensity * 10) / 10,
      qualityTrend: reworkRate < 10 ? 'improving' : reworkRate > 20 ? 'declining' : 'stable',
      qualityScore: Math.round(qualityScore)
    };
  }

  private calculateProjectQuality(projects: ProjectData[]): Map<string, QualityMetrics> {
    const projectQuality = new Map<string, QualityMetrics>();
    
    projects.forEach(project => {
      const quality = this.calculateOverallQuality([project]);
      projectQuality.set(project.id, quality);
    });
    
    return projectQuality;
  }

  private calculateResourceEfficiencies(resources: Resource[], projects: ProjectData[]): ResourceEfficiency[] {
    return resources.map(resource => {
      const performanceProfile = this.performanceTracker.getPerformanceProfile(resource.id);
      
      // Calculate task assignments and completion rates
      const assignedTasks = this.getTasksAssignedToResource(projects, resource.id);
      const completedTasks = assignedTasks.filter(t => t.status === 'Completed');
      const taskCompletionRate = assignedTasks.length > 0 ? 
        (completedTasks.length / assignedTasks.length) * 100 : 0;
      
      // Calculate average task duration
      const durations = completedTasks.map(t => this.calculateActualDuration(t));
      const averageTaskDuration = durations.length > 0 ? 
        durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;
      
      // Efficiency scoring
      const efficiencyScore = performanceProfile ? 
        performanceProfile.currentScore : 
        Math.min(100, taskCompletionRate + (resource.utilization * 0.3));
      
      // Generate strengths and recommendations
      const strengths = this.identifyResourceStrengths(resource, assignedTasks);
      const recommendations = this.generateResourceRecommendations(resource, assignedTasks, efficiencyScore);
      
      return {
        resourceId: resource.id,
        resourceName: resource.name,
        efficiencyScore: Math.round(efficiencyScore),
        utilizationRate: resource.utilization,
        taskCompletionRate: Math.round(taskCompletionRate),
        averageTaskDuration: Math.round(averageTaskDuration * 10) / 10,
        strengths,
        recommendations
      };
    });
  }

  private calculateTeamPerformance(resources: Resource[], projects: ProjectData[]) {
    const efficiencies = this.calculateResourceEfficiencies(resources, projects);
    
    const averageEfficiency = efficiencies.length > 0 ? 
      efficiencies.reduce((sum, r) => sum + r.efficiencyScore, 0) / efficiencies.length : 0;
    
    const topPerformers = efficiencies
      .filter(r => r.efficiencyScore >= 80)
      .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
      .slice(0, 3);
    
    const underPerformers = efficiencies
      .filter(r => r.efficiencyScore < 60)
      .sort((a, b) => a.efficiencyScore - b.efficiencyScore)
      .slice(0, 3);
    
    const capacityUtilization = resources.length > 0 ? 
      resources.reduce((sum, r) => sum + r.utilization, 0) / resources.length : 0;
    
    return {
      averageEfficiency: Math.round(averageEfficiency),
      topPerformers,
      underPerformers,
      capacityUtilization: Math.round(capacityUtilization)
    };
  }

  private identifyActiveRisks(projects: ProjectData[], resources: Resource[]): RiskIndicator[] {
    const risks: RiskIndicator[] = [];
    
    // Schedule risks
    projects.forEach(project => {
      const overdueTasks = project.tasks.filter(task => {
        const taskDate = new Date(task.endDate);
        return taskDate < new Date() && task.status !== 'Completed';
      });
      
      if (overdueTasks.length > 0) {
        const riskScore = Math.min(100, overdueTasks.length * 20);
        risks.push({
          type: 'schedule',
          severity: riskScore > 80 ? 'critical' : riskScore > 60 ? 'high' : riskScore > 40 ? 'medium' : 'low',
          description: `${overdueTasks.length} overdue tasks in ${project.name}`,
          probability: 90,
          impact: riskScore,
          riskScore,
          mitigation: [
            'Reallocate resources to critical tasks',
            'Extend project timeline',
            'Reduce project scope'
          ],
          affectedProjects: [project.id]
        });
      }
    });
    
    // Resource risks
    const overutilizedResources = resources.filter(r => r.utilization > 90);
    if (overutilizedResources.length > 0) {
      risks.push({
        type: 'resource',
        severity: overutilizedResources.length > 3 ? 'high' : 'medium',
        description: `${overutilizedResources.length} team members are overutilized`,
        probability: 75,
        impact: 70,
        riskScore: 70,
        mitigation: [
          'Redistribute workload',
          'Add temporary resources',
          'Prioritize critical tasks'
        ],
        affectedProjects: projects.map(p => p.id)
      });
    }
    
    return risks.sort((a, b) => b.riskScore - a.riskScore);
  }

  private calculateRiskTrends(projects: ProjectData[]): TrendPoint[] {
    const trends: TrendPoint[] = [];
    
    // Generate risk trend over last 12 weeks
    for (let i = 12; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      
      // Calculate risk score for that week
      const weeklyRiskScore = this.calculateWeeklyRiskScore(projects, weekStart);
      
      trends.push({
        date: weekStart.toISOString().split('T')[0],
        value: weeklyRiskScore,
        label: `Week ${13 - i}`
      });
    }
    
    return trends;
  }

  private async generatePredictiveInsights(
    projects: ProjectData[], 
    resources: Resource[], 
    workspaceId: string
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];
    
    // Velocity forecast
    const workspaceVelocity = this.calculateWorkspaceVelocity(projects);
    if (workspaceVelocity.velocityTrend === 'decreasing') {
      insights.push({
        type: 'alert',
        title: 'Decreasing Team Velocity Detected',
        description: `Team velocity has decreased by ${Math.abs(workspaceVelocity.currentVelocity - workspaceVelocity.averageVelocity).toFixed(1)} tasks/week. This may impact upcoming deadlines.`,
        confidence: 85,
        impact: 'high',
        timeframe: 'Next 2-4 weeks',
        actionItems: [
          'Review team workload and redistribute tasks',
          'Identify and remove blockers',
          'Consider adding temporary resources'
        ],
        dataSource: 'Velocity trend analysis'
      });
    }
    
    // Resource optimization
    const efficiencies = this.calculateResourceEfficiencies(resources, projects);
    const underutilized = efficiencies.filter(r => r.utilizationRate < 50);
    const overutilized = efficiencies.filter(r => r.utilizationRate > 90);
    
    if (underutilized.length > 0 && overutilized.length > 0) {
      insights.push({
        type: 'recommendation',
        title: 'Resource Rebalancing Opportunity',
        description: `${underutilized.length} team members are underutilized while ${overutilized.length} are overloaded. Rebalancing could improve efficiency by 15-25%.`,
        confidence: 92,
        impact: 'medium',
        timeframe: 'Next 1-2 weeks',
        actionItems: [
          `Assign tasks from ${overutilized.map(r => r.resourceName).join(', ')} to available team members`,
          'Cross-train team members for better flexibility',
          'Review project priorities and deadlines'
        ],
        dataSource: 'Resource utilization analysis'
      });
    }
    
    // Budget forecast
    try {
      const budgetSummary = await budgetService.getWorkspaceBudgetSummary(workspaceId);
      if (budgetSummary.utilizationRate > 80) {
        insights.push({
          type: 'forecast',
          title: 'Budget Utilization Alert',
          description: `Current budget utilization is at ${budgetSummary.utilizationRate}%. Based on current spending patterns, you may exceed budget within 3-4 weeks.`,
          confidence: 78,
          impact: 'high',
          timeframe: 'Next 3-4 weeks',
          actionItems: [
            'Review and prioritize essential project activities',
            'Negotiate timeline extensions to spread costs',
            'Consider reducing project scope for current phase'
          ],
          dataSource: 'Budget trend analysis'
        });
      }
    } catch (error) {
      console.warn('[Analytics] Budget analysis failed:', error);
    }
    
    // Quality improvement opportunity
    const qualityMetrics = this.calculateOverallQuality(projects);
    if (qualityMetrics.reworkRate > 15) {
      insights.push({
        type: 'opportunity',
        title: 'Quality Improvement Opportunity',
        description: `Current rework rate is ${qualityMetrics.reworkRate.toFixed(1)}%. Implementing quality gates could reduce rework by 30-40% and improve delivery speed.`,
        confidence: 70,
        impact: 'medium',
        timeframe: 'Next 4-6 weeks',
        actionItems: [
          'Implement code review processes',
          'Add quality checkpoints at task completion',
          'Provide additional training on high-rework areas'
        ],
        dataSource: 'Quality metrics analysis'
      });
    }
    
    return insights.sort((a, b) => {
      const impactScore = { high: 3, medium: 2, low: 1 };
      return (impactScore[b.impact] * b.confidence) - (impactScore[a.impact] * a.confidence);
    });
  }

  private calculateBenchmarks(projects: ProjectData[], resources: Resource[]) {
    const velocityMetrics = this.calculateWorkspaceVelocity(projects);
    const teamPerformance = this.calculateTeamPerformance(resources, projects);
    
    // Industry averages (simulated based on typical project management metrics)
    const industryAverage = 75; // Average efficiency score
    
    return {
      industryAverage,
      teamBest: Math.max(...resources.map(r => r.utilization), 0),
      workspaceAverage: teamPerformance.averageEfficiency,
      improvementPotential: Math.max(0, industryAverage - teamPerformance.averageEfficiency)
    };
  }

  // Helper methods
  private getRecentCompletedTasks(projects: ProjectData[], days: number): ProjectTask[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return projects.flatMap(project => 
      project.tasks.filter(task => 
        task.status === 'Completed' && 
        new Date(task.endDate) >= cutoffDate
      )
    );
  }

  private getTasksCompletedInRange(projects: ProjectData[], start: Date, end: Date): ProjectTask[] {
    return projects.flatMap(project => 
      project.tasks.filter(task => {
        const taskDate = new Date(task.endDate);
        return task.status === 'Completed' && taskDate >= start && taskDate < end;
      })
    );
  }

  private getTasksAssignedToResource(projects: ProjectData[], resourceId: string): ProjectTask[] {
    return projects.flatMap(project => 
      project.tasks.filter(task => 
        task.assignedResources.includes(resourceId)
      )
    );
  }

  private determineTrend(history: TrendPoint[]): 'increasing' | 'decreasing' | 'stable' {
    if (history.length < 4) return 'stable';
    
    const recent = history.slice(-3);
    const older = history.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p.value, 0) / older.length;
    
    if (recentAvg > olderAvg * 1.1) return 'increasing';
    if (recentAvg < olderAvg * 0.9) return 'decreasing';
    return 'stable';
  }

  private parseDuration(duration: number): number {
    return duration || 5; // Default 5 days if not specified
  }

  private calculateActualDuration(task: ProjectTask): number {
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }

  private identifyResourceStrengths(resource: Resource, tasks: ProjectTask[]): string[] {
    const strengths: string[] = [];
    
    if (resource.utilization > 80) {
      strengths.push('High productivity and utilization');
    }
    
    const completedTasks = tasks.filter(t => t.status === 'Completed');
    if (completedTasks.length > 0) {
      const avgDuration = completedTasks.reduce((sum, t) => sum + this.calculateActualDuration(t), 0) / completedTasks.length;
      if (avgDuration < 5) {
        strengths.push('Fast task completion');
      }
    }
    
    if (resource.skills && resource.skills.length > 3) {
      strengths.push('Versatile skill set');
    }
    
    return strengths.length > 0 ? strengths : ['Consistent performance'];
  }

  private generateResourceRecommendations(resource: Resource, tasks: ProjectTask[], efficiencyScore: number): string[] {
    const recommendations: string[] = [];
    
    if (efficiencyScore < 60) {
      recommendations.push('Consider additional training or mentoring');
      recommendations.push('Review workload and task complexity');
    }
    
    if (resource.utilization > 90) {
      recommendations.push('Reduce workload to prevent burnout');
    } else if (resource.utilization < 50) {
      recommendations.push('Increase task assignments to improve utilization');
    }
    
    const overdueTasks = tasks.filter(t => new Date(t.endDate) < new Date() && t.status !== 'Completed');
    if (overdueTasks.length > 0) {
      recommendations.push('Focus on completing overdue tasks first');
    }
    
    return recommendations.length > 0 ? recommendations : ['Continue current performance level'];
  }

  private calculateWeeklyRiskScore(projects: ProjectData[], weekDate: Date): number {
    // Simplified risk calculation for historical data
    let riskScore = 0;
    
    projects.forEach(project => {
      const overdueTasks = project.tasks.filter(task => {
        const taskDate = new Date(task.endDate);
        return taskDate < weekDate && task.status !== 'Completed';
      });
      riskScore += overdueTasks.length * 5;
    });
    
    return Math.min(100, riskScore);
  }

  private loadHistoricalData(): void {
    // Load any cached historical analytics data
    const cached = localStorage.getItem('analytics-historical');
    if (cached) {
      try {
        const historical = JSON.parse(cached);
        console.log('[Analytics Engine] Loaded historical data:', Object.keys(historical).length, 'entries');
      } catch (error) {
        console.warn('[Analytics Engine] Failed to load historical data:', error);
      }
    }
  }

  // Public utility methods
  public clearCache(): void {
    this.analyticsCache.clear();
    this.lastAnalyticsUpdate = new Date(0);
  }

  public getCacheStats(): { size: number; lastUpdate: Date } {
    return {
      size: this.analyticsCache.size,
      lastUpdate: this.lastAnalyticsUpdate
    };
  }
}

export const advancedAnalyticsEngine = AdvancedAnalyticsEngine.getInstance();
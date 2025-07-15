import { PerformanceProfile, PerformanceMetric, MonthlyPerformanceReport } from '@/types/performance';
import { EventBus } from './EventBus';

export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private performanceProfiles: Map<string, PerformanceProfile> = new Map();
  private eventBus: EventBus;

  public static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.setupEventListeners();
    this.loadPerformanceData();
  }

  private setupEventListeners() {
    // Listen for real task completion events
    this.eventBus.subscribe('task_completed', (event) => {
      const { taskId, taskName, projectId, projectName, resourceId, resourceName } = event.payload;
      this.trackPositiveActivity(
        resourceId, 
        'task_completion', 
        8, 
        `Completed task: ${taskName}`, 
        projectId, 
        taskId
      );
    });

    // Listen for deadline adherence events
    this.eventBus.subscribe('deadline_approaching', (event) => {
      const { taskId, taskName, projectId, resourceId, daysRemaining } = event.payload;
      if (daysRemaining < 0) {
        // Task is overdue
        this.trackNegativeActivity(
          resourceId,
          'deadline_adherence',
          -5,
          `Missed deadline for: ${taskName}`,
          projectId,
          taskId
        );
      }
    });

    // Listen for resource assignment events
    this.eventBus.subscribe('resource_assigned', (event) => {
      const { resourceId, resourceName } = event.payload;
      this.trackPositiveActivity(
        resourceId,
        'collaboration',
        3,
        'New project assignment',
        event.payload.projectId
      );
    });

    console.log('[Performance Tracker] Event listeners established');
  }

  private loadPerformanceData() {
    const saved = localStorage.getItem('performance-profiles');
    if (saved) {
      try {
        const profiles = JSON.parse(saved);
        profiles.forEach((profile: any) => {
          this.performanceProfiles.set(profile.resourceId, {
            ...profile,
            lastUpdated: new Date(profile.lastUpdated),
            metrics: profile.metrics.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp)
            }))
          });
        });
      } catch (error) {
        console.error('[Performance Tracker] Error loading saved data:', error);
      }
    }
  }

  private savePerformanceData() {
    const profiles = Array.from(this.performanceProfiles.values());
    localStorage.setItem('performance-profiles', JSON.stringify(profiles));
  }

  // Track positive performance indicators
  public trackPositiveActivity(resourceId: string, type: PerformanceMetric['type'], value: number, description: string, projectId?: string, taskId?: string) {
    this.addMetric(resourceId, {
      id: Date.now().toString(),
      resourceId,
      type,
      value,
      weight: this.getMetricWeight(type),
      timestamp: new Date(),
      projectId,
      taskId,
      description
    });
    
    console.log(`[AI Performance Tracker] Positive activity tracked for ${resourceId}: ${description}`);
  }

  // Track negative performance indicators
  public trackNegativeActivity(resourceId: string, type: PerformanceMetric['type'], value: number, description: string, projectId?: string, taskId?: string) {
    this.addMetric(resourceId, {
      id: Date.now().toString(),
      resourceId,
      type,
      value: -Math.abs(value), // Ensure negative
      weight: this.getMetricWeight(type),
      timestamp: new Date(),
      projectId,
      taskId,
      description
    });
    
    console.log(`[AI Performance Tracker] Negative activity tracked for ${resourceId}: ${description}`);
  }

  private addMetric(resourceId: string, metric: PerformanceMetric) {
    let profile = this.performanceProfiles.get(resourceId);
    
    if (!profile) {
      profile = this.createNewProfile(resourceId);
      this.performanceProfiles.set(resourceId, profile);
    }

    profile.metrics.push(metric);
    this.updateProfileScores(profile);
    this.updateProfileTrend(profile);
    this.assessRiskLevel(profile);
    profile.lastUpdated = new Date();
    
    this.savePerformanceData();
    
    // Emit performance alerts if needed
    if (profile.riskLevel === 'critical' || profile.riskLevel === 'high') {
      this.eventBus.emit('performance_alert', {
        resourceId,
        resourceName: profile.resourceName,
        riskLevel: profile.riskLevel,
        currentScore: profile.currentScore,
        trend: profile.trend
      }, 'performance_tracker');
    }
  }

  private createNewProfile(resourceId: string): PerformanceProfile {
    // Try to get resource name from localStorage
    let resourceName = `Resource ${resourceId}`;
    try {
      const resources = JSON.parse(localStorage.getItem('resources') || '[]');
      const resource = resources.find((r: any) => r.id === resourceId);
      if (resource) {
        resourceName = resource.name;
      }
    } catch (error) {
      console.warn('[Performance Tracker] Could not load resource name');
    }

    return {
      resourceId,
      resourceName,
      currentScore: 75, // Starting neutral score
      monthlyScore: 75,
      trend: 'stable',
      metrics: [],
      strengths: [],
      improvementAreas: [],
      riskLevel: 'low',
      lastUpdated: new Date(),
      monthlyReports: []
    };
  }

  private getMetricWeight(type: PerformanceMetric['type']): number {
    const weights = {
      'task_completion': 0.3,
      'deadline_adherence': 0.25,
      'quality_score': 0.2,
      'collaboration': 0.15,
      'communication': 0.1
    };
    return weights[type];
  }

  private updateProfileScores(profile: PerformanceProfile) {
    const recentMetrics = profile.metrics.filter(m => 
      Date.now() - m.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000 // Last 30 days
    );

    if (recentMetrics.length === 0) return;

    const weightedScore = recentMetrics.reduce((sum, metric) => 
      sum + (metric.value * metric.weight), 0
    );
    const totalWeight = recentMetrics.reduce((sum, metric) => sum + metric.weight, 0);
    
    profile.currentScore = Math.max(0, Math.min(100, 75 + (weightedScore / totalWeight) * 10));
    
    // Monthly score (last month)
    const monthlyMetrics = profile.metrics.filter(m => {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return m.timestamp >= monthAgo;
    });

    if (monthlyMetrics.length > 0) {
      const monthlyWeightedScore = monthlyMetrics.reduce((sum, metric) => 
        sum + (metric.value * metric.weight), 0
      );
      const monthlyTotalWeight = monthlyMetrics.reduce((sum, metric) => sum + metric.weight, 0);
      profile.monthlyScore = Math.max(0, Math.min(100, 75 + (monthlyWeightedScore / monthlyTotalWeight) * 10));
    }
  }

  private updateProfileTrend(profile: PerformanceProfile) {
    const scores = this.getRecentScoreHistory(profile);
    if (scores.length < 3) return;

    const recent = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const previous = scores.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;

    if (recent > previous + 5) {
      profile.trend = 'improving';
    } else if (recent < previous - 5) {
      profile.trend = 'declining';
    } else {
      profile.trend = 'stable';
    }
  }

  private getRecentScoreHistory(profile: PerformanceProfile): number[] {
    // Simulate weekly score calculation - in real implementation, this would be stored
    return [72, 74, 76, 75, 78, 76, profile.currentScore];
  }

  private assessRiskLevel(profile: PerformanceProfile) {
    if (profile.currentScore < 40 || profile.trend === 'declining') {
      profile.riskLevel = 'critical';
    } else if (profile.currentScore < 60) {
      profile.riskLevel = 'high';
    } else if (profile.currentScore < 75) {
      profile.riskLevel = 'medium';
    } else {
      profile.riskLevel = 'low';
    }
  }

  public getPerformanceProfile(resourceId: string): PerformanceProfile | undefined {
    return this.performanceProfiles.get(resourceId);
  }

  public getAllProfiles(): PerformanceProfile[] {
    return Array.from(this.performanceProfiles.values());
  }

  public generateMonthlyReport(resourceId: string): MonthlyPerformanceReport {
    const profile = this.performanceProfiles.get(resourceId);
    if (!profile) {
      throw new Error(`Performance profile not found for resource ${resourceId}`);
    }

    const now = new Date();
    const report: MonthlyPerformanceReport = {
      id: `${resourceId}-${now.getFullYear()}-${now.getMonth() + 1}`,
      resourceId,
      month: now.toLocaleString('default', { month: 'long' }),
      year: now.getFullYear(),
      overallScore: profile.monthlyScore,
      categories: {
        productivity: this.getCategoryScore(profile, 'task_completion'),
        quality: this.getCategoryScore(profile, 'quality_score'),
        collaboration: this.getCategoryScore(profile, 'collaboration'),
        deadlineAdherence: this.getCategoryScore(profile, 'deadline_adherence'),
        communication: this.getCategoryScore(profile, 'communication')
      },
      achievements: this.generateAchievements(profile),
      challenges: this.generateChallenges(profile),
      goals: this.generateGoals(profile),
      aiInsights: this.generateAIInsights(profile),
      generatedAt: new Date()
    };

    profile.monthlyReports.push(report);
    return report;
  }

  private getCategoryScore(profile: PerformanceProfile, type: PerformanceMetric['type']): number {
    const categoryMetrics = profile.metrics.filter(m => m.type === type);
    if (categoryMetrics.length === 0) return 75;
    
    const avgValue = categoryMetrics.reduce((sum, m) => sum + m.value, 0) / categoryMetrics.length;
    return Math.max(0, Math.min(100, 75 + avgValue * 10));
  }

  private generateAchievements(profile: PerformanceProfile): string[] {
    const achievements = [];
    if (profile.currentScore > 85) achievements.push('Exceptional overall performance');
    if (profile.trend === 'improving') achievements.push('Consistent improvement trend');
    
    const completionMetrics = profile.metrics.filter(m => m.type === 'task_completion' && m.value > 0);
    if (completionMetrics.length > 10) achievements.push('High task completion rate');
    
    return achievements;
  }

  private generateChallenges(profile: PerformanceProfile): string[] {
    const challenges = [];
    if (profile.currentScore < 60) challenges.push('Performance below expectations');
    if (profile.trend === 'declining') challenges.push('Declining performance trend');
    
    const deadlineMetrics = profile.metrics.filter(m => m.type === 'deadline_adherence' && m.value < 0);
    if (deadlineMetrics.length > 3) challenges.push('Deadline adherence needs improvement');
    
    return challenges;
  }

  private generateGoals(profile: PerformanceProfile): string[] {
    const goals = [];
    if (profile.currentScore < 80) goals.push('Improve overall performance score to 80+');
    if (profile.trend !== 'improving') goals.push('Establish consistent improvement trend');
    
    return goals;
  }

  private generateAIInsights(profile: PerformanceProfile): string[] {
    const insights = [];
    
    if (profile.trend === 'improving') {
      insights.push('Performance trajectory is positive. Continue current strategies.');
    } else if (profile.trend === 'declining') {
      insights.push('Consider workload adjustment or additional support.');
    }
    
    if (profile.riskLevel === 'high' || profile.riskLevel === 'critical') {
      insights.push('Immediate intervention recommended to prevent burnout.');
    }
    
    return insights;
  }
}

// Initialize performance tracking with real data monitoring
export const initializePerformanceTracking = () => {
  const tracker = PerformanceTracker.getInstance();
  console.log('[Performance Tracker] Initialized with real-time event monitoring');
  return tracker;
};

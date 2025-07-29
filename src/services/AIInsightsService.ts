
import { EventBus } from './EventBus';
import { PerformanceTracker } from './PerformanceTracker';
import { AIProjectInsight, RiskProfile, AIRecommendation, ProjectData, RiskFactor } from '@/types/project';

export class AIInsightsService {
  private static instance: AIInsightsService;
  private eventBus: EventBus;
  private performanceTracker: PerformanceTracker;
  private insights: Map<string, AIProjectInsight[]> = new Map();
  private riskProfiles: Map<string, RiskProfile> = new Map();
  private recommendations: Map<string, AIRecommendation[]> = new Map();

  public static getInstance(): AIInsightsService {
    if (!AIInsightsService.instance) {
      AIInsightsService.instance = new AIInsightsService();
    }
    return AIInsightsService.instance;
  }

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.performanceTracker = PerformanceTracker.getInstance();
    this.setupEventListeners();
    this.loadStoredData();
  }

  private setupEventListeners(): void {
    // Listen for project updates to trigger AI re-analysis
    this.eventBus.subscribe('project_updated', (event) => {
      const projectId = event.payload.projectId || event.payload.project?.id;
      if (projectId && projectId !== 'undefined') {
        this.scheduleAIAnalysis(projectId);
      }
    });

    // Listen for task completion to update insights
    this.eventBus.subscribe('task_completed', (event) => {
      const projectId = event.payload.projectId || event.payload.project?.id;
      if (projectId && projectId !== 'undefined') {
        this.updateProjectInsights(projectId);
      }
    });

    // Listen for deadline approaching events
    this.eventBus.subscribe('deadline_approaching', (event) => {
      const { projectId } = event.payload;
      this.updateRiskProfile(projectId);
    });

    // Listen for performance alerts
    this.eventBus.subscribe('performance_alert', (event) => {
      const { resourceId } = event.payload;
      this.updateResourceRelatedInsights(resourceId);
    });
  }

  private loadStoredData(): void {
    try {
      const savedInsights = localStorage.getItem('ai-insights');
      const savedRisks = localStorage.getItem('risk-profiles');
      const savedRecommendations = localStorage.getItem('ai-recommendations');

      if (savedInsights) {
        const insights = JSON.parse(savedInsights);
        Object.entries(insights).forEach(([projectId, projectInsights]: [string, any]) => {
          this.insights.set(projectId, projectInsights.map((insight: any) => ({
            ...insight,
            createdAt: new Date(insight.createdAt),
            expiresAt: insight.expiresAt ? new Date(insight.expiresAt) : undefined
          })));
        });
      }

      if (savedRisks) {
        const risks = JSON.parse(savedRisks);
        Object.entries(risks).forEach(([projectId, risk]: [string, any]) => {
          this.riskProfiles.set(projectId, {
            ...risk,
            lastUpdated: new Date(risk.lastUpdated),
            trends: risk.trends.map((trend: any) => ({
              ...trend,
              date: new Date(trend.date)
            }))
          });
        });
      }

      if (savedRecommendations) {
        const recommendations = JSON.parse(savedRecommendations);
        Object.entries(recommendations).forEach(([projectId, projectRecs]: [string, any]) => {
          this.recommendations.set(projectId, projectRecs.map((rec: any) => ({
            ...rec,
            createdAt: new Date(rec.createdAt),
            implementedAt: rec.implementedAt ? new Date(rec.implementedAt) : undefined
          })));
        });
      }
    } catch (error) {
      console.error('[AI Insights Service] Error loading stored data:', error);
    }
  }

  private saveData(): void {
    try {
      const insightsData = Object.fromEntries(this.insights.entries());
      const risksData = Object.fromEntries(this.riskProfiles.entries());
      const recommendationsData = Object.fromEntries(this.recommendations.entries());

      localStorage.setItem('ai-insights', JSON.stringify(insightsData));
      localStorage.setItem('risk-profiles', JSON.stringify(risksData));
      localStorage.setItem('ai-recommendations', JSON.stringify(recommendationsData));
    } catch (error) {
      console.error('[AI Insights Service] Error saving data:', error);
    }
  }

  public generateInitialInsights(project: ProjectData): void {
    const insights: AIProjectInsight[] = [];
    const recommendations: AIRecommendation[] = [];

    // Generate timeline insights
    const timelineInsight = this.analyzeProjectTimeline(project);
    if (timelineInsight) insights.push(timelineInsight);

    // Generate resource allocation insights
    const resourceInsight = this.analyzeResourceAllocation(project);
    if (resourceInsight) insights.push(resourceInsight);

    // Generate risk insights
    const riskInsight = this.analyzeProjectRisks(project);
    if (riskInsight) insights.push(riskInsight);

    // Generate initial recommendations
    const initialRecommendations = this.generateInitialRecommendations(project);
    recommendations.push(...initialRecommendations);

    // Store insights and recommendations
    this.insights.set(project.id, insights);
    this.recommendations.set(project.id, recommendations);

    // Create initial risk profile
    const riskProfile = this.createInitialRiskProfile(project);
    this.riskProfiles.set(project.id, riskProfile);

    this.saveData();
    
    // Emit event for UI updates
    this.eventBus.emit('ai_insights_updated', {
      projectId: project.id,
      insights,
      recommendations,
      riskProfile
    }, 'ai_insights_service');
  }

  private analyzeProjectTimeline(project: ProjectData): AIProjectInsight | null {
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const now = new Date();
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    const expectedProgress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
    
    const progressDifference = project.progress - expectedProgress;

    if (Math.abs(progressDifference) > 10) {
      return {
        id: `timeline-${project.id}-${Date.now()}`,
        projectId: project.id,
        type: progressDifference > 0 ? 'opportunity' : 'risk',
        title: progressDifference > 0 ? 'Project Ahead of Schedule' : 'Project Behind Schedule',
        description: `Project is ${Math.abs(progressDifference).toFixed(1)}% ${progressDifference > 0 ? 'ahead of' : 'behind'} expected timeline progress.`,
        confidence: 85,
        impact: Math.abs(progressDifference) > 20 ? 'high' : 'medium',
        category: 'timeline',
        recommendations: progressDifference > 0 
          ? ['Consider advancing next phase', 'Reallocate resources to other projects']
          : ['Review task priorities', 'Consider additional resources', 'Identify blockers'],
        createdAt: new Date(),
        status: 'active'
      };
    }
    return null;
  }

  private analyzeResourceAllocation(project: ProjectData): AIProjectInsight | null {
    if (project.resources.length === 0) return null;

    const resourceProfiles = project.resources.map(resourceId => 
      this.performanceTracker.getPerformanceProfile(resourceId)
    ).filter(Boolean);

    const avgPerformance = resourceProfiles.length > 0
      ? resourceProfiles.reduce((sum, profile) => sum + profile!.currentScore, 0) / resourceProfiles.length
      : 75;

    if (avgPerformance < 60) {
      return {
        id: `resource-${project.id}-${Date.now()}`,
        projectId: project.id,
        type: 'risk',
        title: 'Resource Performance Concern',
        description: `Team performance average (${avgPerformance.toFixed(1)}) is below optimal levels.`,
        confidence: 78,
        impact: 'high',
        category: 'resources',
        recommendations: [
          'Review workload distribution',
          'Provide additional training or support',
          'Consider team restructuring'
        ],
        createdAt: new Date(),
        status: 'active'
      };
    } else if (avgPerformance > 85) {
      return {
        id: `resource-${project.id}-${Date.now()}`,
        projectId: project.id,
        type: 'opportunity',
        title: 'High-Performing Team',
        description: `Team performance average (${avgPerformance.toFixed(1)}) is exceptional.`,
        confidence: 92,
        impact: 'medium',
        category: 'resources',
        recommendations: [
          'Consider taking on additional scope',
          'Share best practices with other teams',
          'Fast-track to next milestone'
        ],
        createdAt: new Date(),
        status: 'active'
      };
    }
    return null;
  }

  private analyzeProjectRisks(project: ProjectData): AIProjectInsight | null {
    const overdueTasks = project.tasks.filter(task => {
      const taskDate = new Date(task.endDate);
      const today = new Date();
      return taskDate < today && task.status !== 'Completed';
    });

    if (overdueTasks.length > 0) {
      return {
        id: `risk-${project.id}-${Date.now()}`,
        projectId: project.id,
        type: 'risk',
        title: 'Overdue Tasks Detected',
        description: `${overdueTasks.length} tasks are overdue, which may impact project delivery.`,
        confidence: 95,
        impact: overdueTasks.length > 3 ? 'high' : 'medium',
        category: 'timeline',
        recommendations: [
          'Prioritize overdue tasks',
          'Reassign resources if needed',
          'Update project timeline',
          'Communicate delays to stakeholders'
        ],
        createdAt: new Date(),
        status: 'active'
      };
    }
    return null;
  }

  private generateInitialRecommendations(project: ProjectData): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    // Task prioritization recommendation
    const highPriorityTasks = project.tasks.filter(task => 
      task.priority === 'High' || task.priority === 'Critical'
    );

    if (highPriorityTasks.length > 5) {
      recommendations.push({
        id: `rec-priority-${project.id}-${Date.now()}`,
        projectId: project.id,
        type: 'task_prioritization',
        title: 'Optimize Task Priorities',
        description: 'Multiple high-priority tasks may cause resource conflicts. Consider reviewing and adjusting priorities.',
        priority: 'medium',
        expectedImpact: 'Improved focus and resource allocation',
        implementationEffort: 'low',
        status: 'pending',
        createdAt: new Date()
      });
    }

    // Resource allocation recommendation
    if (project.resources.length < 3 && project.tasks.length > 10) {
      recommendations.push({
        id: `rec-resource-${project.id}-${Date.now()}`,
        projectId: project.id,
        type: 'resource_allocation',
        title: 'Consider Additional Resources',
        description: 'High task-to-resource ratio may lead to bottlenecks. Consider adding team members.',
        priority: 'high',
        expectedImpact: 'Faster task completion and reduced bottlenecks',
        implementationEffort: 'high',
        status: 'pending',
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  private createInitialRiskProfile(project: ProjectData): RiskProfile {
    const riskFactors: RiskFactor[] = [];
    let overallRiskScore = 0;

    // Schedule risk
    const scheduleRisk = this.calculateScheduleRisk(project);
    if (scheduleRisk.riskScore > 0) {
      riskFactors.push(scheduleRisk);
      overallRiskScore += scheduleRisk.riskScore;
    }

    // Resource risk
    const resourceRisk = this.calculateResourceRisk(project);
    if (resourceRisk.riskScore > 0) {
      riskFactors.push(resourceRisk);
      overallRiskScore += resourceRisk.riskScore;
    }

    // Calculate overall risk level
    const avgRiskScore = riskFactors.length > 0 ? overallRiskScore / riskFactors.length : 0;
    
    return {
      projectId: project.id,
      overallRiskScore: avgRiskScore,
      riskLevel: avgRiskScore > 70 ? 'critical' : avgRiskScore > 50 ? 'high' : avgRiskScore > 30 ? 'medium' : 'low',
      riskFactors,
      mitigationStrategies: this.generateMitigationStrategies(riskFactors),
      lastUpdated: new Date(),
      trends: [{
        date: new Date(),
        riskScore: avgRiskScore,
        changeReason: 'Initial assessment'
      }]
    };
  }

  private calculateScheduleRisk(project: ProjectData): RiskFactor {
    const overdueTasks = project.tasks.filter(task => {
      const taskDate = new Date(task.endDate);
      const today = new Date();
      return taskDate < today && task.status !== 'Completed';
    });

    const riskScore = Math.min(100, overdueTasks.length * 20);

    return {
      id: `schedule-risk-${project.id}`,
      category: 'schedule',
      description: `${overdueTasks.length} overdue tasks present schedule risk`,
      probability: overdueTasks.length > 0 ? 80 : 20,
      impact: overdueTasks.length > 3 ? 80 : overdueTasks.length > 0 ? 50 : 20,
      riskScore,
      status: overdueTasks.length > 0 ? 'monitoring' : 'identified',
      mitigationActions: [
        'Prioritize overdue tasks',
        'Reallocate resources',
        'Update timeline expectations'
      ]
    };
  }

  private calculateResourceRisk(project: ProjectData): RiskFactor {
    const taskToResourceRatio = project.tasks.length / Math.max(1, project.resources.length);
    const riskScore = Math.min(100, Math.max(0, (taskToResourceRatio - 3) * 20));

    return {
      id: `resource-risk-${project.id}`,
      category: 'resource',
      description: `Task-to-resource ratio of ${taskToResourceRatio.toFixed(1)} may indicate resource constraints`,
      probability: taskToResourceRatio > 5 ? 70 : taskToResourceRatio > 3 ? 40 : 20,
      impact: taskToResourceRatio > 5 ? 70 : taskToResourceRatio > 3 ? 50 : 30,
      riskScore,
      status: taskToResourceRatio > 5 ? 'monitoring' : 'identified',
      mitigationActions: [
        'Add additional team members',
        'Reduce project scope',
        'Optimize task distribution'
      ]
    };
  }

  private generateMitigationStrategies(riskFactors: RiskFactor[]): string[] {
    const strategies = new Set<string>();
    
    riskFactors.forEach(factor => {
      factor.mitigationActions.forEach(action => strategies.add(action));
    });

    return Array.from(strategies);
  }

  private analysisQueue: Set<string> = new Set();
  private analysisTimer: NodeJS.Timeout | null = null;

  private scheduleAIAnalysis(projectId: string): void {
    // Add to queue and batch process to reduce system load
    this.analysisQueue.add(projectId);
    
    if (this.analysisTimer) {
      clearTimeout(this.analysisTimer);
    }
    
    this.analysisTimer = setTimeout(() => {
      this.processBatchedAnalysis();
    }, 2000); // Batch analyses every 2 seconds
  }

  private processBatchedAnalysis(): void {
    const projectIds = Array.from(this.analysisQueue);
    this.analysisQueue.clear();
    
    console.log(`[AI Insights Service] Processing batched analysis for ${projectIds.length} projects`);
    
    projectIds.forEach(projectId => {
      this.updateProjectInsights(projectId);
    });
  }

  private updateProjectInsights(projectId: string): void {
    // Validate projectId
    if (!projectId || projectId === 'undefined') {
      console.warn('[AI Insights Service] Invalid projectId provided for insights update');
      return;
    }
    
    try {
      console.log(`[AI Insights Service] Updating insights for project ${projectId}`);
      
      // Get current insights and check if update is needed
      const currentInsights = this.insights.get(projectId) || [];
      const lastUpdate = currentInsights.length > 0 
        ? Math.max(...currentInsights.map(i => i.createdAt.getTime()))
        : 0;
      
      // Only update if last update was more than 5 minutes ago
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      if (lastUpdate > fiveMinutesAgo) {
        console.debug(`[AI Insights Service] Skipping recent update for project ${projectId}`);
        return;
      }
      
      // Emit event to notify components of updated insights
      this.eventBus.emit('ai_insights_updated', {
        projectId,
        timestamp: new Date()
      }, 'ai_insights_service');
      
    } catch (error) {
      console.error(`[AI Insights Service] Error updating insights for project ${projectId}:`, error);
    }
  }

  private updateRiskProfile(projectId: string): void {
    const currentProfile = this.riskProfiles.get(projectId);
    if (currentProfile) {
      // Update risk trends
      currentProfile.trends.push({
        date: new Date(),
        riskScore: currentProfile.overallRiskScore + 5, // Simulate risk increase
        changeReason: 'Deadline approaching'
      });
      
      currentProfile.lastUpdated = new Date();
      this.saveData();
    }
  }

  private updateResourceRelatedInsights(resourceId: string): void {
    // Update insights related to this resource across all projects
    console.log(`[AI Insights Service] Updating resource-related insights for ${resourceId}`);
  }

  // Public API methods
  public getProjectInsights(projectId: string): AIProjectInsight[] {
    return this.insights.get(projectId) || [];
  }

  public getProjectRiskProfile(projectId: string): RiskProfile | undefined {
    return this.riskProfiles.get(projectId);
  }

  public getProjectRecommendations(projectId: string): AIRecommendation[] {
    return this.recommendations.get(projectId) || [];
  }

  public dismissInsight(projectId: string, insightId: string): void {
    const projectInsights = this.insights.get(projectId);
    if (projectInsights) {
      const insight = projectInsights.find(i => i.id === insightId);
      if (insight) {
        insight.status = 'dismissed';
        this.saveData();
      }
    }
  }

  public implementRecommendation(projectId: string, recommendationId: string, results?: string): void {
    const projectRecommendations = this.recommendations.get(projectId);
    if (projectRecommendations) {
      const recommendation = projectRecommendations.find(r => r.id === recommendationId);
      if (recommendation) {
        recommendation.status = 'implemented';
        recommendation.implementedAt = new Date();
        if (results) recommendation.results = results;
        this.saveData();
      }
    }
  }
}

// Export singleton instance
export const aiInsightsService = AIInsightsService.getInstance();

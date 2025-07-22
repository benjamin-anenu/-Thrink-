import { 
  TaskIntelligence, 
  GitCommitData, 
  CommunicationThread, 
  HelpRequest, 
  TaskCompletionPattern 
} from '../types/TaskIntelligence';
import { ResourceProfile } from '../types/ResourceProfile';

export interface DataCollectionConfig {
  git_repositories: GitRepository[];
  task_management_integrations: TaskManagementIntegration[];
  communication_platforms: CommunicationPlatform[];
  polling_intervals: {
    git_commits: number; // minutes
    task_updates: number; // minutes
    communication: number; // minutes
  };
}

interface GitRepository {
  id: string;
  url: string;
  access_token: string;
  branch: string;
  enabled: boolean;
}

interface TaskManagementIntegration {
  platform: 'jira' | 'asana' | 'trello' | 'github' | 'linear';
  api_key: string;
  workspace_id: string;
  enabled: boolean;
}

interface CommunicationPlatform {
  platform: 'slack' | 'teams' | 'discord';
  webhook_url: string;
  channels: string[];
  enabled: boolean;
}

export class AutomatedDataCollectionService {
  private config: DataCollectionConfig;
  private isCollecting: boolean = false;
  private collectionIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: DataCollectionConfig) {
    this.config = config;
  }

  /**
   * Start automated data collection across all configured integrations
   */
  async startDataCollection(): Promise<void> {
    if (this.isCollecting) {
      console.log('Data collection already running');
      return;
    }

    this.isCollecting = true;
    console.log('Starting automated data collection...');

    // Start Git commit collection
    this.startGitCommitCollection();
    
    // Start task management integration
    this.startTaskManagementCollection();
    
    // Start communication tracking
    this.startCommunicationCollection();
    
    // Start periodic pattern analysis
    this.startPatternAnalysis();
  }

  /**
   * Stop all data collection processes
   */
  async stopDataCollection(): Promise<void> {
    this.isCollecting = false;
    
    // Clear all intervals
    for (const [key, interval] of this.collectionIntervals) {
      clearInterval(interval);
      this.collectionIntervals.delete(key);
    }
    
    console.log('Stopped automated data collection');
  }

  /**
   * Start collecting Git commit data and linking to tasks
   */
  private startGitCommitCollection(): void {
    const interval = setInterval(async () => {
      try {
        await this.collectGitCommits();
      } catch (error) {
        console.error('Error collecting Git commits:', error);
      }
    }, this.config.polling_intervals.git_commits * 60 * 1000);

    this.collectionIntervals.set('git_commits', interval);
  }

  /**
   * Collect recent Git commits and link them to tasks
   */
  private async collectGitCommits(): Promise<void> {
    for (const repo of this.config.git_repositories) {
      if (!repo.enabled) continue;

      try {
        const recentCommits = await this.fetchRecentCommits(repo);
        
        for (const commit of recentCommits) {
          const linkedTasks = await this.linkCommitToTasks(commit);
          
          for (const taskId of linkedTasks) {
            await this.storeGitCommitData(taskId, commit);
          }
        }
      } catch (error) {
        console.error(`Error collecting commits from ${repo.url}:`, error);
      }
    }
  }

  /**
   * Fetch recent commits from a Git repository
   */
  private async fetchRecentCommits(repo: GitRepository): Promise<any[]> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
    
    try {
      // GitHub API example
      const response = await fetch(
        `https://api.github.com/repos/${this.extractRepoPath(repo.url)}/commits?since=${since.toISOString()}`,
        {
          headers: {
            'Authorization': `token ${repo.access_token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching commits:', error);
      return [];
    }
  }

  /**
   * Link Git commit to tasks based on commit message patterns
   */
  private async linkCommitToTasks(commit: any): Promise<string[]> {
    const linkedTasks: string[] = [];
    const message = commit.commit.message;
    
    // Common patterns for task references in commit messages
    const patterns = [
      /(?:task|ticket|issue|fix|fixes|closes?|resolves?)[:\s#]*([A-Z]+-\d+)/gi,
      /(?:task|ticket|issue|fix|fixes|closes?|resolves?)[:\s#]*(\d+)/gi,
      /#(\d+)/g, // Simple #123 format
      /\b([A-Z]{2,}-\d+)\b/g, // JIRA-style tickets
    ];
    
    for (const pattern of patterns) {
      const matches = message.matchAll(pattern);
      for (const match of matches) {
        const taskReference = match[1];
        const taskId = await this.resolveTaskReference(taskReference);
        if (taskId && !linkedTasks.includes(taskId)) {
          linkedTasks.push(taskId);
        }
      }
    }
    
    return linkedTasks;
  }

  /**
   * Resolve task reference to actual task ID
   */
  private async resolveTaskReference(reference: string): Promise<string | null> {
    // Implementation would query the database to find task by reference
    // This is a simplified example
    try {
      // Query database for task with matching reference/title/ID
      const task = await this.findTaskByReference(reference);
      return task?.id || null;
    } catch (error) {
      console.error('Error resolving task reference:', error);
      return null;
    }
  }

  /**
   * Store Git commit data linked to a task
   */
  private async storeGitCommitData(taskId: string, commit: any): Promise<void> {
    const commitData: GitCommitData = {
      commit_hash: commit.sha,
      timestamp: new Date(commit.commit.author.date),
      lines_added: commit.stats?.additions || 0,
      lines_removed: commit.stats?.deletions || 0,
      files_changed: commit.files?.length || 0,
      commit_message: commit.commit.message,
      author: commit.commit.author.email
    };

    // Store in database (implementation would use actual DB service)
    await this.saveGitCommitData(taskId, commitData);
  }

  /**
   * Start task management platform integration
   */
  private startTaskManagementCollection(): void {
    const interval = setInterval(async () => {
      try {
        await this.collectTaskUpdates();
      } catch (error) {
        console.error('Error collecting task updates:', error);
      }
    }, this.config.polling_intervals.task_updates * 60 * 1000);

    this.collectionIntervals.set('task_updates', interval);
  }

  /**
   * Collect task updates from integrated platforms
   */
  private async collectTaskUpdates(): Promise<void> {
    for (const integration of this.config.task_management_integrations) {
      if (!integration.enabled) continue;

      try {
        await this.collectFromTaskPlatform(integration);
      } catch (error) {
        console.error(`Error collecting from ${integration.platform}:`, error);
      }
    }
  }

  /**
   * Collect data from specific task management platform
   */
  private async collectFromTaskPlatform(integration: TaskManagementIntegration): Promise<void> {
    switch (integration.platform) {
      case 'jira':
        await this.collectFromJira(integration);
        break;
      case 'asana':
        await this.collectFromAsana(integration);
        break;
      case 'github':
        await this.collectFromGitHubIssues(integration);
        break;
      case 'linear':
        await this.collectFromLinear(integration);
        break;
      default:
        console.warn(`Unsupported platform: ${integration.platform}`);
    }
  }

  /**
   * Collect task data from JIRA
   */
  private async collectFromJira(integration: TaskManagementIntegration): Promise<void> {
    const since = new Date(Date.now() - 2 * 60 * 60 * 1000); // Last 2 hours
    
    try {
      // JIRA REST API call
      const response = await fetch(
        `https://${integration.workspace_id}.atlassian.net/rest/api/3/search?jql=updated >= "${since.toISOString()}"`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(integration.api_key).toString('base64')}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`JIRA API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      for (const issue of data.issues) {
        await this.processJiraIssueUpdate(issue);
      }
    } catch (error) {
      console.error('Error collecting from JIRA:', error);
    }
  }

  /**
   * Process JIRA issue update
   */
  private async processJiraIssueUpdate(issue: any): Promise<void> {
    const taskId = await this.findTaskByExternalId('jira', issue.key);
    if (!taskId) return;

    // Extract task completion patterns
    if (issue.fields.status.name === 'Done' && issue.fields.resolutiondate) {
      await this.recordTaskCompletion(taskId, {
        completed_at: new Date(issue.fields.resolutiondate),
        quality_indicators: this.extractQualityFromJira(issue),
        complexity_actual: this.calculateComplexityFromJira(issue)
      });
    }

    // Track help requests (from comments)
    if (issue.fields.comment?.comments) {
      for (const comment of issue.fields.comment.comments) {
        if (this.isHelpRequest(comment.body)) {
          await this.recordHelpRequest(taskId, {
            requested_at: new Date(comment.created),
            help_type: this.classifyHelpRequest(comment.body),
            helped_by: comment.author.emailAddress
          });
        }
      }
    }
  }

  /**
   * Start communication platform integration
   */
  private startCommunicationCollection(): void {
    const interval = setInterval(async () => {
      try {
        await this.collectCommunicationData();
      } catch (error) {
        console.error('Error collecting communication data:', error);
      }
    }, this.config.polling_intervals.communication * 60 * 1000);

    this.collectionIntervals.set('communication', interval);
  }

  /**
   * Collect communication data from integrated platforms
   */
  private async collectCommunicationData(): Promise<void> {
    for (const platform of this.config.communication_platforms) {
      if (!platform.enabled) continue;

      try {
        await this.collectFromCommunicationPlatform(platform);
      } catch (error) {
        console.error(`Error collecting from ${platform.platform}:`, error);
      }
    }
  }

  /**
   * Collect data from communication platform
   */
  private async collectFromCommunicationPlatform(platform: CommunicationPlatform): Promise<void> {
    switch (platform.platform) {
      case 'slack':
        await this.collectFromSlack(platform);
        break;
      case 'teams':
        await this.collectFromTeams(platform);
        break;
      default:
        console.warn(`Unsupported communication platform: ${platform.platform}`);
    }
  }

  /**
   * Collect communication data from Slack
   */
  private async collectFromSlack(platform: CommunicationPlatform): Promise<void> {
    const since = Math.floor((Date.now() - 2 * 60 * 60 * 1000) / 1000); // Last 2 hours in Unix timestamp
    
    for (const channel of platform.channels) {
      try {
        // Slack Web API call (this would need proper Slack app setup)
        const response = await fetch(
          `https://slack.com/api/conversations.history?channel=${channel}&oldest=${since}`,
          {
            headers: {
              'Authorization': `Bearer ${this.extractTokenFromWebhook(platform.webhook_url)}`,
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Slack API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.ok && data.messages) {
          await this.processSlackMessages(data.messages, channel);
        }
      } catch (error) {
        console.error(`Error collecting from Slack channel ${channel}:`, error);
      }
    }
  }

  /**
   * Process Slack messages for task-related communication
   */
  private async processSlackMessages(messages: any[], channel: string): Promise<void> {
    for (const message of messages) {
      const taskReferences = await this.extractTaskReferencesFromText(message.text);
      
      for (const taskId of taskReferences) {
        const thread: CommunicationThread = {
          id: `slack_${message.ts}`,
          platform: 'slack',
          thread_id: message.thread_ts || message.ts,
          message_count: 1,
          participants: [message.user],
          started_at: new Date(parseFloat(message.ts) * 1000),
          last_activity: new Date(parseFloat(message.ts) * 1000),
          sentiment_score: await this.analyzeSentiment(message.text)
        };

        await this.storeCommunicationThread(taskId, thread);
      }
    }
  }

  /**
   * Start periodic pattern analysis
   */
  private startPatternAnalysis(): void {
    const interval = setInterval(async () => {
      try {
        await this.analyzeTaskCompletionPatterns();
        await this.updateResourceMetrics();
      } catch (error) {
        console.error('Error in pattern analysis:', error);
      }
    }, 60 * 60 * 1000); // Every hour

    this.collectionIntervals.set('pattern_analysis', interval);
  }

  /**
   * Analyze task completion patterns for all resources
   */
  private async analyzeTaskCompletionPatterns(): Promise<void> {
    const resources = await this.getAllResources();
    
    for (const resource of resources) {
      try {
        const completionData = await this.getResourceCompletionData(resource.id);
        const patterns = this.calculateCompletionPatterns(completionData);
        
        await this.updateResourcePatterns(resource.id, patterns);
      } catch (error) {
        console.error(`Error analyzing patterns for resource ${resource.id}:`, error);
      }
    }
  }

  /**
   * Calculate completion patterns from raw data
   */
  private calculateCompletionPatterns(completionData: any[]): {
    peak_productivity_periods: string[],
    task_switching_penalty_score: number,
    optimal_task_complexity_mix: any,
    historical_task_velocity: number
  } {
    
    // Analyze completion times to find peak productivity
    const hourlyCompletions = new Map<string, number>();
    const dailyCompletions = new Map<string, number>();
    
    for (const completion of completionData) {
      const date = new Date(completion.completed_at);
      const hour = date.getHours();
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const timeSlot = `${day}-${hour < 12 ? 'AM' : 'PM'}`;
      
      hourlyCompletions.set(timeSlot, (hourlyCompletions.get(timeSlot) || 0) + 1);
      dailyCompletions.set(day, (dailyCompletions.get(day) || 0) + 1);
    }
    
    // Find peak productivity periods (top 20% of time slots)
    const sortedSlots = Array.from(hourlyCompletions.entries())
      .sort((a, b) => b[1] - a[1]);
    const topSlots = sortedSlots.slice(0, Math.ceil(sortedSlots.length * 0.2));
    const peakPeriods = topSlots.map(slot => slot[0]);
    
    // Calculate task switching penalty based on context switches
    const taskSwitchingPenalty = this.calculateTaskSwitchingPenalty(completionData);
    
    // Calculate optimal complexity mix
    const complexityMix = this.calculateOptimalComplexityMix(completionData);
    
    // Calculate historical velocity (tasks per week)
    const velocity = this.calculateTaskVelocity(completionData);
    
    return {
      peak_productivity_periods: peakPeriods,
      task_switching_penalty_score: taskSwitchingPenalty,
      optimal_task_complexity_mix: complexityMix,
      historical_task_velocity: velocity
    };
  }

  /**
   * Calculate task switching penalty from completion data
   */
  private calculateTaskSwitchingPenalty(completionData: any[]): number {
    // Analyze time between task completions and project switches
    let totalPenalty = 0;
    let measurements = 0;
    
    for (let i = 1; i < completionData.length; i++) {
      const prev = completionData[i - 1];
      const curr = completionData[i];
      
      if (prev.project_id !== curr.project_id) {
        const timeDiff = new Date(curr.completed_at).getTime() - new Date(prev.completed_at).getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        // If completed within same day, it's a context switch
        if (hoursDiff < 8) {
          const complexityDiff = Math.abs(curr.complexity - prev.complexity);
          const penalty = (complexityDiff / 10) + (1 / hoursDiff); // Higher penalty for quick switches and complexity differences
          totalPenalty += penalty;
          measurements++;
        }
      }
    }
    
    return measurements > 0 ? Math.min(10, totalPenalty / measurements) : 5;
  }

  /**
   * Calculate optimal complexity mix from historical performance
   */
  private calculateOptimalComplexityMix(completionData: any[]): any {
    const complexityPerformance = new Map<string, { count: number, avgQuality: number }>();
    
    for (const completion of completionData) {
      const complexity = completion.complexity <= 3 ? 'simple' : 
                       completion.complexity <= 6 ? 'medium' : 'complex';
      
      if (!complexityPerformance.has(complexity)) {
        complexityPerformance.set(complexity, { count: 0, avgQuality: 0 });
      }
      
      const current = complexityPerformance.get(complexity)!;
      current.count++;
      current.avgQuality = (current.avgQuality * (current.count - 1) + completion.quality_score) / current.count;
    }
    
    // Weight by performance quality
    const totalWeightedCount = Array.from(complexityPerformance.values())
      .reduce((sum, perf) => sum + (perf.count * perf.avgQuality), 0);
    
    const simpleWeighted = (complexityPerformance.get('simple')?.count || 0) * 
                          (complexityPerformance.get('simple')?.avgQuality || 1);
    const mediumWeighted = (complexityPerformance.get('medium')?.count || 0) * 
                          (complexityPerformance.get('medium')?.avgQuality || 1);
    const complexWeighted = (complexityPerformance.get('complex')?.count || 0) * 
                           (complexityPerformance.get('complex')?.avgQuality || 1);
    
    return {
      simple_tasks_percentage: totalWeightedCount > 0 ? simpleWeighted / totalWeightedCount : 0.4,
      medium_tasks_percentage: totalWeightedCount > 0 ? mediumWeighted / totalWeightedCount : 0.4,
      complex_tasks_percentage: totalWeightedCount > 0 ? complexWeighted / totalWeightedCount : 0.2
    };
  }

  /**
   * Calculate task velocity (tasks completed per week)
   */
  private calculateTaskVelocity(completionData: any[]): number {
    if (completionData.length === 0) return 0;
    
    const firstCompletion = new Date(completionData[0].completed_at);
    const lastCompletion = new Date(completionData[completionData.length - 1].completed_at);
    const weeksDiff = (lastCompletion.getTime() - firstCompletion.getTime()) / (1000 * 60 * 60 * 24 * 7);
    
    return weeksDiff > 0 ? completionData.length / weeksDiff : 0;
  }

  // Helper methods (stubs - would be implemented with actual database/API calls)
  
  private extractRepoPath(url: string): string {
    // Extract owner/repo from GitHub URL
    const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
    return match ? match[1] : '';
  }

  private async findTaskByReference(reference: string): Promise<{ id: string } | null> {
    // Implementation would query database
    return null;
  }

  private async saveGitCommitData(taskId: string, commitData: GitCommitData): Promise<void> {
    // Implementation would save to database
  }

  private async findTaskByExternalId(platform: string, externalId: string): Promise<string | null> {
    // Implementation would query database
    return null;
  }

  private async recordTaskCompletion(taskId: string, data: any): Promise<void> {
    // Implementation would record completion data
  }

  private async recordHelpRequest(taskId: string, data: any): Promise<void> {
    // Implementation would record help request
  }

  private extractQualityFromJira(issue: any): number {
    // Extract quality indicators from JIRA issue
    return 8; // Default
  }

  private calculateComplexityFromJira(issue: any): number {
    // Calculate actual complexity from JIRA issue
    return 5; // Default
  }

  private isHelpRequest(text: string): boolean {
    const helpKeywords = ['help', 'stuck', 'blocked', 'question', 'how to', 'need assistance'];
    return helpKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private classifyHelpRequest(text: string): 'technical' | 'clarification' | 'approval' | 'resource' {
    if (text.toLowerCase().includes('approve') || text.toLowerCase().includes('review')) return 'approval';
    if (text.toLowerCase().includes('clarif') || text.toLowerCase().includes('understand')) return 'clarification';
    if (text.toLowerCase().includes('access') || text.toLowerCase().includes('permission')) return 'resource';
    return 'technical';
  }

  private extractTokenFromWebhook(webhookUrl: string): string {
    // Extract token from webhook URL
    return '';
  }

  private async extractTaskReferencesFromText(text: string): Promise<string[]> {
    // Extract task references from message text
    return [];
  }

  private async analyzeSentiment(text: string): Promise<number> {
    // Analyze sentiment of text (-1 to 1)
    return 0;
  }

  private async storeCommunicationThread(taskId: string, thread: CommunicationThread): Promise<void> {
    // Store communication thread data
  }

  private async getAllResources(): Promise<ResourceProfile[]> {
    // Get all resources from database
    return [];
  }

  private async getResourceCompletionData(resourceId: string): Promise<any[]> {
    // Get task completion data for resource
    return [];
  }

  private async updateResourcePatterns(resourceId: string, patterns: any): Promise<void> {
    // Update resource patterns in database
  }

  private async updateResourceMetrics(): Promise<void> {
    // Update calculated metrics for all resources
  }

  private async collectFromAsana(integration: TaskManagementIntegration): Promise<void> {
    // Implement Asana integration
  }

  private async collectFromGitHubIssues(integration: TaskManagementIntegration): Promise<void> {
    // Implement GitHub Issues integration
  }

  private async collectFromLinear(integration: TaskManagementIntegration): Promise<void> {
    // Implement Linear integration
  }

  private async collectFromTeams(platform: CommunicationPlatform): Promise<void> {
    // Implement Microsoft Teams integration
  }
}
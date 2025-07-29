
import { RealTimeEventService } from './RealTimeEventService';
import { EventBus } from './EventBus';

export class RealTimeDataSync {
  private static instance: RealTimeDataSync;
  private realTimeService: RealTimeEventService;
  private eventBus: EventBus;
  private syncInterval: NodeJS.Timeout | null = null;

  public static getInstance(): RealTimeDataSync {
    if (!RealTimeDataSync.instance) {
      RealTimeDataSync.instance = new RealTimeDataSync();
    }
    return RealTimeDataSync.instance;
  }

  private constructor() {
    this.realTimeService = RealTimeEventService.getInstance();
    this.eventBus = EventBus.getInstance();
    this.initialize();
  }

  private initialize() {
    // Monitor localStorage changes for projects and resources
    this.setupStorageListeners();
    
    // Start periodic sync
    this.startPeriodicSync();
    
    // Listen for context updates
    this.setupContextListeners();
    
    console.log('[Real-time Data Sync] Initialized');
  }

  private setupStorageListeners() {
    // Listen for storage events (works across tabs)
    window.addEventListener('storage', (event) => {
      if (event.key === 'projects' && event.newValue) {
        this.handleProjectsUpdate(JSON.parse(event.newValue));
      } else if (event.key === 'resources' && event.newValue) {
        this.handleResourcesUpdate(JSON.parse(event.newValue));
      }
    });
  }

  private setupContextListeners() {
    // Listen for specific project events
    this.eventBus.subscribe('task_completed', (event) => {
      this.syncProjectData();
    });

    this.eventBus.subscribe('task_updated', (event) => {
      this.syncProjectData();
    });

    this.eventBus.subscribe('resource_assigned', (event) => {
      this.syncResourceData();
    });

    this.eventBus.subscribe('resource_availability_changed', (event) => {
      this.syncResourceData();
    });
  }

  private lastSyncTimestamp: number = 0;
  private syncThrottle: number = 5000; // Minimum 5 seconds between syncs

  private startPeriodicSync() {
    // Intelligent sync - only sync when there are changes
    this.syncInterval = setInterval(() => {
      const now = Date.now();
      if (now - this.lastSyncTimestamp > this.syncThrottle) {
        this.performIntelligentSync();
        this.lastSyncTimestamp = now;
      }
    }, 3000); // Check every 3 seconds but throttle actual syncing
  }

  private performIntelligentSync() {
    // Check for actual changes before syncing
    const hasProjectChanges = this.hasStorageChanges('projects');
    const hasResourceChanges = this.hasStorageChanges('resources');
    
    if (hasProjectChanges || hasResourceChanges) {
      console.log('[Real-time Data Sync] Changes detected, performing sync');
      this.performFullSync();
    }
  }

  private storageHashes: Map<string, string> = new Map();

  private hasStorageChanges(key: string): boolean {
    try {
      const data = localStorage.getItem(key);
      if (!data) return false;
      
      const hash = this.generateHash(data);
      const lastHash = this.storageHashes.get(key);
      
      if (lastHash !== hash) {
        this.storageHashes.set(key, hash);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`[Real-time Data Sync] Error checking changes for ${key}:`, error);
      return false;
    }
  }

  private generateHash(data: string): string {
    // Simple hash function for change detection
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private handleProjectsUpdate(projects: any[]) {
    // Check for completed tasks
    projects.forEach(project => {
      project.tasks?.forEach((task: any) => {
        if (task.status === 'Completed' && this.shouldNotifyTaskCompletion(task)) {
          this.realTimeService.emitTaskCompleted(
            task.id,
            task.name,
            project.id,
            project.name,
            task.assignedTo || 'unknown',
            'Unknown Resource'
          );
        }
      });

      // Check for approaching deadlines
      this.checkDeadlines(project);
    });

    // Emit individual project updates instead of batch
    projects.forEach(project => {
      if (project && project.id) {
        this.eventBus.emit('project_updated', {
          projectId: project.id,
          projectName: project.name,
          project,
          timestamp: new Date()
        }, 'storage_sync');
      }
    });
  }

  private handleResourcesUpdate(resources: any[]) {
    // Check for resource status changes
    resources.forEach(resource => {
      if (this.shouldNotifyResourceChange(resource)) {
        this.eventBus.emit('resource_availability_changed', {
          resourceId: resource.id,
          resourceName: resource.name,
          status: resource.status,
          utilization: resource.utilization
        }, 'storage_sync');
      }
    });
  }

  private checkDeadlines(project: any) {
    const today = new Date();
    
    // Check task deadlines
    project.tasks?.forEach((task: any) => {
      if (task.status !== 'Completed' && task.endDate) {
        const deadline = new Date(task.endDate);
        const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining <= 7 && daysRemaining >= 0) {
          this.realTimeService.emitDeadlineApproaching(
            task.id,
            task.name,
            project.id,
            project.name,
            daysRemaining
          );
        }
      }
    });

    // Check milestone deadlines
    project.milestones?.forEach((milestone: any) => {
      if (milestone.status !== 'completed' && milestone.date) {
        const deadline = new Date(milestone.date);
        const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining <= 7 && daysRemaining >= 0) {
          this.eventBus.emit('deadline_approaching', {
            taskId: milestone.id,
            taskName: milestone.name,
            projectId: project.id,
            projectName: project.name,
            daysRemaining,
            type: 'milestone'
          }, 'deadline_monitor');
        }
      }
    });
  }

  private shouldNotifyTaskCompletion(task: any): boolean {
    // Only notify if task was recently completed (within last 5 minutes)
    if (!task.completedAt) return false;
    
    const completedTime = new Date(task.completedAt);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    return completedTime > fiveMinutesAgo;
  }

  private shouldNotifyResourceChange(resource: any): boolean {
    // Only notify if resource status changed recently
    if (!resource.lastStatusChange) return false;
    
    const changeTime = new Date(resource.lastStatusChange);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    return changeTime > fiveMinutesAgo;
  }

  private syncProjectData() {
    const projects = localStorage.getItem('projects');
    if (projects) {
      try {
        this.handleProjectsUpdate(JSON.parse(projects));
      } catch (error) {
        console.error('[Real-time Data Sync] Error syncing project data:', error);
      }
    }
  }

  private syncResourceData() {
    const resources = localStorage.getItem('resources');
    if (resources) {
      try {
        this.handleResourcesUpdate(JSON.parse(resources));
      } catch (error) {
        console.error('[Real-time Data Sync] Error syncing resource data:', error);
      }
    }
  }

  private performFullSync() {
    this.syncProjectData();
    this.syncResourceData();
  }

  public destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    window.removeEventListener('storage', this.setupStorageListeners);
  }
}

// Initialize the sync service
export const initializeRealTimeDataSync = () => {
  const service = RealTimeDataSync.getInstance();
  console.log('[Real-time Data Sync] Service initialized');
  return service;
};

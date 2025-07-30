
import { supabase } from '@/integrations/supabase/client';
import { EventBus } from './EventBus';
import { toast } from 'sonner';
import { connectionManager } from '@/utils/connectionUtils';
import { errorBoundaryService } from './ErrorBoundaryService';

export class RealTimeDataSync {
  private static instance: RealTimeDataSync;
  private eventBus: EventBus;
  private isInitialized = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = true;
  private syncFrequency = 30000; // 30 seconds

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.setupConnectionListener();
  }

  static getInstance(): RealTimeDataSync {
    if (!RealTimeDataSync.instance) {
      RealTimeDataSync.instance = new RealTimeDataSync();
    }
    return RealTimeDataSync.instance;
  }

  private setupConnectionListener() {
    connectionManager.addConnectionListener((isOnline) => {
      this.isOnline = isOnline;
      if (isOnline) {
        console.log('[Real-time Sync] Connection restored, resuming sync');
        this.startPeriodicSync();
        toast.success('Connection restored');
      } else {
        console.log('[Real-time Sync] Connection lost, pausing sync');
        this.stopPeriodicSync();
        toast.warning('Connection lost. Working offline...');
      }
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('[Real-time Sync] Initializing...');
      
      // Wait for connection if offline
      if (!this.isOnline) {
        await connectionManager.waitForConnection();
      }

      this.startPeriodicSync();
      this.isInitialized = true;
      
      console.log('[Real-time Sync] Initialized successfully');
    } catch (error) {
      errorBoundaryService.handleError(error as Error, {
        component: 'RealTimeDataSync',
        action: 'initialize'
      });
    }
  }

  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      if (!this.isOnline) return;
      
      try {
        await this.performSync();
      } catch (error) {
        console.error('[Real-time Sync] Sync error:', error);
        // Don't spam users with sync errors, just log them
        errorBoundaryService.handleError(error as Error, {
          component: 'RealTimeDataSync',
          action: 'periodic_sync'
        });
      }
    }, this.syncFrequency);
  }

  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async performSync(): Promise<void> {
    try {
      // Get current user to determine workspace
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's workspaces
      const { data: workspaces, error: workspaceError } = await supabase
        .from('workspaces')
        .select(`
          *,
          workspace_members!inner(id, user_id, role, status, joined_at)
        `)
        .eq('workspace_members.user_id', user.id)
        .eq('workspace_members.status', 'active');

      if (workspaceError) {
        throw workspaceError;
      }

      if (workspaces && workspaces.length > 0) {
        // Sync data for each workspace
        for (const workspace of workspaces) {
          await this.syncWorkspaceData(workspace.id);
        }
      }

    } catch (error) {
      console.error('[Real-time Sync] Sync failed:', error);
      throw error;
    }
  }

  private async syncWorkspaceData(workspaceId: string): Promise<void> {
    try {
      // Sync projects for this workspace
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          milestones(id, name, description, due_date, baseline_date, status, progress, task_ids),
          stakeholders(id, name, email, role, organization, influence_level, contact_info, escalation_level)
        `)
        .eq('workspace_id', workspaceId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (projectsError) {
        throw projectsError;
      }

      if (projects && projects.length > 0) {
        this.handleProjectsUpdate(projects);
      }

      // Sync resources for this workspace
      const { data: resources, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (resourcesError) {
        throw resourcesError;
      }

      if (resources && resources.length > 0) {
        this.handleResourcesUpdate(resources);
      }

    } catch (error) {
      console.error(`[Real-time Sync] Failed to sync workspace ${workspaceId}:`, error);
      throw error;
    }
  }

  private handleProjectsUpdate(projects: any[]) {
    // Check for deadline alerts
    projects.forEach(project => {
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
    this.eventBus.emit('resources_updated', {
      resources,
      timestamp: new Date()
    }, 'storage_sync');
  }

  private checkDeadlines(project: any): void {
    if (!project.end_date) return;

    const endDate = new Date(project.end_date);
    const today = new Date();
    const daysUntilDeadline = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Alert for projects nearing deadline (7 days or less)
    if (daysUntilDeadline <= 7 && daysUntilDeadline > 0) {
      this.eventBus.emit('deadline_approaching', {
        projectId: project.id,
        projectName: project.name,
        daysRemaining: daysUntilDeadline,
        endDate: project.end_date
      }, 'deadline_check');
    }

    // Alert for overdue projects
    if (daysUntilDeadline < 0) {
      this.eventBus.emit('deadline_overdue', {
        projectId: project.id,
        projectName: project.name,
        daysOverdue: Math.abs(daysUntilDeadline),
        endDate: project.end_date
      }, 'deadline_check');
    }
  }

  public destroy(): void {
    this.stopPeriodicSync();
    this.isInitialized = false;
    console.log('[Real-time Sync] Destroyed');
  }

  public async forceSync(): Promise<void> {
    if (!this.isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    try {
      toast.loading('Syncing data...', { id: 'force-sync' });
      await this.performSync();
      toast.success('Data synced successfully', { id: 'force-sync' });
    } catch (error) {
      toast.error('Failed to sync data', { id: 'force-sync' });
      errorBoundaryService.handleError(error as Error, {
        component: 'RealTimeDataSync',
        action: 'force_sync'
      });
    }
  }

  public setSyncFrequency(frequency: number): void {
    this.syncFrequency = Math.max(5000, frequency); // Minimum 5 seconds
    if (this.syncInterval) {
      this.startPeriodicSync(); // Restart with new frequency
    }
  }

  public getConnectionStatus(): boolean {
    return this.isOnline;
  }
}

// Initialize the service
export const initializeRealTimeDataSync = async (): Promise<RealTimeDataSync> => {
  const syncService = RealTimeDataSync.getInstance();
  await syncService.initialize();
  return syncService;
};

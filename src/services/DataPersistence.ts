
import { EventBus } from './EventBus';

export interface DataChangeEvent {
  key: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  source: string;
}

export class DataPersistenceService {
  private static instance: DataPersistenceService;
  private eventBus: EventBus;
  private watchedKeys: Set<string> = new Set();
  private dataVersion = '1.0.0';

  public static getInstance(): DataPersistenceService {
    if (!DataPersistenceService.instance) {
      DataPersistenceService.instance = new DataPersistenceService();
    }
    return DataPersistenceService.instance;
  }

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.initializeDataWatching();
    this.handleDataMigrations();
  }

  private initializeDataWatching() {
    // Watch key data structures
    this.watchedKeys.add('projects');
    this.watchedKeys.add('resources');
    this.watchedKeys.add('stakeholders');
    this.watchedKeys.add('workspaces');
    this.watchedKeys.add('performance-profiles');
    this.watchedKeys.add('email-reminders');
    this.watchedKeys.add('notifications');

    // Set up storage event listener for cross-tab synchronization
    window.addEventListener('storage', (event) => {
      if (event.key && this.watchedKeys.has(event.key)) {
        this.handleStorageChange(event);
      }
    });

    console.log('[Data Persistence] Initialized with watched keys:', Array.from(this.watchedKeys));
  }

  private handleStorageChange(event: StorageEvent) {
    if (!event.key || !event.newValue) return;

    try {
      const oldValue = event.oldValue ? JSON.parse(event.oldValue) : null;
      const newValue = JSON.parse(event.newValue);

      const changeEvent: DataChangeEvent = {
        key: event.key,
        oldValue,
        newValue,
        timestamp: new Date(),
        source: 'storage_sync'
      };

      // Emit data sync event
      this.eventBus.emit('data_sync', changeEvent, 'data_persistence', false); // Don't propagate to avoid loops

      console.log(`[Data Persistence] Storage changed for ${event.key}`);
    } catch (error) {
      console.error('[Data Persistence] Error handling storage change:', error);
    }
  }

  public persistData(key: string, data: any, source: string = 'unknown'): void {
    try {
      const oldValue = this.getData(key);
      const serializedData = JSON.stringify(data);
      
      localStorage.setItem(key, serializedData);
      
      const changeEvent: DataChangeEvent = {
        key,
        oldValue,
        newValue: data,
        timestamp: new Date(),
        source
      };

      // Emit context updated event
      this.eventBus.emit('context_updated', {
        dataType: key,
        data,
        changeEvent
      }, source);

      console.log(`[Data Persistence] Persisted ${key} from ${source}`);
    } catch (error) {
      console.error(`[Data Persistence] Error persisting ${key}:`, error);
    }
  }

  public getData<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`[Data Persistence] Error retrieving ${key}:`, error);
      return null;
    }
  }

  public watchKey(key: string): void {
    if (!this.watchedKeys.has(key)) {
      this.watchedKeys.add(key);
      console.log(`[Data Persistence] Now watching ${key}`);
    }
  }

  public unwatchKey(key: string): void {
    this.watchedKeys.delete(key);
    console.log(`[Data Persistence] Stopped watching ${key}`);
  }

  private handleDataMigrations(): void {
    const currentVersion = localStorage.getItem('data-version');
    
    if (!currentVersion || currentVersion !== this.dataVersion) {
      console.log('[Data Persistence] Running data migrations...');
      
      // Migrate old data structures if needed
      this.migrateProjectData();
      this.migrateResourceData();
      this.migrateStakeholderData();
      
      localStorage.setItem('data-version', this.dataVersion);
      console.log('[Data Persistence] Data migration completed');
    }
  }

  private migrateProjectData(): void {
    const projects = this.getData('projects');
    if (projects && Array.isArray(projects)) {
      let migrated = false;
      
      projects.forEach((project: any) => {
        // Ensure all projects have required fields
        if (!project.createdAt) {
          project.createdAt = new Date().toISOString();
          migrated = true;
        }
        if (!project.updatedAt) {
          project.updatedAt = new Date().toISOString();
          migrated = true;
        }
        if (!project.status) {
          project.status = 'Planning';
          migrated = true;
        }
        
        // Migrate tasks
        if (project.tasks) {
          project.tasks.forEach((task: any) => {
            if (!task.createdAt) {
              task.createdAt = new Date().toISOString();
              migrated = true;
            }
            if (!task.updatedAt) {
              task.updatedAt = project.updatedAt;
              migrated = true;
            }
          });
        }
      });
      
      if (migrated) {
        this.persistData('projects', projects, 'migration');
      }
    }
  }

  private migrateResourceData(): void {
    const resources = this.getData('resources');
    if (resources && Array.isArray(resources)) {
      let migrated = false;
      
      resources.forEach((resource: any) => {
        if (!resource.createdAt) {
          resource.createdAt = new Date().toISOString();
          migrated = true;
        }
        if (!resource.lastActive) {
          resource.lastActive = new Date().toISOString();
          migrated = true;
        }
      });
      
      if (migrated) {
        this.persistData('resources', resources, 'migration');
      }
    }
  }

  private migrateStakeholderData(): void {
    const stakeholders = this.getData('stakeholders');
    if (stakeholders && Array.isArray(stakeholders)) {
      let migrated = false;
      
      stakeholders.forEach((stakeholder: any) => {
        if (!stakeholder.createdAt) {
          stakeholder.createdAt = new Date().toISOString();
          migrated = true;
        }
        if (!stakeholder.updatedAt) {
          stakeholder.updatedAt = new Date().toISOString();
          migrated = true;
        }
      });
      
      if (migrated) {
        this.persistData('stakeholders', stakeholders, 'migration');
      }
    }
  }

  public getStorageStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    this.watchedKeys.forEach(key => {
      const data = localStorage.getItem(key);
      stats[key] = data ? data.length : 0;
    });
    
    return stats;
  }

  public clearAllData(): void {
    this.watchedKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('data-version');
    console.log('[Data Persistence] All data cleared');
  }
}

export const dataPersistence = DataPersistenceService.getInstance();

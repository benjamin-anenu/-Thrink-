
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

      // Emit data sync event with proper error handling
      try {
        this.eventBus.emit('data_sync', changeEvent, 'data_persistence');
        console.log(`[Data Persistence] Storage changed for ${event.key}`);
      } catch (eventError) {
        console.error('[Data Persistence] Error emitting data sync event:', eventError);
      }
    } catch (error) {
      console.error('[Data Persistence] Error handling storage change:', error);
    }
  }

  public persistData(key: string, data: any, source: string = 'unknown'): void {
    try {
      // Validate data before persisting
      if (data === undefined || data === null) {
        console.warn(`[Data Persistence] Attempting to persist null/undefined data for key: ${key}`);
        return;
      }

      const oldValue = this.getData(key);
      let serializedData: string;
      
      try {
        serializedData = JSON.stringify(data);
      } catch (serializationError) {
        console.error(`[Data Persistence] Failed to serialize data for ${key}:`, serializationError);
        return;
      }
      
      localStorage.setItem(key, serializedData);
      
      const changeEvent: DataChangeEvent = {
        key,
        oldValue,
        newValue: data,
        timestamp: new Date(),
        source
      };

      // Emit context updated event with error handling
      try {
        this.eventBus.emit('context_updated', {
          dataType: key,
          data,
          changeEvent
        }, source);
      } catch (eventError) {
        console.error(`[Data Persistence] Error emitting context updated event for ${key}:`, eventError);
      }

      console.log(`[Data Persistence] Persisted ${key} from ${source}`);
    } catch (error) {
      console.error(`[Data Persistence] Error persisting ${key}:`, error);
    }
  }

  public getData<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      try {
        return JSON.parse(data);
      } catch (parseError) {
        console.error(`[Data Persistence] Error parsing data for ${key}:`, parseError);
        // Clear corrupted data
        localStorage.removeItem(key);
        return null;
      }
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
    try {
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
    } catch (error) {
      console.error('[Data Persistence] Error in data migrations:', error);
    }
  }

  private migrateProjectData(): void {
    try {
      const projects = this.getData('projects');
      if (projects && Array.isArray(projects)) {
        let migrated = false;
        
        projects.forEach((project: any) => {
          if (!project) return; // Skip null/undefined projects
          
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
          if (project.tasks && Array.isArray(project.tasks)) {
            project.tasks.forEach((task: any) => {
              if (!task) return; // Skip null/undefined tasks
              
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
    } catch (error) {
      console.error('[Data Persistence] Error in project migration:', error);
    }
  }

  private migrateResourceData(): void {
    try {
      const resources = this.getData('resources');
      if (resources && Array.isArray(resources)) {
        let migrated = false;
        
        resources.forEach((resource: any) => {
          if (!resource) return; // Skip null/undefined resources
          
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
    } catch (error) {
      console.error('[Data Persistence] Error in resource migration:', error);
    }
  }

  private migrateStakeholderData(): void {
    try {
      const stakeholders = this.getData('stakeholders');
      if (stakeholders && Array.isArray(stakeholders)) {
        let migrated = false;
        
        stakeholders.forEach((stakeholder: any) => {
          if (!stakeholder) return; // Skip null/undefined stakeholders
          
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
    } catch (error) {
      console.error('[Data Persistence] Error in stakeholder migration:', error);
    }
  }

  public getStorageStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    this.watchedKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        stats[key] = data ? data.length : 0;
      } catch (error) {
        console.error(`[Data Persistence] Error getting stats for ${key}:`, error);
        stats[key] = -1; // Indicate error
      }
    });
    
    return stats;
  }

  public clearAllData(): void {
    try {
      this.watchedKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      localStorage.removeItem('data-version');
      console.log('[Data Persistence] All data cleared');
    } catch (error) {
      console.error('[Data Persistence] Error clearing data:', error);
    }
  }

  public validateStorageIntegrity(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    this.watchedKeys.forEach(key => {
      try {
        const data = this.getData(key);
        if (data !== null) {
          // Try to re-serialize to check for integrity
          JSON.stringify(data);
        }
      } catch (error) {
        errors.push(`Invalid data for key ${key}: ${error}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Methods required by resource management module
  public async loadResources() {
    return this.getData('resources') || [];
  }

  public async loadResourceProfiles() {
    return this.getData('performance-profiles') || [];
  }

  public async updateResource(resourceId: string, data: any) {
    const resources: any[] = this.getData('resources') || [];
    const updatedResources = resources.map((r: any) => 
      r.id === resourceId ? { ...r, ...data } : r
    );
    this.persistData('resources', updatedResources, 'resource_update');
    return data;
  }

  public async addResource(data: any) {
    const resources: any[] = this.getData('resources') || [];
    resources.push(data);
    this.persistData('resources', resources, 'resource_add');
    return data;
  }

  public async updateResourceProfile(resourceId: string, data: any) {
    const profiles: any[] = this.getData('performance-profiles') || [];
    const updatedProfiles = profiles.map((p: any) => 
      p.resource_id === resourceId ? { ...p, ...data } : p
    );
    this.persistData('performance-profiles', updatedProfiles, 'profile_update');
    return data;
  }

  public async addResourceProfile(data: any) {
    const profiles: any[] = this.getData('performance-profiles') || [];
    profiles.push(data);
    this.persistData('performance-profiles', profiles, 'profile_add');
    return data;
  }

  // Added saveData method for backwards compatibility
  public saveData(key: string, data: any): void {
    this.persistData(key, data, 'saveData');
  }
}

export const dataPersistence = DataPersistenceService.getInstance();

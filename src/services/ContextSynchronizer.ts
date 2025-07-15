
import { EventBus } from './EventBus';
import { dataPersistence } from './DataPersistence';

export class ContextSynchronizer {
  private static instance: ContextSynchronizer;
  private eventBus: EventBus;
  private contextCallbacks: Map<string, ((data: any) => void)[]> = new Map();
  private isInitialized = false;

  public static getInstance(): ContextSynchronizer {
    if (!ContextSynchronizer.instance) {
      ContextSynchronizer.instance = new ContextSynchronizer();
    }
    return ContextSynchronizer.instance;
  }

  private constructor() {
    this.eventBus = EventBus.getInstance();
  }

  public initialize(): void {
    if (this.isInitialized) {
      console.log('[Context Synchronizer] Already initialized');
      return;
    }

    this.setupEventListeners();
    this.isInitialized = true;
    console.log('[Context Synchronizer] Initialized with enhanced error handling');
  }

  private setupEventListeners() {
    // Listen for context updates with error handling
    this.eventBus.subscribe('context_updated', (event) => {
      try {
        this.handleContextUpdate(event.payload);
      } catch (error) {
        console.error('[Context Synchronizer] Error handling context update:', error);
      }
    });

    // Listen for data sync events from storage
    this.eventBus.subscribe('data_sync', (event) => {
      try {
        this.handleDataSync(event.payload);
      } catch (error) {
        console.error('[Context Synchronizer] Error handling data sync:', error);
      }
    });

    // Listen for task completion to sync project context
    this.eventBus.subscribe('task_completed', (event) => {
      try {
        this.syncProjectContext(event.payload);
      } catch (error) {
        console.error('[Context Synchronizer] Error syncing project context:', error);
      }
    });

    // Listen for resource assignments to sync resource context
    this.eventBus.subscribe('resource_assigned', (event) => {
      try {
        this.syncResourceContext(event.payload);
      } catch (error) {
        console.error('[Context Synchronizer] Error syncing resource context:', error);
      }
    });

    // Listen for project updates to sync stakeholder context
    this.eventBus.subscribe('project_updated', (event) => {
      try {
        this.syncStakeholderContext(event.payload);
      } catch (error) {
        console.error('[Context Synchronizer] Error syncing stakeholder context:', error);
      }
    });

    // Listen for stakeholder updates to sync project context
    this.eventBus.subscribe('stakeholder_updated', (event) => {
      try {
        this.syncStakeholderToProject(event.payload);
      } catch (error) {
        console.error('[Context Synchronizer] Error syncing stakeholder to project:', error);
      }
    });

    // Listen for resource updates to sync project context
    this.eventBus.subscribe('resource_updated', (event) => {
      try {
        this.syncResourceToProject(event.payload);
      } catch (error) {
        console.error('[Context Synchronizer] Error syncing resource to project:', error);
      }
    });
  }

  public registerContext(contextName: string, updateCallback: (data: any) => void): () => void {
    if (!this.contextCallbacks.has(contextName)) {
      this.contextCallbacks.set(contextName, []);
    }

    this.contextCallbacks.get(contextName)!.push(updateCallback);

    console.log(`[Context Synchronizer] Registered ${contextName} context`);

    // Return unregister function
    return () => {
      const callbacks = this.contextCallbacks.get(contextName);
      if (callbacks) {
        const index = callbacks.indexOf(updateCallback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  private handleContextUpdate(payload: any) {
    if (!payload) {
      console.warn('[Context Synchronizer] Context update with empty payload');
      return;
    }

    const { dataType, data } = payload;
    
    if (!dataType) {
      console.warn('[Context Synchronizer] Context update without dataType');
      return;
    }
    
    // Notify relevant contexts
    const callbacks = this.contextCallbacks.get(dataType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[Context Synchronizer] Error updating ${dataType} context:`, error);
        }
      });
    }

    // Trigger related context updates
    this.triggerRelatedUpdates(dataType, data);
  }

  private handleDataSync(changeEvent: any) {
    if (!changeEvent || !changeEvent.key) {
      console.warn('[Context Synchronizer] Data sync with invalid changeEvent');
      return;
    }

    const { key, newValue } = changeEvent;
    
    // Validate newValue
    if (newValue === undefined || newValue === null) {
      console.warn(`[Context Synchronizer] Data sync for ${key} with null/undefined value`);
      return;
    }
    
    // Update contexts with new data from storage
    const callbacks = this.contextCallbacks.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(newValue);
        } catch (error) {
          console.error(`[Context Synchronizer] Error syncing ${key} context:`, error);
        }
      });
    }
  }

  private triggerRelatedUpdates(dataType: string, data: any) {
    if (!data) return;

    // Cross-context dependency updates with validation
    try {
      switch (dataType) {
        case 'projects':
          // When projects change, update related resources and stakeholders
          if (Array.isArray(data)) {
            this.updateResourceAssignments(data);
            this.updateStakeholderProjects(data);
          }
          break;
          
        case 'resources':
          // When resources change, update project assignments
          if (Array.isArray(data)) {
            this.updateProjectResources(data);
          }
          break;
          
        case 'stakeholders':
          // When stakeholders change, update project stakeholders
          if (Array.isArray(data)) {
            this.updateProjectStakeholders(data);
          }
          break;

        case 'workspaces':
          // When workspaces change, update member contexts
          if (Array.isArray(data)) {
            this.updateWorkspaceMemberContexts(data);
          }
          break;
      }
    } catch (error) {
      console.error(`[Context Synchronizer] Error in triggerRelatedUpdates for ${dataType}:`, error);
    }
  }

  private syncProjectContext(payload: any) {
    if (!payload || !payload.projectId || !payload.taskId) {
      console.warn('[Context Synchronizer] syncProjectContext with invalid payload');
      return;
    }

    const { projectId, taskId } = payload;
    
    // Update project with task completion
    const projects = dataPersistence.getData<any[]>('projects');
    if (!projects || !Array.isArray(projects)) return;
    
    const projectIndex = projects.findIndex((p: any) => p && p.id === projectId);
    
    if (projectIndex !== -1) {
      const project = projects[projectIndex];
      if (!project.tasks || !Array.isArray(project.tasks)) return;

      const taskIndex = project.tasks.findIndex((t: any) => t && t.id === taskId);
      
      if (taskIndex !== -1) {
        project.tasks[taskIndex].status = 'Completed';
        project.tasks[taskIndex].completedAt = new Date().toISOString();
        project.updatedAt = new Date().toISOString();
        
        // Update project progress
        const completedTasks = project.tasks.filter((t: any) => t && t.status === 'Completed').length;
        const totalTasks = project.tasks.length;
        project.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        dataPersistence.persistData('projects', projects, 'task_completion');
      }
    }
  }

  private syncResourceContext(payload: any) {
    if (!payload || !payload.resourceId || !payload.projectId) {
      console.warn('[Context Synchronizer] syncResourceContext with invalid payload');
      return;
    }

    const { resourceId, projectId, taskName } = payload;
    
    // Update resource with new assignment
    const resources = dataPersistence.getData<any[]>('resources');
    if (!resources || !Array.isArray(resources)) return;
    
    const resourceIndex = resources.findIndex((r: any) => r && r.id === resourceId);
    
    if (resourceIndex !== -1) {
      const resource = resources[resourceIndex];
      
      // Add project to resource if not already assigned
      if (!resource.projects) resource.projects = [];
      if (!resource.projects.includes(projectId)) {
        resource.projects.push(projectId);
      }
      
      // Update last active time
      resource.lastActive = new Date().toISOString();
      resource.updatedAt = new Date().toISOString();
      
      dataPersistence.persistData('resources', resources, 'resource_assignment');
    }
  }

  private syncStakeholderContext(payload: any) {
    if (!payload || !payload.projectId) {
      console.warn('[Context Synchronizer] syncStakeholderContext with invalid payload');
      return;
    }

    const { projectId, projectName } = payload;
    
    // Update stakeholders associated with the project
    const stakeholders = dataPersistence.getData<any[]>('stakeholders');
    if (!stakeholders || !Array.isArray(stakeholders)) return;
    
    let updated = false;
    
    stakeholders.forEach((stakeholder: any) => {
      if (stakeholder && stakeholder.projects && Array.isArray(stakeholder.projects) && stakeholder.projects.includes(projectId)) {
        stakeholder.lastContact = new Date().toISOString().split('T')[0];
        stakeholder.updatedAt = new Date().toISOString();
        updated = true;
      }
    });
    
    if (updated) {
      dataPersistence.persistData('stakeholders', stakeholders, 'project_update');
    }
  }

  private syncStakeholderToProject(payload: any) {
    if (!payload || !payload.stakeholderId || !payload.updates) {
      console.warn('[Context Synchronizer] syncStakeholderToProject with invalid payload');
      return;
    }

    const { stakeholderId, updates } = payload;
    
    // If stakeholder projects changed, update project stakeholders
    if (updates.projects && Array.isArray(updates.projects)) {
      const projects = dataPersistence.getData<any[]>('projects');
      if (!projects || !Array.isArray(projects)) return;
      
      let updated = false;
      
      projects.forEach((project: any) => {
        if (!project) return;

        const shouldInclude = updates.projects.includes(project.id);
        const currentlyIncluded = project.stakeholders?.includes(stakeholderId) || false;
        
        if (shouldInclude && !currentlyIncluded) {
          if (!project.stakeholders) project.stakeholders = [];
          project.stakeholders.push(stakeholderId);
          project.updatedAt = new Date().toISOString();
          updated = true;
        } else if (!shouldInclude && currentlyIncluded) {
          project.stakeholders = project.stakeholders.filter((id: string) => id !== stakeholderId);
          project.updatedAt = new Date().toISOString();
          updated = true;
        }
      });
      
      if (updated) {
        dataPersistence.persistData('projects', projects, 'stakeholder_sync');
      }
    }
  }

  private syncResourceToProject(payload: any) {
    if (!payload || !payload.resourceId || !payload.updates) {
      console.warn('[Context Synchronizer] syncResourceToProject with invalid payload');
      return;
    }

    const { resourceId, updates } = payload;
    
    // If resource projects changed, update project resources
    if (updates.projects && Array.isArray(updates.projects)) {
      const projects = dataPersistence.getData<any[]>('projects');
      if (!projects || !Array.isArray(projects)) return;
      
      let updated = false;
      
      projects.forEach((project: any) => {
        if (!project) return;

        const shouldInclude = updates.projects.includes(project.id);
        const currentlyIncluded = project.resources?.includes(resourceId) || false;
        
        if (shouldInclude && !currentlyIncluded) {
          if (!project.resources) project.resources = [];
          project.resources.push(resourceId);
          project.updatedAt = new Date().toISOString();
          updated = true;
        } else if (!shouldInclude && currentlyIncluded) {
          project.resources = project.resources.filter((id: string) => id !== resourceId);
          project.updatedAt = new Date().toISOString();
          updated = true;
        }
      });
      
      if (updated) {
        dataPersistence.persistData('projects', projects, 'resource_sync');
      }
    }
  }

  private updateResourceAssignments(projects: any[]) {
    const resources = dataPersistence.getData<any[]>('resources');
    if (!resources || !Array.isArray(resources)) return;
    
    let updated = false;
    
    // Update resource project assignments based on project data
    resources.forEach((resource: any) => {
      const assignedProjects = projects
        .filter(project => 
          project.tasks?.some((task: any) => task.assignedResources?.includes(resource.id)) ||
          project.resources?.includes(resource.id)
        )
        .map(project => project.id);
      
      if (JSON.stringify(resource.projects || []) !== JSON.stringify(assignedProjects)) {
        resource.projects = assignedProjects;
        resource.updatedAt = new Date().toISOString();
        updated = true;
      }
    });
    
    if (updated) {
      dataPersistence.persistData('resources', resources, 'project_sync');
    }
  }

  private updateStakeholderProjects(projects: any[]) {
    const stakeholders = dataPersistence.getData<any[]>('stakeholders');
    if (!stakeholders || !Array.isArray(stakeholders)) return;
    
    let updated = false;
    
    // Update stakeholder project assignments
    stakeholders.forEach((stakeholder: any) => {
      const relevantProjects = projects
        .filter(project => 
          project.stakeholders?.includes(stakeholder.id) ||
          project.tasks?.some((task: any) => task.assignedStakeholders?.includes(stakeholder.id))
        )
        .map(project => project.id);
      
      if (JSON.stringify(stakeholder.projects || []) !== JSON.stringify(relevantProjects)) {
        stakeholder.projects = relevantProjects;
        stakeholder.updatedAt = new Date().toISOString();
        updated = true;
      }
    });
    
    if (updated) {
      dataPersistence.persistData('stakeholders', stakeholders, 'project_sync');
    }
  }

  private updateProjectResources(resources: any[]) {
    const projects = dataPersistence.getData<any[]>('projects');
    if (!projects || !Array.isArray(projects)) return;
    
    let updated = false;
    
    // Update project resource assignments
    projects.forEach((project: any) => {
      const assignedResources = resources
        .filter(resource => resource.projects?.includes(project.id))
        .map(resource => resource.id);
      
      if (JSON.stringify(project.resources || []) !== JSON.stringify(assignedResources)) {
        project.resources = assignedResources;
        project.updatedAt = new Date().toISOString();
        updated = true;
      }
    });
    
    if (updated) {
      dataPersistence.persistData('projects', projects, 'resource_sync');
    }
  }

  private updateProjectStakeholders(stakeholders: any[]) {
    const projects = dataPersistence.getData<any[]>('projects');
    if (!projects || !Array.isArray(projects)) return;
    
    let updated = false;
    
    // Update project stakeholder assignments
    projects.forEach((project: any) => {
      const assignedStakeholders = stakeholders
        .filter(stakeholder => stakeholder.projects?.includes(project.id))
        .map(stakeholder => stakeholder.id);
      
      if (JSON.stringify(project.stakeholders || []) !== JSON.stringify(assignedStakeholders)) {
        project.stakeholders = assignedStakeholders;
        project.updatedAt = new Date().toISOString();
        updated = true;
      }
    });
    
    if (updated) {
      dataPersistence.persistData('projects', projects, 'stakeholder_sync');
    }
  }

  private updateWorkspaceMemberContexts(workspaces: any[]) {
    // Update resource and stakeholder contexts when workspace members change
    const resources = dataPersistence.getData<any[]>('resources');
    const stakeholders = dataPersistence.getData<any[]>('stakeholders');
    
    if (!resources || !stakeholders) return;
    
    let resourcesUpdated = false;
    let stakeholdersUpdated = false;
    
    workspaces.forEach((workspace: any) => {
      if (workspace.members) {
        workspace.members.forEach((member: any) => {
          // Update resource workspace assignment
          const resource = resources.find((r: any) => r.email === member.email);
          if (resource && !resource.workspaces?.includes(workspace.id)) {
            if (!resource.workspaces) resource.workspaces = [];
            resource.workspaces.push(workspace.id);
            resource.updatedAt = new Date().toISOString();
            resourcesUpdated = true;
          }
          
          // Update stakeholder workspace assignment  
          const stakeholder = stakeholders.find((s: any) => s.email === member.email);
          if (stakeholder && !stakeholder.workspaces?.includes(workspace.id)) {
            if (!stakeholder.workspaces) stakeholder.workspaces = [];
            stakeholder.workspaces.push(workspace.id);
            stakeholder.updatedAt = new Date().toISOString();
            stakeholdersUpdated = true;
          }
        });
      }
    });
    
    if (resourcesUpdated) {
      dataPersistence.persistData('resources', resources, 'workspace_sync');
    }
    
    if (stakeholdersUpdated) {
      dataPersistence.persistData('stakeholders', stakeholders, 'workspace_sync');
    }
  }

  public getSyncStats(): Record<string, number> {
    return {
      registeredContexts: this.contextCallbacks.size,
      totalCallbacks: Array.from(this.contextCallbacks.values()).reduce((total, callbacks) => total + callbacks.length, 0),
      initialized: this.isInitialized ? 1 : 0
    };
  }

  public shutdown(): void {
    this.contextCallbacks.clear();
    this.isInitialized = false;
    console.log('[Context Synchronizer] Shutdown completed');
  }
}

export const contextSynchronizer = ContextSynchronizer.getInstance();

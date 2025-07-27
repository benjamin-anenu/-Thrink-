// Disabled version of ProjectRebaselineService due to missing database tables

export interface RebaselineRequest {
  id?: string;
  taskId: string;
  projectId: string;
  reason: string;
  newStartDate: string;
  newEndDate: string;
  affectedTasks?: string[];
  rebaselineType?: string;
  cascadeMethod?: string;
}

export class ProjectRebaselineService {
  private static instance: ProjectRebaselineService;

  public static getInstance(): ProjectRebaselineService {
    if (!ProjectRebaselineService.instance) {
      ProjectRebaselineService.instance = new ProjectRebaselineService();
    }
    return ProjectRebaselineService.instance;
  }

  private constructor() {
    console.warn('ProjectRebaselineService: Disabled due to missing database tables');
  }

  async requestRebaseline(taskId: string, reason: string, newStartDate: string, newEndDate: string): Promise<boolean> {
    console.warn('ProjectRebaselineService: requestRebaseline disabled');
    return false;
  }

  async getRebaselineHistory(projectId: string): Promise<any[]> {
    console.warn('ProjectRebaselineService: getRebaselineHistory disabled');
    return [];
  }

  async approveRebaseline(rebaselineId: string): Promise<boolean> {
    console.warn('ProjectRebaselineService: approveRebaseline disabled');
    return false;
  }

  static rebaselineTask(request: RebaselineRequest): Promise<{ success: boolean; totalTasksUpdated: number; errors: string[] }> {
    console.warn('ProjectRebaselineService: rebaselineTask disabled');
    return Promise.resolve({ success: false, totalTasksUpdated: 0, errors: ['Service disabled'] });
  }
}

export const projectRebaselineService = ProjectRebaselineService.getInstance();
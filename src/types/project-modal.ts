
export interface ProjectDetailsModalData {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  team: Array<{ id: string; name: string; role: string; avatar?: string }>;
  milestones: Array<{ id: string; name: string; date: string; completed: boolean }>;
  risks: Array<{ id: string; description: string; impact: 'Low' | 'Medium' | 'High'; probability: 'Low' | 'Medium' | 'High' }>;
  health: {
    overall: 'green' | 'yellow' | 'red';
    schedule: 'green' | 'yellow' | 'red';
    budget: 'green' | 'yellow' | 'red';
    scope: 'green' | 'yellow' | 'red';
    quality: 'green' | 'yellow' | 'red';
  };
}

export interface DatabaseProject {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  progress: number | null;
  start_date: string | null;
  end_date: string | null;
  budget: string | null;
  health_status: string | null;
  health_score: number | null;
  team_size: number | null;
  workspace_id: string;
}

// Safe string operations with fallbacks
const safeToUpperCase = (value: string | null | undefined): string => {
  if (!value || typeof value !== 'string') return 'GREEN';
  return value.toUpperCase();
};

const safeHealthStatus = (value: string | null | undefined): 'green' | 'yellow' | 'red' => {
  if (!value || typeof value !== 'string') return 'green';
  const normalized = value.toLowerCase();
  if (['green', 'yellow', 'red'].includes(normalized)) {
    return normalized as 'green' | 'yellow' | 'red';
  }
  return 'green';
};

const safeStatus = (value: string | null | undefined): 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled' => {
  if (!value || typeof value !== 'string') return 'Planning';
  const validStatuses = ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];
  return validStatuses.includes(value) ? value as any : 'Planning';
};

const safePriority = (value: string | null | undefined): 'Low' | 'Medium' | 'High' | 'Critical' => {
  if (!value || typeof value !== 'string') return 'Medium';
  const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
  return validPriorities.includes(value) ? value as any : 'Medium';
};

export function transformProjectForModal(
  project: DatabaseProject,
  tasks: any[] = [],
  teamMembers: any[] = [],
  milestones: any[] = [],
  risks: any[] = []
): ProjectDetailsModalData {
  try {
    // Safely parse budget string to number (remove currency symbols)
    const budgetStr = project.budget || '$0';
    const budget = parseFloat(budgetStr.replace(/[$,]/g, '')) || 0;
    
    // Calculate spent amount based on progress (placeholder logic)
    const progress = Math.max(0, Math.min(100, project.progress || 0));
    const spent = Math.round(budget * (progress / 100));

    // Safe date handling
    const defaultDate = new Date().toISOString().split('T')[0];
    const startDate = project.start_date || defaultDate;
    const endDate = project.end_date || defaultDate;

    // Safe array transformations
    const safeTeamMembers = Array.isArray(teamMembers) ? teamMembers : [];
    const safeMilestonesArray = Array.isArray(milestones) ? milestones : [];
    const safeRisksArray = Array.isArray(risks) ? risks : [];

    return {
      id: project.id,
      name: project.name || 'Unnamed Project',
      description: project.description || '',
      status: safeStatus(project.status),
      priority: safePriority(project.priority),
      progress,
      startDate,
      endDate,
      budget,
      spent,
      team: safeTeamMembers.map(member => ({
        id: member?.id || '',
        name: member?.name || 'Unknown',
        role: member?.role || 'Team Member',
        avatar: undefined
      })),
      milestones: safeMilestonesArray.map(milestone => ({
        id: milestone?.id || '',
        name: milestone?.name || 'Unnamed Milestone',
        date: milestone?.due_date || milestone?.date || defaultDate,
        completed: milestone?.status === 'completed'
      })),
      risks: safeRisksArray.map(risk => ({
        id: risk?.id || '',
        description: risk?.description || 'Unknown Risk',
        impact: safePriority(risk?.impact) as 'Low' | 'Medium' | 'High',
        probability: safePriority(risk?.probability) as 'Low' | 'Medium' | 'High'
      })),
      health: {
        overall: safeHealthStatus(project.health_status),
        schedule: safeHealthStatus(project.health_status),
        budget: safeHealthStatus(project.health_status),
        scope: safeHealthStatus(project.health_status),
        quality: safeHealthStatus(project.health_status)
      }
    };
  } catch (error) {
    console.error('Error transforming project data:', error);
    // Return a safe fallback object
    return {
      id: project.id || '',
      name: project.name || 'Unnamed Project',
      description: '',
      status: 'Planning',
      priority: 'Medium',
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      budget: 0,
      spent: 0,
      team: [],
      milestones: [],
      risks: [],
      health: {
        overall: 'green',
        schedule: 'green',
        budget: 'green',
        scope: 'green',
        quality: 'green'
      }
    };
  }
}

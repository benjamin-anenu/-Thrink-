
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
  health?: {
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
  workspaceId: string;
}

export function transformProjectForModal(
  project: DatabaseProject,
  tasks: any[] = [],
  teamMembers: any[] = [],
  milestones: any[] = [],
  risks: any[] = []
): ProjectDetailsModalData {
  // Parse budget string to number (remove currency symbols)
  const budgetStr = project.budget || '$0';
  const budget = parseFloat(budgetStr.replace(/[$,]/g, '')) || 0;
  
  // Calculate spent amount based on progress (placeholder logic)
  const spent = Math.round(budget * ((project.progress || 0) / 100));

  return {
    id: project.id,
    name: project.name,
    description: project.description || '',
    status: (project.status as any) || 'Planning',
    priority: (project.priority as any) || 'Medium',
    progress: project.progress || 0,
    startDate: project.start_date || new Date().toISOString().split('T')[0],
    endDate: project.end_date || new Date().toISOString().split('T')[0],
    budget,
    spent,
    team: teamMembers.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role,
      avatar: undefined
    })),
    milestones: milestones.map(milestone => ({
      id: milestone.id,
      name: milestone.name,
      date: milestone.due_date || milestone.date,
      completed: milestone.status === 'completed'
    })),
    risks: risks.map(risk => ({
      id: risk.id,
      description: risk.description,
      impact: risk.impact || 'Medium',
      probability: risk.probability || 'Medium'
    })),
    health: {
      overall: (project.health_status as any) || 'green',
      schedule: (project.health_status as any) || 'green',
      budget: (project.health_status as any) || 'green',
      scope: (project.health_status as any) || 'green',
      quality: (project.health_status as any) || 'green'
    }
  };
}

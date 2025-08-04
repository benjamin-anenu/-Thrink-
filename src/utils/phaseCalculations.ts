import { ProjectPhase, ProjectMilestone, ProjectTask, ProjectHealth, PhaseStatus, Priority } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';

export type HealthStatus = 'on-track' | 'caution' | 'at-risk' | 'critical';

// Convert health status to numeric score for aggregation
export const getHealthScore = (status: HealthStatus): number => {
  switch (status) {
    case 'on-track': return 95;
    case 'caution': return 70;
    case 'at-risk': return 40;
    case 'critical': return 20;
    default: return 50;
  }
};

// Convert numeric score back to health status
export const scoreToHealth = (score: number): HealthStatus => {
  if (score >= 85) return 'on-track';
  if (score >= 65) return 'caution';
  if (score >= 35) return 'at-risk';
  return 'critical';
};

// Calculate phase dates from task data
export const calculatePhaseDates = async (phaseId: string): Promise<{ startDate: string | null, endDate: string | null }> => {
  try {
    // Get all tasks from milestones in this phase
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('task_ids')
      .eq('phase_id', phaseId);

    if (milestonesError || !milestones?.length) {
      return { startDate: null, endDate: null };
    }

    // Collect all task IDs
    const allTaskIds = milestones.flatMap(m => m.task_ids || []);
    
    if (!allTaskIds.length) {
      return { startDate: null, endDate: null };
    }

    // Get all tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('project_tasks')
      .select('start_date, end_date')
      .in('id', allTaskIds);

    if (tasksError || !tasks?.length) {
      return { startDate: null, endDate: null };
    }

    // Find earliest start date and latest end date
    const startDates = tasks
      .map(task => task.start_date)
      .filter(date => date != null)
      .sort();

    const endDates = tasks
      .map(task => task.end_date)
      .filter(date => date != null)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return {
      startDate: startDates[0] || null,
      endDate: endDates[0] || null
    };
  } catch (error) {
    console.error('Error calculating phase dates:', error);
    return { startDate: null, endDate: null };
  }
};

// Level 1: Task Health (base level)
export const calculateTaskHealth = (task: ProjectTask): HealthStatus => {
  const today = new Date();
  const endDate = task.endDate ? new Date(task.endDate) : null;
  const progress = task.progress || 0;
  
  // Already completed tasks are always on-track
  if (task.status === 'Completed' || progress >= 100) {
    return 'on-track';
  }
  
  // Critical: Overdue and incomplete (heavily penalized)
  if (endDate && endDate < today && progress < 100) {
    return 'critical';
  }
  
  // At-risk: Due soon with low progress
  if (endDate) {
    const daysUntilDue = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 3 && progress < 80) return 'at-risk';
    if (daysUntilDue <= 7 && progress < 50) return 'at-risk';
  }
  
  // Caution: Behind expected progress
  if (progress < 25) return 'caution';
  
  return 'on-track';
};

// Level 2: Milestone Health (aggregated from tasks)
export const calculateMilestoneHealth = async (milestone: ProjectMilestone): Promise<HealthStatus> => {
  if (!milestone.tasks?.length) return 'on-track';
  
  try {
    // Get actual task data
    const { data: tasks, error } = await supabase
      .from('project_tasks')
      .select('*')
      .in('id', milestone.tasks);

    if (error || !tasks?.length) return 'on-track';

    const taskHealths = tasks.map(task => calculateTaskHealth({
      id: task.id,
      name: task.name,
      description: task.description || '',
      startDate: task.start_date || '',
      endDate: task.end_date || '',
      baselineStartDate: task.baseline_start_date || '',
      baselineEndDate: task.baseline_end_date || '',
      progress: task.progress || 0,
      assignedResources: task.assigned_resources || [],
      assignedStakeholders: task.assigned_stakeholders || [],
      dependencies: task.dependencies || [],
      priority: (task.priority as ProjectTask['priority']) || 'Medium',
      status: (task.status as ProjectTask['status']) || 'Not Started',
      milestoneId: task.milestone_id,
      duration: task.duration || 1,
      parentTaskId: task.parent_task_id,
      hierarchyLevel: task.hierarchy_level || 0,
      sortOrder: task.sort_order || 0,
      manualOverrideDates: task.manual_override_dates || false
    }));
    
    // Critical if any task is critical
    if (taskHealths.includes('critical')) return 'critical';
    
    // At-risk if >30% of tasks are at-risk or critical
    const riskCount = taskHealths.filter(h => h === 'at-risk' || h === 'critical').length;
    if (riskCount / taskHealths.length > 0.3) return 'at-risk';
    
    // Caution if >50% of tasks are caution or worse
    const cautionCount = taskHealths.filter(h => h !== 'on-track').length;
    if (cautionCount / taskHealths.length > 0.5) return 'caution';
    
    return 'on-track';
  } catch (error) {
    console.error('Error calculating milestone health:', error);
    return 'caution';
  }
};

// Level 3: Phase Health (aggregated from milestones)
export const calculatePhaseHealth = async (phase: ProjectPhase): Promise<HealthStatus> => {
  if (!phase.milestones?.length) return 'on-track';
  
  try {
    const milestoneHealths = await Promise.all(
      phase.milestones.map(milestone => calculateMilestoneHealth(milestone))
    );
    
    // Critical if any milestone is critical
    if (milestoneHealths.includes('critical')) return 'critical';
    
    // At-risk if >20% of milestones are at-risk or critical (more sensitive)
    const riskCount = milestoneHealths.filter(h => h === 'at-risk' || h === 'critical').length;
    if (riskCount / milestoneHealths.length > 0.20) return 'at-risk';
    
    // Caution if >30% of milestones are caution or worse (more sensitive)
    const cautionCount = milestoneHealths.filter(h => h !== 'on-track').length;
    if (cautionCount / milestoneHealths.length > 0.30) return 'caution';
    
    return 'on-track';
  } catch (error) {
    console.error('Error calculating phase health:', error);
    return 'caution';
  }
};

// Level 4: Project Health (aggregated from phases)
export const calculateProjectHealth = async (projectId: string): Promise<ProjectHealth> => {
  try {
    // Get project phases
    const { data: phases, error: phasesError } = await supabase
      .from('phases')
      .select(`
        *,
        milestones (
          id,
          name,
          description,
          due_date,
          baseline_date,
          status,
          progress,
          task_ids
        )
      `)
      .eq('project_id', projectId);

    if (phasesError || !phases?.length) {
      // Fallback to milestone-based calculation for projects without phases
      return calculateProjectHealthFromMilestones(projectId);
    }

    const mappedPhases: ProjectPhase[] = phases.map(phase => ({
      id: phase.id,
      projectId: phase.project_id,
      name: phase.name,
      description: phase.description,
      startDate: phase.start_date,
      endDate: phase.end_date,
      baselineStartDate: phase.baseline_start_date,
      baselineEndDate: phase.baseline_end_date,
      status: (phase.status as PhaseStatus) || 'planned',
      priority: (phase.priority as Priority) || 'Medium',
      progress: phase.progress || 0,
      sortOrder: phase.sort_order || 0,
      color: phase.color,
      milestones: (phase.milestones || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        description: m.description || '',
        date: m.due_date || '',
        baselineDate: m.baseline_date || '',
        status: (m.status as ProjectMilestone['status']) || 'upcoming',
        tasks: m.task_ids || [],
        progress: m.progress || 0
      }))
    }));

    const phaseHealths = await Promise.all(
      mappedPhases.map(phase => calculatePhaseHealth(phase))
    );
    
    // Calculate weighted health score with heavy penalty for overdue tasks
    const healthScores = phaseHealths.map(health => getHealthScore(health));
    const avgScore = healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
    
    // Additional penalty for critical phases (overdue tasks)
    const criticalPenalty = phaseHealths.filter(h => h === 'critical').length * 15;
    const atRiskPenalty = phaseHealths.filter(h => h === 'at-risk').length * 8;
    
    const finalScore = Math.max(10, Math.round(avgScore - criticalPenalty - atRiskPenalty));
    
    // Determine status based on final score
    if (finalScore >= 85) return { status: 'green', score: finalScore };
    if (finalScore >= 65) return { status: 'yellow', score: finalScore };
    return { status: 'red', score: finalScore };
  } catch (error) {
    console.error('Error calculating project health:', error);
    return { status: 'yellow', score: 50 };
  }
};

// Fallback health calculation from milestones
const calculateProjectHealthFromMilestones = async (projectId: string): Promise<ProjectHealth> => {
  try {
    const { data: milestones, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId);

    if (error || !milestones?.length) {
      return { status: 'yellow', score: 50 };
    }

    const milestoneHealths = await Promise.all(
      milestones.map(m => calculateMilestoneHealth({
        id: m.id,
        name: m.name,
        description: m.description || '',
        date: m.due_date || '',
        baselineDate: m.baseline_date || '',
        status: (m.status as ProjectMilestone['status']) || 'upcoming',
        tasks: m.task_ids || [],
        progress: m.progress || 0
      }))
    );

    const avgScore = milestoneHealths.reduce((sum, health) => sum + getHealthScore(health), 0) / milestoneHealths.length;
    const overallHealth = scoreToHealth(avgScore);

    return {
      status: overallHealth === 'on-track' ? 'green' : overallHealth === 'caution' ? 'yellow' : 'red',
      score: avgScore
    };
  } catch (error) {
    console.error('Error calculating fallback project health:', error);
    return { status: 'yellow', score: 50 };
  }
};

// Auto-update phase dates when tasks change
export const updatePhaseDates = async (phaseId: string): Promise<void> => {
  try {
    const { startDate, endDate } = await calculatePhaseDates(phaseId);
    
    await supabase
      .from('phases')
      .update({ 
        start_date: startDate, 
        end_date: endDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', phaseId);
  } catch (error) {
    console.error('Error updating phase dates:', error);
  }
};
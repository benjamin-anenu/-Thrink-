import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProjectPhase, ProjectMilestone, PhaseStatus, Priority } from '@/types/project';
import { calculatePhaseHealth, calculatePhaseDates, updatePhaseDates, HealthStatus } from '@/utils/phaseCalculations';

export interface CreatePhaseData {
  projectId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: PhaseStatus;
  priority?: Priority;
  color?: string;
}

export interface CreateMilestoneData {
  name: string;
  description?: string;
  date: string;
  phaseId?: string;
}

export function usePhaseManagement(projectId?: string) {
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map database phase to ProjectPhase interface
  const mapDatabasePhaseToProjectPhase = (dbPhase: any): ProjectPhase => ({
    id: dbPhase.id,
    projectId: dbPhase.project_id,
    name: dbPhase.name,
    description: dbPhase.description,
    startDate: dbPhase.start_date,
    endDate: dbPhase.end_date,
    baselineStartDate: dbPhase.baseline_start_date,
    baselineEndDate: dbPhase.baseline_end_date,
    status: dbPhase.status as PhaseStatus,
    priority: dbPhase.priority as Priority,
    progress: dbPhase.progress || 0,
    sortOrder: dbPhase.sort_order || 0,
    color: dbPhase.color,
    createdAt: dbPhase.created_at,
    updatedAt: dbPhase.updated_at,
    createdBy: dbPhase.created_by,
    milestones: []
  });

  // Map ProjectPhase to database format
  const mapProjectPhaseToDatabase = (phase: Partial<ProjectPhase>) => ({
    project_id: phase.projectId,
    name: phase.name,
    description: phase.description,
    start_date: phase.startDate,
    end_date: phase.endDate,
    baseline_start_date: phase.baselineStartDate,
    baseline_end_date: phase.baselineEndDate,
    status: phase.status,
    priority: phase.priority,
    progress: phase.progress,
    sort_order: phase.sortOrder,
    color: phase.color,
    created_by: phase.createdBy
  });

  // Fetch phases for the project
  const fetchPhases = async () => {
    if (!projectId) {
      setPhases([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: phasesData, error: phasesError } = await supabase
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
            task_ids,
            phase_id,
            sort_order_in_phase
          )
        `)
        .eq('project_id', projectId)
        .order('sort_order');

      if (phasesError) throw phasesError;

      const mappedPhases = (phasesData || []).map(phase => {
        const mappedPhase = mapDatabasePhaseToProjectPhase(phase);
        
        // Map milestones
        mappedPhase.milestones = (phase.milestones || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          description: m.description || '',
          date: m.due_date || '',
          baselineDate: m.baseline_date || '',
          status: m.status || 'upcoming',
          tasks: m.task_ids || [],
          progress: m.progress || 0,
          phaseId: m.phase_id,
          sortOrderInPhase: m.sort_order_in_phase || 0
        })).sort((a: any, b: any) => (a.sortOrderInPhase || 0) - (b.sortOrderInPhase || 0));

        return mappedPhase;
      });

      setPhases(mappedPhases);
    } catch (err: any) {
      console.error('Error fetching phases:', err);
      setError(err.message);
      toast.error('Failed to load project phases');
    } finally {
      setLoading(false);
    }
  };

  // Create a new phase
  const createPhase = async (phaseData: CreatePhaseData): Promise<ProjectPhase | null> => {
    try {
      // Get the next sort order
      const maxSortOrder = phases.reduce((max, phase) => Math.max(max, phase.sortOrder), 0);
      
      const newPhase: Partial<ProjectPhase> = {
        ...phaseData,
        status: phaseData.status || 'planned',
        priority: phaseData.priority || 'Medium',
        progress: 0,
        sortOrder: maxSortOrder + 1,
        color: phaseData.color || '#3b82f6'
      };

      const { data, error } = await supabase
        .from('phases')
        .insert(mapProjectPhaseToDatabase(newPhase))
        .select()
        .single();

      if (error) throw error;

      const createdPhase = mapDatabasePhaseToProjectPhase(data);
      setPhases(prev => [...prev, createdPhase].sort((a, b) => a.sortOrder - b.sortOrder));
      
      toast.success('Phase created successfully');
      return createdPhase;
    } catch (err: any) {
      console.error('Error creating phase:', err);
      setError(err.message);
      toast.error('Failed to create phase');
      return null;
    }
  };

  // Update a phase
  const updatePhase = async (phaseId: string, updates: Partial<ProjectPhase>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('phases')
        .update({
          ...mapProjectPhaseToDatabase(updates),
          updated_at: new Date().toISOString()
        })
        .eq('id', phaseId);

      if (error) throw error;

      setPhases(prev => prev.map(phase => 
        phase.id === phaseId ? { ...phase, ...updates } : phase
      ));

      toast.success('Phase updated successfully');
    } catch (err: any) {
      console.error('Error updating phase:', err);
      setError(err.message);
      toast.error('Failed to update phase');
    }
  };

  // Delete a phase
  const deletePhase = async (phaseId: string): Promise<void> => {
    try {
      // First, check if phase has milestones
      const phase = phases.find(p => p.id === phaseId);
      if (phase?.milestones && phase.milestones.length > 0) {
        toast.error('Cannot delete phase with milestones. Please move or delete milestones first.');
        return;
      }

      const { error } = await supabase
        .from('phases')
        .delete()
        .eq('id', phaseId);

      if (error) throw error;

      setPhases(prev => prev.filter(phase => phase.id !== phaseId));
      toast.success('Phase deleted successfully');
    } catch (err: any) {
      console.error('Error deleting phase:', err);
      setError(err.message);
      toast.error('Failed to delete phase');
    }
  };

  // Reorder phases
  const reorderPhases = async (phaseIds: string[]): Promise<void> => {
    try {
      // Update each phase individually to avoid upsert type issues
      const updatePromises = phaseIds.map((phaseId, index) => 
        supabase
          .from('phases')
          .update({
            sort_order: index + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', phaseId)
      );

      const results = await Promise.all(updatePromises);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} phases`);
      }

      // Update local state
      const reorderedPhases = [...phases].sort((a, b) => {
        const aIndex = phaseIds.indexOf(a.id);
        const bIndex = phaseIds.indexOf(b.id);
        return aIndex - bIndex;
      }).map((phase, index) => ({
        ...phase,
        sortOrder: index + 1
      }));

      setPhases(reorderedPhases);
      toast.success('Phases reordered successfully');
    } catch (err: any) {
      console.error('Error reordering phases:', err);
      setError(err.message);
      toast.error('Failed to reorder phases');
    }
  };

  // Move milestone to a different phase
  const moveMilestoneToPhase = async (milestoneId: string, phaseId: string): Promise<void> => {
    try {
      // Get the next sort order in the target phase
      const targetPhase = phases.find(p => p.id === phaseId);
      const maxSortOrder = targetPhase?.milestones?.reduce((max, milestone) => 
        Math.max(max, milestone.sortOrderInPhase || 0), 0) || 0;

      const { error } = await supabase
        .from('milestones')
        .update({
          phase_id: phaseId,
          sort_order_in_phase: maxSortOrder + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (error) throw error;

      // Refresh phases to get updated milestone assignments
      await fetchPhases();
      toast.success('Milestone moved successfully');
    } catch (err: any) {
      console.error('Error moving milestone:', err);
      setError(err.message);
      toast.error('Failed to move milestone');
    }
  };

  // Calculate phase progress
  const calculatePhaseProgress = (phase: ProjectPhase): number => {
    if (!phase.milestones || phase.milestones.length === 0) return 0;
    
    const totalTasks = phase.milestones.reduce((sum, milestone) => 
      sum + (milestone.tasks?.length || 0), 0);
    
    if (totalTasks === 0) return 0;
    
    // For now, use milestone progress as proxy
    const avgMilestoneProgress = phase.milestones.reduce((sum, milestone) => 
      sum + milestone.progress, 0) / phase.milestones.length;
    
    return Math.round(avgMilestoneProgress);
  };

  // Get enhanced phase health using new calculation system
  const getPhaseHealth = async (phase: ProjectPhase) => {
    try {
      const healthStatus = await calculatePhaseHealth(phase);
      
      // Convert HealthStatus to ProjectHealth format
      switch (healthStatus) {
        case 'on-track':
          return { status: 'green' as const, score: 95 };
        case 'caution':
          return { status: 'yellow' as const, score: 70 };
        case 'at-risk':
          return { status: 'red' as const, score: 40 };
        case 'critical':
          return { status: 'red' as const, score: 20 };
        default:
          return { status: 'yellow' as const, score: 50 };
      }
    } catch (error) {
      console.error('Error calculating phase health:', error);
      // Fallback to basic calculation
      const today = new Date();
      const endDate = phase.endDate ? new Date(phase.endDate) : null;
      const progress = phase.progress || calculatePhaseProgress(phase);
      
      if (endDate && endDate < today && progress < 100) {
        return { status: 'red' as const, score: 30 };
      }
      
      if (progress >= 90) return { status: 'green' as const, score: 95 };
      if (progress >= 50) return { status: 'yellow' as const, score: 70 };
      return { status: 'red' as const, score: 40 };
    }
  };

  // Auto-update phase dates when tasks change
  const refreshPhaseDates = async (phaseId: string): Promise<void> => {
    try {
      await updatePhaseDates(phaseId);
      // Refresh the phases to get updated dates
      await fetchPhases();
    } catch (error) {
      console.error('Error refreshing phase dates:', error);
    }
  };

  // Get current active phase
  const getCurrentPhase = (): ProjectPhase | null => {
    return phases.find(phase => phase.status === 'active') || null;
  };

  // Load phases when projectId changes
  useEffect(() => {
    if (projectId) {
      fetchPhases();
    } else {
      setPhases([]);
    }
  }, [projectId]);

  return {
    phases,
    loading,
    error,
    createPhase,
    updatePhase,
    deletePhase,
    reorderPhases,
    moveMilestoneToPhase,
    calculatePhaseProgress,
    getPhaseHealth,
    getCurrentPhase,
    refreshPhases: fetchPhases,
    refreshPhaseDates
  };
}
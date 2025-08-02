
import React, { useState } from 'react';
import { usePhaseManagement } from '@/hooks/usePhaseManagement';
import { useEnhancedMilestones } from '@/hooks/useEnhancedMilestones';
import { ProjectPhase } from '@/types/project';
import { PhaseCard } from './PhaseCard';
import { PhaseCreateModal } from './PhaseCreateModal';
import { Button } from '@/components/ui/button';
import { Plus, Layers } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading-state';

interface PhaseViewProps {
  projectId: string;
}

// Define a separate interface for enhanced phases to avoid type conflicts
interface EnhancedPhase extends Omit<ProjectPhase, 'milestones'> {
  milestones: import('@/hooks/useEnhancedMilestones').EnhancedMilestone[];
}

export const PhaseView: React.FC<PhaseViewProps> = ({ projectId }) => {
  const {
    phases,
    loading: phasesLoading,
    error,
    createPhase,
    updatePhase,
    deletePhase,
    refreshPhases
  } = usePhaseManagement(projectId);

  const { milestones, loading: milestonesLoading } = useEnhancedMilestones(projectId);

  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<EnhancedPhase | null>(null);

  const handleToggleExpand = (phaseId: string) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phaseId)) {
        newSet.delete(phaseId);
      } else {
        newSet.add(phaseId);
      }
      return newSet;
    });
  };

  const handleCreatePhase = async (phaseData: any) => {
    await createPhase(phaseData);
  };

  const handleEditPhase = (phase: EnhancedPhase) => {
    setEditingPhase(phase);
    // TODO: Open edit modal
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (confirm('Are you sure you want to delete this phase?')) {
      await deletePhase(phaseId);
    }
  };

  const handleAddMilestone = (phaseId: string) => {
    // TODO: Open milestone creation modal
    console.log('Add milestone to phase:', phaseId);
  };

  if (phasesLoading || milestonesLoading) {
    return <LoadingState>Loading project phases...</LoadingState>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Error loading phases: {error}</p>
        <Button onClick={refreshPhases} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (phases.length === 0) {
    return (
      <div className="text-center py-12">
        <Layers className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Phases Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Break down your project into manageable phases to better organize milestones and track progress.
        </p>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create First Phase
        </Button>
      </div>
    );
  }

  // Convert phases to enhanced phases with proper typing
  const enhancedPhases: EnhancedPhase[] = phases.map(phase => ({
    ...phase,
    milestones: milestones.filter(m => m.phase_id === phase.id)
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Project Phases</h2>
          <p className="text-muted-foreground">
            Manage your project phases and milestones
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Phase
        </Button>
      </div>

      <div className="space-y-4">
        {enhancedPhases.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            isExpanded={expandedPhases.has(phase.id)}
            onToggleExpand={handleToggleExpand}
            onEdit={handleEditPhase}
            onDelete={handleDeletePhase}
            onAddMilestone={handleAddMilestone}
          />
        ))}
      </div>

      <PhaseCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePhase={handleCreatePhase}
        projectId={projectId}
      />
    </div>
  );
};

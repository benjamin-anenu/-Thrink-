import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/ui/loading-state';
import { toast } from 'sonner';

interface Milestone {
  id: string;
  name: string;
  description?: string;
  due_date?: string;
  status: string;
  phase_id?: string;
}

interface MilestoneAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  phaseId: string;
  projectId: string;
  onMilestonesAssigned: () => void;
}

export const MilestoneAssignmentModal: React.FC<MilestoneAssignmentModalProps> = ({
  isOpen,
  onClose,
  phaseId,
  projectId,
  onMilestonesAssigned
}) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestones, setSelectedMilestones] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUnassignedMilestones();
    }
  }, [isOpen, projectId]);

  const loadUnassignedMilestones = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId)
        .is('phase_id', null);

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error loading unassigned milestones:', error);
      toast.error('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneToggle = (milestoneId: string) => {
    setSelectedMilestones(prev => 
      prev.includes(milestoneId)
        ? prev.filter(id => id !== milestoneId)
        : [...prev, milestoneId]
    );
  };

  const handleAssignMilestones = async () => {
    if (selectedMilestones.length === 0) return;

    setAssigning(true);
    try {
      const { error } = await supabase
        .from('milestones')
        .update({ phase_id: phaseId })
        .in('id', selectedMilestones);

      if (error) throw error;

      toast.success(`${selectedMilestones.length} milestone(s) assigned to phase`);
      onMilestonesAssigned();
      handleClose();
    } catch (error) {
      console.error('Error assigning milestones:', error);
      toast.error('Failed to assign milestones');
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedMilestones([]);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Milestones to Phase</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <LoadingState>Loading unassigned milestones...</LoadingState>
          ) : milestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No unassigned milestones found for this project.
            </div>
          ) : (
            <>
              <div>
                <Label className="text-sm font-medium">
                  Select milestones to assign to this phase:
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Only unassigned milestones are shown.
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={milestone.id}
                      checked={selectedMilestones.includes(milestone.id)}
                      onCheckedChange={() => handleMilestoneToggle(milestone.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={milestone.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {milestone.name}
                        </label>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(milestone.status)}>
                            {milestone.status}
                          </Badge>
                          {milestone.due_date && (
                            <span className="text-xs text-muted-foreground">
                              Due: {new Date(milestone.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedMilestones.length > 0 && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm font-medium">
                    {selectedMilestones.length} milestone(s) selected
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignMilestones}
            disabled={assigning || selectedMilestones.length === 0}
          >
            {assigning ? 'Assigning...' : `Assign ${selectedMilestones.length} Milestone(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
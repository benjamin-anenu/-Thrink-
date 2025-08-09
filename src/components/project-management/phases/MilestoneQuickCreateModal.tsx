import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMilestones } from '@/hooks/useMilestones';
import type { Milestone } from '@/types/milestone';
import { supabase } from '@/integrations/supabase/client';

interface MilestoneQuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  phaseId: string;
  onMilestoneCreated?: () => void;
}

export const MilestoneQuickCreateModal: React.FC<MilestoneQuickCreateModalProps> = ({
  isOpen,
  onClose,
  projectId,
  phaseId,
  onMilestoneCreated
}) => {
  const { createMilestone } = useMilestones(projectId);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const payload: Omit<Milestone, 'id' | 'created_at' | 'updated_at'> = {
        project_id: projectId,
        name: name.trim(),
        description: '',
        date: '',
        baseline_date: '',
        status: 'upcoming'
      };

      const created = await createMilestone(payload);
      if (created?.id) {
        await supabase
          .from('milestones')
          .update({ phase_id: phaseId })
          .eq('id', created.id);
      }

      // reset and close
      setName('');
      onMilestoneCreated?.();
      onClose();
    } catch (err) {
      console.error('Quick milestone create failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create Milestone (Title only)</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="milestone-name">Milestone Title *</Label>
            <Input
              id="milestone-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Design Approval"
              required
            />
            <p className="text-xs text-muted-foreground mt-2">
              Dates are computed automatically from tasks. You can assign tasks after creating the milestone.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Creating...' : 'Create Milestone'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';

interface StakeholderFormProps {
  onClose: () => void;
  open?: boolean;
  onSave?: () => void;
  stakeholder?: any;
}

const StakeholderForm = ({ onClose, open, onSave, stakeholder }: StakeholderFormProps) => {
  const [formData, setFormData] = useState({
    name: stakeholder?.name || '',
    email: stakeholder?.email || '',
    role: stakeholder?.role || '',
    influence: stakeholder?.influence || 'medium' as 'low' | 'medium' | 'high' | 'critical',
    notes: stakeholder?.notes || '',
  });

  const { createStakeholder, updateStakeholder } = useStakeholders();
  const { currentWorkspace } = useWorkspace();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentWorkspace) {
      toast.error('No workspace selected');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (stakeholder?.id) {
        await updateStakeholder(stakeholder.id, formData);
      } else {
        await createStakeholder({
          ...formData,
          workspace_id: currentWorkspace.id,
        });
      }
      
      onSave?.();
      onClose();
    } catch (error) {
      console.error('Error saving stakeholder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open !== undefined ? open : true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{stakeholder ? 'Edit Stakeholder' : 'Add New Stakeholder'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="influence">Influence Level</Label>
              <Select 
                value={formData.influence} 
                onValueChange={(value) => setFormData({ ...formData, influence: value as 'low' | 'medium' | 'high' | 'critical' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select influence level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this stakeholder..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : stakeholder ? 'Update Stakeholder' : 'Add Stakeholder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StakeholderForm;

import React, { useState, useEffect } from 'react';
import { ProjectMilestone } from '@/types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface MilestoneManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateMilestone: (milestone: Omit<ProjectMilestone, 'id'>) => void;
  onUpdateMilestone: (milestoneId: string, updates: Partial<ProjectMilestone>) => void;
  editingMilestone: ProjectMilestone | null;
}

const MilestoneManagementDialog: React.FC<MilestoneManagementDialogProps> = ({
  open,
  onOpenChange,
  onCreateMilestone,
  onUpdateMilestone,
  editingMilestone
}) => {
  const [formData, setFormData] = useState<Partial<ProjectMilestone>>({
    name: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'upcoming',
    progress: 0
  });

  useEffect(() => {
    if (editingMilestone) {
      setFormData(editingMilestone);
    } else {
      setFormData({
        name: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        status: 'upcoming',
        progress: 0
      });
    }
  }, [editingMilestone]);

  const handleSubmit = () => {
    if (!formData.name || !formData.date) return;

    const milestoneData = {
      ...formData,
      baselineDate: formData.baselineDate || formData.date,
      tasks: formData.tasks || []
    } as Omit<ProjectMilestone, 'id'>;

    if (editingMilestone) {
      onUpdateMilestone(editingMilestone.id, milestoneData);
    } else {
      onCreateMilestone(milestoneData);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingMilestone ? 'Edit Milestone' : 'Create New Milestone'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="milestoneName">Milestone Name *</Label>
            <Input
              id="milestoneName"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter milestone name"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Milestone description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Due Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status || 'upcoming'} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  status: value as ProjectMilestone['status']
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="progress">Progress (%)</Label>
            <Input
              id="progress"
              type="number"
              min="0"
              max="100"
              value={formData.progress || 0}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                progress: parseInt(e.target.value) || 0 
              }))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editingMilestone ? 'Update Milestone' : 'Create Milestone'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MilestoneManagementDialog;
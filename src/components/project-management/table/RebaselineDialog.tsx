
import React, { useState } from 'react';
import { ProjectTask } from '@/types/project';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

interface RebaselineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ProjectTask;
  onRebaseline: (taskId: string, newStartDate: string, newEndDate: string, reason: string) => void;
}

const RebaselineDialog: React.FC<RebaselineDialogProps> = ({
  open,
  onOpenChange,
  task,
  onRebaseline
}) => {
  const [newStartDate, setNewStartDate] = useState(task.startDate);
  const [newEndDate, setNewEndDate] = useState(task.endDate);
  const [reason, setReason] = useState('');

  const calculateVariance = () => {
    if (!task.baselineStartDate || !task.baselineEndDate) return null;
    
    const startVariance = new Date(task.startDate).getTime() - new Date(task.baselineStartDate).getTime();
    const endVariance = new Date(task.endDate).getTime() - new Date(task.baselineEndDate).getTime();
    const startDays = Math.round(startVariance / (1000 * 60 * 60 * 24));
    const endDays = Math.round(endVariance / (1000 * 60 * 60 * 24));
    
    return { startDays, endDays };
  };

  const variance = calculateVariance();

  const handleRebaseline = () => {
    if (!reason.trim()) {
      return; // Don't proceed without reason
    }
    
    onRebaseline(task.id, newStartDate, newEndDate, reason);
    onOpenChange(false);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            Rebaseline Task
          </DialogTitle>
          <DialogDescription>
            Update the baseline dates for "{task.name}" to reflect the new schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Variance Display */}
          {variance && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800">Current Variance</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Start Date:</span>
                  <Badge variant={variance.startDays > 0 ? 'destructive' : 'secondary'} className="ml-2">
                    {variance.startDays > 0 ? '+' : ''}{variance.startDays} days
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">End Date:</span>
                  <Badge variant={variance.endDays > 0 ? 'destructive' : 'secondary'} className="ml-2">
                    {variance.endDays > 0 ? '+' : ''}{variance.endDays} days
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Baseline vs Current Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Baseline</Label>
              <div className="text-sm text-muted-foreground">
                <div>Start: {task.baselineStartDate || 'Not set'}</div>
                <div>End: {task.baselineEndDate || 'Not set'}</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Actual Dates</Label>
              <div className="text-sm">
                <div>Start: {task.startDate}</div>
                <div>End: {task.endDate}</div>
              </div>
            </div>
          </div>

          {/* New Baseline Dates */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">New Baseline Dates</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="newStartDate" className="text-xs text-muted-foreground">
                  New Start Date
                </Label>
                <Input
                  id="newStartDate"
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="newEndDate" className="text-xs text-muted-foreground">
                  New End Date
                </Label>
                <Input
                  id="newEndDate"
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason for Rebaseline <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Explain why the baseline needs to be updated (e.g., scope change, resource constraints, external dependencies...)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleRebaseline}
            disabled={!reason.trim()}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Update Baseline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RebaselineDialog;


import React from 'react';
import { ProjectTask, RebaselineRequest } from '@/types/project';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RebaselineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ProjectTask | null;
  rebaselineData: {
    newStartDate: string;
    newEndDate: string;
    reason: string;
  };
  onDataChange: (data: { newStartDate: string; newEndDate: string; reason: string }) => void;
  onRebaseline: () => void;
}

const RebaselineDialog: React.FC<RebaselineDialogProps> = ({
  open,
  onOpenChange,
  task,
  rebaselineData,
  onDataChange,
  onRebaseline
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rebaseline Task</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to rebaseline "{task?.name}". This will update the task's timeline and may affect dependent tasks.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newStartDate">New Start Date</Label>
              <Input
                id="newStartDate"
                type="date"
                value={rebaselineData.newStartDate}
                onChange={(e) => onDataChange({ ...rebaselineData, newStartDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="newEndDate">New End Date</Label>
              <Input
                id="newEndDate"
                type="date"
                value={rebaselineData.newEndDate}
                onChange={(e) => onDataChange({ ...rebaselineData, newEndDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="reason">Reason for Rebaseline</Label>
            <Textarea
              id="reason"
              value={rebaselineData.reason}
              onChange={(e) => onDataChange({ ...rebaselineData, reason: e.target.value })}
              placeholder="Explain why this task needs to be rebaselined..."
              required
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onRebaseline}>
            Rebaseline Task
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RebaselineDialog;

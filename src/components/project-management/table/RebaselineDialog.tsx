
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
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Zap } from 'lucide-react';
import { ProjectRebaselineService, RebaselineRequest } from '@/services/ProjectRebaselineService';
import { toast } from 'sonner';

interface RebaselineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ProjectTask;
  projectId?: string;
  onRebaseline: (taskId: string, newStartDate: string, newEndDate: string, reason: string) => void;
}

const RebaselineDialog: React.FC<RebaselineDialogProps> = ({
  open,
  onOpenChange,
  task,
  projectId,
  onRebaseline
}) => {
  const [newStartDate, setNewStartDate] = useState(task.startDate);
  const [newEndDate, setNewEndDate] = useState(task.endDate);
  const [reason, setReason] = useState('');
  const [useEnhancedMode, setUseEnhancedMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const calculateVariance = () => {
    if (!task.baselineStartDate || !task.baselineEndDate) return null;
    
    const baselineStart = new Date(task.baselineStartDate);
    const baselineEnd = new Date(task.baselineEndDate);
    const actualStart = new Date(task.startDate);
    const actualEnd = new Date(task.endDate);
    
    const startVariance = Math.ceil((actualStart.getTime() - baselineStart.getTime()) / (1000 * 60 * 60 * 24));
    const endVariance = Math.ceil((actualEnd.getTime() - baselineEnd.getTime()) / (1000 * 60 * 60 * 24));
    
    return { startVariance, endVariance };
  };

  const variance = calculateVariance();

  const handleRebaseline = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for the rebaseline');
      return;
    }
    setLoading(true);
    try {
      if (useEnhancedMode) {
        const request: RebaselineRequest = {
          projectId: projectId || 'default-project',
          taskId: task.id,
          newStartDate,
          newEndDate,
          reason,
          affectedTasks: [],
          rebaselineType: 'manual',
          cascadeMethod: 'preserve_dependencies'
        };
        const result = await ProjectRebaselineService.rebaselineTask(request);
        if (result.success) {
          toast.success(`Task "${task.name}" rebaselined successfully`, {
            description: `${result.totalTasksUpdated} tasks updated`
          });
          onRebaseline(task.id, newStartDate, newEndDate, reason);
        } else {
          toast.error('Rebaseline failed', {
            description: result.errors.join(', ')
          });
        }
      } else {
        onRebaseline(task.id, newStartDate, newEndDate, reason);
      }
      onOpenChange(false);
      setReason('');
    } catch (error) {
      console.error('Rebaseline error:', error);
      toast.error('Failed to rebaseline task');
    } finally {
      setLoading(false);
    }
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
        <div className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">Enhanced Rebaseline</span>
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">Beta</Badge>
          </div>
          <Switch 
            checked={useEnhancedMode} 
            onCheckedChange={setUseEnhancedMode}
          />
        </div>
        {useEnhancedMode && (
          <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg">
            <div className="text-sm text-slate-300">
              <strong>Enhanced Features Enabled:</strong>
              <ul className="mt-1 ml-4 list-disc text-slate-400">
                <li>Impact analysis on dependent tasks</li>
                <li>Automatic cascade updates</li>
                <li>Audit trail logging</li>
                <li>Comprehensive validation</li>
              </ul>
            </div>
          </div>
        )}
        {/* Current Variance Display */}
        {variance && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-slate-200">Current Variance</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Start Date:</span>
                <span className={`ml-2 font-medium ${variance.startVariance > 0 ? 'text-red-400' : variance.startVariance < 0 ? 'text-green-400' : 'text-slate-300'}`}>
                  {variance.startVariance > 0 ? '+' : ''}{variance.startVariance} days
                </span>
              </div>
              <div>
                <span className="text-slate-400">End Date:</span>
                <span className={`ml-2 font-medium ${variance.endVariance > 0 ? 'text-red-400' : variance.endVariance < 0 ? 'text-green-400' : 'text-slate-300'}`}>
                  {variance.endVariance > 0 ? '+' : ''}{variance.endVariance} days
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-4">
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
            disabled={!reason.trim() || loading}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                {useEnhancedMode ? 'Processing...' : 'Updating...'}
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                {useEnhancedMode ? 'Enhanced Rebaseline' : 'Update Baseline'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RebaselineDialog;

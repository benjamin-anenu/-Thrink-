
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, User, Clock } from 'lucide-react';
import { useResources } from '@/hooks/useResources';
import { useTasks } from '@/hooks/useTasks';
import { toast } from 'sonner';

interface TaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    id: string;
    name: string;
    assignee_id?: string;
    project_id: string;
  };
  onAssignResource: (taskId: string, resourceId: string) => Promise<boolean>;
}

const TaskAssignmentModal: React.FC<TaskAssignmentModalProps> = ({
  isOpen,
  onClose,
  task,
  onAssignResource
}) => {
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [showOverallocationWarning, setShowOverallocationWarning] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const { resources } = useResources();

  // Calculate resource utilization (mock calculation for now)
  const getResourceUtilization = (resourceId: string) => {
    // This would typically come from a proper calculation
    // For now, we'll simulate some resources being overallocated
    const mockUtilization = Math.floor(Math.random() * 120) + 60; // 60-180%
    return mockUtilization;
  };

  const handleResourceSelect = (resourceId: string) => {
    setSelectedResourceId(resourceId);
    const utilization = getResourceUtilization(resourceId);
    setShowOverallocationWarning(utilization > 100);
  };

  const handleAssign = async () => {
    if (!selectedResourceId) {
      toast.error('Please select a resource to assign');
      return;
    }

    setIsAssigning(true);
    try {
      const success = await onAssignResource(task.id, selectedResourceId);
      if (success) {
        toast.success('Resource assigned successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error assigning resource:', error);
      toast.error('Failed to assign resource');
    } finally {
      setIsAssigning(false);
    }
  };

  const selectedResource = resources.find(r => r.id === selectedResourceId);
  const currentAssignee = task.assignee_id ? resources.find(r => r.id === task.assignee_id) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Assign Resource to Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Task Details</h4>
            <div className="bg-muted p-3 rounded-lg">
              <p className="font-medium">{task.name}</p>
              {currentAssignee && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">
                    Currently assigned to: {currentAssignee.name}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Resource
            </label>
            <Select value={selectedResourceId} onValueChange={handleResourceSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a resource..." />
              </SelectTrigger>
              <SelectContent>
                {resources.map((resource) => {
                  const utilization = getResourceUtilization(resource.id);
                  return (
                    <SelectItem key={resource.id} value={resource.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{resource.name}</span>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant={utilization > 100 ? 'destructive' : 'secondary'}>
                            {utilization}%
                          </Badge>
                          {utilization > 100 && (
                            <AlertTriangle className="h-3 w-3 text-destructive" />
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {showOverallocationWarning && selectedResource && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                <div>
                  <h5 className="font-medium text-destructive">
                    Resource Overallocation Warning
                  </h5>
                  <p className="text-sm text-destructive/80 mt-1">
                    {selectedResource.name} is currently allocated at{' '}
                    {getResourceUtilization(selectedResourceId)}% capacity. 
                    Assigning this task may overload this resource.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedResource && (
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedResource.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedResource.role}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {getResourceUtilization(selectedResourceId)}% utilized
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isAssigning}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedResourceId || isAssigning}
              variant={showOverallocationWarning ? 'destructive' : 'default'}
            >
              {isAssigning ? 'Assigning...' : showOverallocationWarning ? 'Assign Anyway' : 'Assign Resource'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskAssignmentModal;

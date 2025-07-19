
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertTriangle, Clock, Users } from 'lucide-react';

interface SoftDeleteActionsProps {
  type: 'project' | 'resource';
  item: {
    id: string;
    name: string;
    status?: string;
    activeProjects?: number;
    ongoingTasks?: number;
  };
  onDelete: (id: string) => Promise<void>;
  isDeleting?: boolean;
}

const SoftDeleteActions: React.FC<SoftDeleteActionsProps> = ({
  type,
  item,
  onDelete,
  isDeleting = false
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const isProjectOngoing = type === 'project' && 
    (item.status === 'In Progress' || item.status === 'Active');
  
  const hasActiveAssignments = type === 'resource' && 
    (item.activeProjects && item.activeProjects > 0);

  const hasOngoingTasks = item.ongoingTasks && item.ongoingTasks > 0;

  const hasWarnings = isProjectOngoing || hasActiveAssignments || hasOngoingTasks;

  const handleDelete = async () => {
    if (hasWarnings && !confirmed) {
      setConfirmed(true);
      return;
    }

    try {
      await onDelete(item.id);
      setShowDialog(false);
      setConfirmed(false);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
    setConfirmed(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete {type === 'project' ? 'Project' : 'Resource'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{item.name}"? 
              {type === 'project' ? 
                ' This project will be moved to the recycle bin where you can restore it later.' :
                ' This resource will be moved to the recycle bin where you can restore it later.'
              }
            </DialogDescription>
          </DialogHeader>

          {hasWarnings && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <div className="space-y-2">
                  <p className="font-medium">Warning: This action may cause disruptions</p>
                  
                  {isProjectOngoing && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>This project is currently {item.status?.toLowerCase()}</span>
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Active
                      </Badge>
                    </div>
                  )}
                  
                  {hasActiveAssignments && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Resource is assigned to {item.activeProjects} active projects</span>
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        {item.activeProjects} Projects
                      </Badge>
                    </div>
                  )}
                  
                  {hasOngoingTasks && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{item.ongoingTasks} ongoing tasks will be affected</span>
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        {item.ongoingTasks} Tasks
                      </Badge>
                    </div>
                  )}
                  
                  {!confirmed && (
                    <p className="text-sm mt-2">
                      Please confirm you understand the implications by clicking "Confirm Delete" below.
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            
            {hasWarnings && !confirmed ? (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Confirm Delete
              </Button>
            ) : (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : `Delete ${type === 'project' ? 'Project' : 'Resource'}`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SoftDeleteActions;

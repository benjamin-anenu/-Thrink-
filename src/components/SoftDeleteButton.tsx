
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useSoftDelete } from '@/hooks/useSoftDelete';

interface SoftDeleteButtonProps {
  type: 'project' | 'resource' | 'stakeholder';
  itemId: string;
  itemName: string;
  onDeleted?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const SoftDeleteButton: React.FC<SoftDeleteButtonProps> = ({
  type,
  itemId,
  itemName,
  onDeleted,
  variant = 'destructive',
  size = 'sm',
  className = ''
}) => {
  const [confirmData, setConfirmData] = useState<any>(null);
  const { softDeleteProject, softDeleteResource, softDeleteStakeholder, loading } = useSoftDelete();

  const handleDelete = async () => {
    let result;
    
    switch (type) {
      case 'project':
        result = await softDeleteProject(itemId);
        break;
      case 'resource':
        result = await softDeleteResource(itemId);
        break;
      case 'stakeholder':
        result = await softDeleteStakeholder(itemId);
        break;
    }

    if (result.success) {
      setConfirmData(result);
    }
  };

  const confirmDelete = () => {
    setConfirmData(null);
    onDeleted?.();
  };

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant={variant} size={size} className={className} disabled={loading}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete {type.charAt(0).toUpperCase() + type.slice(1)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemName}"? This will move it to the recycle bin 
              where it can be restored within 48 hours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Move to Recycle Bin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation dialog for items with dependencies */}
      {confirmData && (
        <AlertDialog open={true} onOpenChange={() => setConfirmData(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Dependencies Found
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>The {type} "{itemName}" has been moved to the recycle bin, but it has dependencies:</p>
                
                {confirmData.hasActiveTasks && (
                  <div>
                    <p className="font-medium">Active Tasks:</p>
                    <div className="space-y-1">
                      {confirmData.activeTasks?.map((task: any) => (
                        <Badge key={task.id} variant="outline" className="mr-1">
                          {task.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {confirmData.hasActiveAssignments && (
                  <div>
                    <p className="font-medium">Active Assignments:</p>
                    <div className="space-y-1">
                      {confirmData.activeAssignments?.map((assignment: any) => (
                        <Badge key={assignment.id} variant="outline" className="mr-1">
                          {assignment.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  You can restore this {type} from the recycle bin if needed. 
                  Dependencies will remain intact during restoration.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={confirmDelete}>
                Understood
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default SoftDeleteButton;

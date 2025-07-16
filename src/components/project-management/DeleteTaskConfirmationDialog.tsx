import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info } from 'lucide-react';
import { ProjectTask } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';

interface DeleteTaskConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ProjectTask | null;
  allTasks: ProjectTask[];
  onConfirm: () => void;
}

interface DependentTask {
  id: string;
  name: string;
  type: 'blocks_task';
}

const DeleteTaskConfirmationDialog: React.FC<DeleteTaskConfirmationDialogProps> = ({
  open,
  onOpenChange,
  task,
  allTasks,
  onConfirm
}) => {
  const [dependentTasks, setDependentTasks] = useState<DependentTask[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && task) {
      checkDependencies();
    }
  }, [open, task]);

  const checkDependencies = async () => {
    if (!task) return;
    
    setLoading(true);
    try {
      // Check using the database function
      const { data, error } = await supabase
        .rpc('check_task_dependencies', { task_id_param: task.id });

      if (error) {
        console.error('Error checking dependencies:', error);
        // Fallback to local check
        checkLocalDependencies();
      } else {
        setDependentTasks((data || []).map(d => ({
          id: d.dependent_task_id,
          name: d.dependent_task_name,
          type: d.dependency_type as 'blocks_task'
        })));
      }
    } catch (error) {
      console.error('Error checking dependencies:', error);
      // Fallback to local check
      checkLocalDependencies();
    } finally {
      setLoading(false);
    }
  };

  const checkLocalDependencies = () => {
    if (!task) return;
    
    // Find tasks that depend on this task locally
    const dependent = allTasks
      .filter(t => t.dependencies && t.dependencies.includes(task.id))
      .map(t => ({
        id: t.id,
        name: t.name,
        type: 'blocks_task' as const
      }));
    
    setDependentTasks(dependent);
  };

  if (!task) return null;

  const hasDependencies = dependentTasks.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Task
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div>
              Are you sure you want to delete the task <strong>"{task.name}"</strong>?
            </div>
            
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                Checking dependencies...
              </div>
            )}

            {!loading && hasDependencies && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="font-semibold text-destructive">Warning: Dependencies Found</span>
                </div>
                <p className="text-sm text-destructive mb-2">
                  The following tasks depend on this task and may be affected:
                </p>
                <div className="space-y-1">
                  {dependentTasks.map((dep) => (
                    <div key={dep.id} className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">
                        Blocked
                      </Badge>
                      <span className="text-sm">{dep.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-destructive mt-2">
                  Consider reassigning these dependencies before deleting this task.
                </p>
              </div>
            )}

            {!loading && !hasDependencies && (
              <div className="bg-muted border border-border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    No dependencies found. This task can be safely deleted.
                  </span>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={loading}
          >
            {hasDependencies ? 'Delete Anyway' : 'Delete Task'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTaskConfirmationDialog;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2, RotateCcw, Calendar, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface DeletedProject {
  id: string;
  name: string;
  description: string;
  deleted_at: string;
  deleted_by: string;
  workspace_id: string;
}

const RecycleBin: React.FC = () => {
  const [deletedProjects, setDeletedProjects] = useState<DeletedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoreLoading, setRestoreLoading] = useState<string | null>(null);
  const [permanentDeleteLoading, setPermanentDeleteLoading] = useState<string | null>(null);
  const [showPermanentDeleteDialog, setShowPermanentDeleteDialog] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    loadDeletedProjects();
  }, [currentWorkspace]);

  const loadDeletedProjects = async () => {
    if (!currentWorkspace) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      setDeletedProjects(data || []);
    } catch (error) {
      console.error('Error loading deleted projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load deleted projects',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const restoreProject = async (projectId: string) => {
    setRestoreLoading(projectId);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          deleted_at: null, 
          deleted_by: null 
        })
        .eq('id', projectId);

      if (error) throw error;

      // Log the restoration
      await supabase.from('audit_logs').insert({
        action: 'project_restored',
        resource_type: 'project',
        resource_id: projectId,
        metadata: { restored_at: new Date().toISOString() }
      });

      toast({
        title: 'Success',
        description: 'Project restored successfully'
      });

      loadDeletedProjects();
    } catch (error) {
      console.error('Error restoring project:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore project',
        variant: 'destructive'
      });
    } finally {
      setRestoreLoading(null);
    }
  };

  const permanentDeleteProject = async (projectId: string) => {
    setPermanentDeleteLoading(projectId);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      // Log the permanent deletion
      await supabase.from('audit_logs').insert({
        action: 'project_permanently_deleted',
        resource_type: 'project',
        resource_id: projectId,
        metadata: { permanently_deleted_at: new Date().toISOString() }
      });

      toast({
        title: 'Success',
        description: 'Project permanently deleted'
      });

      loadDeletedProjects();
    } catch (error) {
      console.error('Error permanently deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to permanently delete project',
        variant: 'destructive'
      });
    } finally {
      setPermanentDeleteLoading(null);
      setShowPermanentDeleteDialog(null);
    }
  };

  const getDaysRemaining = (deletedAt: string) => {
    const deleteDate = new Date(deletedAt);
    const now = new Date();
    const hoursElapsed = (now.getTime() - deleteDate.getTime()) / (1000 * 60 * 60);
    const hoursRemaining = 48 - hoursElapsed;
    
    if (hoursRemaining <= 0) return 0;
    return Math.ceil(hoursRemaining / 24);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading deleted projects...</p>
        </div>
      </div>
    );
  }

  if (deletedProjects.length === 0) {
    return (
      <div className="text-center py-12">
        <Trash2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">Recycle bin is empty</h3>
        <p className="text-muted-foreground">
          Deleted projects will appear here and will be permanently removed after 48 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        <p className="text-sm text-muted-foreground">
          Projects in the recycle bin will be permanently deleted after 48 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deletedProjects.map((project) => {
          const daysRemaining = getDaysRemaining(project.deleted_at);
          const isExpiringSoon = daysRemaining <= 1;

          return (
            <Card key={project.id} className="border-destructive/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </div>
                  <Badge variant={isExpiringSoon ? "destructive" : "secondary"}>
                    {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Deleted {new Date(project.deleted_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => restoreProject(project.id)}
                    disabled={restoreLoading === project.id}
                    className="flex-1"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {restoreLoading === project.id ? 'Restoring...' : 'Restore'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowPermanentDeleteDialog(project.id)}
                    disabled={permanentDeleteLoading === project.id}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Forever
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog 
        open={showPermanentDeleteDialog !== null} 
        onOpenChange={() => setShowPermanentDeleteDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Permanently Delete Project
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this project? This action cannot be undone and all associated data will be lost forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showPermanentDeleteDialog && permanentDeleteProject(showPermanentDeleteDialog)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RecycleBin;

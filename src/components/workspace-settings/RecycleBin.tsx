
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RotateCcw, Trash2, FolderOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { format } from 'date-fns';

interface DeletedItem {
  id: string;
  name: string;
  type: 'project';
  deleted_at: string;
  deleted_by: string;
  description?: string;
}

const RecycleBin = () => {
  const { currentWorkspace } = useWorkspace();
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [permanentDeleting, setPermanentDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchDeletedItems();
  }, [currentWorkspace]);

  const fetchDeletedItems = async () => {
    if (!currentWorkspace) return;

    setLoading(true);
    try {
      // Fetch deleted projects
      const { data: deletedProjects, error } = await supabase
        .from('projects')
        .select('id, name, description, deleted_at, deleted_by')
        .eq('workspace_id', currentWorkspace.id)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;

      const items: DeletedItem[] = (deletedProjects || []).map(project => ({
        id: project.id,
        name: project.name,
        type: 'project' as const,
        deleted_at: project.deleted_at!,
        deleted_by: project.deleted_by!,
        description: project.description
      }));

      setDeletedItems(items);
    } catch (error) {
      console.error('Error fetching deleted items:', error);
      toast.error('Failed to load deleted items');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (item: DeletedItem) => {
    setRestoring(item.id);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          deleted_at: null,
          deleted_by: null
        })
        .eq('id', item.id);

      if (error) throw error;

      toast.success(`${item.name} has been restored`);
      fetchDeletedItems();
    } catch (error) {
      console.error('Error restoring item:', error);
      toast.error('Failed to restore item');
    } finally {
      setRestoring(null);
    }
  };

  const handlePermanentDelete = async (item: DeletedItem) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${item.name}"? This action cannot be undone.`)) {
      return;
    }

    setPermanentDeleting(item.id);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast.success(`${item.name} has been permanently deleted`);
      fetchDeletedItems();
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      toast.error('Failed to permanently delete item');
    } finally {
      setPermanentDeleting(null);
    }
  };

  const getTimeLeft = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(deletedDate.getTime() + 48 * 60 * 60 * 1000); // 48 hours
    const now = new Date();
    const timeLeft = expiryDate.getTime() - now.getTime();
    
    if (timeLeft <= 0) return 'Expired';
    
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m left`;
    }
    return `${minutesLeft}m left`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Recycle Bin</h3>
        <p className="text-sm text-muted-foreground">
          Items deleted within the last 48 hours. After this period, they will be permanently removed.
        </p>
      </div>

      {deletedItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Recycle bin is empty</h3>
            <p className="text-muted-foreground">
              No deleted items found in this workspace.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deletedItems.map((item) => {
            const timeLeft = getTimeLeft(item.deleted_at);
            const isExpired = timeLeft === 'Expired';
            
            return (
              <Card key={item.id} className={isExpired ? 'border-destructive/20' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <div>
                        <CardTitle className="text-base">{item.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="capitalize">
                            {item.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Deleted {format(new Date(item.deleted_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={isExpired ? 'destructive' : 'secondary'}
                      className="ml-auto"
                    >
                      {timeLeft}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {item.description}
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(item)}
                      disabled={restoring === item.id || isExpired}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {restoring === item.id ? 'Restoring...' : 'Restore'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handlePermanentDelete(item)}
                      disabled={permanentDeleting === item.id}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {permanentDeleting === item.id ? 'Deleting...' : 'Delete Permanently'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecycleBin;

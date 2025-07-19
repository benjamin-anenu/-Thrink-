
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Trash2, RotateCcw, Search, Calendar, Users, 
  AlertTriangle, Clock, Folder, User 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface DeletedItem {
  id: string;
  name: string;
  type: 'project' | 'resource';
  deletedAt: Date;
  deletedBy: string;
  originalData: any;
  autoDeleteDate: Date;
}

const RecycleBin: React.FC = () => {
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<DeletedItem | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showPermanentDeleteDialog, setShowPermanentDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDeletedItems();
  }, []);

  const loadDeletedItems = async () => {
    try {
      setIsLoading(true);
      
      // Load deleted projects
      const { data: deletedProjects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Load deleted resources (assuming we'll add deleted_at to resources table)
      const { data: deletedResources, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      // Handle case where deleted_at column doesn't exist yet
      const resources = resourcesError ? [] : deletedResources || [];

      const items: DeletedItem[] = [
        ...(deletedProjects || []).map(project => ({
          id: project.id,
          name: project.name,
          type: 'project' as const,
          deletedAt: new Date(project.deleted_at),
          deletedBy: project.deleted_by || 'Unknown',
          originalData: project,
          autoDeleteDate: new Date(new Date(project.deleted_at).getTime() + 48 * 60 * 60 * 1000)
        })),
        ...resources.map((resource: any) => ({
          id: resource.id,
          name: resource.name,
          type: 'resource' as const,
          deletedAt: new Date(resource.deleted_at),
          deletedBy: resource.deleted_by || 'Unknown',
          originalData: resource,
          autoDeleteDate: new Date(new Date(resource.deleted_at).getTime() + 48 * 60 * 60 * 1000)
        }))
      ];

      setDeletedItems(items);
    } catch (error) {
      console.error('Error loading deleted items:', error);
      toast.error('Failed to load recycle bin items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (item: DeletedItem) => {
    try {
      if (item.type === 'project') {
        const { error } = await supabase
          .from('projects')
          .update({ 
            deleted_at: null, 
            deleted_by: null,
            status: 'Active' // Restore to active status
          })
          .eq('id', item.id);

        if (error) throw error;
      } else {
        // Handle resource restoration when we add soft delete to resources
        const { error } = await supabase
          .from('resources')
          .update({ 
            deleted_at: null, 
            deleted_by: null 
          })
          .eq('id', item.id);

        if (error) throw error;
      }

      toast.success(`${item.type === 'project' ? 'Project' : 'Resource'} restored successfully`);
      loadDeletedItems(); // Refresh the list
      setShowRestoreDialog(false);
      setSelectedItem(null);
    } catch (error) {
      console.error(`Error restoring ${item.type}:`, error);
      toast.error(`Failed to restore ${item.type}`);
    }
  };

  const handlePermanentDelete = async (item: DeletedItem) => {
    try {
      if (item.type === 'project') {
        // First delete related data
        await supabase.from('project_tasks').delete().eq('project_id', item.id);
        await supabase.from('milestones').delete().eq('project_id', item.id);
        
        // Then delete the project
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', item.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('resources')
          .delete()
          .eq('id', item.id);

        if (error) throw error;
      }

      toast.success(`${item.type === 'project' ? 'Project' : 'Resource'} permanently deleted`);
      loadDeletedItems(); // Refresh the list
      setShowPermanentDeleteDialog(false);
      setSelectedItem(null);
    } catch (error) {
      console.error(`Error permanently deleting ${item.type}:`, error);
      toast.error(`Failed to permanently delete ${item.type}`);
    }
  };

  const filteredItems = deletedItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const projectItems = filteredItems.filter(item => item.type === 'project');
  const resourceItems = filteredItems.filter(item => item.type === 'resource');

  const isNearAutoDelete = (item: DeletedItem) => {
    const hoursUntilDelete = (item.autoDeleteDate.getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntilDelete <= 6; // Show warning if less than 6 hours remaining
  };

  const ItemCard: React.FC<{ item: DeletedItem }> = ({ item }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-lg">
              {item.type === 'project' ? (
                <Folder className="h-5 w-5" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">{item.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="h-3 w-3" />
                <span>Deleted {formatDistanceToNow(item.deletedAt, { addSuffix: true })}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={item.type === 'project' ? 'default' : 'secondary'}>
                  {item.type === 'project' ? 'Project' : 'Resource'}
                </Badge>
                
                {isNearAutoDelete(item) && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Auto-delete soon
                  </Badge>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                Auto-delete: {formatDistanceToNow(item.autoDeleteDate, { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedItem(item);
                setShowRestoreDialog(true);
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedItem(item);
                setShowPermanentDeleteDialog(true);
              }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading recycle bin...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recycle Bin</h2>
          <p className="text-muted-foreground">
            Items are automatically deleted after 48 hours
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search deleted items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({filteredItems.length})</TabsTrigger>
          <TabsTrigger value="projects">Projects ({projectItems.length})</TabsTrigger>
          <TabsTrigger value="resources">Resources ({resourceItems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Recycle bin is empty</h3>
              <p className="text-muted-foreground">No deleted items to display</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          {projectItems.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No deleted projects</h3>
              <p className="text-muted-foreground">No deleted projects to display</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {projectItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {resourceItems.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No deleted resources</h3>
              <p className="text-muted-foreground">No deleted resources to display</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {resourceItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Restore Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore {selectedItem?.type === 'project' ? 'Project' : 'Resource'}</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore "{selectedItem?.name}"? It will be moved back to your active {selectedItem?.type === 'project' ? 'projects' : 'resources'}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedItem && handleRestore(selectedItem)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Dialog */}
      <Dialog open={showPermanentDeleteDialog} onOpenChange={setShowPermanentDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Permanently Delete {selectedItem?.type === 'project' ? 'Project' : 'Resource'}</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete "{selectedItem?.name}"? This action cannot be undone and all associated data will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermanentDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedItem && handlePermanentDelete(selectedItem)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecycleBin;

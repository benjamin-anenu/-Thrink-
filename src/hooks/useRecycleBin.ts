
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface RecycleBinItem {
  id: string;
  item_type: 'project' | 'resource' | 'stakeholder';
  item_id: string;
  item_data: any;
  deleted_at: string;
  deleted_by: string;
  auto_delete_at: string;
  restored_at?: string;
  restored_by?: string;
}

export const useRecycleBin = () => {
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  const loadRecycleBinItems = async () => {
    if (!currentWorkspace) return;
    
    try {
      setLoading(true);
      const deletedItems: RecycleBinItem[] = [];

      // Get deleted projects
      const { data: deletedProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .not('deleted_at', 'is', null);

      if (deletedProjects) {
        deletedProjects.forEach(project => {
          if (project.deleted_at) {
            deletedItems.push({
              id: `project-${project.id}`,
              item_type: 'project',
              item_id: project.id,
              item_data: project,
              deleted_at: project.deleted_at,
              deleted_by: project.deleted_by || '',
              auto_delete_at: new Date(new Date(project.deleted_at).getTime() + 48 * 60 * 60 * 1000).toISOString()
            });
          }
        });
      }

      // Get deleted resources
      const { data: deletedResources } = await supabase
        .from('resources')
        .select('*')
        .not('deleted_at', 'is', null);

      if (deletedResources) {
        deletedResources.forEach(resource => {
          if (resource.deleted_at) {
            deletedItems.push({
              id: `resource-${resource.id}`,
              item_type: 'resource',
              item_id: resource.id,
              item_data: resource,
              deleted_at: resource.deleted_at,
              deleted_by: resource.deleted_by || '',
              auto_delete_at: new Date(new Date(resource.deleted_at).getTime() + 48 * 60 * 60 * 1000).toISOString()
            });
          }
        });
      }

      // Get deleted stakeholders
      const { data: deletedStakeholders } = await supabase
        .from('stakeholders')
        .select('*')
        .not('deleted_at', 'is', null);

      if (deletedStakeholders) {
        deletedStakeholders.forEach(stakeholder => {
          if (stakeholder.deleted_at) {
            deletedItems.push({
              id: `stakeholder-${stakeholder.id}`,
              item_type: 'stakeholder',
              item_id: stakeholder.id,
              item_data: stakeholder,
              deleted_at: stakeholder.deleted_at,
              deleted_by: stakeholder.deleted_by || '',
              auto_delete_at: new Date(new Date(stakeholder.deleted_at).getTime() + 48 * 60 * 60 * 1000).toISOString()
            });
          }
        });
      }

      setItems(deletedItems);
    } catch (error) {
      console.error('Error loading recycle bin:', error);
      toast.error('Failed to load recycle bin');
    } finally {
      setLoading(false);
    }
  };

  const restoreItem = async (itemId: string) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      // Restore the actual item by clearing deleted_at
      const tableName = item.item_type === 'project' ? 'projects' : 
                       item.item_type === 'resource' ? 'resources' : 'stakeholders';

      const { error: restoreError } = await supabase
        .from(tableName as any)
        .update({
          deleted_at: null,
          deleted_by: null
        })
        .eq('id', item.item_id);

      if (restoreError) throw restoreError;

      toast.success(`${item.item_type} restored successfully`);
      loadRecycleBinItems();
    } catch (error) {
      console.error('Error restoring item:', error);
      toast.error('Failed to restore item');
    }
  };

  const permanentlyDelete = async (itemId: string) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      // Hard delete the actual item
      const tableName = item.item_type === 'project' ? 'projects' : 
                       item.item_type === 'resource' ? 'resources' : 'stakeholders';

      const { error: deleteError } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', item.item_id);

      if (deleteError) throw deleteError;

      toast.success(`${item.item_type} permanently deleted`);
      loadRecycleBinItems();
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      toast.error('Failed to permanently delete item');
    }
  };

  useEffect(() => {
    loadRecycleBinItems();
  }, [currentWorkspace]);

  return {
    items,
    loading,
    restoreItem,
    permanentlyDelete,
    refreshItems: loadRecycleBinItems
  };
};

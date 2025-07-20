
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
      const { data, error } = await supabase
        .from('recycle_bin')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .is('restored_at', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
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

      // Mark as restored in recycle bin
      const { error: recycleError } = await supabase
        .from('recycle_bin')
        .update({
          restored_at: new Date().toISOString(),
          restored_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', itemId);

      if (recycleError) throw recycleError;

      // Restore the actual item
      const tableName = item.item_type === 'project' ? 'projects' : 
                       item.item_type === 'resource' ? 'resources' : 'stakeholders';

      const { error: restoreError } = await supabase
        .from(tableName)
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

      // Delete from recycle bin
      const { error: recycleError } = await supabase
        .from('recycle_bin')
        .delete()
        .eq('id', itemId);

      if (recycleError) throw recycleError;

      // Hard delete the actual item
      const tableName = item.item_type === 'project' ? 'projects' : 
                       item.item_type === 'resource' ? 'resources' : 'stakeholders';

      const { error: deleteError } = await supabase
        .from(tableName)
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

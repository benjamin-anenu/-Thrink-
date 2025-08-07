import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import type { Resource } from '@/types/resource';
import { useRealResourceUtilization } from './useRealResourceUtilization';

export const useEnhancedResourcesWithUtilization = () => {
  const [baseResources, setBaseResources] = useState<any[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { currentWorkspace } = useWorkspace();

  const loadBaseResources = async () => {
    if (!currentWorkspace) {
      setBaseResources([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('name');

      if (error) throw error;
      
      setBaseResources(data || []);
      setInitialLoadComplete(true);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error('Failed to load resources');
      setInitialLoadComplete(true);
    } finally {
      setLoading(false);
    }
  };

  // Get resource IDs for utilization hook
  const resourceIds = baseResources.map(r => r.id);
  const { utilizationMetrics, aiRecommendations, loading: utilizationLoading, refreshUtilizationData } = useRealResourceUtilization(resourceIds);

  // Update resources when utilization metrics change or base resources change
  useEffect(() => {
    if (baseResources.length > 0) {
      const mappedData = baseResources.map(item => {
        const utilizationData = utilizationMetrics[item.id] || {
          utilization_percentage: 0,
          task_count: 0,
          status: 'Underutilized' as const
        };

        return {
          ...item,
          type: 'human' as 'human' | 'ai' | 'external',
          status: 'active' as 'active' | 'inactive' | 'pending',
          skills: [] as string[],
          availability: item.availability ? `${item.availability}%` : '100%',
          cost: 0,
          utilization: utilizationData.utilization_percentage, // Use calculated utilization
          workspace_id: item.workspace_id || '',
          name: item.name || '',
          email: item.email || '',
          role: item.role || '',
          department: item.department || '',
          phone: item.phone || '',
          location: item.location || '',
          employment_type: item.employment_type || '',
          seniority_level: item.seniority_level || '',
          mentorship_capacity: item.mentorship_capacity || false,
          notes: item.notes || '',
          hourly_rate: (item as any).hourly_rate || 0,
          created_at: item.created_at || '',
          updated_at: item.updated_at || '',
        };
      });
      
      setResources(mappedData);
    }
  }, [baseResources, utilizationMetrics]);

  const deleteResource = async (resourceId: string) => {
    if (!currentWorkspace) return false;

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId)
        .eq('workspace_id', currentWorkspace.id);

      if (error) throw error;

      toast.success('Resource deleted successfully');
      await loadBaseResources(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
      return false;
    }
  };

  const refreshResources = async () => {
    await loadBaseResources();
    await refreshUtilizationData();
  };

  useEffect(() => {
    loadBaseResources();
    
    // Set up real-time subscriptions
    const resourceSubscription = supabase
      .channel('resources_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resources',
          filter: `workspace_id=eq.${currentWorkspace?.id}`
        },
        () => {
          loadBaseResources();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(resourceSubscription);
    };
  }, [currentWorkspace]);

  return {
    resources,
    loading: !initialLoadComplete || (loading && !initialLoadComplete) || (utilizationLoading && baseResources.length === 0),
    refreshResources,
    deleteResource,
    utilizationMetrics,
    aiRecommendations,
    refreshEnhancedData: refreshUtilizationData,
  };
};
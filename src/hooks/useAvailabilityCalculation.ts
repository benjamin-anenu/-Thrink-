import { useState, useEffect, useCallback } from 'react';
import { AvailabilityCalculationService, ResourceAvailability } from '@/services/AvailabilityCalculationService';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { EventBus } from '@/services/EventBus';

export interface AvailabilityStats {
  totalResources: number;
  availableResources: number;
  busyResources: number;
  overallocatedResources: number;
  avgUtilization: number;
  avgAvailability: number;
}

export const useAvailabilityCalculation = (projectId?: string) => {
  const { currentWorkspace } = useWorkspace();
  const [availabilityData, setAvailabilityData] = useState<ResourceAvailability[]>([]);
  const [stats, setStats] = useState<AvailabilityStats>({
    totalResources: 0,
    availableResources: 0,
    busyResources: 0,
    overallocatedResources: 0,
    avgUtilization: 0,
    avgAvailability: 100
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate availability data
  const calculateAvailability = useCallback(async () => {
    if (!currentWorkspace) return;

    setLoading(true);
    setError(null);

    try {
      let availabilities: ResourceAvailability[];

      if (projectId) {
        // Calculate for specific project
        availabilities = await AvailabilityCalculationService.calculateProjectAvailability(projectId);
      } else {
        // Calculate for entire workspace
        availabilities = await AvailabilityCalculationService.calculateWorkspaceAvailability(currentWorkspace.id);
      }

      setAvailabilityData(availabilities);

      // Calculate statistics
      const totalResources = availabilities.length;
      const availableResources = availabilities.filter(r => r.status === 'Available').length;
      const busyResources = availabilities.filter(r => r.status === 'Busy').length;
      const overallocatedResources = availabilities.filter(r => r.status === 'Overallocated').length;
      
      const avgUtilization = totalResources > 0 
        ? Math.round(availabilities.reduce((acc, r) => acc + r.currentUtilization, 0) / totalResources)
        : 0;

      const avgAvailability = totalResources > 0
        ? Math.round(availabilities.reduce((acc, r) => acc + r.calculatedAvailability, 0) / totalResources)
        : 100;

      setStats({
        totalResources,
        availableResources,
        busyResources,
        overallocatedResources,
        avgUtilization,
        avgAvailability
      });
    } catch (err) {
      console.error('Error calculating availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate availability');
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace, projectId]);

  // Listen for real-time updates
  useEffect(() => {
    const eventBus = EventBus.getInstance();
    
    const handleUpdate = () => {
      calculateAvailability();
    };

    const unsubscribers = [
      eventBus.subscribe('task_updated', handleUpdate),
      eventBus.subscribe('task_created', handleUpdate),
      eventBus.subscribe('task_deleted', handleUpdate),
      eventBus.subscribe('resource_updated', handleUpdate),
      eventBus.subscribe('resource_assigned', handleUpdate),
      eventBus.subscribe('resource_unassigned', handleUpdate),
      eventBus.subscribe('project_updated', handleUpdate)
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [calculateAvailability]);

  // Initial calculation
  useEffect(() => {
    calculateAvailability();
  }, [calculateAvailability]);

  // Get availability for a specific resource
  const getResourceAvailability = useCallback(async (resourceId: string): Promise<ResourceAvailability | null> => {
    if (!currentWorkspace) return null;
    
    try {
      return await AvailabilityCalculationService.calculateResourceAvailability(
        resourceId, 
        currentWorkspace.id
      );
    } catch (err) {
      console.error('Error getting resource availability:', err);
      return null;
    }
  }, [currentWorkspace]);

  // Update resource availability in database
  const updateResourceAvailability = useCallback(async (resourceId: string, availability: number): Promise<boolean> => {
    try {
      const success = await AvailabilityCalculationService.updateResourceAvailability(resourceId, availability);
      if (success) {
        // Recalculate after update
        calculateAvailability();
      }
      return success;
    } catch (err) {
      console.error('Error updating resource availability:', err);
      return false;
    }
  }, [calculateAvailability]);

  // Get workspace availability statistics
  const getWorkspaceStats = useCallback(async (): Promise<AvailabilityStats | null> => {
    if (!currentWorkspace) return null;
    
    try {
      return await AvailabilityCalculationService.getWorkspaceAvailabilityStats(currentWorkspace.id);
    } catch (err) {
      console.error('Error getting workspace stats:', err);
      return null;
    }
  }, [currentWorkspace]);

  return {
    availabilityData,
    stats,
    loading,
    error,
    calculateAvailability,
    getResourceAvailability,
    updateResourceAvailability,
    getWorkspaceStats
  };
}; 
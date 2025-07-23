
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

export class RealTimeResourceService {
  private channels: RealtimeChannel[] = [];
  private subscribers: Map<string, (data: any) => void> = new Map();

  subscribeToResourceUpdates(workspaceId: string, callback: (data: any) => void) {
    console.log('Subscribing to resource updates for workspace:', workspaceId);
    
    // Subscribe to resource profiles changes
    const profilesChannel = supabase
      .channel(`resource_profiles_${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resource_profiles',
          filter: `workspace_id=eq.${workspaceId}`
        },
        (payload) => {
          console.log('Resource profile updated:', payload);
          callback({
            type: 'resource_profile_updated',
            data: payload
          });
          toast.info('Resource profile updated');
        }
      )
      .subscribe();

    // Subscribe to utilization metrics changes
    const metricsChannel = supabase
      .channel(`utilization_metrics_${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resource_utilization_metrics',
          filter: `workspace_id=eq.${workspaceId}`
        },
        (payload) => {
          console.log('Utilization metrics updated:', payload);
          callback({
            type: 'utilization_metrics_updated',
            data: payload
          });
          toast.info('Resource utilization updated');
        }
      )
      .subscribe();

    // Subscribe to AI recommendations changes
    const recommendationsChannel = supabase
      .channel(`ai_recommendations_${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_assignment_recommendations',
          filter: `workspace_id=eq.${workspaceId}`
        },
        (payload) => {
          console.log('AI recommendations updated:', payload);
          callback({
            type: 'ai_recommendations_updated',
            data: payload
          });
          toast.info('New AI recommendations available');
        }
      )
      .subscribe();

    this.channels.push(profilesChannel, metricsChannel, recommendationsChannel);
    this.subscribers.set(workspaceId, callback);

    return () => {
      this.unsubscribeFromWorkspace(workspaceId);
    };
  }

  subscribeToResourcePresence(workspaceId: string, userId: string) {
    console.log('Setting up resource presence for workspace:', workspaceId);
    
    const presenceChannel = supabase.channel(`workspace_presence_${workspaceId}`)
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        console.log('Presence sync:', newState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        toast.info(`User ${key} is now active`);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        toast.info(`User ${key} went offline`);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;

        const presenceTrackStatus = await presenceChannel.track({
          user_id: userId,
          workspace_id: workspaceId,
          online_at: new Date().toISOString(),
          activity: 'resource_management'
        });
        
        console.log('Presence tracking status:', presenceTrackStatus);
      });

    this.channels.push(presenceChannel);
    
    return () => {
      presenceChannel.unsubscribe();
    };
  }

  unsubscribeFromWorkspace(workspaceId: string) {
    console.log('Unsubscribing from workspace updates:', workspaceId);
    this.subscribers.delete(workspaceId);
  }

  unsubscribeAll() {
    console.log('Unsubscribing from all real-time updates');
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.channels = [];
    this.subscribers.clear();
  }

  async broadcastResourceUpdate(workspaceId: string, updateType: string, data: any) {
    try {
      const channel = supabase.channel(`resource_updates_${workspaceId}`);
      
      await channel.send({
        type: 'broadcast',
        event: updateType,
        payload: data
      });

      console.log('Broadcasted resource update:', updateType, data);
    } catch (error) {
      console.error('Failed to broadcast resource update:', error);
    }
  }
}

export const realTimeResourceService = new RealTimeResourceService();

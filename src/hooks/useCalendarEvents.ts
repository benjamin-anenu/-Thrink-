
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: 'call' | 'meeting' | 'deadline' | 'milestone' | 'review';
  date: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  projectId: string;
  projectName: string;
}

export const useCalendarEvents = (projectId?: string) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    if (!currentWorkspace) return;

    const fetchCalendarEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch calendar events - if projectId is provided, filter by it, otherwise get all workspace events
        let calendarQuery = supabase
          .from('calendar_events')
          .select(`
            *,
            projects:project_id (
              id,
              name
            )
          `)
          .eq('workspace_id', currentWorkspace.id);

        if (projectId) {
          calendarQuery = calendarQuery.eq('project_id', projectId);
        }

        const { data: calendarData, error: calendarError } = await calendarQuery
          .order('start_date', { ascending: true });

        if (calendarError) throw calendarError;

        // Fetch project milestones as calendar events
        let milestonesQuery = supabase
          .from('milestones')
          .select(`
            *,
            projects:project_id (
              id,
              name,
              workspace_id
            )
          `);

        // Filter milestones by workspace through the projects relation
        const { data: milestonesData, error: milestonesError } = await milestonesQuery;

        if (milestonesError) throw milestonesError;

        // Filter milestones to only those belonging to projects in the current workspace
        const workspaceMilestones = (milestonesData || []).filter(
          milestone => milestone.projects?.workspace_id === currentWorkspace.id
        );

        // If projectId is provided, further filter milestones
        const filteredMilestones = projectId 
          ? workspaceMilestones.filter(milestone => milestone.project_id === projectId)
          : workspaceMilestones;

        // Transform calendar events
        const calendarEvents: CalendarEvent[] = (calendarData || []).map(event => ({
          id: event.id,
          title: event.title,
          description: event.description || '',
          type: event.event_type as CalendarEvent['type'],
          date: new Date(event.start_date),
          startTime: event.start_date ? new Date(event.start_date).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
          }) : undefined,
          endTime: event.end_date ? new Date(event.end_date).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
          }) : undefined,
          location: event.location || undefined,
          projectId: event.project_id || '',
          projectName: event.projects?.name || 'Unknown Project'
        }));

        // Transform milestones to calendar events
        const milestoneEvents: CalendarEvent[] = filteredMilestones.map(milestone => ({
          id: `milestone-${milestone.id}`,
          title: milestone.name,
          description: milestone.description || `Milestone: ${milestone.name}`,
          type: 'milestone' as const,
          date: new Date(milestone.due_date),
          projectId: milestone.project_id || '',
          projectName: milestone.projects?.name || 'Unknown Project'
        }));

        // Combine and sort events
        const allEvents = [...calendarEvents, ...milestoneEvents]
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        setEvents(allEvents);
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch calendar events');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarEvents();
  }, [currentWorkspace, projectId]);

  const createEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (!currentWorkspace) return null;

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          event_type: eventData.type,
          start_date: eventData.date.toISOString(),
          end_date: eventData.date.toISOString(),
          location: eventData.location,
          project_id: eventData.projectId,
          workspace_id: currentWorkspace.id,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh events
      const newEvent: CalendarEvent = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        type: data.event_type as CalendarEvent['type'],
        date: new Date(data.start_date),
        startTime: data.start_date ? new Date(data.start_date).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }) : undefined,
        endTime: data.end_date ? new Date(data.end_date).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }) : undefined,
        location: data.location || undefined,
        projectId: data.project_id || '',
        projectName: eventData.projectName
      };

      setEvents(prev => [...prev, newEvent].sort((a, b) => a.date.getTime() - b.date.getTime()));
      return newEvent;
    } catch (err) {
      console.error('Error creating calendar event:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event');
      return null;
    }
  };

  return {
    events,
    loading,
    error,
    createEvent
  };
};

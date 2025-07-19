
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useRealTimeEvents } from '@/hooks/useRealTimeEvents';
import { toast } from 'sonner';

interface CalendarEvent {
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
  taskId?: string;
  taskName?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  status?: 'completed' | 'in-progress' | 'pending' | 'overdue';
  attendees?: string[];
}

export const useCalendarSync = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();
  const { emitDeadlineApproaching } = useRealTimeEvents();

  const syncTasksToCalendar = async () => {
    if (!currentWorkspace) return;

    try {
      setIsLoading(true);

      // Get all tasks from projects in current workspace
      const { data: tasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select(`
          *,
          projects!inner(
            id,
            name,
            workspace_id
          )
        `)
        .eq('projects.workspace_id', currentWorkspace.id)
        .not('end_date', 'is', null);

      if (tasksError) throw tasksError;

      // Get milestones
      const { data: milestones, error: milestonesError } = await supabase
        .from('milestones')
        .select(`
          *,
          projects!inner(
            id,
            name,
            workspace_id
          )
        `)
        .eq('projects.workspace_id', currentWorkspace.id)
        .not('due_date', 'is', null);

      if (milestonesError) throw milestonesError;

      // Convert tasks to calendar events
      const taskEvents: CalendarEvent[] = (tasks || []).map(task => {
        const isOverdue = task.end_date && new Date(task.end_date) < new Date() && task.status !== 'Completed';
        const daysUntilDue = task.end_date ? Math.ceil((new Date(task.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
        
        // Emit deadline notification for approaching deadlines
        if (daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0 && task.status !== 'Completed') {
          emitDeadlineApproaching(task.id, task.name, task.project_id, task.projects.name, daysUntilDue);
        }

        return {
          id: `task-${task.id}`,
          title: task.name,
          description: task.description || `Task: ${task.name}`,
          type: isOverdue ? 'deadline' : task.end_date ? 'deadline' : 'review',
          date: new Date(task.end_date),
          projectId: task.project_id,
          projectName: task.projects.name,
          taskId: task.id,
          taskName: task.name,
          priority: task.priority as 'Low' | 'Medium' | 'High' | 'Critical' || 'Medium',
          status: isOverdue ? 'overdue' : 
                 task.status === 'Completed' ? 'completed' : 
                 task.status === 'In Progress' ? 'in-progress' : 'pending',
        };
      });

      // Convert milestones to calendar events
      const milestoneEvents: CalendarEvent[] = (milestones || []).map(milestone => ({
        id: `milestone-${milestone.id}`,
        title: `Milestone: ${milestone.name}`,
        description: milestone.description || `Milestone: ${milestone.name}`,
        type: 'milestone' as const,
        date: new Date(milestone.due_date),
        projectId: milestone.project_id,
        projectName: milestone.projects.name,
        priority: 'High' as const,
        status: milestone.status === 'Completed' ? 'completed' : 'pending',
      }));

      // Get existing calendar events
      const { data: existingEvents, error: eventsError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('workspace_id', currentWorkspace.id);

      if (eventsError) throw eventsError;

      // Convert existing events
      const calendarEvents: CalendarEvent[] = (existingEvents || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        type: event.event_type as 'call' | 'meeting' | 'deadline' | 'milestone' | 'review',
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
        projectName: event.project_id || 'General',
        attendees: event.attendees ? (event.attendees as any[]).map(a => a.email || a.name) : [],
      }));

      // Combine all events
      const allEvents = [...taskEvents, ...milestoneEvents, ...calendarEvents];
      
      // Sort by date
      allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

      setEvents(allEvents);
    } catch (error) {
      console.error('Error syncing calendar:', error);
      toast.error('Failed to sync calendar with tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const createCalendarEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (!currentWorkspace) return;

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          event_type: eventData.type,
          start_date: eventData.date.toISOString(),
          end_date: eventData.endTime ? 
            new Date(`${eventData.date.toDateString()} ${eventData.endTime}`).toISOString() : 
            eventData.date.toISOString(),
          location: eventData.location,
          project_id: eventData.projectId || null,
          task_id: eventData.taskId || null,
          workspace_id: currentWorkspace.id,
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
          attendees: eventData.attendees ? eventData.attendees.map(email => ({ email })) : []
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh events
      await syncTasksToCalendar();
      
      toast.success('Calendar event created successfully');
      return data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      toast.error('Failed to create calendar event');
      return null;
    }
  };

  // Initial sync and periodic updates
  useEffect(() => {
    if (currentWorkspace) {
      syncTasksToCalendar();
      
      // Sync every 5 minutes
      const interval = setInterval(syncTasksToCalendar, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [currentWorkspace]);

  return {
    events,
    isLoading,
    syncTasksToCalendar,
    createCalendarEvent,
  };
};

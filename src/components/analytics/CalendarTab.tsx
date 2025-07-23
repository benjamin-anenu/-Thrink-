
import React from 'react';
import ProjectCalendar from '@/components/calendar/ProjectCalendar';
import { useCalendarEvents, CalendarEvent } from '@/hooks/useCalendarEvents';
import { LoadingOverlay } from '@/components/ui/loading-state';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface CalendarTabProps {
  onCreateEvent?: (event: Omit<CalendarEvent, 'id'>) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

const CalendarTab: React.FC<CalendarTabProps> = ({
  onCreateEvent,
  onEventClick
}) => {
  const { events, loading, error, createEvent } = useCalendarEvents();

  const handleCreateEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent = await createEvent(eventData);
    if (newEvent && onCreateEvent) {
      onCreateEvent(eventData);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <LoadingOverlay isLoading={loading} loadingText="Loading calendar events...">
      <ProjectCalendar
        events={events}
        onCreateEvent={handleCreateEvent}
        onEventClick={handleEventClick}
      />
    </LoadingOverlay>
  );
};

export default CalendarTab;

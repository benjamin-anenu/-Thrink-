
import React from 'react';
import ProjectCalendar from '@/components/calendar/ProjectCalendar';
import { useCalendarSync } from '@/hooks/useCalendarSync';

const CalendarTab: React.FC = () => {
  const { events, isLoading, createCalendarEvent } = useCalendarSync();

  const handleCreateEvent = async (eventData: any) => {
    await createCalendarEvent(eventData);
  };

  const handleEventClick = (event: any) => {
    console.log('Event clicked:', event);
    // Handle event click - could open details modal, navigate to project, etc.
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading calendar...</div>
      </div>
    );
  }

  return (
    <ProjectCalendar
      events={events}
      onCreateEvent={handleCreateEvent}
      onEventClick={handleEventClick}
    />
  );
};

export default CalendarTab;

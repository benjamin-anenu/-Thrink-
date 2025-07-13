
import React from 'react';
import ProjectCalendar from '@/components/calendar/ProjectCalendar';

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
}

interface CalendarTabProps {
  events: CalendarEvent[];
  onCreateEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const CalendarTab: React.FC<CalendarTabProps> = ({
  events,
  onCreateEvent,
  onEventClick
}) => {
  return (
    <ProjectCalendar
      events={events}
      onCreateEvent={onCreateEvent}
      onEventClick={onEventClick}
    />
  );
};

export default CalendarTab;

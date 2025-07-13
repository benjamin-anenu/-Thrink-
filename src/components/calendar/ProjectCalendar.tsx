
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Calendar } from '@/components/ui/calendar';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, Users, Target, Filter
} from 'lucide-react';

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
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  status?: 'completed' | 'in-progress' | 'pending' | 'overdue';
}

interface ProjectCalendarProps {
  events?: CalendarEvent[];
  onCreateEvent?: (event: Omit<CalendarEvent, 'id'>) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

const ProjectCalendar: React.FC<ProjectCalendarProps> = ({ 
  events = [], 
  onCreateEvent, 
  onEventClick 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Sample events data if none provided
  const defaultEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Project Alpha Kickoff',
      description: 'Initial project meeting',
      type: 'meeting',
      date: new Date(2024, 2, 15),
      startTime: '09:00',
      endTime: '10:30',
      location: 'Conference Room A',
      projectId: 'proj-1',
      projectName: 'Project Alpha',
      priority: 'High',
      status: 'completed'
    },
    {
      id: '2',
      title: 'Design Review Milestone',
      description: 'Review design mockups',
      type: 'milestone',
      date: new Date(2024, 2, 22),
      startTime: '14:00',
      endTime: '16:00',
      projectId: 'proj-2',
      projectName: 'E-commerce Platform',
      status: 'in-progress'
    }
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;

  const getEventVariant = (type: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (type) {
      case 'milestone': return 'success';
      case 'deadline': return 'error';
      case 'meeting': return 'info';
      case 'call': return 'warning';
      case 'review': return 'info';
      default: return 'default';
    }
  };

  const getPriorityVariant = (priority: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (priority) {
      case 'Critical':
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const filteredEvents = filterType === 'all' 
    ? displayEvents 
    : displayEvents.filter(event => event.type === filterType);

  const eventTypes = ['all', 'milestone', 'deadline', 'meeting', 'call', 'review'];

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-surface border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Project Calendar</CardTitle>
              <CardDescription>
                Track milestones, deadlines, and important project events
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-1">
                {eventTypes.map(type => (
                  <Button
                    key={type}
                    variant={filterType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(type)}
                    className="capitalize"
                  >
                    {type.replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardContent className="p-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Events List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedDate ? `Events for ${selectedDate.toLocaleDateString()}` : 'All Events'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedDate ? (
                getEventsForDate(selectedDate).length > 0 ? (
                  getEventsForDate(selectedDate).map(event => (
                    <div
                      key={event.id}
                      className="p-3 border border-border rounded-lg hover:bg-surface-hover cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedEvent(event);
                        if (onEventClick) onEventClick(event);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <StatusBadge variant={getEventVariant(event.type)}>
                          {event.type}
                        </StatusBadge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {event.startTime && (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>{event.startTime} - {event.endTime}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No events for this date
                  </p>
                )
              ) : (
                filteredEvents.slice(0, 5).map(event => (
                  <div
                    key={event.id}
                    className="p-3 border border-border rounded-lg hover:bg-surface-hover cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedEvent(event);
                      if (onEventClick) onEventClick(event);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <StatusBadge variant={getEventVariant(event.type)}>
                        {event.type}
                      </StatusBadge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{event.date.toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Card className="fixed inset-x-4 top-1/2 transform -translate-y-1/2 z-50 max-w-md mx-auto bg-card border-border shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{selectedEvent.title}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <StatusBadge variant={getEventVariant(selectedEvent.type)}>
                {selectedEvent.type}
              </StatusBadge>
              {selectedEvent.priority && (
                <StatusBadge variant={getPriorityVariant(selectedEvent.priority)}>
                  {selectedEvent.priority}
                </StatusBadge>
              )}
              {selectedEvent.status && (
                <StatusBadge variant={getStatusVariant(selectedEvent.status)}>
                  {selectedEvent.status}
                </StatusBadge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{selectedEvent.date.toLocaleDateString()}</span>
              </div>
              {selectedEvent.startTime && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span>{selectedEvent.projectName}</span>
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectCalendar;

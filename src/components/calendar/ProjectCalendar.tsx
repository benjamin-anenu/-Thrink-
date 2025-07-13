
import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, Users, Target, Filter
} from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'milestone' | 'deadline' | 'meeting' | 'task' | 'project-start' | 'project-end';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  project?: string;
  attendees?: number;
  status?: 'completed' | 'in-progress' | 'pending' | 'overdue';
  description?: string;
}

const ProjectCalendar: React.FC = () => {
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Sample events data
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Project Alpha Kickoff',
      start: new Date(2024, 2, 15, 9, 0),
      end: new Date(2024, 2, 15, 10, 30),
      type: 'project-start',
      priority: 'High',
      project: 'Project Alpha',
      attendees: 8,
      status: 'completed'
    },
    {
      id: '2',
      title: 'Design Review Milestone',
      start: new Date(2024, 2, 22, 14, 0),
      end: new Date(2024, 2, 22, 16, 0),
      type: 'milestone',
      priority: 'Medium',
      project: 'E-commerce Platform',
      status: 'in-progress'
    },
    // ... more events
  ];

  const getEventVariant = (type: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (type) {
      case 'milestone': return 'success';
      case 'deadline': return 'error';
      case 'meeting': return 'info';
      case 'task': return 'warning';
      case 'project-start':
      case 'project-end': return 'info';
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

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = 'hsl(var(--primary))';
    let borderColor = 'hsl(var(--primary))';
    
    switch (event.type) {
      case 'milestone':
        backgroundColor = 'hsl(var(--success))';
        borderColor = 'hsl(var(--success))';
        break;
      case 'deadline':
        backgroundColor = 'hsl(var(--error))';
        borderColor = 'hsl(var(--error))';
        break;
      case 'meeting':
        backgroundColor = 'hsl(var(--info))';
        borderColor = 'hsl(var(--info))';
        break;
      case 'task':
        backgroundColor = 'hsl(var(--warning))';
        borderColor = 'hsl(var(--warning))';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'hsl(var(--primary-foreground))',
        border: '1px solid',
        borderRadius: '4px',
        opacity: event.status === 'completed' ? 0.7 : 1,
      }
    };
  };

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(event => event.type === filterType);

  const eventTypes = ['all', 'milestone', 'deadline', 'meeting', 'task', 'project-start', 'project-end'];

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

      {/* Calendar */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="calendar-container" style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              view={currentView}
              onView={setCurrentView}
              date={currentDate}
              onNavigate={setCurrentDate}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={setSelectedEvent}
              views={['month', 'week', 'day', 'agenda']}
              className="bg-background text-foreground"
              components={{
                toolbar: ({ label, onNavigate, onView, view }) => (
                  <div className="flex items-center justify-between mb-4 p-4 bg-surface-muted rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigate('PREV')}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigate('TODAY')}
                      >
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigate('NEXT')}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <h2 className="text-xl font-semibold">{label}</h2>
                    
                    <div className="flex gap-1">
                      {['month', 'week', 'day', 'agenda'].map(viewName => (
                        <Button
                          key={viewName}
                          variant={view === viewName ? "default" : "outline"}
                          size="sm"
                          onClick={() => onView(viewName)}
                          className="capitalize"
                        >
                          {viewName}
                        </Button>
                      ))}
                    </div>
                  </div>
                )
              }}
            />
          </div>
        </CardContent>
      </Card>

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
                {selectedEvent.type.replace('-', ' ')}
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
                <span>{moment(selectedEvent.start).format('MMMM D, YYYY')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {moment(selectedEvent.start).format('h:mm A')} - {moment(selectedEvent.end).format('h:mm A')}
                </span>
              </div>
              {selectedEvent.project && (
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.project}</span>
                </div>
              )}
              {selectedEvent.attendees && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.attendees} attendees</span>
                </div>
              )}
            </div>

            {selectedEvent.description && (
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectCalendar;

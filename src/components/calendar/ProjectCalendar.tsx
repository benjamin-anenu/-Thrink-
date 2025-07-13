
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ChevronLeft, ChevronRight, Search, Plus, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

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

interface ProjectCalendarProps {
  events: CalendarEvent[];
  onCreateEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const ProjectCalendar: React.FC<ProjectCalendarProps> = ({ events, onCreateEvent, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');

  const eventTypes = [
    { value: 'call', label: 'Calls', color: 'bg-blue-500' },
    { value: 'meeting', label: 'Meetings', color: 'bg-green-500' },
    { value: 'deadline', label: 'Deadlines', color: 'bg-red-500' },
    { value: 'milestone', label: 'Milestones', color: 'bg-purple-500' },
    { value: 'review', label: 'Reviews', color: 'bg-orange-500' }
  ];

  const projects = [
    { id: 'proj-1', name: 'E-commerce Platform' },
    { id: 'proj-2', name: 'Mobile App Redesign' },
    { id: 'proj-3', name: 'AI Integration Project' }
  ];

  const getEventTypeConfig = (type: string) => {
    return eventTypes.find(et => et.value === type) || eventTypes[0];
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesProject = filterProject === 'all' || event.projectId === filterProject;
    
    return matchesSearch && matchesType && matchesProject;
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => isSameDay(event.date, date));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const CalendarGrid = () => (
    <div className="grid grid-cols-7 gap-1">
      {/* Header */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground">
          {day}
        </div>
      ))}
      
      {/* Days */}
      {monthDays.map(day => {
        const dayEvents = getEventsForDate(day);
        const isToday = isSameDay(day, new Date());
        
        return (
          <div
            key={day.toISOString()}
            className={`min-h-[100px] p-2 border rounded-lg ${
              isSameMonth(day, currentDate) ? 'bg-background' : 'bg-muted/30'
            } ${isToday ? 'ring-2 ring-primary' : ''}`}
          >
            <div className="font-medium text-sm mb-1">
              {format(day, 'd')}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 2).map(event => {
                const typeConfig = getEventTypeConfig(event.type);
                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`text-xs p-1 rounded cursor-pointer text-white ${typeConfig.color}`}
                  >
                    {event.title}
                  </div>
                );
              })}
              {dayEvents.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{dayEvents.length - 2} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const EventsList = () => {
    const todayEvents = filteredEvents.filter(event => isSameDay(event.date, new Date()));
    const upcomingEvents = filteredEvents.filter(event => event.date > new Date()).slice(0, 5);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">Today's Events</h3>
          {todayEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No events today</p>
          ) : (
            <div className="space-y-2">
              {todayEvents.map(event => {
                const typeConfig = getEventTypeConfig(event.type);
                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${typeConfig.color}`} />
                      <span className="font-medium">{event.title}</span>
                      <Badge variant="outline">{typeConfig.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {event.startTime && `${event.startTime} - ${event.endTime}`}
                      {event.location && ` • ${event.location}`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-medium mb-3">Upcoming Events</h3>
          {upcomingEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No upcoming events</p>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map(event => {
                const typeConfig = getEventTypeConfig(event.type);
                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${typeConfig.color}`} />
                      <span className="font-medium">{event.title}</span>
                      <Badge variant="outline">{format(event.date, 'MMM d')}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.projectName}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Project Calendar
            </CardTitle>
            <Button onClick={() => onCreateEvent({
              title: '',
              description: '',
              type: 'meeting',
              date: new Date(),
              projectId: 'proj-1',
              projectName: 'E-commerce Platform'
            })}>
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {eventTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Views */}
      <Tabs value={view} onValueChange={(v) => setView(v as 'month' | 'week' | 'day')}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold text-lg min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="month" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <CalendarGrid />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center text-muted-foreground">
                Week view coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="day" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center text-muted-foreground">
                    Day view coming soon...
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <EventsList />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Event Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {eventTypes.map(type => (
              <div key={type.value} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${type.color}`} />
                <span className="text-sm">{type.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectCalendar;

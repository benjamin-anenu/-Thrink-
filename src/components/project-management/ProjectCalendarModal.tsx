import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Clock, Users, AlertTriangle, Calendar } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useWorkspaceTasksCalendar } from '@/hooks/useWorkspaceTasksCalendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

interface ProjectCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

const ProjectCalendarModal: React.FC<ProjectCalendarModalProps> = ({ 
  isOpen, 
  onClose, 
  projectId,
  projectName 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showFilter, setShowFilter] = useState<'all' | 'project' | 'workspace'>('all');
  const { events: projectEvents, loading: projectLoading } = useCalendarEvents(projectId);
  const { events: workspaceEvents, loading: workspaceLoading } = useWorkspaceTasksCalendar(projectId);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Combine project events and workspace task events
  const allEvents = [...projectEvents, ...workspaceEvents];
  const loading = projectLoading || workspaceLoading;

  // Filter events based on the current filter
  const filteredEvents = allEvents.filter(event => {
    if (showFilter === 'project') {
      return 'projectId' in event ? event.projectId === projectId : true;
    }
    if (showFilter === 'workspace') {
      return 'projectId' in event ? event.projectId !== projectId : false;
    }
    return true; // 'all'
  });

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => 
      isSameDay(new Date(event.date), date)
    );
  };

  const getEventVariant = (event: any) => {
    if ('type' in event) {
      // Workspace task event
      if (event.isConflict) return 'destructive';
      if (event.type === 'task-deadline') return 'destructive';
      if (event.type === 'task-start') return 'secondary';
    }
    return 'default';
  };

  const getEventIcon = (event: any) => {
    if ('type' in event) {
      if (event.isConflict) return <AlertTriangle className="h-3 w-3" />;
      if (event.type === 'task-deadline') return <Clock className="h-3 w-3" />;
      if (event.type === 'task-start') return <Calendar className="h-3 w-3" />;
    }
    return <Calendar className="h-3 w-3" />;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {projectName} - Project Calendar
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-6 h-[600px]">
          {/* Calendar Section */}
          <div className="flex-1">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthDays.map(date => {
                const dayEvents = getEventsForDate(date);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleDateSelect(date)}
                    className={`
                      p-2 min-h-[60px] border border-border rounded-md text-left hover:bg-accent relative
                      ${!isSameMonth(date, currentDate) ? 'text-muted-foreground bg-muted/30' : ''}
                      ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                      ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                    `}
                  >
                    <div className="text-sm font-medium mb-1">
                      {format(date, 'd')}
                    </div>
                    {dayEvents.length > 0 && (
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event, index) => (
                          <div
                            key={index}
                            className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Events Sidebar */}
          <div className="w-80 border-l border-border pl-6">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Workspace Calendar'}
                </h3>
              </div>
              
              {/* Filter Controls */}
              <div className="flex gap-2">
                <Button
                  variant={showFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={showFilter === 'project' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowFilter('project')}
                >
                  This Project
                </Button>
                <Button
                  variant={showFilter === 'workspace' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowFilter('workspace')}
                >
                  Other Projects
                </Button>
              </div>

              {/* Legend */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-secondary-foreground" />
                  <span>Task Start</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-orange-600" />
                  <span>Task Deadline</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                  <span>Resource Conflict</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[400px]">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading events...
                </div>
              ) : (
                <>
                  {(selectedDate ? getEventsForDate(selectedDate) : filteredEvents).map((event, index) => (
                    <div key={index} className="p-3 border border-border rounded-md">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2">
                          {getEventIcon(event)}
                          <div>
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            {'projectName' in event && (
                              <p className="text-xs text-muted-foreground">{event.projectName}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant={getEventVariant(event)} className="text-xs">
                          {'priority' in event ? event.priority : event.type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {'status' in event && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">Status:</span>
                            <span className="text-xs">{event.status}</span>
                          </div>
                        )}
                        
                        {'assignedResources' in event && event.assignedResources.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span className="text-xs">{event.assignedResources.length} resource(s)</span>
                          </div>
                        )}

                        {event.startTime && event.endTime && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">
                              {event.startTime} - {event.endTime}
                            </span>
                          </div>
                        )}
                        
                        {'location' in event && event.location && (
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span className="text-xs">{event.location}</span>
                          </div>
                        )}
                        
                        {event.description && (
                          <p className="mt-2 text-xs">{event.description}</p>
                        )}

                        {'isConflict' in event && event.isConflict && (
                          <div className="mt-2 p-2 bg-destructive/10 rounded text-xs">
                            <span className="font-medium text-destructive">Resource Conflict:</span>
                            <span className="text-muted-foreground ml-1">
                              Overlaps with current project tasks
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {(selectedDate ? getEventsForDate(selectedDate) : filteredEvents).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {selectedDate ? 'No events on this date' : 'No events found'}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCalendarModal;

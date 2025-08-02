import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { format, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
  
  const { events, loading, allWorkspaceEvents } = useCalendarEvents(projectId, true);

  // Color coding for different event types
  const getEventColor = (event: any) => {
    if (event.project_id === projectId) {
      return 'bg-blue-500 text-white'; // Current project tasks - blue
    }
    return 'bg-orange-500 text-white'; // Other projects - orange
  };

  // Get events for selected date
  const getEventsForDate = (date: Date) => {
    return allWorkspaceEvents.filter(event => 
      isSameDay(new Date(event.start_date), date)
    );
  };

  // Get conflicts for current project on selected date
  const getConflictsForDate = (date: Date) => {
    const dateEvents = getEventsForDate(date);
    const currentProjectEvents = dateEvents.filter(e => e.project_id === projectId);
    const otherProjectEvents = dateEvents.filter(e => e.project_id !== projectId);
    
    return {
      hasConflicts: currentProjectEvents.length > 0 && otherProjectEvents.length > 0,
      currentProjectEvents,
      otherProjectEvents,
      totalEvents: dateEvents.length
    };
  };

  // Custom day renderer for the calendar
  const renderDay = (date: Date) => {
    const conflicts = getConflictsForDate(date);
    const hasCurrentProject = conflicts.currentProjectEvents.length > 0;
    const hasOtherProjects = conflicts.otherProjectEvents.length > 0;
    
    let className = "relative w-full h-full flex items-center justify-center";
    
    if (hasCurrentProject && hasOtherProjects) {
      className += " bg-red-100 border-2 border-red-500"; // Conflicts
    } else if (hasCurrentProject) {
      className += " bg-blue-100 border border-blue-300"; // Current project only
    } else if (hasOtherProjects) {
      className += " bg-orange-100 border border-orange-300"; // Other projects only
    }
    
    return (
      <div className={className}>
        <span>{format(date, 'd')}</span>
        {conflicts.totalEvents > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {conflicts.totalEvents}
          </div>
        )}
      </div>
    );
  };

  const selectedDateConflicts = selectedDate ? getConflictsForDate(selectedDate) : null;

  const navigateMonth = (direction: 'prev' | 'next') => {
    setDisplayMonth(prev => 
      direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Project Calendar - {projectName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg">
                  {format(displayMonth, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={displayMonth}
                  onMonthChange={setDisplayMonth}
                  className="rounded-md border"
                  components={{
                    Day: ({ date }) => (
                      <button
                        className="w-full h-10 text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={() => setSelectedDate(date)}
                      >
                        {renderDay(date)}
                      </button>
                    )
                  }}
                />
                
                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                    <span>Current Project Tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
                    <span>Other Project Tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
                    <span>Conflicts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Date Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate && selectedDateConflicts ? (
                  <div className="space-y-4">
                    {/* Conflict Warning */}
                    {selectedDateConflicts.hasConflicts && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-800 font-medium">
                          Schedule Conflict Detected!
                        </span>
                      </div>
                    )}

                    {/* Current Project Events */}
                    {selectedDateConflicts.currentProjectEvents.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-blue-700">
                          {projectName} Tasks ({selectedDateConflicts.currentProjectEvents.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedDateConflicts.currentProjectEvents.map((event, index) => (
                            <div key={index} className="p-2 bg-blue-50 rounded border border-blue-200">
                              <div className="font-medium text-sm">{event.title}</div>
                              <div className="text-xs text-gray-600 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(event.start_date), 'HH:mm')} - 
                                {format(new Date(event.end_date), 'HH:mm')}
                              </div>
                              {event.description && (
                                <div className="text-xs text-gray-600 mt-1">{event.description}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Other Projects Events */}
                    {selectedDateConflicts.otherProjectEvents.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-orange-700">
                          Other Projects ({selectedDateConflicts.otherProjectEvents.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedDateConflicts.otherProjectEvents.map((event, index) => (
                            <div key={index} className="p-2 bg-orange-50 rounded border border-orange-200">
                              <div className="font-medium text-sm">{event.title}</div>
                              <div className="text-xs text-gray-600">{event.project_name || 'Unknown Project'}</div>
                              <div className="text-xs text-gray-600 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(event.start_date), 'HH:mm')} - 
                                {format(new Date(event.end_date), 'HH:mm')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Events */}
                    {selectedDateConflicts.totalEvents === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No tasks scheduled for this date</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Select a date to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Calendar Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Events</span>
                  <Badge variant="secondary">{allWorkspaceEvents.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Current Project</span>
                  <Badge variant="secondary">
                    {events.length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Other Projects</span>
                  <Badge variant="secondary">
                    {allWorkspaceEvents.length - events.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCalendarModal;

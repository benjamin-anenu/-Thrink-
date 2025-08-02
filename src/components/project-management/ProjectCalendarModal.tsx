import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Clock, Users } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

interface ProjectCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

const ProjectCalendarModal: React.FC<ProjectCalendarModalProps> = ({ isOpen, onClose, projectId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const { events, loading, allWorkspaceEvents } = useCalendarEvents(projectId, true);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.start_date), date)
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Project Calendar</DialogTitle>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'All Events'}
              </h3>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[500px]">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading events...
                </div>
              ) : (
                <>
                  {(selectedDate ? getEventsForDate(selectedDate) : events).map((event, index) => (
                    <div key={index} className="p-3 border border-border rounded-md">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {event.event_type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(new Date(event.start_date), 'h:mm a')} - 
                            {format(new Date(event.end_date), 'h:mm a')}
                          </span>
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        
                        {event.description && (
                          <p className="mt-2 text-xs">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {(selectedDate ? getEventsForDate(selectedDate) : events).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {selectedDate ? 'No events on this date' : 'No events scheduled'}
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

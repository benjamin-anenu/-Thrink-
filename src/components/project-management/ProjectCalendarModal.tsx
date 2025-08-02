
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, AlertTriangle, Clock, Target } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useProject } from '@/contexts/ProjectContext';
import { format, isSameDay, parseISO } from 'date-fns';

interface ProjectCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export const ProjectCalendarModal: React.FC<ProjectCalendarModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { events } = useCalendarEvents();
  const { projects } = useProject();

  // Get all events for the workspace (not just current project)
  const allEvents = events;
  
  // Separate current project events from other project events
  const currentProjectEvents = allEvents.filter(event => event.projectId === projectId);
  const otherProjectEvents = allEvents.filter(event => event.projectId !== projectId);

  // Create project color mapping
  const projectColors = useMemo(() => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
    const colorMap: Record<string, string> = {};
    
    projects.forEach((project, index) => {
      if (project.id === projectId) {
        colorMap[project.id] = 'bg-primary'; // Current project in primary color
      } else {
        colorMap[project.id] = colors[index % colors.length];
      }
    });
    
    return colorMap;
  }, [projects, projectId]);

  // Get events for selected date
  const selectedDateEvents = selectedDate ? [
    ...currentProjectEvents.filter(event => isSameDay(event.date, selectedDate)),
    ...otherProjectEvents.filter(event => isSameDay(event.date, selectedDate))
  ] : [];

  // Check if date has events
  const hasEvents = (date: Date) => {
    return allEvents.some(event => isSameDay(event.date, date));
  };

  // Check if date has conflicts (multiple projects)
  const hasConflicts = (date: Date) => {
    const dateEvents = allEvents.filter(event => isSameDay(event.date, date));
    const projectIds = new Set(dateEvents.map(event => event.projectId));
    return projectIds.size > 1;
  };

  // Custom day renderer for calendar
  const renderDay = (date: Date) => {
    const dayEvents = allEvents.filter(event => isSameDay(event.date, date));
    const hasCurrentProject = dayEvents.some(event => event.projectId === projectId);
    const hasOtherProjects = dayEvents.some(event => event.projectId !== projectId);
    const isConflict = hasCurrentProject && hasOtherProjects;

    if (dayEvents.length === 0) return null;

    return (
      <div className="absolute bottom-0 right-0 flex gap-1">
        {hasCurrentProject && (
          <div className="w-2 h-2 rounded-full bg-primary"></div>
        )}
        {hasOtherProjects && (
          <div className={`w-2 h-2 rounded-full ${isConflict ? 'bg-destructive' : 'bg-orange-500'}`}></div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Project Calendar - {projectName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar View */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Calendar View</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span>Current Project</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>Other Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <span>Conflicts</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  components={{
                    Day: ({ date, ...props }) => (
                      <div className="relative">
                        <button {...props} />
                        {renderDay(date)}
                      </div>
                    )
                  }}
                />
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {projects.map(project => {
                  const projectEventCount = allEvents.filter(e => e.projectId === project.id).length;
                  if (projectEventCount === 0) return null;
                  
                  return (
                    <div key={project.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${projectColors[project.id]}`}></div>
                        <span className={project.id === projectId ? 'font-semibold' : ''}>{project.name}</span>
                      </div>
                      <Badge variant="outline">{projectEventCount} events</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            {selectedDate ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Events on {format(selectedDate, 'MMMM d, yyyy')}</span>
                    {hasConflicts(selectedDate) && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Conflict
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedDateEvents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No events on this date</p>
                  ) : (
                    selectedDateEvents.map((event, index) => {
                      const eventProject = projects.find(p => p.id === event.projectId);
                      const isCurrentProject = event.projectId === projectId;
                      
                      return (
                        <div
                          key={`${event.id}-${index}`}
                          className={`p-3 rounded-lg border ${
                            isCurrentProject ? 'bg-primary/10 border-primary/20' : 'bg-muted/50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{event.title}</h4>
                            <div className="flex items-center gap-2">
                              {event.type === 'milestone' && <Target className="h-4 w-4 text-primary" />}
                              {event.type !== 'milestone' && <Clock className="h-4 w-4 text-muted-foreground" />}
                              <Badge 
                                variant={isCurrentProject ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {eventProject?.name || 'Unknown Project'}
                              </Badge>
                            </div>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="capitalize">{event.type}</span>
                            {event.startTime && event.endTime && (
                              <span>{event.startTime} - {event.endTime}</span>
                            )}
                            {event.location && (
                              <span>{event.location}</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a date to view events and conflicts</p>
                </CardContent>
              </Card>
            )}

            {/* Conflict Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Potential Conflicts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const conflictDates = allEvents.reduce((acc, event) => {
                    const dateKey = format(event.date, 'yyyy-MM-dd');
                    if (!acc[dateKey]) acc[dateKey] = [];
                    acc[dateKey].push(event);
                    return acc;
                  }, {} as Record<string, typeof allEvents>);

                  const conflicts = Object.entries(conflictDates)
                    .filter(([_, events]) => {
                      const projectIds = new Set(events.map(e => e.projectId));
                      return projectIds.size > 1;
                    })
                    .slice(0, 5); // Show only first 5 conflicts

                  return conflicts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No conflicts detected</p>
                  ) : (
                    <div className="space-y-2">
                      {conflicts.map(([dateKey, events]) => (
                        <div
                          key={dateKey}
                          className="p-2 rounded border bg-destructive/5 cursor-pointer hover:bg-destructive/10"
                          onClick={() => setSelectedDate(parseISO(dateKey))}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{format(parseISO(dateKey), 'MMM d, yyyy')}</span>
                            <Badge variant="outline">{events.length} events</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Set(events.map(e => e.projectName)).size} projects affected
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

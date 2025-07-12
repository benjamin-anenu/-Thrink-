
import React from 'react';
import { addDays, format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface GanttTimelineProps {
  startDate: Date;
  endDate: Date;
  viewMode: 'day' | 'week' | 'month';
}

const GanttTimeline: React.FC<GanttTimelineProps> = ({ startDate, endDate, viewMode }) => {
  const generateTimelineDays = () => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return days;
  };

  const days = generateTimelineDays();

  return (
    <div className="flex border-b border-border pb-2 mb-4">
      <div className="w-80 flex-shrink-0 text-sm font-medium text-muted-foreground">Task</div>
      <div className="flex-1 grid gap-px" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(30px, 1fr))` }}>
        {days.map((day, index) => (
          <div key={index} className="text-xs text-center text-muted-foreground p-1 border-r border-border/30">
            {format(day, 'd')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GanttTimeline;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Users, Clock } from 'lucide-react';

interface GanttTask {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  assignees: number;
  dependencies?: string[];
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
}

interface GanttChartProps {
  tasks: GanttTask[];
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const generateTimelineData = () => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const days = [];
    
    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  const getTaskPosition = (task: GanttTask, days: Date[]) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const monthStart = days[0];
    const monthEnd = days[days.length - 1];

    const startPos = Math.max(0, Math.floor((taskStart.getTime() - monthStart.getTime()) / (24 * 60 * 60 * 1000)));
    const endPos = Math.min(days.length - 1, Math.floor((taskEnd.getTime() - monthStart.getTime()) / (24 * 60 * 60 * 1000)));
    
    return { startPos, endPos, width: Math.max(1, endPos - startPos + 1) };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const days = generateTimelineData();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Gantt Chart
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Timeline Header */}
            <div className="flex border-b border-border pb-2 mb-4">
              <div className="w-64 flex-shrink-0 text-sm font-medium text-muted-foreground">Task</div>
              <div className="flex-1 grid grid-cols-31 gap-px">
                {days.map((day, index) => (
                  <div key={index} className="text-xs text-center text-muted-foreground p-1">
                    {day.getDate()}
                  </div>
                ))}
              </div>
            </div>

            {/* Task Rows */}
            <div className="space-y-3">
              {tasks.map((task) => {
                const { startPos, width } = getTaskPosition(task, days);
                return (
                  <div key={task.id} className="flex items-center">
                    {/* Task Info */}
                    <div className="w-64 flex-shrink-0 pr-4">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{task.name}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)} text-white`}>
                            {task.priority}
                          </Badge>
                          <Badge variant="secondary" className={`text-xs ${getStatusColor(task.status)}`}>
                            {task.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {task.assignees}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.progress}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Bar */}
                    <div className="flex-1 relative h-8">
                      <div className="grid grid-cols-31 gap-px h-full">
                        {days.map((_, index) => (
                          <div key={index} className="border-r border-border/30 h-full"></div>
                        ))}
                      </div>
                      <div 
                        className={`absolute top-1 h-6 ${getPriorityColor(task.priority)} rounded-md flex items-center justify-center text-white text-xs font-medium`}
                        style={{
                          left: `${(startPos / days.length) * 100}%`,
                          width: `${(width / days.length) * 100}%`
                        }}
                      >
                        {task.progress}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GanttChart;

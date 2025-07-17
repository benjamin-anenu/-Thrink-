
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Plus, Filter, Download } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: string;
  assignee_id?: string;
  dependencies?: string[];
}

interface ProjectGanttChartProps {
  projectId: string;
}

const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({ projectId }) => {
  const { getProject } = useProject();
  const { currentWorkspace } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const project = getProject(projectId);

  useEffect(() => {
    const loadTasks = async () => {
      if (!project) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('project_tasks')
          .select('*')
          .eq('project_id', projectId)
          .order('start_date');

        if (error) throw error;

        setTasks(data || []);
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [projectId, project]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'in progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateDateRange = () => {
    if (tasks.length === 0) return { start: new Date(), end: new Date() };
    
    const dates = tasks.flatMap(task => [
      new Date(task.start_date),
      new Date(task.end_date)
    ]);
    
    return {
      start: new Date(Math.min(...dates.map(d => d.getTime()))),
      end: new Date(Math.max(...dates.map(d => d.getTime())))
    };
  };

  const { start: projectStart, end: projectEnd } = calculateDateRange();
  const totalDays = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)) || 1;

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.end_date);
    const startOffset = Math.max(0, (taskStart.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
  };

  if (!project) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Project not found
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentWorkspace || project.workspace_id !== currentWorkspace.id) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Project not accessible in current workspace
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{project.name} - Gantt Chart</h2>
          <p className="text-muted-foreground">Visual timeline of project tasks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Gantt Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline View</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found for this project
            </div>
          ) : (
            <div className="space-y-4">
              {/* Timeline Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="w-64 font-medium">Task Name</div>
                <div className="flex-1 flex items-center justify-between text-sm text-muted-foreground px-4">
                  <span>{projectStart.toLocaleDateString()}</span>
                  <span>{projectEnd.toLocaleDateString()}</span>
                </div>
                <div className="w-20 text-center font-medium">Progress</div>
              </div>

              {/* Task Rows */}
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center group hover:bg-muted/50 p-2 rounded">
                  <div className="w-64 pr-4">
                    <div className="font-medium truncate">{task.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(task.start_date).toLocaleDateString()} - 
                      {new Date(task.end_date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex-1 relative h-8 bg-muted rounded mx-4">
                    <div
                      className={`absolute top-1 bottom-1 rounded ${getStatusColor(task.status)} opacity-80`}
                      style={getTaskPosition(task)}
                    >
                      <div className="h-full relative">
                        <div 
                          className="absolute top-0 left-0 h-full bg-white/30 rounded"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-20 text-center">
                    <Badge variant="outline" className="text-xs">
                      {task.progress}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="font-semibold">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="font-semibold">
                  {tasks.filter(t => t.status.toLowerCase() === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="font-semibold">
                  {tasks.filter(t => t.status.toLowerCase() === 'in progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="font-semibold">
                  {tasks.filter(t => new Date(t.end_date) < new Date() && t.status.toLowerCase() !== 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectGanttChart;

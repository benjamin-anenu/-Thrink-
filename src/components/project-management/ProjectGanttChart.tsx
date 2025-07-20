
import React, { useState, useEffect } from 'react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, ListChecks } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectTask } from '@/types/project';

interface ProjectGanttChartProps {
  projectId: string;
}

const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({ projectId }) => {
  const { tasks, milestones, loading, createTask } = useTaskManagement(projectId);
  const [quickTask, setQuickTask] = useState({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    status: 'Not Started'
  });

  const handleQuickTaskAdd = async () => {
    if (!quickTask.name.trim()) return;

    try {
      const newTask: Omit<ProjectTask, 'id'> = {
        name: quickTask.name,
        description: quickTask.description,
        startDate: quickTask.startDate,
        endDate: quickTask.endDate,
        baselineStartDate: quickTask.startDate,
        baselineEndDate: quickTask.endDate,
        priority: quickTask.priority as 'Low' | 'Medium' | 'High' | 'Critical',
        status: quickTask.status as 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled',
        progress: 0,
        duration: 1,
        hierarchyLevel: 0,
        sortOrder: 0,
        assignedResources: [],
        assignedStakeholders: [],
        dependencies: [],
        project_id: projectId
      };

      await createTask(newTask);
      setQuickTask({
        name: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        priority: 'Medium',
        status: 'Not Started'
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          Gantt Chart
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Task Add */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="taskName">Task Name</Label>
            <Input
              type="text"
              id="taskName"
              placeholder="Enter task name"
              value={quickTask.name}
              onChange={(e) => setQuickTask({ ...quickTask, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              type="date"
              id="startDate"
              value={quickTask.startDate}
              onChange={(e) => setQuickTask({ ...quickTask, startDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              type="date"
              id="endDate"
              value={quickTask.endDate}
              onChange={(e) => setQuickTask({ ...quickTask, endDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={quickTask.priority} onValueChange={(value) => setQuickTask({ ...quickTask, priority: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleQuickTaskAdd} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>

        {/* Gantt Chart Visualization (Placeholder) */}
        <div>
          <p className="text-muted-foreground">
            Gantt chart visualization will be implemented here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectGanttChart;

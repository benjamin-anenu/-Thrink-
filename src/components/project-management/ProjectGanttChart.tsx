
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, ChevronLeft, ChevronRight, Users, Clock, Plus, Edit, Trash2 } from 'lucide-react';

interface ProjectTask {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  assignedResources: string[];
  assignedStakeholders: string[];
  dependencies: string[];
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  description?: string;
  parentTask?: string;
}

interface ProjectGanttChartProps {
  projectId: string;
}

const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({ projectId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [newTask, setNewTask] = useState<Partial<ProjectTask>>({
    name: '',
    startDate: '',
    endDate: '',
    progress: 0,
    priority: 'Medium',
    status: 'Not Started',
    assignedResources: [],
    assignedStakeholders: [],
    dependencies: [],
    description: ''
  });

  // Mock data - in real app, this would be fetched from API
  const [tasks, setTasks] = useState<ProjectTask[]>([
    {
      id: '1',
      name: 'Project Planning & Setup',
      startDate: '2024-01-15',
      endDate: '2024-01-25',
      progress: 100,
      assignedResources: ['sarah', 'david'],
      assignedStakeholders: ['john-doe'],
      dependencies: [],
      priority: 'High',
      status: 'Completed',
      description: 'Initial project setup and planning phase'
    },
    {
      id: '2',
      name: 'UI/UX Design Phase',
      startDate: '2024-01-26',
      endDate: '2024-02-15',
      progress: 85,
      assignedResources: ['emily', 'sarah'],
      assignedStakeholders: ['jane-smith'],
      dependencies: ['1'],
      priority: 'High',
      status: 'In Progress',
      description: 'Design mockups and user interface prototypes'
    },
    {
      id: '3',
      name: 'Frontend Development',
      startDate: '2024-02-16',
      endDate: '2024-03-15',
      progress: 45,
      assignedResources: ['sarah', 'michael'],
      assignedStakeholders: ['john-doe'],
      dependencies: ['2'],
      priority: 'High',
      status: 'In Progress',
      description: 'Implementation of frontend components'
    },
    {
      id: '4',
      name: 'Backend Integration',
      startDate: '2024-03-01',
      endDate: '2024-03-25',
      progress: 20,
      assignedResources: ['michael', 'james'],
      assignedStakeholders: ['jane-smith'],
      dependencies: ['2'],
      priority: 'Medium',
      status: 'In Progress',
      description: 'API integration and backend functionality'
    }
  ]);

  // Mock resources and stakeholders - in real app, fetched from respective APIs
  const availableResources = [
    { id: 'sarah', name: 'Sarah Johnson', role: 'Frontend Developer' },
    { id: 'michael', name: 'Michael Chen', role: 'Backend Developer' },
    { id: 'emily', name: 'Emily Rodriguez', role: 'UX Designer' },
    { id: 'david', name: 'David Kim', role: 'Project Manager' },
    { id: 'james', name: 'James Wilson', role: 'DevOps Engineer' }
  ];

  const availableStakeholders = [
    { id: 'john-doe', name: 'John Doe', role: 'Product Manager' },
    { id: 'jane-smith', name: 'Jane Smith', role: 'Business Analyst' },
    { id: 'mike-wilson', name: 'Mike Wilson', role: 'Tech Lead' }
  ];

  const generateTimelineData = () => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const days = [];
    
    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  const getTaskPosition = (task: ProjectTask, days: Date[]) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const monthStart = days[0];

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

  const handleCreateTask = () => {
    if (newTask.name && newTask.startDate && newTask.endDate) {
      const task: ProjectTask = {
        id: Date.now().toString(),
        name: newTask.name,
        startDate: newTask.startDate,
        endDate: newTask.endDate,
        progress: newTask.progress || 0,
        assignedResources: newTask.assignedResources || [],
        assignedStakeholders: newTask.assignedStakeholders || [],
        dependencies: newTask.dependencies || [],
        priority: newTask.priority as 'High' | 'Medium' | 'Low',
        status: newTask.status as 'Not Started' | 'In Progress' | 'Completed' | 'On Hold',
        description: newTask.description || ''
      };
      
      setTasks([...tasks, task]);
      setNewTask({
        name: '',
        startDate: '',
        endDate: '',
        progress: 0,
        priority: 'Medium',
        status: 'Not Started',
        assignedResources: [],
        assignedStakeholders: [],
        dependencies: [],
        description: ''
      });
      setShowTaskDialog(false);
    }
  };

  const handleEditTask = (task: ProjectTask) => {
    setEditingTask(task);
    setNewTask(task);
    setShowTaskDialog(true);
  };

  const handleUpdateTask = () => {
    if (editingTask && newTask.name && newTask.startDate && newTask.endDate) {
      const updatedTasks = tasks.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...newTask } as ProjectTask
          : task
      );
      setTasks(updatedTasks);
      setEditingTask(null);
      setNewTask({
        name: '',
        startDate: '',
        endDate: '',
        progress: 0,
        priority: 'Medium',
        status: 'Not Started',
        assignedResources: [],
        assignedStakeholders: [],
        dependencies: [],
        description: ''
      });
      setShowTaskDialog(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const days = generateTimelineData();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Interactive Gantt Chart
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTask ? 'Edit Task' : 'Create New Task'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="taskName">Task Name</Label>
                        <Input
                          id="taskName"
                          value={newTask.name || ''}
                          onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                          placeholder="Enter task name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newTask.startDate || ''}
                          onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newTask.endDate || ''}
                          onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={newTask.priority || 'Medium'} onValueChange={(value) => setNewTask({ ...newTask, priority: value as any })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={newTask.status || 'Not Started'} onValueChange={(value) => setNewTask({ ...newTask, status: value as any })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="On Hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="progress">Progress (%)</Label>
                        <Input
                          id="progress"
                          type="number"
                          min="0"
                          max="100"
                          value={newTask.progress || 0}
                          onChange={(e) => setNewTask({ ...newTask, progress: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newTask.description || ''}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          placeholder="Task description..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={editingTask ? handleUpdateTask : handleCreateTask}>
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Timeline Header */}
              <div className="flex border-b border-border pb-2 mb-4">
                <div className="w-80 flex-shrink-0 text-sm font-medium text-muted-foreground">Task</div>
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
                      <div className="w-80 flex-shrink-0 pr-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">{task.name}</div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTask(task)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTask(task.id)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
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
                              {task.assignedResources.length}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.progress}%
                            </div>
                          </div>
                          {task.assignedResources.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Resources: {task.assignedResources.map(resourceId => 
                                availableResources.find(r => r.id === resourceId)?.name
                              ).join(', ')}
                            </div>
                          )}
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
                          className={`absolute top-1 h-6 ${getPriorityColor(task.priority)} rounded-md flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity`}
                          style={{
                            left: `${(startPos / days.length) * 100}%`,
                            width: `${(width / days.length) * 100}%`
                          }}
                          onClick={() => handleEditTask(task)}
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
    </div>
  );
};

export default ProjectGanttChart;

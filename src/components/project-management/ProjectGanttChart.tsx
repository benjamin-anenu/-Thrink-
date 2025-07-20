
import React, { useState } from 'react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, Target, CalendarIcon } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ProjectGanttChartProps {
  projectId: string;
}

const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({ projectId }) => {
  const { tasks, milestones, loading, createTask, createMilestone } = useTaskManagement(projectId);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);

  // Task creation state
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStartDate, setTaskStartDate] = useState<Date>();
  const [taskEndDate, setTaskEndDate] = useState<Date>();
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskStatus, setTaskStatus] = useState('Not Started');

  // Milestone creation state
  const [milestoneName, setMilestoneName] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');
  const [milestoneDate, setMilestoneDate] = useState<Date>();

  const handleCreateTask = async () => {
    if (!taskName.trim()) {
      toast.error('Task name is required');
      return;
    }

    try {
      await createTask({
        name: taskName,
        description: taskDescription,
        startDate: taskStartDate ? taskStartDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: taskEndDate ? taskEndDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        priority: taskPriority as any,
        status: taskStatus as any,
        progress: 0,
        duration: 1,
        assignedResources: [],
        assignedStakeholders: [],
        dependencies: []
      });

      toast.success('Task created successfully');
      setShowTaskDialog(false);
      // Reset form
      setTaskName('');
      setTaskDescription('');
      setTaskStartDate(undefined);
      setTaskEndDate(undefined);
      setTaskPriority('Medium');
      setTaskStatus('Not Started');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleCreateMilestone = async () => {
    if (!milestoneName.trim()) {
      toast.error('Milestone name is required');
      return;
    }

    try {
      await createMilestone({
        name: milestoneName,
        description: milestoneDescription,
        date: milestoneDate ? milestoneDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        baselineDate: milestoneDate ? milestoneDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: 'upcoming' as any,
        progress: 0,
        tasks: []
      });

      toast.success('Milestone created successfully');
      setShowMilestoneDialog(false);
      // Reset form
      setMilestoneName('');
      setMilestoneDescription('');
      setMilestoneDate(undefined);
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast.error('Failed to create milestone');
    }
  };

  if (loading) {
    return <div>Loading Gantt chart...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with inline creation buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Gantt Chart</h2>
        <div className="flex gap-2">
          <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="taskName">Task Name</Label>
                  <Input
                    id="taskName"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="Enter task name"
                  />
                </div>
                <div>
                  <Label htmlFor="taskDescription">Description</Label>
                  <Textarea
                    id="taskDescription"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {taskStartDate ? format(taskStartDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={taskStartDate}
                          onSelect={setTaskStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {taskEndDate ? format(taskEndDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={taskEndDate}
                          onSelect={setTaskEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select value={taskPriority} onValueChange={setTaskPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={taskStatus} onValueChange={setTaskStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateTask}>Create Task</Button>
                  <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Milestone</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="milestoneName">Milestone Name</Label>
                  <Input
                    id="milestoneName"
                    value={milestoneName}
                    onChange={(e) => setMilestoneName(e.target.value)}
                    placeholder="Enter milestone name"
                  />
                </div>
                <div>
                  <Label htmlFor="milestoneDescription">Description</Label>
                  <Textarea
                    id="milestoneDescription"
                    value={milestoneDescription}
                    onChange={(e) => setMilestoneDescription(e.target.value)}
                    placeholder="Enter milestone description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {milestoneDate ? format(milestoneDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={milestoneDate}
                        onSelect={setMilestoneDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateMilestone}>Create Milestone</Button>
                  <Button variant="outline" onClick={() => setShowMilestoneDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Gantt Chart Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Tasks */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Tasks ({tasks.length})</h3>
              {tasks.length === 0 ? (
                <p className="text-muted-foreground">No tasks created yet. Click "Add Task" to get started.</p>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{task.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {task.startDate} to {task.endDate} • {task.status} • {task.progress}%
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          task.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                          task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Milestones */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Milestones ({milestones.length})</h3>
              {milestones.length === 0 ? (
                <p className="text-muted-foreground">No milestones created yet. Click "Add Milestone" to get started.</p>
              ) : (
                <div className="space-y-2">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          {milestone.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Due: {milestone.date} • {milestone.status} • {milestone.progress}%
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                          milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {milestone.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectGanttChart;

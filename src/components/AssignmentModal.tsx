import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { CalendarIcon, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId?: string;
  resourceName?: string;
}

const AssignmentModal = ({ isOpen, onClose, resourceId, resourceName }: AssignmentModalProps) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [deadline, setDeadline] = useState<Date>();
  const [description, setDescription] = useState('');

  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading, assignResourceToTask } = useTasks(selectedProjectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle new task creation logic here
    console.log('Creating new task:', {
      taskTitle,
      project: selectedProjectId,
      priority,
      estimatedHours,
      deadline,
      description,
      assignedTo: resourceId
    });
    onClose();
  };

  const handleAssignToExistingTask = async (taskId: string) => {
    if (!resourceId) return;
    
    const success = await assignResourceToTask(taskId, resourceId);
    if (success) {
      // Task will be refreshed automatically
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': case 'normal': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'in progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'on hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Assignment</DialogTitle>
        </DialogHeader>

        {resourceName && (
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{resourceName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Assigning to: {resourceName}</p>
              <p className="text-sm text-muted-foreground">Resource ID: {resourceId}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Project Selection */}
          <div>
            <Label htmlFor="project">Select Project</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a project to view tasks" />
              </SelectTrigger>
              <SelectContent>
                {projectsLoading ? (
                  <SelectItem value="loading" disabled>Loading projects...</SelectItem>
                ) : projects.length === 0 ? (
                  <SelectItem value="no-projects" disabled>No projects found</SelectItem>
                ) : (
                  projects.map(proj => (
                    <SelectItem key={proj.id} value={proj.id}>{proj.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Existing Tasks Table */}
          {selectedProjectId && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Project Tasks</h3>
                <Badge variant="outline" className="text-sm">
                  {tasks.filter(task => !task.assignee_id).length} unassigned tasks
                </Badge>
              </div>
              
              {tasksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Loading tasks...</p>
                  </div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks found for this project</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Task Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Assigned Resource</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map(task => (
                        <TableRow 
                          key={task.id} 
                          className={!task.assignee_id ? 'bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-l-yellow-400' : ''}
                        >
                          <TableCell className="font-medium">
                            <div>
                              <p className="font-medium">{task.name}</p>
                              {task.description && (
                                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getStatusColor(task.status || 'pending')}>
                              {task.status || 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getPriorityColor(task.priority || 'medium')}>
                              {task.priority || 'Medium'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {task.start_date ? new Date(task.start_date).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            {task.end_date ? new Date(task.end_date).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            {task.assignee_id ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Assigned</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium text-orange-600">Unassigned</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${task.progress || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-muted-foreground">{task.progress || 0}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {!task.assignee_id && resourceId ? (
                              <Button 
                                size="sm" 
                                onClick={() => handleAssignToExistingTask(task.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Assign
                              </Button>
                            ) : task.assignee_id === resourceId ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Assigned to {resourceName}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {task.assignee_id ? 'Already assigned' : 'No resource selected'}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* Create New Task Form */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="taskTitle">Task Title</Label>
                <Input
                  id="taskTitle"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Enter task title..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    placeholder="8"
                    min="0.5"
                    step="0.5"
                  />
                </div>
              </div>

              <div>
                <Label>Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="description">Task Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the task requirements..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create & Assign Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentModal;

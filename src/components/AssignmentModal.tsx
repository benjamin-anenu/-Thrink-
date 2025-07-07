
import React, { useState } from 'react';
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
import { format } from 'date-fns';
import { CalendarIcon, Clock, User } from 'lucide-react';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId?: string;
  resourceName?: string;
}

const AssignmentModal = ({ isOpen, onClose, resourceId, resourceName }: AssignmentModalProps) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [project, setProject] = useState('');
  const [priority, setPriority] = useState('medium');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [deadline, setDeadline] = useState<Date>();
  const [description, setDescription] = useState('');

  const projects = [
    'E-commerce Redesign',
    'Mobile App Development',
    'Infrastructure Upgrade',
    'Marketing Campaign Q2',
    'Security Audit'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle task assignment logic here
    console.log('Assigning task:', {
      taskTitle,
      project,
      priority,
      estimatedHours,
      deadline,
      description,
      assignedTo: resourceId
    });
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign New Task</DialogTitle>
        </DialogHeader>

        {resourceName && (
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar>
              <AvatarFallback>{resourceName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Assigning to: {resourceName}</p>
              <p className="text-sm text-muted-foreground">Resource ID: {resourceId}</p>
            </div>
          </div>
        )}

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
              <Label htmlFor="project">Project</Label>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(proj => (
                    <SelectItem key={proj} value={proj}>{proj}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div>
            <Label htmlFor="description">Task Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task requirements..."
              rows={4}
            />
          </div>

          {/* Task Preview */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">Task Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User size={14} />
                <span>Assigned to: {resourceName || 'Unassigned'}</span>
              </div>
              {project && (
                <div className="flex items-center gap-2">
                  <span>Project: {project}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(priority)}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                </Badge>
              </div>
              {estimatedHours && (
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>{estimatedHours} hours estimated</span>
                </div>
              )}
              {deadline && (
                <div className="flex items-center gap-2">
                  <CalendarIcon size={14} />
                  <span>Due: {format(deadline, "PPP")}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Assign Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentModal;

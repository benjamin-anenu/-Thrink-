
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar, User, Clock, Target, MessageSquare, Paperclip,
  Edit2, Save, X, Plus, Trash2, AlertCircle
} from 'lucide-react';
import { Task } from './TaskCard';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  React.useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    if (editedTask && onSave) {
      onSave(editedTask);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedTask({ ...task });
    setIsEditing(false);
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'On Hold': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityVariant = (priority: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getHealthVariant = (health: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (health) {
      case 'green': return 'success';
      case 'yellow': return 'warning';
      case 'red': return 'error';
      default: return 'default';
    }
  };

  const currentTask = isEditing ? editedTask : task;
  if (!currentTask) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editedTask?.title || ''}
                  onChange={(e) => setEditedTask(prev => prev ? { ...prev, title: e.target.value } : prev)}
                  className="text-xl font-bold border-none p-0 h-auto"
                />
              ) : (
                <DialogTitle className="text-2xl font-bold">{currentTask.title}</DialogTitle>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <StatusBadge variant={getPriorityVariant(currentTask.tag.label)}>
                {currentTask.tag.label}
              </StatusBadge>
              {currentTask.health && (
                <StatusBadge variant={getHealthVariant(currentTask.health.status)}>
                  Health: {currentTask.health.score}/100
                </StatusBadge>
              )}
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="attachments">Files</TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto">
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Task Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      {isEditing ? (
                        <Textarea
                          value={editedTask?.description || ''}
                          onChange={(e) => setEditedTask(prev => prev ? { ...prev, description: e.target.value } : prev)}
                          className="mt-1"
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm mt-1">{currentTask.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Due: {currentTask.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{currentTask.assignees} assignees</span>
                      </div>
                    </div>

                    {currentTask.project && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Project</label>
                        <p className="text-sm mt-1">{currentTask.project}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Status & Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <StatusBadge variant="info">
                        In Progress
                      </StatusBadge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Priority</span>
                      <StatusBadge variant={getPriorityVariant(currentTask.tag.label)}>
                        {currentTask.tag.label}
                      </StatusBadge>
                    </div>

                    {currentTask.health && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Health Score</span>
                          <StatusBadge variant={getHealthVariant(currentTask.health.status)}>
                            {currentTask.health.score}/100
                          </StatusBadge>
                        </div>
                        <Progress value={currentTask.health.score} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Task Progress</CardTitle>
                  <CardDescription>Track completion and milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {currentTask.progress.completed}/{currentTask.progress.total} subtasks
                        </span>
                      </div>
                      <Progress 
                        value={(currentTask.progress.completed / currentTask.progress.total) * 100} 
                        className="h-3"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-success" />
                        <span>Completed: {currentTask.progress.completed}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Remaining: {currentTask.progress.total - currentTask.progress.completed}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Comments & Discussion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-surface-muted rounded-lg">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">John Doe</span>
                          <span className="text-xs text-muted-foreground">2 hours ago</span>
                        </div>
                        <p className="text-sm">Task is progressing well, should be completed by the deadline.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input placeholder="Add a comment..." className="flex-1" />
                      <Button size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-surface-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">project-requirements.pdf</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Attachment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-between pt-4 border-t border-border">
          <div>
            {onDelete && (
              <Button variant="outline" onClick={() => onDelete(task.id)} className="text-error">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {isEditing && (
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;


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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar, User, Clock, Target, MessageSquare, Paperclip,
  Edit2, Save, X, Plus, Trash2, AlertCircle, CheckCircle,
  Bold, Italic, Underline, List, ListOrdered
} from 'lucide-react';
import { ProjectTask } from '@/types/project';

interface TaskDetailModalProps {
  task: ProjectTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (task: ProjectTask) => void;
  onDelete?: (taskId: string) => void;
  onUpdate?: (taskId: string, updates: Partial<ProjectTask>) => Promise<void>;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<ProjectTask | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [richTextContent, setRichTextContent] = useState('');

  React.useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      setRichTextContent(task.description || '');
      // Mock subtasks for demonstration
      setSubtasks([
        { id: '1', title: 'Design wireframes', completed: true, order: 1 },
        { id: '2', title: 'Create mockups', completed: true, order: 2 },
        { id: '3', title: 'Get client approval', completed: false, order: 3 },
        { id: '4', title: 'Implement frontend', completed: false, order: 4 },
        { id: '5', title: 'Testing and QA', completed: false, order: 5 }
      ]);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    if (editedTask && (onSave || onUpdate)) {
      const progress = getProgressPercentage();
      const allSubtasksCompleted = subtasks.length > 0 && subtasks.every(st => st.completed);
      
      const updatedTask = {
        ...editedTask,
        description: richTextContent,
        progress,
        status: allSubtasksCompleted ? 'Completed' as const : editedTask.status
      };

      try {
        if (onUpdate) {
          await onUpdate(editedTask.id, {
            name: updatedTask.name,
            description: updatedTask.description,
            status: updatedTask.status,
            progress: updatedTask.progress
          });
        } else if (onSave) {
          onSave(updatedTask);
        }
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to save task:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditedTask({ ...task });
    setRichTextContent(task.description || '');
    setIsEditing(false);
  };

  const getProgressPercentage = () => {
    if (subtasks.length === 0) return 0;
    const completed = subtasks.filter(st => st.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  const handleSubtaskToggle = async (subtaskId: string) => {
    setSubtasks(prev => {
      const updated = prev.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      
      // Check if all subtasks are now completed
      const allCompleted = updated.length > 0 && updated.every(st => st.completed);
      
      // Auto-update task status if all subtasks are completed
      if (allCompleted && editedTask && onUpdate) {
        const updatedTask = { ...editedTask, status: 'Completed' as const };
        setEditedTask(updatedTask);
        onUpdate(editedTask.id, { status: 'Completed' });
      }
      
      return updated;
    });
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const newTask: Subtask = {
        id: Date.now().toString(),
        title: newSubtask.trim(),
        completed: false,
        order: subtasks.length + 1
      };
      setSubtasks(prev => [...prev, newTask]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (subtaskId: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== subtaskId));
  };

  const applyFormatting = (format: string) => {
    // Basic rich text formatting - would need a proper rich text editor in production
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      document.execCommand(format, false, undefined);
    }
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

  const currentTask = isEditing ? editedTask : task;
  if (!currentTask) return null;

  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const totalSubtasks = subtasks.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editedTask?.name || ''}
                  onChange={(e) => setEditedTask(prev => prev ? { ...prev, name: e.target.value } : prev)}
                  className="text-xl font-bold border-none p-0 h-auto"
                />
              ) : (
                <DialogTitle className="text-2xl font-bold">{currentTask.name}</DialogTitle>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <StatusBadge variant={getPriorityVariant(currentTask.priority)}>
                {currentTask.priority}
              </StatusBadge>
              <StatusBadge variant={getStatusVariant(currentTask.status)}>
                {currentTask.status}
              </StatusBadge>
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
            <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
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
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Description
                      </label>
                      {isEditing ? (
                        <div className="space-y-2">
                          {/* Rich Text Formatting Toolbar */}
                          <div className="flex items-center gap-1 p-2 border rounded-md bg-muted/50">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => applyFormatting('bold')}
                              className="h-7 w-7 p-0"
                            >
                              <Bold className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => applyFormatting('italic')}
                              className="h-7 w-7 p-0"
                            >
                              <Italic className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => applyFormatting('underline')}
                              className="h-7 w-7 p-0"
                            >
                              <Underline className="h-3 w-3" />
                            </Button>
                            <div className="w-px h-4 bg-border mx-1" />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => applyFormatting('insertUnorderedList')}
                              className="h-7 w-7 p-0"
                            >
                              <List className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => applyFormatting('insertOrderedList')}
                              className="h-7 w-7 p-0"
                            >
                              <ListOrdered className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div
                            contentEditable
                            className="min-h-[120px] p-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                            onInput={(e) => setRichTextContent(e.currentTarget.textContent || '')}
                            dangerouslySetInnerHTML={{ __html: richTextContent }}
                          />
                        </div>
                      ) : (
                        <div 
                          className="text-sm mt-1 min-h-[60px] p-3 border rounded-md bg-muted/20"
                          dangerouslySetInnerHTML={{ __html: richTextContent || 'No description provided' }}
                        />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{currentTask.startDate}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">End Date</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{currentTask.endDate}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Assigned Resources</label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {currentTask.assignedResources?.length || 0} assigned
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Progress & Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {completedSubtasks}/{totalSubtasks} subtasks
                        </span>
                      </div>
                      <Progress value={getProgressPercentage()} className="h-3" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{getProgressPercentage()}% complete</span>
                        <span>{totalSubtasks - completedSubtasks} remaining</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-success" />
                        <span>Completed: {completedSubtasks}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Remaining: {totalSubtasks - completedSubtasks}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="subtasks" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Subtasks</CardTitle>
                    <Badge variant="outline">
                      {completedSubtasks}/{totalSubtasks} completed
                    </Badge>
                  </div>
                  <CardDescription>
                    Break down your task into smaller, manageable subtasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Overview */}
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Subtasks Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {getProgressPercentage()}% complete
                        </span>
                      </div>
                      <Progress value={getProgressPercentage()} className="h-2" />
                    </div>

                    {/* Subtask List */}
                    <div className="space-y-2">
                      {subtasks.map((subtask) => (
                        <div
                          key={subtask.id}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/20 transition-colors"
                        >
                          <Checkbox
                            checked={subtask.completed}
                            onCheckedChange={() => handleSubtaskToggle(subtask.id)}
                          />
                          <span className={`flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {subtask.title}
                          </span>
                          {subtask.completed && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSubtask(subtask.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Add New Subtask */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a new subtask..."
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
                        className="flex-1"
                      />
                      <Button onClick={addSubtask} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
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
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No comments yet. Start the conversation!</p>
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
              <Button variant="outline" onClick={() => onDelete(task.id)} className="text-destructive">
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

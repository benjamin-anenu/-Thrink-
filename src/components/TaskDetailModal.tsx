import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  User, 
  Clock, 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle,
  MessageSquare,
  Paperclip
} from 'lucide-react';
import { ProjectTask } from '@/types/project';
import { useSubtasks } from '@/hooks/useSubtasks';

interface TaskDetailModalProps {
  task: ProjectTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (task: ProjectTask) => void;
  onDelete?: (taskId: string) => void;
  onUpdate?: (taskId: string, updates: Partial<ProjectTask>) => Promise<void>;
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
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    subtasks,
    loading: subtasksLoading,
    createSubtask,
    toggleSubtask,
    deleteSubtask,
    refreshSubtasks
  } = useSubtasks(task?.id || '');

  useEffect(() => {
    if (task) {
      setEditedTask(task);
      setIsEditing(false);
      setActiveTab('details');
      refreshSubtasks();
    }
  }, [task, refreshSubtasks]);

  if (!task) return null;

  const handleSave = async () => {
    if (!editedTask || !onUpdate) return;
    
    setIsSaving(true);
    try {
      // Calculate progress from subtasks
      const progress = subtasks.length > 0 
        ? Math.round((subtasks.filter(st => st.completed).length / subtasks.length) * 100)
        : editedTask.progress;
      
      // Auto-complete task if all subtasks are completed
      const allSubtasksCompleted = subtasks.length > 0 && subtasks.every(st => st.completed);
      const status = allSubtasksCompleted ? 'Completed' as const : editedTask.status;

      await onUpdate(editedTask.id, {
        name: editedTask.name,
        description: editedTask.description,
        status,
        progress,
        priority: editedTask.priority,
        startDate: editedTask.startDate,
        endDate: editedTask.endDate
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  const handleSubtaskToggle = async (subtaskId: string) => {
    await toggleSubtask(subtaskId);
    
    // Check if all subtasks are now completed and auto-update task
    const updatedSubtasks = subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    
    const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);
    
    if (allCompleted && onUpdate) {
      await onUpdate(task.id, { 
        status: 'Completed',
        progress: 100
      });
    }
  };

  const handleAddSubtask = async () => {
    if (newSubtaskTitle.trim()) {
      await createSubtask(newSubtaskTitle.trim());
      setNewSubtaskTitle('');
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    await deleteSubtask(subtaskId);
  };

  const getProgressPercentage = () => {
    if (subtasks.length === 0) return task.progress;
    const completed = subtasks.filter(st => st.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'In Progress': return 'secondary';
      case 'On Hold': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'destructive';
      case 'High': return 'secondary';
      case 'Medium': return 'outline';
      case 'Low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {isEditing ? 'Edit Task' : 'Task Details'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="subtasks">
                Subtasks ({subtasks.length})
              </TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto mt-4">
              <TabsContent value="details" className="space-y-4 m-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Task Name */}
                  <div className="md:col-span-2">
                    <Label htmlFor="task-name">Task Name</Label>
                    {isEditing ? (
                      <Input
                        id="task-name"
                        value={editedTask?.name || ''}
                        onChange={(e) => setEditedTask(prev => prev ? {...prev, name: e.target.value} : null)}
                        className="mt-1"
                      />
                    ) : (
                      <h3 className="text-lg font-medium mt-1">{task.name}</h3>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      {isEditing ? (
                        <Select
                          value={editedTask?.status}
                          onValueChange={(value) => setEditedTask(prev => prev ? {...prev, status: value as any} : null)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="On Hold">On Hold</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={getStatusVariant(task.status)}>
                          {task.status}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <Label>Priority</Label>
                    <div className="mt-1">
                      {isEditing ? (
                        <Select
                          value={editedTask?.priority}
                          onValueChange={(value) => setEditedTask(prev => prev ? {...prev, priority: value as any} : null)}
                        >
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
                      ) : (
                        <Badge variant={getPriorityVariant(task.priority)}>
                          {task.priority}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Start Date */}
                  <div>
                    <Label>Start Date</Label>
                    <div className="mt-1">
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editedTask?.startDate || ''}
                          onChange={(e) => setEditedTask(prev => prev ? {...prev, startDate: e.target.value} : null)}
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {task.startDate || 'Not set'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* End Date */}
                  <div>
                    <Label>End Date</Label>
                    <div className="mt-1">
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editedTask?.endDate || ''}
                          onChange={(e) => setEditedTask(prev => prev ? {...prev, endDate: e.target.value} : null)}
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {task.endDate || 'Not set'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="md:col-span-2">
                    <Label>Progress</Label>
                    <div className="mt-2">
                      <div className="flex items-center gap-3">
                        <Progress value={getProgressPercentage()} className="flex-1" />
                        <span className="text-sm font-medium">
                          {getProgressPercentage()}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <Label htmlFor="task-description">Description</Label>
                    {isEditing ? (
                      <Textarea
                        id="task-description"
                        value={editedTask?.description || ''}
                        onChange={(e) => setEditedTask(prev => prev ? {...prev, description: e.target.value} : null)}
                        rows={4}
                        className="mt-1"
                        placeholder="Enter task description..."
                      />
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                        {task.description || 'No description provided'}
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="subtasks" className="space-y-4 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Subtasks</span>
                      <Badge variant="secondary">
                        {subtasks.filter(st => st.completed).length} / {subtasks.length} completed
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Progress Bar */}
                    {subtasks.length > 0 && (
                      <div className="space-y-2">
                        <Progress value={getProgressPercentage()} />
                        <p className="text-sm text-muted-foreground">
                          {getProgressPercentage()}% complete
                        </p>
                      </div>
                    )}

                    {/* Subtask List */}
                    <div className="space-y-2">
                      {subtasks.map((subtask) => (
                        <div key={subtask.id} className="flex items-center gap-3 p-2 rounded-lg border bg-card">
                          <Checkbox
                            checked={subtask.completed}
                            onCheckedChange={() => handleSubtaskToggle(subtask.id)}
                          />
                          <span className={`flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {subtask.title}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSubtask(subtask.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Add New Subtask */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a new subtask..."
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                      />
                      <Button
                        onClick={handleAddSubtask}
                        disabled={!newSubtaskTitle.trim()}
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No comments yet. Start the conversation!</p>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Textarea
                        placeholder="Add a comment..."
                        rows={2}
                        className="flex-1"
                      />
                      <Button size="sm" className="self-end">
                        Post
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attachments" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Paperclip className="h-5 w-5" />
                      Attachments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Paperclip className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No attachments yet. Upload files to get started!</p>
                    </div>
                    
                    <Button variant="outline" className="w-full mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Attachment
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
          <div>
            {onDelete && (
              <Button
                variant="destructive"
                onClick={() => onDelete(task.id)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Task
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;